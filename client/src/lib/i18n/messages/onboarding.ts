/**
 * Onboarding, activation, and empty-state translations.
 * Merged into the main i18n dictionaries.
 */

export const onboardingEn: Record<string, string> = {
  // ─── Welcome ────────────────────────────────────────────────────────────
  'onboarding.welcome.title': 'Welcome to BizLens',
  'onboarding.welcome.subtitle': 'Operational clarity for your business — no noise, no complexity. Just the signals that matter.',
  'onboarding.welcome.cta': 'Get started',
  'onboarding.welcome.trust': 'Your data stays private. We never share your financial information.',
  'onboarding.welcome.pillar1.title': 'Instant Signals',
  'onboarding.welcome.pillar1.desc': 'BizLens detects spending anomalies, profit trends, and opportunities automatically.',
  'onboarding.welcome.pillar2.title': 'Operational Trust',
  'onboarding.welcome.pillar2.desc': 'Every signal explains why it matters — with confidence scores and clear reasoning.',
  'onboarding.welcome.pillar3.title': 'Guided Decisions',
  'onboarding.welcome.pillar3.desc': 'Turn insights into action with one-click recommendations and contextual guidance.',

  // ─── Business Context ───────────────────────────────────────────────────
  'onboarding.context.step1.title': 'What type of business are you running?',
  'onboarding.context.step1.subtitle': 'This helps us tailor signals to your operational reality.',
  'onboarding.context.step2.title': 'What matters most right now?',
  'onboarding.context.step2.subtitle': 'We\'ll prioritize signals around your primary goal.',
  'onboarding.context.step3.title': 'How will you connect your data?',
  'onboarding.context.step3.subtitle': 'You can always change this later.',
  'onboarding.context.finish': 'Prepare my signals',

  'onboarding.context.type.FREELANCER': 'Freelancer',
  'onboarding.context.type.FREELANCER.desc': 'Independent contractor or solo professional',
  'onboarding.context.type.ECOMMERCE': 'E-commerce',
  'onboarding.context.type.ECOMMERCE.desc': 'Online store or product-based business',
  'onboarding.context.type.SERVICE_BUSINESS': 'Service business',
  'onboarding.context.type.SERVICE_BUSINESS.desc': 'Agency, consultancy, or service provider',

  'onboarding.context.goal.reduce_spending': 'Reduce spending',
  'onboarding.context.goal.grow_revenue': 'Grow revenue',
  'onboarding.context.goal.track_profitability': 'Track profitability',
  'onboarding.context.goal.monitor_cashflow': 'Monitor cash flow',

  'onboarding.context.source.manual_entry': 'Manual entry',
  'onboarding.context.source.manual_entry.desc': 'Log transactions as they happen',
  'onboarding.context.source.csv_import': 'CSV import',
  'onboarding.context.source.csv_import.desc': 'Upload a spreadsheet from your bank or tool',
  'onboarding.context.source.connect_later': 'Connect later',
  'onboarding.context.source.connect_later.desc': 'Explore the dashboard first, connect data when ready',

  'onboarding.back': 'Back',
  'onboarding.next': 'Continue',

  // ─── Signal Preparation ─────────────────────────────────────────────────
  'onboarding.preparation.analyzing.title': 'Analyzing your financial activity',
  'onboarding.preparation.analyzing.desc': 'Scanning income patterns, expense flows, and category distributions.',
  'onboarding.preparation.detecting.title': 'Detecting operational patterns',
  'onboarding.preparation.detecting.desc': 'Looking for anomalies, recurring costs, and growth signals.',
  'onboarding.preparation.preparing.title': 'Preparing your first signals',
  'onboarding.preparation.preparing.desc': 'Building actionable insights from your data.',
  'onboarding.preparation.ready.title': 'Your signals are ready',
  'onboarding.preparation.ready.desc': 'Let\'s take a look at what we found.',

  // ─── First Signal ───────────────────────────────────────────────────────
  'onboarding.firstSignal.title': 'Your first operational signal',
  'onboarding.firstSignal.subtitle': 'BizLens found something worth your attention.',
  'onboarding.firstSignal.confidence': '{value}% confidence',
  'onboarding.firstSignal.nextStep': 'Recommended next step',
  'onboarding.firstSignal.cta': 'Go to my dashboard',
  'onboarding.firstSignal.noSignal.title': 'No signals detected yet',
  'onboarding.firstSignal.noSignal.desc': 'Add a few transactions and BizLens will start generating actionable signals about your business.',

  'onboarding.firstSignal.mock.title': 'Software Subscriptions Anomaly',
  'onboarding.firstSignal.mock.desc': 'Spending in software subscriptions is 15% higher than your 3-month average. We identified two recurring tools you might no longer need.',
  'onboarding.firstSignal.mock.action': 'Review subscription list',

  'signal.severity.info': 'Informational',
  'signal.severity.success': 'Positive',
  'signal.severity.warning': 'Needs attention',
  'signal.severity.critical': 'Critical',
  'signal.trend.up': 'Trending up',
  'signal.trend.down': 'Trending down',
  'signal.trend.flat': 'Stable',

  // ─── Activation ─────────────────────────────────────────────────────────
  'activation.title': 'Getting started',
  'activation.completed': 'complete',
  'activation.milestone.data_connected': 'Connect your data',
  'activation.milestone.data_connected.hint': 'Add transactions or import a CSV file',
  'activation.milestone.first_signal': 'First signal generated',
  'activation.milestone.first_signal.hint': 'BizLens analyzes your data automatically',
  'activation.milestone.signal_reviewed': 'Review a signal',
  'activation.milestone.signal_reviewed.hint': 'Acknowledge or investigate an operational signal',
  'activation.milestone.first_action': 'Take your first action',
  'activation.milestone.first_action.hint': 'Act on a recommendation from BizLens',

  // ─── Empty States ───────────────────────────────────────────────────────
  'empty.no-data.title': 'Your story starts here',
  'empty.no-data.desc': 'Add your first transaction and BizLens will begin mapping your financial landscape automatically.',
  'empty.no-data.hint': 'Most users see their first signal within minutes of adding data.',
  'empty.no-data.addCta': 'Add transaction',
  'empty.no-data.importCta': 'Import CSV',

  'empty.no-signals.title': 'Listening for signals',
  'empty.no-signals.desc': 'BizLens is analyzing your data in the background. Signals appear when there\'s something meaningful to surface.',
  'empty.no-signals.hint': 'Signals are generated from spending patterns, profit trends, and category anomalies.',

  'empty.resolved-empty.title': 'All clear',
  'empty.resolved-empty.desc': 'You\'ve reviewed all current signals. New ones will appear as your financial data evolves.',
  'empty.resolved-empty.hint': 'This is a good sign — your operations are on track.',

  'empty.assistant-idle.title': 'Your assistant is ready',
  'empty.assistant-idle.desc': 'Ask a question about your finances or explore a signal to get contextual guidance.',
  'empty.assistant-idle.hint': 'Try asking about your spending patterns or profitability.',
  'empty.assistant-idle.prompt.ask1': 'How is my spending this month?',
  'empty.assistant-idle.prompt.ask2': 'What\'s driving my profit?',
  'empty.assistant-idle.prompt.ask3': 'Any spending anomalies?',

  'empty.no-trends.title': 'Building your trendline',
  'empty.no-trends.desc': 'Trends need at least two months of data to draw meaningful comparisons.',
  'empty.no-trends.hint': 'Keep logging transactions — your first trend insights are just around the corner.',

  // ─── Assistant Prompt Suggestions ────────────────────────────────────────
  'assistant.suggestions.label': 'Try asking',
  'assistant.prompt.spending': 'How is my spending this month?',
  'assistant.prompt.profit': 'What\'s driving my profit?',
  'assistant.prompt.anomaly': 'Any spending anomalies?',
  'assistant.prompt.forecast': 'What\'s my projected spend?',

  'activation.expand': 'Expand',
  'activation.collapse': 'Collapse',
  'activation.dismiss': 'Dismiss',

  // ─── Activation Progress Tracker ────────────────────────────────────────
  'activation.tracker.label': '{completed} of {total} steps complete',

  // ─── Operational Guidance ───────────────────────────────────────────────
  'guidance.firstData.title': 'Start by adding your financial data',
  'guidance.firstData.desc': 'BizLens needs at least a few transactions to detect patterns and generate signals.',
  'guidance.firstData.action': 'Add your first transaction',
  'guidance.reviewSignal.title': 'Review your active signals',
  'guidance.reviewSignal.desc': 'Signals highlight what matters most in your financial operations right now.',
  'guidance.reviewSignal.action': 'View signals',
  'guidance.explore.title': 'Explore your financial landscape',
  'guidance.explore.desc': 'Dig into categories, trends, and forecasts to make informed decisions.',
  'guidance.explore.action': 'Open dashboard',
};

