// Main Application Controller for Sistym
let currentView = "dashboard";
let activeChart = null;

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    // 1. Check saved language & theme
    const savedLang = localStorage.getItem("sistym_lang") || "ar";
    setLanguage(savedLang);
    
    const savedTheme = localStorage.getItem("sistym_theme") || "light";
    setTheme(savedTheme);
    
    // 2. Check Authentication
    const token = getToken();
    const user = getUser();
    if (token && user) {
        showAppView(user);
    } else {
        showAuthView();
    }
    
    setupEventListeners();
}

function setTheme(theme) {
    localStorage.setItem("sistym_theme", theme);
    if (theme === "dark") {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
}

function toggleLanguage() {
    const nextLang = currentLanguage === "ar" ? "en" : "ar";
    setLanguage(nextLang);
    // Re-render current page to refresh dynamic texts
    navigate(currentView);
}

function showAuthView() {
    document.getElementById("auth-container").classList.remove("hidden");
    document.getElementById("app-layout").classList.add("hidden");
}

function showAppView(user) {
    document.getElementById("auth-container").classList.add("hidden");
    document.getElementById("app-layout").classList.remove("hidden");
    
    // Update user display
    const userDisplay = document.getElementById("user-display-name");
    const roleDisplay = document.getElementById("user-role-badge");
    if (userDisplay) userDisplay.textContent = user.full_name || user.username;
    if (roleDisplay) roleDisplay.textContent = user.role;
    
    // Hide Admin-only menu items for non-admins
    if (user.role !== "Administrator") {
        document.querySelectorAll(".admin-only").forEach(el => el.classList.add("hidden"));
    } else {
        document.querySelectorAll(".admin-only").forEach(el => el.classList.remove("hidden"));
    }
    
    updateAlertsBadge();
    navigate("dashboard");
}

function setupEventListeners() {
    // Login form submission
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById("login-username");
            const passwordInput = document.getElementById("login-password");
            const errorAlert = document.getElementById("login-error");
            
            errorAlert.classList.add("hidden");
            try {
                const res = await apiRequest("/auth/login", "POST", {
                    username: usernameInput.value.trim(),
                    password: passwordInput.value
                });
                setToken(res.token);
                setUser(res.user);
                showToast("تم تسجيل الدخول بنجاح");
                showAppView(res.user);
            } catch (err) {
                errorAlert.textContent = err.message;
                errorAlert.classList.remove("hidden");
            }
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            setToken(null);
            setUser(null);
            showAuthView();
            showToast("تم تسجيل الخروج");
        });
    }
    
    // Navigation links
    document.querySelectorAll("[data-nav]").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const target = link.getAttribute("data-nav");
            navigate(target);
            // Mobile close sidebar
            const mobileSidebar = document.getElementById("sidebar");
            if (mobileSidebar && window.innerWidth < 1024) {
                mobileSidebar.classList.add("-translate-x-full");
            }
        });
    });
    
    // Global search input
    const searchInput = document.getElementById("global-search-input");
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener("input", (e) => {
            clearTimeout(debounceTimer);
            const val = e.target.value.trim();
            if (val.length >= 1) {
                debounceTimer = setTimeout(() => executeGlobalSearch(val), 300);
            } else {
                closeGlobalSearchResults();
            }
        });
    }
}

// Navigation Controller
function navigate(viewName) {
    currentView = viewName;
    
    // Update active nav styling
    document.querySelectorAll("[data-nav]").forEach(link => {
        if (link.getAttribute("data-nav") === viewName) {
            link.classList.add("bg-teal-700", "text-white");
            link.classList.remove("text-slate-300", "hover:bg-slate-800");
        } else {
            link.classList.remove("bg-teal-700", "text-white");
            link.classList.add("text-slate-300", "hover:bg-slate-800");
        }
    });
    
    // Set breadcrumb / view title
    const titleEl = document.getElementById("page-title");
    if (titleEl) titleEl.textContent = t(viewName) || viewName;
    
    // Hide all view containers
    document.querySelectorAll(".view-panel").forEach(panel => panel.classList.add("hidden"));
    
    // Show and load selected view
    const activePanel = document.getElementById(`view-${viewName}`);
    if (activePanel) {
        activePanel.classList.remove("hidden");
    }
    
    switch (viewName) {
        case "dashboard":
            loadDashboard();
            break;
        case "workers":
            loadWorkers();
            break;
        case "factories":
            loadFactories();
            break;
        case "custody-items":
            loadCustodyItems();
            break;
        case "warehouses":
            loadWarehouses();
            break;
        case "stock-transactions":
            loadTransactions();
            break;
        case "worker-custody":
            loadWorkerCustody();
            break;
        case "resignations":
            loadResignations();
            break;
        case "reports":
            loadReports();
            break;
        case "alerts":
            loadAlerts();
            break;
        case "users":
            loadUsers();
            break;
        case "audit-log":
            loadAuditLog();
            break;
        case "settings":
            loadSettings();
            break;
    }
}

// ----------------------------------------------------
// DASHBOARD
// ----------------------------------------------------
async function loadDashboard() {
    try {
        const data = await apiRequest("/dashboard/metrics");
        
        // Workers Cards
        document.getElementById("dash-total-workers").textContent = data.workers.total_workers || 0;
        document.getElementById("dash-active-workers").textContent = data.workers.active_workers || 0;
        document.getElementById("dash-resigned-workers").textContent = data.workers.resignation_submitted_workers || 0;
        document.getElementById("dash-left-workers").textContent = data.workers.left_workers || 0;
        
        // Custody Cards
        document.getElementById("dash-total-items").textContent = data.custody.total_items || 0;
        document.getElementById("dash-new-stock").textContent = data.custody.new_stock || 0;
        document.getElementById("dash-returned-stock").textContent = data.custody.returned_used_stock || 0;
        document.getElementById("dash-with-workers").textContent = data.custody.with_workers || 0;
        document.getElementById("dash-damaged-stock").textContent = data.custody.damaged_stock || 0;
        document.getElementById("dash-lost-stock").textContent = data.custody.lost_stock || 0;
        document.getElementById("dash-low-stock").textContent = data.custody.low_stock_items || 0;
        
        // Resignations Cards
        document.getElementById("dash-res-pending").textContent = data.resignations.pending_review || 0;
        document.getElementById("dash-res-completed").textContent = data.resignations.completed_settled || 0;
        document.getElementById("dash-res-non-comp").textContent = data.resignations.non_compliant || 0;
        document.getElementById("dash-res-unsettled").textContent = data.resignations.pending_custody_settlement || 0;
        
        // Chart: Workers by Factory
        renderFactoryChart(data.factory_chart);
        
        // Quick Alerts List
        loadRecentAlertsBanner();
    } catch (err) {
        showToast(err.message, "error");
    }
}

function renderFactoryChart(chartData) {
    const ctx = document.getElementById("factoryChart");
    if (!ctx) return;
    
    if (activeChart) {
        activeChart.destroy();
    }
    
    const labels = chartData.map(d => d.factory_name);
    const activeCounts = chartData.map(d => d.active_count);
    const totalCounts = chartData.map(d => d.total_count);
    
    activeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: currentLanguage === 'ar' ? 'العمال الحاليين (على رأس العمل)' : 'Active Workers',
                    data: activeCounts,
                    backgroundColor: '#0d9488',
                    borderRadius: 6
                },
                {
                    label: currentLanguage === 'ar' ? 'إجمالي السجلات' : 'Total Workers',
                    data: totalCounts,
                    backgroundColor: '#334155',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}

async function loadRecentAlertsBanner() {
    const bannerContainer = document.getElementById("dash-alerts-list");
    if (!bannerContainer) return;
    
    try {
        const res = await apiRequest("/alerts");
        if (res.alerts.length === 0) {
            bannerContainer.innerHTML = `<div class="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">لا توجد تنبيهات عاجلة حالياً - جميع العمليات والمخزون في حالة ممتازة.</div>`;
            return;
        }
        
        bannerContainer.innerHTML = res.alerts.slice(0, 4).map(alert => `
            <div class="flex items-start gap-3 p-3 rounded-lg border ${alert.severity === 'danger' ? 'bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800'}">
                <span class="p-1.5 rounded-full ${alert.severity === 'danger' ? 'bg-red-100 text-red-600 dark:bg-red-900' : 'bg-amber-100 text-amber-600 dark:bg-amber-900'}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </span>
                <div class="flex-1">
                    <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100">${alert.title}</h4>
                    <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5">${alert.message}</p>
                </div>
            </div>
        `).join("");
    } catch {
        bannerContainer.innerHTML = "";
    }
}

