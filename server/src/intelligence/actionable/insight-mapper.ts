import type { FinancialSignal, OperationalInsight } from '../signals/signal.types';
import { formatMoney, formatPctChange } from '../../utils/safe-math';

/**
 * Insight Mapper — The Actionable Intelligence Layer.
 * 
 * Transforms raw, deterministic FinancialSignals into rich, actionable
 * OperationalInsights that are ready for the frontend to render.
 * 
 * This layer replaces the legacy insight-engine and assistant.service by ensuring
 * all intelligence is derived ONLY from the centralized signal engine.
 */

export const mapSignalToInsight = (signal: FinancialSignal): OperationalInsight | null => {
  const { key, value, severity, trend, metadata, confidence } = signal;
  const explain = metadata.explainability;
  
  if (!explain) {
    // Drop signals that lack explainability — they are not production-ready for the operational UX.
    return null;
  }

  // Base insight shell
  const insight: OperationalInsight = {
    id: `insight:${key}:${Date.now()}`,
    signalKey: key,
    severity: mapSeverity(severity, trend),
    urgency: severity === 'critical' ? 'high' : severity === 'warning' ? 'medium' : 'low',
    summary: '',
    explanation: '',
    confidence,
  };

  // Map individual signal types
  switch (key) {
    case 'PROFIT_DROP':
    case 'PROFIT_TREND': {
      if (trend === 'down') {
        insight.summary = 'Profit dropped';
        insight.explanation = `Your profit is down ${formatPctChange(value)} compared to the previous period. ${explain.reasoningChain.join(' ')}`;
      } else {
        insight.summary = 'Profit trending up';
        insight.explanation = `Your profit is up ${formatPctChange(value)} compared to the previous period. Keep it going.`;
      }
      break;
    }
    
    case 'SPEND_SPIKE': {
      const catName = (explain.inputs.categoryName as string) || 'A category';
      insight.summary = `${catName} spending spiked`;
      insight.explanation = `${catName} spending increased by ${formatPctChange(value)}. ${explain.reasoningChain.join(' ')}`;
      
      if (explain.sourceEntities?.[0]) {
        insight.action = {
          label: `Review ${catName}`,
          type: 'filter',
          payload: { categoryId: explain.sourceEntities[0], type: 'EXPENSE' },
        };
      }
      break;
    }

    case 'CATEGORY_CONCENTRATION': {
      const catName = (explain.inputs.categoryName as string) || 'A category';
      insight.summary = 'Concentrated spending';
      insight.explanation = `${value}% of your recent spend is on ${catName}. Consider diversifying or optimizing this category.`;
      
      if (explain.sourceEntities?.[0]) {
        insight.action = {
          label: `View ${catName}`,
          type: 'filter',
          payload: { categoryId: explain.sourceEntities[0], type: 'EXPENSE' },
        };
      }
      break;
    }

    case 'PROJECTED_EXPENSE':
    case 'FORECAST_OVERSPEND': {
      insight.summary = 'On track to overspend';
      insight.explanation = `If you continue at this rate, you'll spend about ${formatMoney(value)} this period. ${explain.reasoningChain.join(' ')}`;
      break;
    }

    case 'STALE_DATA': {
      const days = value;
      insight.summary = 'Time to log new transactions';
      insight.explanation = `You haven't logged a transaction in ${days} days. Add the latest to keep trends accurate.`;
      insight.action = {
        label: 'Add transaction',
        type: 'navigate',
        payload: { route: '/app/transactions', openQuickAdd: 'true' },
      };
      break;
    }

    default:
      // Unmapped signals won't be surfaced as insights
      return null;
  }

  return insight;
};

/** Converts the raw signal severity into UI-friendly insight severity */
const mapSeverity = (severity: FinancialSignal['severity'], trend: FinancialSignal['trend']): OperationalInsight['severity'] => {
  if (severity === 'critical') return 'critical';
  if (severity === 'warning') return 'warning';
  
  // A positive trend without a warning is usually a "success" state in the UI.
  if (trend === 'up') return 'success';
  return 'info';
};

/**
 * Bulk maps a list of signals, filters out unmapped ones, and sorts by urgency.
 */
export const mapSignalsToInsights = (signals: FinancialSignal[]): OperationalInsight[] => {
  return signals
    .map(mapSignalToInsight)
    .filter((i): i is OperationalInsight => i !== null)
    .sort((a, b) => {
      const urgencyWeight = { high: 0, medium: 1, low: 2 };
      const ua = urgencyWeight[a.urgency];
      const ub = urgencyWeight[b.urgency];
      if (ua !== ub) return ua - ub;
      return b.confidence - a.confidence;
    });
};
