export type Language = 'en' | 'ar';

type Dict = Record<string, string>;

export const messages: Record<Language, Dict> = {
  en: {
    'nav.features': 'Features',
    'nav.why': 'Why BizLens',
    'nav.problem': 'The problem',
    'nav.compare': 'Compare',
    'nav.signIn': 'Sign in',
    'cta.start': 'Start free',
    'cta.primary': 'Open dashboard',

    'hero.eyebrow': 'For freelancers, small shops, and service businesses',
    'hero.title': 'Understand your business in under 10 seconds.',
    'hero.subtitle':
      'BizLens turns the noise of receipts and bank lines into the one number you actually need: your real profit — and what to do next.',
    'hero.metric.income': 'This month income',
    'hero.metric.profit': 'Net profit',
    'hero.insight.title': 'Today’s insight',
    'hero.insight.body':
      'Design services are your top earning category. Income up 24% vs last week.',
    'hero.alert.title': 'Critical alert',
    'hero.alert.body': 'Ads spending spiked 42% this week — review before it eats your margin.',
    'hero.proof': 'No spreadsheets. No setup. Set up in 60 seconds.',

    'problem.eyebrow': 'The painful truth',
    'problem.title': 'You’re losing money — and you don’t even know it.',
    'problem.subtitle':
      'Most small businesses fly blind between monthly bookkeeping cycles. By the time the numbers arrive, the leak is already weeks old.',
    'problem.p1.title': 'Margins disappear silently',
    'problem.p1.body':
      'Subscriptions creep up. One category quietly doubles. You only notice at month-end — when it’s too late to fix.',
    'problem.p2.title': 'Decisions made on vibes',
    'problem.p2.body':
      'Should you spend more on ads? Hire a contractor? Without a real-time view of profit, every choice is a guess.',
    'problem.p3.title': 'Spreadsheets don’t alert you',
    'problem.p3.body':
      'Excel won’t ping you when expenses overtake income. By default, you’re always reactive — never proactive.',

    'solution.eyebrow': 'The BizLens way',
    'solution.title': 'A financial decision system, not just a tracker.',
    'solution.subtitle':
      'BizLens watches your numbers continuously and tells you — in plain English — exactly what to do next.',
    'solution.s1.title': '1. Log in seconds',
    'solution.s1.body':
      'Quick Add takes under 5 seconds with smart category suggestions and a global shortcut.',
    'solution.s2.title': '2. We watch your money',
    'solution.s2.body':
      'Our Insight Engine and Alert Engine analyze every change continuously — spotting spikes, leaks, and shifting trends.',
    'solution.s3.title': '3. Act on real signals',
    'solution.s3.body':
      'Get one clear primary insight per day, with a direct link to the transactions that need your attention.',

    'features.title': 'Built for daily clarity, not monthly bookkeeping.',
    'features.subtitle':
      'Every feature exists for one reason: to help you spot leaks fast and act faster.',
    'features.f1.title': 'Smart Alert System',
    'features.f1.body':
      '8 rule types running continuously: spend spikes, profit drops, concentration risk, recurring detection, forecast warnings, and more.',
    'features.f2.title': 'Insight Engine',
    'features.f2.body':
      'Plain-English insights with the WHY — not just "expenses are up", but "expenses are up 35% mainly because of Ads".',
    'features.f3.title': 'Money-leak detection',
    'features.f3.body':
      'Spots the category costing you the most "extra" vs your 3-month baseline — and projects the annual cost.',
    'features.f4.title': 'Month-end forecast',
    'features.f4.body':
      '"If you continue at this rate…" projections so you can course-correct before the month closes.',
    'features.f5.title': 'Quick Add — anywhere',
    'features.f5.body':
      'Log a transaction in under 5 seconds with a global shortcut and smart category prefill.',
    'features.f6.title': 'Built around you',
    'features.f6.body':
      'Pick your mode — Freelancer, E-commerce, or Service business — and the dashboard adapts.',

    'compare.title': 'BizLens vs. the alternatives',
    'compare.subtitle': 'Most tools record the past. BizLens helps you change the future.',
    'compare.col.you': 'BizLens',
    'compare.col.excel': 'Excel / Sheets',
    'compare.col.notion': 'Notion / Airtable',
    'compare.col.qb': 'QuickBooks',
    'compare.row.alerts': 'Real-time spending alerts',
    'compare.row.insights': 'Plain-English insights with WHY',
    'compare.row.forecast': 'Month-end profit forecast',
    'compare.row.leak': 'Money-leak detection',
    'compare.row.fast': '5-second transaction logging',
    'compare.row.modes': 'Adapts to your business mode',
    'compare.row.bilingual': 'Native Arabic + English',

    'why.title': 'BizLens ≠ Excel.  BizLens ≠ QuickBooks.',
    'why.subtitle': 'BizLens = instant clarity.',
    'why.body':
      'Traditional accounting tools were built for accountants. BizLens is built for the people actually running the business — so you spend less time deciphering numbers and more time growing.',

    'cta.section.title': 'Stop guessing. Start knowing.',
    'cta.section.body':
      'Join early adopters using BizLens to spot money leaks before they drain the bank.',
    'cta.section.note': 'Free to start. No credit card. Set up in 60 seconds.',

    'footer.rights': 'All rights reserved.',
    'footer.tagline': 'Financial clarity, instantly.',
  },
  ar: {
    'nav.features': 'المزايا',
    'nav.why': 'لماذا بيزلنز',
    'nav.problem': 'المشكلة',
    'nav.compare': 'مقارنة',
    'nav.signIn': 'تسجيل الدخول',
    'cta.start': 'ابدأ مجانًا',
    'cta.primary': 'فتح لوحة التحكم',

    'hero.eyebrow': 'للمستقلين والمتاجر الصغيرة وشركات الخدمات',
    'hero.title': 'افهم وضع عملك في أقل من ١٠ ثوانٍ.',
    'hero.subtitle':
      'يحوّل بيزلنز فوضى الإيصالات وكشوف البنوك إلى الرقم الوحيد الذي تحتاجه: ربحك الحقيقي وما يجب فعله بعد ذلك.',
    'hero.metric.income': 'دخل هذا الشهر',
    'hero.metric.profit': 'صافي الربح',
    'hero.insight.title': 'رؤية اليوم',
    'hero.insight.body':
      'خدمات التصميم هي فئتك الأعلى دخلًا. ارتفع الدخل بنسبة ٢٤٪ مقارنة بالأسبوع الماضي.',
    'hero.alert.title': 'تنبيه حرج',
    'hero.alert.body': 'إنفاق الإعلانات قفز ٤٢٪ هذا الأسبوع — راجعه قبل أن يلتهم هامشك.',
    'hero.proof': 'بدون جداول. بدون إعدادات. جاهز في ٦٠ ثانية.',

    'problem.eyebrow': 'الحقيقة المؤلمة',
    'problem.title': 'أنت تخسر مالًا — ولا تدري حتى.',
    'problem.subtitle':
      'معظم الأعمال الصغيرة تطير بدون رؤية بين دورات المحاسبة الشهرية. وعندما تصل الأرقام، يكون التسريب قد مرّت عليه أسابيع.',
    'problem.p1.title': 'الهوامش تتلاشى بصمت',
    'problem.p1.body':
      'الاشتراكات تتزايد. فئة واحدة تتضاعف بهدوء. لا تلاحظ إلا في نهاية الشهر — حين يصبح إصلاحها متأخرًا.',
    'problem.p2.title': 'قرارات بالحدس',
    'problem.p2.body':
      'هل تزيد الإنفاق على الإعلانات؟ هل توظّف؟ بدون رؤية فورية للربح، كل قرار مجرد تخمين.',
    'problem.p3.title': 'الجداول لا تنبّهك',
    'problem.p3.body':
      'إكسل لن يخبرك حين تتجاوز المصروفات الدخل. تظل دائمًا في وضع رد الفعل، لا الاستباق.',

    'solution.eyebrow': 'طريقة بيزلنز',
    'solution.title': 'نظام قرار مالي، لا مجرد أداة تتبع.',
    'solution.subtitle':
      'يراقب بيزلنز أرقامك باستمرار، ويخبرك بلغة واضحة بما يجب أن تفعله بالضبط.',
    'solution.s1.title': '١. سجّل في ثوانٍ',
    'solution.s1.body':
      'الإضافة السريعة تستغرق أقل من ٥ ثوانٍ، باقتراحات ذكية للفئات واختصار شامل.',
    'solution.s2.title': '٢. نراقب أموالك',
    'solution.s2.body':
      'محرك الرؤى ومحرك التنبيهات يحلّلان كل تغيير باستمرار — يكتشفان القفزات والتسريبات والاتجاهات.',
    'solution.s3.title': '٣. اتخذ إجراءات حقيقية',
    'solution.s3.body':
      'احصل على رؤية رئيسية واحدة كل يوم، مع رابط مباشر إلى المعاملات التي تحتاج لانتباهك.',

    'features.title': 'مصمّم للوضوح اليومي، لا للمحاسبة الشهرية.',
    'features.subtitle':
      'كل ميزة موجودة لسبب واحد: لمساعدتك في اكتشاف التسريبات بسرعة والتصرف أسرع.',
    'features.f1.title': 'نظام تنبيهات ذكي',
    'features.f1.body':
      '٨ أنواع من القواعد تعمل باستمرار: قفزات الإنفاق، تراجع الأرباح، تركز المخاطر، اكتشاف الاشتراكات، تحذيرات التوقعات، والمزيد.',
    'features.f2.title': 'محرّك الرؤى',
    'features.f2.body':
      'رؤى بلغة بسيطة مع شرح "لماذا" — ليس فقط "المصروفات ارتفعت"، بل "ارتفعت ٣٥٪ بسبب فئة الإعلانات".',
    'features.f3.title': 'كشف التسريبات المالية',
    'features.f3.body':
      'يحدّد الفئة التي تكلّفك أكثر "زيادة" مقارنة بمتوسط ٣ أشهر — ويقدّر تكلفتها السنوية.',
    'features.f4.title': 'توقّع نهاية الشهر',
    'features.f4.body':
      'توقعات "إن استمرّيت على هذا المعدّل…" حتى تصحّح المسار قبل إغلاق الشهر.',
    'features.f5.title': 'إضافة سريعة من أي مكان',
    'features.f5.body':
      'سجّل معاملة في أقل من ٥ ثوانٍ باختصار شامل واقتراح ذكي للفئة.',
    'features.f6.title': 'مصمّم حولك',
    'features.f6.body':
      'اختر وضعك — مستقل، تجارة إلكترونية، أو شركة خدمات — وتتكيف اللوحة معك.',

    'compare.title': 'بيزلنز مقابل البدائل',
    'compare.subtitle': 'معظم الأدوات تسجّل الماضي. بيزلنز يساعدك على تغيير المستقبل.',
    'compare.col.you': 'بيزلنز',
    'compare.col.excel': 'إكسل / Sheets',
    'compare.col.notion': 'نوشن / Airtable',
    'compare.col.qb': 'كويك بوكس',
    'compare.row.alerts': 'تنبيهات إنفاق فورية',
    'compare.row.insights': 'رؤى واضحة مع شرح "لماذا"',
    'compare.row.forecast': 'توقّع أرباح نهاية الشهر',
    'compare.row.leak': 'كشف التسريبات المالية',
    'compare.row.fast': 'تسجيل معاملة في ٥ ثوانٍ',
    'compare.row.modes': 'يتكيّف مع نمط عملك',
    'compare.row.bilingual': 'عربي + إنجليزي بشكل أصلي',

    'why.title': 'بيزلنز ليس إكسل.  بيزلنز ليس كويك بوكس.',
    'why.subtitle': 'بيزلنز = وضوح فوري.',
    'why.body':
      'أدوات المحاسبة التقليدية صُمّمت للمحاسبين. بيزلنز صُمّم للأشخاص الذين يديرون العمل فعليًا، لتقضي وقتًا أقل في فك رموز الأرقام، ووقتًا أكثر في النمو.',

    'cta.section.title': 'كفى تخمينًا. حان وقت المعرفة.',
    'cta.section.body':
      'انضم إلى أوائل المستخدمين الذين يكتشفون تسريبات أموالهم قبل أن تستنزف البنك.',
    'cta.section.note': 'مجاني للبدء. بدون بطاقة. جاهز في ٦٠ ثانية.',

    'footer.rights': 'جميع الحقوق محفوظة.',
    'footer.tagline': 'وضوح مالي فوري.',
  },
};

export const t = (lang: Language, key: string): string =>
  messages[lang][key] ?? messages.en[key] ?? key;