export const onboardingAr: Record<string, string> = {
  // ─── Welcome ────────────────────────────────────────────────────────────
  'onboarding.welcome.title': 'مرحبًا في بيزلنز',
  'onboarding.welcome.subtitle': 'وضوح تشغيلي لأعمالك — بدون ضوضاء، بدون تعقيد. فقط الإشارات المهمة.',
  'onboarding.welcome.cta': 'ابدأ الآن',
  'onboarding.welcome.trust': 'بياناتك خاصة. لا نشارك معلوماتك المالية أبدًا.',
  'onboarding.welcome.pillar1.title': 'إشارات فورية',
  'onboarding.welcome.pillar1.desc': 'يكتشف بيزلنز الشذوذ في الإنفاق واتجاهات الأرباح والفرص تلقائيًا.',
  'onboarding.welcome.pillar2.title': 'ثقة تشغيلية',
  'onboarding.welcome.pillar2.desc': 'كل إشارة تشرح لماذا هي مهمة — مع درجات ثقة وتفسير واضح.',
  'onboarding.welcome.pillar3.title': 'قرارات موجّهة',
  'onboarding.welcome.pillar3.desc': 'حوّل الرؤى إلى أفعال بتوصيات بنقرة واحدة وإرشاد سياقي.',

  // ─── Business Context ───────────────────────────────────────────────────
  'onboarding.context.step1.title': 'ما نوع عملك؟',
  'onboarding.context.step1.subtitle': 'هذا يساعدنا في تخصيص الإشارات لواقعك التشغيلي.',
  'onboarding.context.step2.title': 'ما الأهم لك الآن؟',
  'onboarding.context.step2.subtitle': 'سنرتب الإشارات حسب هدفك الأساسي.',
  'onboarding.context.step3.title': 'كيف ستربط بياناتك؟',
  'onboarding.context.step3.subtitle': 'يمكنك تغيير هذا لاحقًا في أي وقت.',
  'onboarding.context.finish': 'جهّز إشاراتي',

  'onboarding.context.type.FREELANCER': 'مستقل',
  'onboarding.context.type.FREELANCER.desc': 'مقاول مستقل أو محترف فردي',
  'onboarding.context.type.ECOMMERCE': 'تجارة إلكترونية',
  'onboarding.context.type.ECOMMERCE.desc': 'متجر إلكتروني أو نشاط قائم على المنتجات',
  'onboarding.context.type.SERVICE_BUSINESS': 'شركة خدمات',
  'onboarding.context.type.SERVICE_BUSINESS.desc': 'وكالة أو استشارات أو مقدم خدمات',

  'onboarding.context.goal.reduce_spending': 'تقليل الإنفاق',
  'onboarding.context.goal.grow_revenue': 'زيادة الإيرادات',
  'onboarding.context.goal.track_profitability': 'تتبع الربحية',
  'onboarding.context.goal.monitor_cashflow': 'مراقبة التدفق النقدي',

  'onboarding.context.source.manual_entry': 'إدخال يدوي',
  'onboarding.context.source.manual_entry.desc': 'سجّل المعاملات عند حدوثها',
  'onboarding.context.source.csv_import': 'استيراد CSV',
  'onboarding.context.source.csv_import.desc': 'ارفع ملفًا من بنكك أو أداتك المالية',
  'onboarding.context.source.connect_later': 'اتصل لاحقًا',
  'onboarding.context.source.connect_later.desc': 'استكشف لوحة التحكم أولًا، واربط البيانات عندما تكون جاهزًا',

  'onboarding.back': 'رجوع',
  'onboarding.next': 'متابعة',

  // ─── Signal Preparation ─────────────────────────────────────────────────
  'onboarding.preparation.analyzing.title': 'تحليل نشاطك المالي',
  'onboarding.preparation.analyzing.desc': 'فحص أنماط الدخل وتدفقات الإنفاق وتوزيعات الفئات.',
  'onboarding.preparation.detecting.title': 'اكتشاف الأنماط التشغيلية',
  'onboarding.preparation.detecting.desc': 'البحث عن شذوذ وتكاليف متكررة وإشارات نمو.',
  'onboarding.preparation.preparing.title': 'تجهيز إشاراتك الأولى',
  'onboarding.preparation.preparing.desc': 'بناء رؤى قابلة للتنفيذ من بياناتك.',
  'onboarding.preparation.ready.title': 'إشاراتك جاهزة',
  'onboarding.preparation.ready.desc': 'لنلقِ نظرة على ما وجدناه.',

  // ─── First Signal ───────────────────────────────────────────────────────
  'onboarding.firstSignal.title': 'أول إشارة تشغيلية لك',
  'onboarding.firstSignal.subtitle': 'وجد بيزلنز شيئًا يستحق انتباهك.',
  'onboarding.firstSignal.confidence': 'ثقة {value}%',
  'onboarding.firstSignal.nextStep': 'الخطوة التالية المقترحة',
  'onboarding.firstSignal.cta': 'انتقل إلى لوحة التحكم',
  'onboarding.firstSignal.noSignal.title': 'لم تُكتشف إشارات بعد',
  'onboarding.firstSignal.noSignal.desc': 'أضف بعض المعاملات وسيبدأ بيزلنز في إنتاج إشارات قابلة للتنفيذ عن أعمالك.',

  'onboarding.firstSignal.mock.title': 'شذوذ في اشتراكات البرامج',
  'onboarding.firstSignal.mock.desc': 'الإنفاق على اشتراكات البرامج أعلى بنسبة 15% من متوسط 3 أشهر. حددنا أداتين متكررتين قد لا تحتاج إليهما بعد الآن.',
  'onboarding.firstSignal.mock.action': 'راجع قائمة الاشتراكات',

  'signal.severity.info': 'معلوماتية',
  'signal.severity.success': 'إيجابية',
  'signal.severity.warning': 'تحتاج انتباه',
  'signal.severity.critical': 'أولوية عالية',
  'signal.trend.up': 'اتجاه صعودي',
  'signal.trend.down': 'اتجاه هبوطي',
  'signal.trend.flat': 'مستقر',

  // ─── Activation ─────────────────────────────────────────────────────────
  'activation.title': 'بدء الاستخدام',
  'activation.completed': 'مكتمل',
  'activation.milestone.data_connected': 'اربط بياناتك',
  'activation.milestone.data_connected.hint': 'أضف معاملات أو استورد ملف CSV',
  'activation.milestone.first_signal': 'أول إشارة تم إنشاؤها',
  'activation.milestone.first_signal.hint': 'يحلل بيزلنز بياناتك تلقائيًا',
  'activation.milestone.signal_reviewed': 'راجع إشارة',
  'activation.milestone.signal_reviewed.hint': 'أقر أو راجع إشارة تشغيلية',
  'activation.milestone.first_action': 'اتخذ أول إجراء',
  'activation.milestone.first_action.hint': 'نفّذ توصية من بيزلنز',

  // ─── Empty States ───────────────────────────────────────────────────────
  'empty.no-data.title': 'لا توجد بيانات بعد',
  'empty.no-data.desc': 'أضف أول معاملة وسيبدأ بيزلنز في تحليل نشاطك المالي تلقائيًا.',
  'empty.no-data.hint': 'معظم المستخدمين يرون أول إشارة خلال دقائق من إضافة البيانات.',
  'empty.no-data.addCta': 'أضف معاملة',
  'empty.no-data.importCta': 'استورد CSV',

  'empty.no-signals.title': 'في انتظار الإشارات',
  'empty.no-signals.desc': 'بيزلنز يحلل بياناتك في الخلفية. تظهر الإشارات عندما يكون هناك شيء مهم.',
  'empty.no-signals.hint': 'تُنشأ الإشارات من أنماط الإنفاق واتجاهات الأرباح وشذوذ الفئات.',

  'empty.resolved-empty.title': 'كل شيء على ما يرام',
  'empty.resolved-empty.desc': 'لقد راجعت جميع الإشارات الحالية. ستظهر إشارات جديدة مع تطور بياناتك.',
  'empty.resolved-empty.hint': 'هذه علامة جيدة — عملياتك تسير بشكل سليم.',

  'empty.assistant-idle.title': 'الرؤى التشغيلية جاهزة',
  'empty.assistant-idle.desc': 'استكشف إشارة للحصول على تحليل تشغيلي مفصّل.',
  'empty.assistant-idle.hint': 'جرب السؤال عن أنماط إنفاقك أو ربحيتك.',
  'empty.assistant-idle.prompt.ask1': 'كيف إنفاقي هذا الشهر؟',
  'empty.assistant-idle.prompt.ask2': 'ما الذي يدفع ربحي؟',
  'empty.assistant-idle.prompt.ask3': 'أي شذوذ في الإنفاق؟',

  'empty.no-trends.title': 'نبني خط اتجاهك',
  'empty.no-trends.desc': 'تحتاج الاتجاهات إلى شهرين على الأقل من البيانات لرسم مقارنات ذات معنى.',
  'empty.no-trends.hint': 'استمر في تسجيل المعاملات — رؤى الاتجاه الأولى قريبة جدًا.',

  // ─── Assistant Prompt Suggestions ────────────────────────────────────────
  'assistant.suggestions.label': 'جرب أن تسأل',
  'assistant.prompt.spending': 'كيف إنفاقي هذا الشهر؟',
  'assistant.prompt.profit': 'ما الذي يدفع ربحي؟',
  'assistant.prompt.anomaly': 'أي شذوذ في الإنفاق؟',
  'assistant.prompt.forecast': 'ما المتوقع في إنفاقي؟',

  'activation.expand': 'توسيع',
  'activation.collapse': 'طي',
  'activation.dismiss': 'إغلاق',

  // ─── Activation Progress Tracker ────────────────────────────────────────
  'activation.tracker.label': '{completed} من {total} خطوات مكتملة',

  // ─── Operational Guidance ───────────────────────────────────────────────
  'guidance.firstData.title': 'ابدأ بإضافة بياناتك المالية',
  'guidance.firstData.desc': 'يحتاج بيزلنز إلى بضع معاملات على الأقل لاكتشاف الأنماط وإنتاج الإشارات.',
  'guidance.firstData.action': 'أضف أول معاملة',
  'guidance.reviewSignal.title': 'راجع إشاراتك النشطة',
  'guidance.reviewSignal.desc': 'الإشارات تسلط الضوء على ما يهم أكثر في عملياتك المالية الآن.',
  'guidance.reviewSignal.action': 'عرض الإشارات',
  'guidance.explore.title': 'استكشف مشهدك المالي',
  'guidance.explore.desc': 'تعمق في الفئات والاتجاهات والتوقعات لاتخاذ قرارات مدروسة.',
  'guidance.explore.action': 'افتح لوحة التحكم',
};
