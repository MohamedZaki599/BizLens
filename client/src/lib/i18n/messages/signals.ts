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
  'signal.card.askAi': 'Ask AI:',
  'signal.card.explainImpact': 'Explain impact',
  'signal.card.showRelated': 'Show related',

  // Workspace Panel
  'signal.workspace.loading': 'Loading workspace…',
  'signal.workspace.notFound': 'Signal not found',
  'signal.workspace.whyTitle': 'Why this happened',
  'signal.workspace.actionsTitle': 'Recommended Actions',
  'signal.workspace.aiGuide': 'AI Guide',
  'signal.workspace.aiDescription': 'I can help you analyze the specific transactions causing this spike or forecast the impact on this month\'s cash flow.',
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
} as const;

export const signalMessagesAr = {
  // Signal lifecycle statuses
  'signal.status.NEW': 'جديد',
  'signal.status.REVIEWED': 'تمت المراجعة',
  'signal.status.INVESTIGATING': 'قيد المراجعة',
  'signal.status.SNOOZED': 'مراقبة مستمرة',
  'signal.status.RESOLVED': 'مستقر',

  // Executive Focus Bar
  'signal.focusBar.critical': 'حرج',
  'signal.focusBar.investigating': 'قيد المراجعة',
  'signal.focusBar.awaitingReview': 'بانتظار المراجعة',
  'signal.focusBar.reviewCta': 'مراجعة الإشارات',
  'signal.focusBar.needsAttention': 'إشارات تحتاج انتباه',

  // Decision Queue
  'signal.queue.title': 'إشارات ذات أولوية',
  'signal.queue.subtitle': 'تغييرات تشغيلية تتطلب مراجعة.',
  'signal.queue.recommended': 'التالي المقترح',
  'signal.queue.empty': 'لا توجد إشارات تتطلب انتباه حاليًا.',
  'signal.queue.loading': 'جارٍ تحميل الإشارات…',
  'signal.queue.error': 'تعذّر تحميل الإشارات.',

  // Priority Section
  'signal.priority.title': 'ما الذي تغيّر',
  'signal.queue.viewAll': 'عرض جميع الإشارات',

  // Signal Card
  'signal.card.recommended': 'الإجراء المُوصى به',
  'signal.card.reviewCta': 'مراجعة',
  'signal.card.askAi': 'اسأل الذكاء الاصطناعي:',
  'signal.card.explainImpact': 'اشرح التأثير',
  'signal.card.showRelated': 'أظهر المرتبطة',

  // Workspace Panel
  'signal.workspace.loading': 'جارٍ تحميل مساحة العمل…',
  'signal.workspace.notFound': 'لم يتم العثور على الإشارة',
  'signal.workspace.whyTitle': 'لماذا حدث هذا',
  'signal.workspace.actionsTitle': 'الإجراءات الموصى بها',
  'signal.workspace.aiGuide': 'دليل الذكاء الاصطناعي',
  'signal.workspace.aiDescription': 'يمكنني مساعدتك في تحليل المعاملات المسببة لهذا الارتفاع أو توقع التأثير على التدفق النقدي لهذا الشهر.',
  'signal.workspace.analyzeTransactions': 'تحليل المعاملات',
  'signal.workspace.forecastImpact': 'توقع التأثير',
  'signal.workspace.resolve': 'مستقر',
  'signal.workspace.investigate': 'مراجعة',
  'signal.workspace.snooze': 'مراقبة',
  'signal.workspace.confidence': 'الثقة',
  'signal.workspace.reviewTransactions': 'عرض المعاملات',
  'signal.workspace.adjustThreshold': 'تعديل الحد',
  'signal.workspace.askWhy': 'لماذا تغيّر',
  'signal.workspace.explainImpact': 'عرض التأثير',

  // Severity labels
  'signal.severity.CRITICAL': 'حرج',
  'signal.severity.WARNING': 'تحذير',
  'signal.severity.INFO': 'معلومات',
  'signal.severity.NONE': 'بلا',

  // Default signal content
  'signal.defaultExplanation': 'شذوذ تشغيلي مكتشف.',
  'signal.defaultAction': 'عرض المعاملات',

  // Confidence levels
  'signal.confidence.high': 'ثقة عالية',
  'signal.confidence.medium': 'ثقة متوسطة',
  'signal.confidence.low': 'ثقة منخفضة',

  // Freshness
  'signal.freshness.updated': 'آخر تحديث منذ {time}',
} as const;