async function updateAlertsBadge() {
    try {
        const res = await apiRequest("/alerts");
        const badge = document.getElementById("alerts-badge-count");
        if (badge) {
            if (res.count > 0) {
                badge.textContent = res.count;
                badge.classList.remove("hidden");
            } else {
                badge.classList.add("hidden");
            }
        }
    } catch {}
}

// ----------------------------------------------------
// WORKERS MANAGEMENT
// ----------------------------------------------------
let allWorkersCache = [];

async function loadWorkers() {
    const tbody = document.getElementById("workers-table-body");
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-400">جاري تحميل البيانات...</td></tr>`;
    
    try {
        // Also populate factories dropdown for filter & creation
        const fRes = await apiRequest("/factories");
        populateFactoryDropdowns(fRes.factories);
        
        const res = await apiRequest("/workers");
        allWorkersCache = res.workers;
        renderWorkersTable(allWorkersCache);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-red-500">${err.message}</td></tr>`;
    }
}

function filterWorkers() {
    const search = document.getElementById("worker-search-input").value.toLowerCase().trim();
    const factoryId = document.getElementById("worker-factory-filter").value;
    const statusVal = document.getElementById("worker-status-filter").value;
    
    let filtered = allWorkersCache.filter(w => {
        const matchesSearch = !search || 
            w.name.toLowerCase().includes(search) || 
            w.worker_code.toLowerCase().includes(search) || 
            w.mobile.includes(search);
        const matchesFactory = !factoryId || String(w.current_factory_id) === factoryId;
        const matchesStatus = !statusVal || w.status === statusVal;
        return matchesSearch && matchesFactory && matchesStatus;
    });
    
    renderWorkersTable(filtered);
}

