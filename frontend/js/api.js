// API Client & Utility Functions for Sistym
const API_BASE = "/api";

function getToken() {
    return localStorage.getItem("sistym_token");
}

function setToken(token) {
    if (token) {
        localStorage.setItem("sistym_token", token);
    } else {
        localStorage.removeItem("sistym_token");
    }
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem("sistym_user") || "null");
    } catch {
        return null;
    }
}

function setUser(user) {
    if (user) {
        localStorage.setItem("sistym_user", JSON.stringify(user));
    } else {
        localStorage.removeItem("sistym_user");
    }
}

async function apiRequest(endpoint, method = "GET", data = null) {
    const headers = {
        "Content-Type": "application/json"
    };
    
    const token = getToken();
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    
    const options = { method, headers };
    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        
        if (response.status === 401) {
            setToken(null);
            setUser(null);
            showAuthView();
            throw new Error("يرجى تسجيل الدخول أولاً");
        }
        
        const resData = await response.json().catch(() => ({}));
        
        if (!response.ok) {
            const errorMsg = resData.detail || resData.message || "حدث خطأ أثناء معالجة الطلب";
            throw new Error(errorMsg);
        }
        
        return resData;
    } catch (err) {
        throw err;
    }
}

// Toast Notifications System
function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;
    
    const toast = document.createElement("div");
    const isError = type === "error";
    const bgClass = isError ? "bg-red-600 text-white" : "bg-emerald-600 text-white";
    const icon = isError 
        ? `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
        : `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
        
    toast.className = `flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0 ${bgClass}`;
    toast.innerHTML = `${icon} <span>${message}</span>`;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove("translate-y-2", "opacity-0");
    }, 10);
    
    setTimeout(() => {
        toast.classList.add("opacity-0", "translate-y-2");
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Export Table to CSV
function exportTableToCSV(filename, tableElement) {
    const rows = tableElement.querySelectorAll("tr");
    const csv = [];
    
    rows.forEach(row => {
        const rowData = [];
        const cols = row.querySelectorAll("th, td");
        cols.forEach(col => {
            // Ignore action buttons column
            if (col.classList.contains("no-export")) return;
            let text = col.innerText.replace(/"/g, '""').trim();
            rowData.push(`"${text}"`);
        });
        if (rowData.length > 0) {
            csv.push(rowData.join(","));
        }
    });
    
    const csvFile = new Blob(["\uFEFF" + csv.join("\n")], { type: "text/csv;charset=utf-8;" });
    const downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
}

// Export Data Array to Excel (XLSX) or CSV
function exportDataToExcel(filename, sheetName, dataArray) {
    if (window.XLSX && dataArray && dataArray.length > 0) {
        const ws = XLSX.utils.json_to_sheet(dataArray);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName || "Report");
        XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
    } else {
        // Fallback to CSV
        if (!dataArray || dataArray.length === 0) {
            showToast("لا توجد بيانات متاحة للتصدير", "error");
            return;
        }
        const headers = Object.keys(dataArray[0]);
        const csvRows = [headers.join(",")];
        dataArray.forEach(row => {
            const values = headers.map(h => {
                const val = (row[h] === null || row[h] === undefined) ? "" : String(row[h]).replace(/"/g, '""');
                return `"${val}"`;
            });
            csvRows.push(values.join(","));
        });
        const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
        link.click();
    }
}
