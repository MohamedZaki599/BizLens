export type Language = 'en' | 'ar';

type Dict = Record<string, string>;

export const messages: Record<Language, Dict> = {
  en: {
    'nav.features': 'Features',
    'nav.why': 'Why BizLens',
    'nav.problem': 'The problem',
    'nav.compare': 'Compare',
    'nav.signIn': 'Sign in',
    'nav.openMenu': 'Open menu',
    'nav.closeMenu': 'Close menu',
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
    'hero.mock.incomeAmount': '$12,480',
    'hero.mock.incomeChange': '+18% MoM',
    'hero.mock.profitAmount': '$7,920',
    'hero.mock.profitMargin': '63% margin',
    'hero.mock.row1.label': 'Client retainer · Acme Co.',
    'hero.mock.row1.value': '+$2,400',
    'hero.mock.row2.label': 'Software · Figma',
    'hero.mock.row2.value': '−$15',
    'hero.mock.row3.label': 'Consulting · M.A.',
    'hero.mock.row3.value': '+$1,200',

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

    'compare.col.capability': 'Capability',
    'compare.cell.yes': 'Yes',
    'compare.cell.no': 'No',
    'compare.cell.partial': 'Partial',
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

    'pricing.title': 'Simple, honest pricing.',
    'pricing.subtitle':
      'Start free while we build. Founding-member rates lock in for life when paid plans launch.',
    'pricing.popular': 'Most popular',
    'pricing.free.name': 'Solo',
    'pricing.free.price': '$0',
    'pricing.free.cadence': 'Free forever for personal use',
    'pricing.free.f1': 'Unlimited transactions',
    'pricing.free.f2': 'Insight Engine + alerts',
    'pricing.free.f3': 'CSV import',
    'pricing.free.cta': 'Start free',
    'pricing.pro.name': 'Pro',
    'pricing.pro.price': '$9',
    'pricing.pro.cadence': 'Per month — founder pricing',
    'pricing.pro.f1': 'Everything in Solo',
    'pricing.pro.f2': 'Forecast & money-leak detection',
    'pricing.pro.f3': 'Email digests + alert deep links',
    'pricing.pro.f4': 'Priority support',
    'pricing.pro.cta': 'Join early access',
    'pricing.team.name': 'Team',
    'pricing.team.price': '$29',
    'pricing.team.cadence': 'Per workspace, up to 5 seats',
    'pricing.team.f1': 'Everything in Pro',
    'pricing.team.f2': 'Multi-seat with role-based access',
    'pricing.team.f3': 'Accountant export & monthly summaries',
    'pricing.team.cta': 'Talk to us',

    'faq.title': 'Frequently asked questions',
    'faq.subtitle': 'Quick answers about how BizLens works.',
    'faq.q1.q': 'Do I need an accountant to use BizLens?',
    'faq.q1.a':
      'No. BizLens is built for owner-operators. If you can read your bank statement, you can use it. Your accountant can still pull the data later.',
    'faq.q2.q': 'Where does my data live?',
    'faq.q2.a':
      'Your data is encrypted in transit and at rest. We never sell or share it, and you can delete your account at any time.',
    'faq.q3.q': 'Do you connect to my bank?',
    'faq.q3.a':
      'Today BizLens supports CSV import and quick manual entry. Direct bank connections are on the roadmap and will be opt-in.',
    'faq.q4.q': 'Is BizLens free during early access?',
    'faq.q4.a':
      'Yes — every founding-member account stays free while we finalize Pro. When billing starts, you can decide if Pro is worth it.',
    'faq.q5.q': 'Does it support Arabic and right-to-left layouts?',
    'faq.q5.a':
      'Yes. The product, marketing site, and PDF exports are bilingual and fully RTL-aware out of the box.',

    'cta.section.title': 'Stop guessing. Start knowing.',
    'cta.section.body':
      'Join early adopters using BizLens to spot money leaks before they drain the bank.',
    'cta.section.note': 'Free to start. No credit card. Set up in 60 seconds.',

    'nav.pricing': 'Pricing',
    'nav.faq': 'FAQ',
    'footer.rights': 'All rights reserved.',
    'footer.tagline': 'Financial clarity, instantly.',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.contact': 'Contact',

    'legal.privacy.title': 'Privacy Policy',
    'legal.privacy.updated': 'Last updated: April 2026',
    'legal.privacy.body':
      'We collect only what is needed to run BizLens — your email, your transactions, and basic usage events. We never sell or share this data with third parties. You can export or delete everything from inside the app.',
    'legal.terms.title': 'Terms of Service',
    'legal.terms.updated': 'Last updated: April 2026',
    'legal.terms.body':
      'BizLens is provided "as is" while we are in early access. By using the service you agree not to attempt to disrupt it, share your account, or use it for anything illegal. We may update these terms when paid plans launch.',
    'legal.back': 'Back to home',
  },
  ar: {
    'nav.features': 'المزايا',
    'nav.why': 'لماذا بيزلنز',
    'nav.problem': 'المشكلة',
    'nav.compare': 'مقارنة',
    'nav.signIn': 'تسجيل الدخول',
    'nav.openMenu': 'فتح القائمة',
    'nav.closeMenu': 'إغلاق القائمة',
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
    'hero.mock.incomeAmount': '١٢٬٤٨٠ $',
    'hero.mock.incomeChange': '+١٨٪ شهريًا',
    'hero.mock.profitAmount': '٧٬٩٢٠ $',
    'hero.mock.profitMargin': 'هامش ٦٣٪',
    'hero.mock.row1.label': 'عقد عميل · Acme',
    'hero.mock.row1.value': '+٢٬٤٠٠ $',
    'hero.mock.row2.label': 'برامج · Figma',
    'hero.mock.row2.value': '−١٥ $',
    'hero.mock.row3.label': 'استشارات · م.أ.',
    'hero.mock.row3.value': '+١٬٢٠٠ $',

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

    'compare.col.capability': 'القدرة',
    'compare.cell.yes': 'نعم',
    'compare.cell.no': 'لا',
    'compare.cell.partial': 'جزئي',
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

    'pricing.title': 'تسعير بسيط وصادق.',
    'pricing.subtitle':
      'ابدأ مجانًا أثناء بناء المنتج. أسعار العضو المؤسس تثبت مدى الحياة عند إطلاق الخطط المدفوعة.',
    'pricing.popular': 'الأكثر شيوعًا',
    'pricing.free.name': 'فردي',
    'pricing.free.price': '٠ $',
    'pricing.free.cadence': 'مجاني للأبد للاستخدام الشخصي',
    'pricing.free.f1': 'معاملات غير محدودة',
    'pricing.free.f2': 'محرك الرؤى والتنبيهات',
    'pricing.free.f3': 'استيراد CSV',
    'pricing.free.cta': 'ابدأ مجانًا',
    'pricing.pro.name': 'برو',
    'pricing.pro.price': '٩ $',
    'pricing.pro.cadence': 'شهريًا — سعر المؤسسين',
    'pricing.pro.f1': 'كل ما في الخطة الفردية',
    'pricing.pro.f2': 'التوقعات وكشف التسريبات',
    'pricing.pro.f3': 'ملخصات بالبريد ووصول مباشر',
    'pricing.pro.f4': 'دعم بأولوية',
    'pricing.pro.cta': 'انضم للوصول المبكر',
    'pricing.team.name': 'فريق',
    'pricing.team.price': '٢٩ $',
    'pricing.team.cadence': 'لكل مساحة عمل، حتى ٥ مقاعد',
    'pricing.team.f1': 'كل ما في خطة برو',
    'pricing.team.f2': 'مقاعد متعددة مع صلاحيات حسب الدور',
    'pricing.team.f3': 'تصدير للمحاسب وملخصات شهرية',
    'pricing.team.cta': 'تواصل معنا',

    'faq.title': 'الأسئلة الشائعة',
    'faq.subtitle': 'إجابات سريعة عن طريقة عمل بيزلنز.',
    'faq.q1.q': 'هل أحتاج محاسبًا لاستخدام بيزلنز؟',
    'faq.q1.a':
      'لا. بيزلنز مصمّم لأصحاب الأعمال أنفسهم. إن كنت تقرأ كشف حسابك البنكي، فأنت قادر على استخدامه. يمكن لمحاسبك سحب البيانات لاحقًا.',
    'faq.q2.q': 'أين تُحفظ بياناتي؟',
    'faq.q2.a':
      'بياناتك مشفّرة أثناء النقل وفي التخزين. لا نبيعها ولا نشاركها، ويمكنك حذف حسابك في أي وقت.',
    'faq.q3.q': 'هل تتصلون بحسابي البنكي؟',
    'faq.q3.a':
      'حاليًا يدعم بيزلنز استيراد CSV والإدخال السريع. الربط البنكي المباشر مدرج في خارطة الطريق وسيكون اختياريًا.',
    'faq.q4.q': 'هل بيزلنز مجاني خلال الوصول المبكر؟',
    'faq.q4.a':
      'نعم — كل عضو مؤسس يبقى مجانيًا حتى ننهي خطة برو. عند بدء الفوترة، تقرر بنفسك ما إن كانت تستحق.',
    'faq.q5.q': 'هل يدعم العربية وتصميم RTL؟',
    'faq.q5.a':
      'نعم. المنتج والموقع التسويقي وتقارير PDF مزدوجة اللغة وتدعم RTL منذ البداية.',

    'cta.section.title': 'كفى تخمينًا. حان وقت المعرفة.',
    'cta.section.body':
      'انضم إلى أوائل المستخدمين الذين يكتشفون تسريبات أموالهم قبل أن تستنزف البنك.',
    'cta.section.note': 'مجاني للبدء. بدون بطاقة. جاهز في ٦٠ ثانية.',

    'nav.pricing': 'الأسعار',
    'nav.faq': 'الأسئلة',
    'footer.rights': 'جميع الحقوق محفوظة.',
    'footer.tagline': 'وضوح مالي فوري.',
    'footer.privacy': 'الخصوصية',
    'footer.terms': 'الشروط',
    'footer.contact': 'تواصل',

    'legal.privacy.title': 'سياسة الخصوصية',
    'legal.privacy.updated': 'آخر تحديث: أبريل ٢٠٢٦',
    'legal.privacy.body':
      'نجمع فقط ما نحتاج لتشغيل بيزلنز — بريدك الإلكتروني ومعاملاتك وبعض إحصاءات الاستخدام. لا نبيع هذه البيانات ولا نشاركها. يمكنك تصدير أو حذف كل شيء من داخل التطبيق.',
    'legal.terms.title': 'شروط الاستخدام',
    'legal.terms.updated': 'آخر تحديث: أبريل ٢٠٢٦',
    'legal.terms.body':
      'يُقدَّم بيزلنز "كما هو" أثناء الوصول المبكر. باستخدامك للخدمة، توافق على عدم محاولة تعطيلها أو مشاركة حسابك أو استخدامها لأي غرض غير قانوني. قد نحدّث هذه الشروط عند إطلاق الخطط المدفوعة.',
    'legal.back': 'العودة للرئيسية',
  },
};

export const t = (lang: Language, key: string): string =>
  messages[lang][key] ?? messages.en[key] ?? key;
