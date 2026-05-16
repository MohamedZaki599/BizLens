/**
 * Signal & decision-oriented dashboard translations.
 * These cover the new signal lifecycle, decision queue, and workspace panel.
 */

export const signalMessagesEn = {
  // Signal lifecycle statuses
  'signal.status.NEW': 'New',
  'signal.status.REVIEWED': 'Reviewed',
  'signal.status.INVESTIGATING': 'Under Review',
  'signal.status.SNOOZED': 'Monitoring',
  'signal.status.RESOLVED': 'Stable',

  // Executive Focus Bar
  'signal.focusBar.critical': 'Critical',
  'signal.focusBar.investigating': 'Under Review',
  'signal.focusBar.awaitingReview': 'Awaiting Review',
  'signal.focusBar.reviewCta': 'Review Signals',
  'signal.focusBar.needsAttention': 'signals need attention',

  // Decision Queue
  'signal.queue.title': 'Priority Signals',
  'signal.queue.subtitle': 'Operational changes requiring review.',
  'signal.queue.recommended': 'Suggested next',
  'signal.queue.empty': 'No operational signals require attention right now.',
  'signal.queue.loading': 'Loading signals…',
  'signal.queue.error': 'Unable to load signals.',

  // Priority Section
  'signal.priority.title': 'What Changed',
  'signal.queue.viewAll': 'View all signals',

  // Signal Card
  'signal.card.recommended': 'Recommended',
  'signal.card.reviewCta': 'Review',
  'signal.card.askAi': 'Drill down:',
  'signal.card.explainImpact': 'Explain impact',
  'signal.card.showRelated': 'Show related',

  // Workspace Panel
  'signal.workspace.loading': 'Loading workspace…',
  'signal.workspace.notFound': 'Signal not found',
  'signal.workspace.whyTitle': 'Why this happened',
  'signal.workspace.actionsTitle': 'Recommended Actions',
  'signal.workspace.aiGuide': 'Analysis Guide',
  'signal.workspace.aiDescription': 'Analyze the specific transactions causing this spike or forecast the impact on this month\'s cash flow.',
  'signal.workspace.analyzeTransactions': 'Analyze transactions',
  'signal.workspace.forecastImpact': 'Forecast impact',
  'signal.workspace.resolve': 'Mark Stable',
  'signal.workspace.investigate': 'Review',
  'signal.workspace.snooze': 'Monitor',
  'signal.workspace.confidence': 'Confidence',
  'signal.workspace.reviewTransactions': 'View Transactions',
  'signal.workspace.adjustThreshold': 'Adjust Threshold',
  'signal.workspace.askWhy': 'Why this changed',
  'signal.workspace.explainImpact': 'View Impact',

  // Severity labels
  'signal.severity.CRITICAL': 'Critical',
  'signal.severity.WARNING': 'Warning',
  'signal.severity.INFO': 'Info',
  'signal.severity.NONE': 'None',

  // Default signal content
  'signal.defaultExplanation': 'Operational anomaly detected.',
  'signal.defaultAction': 'View Transactions',

  // Confidence levels
  'signal.confidence.high': 'High confidence',
  'signal.confidence.medium': 'Medium confidence',
  'signal.confidence.low': 'Low confidence',

  // Freshness
  'signal.freshness.updated': 'Updated {time} ago',

  // Grouped signal labels
  'signal.grouped.recurring.title': '{count} recurring expense signals',
  'signal.grouped.recurring.explanation': '{count} recurring charges detected across your subscriptions. Review to identify unnecessary spend.',
  'signal.grouped.anomalies.title': '{count} expense anomalies',
  'signal.grouped.anomalies.explanation': 'Detected spending anomalies across {count} categories. The most critical requires immediate review.',
} as const;