function renderWorkersTable(workers) {
    const tbody = document.getElementById("workers-table-body");
    if (workers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-500">لا توجد بيانات مطابقة</td></tr>`;
        return;
    }
    
    tbody.innerHTML = workers.map(w => {
        let statusBadge = "";
        if (w.status === "Active") {
            statusBadge = `<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">${t('active')}</span>`;
        } else if (w.status === "Resignation Submitted") {
            statusBadge = `<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">${t('resignationSubmitted')}</span>`;
        } else if (w.status === "Left") {
            statusBadge = `<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">${t('left')}</span>`;
        } else {
            statusBadge = `<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">${t('terminated')}</span>`;
        }
        
        let custodyBadge = w.has_unsettled_custody 
            ? `<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">${w.custody_count} قطع عهدة</span>`
            : `<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">مسوى (0)</span>`;
            
        const dur = w.duration;
        const durStr = `${dur.years} سنة و ${dur.months} شهر و ${dur.days} يوم`;
        
        return `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 transition">
                <td class="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-slate-100">${w.worker_code}</td>
                <td class="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">${w.name}</td>
                <td class="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">${w.mobile}</td>
                <td class="px-4 py-3 text-slate-700 dark:text-slate-300">${w.factory_name}</td>
                <td class="px-4 py-3">${statusBadge}</td>
                <td class="px-4 py-3 text-xs text-slate-600 dark:text-slate-400" title="${dur.total_days} يوم إجمالي">${durStr}</td>
                <td class="px-4 py-3">${custodyBadge}</td>
                <td class="px-4 py-3 no-export">
                    <div class="flex items-center gap-1.5 flex-wrap">
                        <button onclick="viewWorkerDetails(${w.id})" class="px-2 py-1 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300" title="تفاصيل وسجل العامل">
                            عرض
                        </button>
                        ${w.status !== 'Left' ? `
                            <button onclick="openIssueCustodyModal(${w.id}, '${w.name}')" class="px-2 py-1 text-xs font-medium rounded bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:hover:bg-teal-900 dark:text-teal-300" title="صرف عهدة">
                                صرف
                            </button>
                            <button onclick="openTransferWorkerModal(${w.id}, '${w.name}', ${w.current_factory_id})" class="px-2 py-1 text-xs font-medium rounded bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900 dark:text-blue-300" title="نقل مصنع">
                                نقل
                            </button>
                            ${w.status !== 'Resignation Submitted' ? `
                                <button onclick="openResignationModal(${w.id}, '${w.name}')" class="px-2 py-1 text-xs font-medium rounded bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:hover:bg-amber-900 dark:text-amber-300" title="تسجيل استقالة">
                                    استقالة
                                </button>
                            ` : ''}
                            <button onclick="openExitSettlementModal(${w.id})" class="px-2 py-1 text-xs font-medium rounded bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/60 dark:hover:bg-red-900 dark:text-red-300" title="تسوية وخروج">
                                خروج
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

function populateFactoryDropdowns(factories) {
    const filterSelect = document.getElementById("worker-factory-filter");
    const modalSelect = document.getElementById("worker-factory-select");
    const transferSelect = document.getElementById("transfer-factory-select");
    
    const optionsHtml = factories.map(f => `<option value="${f.id}">${f.name} (${f.factory_code})</option>`).join("");
    
    if (filterSelect) {
        filterSelect.innerHTML = `<option value="">كل المصانع</option>` + optionsHtml;
    }
    if (modalSelect) {
        modalSelect.innerHTML = optionsHtml;
    }
    if (transferSelect) {
        transferSelect.innerHTML = optionsHtml;
    }
}

// Worker Details Drawer
async function viewWorkerDetails(workerId) {
    try {
        const res = await apiRequest(`/workers/${workerId}`);
        const w = res.worker;
        
        document.getElementById("wd-name").textContent = w.name;
        document.getElementById("wd-code").textContent = w.worker_code;
        document.getElementById("wd-mobile").textContent = w.mobile;
        document.getElementById("wd-national-id").textContent = w.national_id || "غير مسجل";
        document.getElementById("wd-factory").textContent = w.factory_name;
        document.getElementById("wd-start-date").textContent = w.employment_start_date;
        document.getElementById("wd-status").textContent = w.status;
        
        const dur = w.duration;
        document.getElementById("wd-duration").textContent = `${dur.years} سنة، ${dur.months} شهر، ${dur.days} يوم (إجمالي: ${dur.total_days} يوم)`;
        
        // Custody Table
        const custodyBody = document.getElementById("wd-custody-table");
        if (w.custody.length === 0) {
            custodyBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-slate-400">لا توجد عهد مسجلة على العامل حالياً</td></tr>`;
        } else {
            custodyBody.innerHTML = w.custody.map(c => `
                <tr class="border-b border-slate-200 dark:border-slate-800">
                    <td class="py-2 px-3 font-semibold">${c.item_name} (${c.item_code})</td>
                    <td class="py-2 px-3">${c.current_custody} ${c.unit}</td>
                    <td class="py-2 px-3 text-xs">${c.last_condition}</td>
                    <td class="py-2 px-3 text-xs text-slate-500">${c.last_issue_date || '-'}</td>
                    <td class="py-2 px-3 text-xs text-slate-500">${c.source_warehouse_name || '-'}</td>
                </tr>
            `).join("");
        }
        
        // Factory History Timeline
        const historyContainer = document.getElementById("wd-factory-history");
        if (w.factory_history.length === 0) {
            historyContainer.innerHTML = `<div class="text-sm text-slate-400">لا توجد حركات نقل مسجلة للعامل بعد.</div>`;
        } else {
            historyContainer.innerHTML = w.factory_history.map(h => `
                <div class="relative pl-6 pb-4 border-l-2 border-teal-500 last:border-0 dark:border-teal-600">
                    <span class="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-teal-600 ring-4 ring-white dark:ring-slate-900"></span>
                    <div class="text-xs font-semibold text-teal-700 dark:text-teal-400">${h.transfer_date}</div>
                    <div class="text-sm font-medium text-slate-900 dark:text-slate-100">من: ${h.from_factory_name} &larr; إلى: ${h.to_factory_name}</div>
                    ${h.reason ? `<div class="text-xs text-slate-500 mt-0.5">السبب: ${h.reason}</div>` : ''}
                </div>
            `).join("");
        }
        
        // Resignation Box
        const resBox = document.getElementById("wd-resignation-info");
        if (w.resignation) {
            resBox.classList.remove("hidden");
            const r = w.resignation;
            document.getElementById("wd-res-date").textContent = r.submission_date;
            document.getElementById("wd-res-exp").textContent = r.expected_leaving_date;
            document.getElementById("wd-res-act").textContent = r.actual_leaving_date || "لم يغادر بعد";
            document.getElementById("wd-res-days").textContent = `${r.actual_notice_days || 0} يوم`;
            document.getElementById("wd-res-comp").textContent = r.compliance;
            document.getElementById("wd-res-deduct").textContent = `${r.deduction_amount || 0} ج.م`;
        } else {
            resBox.classList.add("hidden");
        }
        
        openModal("modal-worker-details");
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ----------------------------------------------------
// GLOBAL SEARCH
// ----------------------------------------------------
async function executeGlobalSearch(term) {
    const resultsContainer = document.getElementById("global-search-results");
    if (!resultsContainer) return;
    
    try {
        const res = await apiRequest(`/search?q=${encodeURIComponent(term)}`);
        resultsContainer.classList.remove("hidden");
        
        if (res.total_matches === 0) {
            resultsContainer.innerHTML = `<div class="p-4 text-center text-sm text-slate-500">لا توجد نتائج مطابقة لـ "${term}"</div>`;
            return;
        }
        
        let html = `<div class="p-2 space-y-3 max-h-96 overflow-y-auto">`;
        
        // Workers Matches
        if (res.results.workers.length > 0) {
            html += `<div class="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider px-2">العمال (${res.results.workers.length})</div>`;
            res.results.workers.forEach(w => {
                html += `
                    <div onclick="viewWorkerDetails(${w.id}); closeGlobalSearchResults();" class="flex items-center justify-between p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-sm">
                        <div>
                            <span class="font-bold text-slate-900 dark:text-slate-100">${w.name}</span>
                            <span class="text-xs text-slate-500 ml-2">(${w.worker_code})</span>
                        </div>
                        <span class="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700">${w.factory_name}</span>
                    </div>
                `;
            });
        }
        
        // Items Matches
        if (res.results.items.length > 0) {
            html += `<div class="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider px-2 mt-2">أصناف العهد (${res.results.items.length})</div>`;
            res.results.items.forEach(i => {
                html += `
                    <div onclick="navigate('custody-items'); closeGlobalSearchResults();" class="flex items-center justify-between p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-sm">
                        <div>
                            <span class="font-bold text-slate-900 dark:text-slate-100">${i.name}</span>
                            <span class="text-xs text-slate-500 ml-2">(${i.item_code})</span>
                        </div>
                        <span class="text-xs text-slate-500">${i.type}</span>
                    </div>
                `;
            });
        }
        
        // Factories Matches
        if (res.results.factories.length > 0) {
            html += `<div class="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider px-2 mt-2">المصانع (${res.results.factories.length})</div>`;
            res.results.factories.forEach(f => {
                html += `
                    <div onclick="navigate('factories'); closeGlobalSearchResults();" class="flex items-center justify-between p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-sm">
                        <span class="font-bold text-slate-900 dark:text-slate-100">${f.name}</span>
                        <span class="text-xs font-mono text-slate-500">${f.factory_code}</span>
                    </div>
                `;
            });
        }
        
        html += `</div>`;
        resultsContainer.innerHTML = html;
    } catch {
        resultsContainer.classList.add("hidden");
    }
}

function closeGlobalSearchResults() {
    const resultsContainer = document.getElementById("global-search-results");
    if (resultsContainer) resultsContainer.classList.add("hidden");
}

// ----------------------------------------------------
// FACTORIES MANAGEMENT
// ----------------------------------------------------
async function loadFactories() {
    const tbody = document.getElementById("factories-table-body");
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400">جاري تحميل البيانات...</td></tr>`;
    try {
        const res = await apiRequest("/factories");
        if (res.factories.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-500">لا توجد مصانع مسجلة</td></tr>`;
            return;
        }
        tbody.innerHTML = res.factories.map(f => `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <td class="px-4 py-3 font-mono font-semibold">${f.factory_code}</td>
                <td class="px-4 py-3 font-medium">${f.name}</td>
                <td class="px-4 py-3 text-slate-600 dark:text-slate-400">${f.address || '-'}</td>
                <td class="px-4 py-3 font-mono text-xs">${f.phone || '-'}</td>
                <td class="px-4 py-3">${f.responsible_person || '-'}</td>
                <td class="px-4 py-3 font-bold text-teal-700 dark:text-teal-400">${f.active_workers_count} عامل</td>
                <td class="px-4 py-3">
                    <span class="px-2 py-0.5 text-xs font-semibold rounded-full ${f.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-700'}">${f.active ? 'نشط' : 'معطل'}</span>
                </td>
            </tr>
        `).join("");
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-red-500">${err.message}</td></tr>`;
    }
}

// ----------------------------------------------------
// CUSTODY ITEMS CATALOG
// ----------------------------------------------------
async function loadCustodyItems() {
    const tbody = document.getElementById("items-table-body");
    tbody.innerHTML = `<tr><td colspan="11" class="text-center py-8 text-slate-400">جاري تحميل المنتجات وأصناف العهدة...</td></tr>`;
    try {
        const res = await apiRequest("/items");
        if (res.items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="11" class="text-center py-8 text-slate-500 font-medium">لا توجد منتجات أو أصناف عهد مسجلة حالياً. اضغط على زر "إضافة منتج / صنف" بالأعلى لتعريف منتج جديد.</td></tr>`;
            return;
        }
        tbody.innerHTML = res.items.map(i => {
            const itemJson = JSON.stringify(i).replace(/'/g, "&#39;");
            return `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <td class="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-slate-100">${i.item_code}</td>
                    <td class="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">${i.name}</td>
                    <td class="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">${i.type}</td>
                    <td class="px-4 py-3 text-xs">${i.unit}</td>
                    <td class="px-4 py-3 font-bold ${i.is_low_stock ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}">
                        ${i.total_available} ${i.unit}
                        ${i.is_low_stock ? `<span class="mr-1 text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full">منخفض</span>` : ''}
                    </td>
                    <td class="px-4 py-3 text-teal-700 dark:text-teal-400 font-medium">${i.total_new}</td>
                    <td class="px-4 py-3 text-blue-700 dark:text-blue-400 font-medium">${i.total_returned_used}</td>
                    <td class="px-4 py-3 text-purple-700 dark:text-purple-400 font-medium">${i.with_workers}</td>
                    <td class="px-4 py-3 text-xs text-slate-500">${i.total_damaged} تالف / ${i.total_lost} مفقود</td>
                    <td class="px-4 py-3 font-mono text-xs">${i.minimum_stock}</td>
                    <td class="px-4 py-3 no-export">
                        <div class="flex items-center gap-1.5">
                            <button onclick='openEditItemModal(${itemJson})' class="px-2 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300">
                                تعديل
                            </button>
                            <button onclick="confirmDeleteItem(${i.id}, '${i.name}')" class="px-2 py-1 text-xs font-semibold rounded bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300">
                                حذف / إلغاء
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="11" class="text-center py-8 text-red-500">${err.message}</td></tr>`;
    }
}

// ----------------------------------------------------
// WAREHOUSES
// ----------------------------------------------------
async function loadWarehouses() {
    const container = document.getElementById("warehouses-cards-container");
    container.innerHTML = `<div class="col-span-full text-center py-8 text-slate-400">جاري تحميل المخازن...</div>`;
    try {
        const res = await apiRequest("/warehouses");
        if (res.warehouses.length === 0) {
            container.innerHTML = `<div class="col-span-full p-8 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-medium">لا توجد أي مخازن معرفة حالياً. اضغط على زر "إضافة مخزن جديد" للبدء.</div>`;
            return;
        }
        container.innerHTML = res.warehouses.map(w => {
            const whJson = JSON.stringify(w).replace(/'/g, "&#39;");
            return `
                <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition">
                    <div class="flex items-start justify-between">
                        <div>
                            <span class="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">${w.warehouse_code}</span>
                            <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">${w.name}</h3>
                            <p class="text-xs text-slate-500 dark:text-slate-400">${w.location || 'الموقع غير محدد'} | المسؤول: ${w.responsible_person || '-'}</p>
                        </div>
                        <span class="px-2 py-0.5 text-xs rounded-full font-semibold ${w.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-700'}">${w.active ? 'نشط' : 'معطل'}</span>
                    </div>
                    
                    <div class="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 text-center">
                        <div class="bg-teal-50 dark:bg-teal-950/40 p-2 rounded-lg">
                            <div class="text-xs text-teal-700 dark:text-teal-400 font-medium">جديد New</div>
                            <div class="text-lg font-extrabold text-teal-800 dark:text-teal-200">${w.total_new}</div>
                        </div>
                        <div class="bg-blue-50 dark:bg-blue-950/40 p-2 rounded-lg">
                            <div class="text-xs text-blue-700 dark:text-blue-400 font-medium">مستعمل صامد</div>
                            <div class="text-lg font-extrabold text-blue-800 dark:text-blue-200">${w.total_returned_used}</div>
                        </div>
                        <div class="bg-slate-100 dark:bg-slate-700/60 p-2 rounded-lg">
                            <div class="text-xs text-slate-700 dark:text-slate-300 font-medium">إجمالي المتاح</div>
                            <div class="text-lg font-extrabold text-slate-900 dark:text-slate-100">${w.total_available}</div>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                        <span>تالف: ${w.total_damaged} | مفقود: ${w.total_lost}</span>
                        ${w.low_stock_items_count > 0 ? `<span class="text-red-600 font-bold">${w.low_stock_items_count} أصناف منخفضة</span>` : `<span class="text-emerald-600">المخزون كافٍ</span>`}
                    </div>
                    
                    <div class="mt-4 flex gap-2">
                        <button onclick="openStockInModal(${w.id})" class="flex-1 py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition">
                            توريد رصيد جديد
                        </button>
                        <button onclick="openWarehouseTransferModal(${w.id})" class="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition">
                            تحويل لمخزن آخر
                        </button>
                    </div>

                    <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex gap-2">
                        <button onclick='openEditWarehouseModal(${whJson})' class="flex-1 py-1 px-2 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium">
                            تعديل بيانات المخزن
                        </button>
                        <button onclick="confirmDeleteWarehouse(${w.id}, '${w.name}')" class="py-1 px-2 rounded bg-red-50 hover:bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs font-medium">
                            حذف / إلغاء
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    } catch (err) {
        container.innerHTML = `<div class="col-span-full text-center py-8 text-red-500">${err.message}</div>`;
    }
}

// ----------------------------------------------------
// TRANSACTIONS LEDGER (SOURCE OF TRUTH)
// ----------------------------------------------------
async function loadTransactions() {
    const tbody = document.getElementById("tx-table-body");
    tbody.innerHTML = `<tr><td colspan="10" class="text-center py-8 text-slate-400">جاري استرجاع قيود اليومية من دفتر الحركات (Ledger)...</td></tr>`;
    
    try {
        const res = await apiRequest("/transactions");
        if (res.transactions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" class="text-center py-8 text-slate-500">لا توجد حركات مسجلة بالدفتر</td></tr>`;
            return;
        }
        
        tbody.innerHTML = res.transactions.map(tx => {
            let typeBadge = "";
            if (tx.transaction_type === "Stock In") {
                typeBadge = `<span class="px-2 py-0.5 text-xs font-semibold rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">توريد رصيد</span>`;
            } else if (tx.transaction_type === "Issue to Worker") {
                typeBadge = `<span class="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">صرف لعامل</span>`;
            } else if (tx.transaction_type === "Return from Worker") {
                typeBadge = `<span class="px-2 py-0.5 text-xs font-semibold rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">إرجاع من عامل</span>`;
            } else if (tx.transaction_type === "Transfer") {
                typeBadge = `<span class="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">تحويل مخزني</span>`;
            } else if (tx.transaction_type === "Reverse") {
                typeBadge = `<span class="px-2 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">عكس حركة</span>`;
            } else {
                typeBadge = `<span class="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-800">${tx.transaction_type}</span>`;
            }
            
            let statusBadge = tx.status === "Confirmed"
                ? `<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">معتمد</span>`
                : `<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">تم عكسها</span>`;
                
            return `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <td class="px-3 py-2.5 font-mono text-xs font-bold">${tx.transaction_number}</td>
                    <td class="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">${tx.transaction_date}</td>
                    <td class="px-3 py-2.5">${typeBadge}</td>
                    <td class="px-3 py-2.5 font-medium">${tx.item_name}</td>
                    <td class="px-3 py-2.5 font-extrabold">${tx.quantity} ${tx.unit}</td>
                    <td class="px-3 py-2.5 text-xs">${tx.stock_condition}</td>
                    <td class="px-3 py-2.5 text-xs text-slate-600 dark:text-slate-400">
                        ${tx.source_warehouse_name ? `من: ${tx.source_warehouse_name}` : ''}
                        ${tx.destination_warehouse_name ? ` إلى: ${tx.destination_warehouse_name}` : ''}
                        ${tx.worker_name ? ` عامل: ${tx.worker_name}` : ''}
                    </td>
                    <td class="px-3 py-2.5">${statusBadge}</td>
                    <td class="px-3 py-2.5 text-xs text-slate-500">${tx.user_full_name || tx.username || '-'}</td>
                    <td class="px-3 py-2.5 no-export">
                        ${tx.status === 'Confirmed' && tx.transaction_type !== 'Reverse' ? `
                            <button onclick="openReverseTxModal(${tx.id}, '${tx.transaction_number}', '${tx.item_name}', ${tx.quantity})" class="px-2 py-1 text-xs font-semibold rounded bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/60 dark:hover:bg-red-900 dark:text-red-300 transition">
                                عكس الحركة
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join("");
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center py-8 text-red-500">${err.message}</td></tr>`;
    }
}

// ----------------------------------------------------
// RESIGNATIONS
// ----------------------------------------------------
async function loadResignations() {
    const tbody = document.getElementById("resignations-table-body");
    tbody.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-slate-400">جاري تحميل الاستقالات...</td></tr>`;
    
    try {
        const res = await apiRequest("/resignations");
        if (res.resignations.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-slate-500">لا توجد استقالات مسجلة</td></tr>`;
            return;
        }
        
        tbody.innerHTML = res.resignations.map(r => {
            let compBadge = r.compliance === "Compliant"
                ? `<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">ملتزم (${r.actual_notice_days} يوم)</span>`
                : `<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">غير ملتزم (${r.actual_notice_days} يوم)</span>`;
                
            let settleBadge = r.unsettled_custody_count === 0
                ? `<span class="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800">مسوى بالكامل</span>`
                : `<span class="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-bold">${r.unsettled_custody_count} قطع عهدة معلقة</span>`;
                
            return `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <td class="px-4 py-3 font-semibold">${r.worker_name} <span class="text-xs text-slate-400">(${r.worker_code})</span></td>
                    <td class="px-4 py-3">${r.factory_name}</td>
                    <td class="px-4 py-3 text-xs font-mono">${r.submission_date}</td>
                    <td class="px-4 py-3 text-xs font-mono">${r.expected_leaving_date}</td>
                    <td class="px-4 py-3 text-xs font-mono">${r.actual_leaving_date || 'قيد الانتظار'}</td>
                    <td class="px-4 py-3">${compBadge}</td>
                    <td class="px-4 py-3 font-bold text-red-600">${r.deduction_amount || 0} ج.م</td>
                    <td class="px-4 py-3">${settleBadge}</td>
                    <td class="px-4 py-3 no-export">
                        ${r.status !== 'Settled' ? `
                            <button onclick="openExitSettlementModal(${r.worker_id})" class="px-2.5 py-1 text-xs font-bold rounded bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition">
                                تسوية وخروج
                            </button>
                        ` : '<span class="text-xs text-slate-400">منتهي</span>'}
                    </td>
                </tr>
            `;
        }).join("");
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-red-500">${err.message}</td></tr>`;
    }
}

// ----------------------------------------------------
// WORKER CUSTODY LIST
// ----------------------------------------------------
async function loadWorkerCustody() {
    const tbody = document.getElementById("worker-custody-table-body");
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-400">جاري تحميل بيانات العهد من الـ Ledger...</td></tr>`;
    try {
        const res = await apiRequest("/reports/worker-custody");
        if (res.rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-500">لا توجد أي عهد مع العمال حالياً (جميع العهد مسواة)</td></tr>`;
            return;
        }
        tbody.innerHTML = res.rows.map(row => `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <td class="px-4 py-3 font-mono text-xs font-semibold">${row.worker_code}</td>
                <td class="px-4 py-3 font-medium">${row.worker_name}</td>
                <td class="px-4 py-3">${row.factory_name}</td>
                <td class="px-4 py-3 font-semibold text-teal-700 dark:text-teal-400">${row.item_name} (${row.item_code})</td>
                <td class="px-4 py-3 font-extrabold text-slate-900 dark:text-slate-100">${row.current_custody} ${row.unit}</td>
                <td class="px-4 py-3 text-xs">${row.last_condition}</td>
                <td class="px-4 py-3 text-xs text-slate-500">${row.last_issue_date || '-'}</td>
                <td class="px-4 py-3 text-xs text-slate-500">${row.warehouse_name || '-'}</td>
            </tr>
        `).join("");
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-red-500">${err.message}</td></tr>`;
    }
}

// ----------------------------------------------------
// REPORTS ENGINE
// ----------------------------------------------------
let currentReportData = [];
let currentReportName = "Report";

async function loadReports(reportType = "workers") {
    const container = document.getElementById("report-output-container");
    container.innerHTML = `<div class="text-center py-12 text-slate-400">جاري توليد التقرير والتحقق من الحركات...</div>`;
    
    let endpoint = "";
    if (reportType === "workers") endpoint = "/reports/workers";
    else if (reportType === "workers-by-factory") endpoint = "/reports/workers-by-factory";
    else if (reportType === "resignations") endpoint = "/reports/resignations";
    else if (reportType === "worker-custody") endpoint = "/reports/worker-custody";
    else if (reportType === "unsettled-custody") endpoint = "/reports/unsettled-custody";
    else if (reportType === "new-stock") endpoint = "/reports/stock-inventory?condition_type=New";
    else if (reportType === "returned-stock") endpoint = "/reports/stock-inventory?condition_type=Returned+Used";
    else if (reportType === "damaged-lost") endpoint = "/reports/damaged-lost";
    
    currentReportName = reportType;
    
    try {
        const res = await apiRequest(endpoint);
        currentReportData = res.rows || [];
        renderReportTable(currentReportData, reportType);
    } catch (err) {
        container.innerHTML = `<div class="text-center py-12 text-red-500">${err.message}</div>`;
    }
}

function renderReportTable(rows, type) {
    const container = document.getElementById("report-output-container");
    if (!rows || rows.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">لا توجد بيانات متاحة لهذا التقرير</div>`;
        return;
    }
    
    const headers = Object.keys(rows[0]).filter(k => !k.endsWith("_id"));
    
    let tableHtml = `
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
            <table id="printable-report-table" class="w-full text-sm text-right">
                <thead class="bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        ${headers.map(h => `<th class="px-4 py-3">${h}</th>`).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(row => `
                        <tr class="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            ${headers.map(h => `<td class="px-4 py-2.5 text-slate-800 dark:text-slate-200">${row[h] !== null && row[h] !== undefined ? row[h] : '-'}</td>`).join("")}
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
    container.innerHTML = tableHtml;
}

function exportCurrentReportExcel() {
    exportDataToExcel(`Sistym_Report_${currentReportName}_${new Date().toISOString().slice(0,10)}`, currentReportName, currentReportData);
}

function exportCurrentReportCSV() {
    exportDataToExcel(`Sistym_Report_${currentReportName}_${new Date().toISOString().slice(0,10)}.csv`, currentReportName, currentReportData);
}

function printCurrentReport() {
    window.print();
}

// ----------------------------------------------------
// ALERTS
// ----------------------------------------------------
async function loadAlerts() {
    const list = document.getElementById("alerts-full-list");
    list.innerHTML = `<div class="text-center py-8 text-slate-400">جاري فحص المنظومة...</div>`;
    try {
        const res = await apiRequest("/alerts");
        if (res.alerts.length === 0) {
            list.innerHTML = `<div class="p-8 text-center text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900 font-medium">لا توجد تنبيهات نشطة حالياً. جميع العهد والمخازن والاستقالات في حالة طبيعية.</div>`;
            return;
        }
        list.innerHTML = res.alerts.map(a => `
            <div class="p-4 rounded-xl border ${a.severity === 'danger' ? 'bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800'} flex items-start gap-4 shadow-sm">
                <span class="p-2 rounded-full ${a.severity === 'danger' ? 'bg-red-100 text-red-600 dark:bg-red-900' : 'bg-amber-100 text-amber-600 dark:bg-amber-900'}">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </span>
                <div class="flex-1">
                    <div class="flex items-center justify-between">
                        <h4 class="text-base font-bold text-slate-900 dark:text-slate-100">${a.title}</h4>
                        <span class="text-xs text-slate-500">${a.date}</span>
                    </div>
                    <p class="text-sm text-slate-700 dark:text-slate-300 mt-1">${a.message}</p>
                </div>
            </div>
        `).join("");
    } catch (err) {
        list.innerHTML = `<div class="text-center py-8 text-red-500">${err.message}</div>`;
    }
}

// ----------------------------------------------------
// USERS & ROLES
// ----------------------------------------------------
async function loadUsers() {
    const tbody = document.getElementById("users-table-body");
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400">جاري تحميل المستخدمين...</td></tr>`;
    try {
        const res = await apiRequest("/users");
        tbody.innerHTML = res.users.map(u => `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <td class="px-4 py-3 font-bold">${u.username}</td>
                <td class="px-4 py-3 font-medium">${u.full_name}</td>
                <td class="px-4 py-3"><span class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">${u.role_name}</span></td>
                <td class="px-4 py-3 text-xs">${u.language === 'ar' ? 'العربية' : 'English'}</td>
                <td class="px-4 py-3 text-xs">${u.theme}</td>
                <td class="px-4 py-3"><span class="px-2 py-0.5 text-xs font-semibold rounded-full ${u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">${u.active ? 'نشط' : 'معطل'}</span></td>
                <td class="px-4 py-3 text-xs text-slate-500">${u.created_at}</td>
            </tr>
        `).join("");
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-red-500">${err.message}</td></tr>`;
    }
}

// ----------------------------------------------------
// AUDIT LOG
// ----------------------------------------------------
async function loadAuditLog() {
    const tbody = document.getElementById("audit-table-body");
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400">جاري استرجاع سجل التدقيق والرقابة...</td></tr>`;
    try {
        const res = await apiRequest("/audit-logs");
        if (res.audit_logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-500">لا توجد عمليات مسجلة</td></tr>`;
            return;
        }
        tbody.innerHTML = res.audit_logs.map(log => `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <td class="px-3 py-2 text-xs font-mono text-slate-500">${log.created_at}</td>
                <td class="px-3 py-2 text-xs font-bold text-teal-700 dark:text-teal-400">${log.username || 'System'}</td>
                <td class="px-3 py-2"><span class="px-2 py-0.5 text-xs font-bold rounded bg-slate-100 dark:bg-slate-700">${log.action}</span></td>
                <td class="px-3 py-2 text-xs font-medium">${log.module}</td>
                <td class="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">${log.reason || '-'}</td>
                <td class="px-3 py-2 font-mono text-xs max-w-xs truncate text-slate-500" title="${log.old_value || ''}">${log.old_value || '-'}</td>
                <td class="px-3 py-2 font-mono text-xs max-w-xs truncate text-teal-600 dark:text-teal-400" title="${log.new_value || ''}">${log.new_value || '-'}</td>
            </tr>
        `).join("");
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-red-500">${err.message}</td></tr>`;
    }
}

// ----------------------------------------------------
// SETTINGS
// ----------------------------------------------------
async function loadSettings() {
    try {
        const res = await apiRequest("/settings");
        const s = res.settings;
        if (s.notice_period_days) document.getElementById("setting-notice-period").value = s.notice_period_days.value;
        if (s.organization_name) document.getElementById("setting-org-name").value = s.organization_name.value;
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function saveSettings(e) {
    e.preventDefault();
    const noticeDays = document.getElementById("setting-notice-period").value;
    const orgName = document.getElementById("setting-org-name").value;
    try {
        await apiRequest("/settings", "PUT", {
            notice_period_days: noticeDays,
            organization_name: orgName
        });
        showToast("تم حفظ إعدادات النظام بنجاح");
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ----------------------------------------------------
// MODALS CONTROLLERS
// ----------------------------------------------------
function openModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove("hidden");
}

function closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.add("hidden");
}

// 1. Add Worker Modal
function openAddWorkerModal() {
    document.getElementById("form-add-worker").reset();
    document.getElementById("worker-start-date-input").value = new Date().toISOString().slice(0, 10);
    openModal("modal-add-worker");
}

async function submitAddWorker(e) {
    e.preventDefault();
    const payload = {
        worker_code: document.getElementById("worker-code-input").value.trim(),
        name: document.getElementById("worker-name-input").value.trim(),
        mobile: document.getElementById("worker-mobile-input").value.trim(),
        national_id: document.getElementById("worker-national-input").value.trim() || null,
        current_factory_id: parseInt(document.getElementById("worker-factory-select").value),
        employment_start_date: document.getElementById("worker-start-date-input").value
    };
    try {
        await apiRequest("/workers", "POST", payload);
        closeModal("modal-add-worker");
        showToast("تمت إضافة العامل بنجاح");
        loadWorkers();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// 2. Transfer Worker Modal
function openTransferWorkerModal(workerId, workerName, currentFactoryId) {
    document.getElementById("transfer-worker-id").value = workerId;
    document.getElementById("transfer-worker-name").textContent = workerName;
    document.getElementById("transfer-date-input").value = new Date().toISOString().slice(0, 10);
    
    // Select a different factory as default
    const select = document.getElementById("transfer-factory-select");
    for (let opt of select.options) {
        if (parseInt(opt.value) !== currentFactoryId) {
            opt.selected = true;
            break;
        }
    }
    openModal("modal-transfer-worker");
}

async function submitTransferWorker(e) {
    e.preventDefault();
    const workerId = document.getElementById("transfer-worker-id").value;
    const toFactoryId = parseInt(document.getElementById("transfer-factory-select").value);
    const dateVal = document.getElementById("transfer-date-input").value;
    const reason = document.getElementById("transfer-reason-input").value.trim();
    
    try {
        await apiRequest(`/workers/${workerId}/transfer`, "POST", {
            to_factory_id: toFactoryId,
            transfer_date: dateVal,
            reason: reason
        });
        closeModal("modal-transfer-worker");
        showToast("تم نقل العامل بنجاح وتحديث تاريخه الوظيفي");
        loadWorkers();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// 3. Register Resignation Modal
function openResignationModal(workerId, workerName) {
    document.getElementById("resignation-worker-id").value = workerId;
    document.getElementById("resignation-worker-name").textContent = workerName;
    
    const today = new Date();
    const submissionStr = today.toISOString().slice(0, 10);
    
    // Default expected leaving date is 15 days later (compliance rule)
    const expectedDate = new Date();
    expectedDate.setDate(today.getDate() + 15);
    const expectedStr = expectedDate.toISOString().slice(0, 10);
    
    document.getElementById("resignation-sub-date").value = submissionStr;
    document.getElementById("resignation-exp-date").value = expectedStr;
    document.getElementById("resignation-deduction").value = "0";
    document.getElementById("resignation-notes").value = "";
    
    updateResignationCompliancePreview();
    openModal("modal-resignation");
}

function updateResignationCompliancePreview() {
    const subStr = document.getElementById("resignation-sub-date").value;
    const expStr = document.getElementById("resignation-exp-date").value;
    const badge = document.getElementById("resignation-compliance-badge");
    
    if (subStr && expStr) {
        const sub = new Date(subStr);
        const exp = new Date(expStr);
        const days = Math.round((exp - sub) / (1000 * 60 * 60 * 24));
        if (days >= 15) {
            badge.textContent = `ملتزم بفترة الإخطار (${days} يوم >= 15 يوم)`;
            badge.className = "text-xs font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
        } else {
            badge.textContent = `غير ملتزم بفترة الإخطار (${days} يوم < 15 يوم)`;
            badge.className = "text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
        }
    }
}

async function submitResignation(e) {
    e.preventDefault();
    const workerId = parseInt(document.getElementById("resignation-worker-id").value);
    const subDate = document.getElementById("resignation-sub-date").value;
    const expDate = document.getElementById("resignation-exp-date").value;
    const deduction = parseFloat(document.getElementById("resignation-deduction").value) || 0;
    const notes = document.getElementById("resignation-notes").value.trim();
    
    try {
        await apiRequest("/resignations", "POST", {
            worker_id: workerId,
            submission_date: subDate,
            expected_leaving_date: expDate,
            deduction_amount: deduction,
            notes: notes
        });
        closeModal("modal-resignation");
        showToast("تم تسجيل الاستقالة بنجاح");
        loadWorkers();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// 4. Issue Custody Modal
async function openIssueCustodyModal(workerId = null, workerName = "") {
    // Populate Workers, Warehouses, Items
    const [wRes, whRes, iRes] = await Promise.all([
        apiRequest("/workers"),
        apiRequest("/warehouses"),
        apiRequest("/items")
    ]);
    
    const workerSelect = document.getElementById("issue-worker-select");
    const activeWorkers = wRes.workers.filter(w => w.status !== 'Left');
    workerSelect.innerHTML = activeWorkers.map(w => `<option value="${w.id}" ${w.id === workerId ? 'selected' : ''}>${w.name} (${w.worker_code})</option>`).join("");
    
    const whSelect = document.getElementById("issue-warehouse-select");
    whSelect.innerHTML = whRes.warehouses.map(wh => `<option value="${wh.id}">${wh.name} (${wh.warehouse_code})</option>`).join("");
    
    const itemSelect = document.getElementById("issue-item-select");
    itemSelect.innerHTML = iRes.items.map(i => `<option value="${i.id}">${i.name} (${i.item_code})</option>`).join("");
    
    document.getElementById("issue-date-input").value = new Date().toISOString().slice(0, 10);
    document.getElementById("issue-qty-input").value = "1";
    document.getElementById("issue-notes-input").value = "";
    
    updateIssueStockAvailability();
    openModal("modal-issue-custody");
}

async function updateIssueStockAvailability() {
    const whId = document.getElementById("issue-warehouse-select").value;
    const itemId = document.getElementById("issue-item-select").value;
    const cond = document.getElementById("issue-condition-select").value;
    const availText = document.getElementById("issue-available-stock-text");
    
    if (!whId || !itemId) return;
    try {
        const res = await apiRequest(`/warehouses/${whId}`);
        const inv = res.warehouse.inventory.find(i => String(i.item_id) === String(itemId));
        if (inv) {
            const avail = cond === "New" ? inv.new_stock : inv.returned_used_stock;
            const condName = cond === "New" ? "الجديد" : "المرتجع المستعمل الصالح";
            availText.textContent = `الرصيد المتاح من ${condName}: (${avail} ${inv.unit})`;
            if (avail === 0) {
                availText.className = "text-xs font-bold text-red-600";
            } else {
                availText.className = "text-xs font-semibold text-teal-600 dark:text-teal-400";
            }
        }
    } catch {}
}

async function submitIssueCustody(e) {
    e.preventDefault();
    const payload = {
        worker_id: parseInt(document.getElementById("issue-worker-select").value),
        warehouse_id: parseInt(document.getElementById("issue-warehouse-select").value),
        item_id: parseInt(document.getElementById("issue-item-select").value),
        quantity: parseInt(document.getElementById("issue-qty-input").value),
        source_condition: document.getElementById("issue-condition-select").value,
        issue_date: document.getElementById("issue-date-input").value,
        notes: document.getElementById("issue-notes-input").value.trim() || null
    };
    
    try {
        await apiRequest("/transactions/issue", "POST", payload);
        closeModal("modal-issue-custody");
        showToast("تم صرف العهدة للعامل بنجاح وتحديث دفتر الحركات");
        if (currentView === "workers") loadWorkers();
        else if (currentView === "stock-transactions") loadTransactions();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// 5. Worker Exit & Settlement Wizard (The Critical Flow)
async function openExitSettlementModal(workerId) {
    try {
        const [previewRes, whRes] = await Promise.all([
            apiRequest(`/exit/${workerId}/settlement-preview`),
            apiRequest("/warehouses")
        ]);
        
        const w = previewRes.preview;
        document.getElementById("exit-worker-id").value = w.id;
        document.getElementById("exit-worker-name").textContent = w.name;
        document.getElementById("exit-worker-code").textContent = w.worker_code;
        document.getElementById("exit-actual-date").value = new Date().toISOString().slice(0, 10);
        
        // Populate receiving warehouse (defaulting to source warehouse or first warehouse)
        const whSelect = document.getElementById("exit-dest-warehouse");
        whSelect.innerHTML = whRes.warehouses.map(wh => `<option value="${wh.id}">${wh.name} (${wh.warehouse_code})</option>`).join("");
        
        const settlementContainer = document.getElementById("exit-settlement-items-container");
        const exitWarning = document.getElementById("exit-unsettled-warning");
        
        if (w.total_custody_quantity === 0) {
            settlementContainer.innerHTML = `<div class="p-4 text-center text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-sm font-bold">العامل ليس لديه أي عهد معلقة (رصيد العهدة 0). جاهز لإنهاء الخدمة فوراً.</div>`;
            exitWarning.classList.add("hidden");
        } else {
            exitWarning.classList.remove("hidden");
            exitWarning.textContent = `تنبيه حرج: العامل لديه (${w.total_custody_quantity}) قطع عهدة. يجب تقسيمها وتسويتها بالكامل لإتمام الخروج.`;
            
            settlementContainer.innerHTML = w.custody.filter(c => c.current_custody > 0).map((item, idx) => `
                <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 mb-3" data-settle-item="${item.item_id}" data-total-needed="${item.current_custody}">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-bold text-slate-900 dark:text-slate-100">${item.item_name} (${item.item_code})</span>
                        <span class="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold rounded">عهدة مع العامل: ${item.current_custody} ${item.unit}</span>
                    </div>
                    
                    <div class="grid grid-cols-4 gap-2 text-center text-xs">
                        <div>
                            <label class="block font-medium text-emerald-700 dark:text-emerald-400 mb-1">مرتجع مستعمل (سليم)</label>
                            <input type="number" min="0" max="${item.current_custody}" value="${item.current_custody}" oninput="validateSettlementRow(this)" class="settle-used w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-center font-bold" />
                        </div>
                        <div>
                            <label class="block font-medium text-amber-700 dark:text-amber-400 mb-1">تالف (Damaged)</label>
                            <input type="number" min="0" max="${item.current_custody}" value="0" oninput="validateSettlementRow(this)" class="settle-damaged w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-center font-bold" />
                        </div>
                        <div>
                            <label class="block font-medium text-red-700 dark:text-red-400 mb-1">مفقود (Lost)</label>
                            <input type="number" min="0" max="${item.current_custody}" value="0" oninput="validateSettlementRow(this)" class="settle-lost w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-center font-bold" />
                        </div>
                        <div>
                            <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">غير مرتجع (Not Returned)</label>
                            <input type="number" min="0" max="${item.current_custody}" value="0" oninput="validateSettlementRow(this)" class="settle-not-returned w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-center font-bold" title="سيتحول تلقائياً إلى مفقود نهائي" />
                        </div>
                    </div>
                    <div class="row-status text-xs font-semibold text-emerald-600 mt-2 text-left">مجموع التقسيم مطابق (${item.current_custody} من ${item.current_custody})</div>
                </div>
            `).join("");
        }
        
        openModal("modal-worker-exit");
    } catch (err) {
        showToast(err.message, "error");
    }
}

function validateSettlementRow(inputEl) {
    const row = inputEl.closest("[data-settle-item]");
    const needed = parseInt(row.getAttribute("data-total-needed"));
    
    const used = parseInt(row.querySelector(".settle-used").value) || 0;
    const damaged = parseInt(row.querySelector(".settle-damaged").value) || 0;
    const lost = parseInt(row.querySelector(".settle-lost").value) || 0;
    const notRet = parseInt(row.querySelector(".settle-not-returned").value) || 0;
    
    const currentSum = used + damaged + lost + notRet;
    const statusEl = row.querySelector(".row-status");
    
    if (currentSum === needed) {
        statusEl.textContent = `مجموع التقسيم مطابق (${currentSum} من ${needed})`;
        statusEl.className = "row-status text-xs font-semibold text-emerald-600 mt-2 text-left";
    } else {
        statusEl.textContent = `خطأ: مجموع التقسيم (${currentSum}) لا يساوي العهدة المطلوبة (${needed})!`;
        statusEl.className = "row-status text-xs font-semibold text-red-600 mt-2 text-left";
    }
}

async function submitWorkerExit(e) {
    e.preventDefault();
    const workerId = parseInt(document.getElementById("exit-worker-id").value);
    const actualDate = document.getElementById("exit-actual-date").value;
    const destWarehouseId = parseInt(document.getElementById("exit-dest-warehouse").value);
    const notes = document.getElementById("exit-notes").value.trim();
    
    // Collect settlement items
    const rows = document.querySelectorAll("[data-settle-item]");
    const settlementItems = [];
    
    for (let r of rows) {
        const itemId = parseInt(r.getAttribute("data-settle-item"));
        const needed = parseInt(r.getAttribute("data-total-needed"));
        
        const used = parseInt(r.querySelector(".settle-used").value) || 0;
        const damaged = parseInt(r.querySelector(".settle-damaged").value) || 0;
        const lost = parseInt(r.querySelector(".settle-lost").value) || 0;
        const notRet = parseInt(r.querySelector(".settle-not-returned").value) || 0;
        
        if (used + damaged + lost + notRet !== needed) {
            showToast(`يوجد خطأ في تقسيم صنف العهدة! يجب أن يساوي إجمالي التقسيم (${needed}) بالضبط.`, "error");
            return;
        }
        
        settlementItems.push({
            item_id: itemId,
            quantity_being_settled: needed,
            returned_used_qty: used,
            damaged_qty: damaged,
            lost_qty: lost,
            not_returned_qty: notRet
        });
    }
    
    try {
        await apiRequest("/exit/confirm", "POST", {
            worker_id: workerId,
            actual_leaving_date: actualDate,
            destination_warehouse_id: destWarehouseId,
            settlement_items: settlementItems,
            notes: notes
        });
        closeModal("modal-worker-exit");
        showToast("تمت تسوية جميع العهد وإنهاء خدمة العامل بنجاح");
        if (currentView === "workers") loadWorkers();
        else if (currentView === "resignations") loadResignations();
        else loadDashboard();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// 6. Stock In (Add Stock) Modal
async function openStockInModal(warehouseId = null) {
    const [whRes, iRes] = await Promise.all([
        apiRequest("/warehouses"),
        apiRequest("/items")
    ]);
    
    const whSelect = document.getElementById("stockin-warehouse-select");
    whSelect.innerHTML = whRes.warehouses.map(wh => `<option value="${wh.id}" ${wh.id === warehouseId ? 'selected' : ''}>${wh.name} (${wh.warehouse_code})</option>`).join("");
    
    const itemSelect = document.getElementById("stockin-item-select");
    itemSelect.innerHTML = iRes.items.map(i => `<option value="${i.id}">${i.name} (${i.item_code})</option>`).join("");
    
    document.getElementById("stockin-date").value = new Date().toISOString().slice(0, 10);
    document.getElementById("stockin-quantity").value = "10";
    document.getElementById("stockin-supplier").value = "";
    document.getElementById("stockin-docno").value = "";
    document.getElementById("stockin-notes").value = "";
    
    openModal("modal-stock-in");
}

async function submitStockIn(e) {
    e.preventDefault();
    const payload = {
        warehouse_id: parseInt(document.getElementById("stockin-warehouse-select").value),
        item_id: parseInt(document.getElementById("stockin-item-select").value),
        quantity: parseInt(document.getElementById("stockin-quantity").value),
        date_str: document.getElementById("stockin-date").value,
        supplier: document.getElementById("stockin-supplier").value.trim() || null,
        document_number: document.getElementById("stockin-docno").value.trim() || null,
        notes: document.getElementById("stockin-notes").value.trim() || null
    };
    
    try {
        await apiRequest("/transactions/stock-in", "POST", payload);
        closeModal("modal-stock-in");
        showToast("تم توريد الرصيد الجديد إلى المخزن بنجاح");
        if (currentView === "warehouses") loadWarehouses();
        else if (currentView === "custody-items") loadCustodyItems();
        else if (currentView === "stock-transactions") loadTransactions();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// 7. Warehouse Transfer Modal
async function openWarehouseTransferModal(fromWarehouseId = null) {
    const [whRes, iRes] = await Promise.all([
        apiRequest("/warehouses"),
        apiRequest("/items")
    ]);
    
    const fromSelect = document.getElementById("transfer-from-wh");
    const toSelect = document.getElementById("transfer-to-wh");
    
    fromSelect.innerHTML = whRes.warehouses.map(wh => `<option value="${wh.id}" ${wh.id === fromWarehouseId ? 'selected' : ''}>${wh.name}</option>`).join("");
    toSelect.innerHTML = whRes.warehouses.map(wh => `<option value="${wh.id}" ${wh.id !== fromWarehouseId ? 'selected' : ''}>${wh.name}</option>`).join("");
    
    const itemSelect = document.getElementById("transfer-item-select");
    itemSelect.innerHTML = iRes.items.map(i => `<option value="${i.id}">${i.name} (${i.item_code})</option>`).join("");
    
    document.getElementById("transfer-wh-date").value = new Date().toISOString().slice(0, 10);
    document.getElementById("transfer-wh-quantity").value = "1";
    document.getElementById("transfer-wh-notes").value = "";
    
    openModal("modal-warehouse-transfer");
}

async function submitWarehouseTransfer(e) {
    e.preventDefault();
    const payload = {
        from_warehouse_id: parseInt(document.getElementById("transfer-from-wh").value),
        to_warehouse_id: parseInt(document.getElementById("transfer-to-wh").value),
        item_id: parseInt(document.getElementById("transfer-item-select").value),
        quantity: parseInt(document.getElementById("transfer-wh-quantity").value),
        stock_condition: document.getElementById("transfer-condition-select").value,
        transfer_date: document.getElementById("transfer-wh-date").value,
        notes: document.getElementById("transfer-wh-notes").value.trim() || null
    };
    
    try {
        await apiRequest("/transactions/transfer", "POST", payload);
        closeModal("modal-warehouse-transfer");
        showToast("تم تحويل الرصيد بين المخازن بنجاح");
        if (currentView === "warehouses") loadWarehouses();
        else if (currentView === "stock-transactions") loadTransactions();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// 8. Reverse Transaction Modal
function openReverseTxModal(txId, txNumber, itemName, quantity) {
    document.getElementById("reverse-tx-id").value = txId;
    document.getElementById("reverse-tx-number").textContent = txNumber;
    document.getElementById("reverse-tx-item").textContent = itemName;
    document.getElementById("reverse-tx-qty").textContent = quantity;
    document.getElementById("reverse-reason-input").value = "";
    openModal("modal-reverse-tx");
}

async function submitReverseTx(e) {
    e.preventDefault();
    const txId = parseInt(document.getElementById("reverse-tx-id").value);
    const reason = document.getElementById("reverse-reason-input").value.trim();
    if (!reason) {
        showToast("يجب كتابة سبب العكس للمتابعة", "error");
        return;
    }
    
    try {
        await apiRequest("/transactions/reverse", "POST", {
            original_tx_id: txId,
            reason: reason
        });
        closeModal("modal-reverse-tx");
        showToast("تم عكس الحركة بنجاح وإعادة تسوية الرصيد في الـ Ledger");
        loadTransactions();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// 9. Add Factory Modal
function openAddFactoryModal() {
    document.getElementById("form-add-factory").reset();
    openModal("modal-add-factory");
}

async function submitAddFactory(e) {
    e.preventDefault();
    const payload = {
        factory_code: document.getElementById("factory-code-input").value.trim(),
        name: document.getElementById("factory-name-input").value.trim(),
        address: document.getElementById("factory-address-input").value.trim() || null,
        phone: document.getElementById("factory-phone-input").value.trim() || null,
        responsible_person: document.getElementById("factory-resp-input").value.trim() || null
    };
    try {
        await apiRequest("/factories", "POST", payload);
        closeModal("modal-add-factory");
        showToast("تمت إضافة المصنع بنجاح");
        loadFactories();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// 10. Add Item Modal
function openAddItemModal() {
    document.getElementById("form-add-item").reset();
    openModal("modal-add-item");
}

async function submitAddItem(e) {
    e.preventDefault();
    const payload = {
        item_code: document.getElementById("item-code-input").value.trim(),
        name: document.getElementById("item-name-input").value.trim(),
        type: document.getElementById("item-type-select").value,
        unit: document.getElementById("item-unit-input").value.trim(),
        minimum_stock: parseInt(document.getElementById("item-min-stock-input").value) || 10
    };
    try {
        await apiRequest("/items", "POST", payload);
        closeModal("modal-add-item");
        showToast("تم تعريف صنف العهدة بنجاح");
        loadCustodyItems();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// 11. Add Warehouse Modal
function openAddWarehouseModal() {
    document.getElementById("form-add-warehouse").reset();
    openModal("modal-add-warehouse");
}

async function submitAddWarehouse(e) {
    e.preventDefault();
    const payload = {
        warehouse_code: document.getElementById("wh-code-input").value.trim(),
        name: document.getElementById("wh-name-input").value.trim(),
        location: document.getElementById("wh-location-input").value.trim() || null,
        responsible_person: document.getElementById("wh-resp-input").value.trim() || null
    };
    try {
        await apiRequest("/warehouses", "POST", payload);
        closeModal("modal-add-warehouse");
        showToast("تمت إضافة المخزن بنجاح");
        loadWarehouses();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// 12. Edit Item Modal
function openEditItemModal(item) {
    document.getElementById("edit-item-id").value = item.id;
    document.getElementById("edit-item-code-input").value = item.item_code;
    document.getElementById("edit-item-name-input").value = item.name;
    document.getElementById("edit-item-type-select").value = item.type || "Safety Gear";
    document.getElementById("edit-item-unit-input").value = item.unit || "Piece";
    document.getElementById("edit-item-min-stock-input").value = item.minimum_stock || 10;
    openModal("modal-edit-item");
}

async function submitEditItem(e) {
    e.preventDefault();
    const itemId = document.getElementById("edit-item-id").value;
    const payload = {
        item_code: document.getElementById("edit-item-code-input").value.trim(),
        name: document.getElementById("edit-item-name-input").value.trim(),
        type: document.getElementById("edit-item-type-select").value,
        unit: document.getElementById("edit-item-unit-input").value.trim(),
        minimum_stock: parseInt(document.getElementById("edit-item-min-stock-input").value) || 10
    };
    try {
        await apiRequest(`/items/${itemId}`, "PUT", payload);
        closeModal("modal-edit-item");
        showToast("تم تحديث بيانات الصنف بنجاح");
        loadCustodyItems();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function confirmDeleteItem(itemId, itemName) {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف أو إلغاء الصنف "${itemName}"؟\n(في حال وجود حركات مخزنية سابقة سيتم تعطيل الصنف للحفاظ على الحركات، وفي حال عدم وجود حركات سيتم حذفه نهائياً).`)) {
        return;
    }
    try {
        const res = await apiRequest(`/items/${itemId}`, "DELETE");
        showToast(res.message);
        loadCustodyItems();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// 13. Edit Warehouse Modal
function openEditWarehouseModal(wh) {
    document.getElementById("edit-wh-id").value = wh.id;
    document.getElementById("edit-wh-code-input").value = wh.warehouse_code;
    document.getElementById("edit-wh-name-input").value = wh.name;
    document.getElementById("edit-wh-location-input").value = wh.location || "";
    document.getElementById("edit-wh-resp-input").value = wh.responsible_person || "";
    openModal("modal-edit-warehouse");
}

async function submitEditWarehouse(e) {
    e.preventDefault();
    const whId = document.getElementById("edit-wh-id").value;
    const payload = {
        warehouse_code: document.getElementById("edit-wh-code-input").value.trim(),
        name: document.getElementById("edit-wh-name-input").value.trim(),
        location: document.getElementById("edit-wh-location-input").value.trim() || null,
        responsible_person: document.getElementById("edit-wh-resp-input").value.trim() || null
    };
    try {
        await apiRequest(`/warehouses/${whId}`, "PUT", payload);
        closeModal("modal-edit-warehouse");
        showToast("تم تحديث بيانات المخزن بنجاح");
        loadWarehouses();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function confirmDeleteWarehouse(whId, whName) {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف أو إلغاء المخزن "${whName}"؟`)) {
        return;
    }
    try {
        const res = await apiRequest(`/warehouses/${whId}`, "DELETE");
        showToast(res.message);
        loadWarehouses();
    } catch (err) {
        showToast(err.message, "error");
    }
}
