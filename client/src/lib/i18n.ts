import type { Language } from '@/types/domain';
import { useUiStore } from '@/store/ui-store';

type Dict = Record<string, string>;

const en: Dict = {
  'app.name': 'BizLens',
  'app.tagline': 'Financial clarity, instantly.',

  'nav.dashboard': 'Dashboard',
  'nav.transactions': 'Transactions',
  'nav.categories': 'Categories',
  'nav.settings': 'Settings',
  'nav.signOut': 'Sign out',

  'auth.login.title': 'Welcome back',
  'auth.login.subtitle': 'Sign in to your BizLens account.',
  'auth.login.submit': 'Sign in',
  'auth.login.toRegister': "Don't have an account?",
  'auth.login.toRegisterCta': 'Create one',

  'auth.register.title': 'Start your clarity',
  'auth.register.subtitle': 'Create your BizLens account in seconds.',
  'auth.register.submit': 'Create account',
  'auth.register.toLogin': 'Already have an account?',
  'auth.register.toLoginCta': 'Sign in',
  'auth.register.userMode': 'I am a',
  'auth.register.modes.FREELANCER': 'Freelancer',
  'auth.register.modes.ECOMMERCE': 'E-commerce store',
  'auth.register.modes.SERVICE_BUSINESS': 'Service business',

  'fields.name': 'Name',
  'fields.email': 'Email',
  'fields.password': 'Password',
  'fields.amount': 'Amount',
  'fields.date': 'Date',
  'fields.category': 'Category',
  'fields.description': 'Description',
  'fields.description.placeholder': 'What was this for? (optional)',
  'fields.type': 'Type',
  'fields.color': 'Color',
  'type.INCOME': 'Income',
  'type.EXPENSE': 'Expense',

  'dashboard.title': 'Dashboard',
  'dashboard.subtitle': 'Your financial pulse — at a glance.',
  'dashboard.greeting': 'Hi',
  'dashboard.totalIncome': 'Total income',
  'dashboard.totalExpense': 'Total expenses',
  'dashboard.netProfit': 'Net profit',
  'dashboard.margin': 'Margin',
  'dashboard.txnCount': 'Transactions',
  'dashboard.noInsights': 'Log a few transactions to unlock insights.',
  'dashboard.insights.label': 'Smart insight',
  'dashboard.range.label': 'Time range',
  'dashboard.range.this_month': 'This month',
  'dashboard.range.last_month': 'Last month',
  'dashboard.range.last_30_days': 'Last 30 days',
  'dashboard.range.all': 'All time',
  'dashboard.biggestExpense': 'Biggest expense',
  'dashboard.biggestIncome': 'Top income source',
  'dashboard.breakdown.empty': 'Not enough data for this period yet.',
  'dashboard.recent': 'Recent activity',
  'dashboard.recent.empty': 'No recent transactions.',

  'mode.freelancer.headline': "here's your income & cash flow snapshot.",
  'mode.freelancer.tip':
    'Tip: Log invoices as INCOME the day they\'re paid to keep your cash-flow chart accurate.',
  'mode.ecommerce.headline': "here's how your spend is shaping margins.",
  'mode.ecommerce.tip':
    'Tip: Tag ads, fulfillment, and shipping into separate categories to spot margin leaks.',
  'mode.business.headline': "here's how your business is performing.",
  'mode.business.tip':
    'Tip: Compare profit changes month-over-month to catch operational drift early.',

  'transactions.title': 'Transactions',
  'transactions.subtitle': 'Every dollar in and out.',
  'transactions.empty.title': 'No transactions yet',
  'transactions.empty.subtitle': 'Use Quick Add to log your first transaction.',
  'transactions.empty.filtered': 'No transactions match the current filters.',
  'transactions.empty.cta': 'Add your first transaction',
  'transactions.quickAdd': 'Quick Add',
  'transactions.add.title': 'Add a transaction',
  'transactions.add.subtitle': 'Logged in seconds — searchable forever.',
  'transactions.delete.confirm': 'Delete this transaction?',
  'transactions.allCategories': 'All categories',
  'transactions.filteredBy': 'Filtered by',

  'quickAdd.selectCategory': 'Select a category',
  'quickAdd.searchCategory': 'Search categories…',
  'quickAdd.noMatches': 'No categories match your search.',
  'quickAdd.noCategories': 'Create a category first',
  'quickAdd.lastUsed': 'Last used',

  'categories.title': 'Categories',
  'categories.subtitle': 'Organize income and expenses.',
  'categories.add': 'Add category',
  'categories.add.subtitle': 'Categories help group your transactions.',
  'categories.namePlaceholder': 'e.g. Marketing, Subscriptions',
  'categories.empty.title': 'No categories yet',
  'categories.empty.subtitle': 'Create your first category to start tracking.',
  'categories.empty.cta': 'Create category',
  'categories.empty.income': 'No income categories yet.',
  'categories.empty.expense': 'No expense categories yet.',
  'categories.delete.confirm': 'Delete this category?',
  'categories.income': 'Income categories',
  'categories.expense': 'Expense categories',

  'toast.transaction.added': 'Transaction added successfully',
  'toast.transaction.deleted': 'Transaction deleted',
  'toast.transaction.updated': 'Transaction updated',
  'toast.category.added': 'Category created',
  'toast.category.deleted': 'Category deleted',
  'toast.error.generic': 'Something went wrong, please try again.',
  'toast.signedIn': 'Signed in',
  'toast.signedOut': 'You have been signed out',

  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.saving': 'Saving…',
  'common.delete': 'Delete',
  'common.add': 'Add',
  'common.adding': 'Adding…',
  'common.loading': 'Loading…',
  'common.error': 'Something went wrong.',
  'common.search': 'Search…',
  'common.view': 'View',
  'common.all': 'All',
  'common.clearFilters': 'Clear filters',

  'alerts.label': 'Alerts',
  'alerts.unread': 'unread',
  'alerts.markAll': 'Mark all read',
  'alerts.markRead': 'Mark read',
  'alerts.dismiss': 'Dismiss',
  'alerts.empty.title': "You're all caught up",
  'alerts.empty.subtitle': 'New alerts will land here as your data changes.',

  'widgets.leak.title': 'Biggest money leak',
  'widgets.leak.severity': 'Money out',
  'widgets.leak.empty': 'No unusual category spend detected — your budget is balanced.',
  'widgets.leak.extra': 'Extra this month',
  'widgets.leak.annualized': 'If it sticks, /yr',
  'widgets.leak.cta': 'Inspect transactions',

  'widgets.forecast.title': 'Month-end forecast',
  'widgets.forecast.income': 'Income',
  'widgets.forecast.expense': 'Expense',
  'widgets.forecast.profit': 'Profit',
  'widgets.forecast.daysLeft': 'days left in the month',

  'widgets.week.title': 'This week',
  'widgets.week.netForWeek': 'net',
  'widgets.week.transactions': 'transactions',

  'reminder.stale.title': "It's been {days} days since your last transaction.",
  'reminder.stale.subtitle': 'Update your data to keep insights and forecasts accurate.',
  'reminder.stale.cta': 'Add now',

  'insight.severity.info': 'Insight',
  'insight.severity.success': 'Good news',
  'insight.severity.warning': 'Watch out',
  'insight.severity.critical': 'Action needed',
  'stat.noPriorData': 'No prior data',

  'user.profile': 'Profile',
  'user.mode.FREELANCER': 'Freelancer',
  'user.mode.ECOMMERCE': 'E-commerce',
  'user.mode.SERVICE_BUSINESS': 'Service Business',

  'nav.subscriptions': 'Subscriptions',
  'nav.budgets': 'Budgets',
  'nav.import': 'Import',

  'subscriptions.title': 'Subscriptions',
  'subscriptions.subtitle': 'Recurring expenses detected automatically.',
  'subscriptions.empty': 'No recurring expenses detected yet. Keep logging and we\'ll find them.',
  'subscriptions.totalMonthly': 'Total monthly',
  'subscriptions.totalAnnual': 'Total annual',
  'subscriptions.months': '{count} months',
  'subscriptions.cancelHint': 'Consider cancelling if unused',
  'subscriptions.perMonth': '/mo',
  'subscriptions.perYear': '/yr',

  'budgets.title': 'Category Budgets',
  'budgets.subtitle': 'Set monthly caps per expense category.',
  'budgets.empty': 'No budgets set yet. Add one to start tracking spend limits.',
  'budgets.add': 'Set budget',
  'budgets.used': '{pct}% used',
  'budgets.remaining': '{amount} remaining',
  'budgets.exceeded': 'Over budget!',
  'budgets.amount': 'Monthly budget',

  'charts.trend.title': '12-month trend',
  'charts.composition.title': 'Expense breakdown',
  'charts.income': 'Income',
  'charts.expense': 'Expense',

  'import.title': 'Import transactions',
  'import.subtitle': 'Upload a CSV file to bulk-import transactions.',
  'import.upload': 'Choose CSV file',
  'import.preview': 'Preview ({count} rows)',
  'import.mapColumns': 'Map your CSV columns',
  'import.importing': 'Importing…',
  'import.success': '{count} transactions imported successfully',
  'import.empty': 'No valid rows found in your CSV.',
  'import.submit': 'Import {count} transactions',

  'notifications.permission': 'Enable browser notifications for critical alerts.',
  'notifications.enable': 'Enable',
  'notifications.enabled': 'Notifications enabled',
};