export const signalMessagesAr = {
  // Signal lifecycle statuses
  'signal.status.NEW': 'جديدة',
  'signal.status.REVIEWED': 'رُوجعت',
  'signal.status.INVESTIGATING': 'قيد المراجعة',
  'signal.status.SNOOZED': 'تحت المراقبة',
  'signal.status.RESOLVED': 'مستقرة',

  // Executive Focus Bar
  'signal.focusBar.critical': 'حرجة',
  'signal.focusBar.investigating': 'قيد المراجعة',
  'signal.focusBar.awaitingReview': 'بانتظار المراجعة',
  'signal.focusBar.reviewCta': 'راجع الإشارات',
  'signal.focusBar.needsAttention': 'من الإشارات تتطلب انتباهك',

  // Decision Queue
  'signal.queue.title': 'إشارات ذات أولوية',
  'signal.queue.subtitle': 'تغييرات تشغيلية تستدعي مراجعتك.',
  'signal.queue.recommended': 'الأولى بالمراجعة',
  'signal.queue.empty': 'لا توجد إشارات تستدعي تدخلك حاليًا.',
  'signal.queue.loading': 'جارٍ تحميل الإشارات…',
  'signal.queue.error': 'تعذّر تحميل الإشارات.',

  // Priority Section
  'signal.priority.title': 'ما الذي تغيّر',
  'signal.queue.viewAll': 'عرض كل الإشارات',

  // Signal Card
  'signal.card.recommended': 'موصى به',
  'signal.card.reviewCta': 'راجع',
  'signal.card.askAi': 'تعمّق:',
  'signal.card.explainImpact': 'وضّح الأثر',
  'signal.card.showRelated': 'عرض المرتبطة',

  // Workspace Panel
  'signal.workspace.loading': 'جارٍ التحميل…',
  'signal.workspace.notFound': 'الإشارة غير موجودة',
  'signal.workspace.whyTitle': 'سبب الحدوث',
  'signal.workspace.actionsTitle': 'إجراءات مقترحة',
  'signal.workspace.aiGuide': 'دليل التحليل',
  'signal.workspace.aiDescription': 'حلّل المعاملات المسببة لهذا الارتفاع أو توقّع أثره على التدفق النقدي الشهري.',
  'signal.workspace.analyzeTransactions': 'حلّل المعاملات',
  'signal.workspace.forecastImpact': 'توقّع الأثر',
  'signal.workspace.resolve': 'تثبيت كمستقرة',
  'signal.workspace.investigate': 'مراجعة',
  'signal.workspace.snooze': 'مراقبة',
  'signal.workspace.confidence': 'درجة الثقة',
  'signal.workspace.reviewTransactions': 'عرض المعاملات',
  'signal.workspace.adjustThreshold': 'تعديل الحد',
  'signal.workspace.askWhy': 'لماذا تغيّر',
  'signal.workspace.explainImpact': 'عرض الأثر',

  // Severity labels
  'signal.severity.CRITICAL': 'حرجة',
  'signal.severity.WARNING': 'تحذير',
  'signal.severity.INFO': 'معلومة',
  'signal.severity.NONE': 'عادية',

  // Default signal content
  'signal.defaultExplanation': 'رُصد انحراف تشغيلي.',
  'signal.defaultAction': 'عرض المعاملات',

  // Confidence levels
  'signal.confidence.high': 'ثقة عالية',
  'signal.confidence.medium': 'ثقة متوسطة',
  'signal.confidence.low': 'ثقة منخفضة',

  // Freshness
  'signal.freshness.updated': 'تحديث منذ {time}',

  // Grouped signal labels
  'signal.grouped.recurring.title': '{count} من إشارات المصروفات المتكررة',
  'signal.grouped.recurring.explanation': 'رُصدت {count} من المصروفات المتكررة ضمن اشتراكاتك. راجعها لتقليص الإنفاق غير الضروري.',
  'signal.grouped.anomalies.title': '{count} من الانحرافات في المصروفات',
  'signal.grouped.anomalies.explanation': 'رُصدت انحرافات في الإنفاق عبر {count} من الفئات. الأشد أهمية يستدعي مراجعة فورية.',
} as const;
