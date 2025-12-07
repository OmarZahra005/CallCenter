import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Common
      common: {
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        refresh: 'Refresh',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        submit: 'Submit',
        confirm: 'Confirm',
        yes: 'Yes',
        no: 'No',
      },
      // Auth
      auth: {
        login: 'Login',
        logout: 'Logout',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        forgotPassword: 'Forgot Password?',
        rememberMe: 'Remember Me',
        loginTitle: 'Sign in to your account',
        registerTitle: 'Create an account',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
      },
      // Navigation
      nav: {
        dashboard: 'Dashboard',
        agents: 'Agents',
        calls: 'Calls',
        tickets: 'Tickets',
        customers: 'Customers',
        reports: 'Reports',
        settings: 'Settings',
        knowledgeBase: 'Knowledge Base',
        notifications: 'Notifications',
      },
      // Agent states
      agentState: {
        available: 'Available',
        busy: 'Busy',
        break: 'On Break',
        offline: 'Offline',
        acw: 'After Call Work',
        meeting: 'In Meeting',
      },
      // Ticket status
      ticketStatus: {
        new: 'New',
        open: 'Open',
        inProgress: 'In Progress',
        pending: 'Pending',
        resolved: 'Resolved',
        closed: 'Closed',
      },
      // Agent Desktop
      agentDesktop: {
        loadingAgentDesktop: 'Loading agent desktop...',
        conversations: 'Conversations',
        live: 'Live',
        noActiveConversations: 'No active conversations',
        incomingCall: 'Incoming Call',
        queue: 'Queue',
        onHold: 'On Hold',
        noActiveCall: 'No active call',
        customer360: 'Customer 360',
        statistics: 'Statistics',
        totalCalls: 'Total Calls',
        recentInteractions: 'Recent Interactions',
        noInteractionsFound: 'No interactions found',
        noCustomerData: 'No customer data available',
        quickTicket: 'Quick Ticket',
        subject: 'Subject',
        enterTicketSubject: 'Enter ticket subject',
        description: 'Description',
        describeIssue: 'Describe the issue...',
        priority: 'Priority',
        category: 'Category',
        createTicket: 'Create Ticket',
        creating: 'Creating...',
        callNotes: 'Call Notes',
        addCallNotes: 'Add notes about this call...',
        ticketCreated: 'Ticket created successfully!',
        ticketFailed: 'Failed to create ticket',
      },
      // Priority levels
      priority: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical',
      },
      // Categories
      category: {
        general: 'General',
        billing: 'Billing',
        technical: 'Technical',
        sales: 'Sales',
      },
      // Customer types
      customerType: {
        standard: 'Standard',
        premium: 'Premium',
        vip: 'VIP',
      },
    },
  },
  ar: {
    translation: {
      // Common
      common: {
        loading: 'جاري التحميل...',
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        create: 'إنشاء',
        search: 'بحث',
        filter: 'تصفية',
        export: 'تصدير',
        refresh: 'تحديث',
        back: 'رجوع',
        next: 'التالي',
        previous: 'السابق',
        submit: 'إرسال',
        confirm: 'تأكيد',
        yes: 'نعم',
        no: 'لا',
      },
      // Auth
      auth: {
        login: 'تسجيل الدخول',
        logout: 'تسجيل الخروج',
        register: 'إنشاء حساب',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        confirmPassword: 'تأكيد كلمة المرور',
        forgotPassword: 'نسيت كلمة المرور؟',
        rememberMe: 'تذكرني',
        loginTitle: 'تسجيل الدخول إلى حسابك',
        registerTitle: 'إنشاء حساب جديد',
        noAccount: 'ليس لديك حساب؟',
        hasAccount: 'لديك حساب بالفعل؟',
      },
      // Navigation
      nav: {
        dashboard: 'لوحة التحكم',
        agents: 'الوكلاء',
        calls: 'المكالمات',
        tickets: 'التذاكر',
        customers: 'العملاء',
        reports: 'التقارير',
        settings: 'الإعدادات',
        knowledgeBase: 'قاعدة المعرفة',
        notifications: 'الإشعارات',
      },
      // Agent states
      agentState: {
        available: 'متاح',
        busy: 'مشغول',
        break: 'في استراحة',
        offline: 'غير متصل',
        acw: 'بعد المكالمة',
        meeting: 'في اجتماع',
      },
      // Ticket status
      ticketStatus: {
        new: 'جديد',
        open: 'مفتوح',
        inProgress: 'قيد التنفيذ',
        pending: 'معلق',
        resolved: 'تم الحل',
        closed: 'مغلق',
      },
      // Agent Desktop
      agentDesktop: {
        loadingAgentDesktop: 'جاري تحميل سطح مكتب الوكيل...',
        conversations: 'المحادثات',
        live: 'مباشر',
        noActiveConversations: 'لا توجد محادثات نشطة',
        incomingCall: 'مكالمة واردة',
        queue: 'قائمة الانتظار',
        onHold: 'قيد الانتظار',
        noActiveCall: 'لا توجد مكالمة نشطة',
        customer360: 'عرض العميل 360',
        statistics: 'الإحصائيات',
        totalCalls: 'إجمالي المكالمات',
        recentInteractions: 'التفاعلات الأخيرة',
        noInteractionsFound: 'لم يتم العثور على تفاعلات',
        noCustomerData: 'لا توجد بيانات عميل متاحة',
        quickTicket: 'تذكرة سريعة',
        subject: 'الموضوع',
        enterTicketSubject: 'أدخل موضوع التذكرة',
        description: 'الوصف',
        describeIssue: 'صف المشكلة...',
        priority: 'الأولوية',
        category: 'الفئة',
        createTicket: 'إنشاء تذكرة',
        creating: 'جاري الإنشاء...',
        callNotes: 'ملاحظات المكالمة',
        addCallNotes: 'أضف ملاحظات حول هذه المكالمة...',
        ticketCreated: 'تم إنشاء التذكرة بنجاح!',
        ticketFailed: 'فشل إنشاء التذكرة',
      },
      // Priority levels
      priority: {
        low: 'منخفضة',
        medium: 'متوسطة',
        high: 'عالية',
        critical: 'حرجة',
      },
      // Categories
      category: {
        general: 'عام',
        billing: 'الفواتير',
        technical: 'تقني',
        sales: 'المبيعات',
      },
      // Customer types
      customerType: {
        standard: 'قياسي',
        premium: 'مميز',
        vip: 'في آي بي',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Update document direction based on language
i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

export default i18n;