const ar: Dict = {
  'app.name': 'بيزلنز',
  'app.tagline': 'وضوح مالي فوري.',

  'nav.dashboard': 'لوحة التحكم',
  'nav.transactions': 'المعاملات',
  'nav.categories': 'الفئات',
  'nav.settings': 'الإعدادات',
  'nav.signOut': 'تسجيل الخروج',

  'auth.login.title': 'مرحبًا بعودتك',
  'auth.login.subtitle': 'سجّل الدخول إلى حسابك.',
  'auth.login.submit': 'تسجيل الدخول',
  'auth.login.toRegister': 'ليس لديك حساب؟',
  'auth.login.toRegisterCta': 'أنشئ حسابًا',

  'auth.register.title': 'ابدأ رحلتك',
  'auth.register.subtitle': 'أنشئ حسابك في ثوانٍ.',
  'auth.register.submit': 'إنشاء حساب',
  'auth.register.toLogin': 'لديك حساب بالفعل؟',
  'auth.register.toLoginCta': 'تسجيل الدخول',
  'auth.register.userMode': 'أنا',
  'auth.register.modes.FREELANCER': 'مستقل',
  'auth.register.modes.ECOMMERCE': 'متجر إلكتروني',
  'auth.register.modes.SERVICE_BUSINESS': 'شركة خدمات',

  'fields.name': 'الاسم',
  'fields.email': 'البريد الإلكتروني',
  'fields.password': 'كلمة المرور',
  'fields.amount': 'المبلغ',
  'fields.date': 'التاريخ',
  'fields.category': 'الفئة',
  'fields.description': 'الوصف',
  'fields.description.placeholder': 'لماذا هذه المعاملة؟ (اختياري)',
  'fields.type': 'النوع',
  'fields.color': 'اللون',
  'type.INCOME': 'دخل',
  'type.EXPENSE': 'مصروف',

  'dashboard.title': 'لوحة التحكم',
  'dashboard.subtitle': 'نبض أعمالك المالية في لمحة.',
  'dashboard.greeting': 'مرحبًا',
  'dashboard.totalIncome': 'إجمالي الدخل',
  'dashboard.totalExpense': 'إجمالي المصروفات',
  'dashboard.netProfit': 'صافي الربح',
  'dashboard.margin': 'الهامش',
  'dashboard.txnCount': 'المعاملات',
  'dashboard.noInsights': 'سجّل بعض المعاملات لفتح الرؤى.',
  'dashboard.insights.label': 'رؤية ذكية',
  'dashboard.range.label': 'النطاق الزمني',
  'dashboard.range.this_month': 'هذا الشهر',
  'dashboard.range.last_month': 'الشهر الماضي',
  'dashboard.range.last_30_days': 'آخر ٣٠ يومًا',
  'dashboard.range.all': 'كل الوقت',
  'dashboard.biggestExpense': 'أكبر مصروف',
  'dashboard.biggestIncome': 'أعلى مصدر دخل',
  'dashboard.breakdown.empty': 'لا توجد بيانات كافية لهذه الفترة بعد.',
  'dashboard.recent': 'النشاط الأخير',
  'dashboard.recent.empty': 'لا توجد معاملات حديثة.',

  'mode.freelancer.headline': 'هذه لقطة سريعة عن دخلك وتدفقك النقدي.',
  'mode.freelancer.tip':
    'نصيحة: سجّل الفواتير كدخل في يوم استلامها لإبقاء تدفقك النقدي دقيقًا.',
  'mode.ecommerce.headline': 'هكذا يشكّل إنفاقك هوامش الربح.',
  'mode.ecommerce.tip':
    'نصيحة: افصل الإعلانات والشحن والتعبئة إلى فئات لكشف تسريبات الهامش.',
  'mode.business.headline': 'هذا أداء عملك حتى الآن.',
  'mode.business.tip':
    'نصيحة: قارن الأرباح شهريًا لاكتشاف الانحراف التشغيلي مبكرًا.',

  'transactions.title': 'المعاملات',
  'transactions.subtitle': 'كل دولار يدخل ويخرج.',
  'transactions.empty.title': 'لا توجد معاملات بعد',
  'transactions.empty.subtitle': 'استخدم الإضافة السريعة لتسجيل أول معاملة.',
  'transactions.empty.filtered': 'لا توجد معاملات تطابق المرشحات الحالية.',
  'transactions.empty.cta': 'أضف أول معاملة',
  'transactions.quickAdd': 'إضافة سريعة',
  'transactions.add.title': 'إضافة معاملة',
  'transactions.add.subtitle': 'تُسجَّل في ثوانٍ — قابلة للبحث للأبد.',
  'transactions.delete.confirm': 'حذف هذه المعاملة؟',
  'transactions.allCategories': 'جميع الفئات',
  'transactions.filteredBy': 'مُصفّى بـ',

  'quickAdd.selectCategory': 'اختر فئة',
  'quickAdd.searchCategory': 'ابحث في الفئات…',
  'quickAdd.noMatches': 'لا توجد فئات مطابقة.',
  'quickAdd.noCategories': 'أنشئ فئة أولًا',
  'quickAdd.lastUsed': 'آخر استخدام',

  'categories.title': 'الفئات',
  'categories.subtitle': 'نظّم الدخل والمصروفات.',
  'categories.add': 'إضافة فئة',
  'categories.add.subtitle': 'الفئات تساعد على تجميع معاملاتك.',
  'categories.namePlaceholder': 'مثال: تسويق، اشتراكات',
  'categories.empty.title': 'لا توجد فئات بعد',
  'categories.empty.subtitle': 'أنشئ أول فئة للبدء بالتتبع.',
  'categories.empty.cta': 'إنشاء فئة',
  'categories.empty.income': 'لا توجد فئات دخل بعد.',
  'categories.empty.expense': 'لا توجد فئات مصروفات بعد.',
  'categories.delete.confirm': 'حذف هذه الفئة؟',
  'categories.income': 'فئات الدخل',
  'categories.expense': 'فئات المصروفات',

  'toast.transaction.added': 'تمت إضافة المعاملة',
  'toast.transaction.deleted': 'تم حذف المعاملة',
  'toast.transaction.updated': 'تم تحديث المعاملة',
  'toast.category.added': 'تم إنشاء الفئة',
  'toast.category.deleted': 'تم حذف الفئة',
  'toast.error.generic': 'حدث خطأ، يرجى المحاولة مرة أخرى.',
  'toast.signedIn': 'تم تسجيل الدخول',
  'toast.signedOut': 'تم تسجيل خروجك',

  'common.cancel': 'إلغاء',
  'common.save': 'حفظ',
  'common.saving': 'يحفظ…',
  'common.delete': 'حذف',
  'common.add': 'إضافة',
  'common.adding': 'يضيف…',
  'common.loading': 'جارٍ التحميل…',
  'common.error': 'حدث خطأ ما.',
  'common.search': 'بحث…',
  'common.view': 'عرض',
  'common.all': 'الكل',
  'common.clearFilters': 'مسح المرشحات',

  'alerts.label': 'التنبيهات',
  'alerts.unread': 'غير مقروءة',
  'alerts.markAll': 'تعليم الكل كمقروء',
  'alerts.markRead': 'تعليم كمقروء',
  'alerts.dismiss': 'إغلاق',
  'alerts.empty.title': 'لا توجد تنبيهات جديدة',
  'alerts.empty.subtitle': 'ستظهر التنبيهات هنا مع تغير بياناتك.',

  'widgets.leak.title': 'أكبر تسريب مالي',
  'widgets.leak.severity': 'إنفاق زائد',
  'widgets.leak.empty': 'لم يُكتشف إنفاق غير عادي في أي فئة — ميزانيتك متوازنة.',
  'widgets.leak.extra': 'الزيادة هذا الشهر',
  'widgets.leak.annualized': 'إن استمر، سنويًا',
  'widgets.leak.cta': 'مراجعة المعاملات',

  'widgets.forecast.title': 'توقع نهاية الشهر',
  'widgets.forecast.income': 'الدخل',
  'widgets.forecast.expense': 'المصروف',
  'widgets.forecast.profit': 'الربح',
  'widgets.forecast.daysLeft': 'يومًا متبقيًا في الشهر',

  'widgets.week.title': 'هذا الأسبوع',
  'widgets.week.netForWeek': 'صافي',
  'widgets.week.transactions': 'معاملات',

  'reminder.stale.title': 'مرّ {days} أيام منذ آخر معاملة سجّلتها.',
  'reminder.stale.subtitle': 'حدّث بياناتك لتبقى الرؤى والتوقعات دقيقة.',
  'reminder.stale.cta': 'أضف الآن',

  'insight.severity.info': 'رؤية',
  'insight.severity.success': 'خبر جيد',
  'insight.severity.warning': 'تنبيه',
  'insight.severity.critical': 'إجراء مطلوب',
  'stat.noPriorData': 'لا توجد بيانات سابقة',

  'user.profile': 'الملف الشخصي',
  'user.mode.FREELANCER': 'مستقل',
  'user.mode.ECOMMERCE': 'تجارة إلكترونية',
  'user.mode.SERVICE_BUSINESS': 'شركة خدمات',

  'nav.subscriptions': 'الاشتراكات',
  'nav.budgets': 'الميزانيات',
  'nav.import': 'استيراد',

  'subscriptions.title': 'الاشتراكات',
  'subscriptions.subtitle': 'المصاريف المتكررة المكتشفة تلقائيًا.',
  'subscriptions.empty': 'لم يتم اكتشاف مصاريف متكررة بعد. استمر بالتسجيل وسنجدها.',
  'subscriptions.totalMonthly': 'الإجمالي الشهري',
  'subscriptions.totalAnnual': 'الإجمالي السنوي',
  'subscriptions.months': '{count} أشهر',
  'subscriptions.cancelHint': 'فكّر بالإلغاء إذا لم تستخدمه',
  'subscriptions.perMonth': '/شهر',
  'subscriptions.perYear': '/سنة',

  'budgets.title': 'ميزانيات الفئات',
  'budgets.subtitle': 'حدد سقفًا شهريًا لكل فئة مصروفات.',
  'budgets.empty': 'لم تحدد ميزانيات بعد. أضف واحدة لتتبع حدود الإنفاق.',
  'budgets.add': 'تحديد ميزانية',
  'budgets.used': '{pct}% مستخدم',
  'budgets.remaining': '{amount} متبقي',
  'budgets.exceeded': 'تجاوزت الميزانية!',
  'budgets.amount': 'الميزانية الشهرية',

  'charts.trend.title': 'الاتجاه خلال ١٢ شهرًا',
  'charts.composition.title': 'توزيع المصاريف',
  'charts.income': 'الدخل',
  'charts.expense': 'المصروف',

  'import.title': 'استيراد المعاملات',
  'import.subtitle': 'ارفع ملف CSV لاستيراد المعاملات بالجملة.',
  'import.upload': 'اختر ملف CSV',
  'import.preview': 'معاينة ({count} صف)',
  'import.mapColumns': 'طابق أعمدة CSV الخاصة بك',
  'import.importing': 'جارٍ الاستيراد…',
  'import.success': 'تم استيراد {count} معاملة بنجاح',
  'import.empty': 'لم يتم العثور على صفوف صالحة في ملف CSV.',
  'import.submit': 'استيراد {count} معاملة',

  'notifications.permission': 'فعّل إشعارات المتصفح للتنبيهات الحرجة.',
  'notifications.enable': 'تفعيل',
  'notifications.enabled': 'الإشعارات مفعّلة',
};

const dictionaries: Record<Language, Dict> = { en, ar };

export const t = (key: string, lang?: Language): string => {
  const language = lang ?? useUiStore.getState().language;
  return dictionaries[language][key] ?? dictionaries.en[key] ?? key;
};

/** Interpolate `{key}` placeholders in translation strings. */
export const ti = (key: string, vars: Record<string, string | number>, lang?: Language): string => {
  let str = t(key, lang);
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return str;
};

/** React hook variant — re-renders when language changes. */
export const useT = () => {
  const language = useUiStore((s) => s.language);
  return (key: string) => t(key, language);
};

export const useTi = () => {
  const language = useUiStore((s) => s.language);
  return (key: string, vars: Record<string, string | number>) => ti(key, vars, language);
};
