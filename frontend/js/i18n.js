// Sistym Internationalization (Arabic RTL / English LTR)
const translations = {
    ar: {
        // App
        appName: "نظام إدارة العمال والعهدة والمخازن",
        
        // Navigation
        dashboard: "لوحة التحكم",
        workers: "إدارة العمال",
        factories: "المصانع",
        custodyItems: "المنتجات وأصناف العهدة",
        warehouses: "المخازن",
        stockTransactions: "حركات المخزون (Ledger)",
        workerCustody: "عهد العمال",
        resignations: "الاستقالات",
        reports: "التقارير",
        alerts: "التنبيهات",
        users: "المستخدمين والصلاحيات",
        settings: "الإعدادات",
        auditLog: "سجل التدقيق",
        logout: "تسجيل الخروج",
        
        // Statuses
        active: "نشط",
        inactive: "معطل",
        resignationSubmitted: "مقدم استقالة",
        left: "غادر العمل",
        terminated: "منهي خدماته",
        confirmed: "معتمد",
        reversed: "تم عكسها",
        compliant: "ملتزم (>= 15 يوم)",
        nonCompliant: "غير ملتزم (< 15 يوم)",
        pendingReview: "قيد المراجعة",
        settled: "تمت التسوية",
        
        // Conditions
        newCondition: "جديد (New)",
        returnedUsedCondition: "مرتجع مستعمل (Returned Used)",
        damagedCondition: "تالف (Damaged)",
        lostCondition: "مفقود (Lost)",
        notReturnedCondition: "غير مرتجع (Not Returned)",
        
        // Buttons & Actions
        addWorker: "إضافة عامل",
        addFactory: "إضافة مصنع",
        addItem: "إضافة منتج / صنف",
        editItem: "تعديل الصنف / المنتج",
        deleteItem: "حذف / إلغاء الصنف",
        addWarehouse: "إضافة مخزن",
        editWarehouse: "تعديل المخزن",
        deleteWarehouse: "حذف / إلغاء المخزن",
        addStock: "إضافة رصيد (توريد)",
        issueCustody: "صرف عهدة",
        returnCustody: "إرجاع عهدة",
        transferWorker: "نقل مصنع",
        registerResignation: "تسجيل استقالة",
        workerExit: "إنهاء خدمة وتسوية",
        transferStock: "تحويل بين المخازن",
        reverseTransaction: "عكس الحركة",
        exportExcel: "تصدير Excel",
        exportCSV: "تصدير CSV",
        print: "طباعة التقرير",
        filter: "تصفية",
        reset: "إعادة ضبط",
        save: "حفظ البيانات",
        confirm: "تأكيد العملية",
        cancel: "إلغاء",
        viewDetails: "عرض التفاصيل",
        edit: "تعديل",
        close: "إغلاق",
        search: "بحث...",
        
        // Headers & Labels
        workerCode: "كود العامل",
        workerName: "اسم العامل",
        mobile: "رقم الموبايل",
        nationalId: "الرقم القومي",
        factory: "المصنع",
        currentFactory: "المصنع الحالي",
        employmentStartDate: "تاريخ التعيين",
        employmentDuration: "مدة العمل",
        status: "الحالة",
        custodyStatus: "حالة العهدة",
        actions: "الإجراءات",
        
        itemCode: "كود الصنف",
        itemName: "اسم الصنف",
        itemType: "نوع الصنف",
        unit: "الوحدة",
        minimumStock: "الحد الأدنى",
        availableStock: "الرصيد المتاح",
        newStock: "الرصيد الجديد",
        returnedUsedStock: "المرتجع المستعمل",
        damagedStock: "التالف",
        lostStock: "المفقود",
        withWorkers: "مع العمال",
        lowStockAlert: "مخزون منخفض",
        
        warehouseCode: "كود المخزن",
        warehouseName: "اسم المخزن",
        location: "الموقع",
        responsiblePerson: "المسؤول",
        
        txNumber: "رقم الحركة",
        txDate: "التاريخ والوقت",
        txType: "نوع الحركة",
        sourceWarehouse: "المخزن المصدر",
        destWarehouse: "المخزن المستلم",
        quantity: "الكمية",
        condition: "حالة العهدة",
        user: "المستخدم",
        notes: "ملاحظات",
        reversalReason: "سبب العكس",
        
        submissionDate: "تاريخ تقديم الاستقالة",
        expectedLeavingDate: "تاريخ الخروج المتوقع",
        actualLeavingDate: "تاريخ الخروج الفعلي",
        noticePeriod: "فترة الإخطار القانونية",
        actualNoticeDays: "أيام الإخطار الفعلية",
        compliance: "الالتزام بالإخطار",
        deductionAmount: "مبلغ الخصم",
        
        // Metrics
        totalWorkers: "إجمالي العمال",
        activeWorkers: "عمال على رأس العمل",
        resignedWorkers: "استقالات مسجلة",
        leftWorkers: "عمال غادروا",
        lowStockItems: "أصناف دون الحد الأدنى",
        unsettledCustodyCount: "عهد غير مسواة",
        
        // Confirmations & Messages
        confirmReverseMsg: "هل أنت متأكد من عكس هذه الحركة؟ سيتم إنشاء حركة عكسية وإعادة تسوية الرصيد بدقة ولن يتم حذف السجل التاريخي.",
        confirmExitMsg: "تأكيد إتمام التسوية وإنهاء خدمة العامل؟ ستتحول حالته إلى غادر العمل ولن يسمح له بالصرف.",
        unsettledWarning: "لا يمكن إنهاء العامل قبل تسوية جميع العهد المسجلة عليه.",
        splitMismatchError: "إجمالي كميات التقسيم يجب أن يساوي بالضبط الكمية المطلوبة!",
        successSaved: "تم حفظ البيانات بنجاح",
        loginWelcome: "مرحباً بك في نظام إدارة العمال والعهدة والمخازن",
        loginSubtitle: "سجل الدخول للمتابعة إلى لوحة التحكم والعمليات",
        username: "اسم المستخدم",
        password: "كلمة المرور",
        loginBtn: "تسجيل الدخول",
        
        // Quick Actions
        quickActions: "إجراءات سريعة",
        workersDistribution: "توزيع العمال على المصانع",
        recentAlerts: "أحدث التنبيهات"
    },
    en: {
        // App
        appName: "Workers, Custody & Warehouse Management System",
        
        // Navigation
        dashboard: "Dashboard",
        workers: "Workers Management",
        factories: "Factories",
        custodyItems: "Products & Custody Items",
        warehouses: "Warehouses",
        stockTransactions: "Stock Ledger",
        workerCustody: "Worker Custody",
        resignations: "Resignations",
        reports: "Reports",
        alerts: "Alerts",
        users: "Users & Roles",
        settings: "Settings",
        auditLog: "Audit Log",
        logout: "Logout",
        
        // Statuses
        active: "Active",
        inactive: "Inactive",
        resignationSubmitted: "Resignation Submitted",
        left: "Left",
        terminated: "Terminated",
        confirmed: "Confirmed",
        reversed: "Reversed",
        compliant: "Compliant (>= 15 Days)",
        nonCompliant: "Non-Compliant (< 15 Days)",
        pendingReview: "Pending Review",
        settled: "Settled",
        
        // Conditions
        newCondition: "New",
        returnedUsedCondition: "Returned Used",
        damagedCondition: "Damaged",
        lostCondition: "Lost",
        notReturnedCondition: "Not Returned",
        
        // Buttons & Actions
        addWorker: "Add Worker",
        addFactory: "Add Factory",
        addItem: "Add Product / Item",
        editItem: "Edit Product / Item",
        deleteItem: "Delete / Deactivate Item",
        addWarehouse: "Add Warehouse",
        editWarehouse: "Edit Warehouse",
        deleteWarehouse: "Delete / Deactivate Warehouse",
        addStock: "Add Stock In",
        issueCustody: "Issue Custody",
        returnCustody: "Return Custody",
        transferWorker: "Transfer Factory",
        registerResignation: "Register Resignation",
        workerExit: "Exit & Settlement",
        transferStock: "Transfer Stock",
        reverseTransaction: "Reverse Transaction",
        exportExcel: "Export Excel",
        exportCSV: "Export CSV",
        print: "Print Report",
        filter: "Filter",
        reset: "Reset",
        save: "Save Data",
        confirm: "Confirm",
        cancel: "Cancel",
        viewDetails: "View Details",
        edit: "Edit",
        close: "Close",
        search: "Search...",
        
        // Headers & Labels
        workerCode: "Worker Code",
        workerName: "Worker Name",
        mobile: "Mobile",
        nationalId: "National ID",
        factory: "Factory",
        currentFactory: "Current Factory",
        employmentStartDate: "Start Date",
        employmentDuration: "Employment Duration",
        status: "Status",
        custodyStatus: "Custody Status",
        actions: "Actions",
        
        itemCode: "Item Code",
        itemName: "Item Name",
        itemType: "Item Type",
        unit: "Unit",
        minimumStock: "Min Stock",
        availableStock: "Available Stock",
        newStock: "New Stock",
        returnedUsedStock: "Returned Used",
        damagedStock: "Damaged",
        lostStock: "Lost",
        withWorkers: "With Workers",
        lowStockAlert: "Low Stock",
        
        warehouseCode: "Warehouse Code",
        warehouseName: "Warehouse Name",
        location: "Location",
        responsiblePerson: "Responsible Person",
        
        txNumber: "Tx Number",
        txDate: "Date / Time",
        txType: "Tx Type",
        sourceWarehouse: "Source Warehouse",
        destWarehouse: "Dest Warehouse",
        quantity: "Quantity",
        condition: "Condition",
        user: "User",
        notes: "Notes",
        reversalReason: "Reversal Reason",
        
        submissionDate: "Submission Date",
        expectedLeavingDate: "Expected Leaving Date",
        actualLeavingDate: "Actual Leaving Date",
        noticePeriod: "Required Notice Period",
        actualNoticeDays: "Actual Notice Days",
        compliance: "Notice Compliance",
        deductionAmount: "Deduction Amount",
        
        // Metrics
        totalWorkers: "Total Workers",
        activeWorkers: "Active Workers",
        resignedWorkers: "Resignations",
        leftWorkers: "Left Workers",
        lowStockItems: "Low Stock Items",
        unsettledCustodyCount: "Unsettled Custody",
        
        // Confirmations & Messages
        confirmReverseMsg: "Are you sure you want to reverse this transaction? A reversal ledger entry will be recorded and inventory restored. Historical logs are preserved.",
        confirmExitMsg: "Confirm final exit and custody settlement? Worker status will be set to Left.",
        unsettledWarning: "Worker exit cannot be completed before settling all issued custody items.",
        splitMismatchError: "Sum of split conditions must strictly equal the quantity being settled!",
        successSaved: "Saved successfully",
        loginWelcome: "Welcome to Sistym Management",
        loginSubtitle: "Sign in to access custody, warehouses, and worker operations",
        username: "Username",
        password: "Password",
        loginBtn: "Sign In",
        
        // Quick Actions
        quickActions: "Quick Actions",
        workersDistribution: "Workers by Factory",
        recentAlerts: "Recent Alerts"
    }
};

let currentLanguage = localStorage.getItem("sistym_lang") || "ar";

function t(key) {
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
        return translations[currentLanguage][key];
    }
    return translations["ar"][key] || key;
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem("sistym_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    
    // Update all data-i18n attributes
    document.querySelectorAll("[data-i18n]").forEach(elem => {
        const k = elem.getAttribute("data-i18n");
        if (translations[lang][k]) {
            elem.textContent = translations[lang][k];
        }
    });
    
    // Update placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(elem => {
        const k = elem.getAttribute("data-i18n-placeholder");
        if (translations[lang][k]) {
            elem.setAttribute("placeholder", translations[lang][k]);
        }
    });
}
