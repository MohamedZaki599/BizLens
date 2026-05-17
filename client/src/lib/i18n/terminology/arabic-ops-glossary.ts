/**
 * Canonical Arabic Operational Terminology Reference
 *
 * This file is the single source of truth for Arabic operational language
 * used across BizLens. All Arabic copy decisions — signals, alerts,
 * assistant insights, recommendations, and confidence states — MUST
 * reference this glossary to ensure consistency.
 *
 * Purpose:
 * - Prevent synonym drift (e.g., mixing "تحقيق" with "مراجعة")
 * - Eliminate alarmist or AI-marketing language in Arabic UX
 * - Ensure the Arabic experience feels written by a native-speaking
 *   finance professional, not machine-translated
 *
 * Usage guidelines:
 * - `preferred` arrays list canonical terms to USE in Arabic copy
 * - `avoid` arrays list terms to NEVER use (alarmist, robotic, or inconsistent)
 * - When writing new Arabic copy, pick from `preferred` terms only
 * - This file is a reference document — it is not imported into the
 *   runtime i18n system, but serves as the canonical source for all
 *   Arabic copy decisions made in translation files
 */

/**
 * Canonical Arabic operational terminology organized by domain.
 * Each domain defines preferred terms and terms to avoid.
 */
export const CANONICAL_AR_OPS = {
  /**
   * Signals — operational indicators that surface meaningful changes.
   * Tone: informative, calm, data-driven.
   */
  signals: {
    preferred: [
      'إشارات تشغيلية',
      'مؤشرات مهمة',
      'تغيرات تستحق الانتباه',
    ],
    avoid: [
      'إشعارات ذكية',
      'تنبيهات AI',
      'مصطلحات تقنية مبالغ فيها',
    ],
  },

  /**
   * Alerts / Attention States — when something needs review.
   * Tone: calm urgency, never panic-inducing.
   */
  alerts: {
    preferred: [
      'يحتاج متابعة',
      'يحتاج مراجعة',
      'تغير ملحوظ',
      'نشاط غير معتاد',
    ],
    avoid: [
      'إنذار',
      'خطر شديد',
      'تحذير حرج',
      'لغة مرعبة أو مبالغ فيها',
    ],
  },

  /**
   * Investigations / Reviews — ongoing review processes.
   * Tone: professional, routine, non-threatening.
   */
  investigations: {
    preferred: [
      'مراجعة',
      'متابعة',
      'قيد المراجعة',
      'تحت المتابعة',
    ],
    avoid: [
      'تحقيق',
      'فحص جنائي',
      'تدقيق رسمي مبالغ فيه',
    ],
  },

  /**
   * Recommendations — suggested next steps for the user.
   * Tone: suggestive, respectful, never commanding.
   */
  recommendations: {
    preferred: [
      'الخطوة المقترحة',
      'يوصى بالمراجعة',
      'راجع النشاط المرتبط',
    ],
    avoid: [
      'يجب عليك',
      'مطلوب فورًا',
      'أوامر قاسية',
    ],
  },

  /**
   * Confidence States — how certain the system is about an insight.
   * Tone: transparent, honest, avoids false precision.
   */
  confidence: {
    preferred: [
      'ثقة مرتفعة',
      'ثقة متوسطة',
      'مؤشرات محدودة',
    ],
    avoid: [
      'دقة 98%',
      'احتمالية',
      'لغة ذكاء اصطناعي تقنية',
    ],
  },

  /**
   * Actions — operational verbs used in CTAs and buttons.
   * Tone: concise, action-oriented, operationally meaningful.
   */
  actions: {
    preferred: [
      'مراجعة',
      'تحليل',
      'فتح',
      'متابعة',
      'تأجيل',
      'حل',
    ],
    avoid: [
      'انقر هنا',
      'اضغط',
      'عرض المزيد',
      'أفعال غامضة بدون سياق',
    ],
  },

  /**
   * Severity — how important or urgent a signal is.
   * Tone: measured, proportional, never catastrophizing.
   */
  severity: {
    preferred: [
      'أولوية عالية',
      'أولوية متوسطة',
      'أولوية منخفضة',
      'للاطلاع',
    ],
    avoid: [
      'حرج',
      'كارثي',
      'طوارئ',
      'لغة مبالغ فيها',
    ],
  },
} as const;

/**
 * Canonical Arabic CTA labels mapped to operational action types.
 * Use these exact labels when rendering action buttons in Arabic locale.
 *
 * Each key represents a semantic action type used in signal cards,
 * workspace panels, and assistant recommendations. The value is the
 * canonical Arabic label — concise (2-3 words max), operationally
 * meaningful, and consistent across all surfaces.
 */
export const CANONICAL_AR_ACTIONS = {
  /** Review subscriptions that triggered a signal */
  reviewSubscriptions: 'مراجعة الاشتراكات',
  /** Analyze spending patterns or anomalies */
  analyzeSpending: 'تحليل الإنفاق',
  /** Open related transactions for inspection */
  openTransactions: 'فتح المعاملات',
  /** Review a specific spending category */
  reviewCategory: 'مراجعة الفئة',
  /** Analyze the root cause of a change */
  analyzeCause: 'تحليل السبب',
  /** Review operational impact of a signal */
  reviewImpact: 'مراجعة الأثر التشغيلي',
  /** Review the budget status */
  reviewBudget: 'مراجعة الميزانية',
  /** Analyze revenue trends */
  analyzeRevenue: 'تحليل الإيرادات',
  /** Review cash flow changes */
  reviewCashFlow: 'مراجعة التدفق النقدي',
  /** Snooze / defer a signal for later */
  snooze: 'تأجيل',
  /** Mark a signal as resolved */
  resolve: 'حل',
  /** Begin an investigation / deeper review */
  investigate: 'متابعة',
  /** Dismiss a signal (no action needed) */
  dismiss: 'تجاهل',
  /** View related activity or context */
  viewRelated: 'عرض النشاط المرتبط',
  /** Compare with previous period */
  comparePeriod: 'مقارنة بالفترة السابقة',
} as const;

/** Type helper for domain keys in the canonical glossary */
export type CanonicalArOpsDomain = keyof typeof CANONICAL_AR_OPS;

/** Type helper for action keys in the canonical actions map */
export type CanonicalArActionKey = keyof typeof CANONICAL_AR_ACTIONS;
