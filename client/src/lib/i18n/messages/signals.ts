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
  'signal.focusBar.critical': 'Critical Signals',
  'signal.focusBar.investigating': 'Investigating',
  'signal.focusBar.awaitingReview': 'Awaiting Review',
  'signal.focusBar.reviewCta': 'Review Priority Signals',
  'signal.focusBar.needsAttention': 'signals need your attention',

  // Decision Queue
  'signal.queue.title': 'Priority Signals',
  'signal.queue.subtitle': 'Operational changes requiring your review.',
  'signal.queue.recommended': 'Recommended next review',
  'signal.queue.empty': 'All clear! No priority signals require attention right now.',
  'signal.queue.loading': 'Analyzing financial operations…',
  'signal.queue.error': 'Failed to load operational signals.',

  // Priority Section
  'signal.priority.title': 'What Changed',
  'signal.queue.viewAll': 'View all operational signals',

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
  'signal.workspace.resolve': 'Mark as Stable',
  'signal.workspace.investigate': 'Situation Review',
  'signal.workspace.snooze': 'Continue Monitoring',
  'signal.workspace.confidence': 'Confidence',
  'signal.workspace.reviewTransactions': 'Review transaction details',
  'signal.workspace.adjustThreshold': 'Adjust budget threshold',
  'signal.workspace.askWhy': 'Why this changed',
  'signal.workspace.explainImpact': 'Operational impact',

  // Severity labels
  'signal.severity.CRITICAL': 'Critical',
  'signal.severity.WARNING': 'Warning',
  'signal.severity.INFO': 'Info',
  'signal.severity.NONE': 'None',

  // Default signal content
  'signal.defaultExplanation': 'Detected an operational anomaly that requires attention.',
  'signal.defaultAction': 'Review transaction details',

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
  'signal.focusBar.critical': 'إشارات حرجة',
  'signal.focusBar.investigating': 'قيد التحقيق',
  'signal.focusBar.awaitingReview': 'بانتظار المراجعة',
  'signal.focusBar.reviewCta': 'مراجعة الإشارات ذات الأولوية',
  'signal.focusBar.needsAttention': 'إشارات تحتاج انتباهك',

  // Decision Queue
  'signal.queue.title': 'الإشارات ذات الأولوية',
  'signal.queue.subtitle': 'تغييرات تشغيلية تتطلب مراجعتك.',
  'signal.queue.recommended': 'المراجعة التالية المُوصى بها',
  'signal.queue.empty': 'كل شيء واضح! لا توجد إشارات تتطلب انتباهك حاليًا.',
  'signal.queue.loading': 'جارٍ تحليل العمليات المالية…',
  'signal.queue.error': 'تعذّر تحميل الإشارات التشغيلية.',

  // Priority Section
  'signal.priority.title': 'ما الذي تغيّر',
  'signal.queue.viewAll': 'عرض جميع الإشارات التشغيلية',

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
  'signal.workspace.resolve': 'تم الاستقرار',
  'signal.workspace.investigate': 'مراجعة الوضع',
  'signal.workspace.snooze': 'متابعة المراقبة',
  'signal.workspace.confidence': 'مستوى الثقة',
  'signal.workspace.reviewTransactions': 'مراجعة تفاصيل المعاملات',
  'signal.workspace.adjustThreshold': 'تعديل حدود الميزانية',
  'signal.workspace.askWhy': 'لماذا تغيّر هذا',
  'signal.workspace.explainImpact': 'التأثير التشغيلي',

  // Severity labels
  'signal.severity.CRITICAL': 'حرج',
  'signal.severity.WARNING': 'تحذير',
  'signal.severity.INFO': 'معلومات',
  'signal.severity.NONE': 'بلا',

  // Default signal content
  'signal.defaultExplanation': 'تم اكتشاف شذوذ تشغيلي يتطلب الانتباه.',
  'signal.defaultAction': 'مراجعة تفاصيل المعاملات',

  // Confidence levels
  'signal.confidence.high': 'ثقة عالية',
  'signal.confidence.medium': 'ثقة متوسطة',
  'signal.confidence.low': 'ثقة منخفضة',

  // Freshness
  'signal.freshness.updated': 'آخر تحديث منذ {time}',
} as const;
