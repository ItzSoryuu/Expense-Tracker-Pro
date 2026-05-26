const API_BASE = "/api";
const $ = (sel) => document.querySelector(sel);

const els = {
    themeToggle: $("#themeToggle"),
    viewDashboard: $("#view-dashboard"),
    viewAdd: $("#view-add"),
    viewStatistics: $("#view-statistics"),
    navBtns: Array.from(document.querySelectorAll(".nav-btn")),
    txTbody: $("#txTbody"),
    txEmpty: $("#txEmpty"),
    txCount: $("#txCount"),
    totalBalance: $("#totalBalance"),
    statTotal: $("#statTotal"),
    statTbody: $("#statTbody"),
    statEmpty: $("#statEmpty"),
    txForm: $("#txForm"),
    cancelAdd: $("#cancelAdd"),
    toast: $("#toast"),
    cancelButtons: [],
    statSegs: Array.from(document.querySelectorAll("#view-statistics .seg")),
    dashSegs: Array.from(document.querySelectorAll("#view-dashboard .seg")),
};

function formatIDR(n) {
    const num = Number(n) || 0;
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(num);
}

function formatDateForBackend(value) {
    if (!value) return "";
    const [year, month, day] = String(value).split("-");
    if (!year || !month || !day) return String(value).trim();
    return `${day}-${month}-${year}`;
}

function getTodayISODate() {
    return new Date().toISOString().slice(0, 10);
}

function pickColor(index) {
    const colors = [
        "#5865F2",
        "#4F46E5",
        "#0a7a3a",
        "#d11a2a",
        "#8e8e93",
        "#000000",
    ];
    return colors[index % colors.length];
}

async function apiGet(path, params = null) {
    const url = params
        ? `${API_BASE}${path}?${new URLSearchParams(params).toString()}`
        : `${API_BASE}${path}`;
    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data?.error || `GET ${url} failed`);
    }
    return data;
}

async function apiPost(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data?.error || `POST ${path} failed`);
    }
    return data;
}

async function apiPut(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data?.error || `PUT ${path} failed`);
    }
    return data;
}

async function apiDelete(path) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data?.error || `DELETE ${path} failed`);
    }
    return data;
}

function setView(view) {
    els.viewDashboard.classList.toggle("is-hidden", view !== "dashboard");
    els.viewAdd.classList.toggle("is-hidden", view !== "add");
    els.viewStatistics.classList.toggle("is-hidden", view !== "statistics");

    els.navBtns.forEach((b) => {
        const active = b.getAttribute("data-view") === view;
        b.classList.toggle("is-active", active);
    });
}

/* pie chart-nya udah diapus */

// NOTE: kita jangan escape pake escaper HTML custom ya.
// Kita pake textContent lewat helper aja.
function escapeText(text) {
    const tmp = document.createElement("span");
    tmp.textContent = String(text);
    return tmp.innerHTML;
}

function showToast(msg, ok = true) {
    els.toast.textContent = msg;
    els.toast.style.color = ok ? "var(--ok)" : "var(--danger)";
    setTimeout(() => {
        els.toast.textContent = "";
        els.toast.style.color = "inherit";
    }, 2500);
}

async function loadTheme() {
    const data = await apiGet("/theme");
    const theme = data?.theme || "normal";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("et_theme", theme);
}

async function toggleTheme() {
    const current =
        document.documentElement.getAttribute("data-theme") || "normal";
    const next = current === "dark" ? "normal" : "dark";
    await apiPost("/theme", {
        theme: next,
    });
    document.documentElement.setAttribute("data-theme", next);
}

async function fetchTransactions() {
    return apiGet("/transactions");
}

function renderTransactions(txs) {
    els.txTbody.innerHTML = "";
    els.txEmpty.classList.toggle("is-hidden", txs.length !== 0);
    els.txCount.textContent = `${txs.length} item`;
    let total = 0;
    txs.forEach((tx, index) => {
        const amount = Number(tx.amount) || 0;
        total += amount;
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${escapeText(tx.name || "")}</td>
            <td>${escapeText(tx.category || "")}</td>
            <td>${escapeText(tx.date || "")}</td>
            <td>${formatIDR(amount)}</td>
            <td>${escapeText(tx.description || "")}</td>
            <td>
                <div class="tx-actions">
                    <button class="btn ghost" data-action="edit" data-index="${index}" type="button">
                        Ubah
                    </button>
                    <button class="btn danger" data-action="delete" data-index="${index}" type="button">
                        Hapus
                    </button>
                </div>
            </td>
        `;
        els.txTbody.appendChild(tr);
    });
    els.totalBalance.textContent = formatIDR(total);
}

async function refreshDashboard() {
    const txs = await fetchTransactions();
    renderTransactions(txs);
    // sekalian refresh stats buat periode yang dipilih (default-nya weekly)
    const activeDashPeriod =
        els.dashSegs
            .find((s) => s.classList.contains("is-active"))
            ?.getAttribute("data-period") || "weekly";
    const activeStatsPeriod =
        els.statSegs
            .find((s) => s.classList.contains("is-active"))
            ?.getAttribute("data-period") || "weekly";
    await loadStatistics(activeDashPeriod, "dashboard");
    await loadStatistics(activeStatsPeriod, "statistics");
}

function setActiveSeg(segs, period) {
    segs.forEach((s) => {
        s.classList.toggle(
            "is-active",
            s.getAttribute("data-period") === period
        );
    });
}

function renderStatisticsTransactions(txs) {
    els.statTbody.innerHTML = "";
    els.statEmpty.classList.toggle("is-hidden", txs.length !== 0);

    txs.forEach((tx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${escapeText(tx.name || "")}</td>
            <td>${escapeText(tx.category || "")}</td>
            <td>${escapeText(tx.date || "")}</td>
            <td>${formatIDR(Number(tx.amount) || 0)}</td>
            <td>${escapeText(tx.description || "")}</td>
        `;
        els.statTbody.appendChild(tr);
    });
}

async function loadStatistics(period, target) {
    const data = await apiGet("/statistics", {
        period,
    });
    if (target === "dashboard") {
        els.totalBalance.textContent = formatIDR(data?.total || 0);
    } else {
        els.statTotal.textContent = `Total: ${formatIDR(data?.total || 0)}`;
        renderStatisticsTransactions(Array.isArray(data?.transactions) ? data.transactions : []);
    }
}

function getFormPayload() {
    const fd = new FormData(els.txForm);
    const payload = {
        name: String(fd.get("name") || "").trim(),
        category: String(fd.get("category") || "").trim(),
        amount: Number(fd.get("amount") || 0),
        description: String(fd.get("description") || "").trim(),
        date: formatDateForBackend(String(fd.get("date") || "").trim()),
    };
    return payload;
}

function clearForm() {
    els.txForm.reset();
    const dateInput = els.txForm.elements.namedItem("date");
    if (dateInput) {
        dateInput.value = getTodayISODate();
    }
}

async function handleAddSubmit(e) {
    e.preventDefault();
    const payload = getFormPayload();
    try {
        await apiPost("/transactions", payload);
        showToast("Transaksi tersimpan ✅", true);
        clearForm();
        setView("dashboard");
        await refreshDashboard();
    } catch (err) {
        showToast(err.message || "Gagal menyimpan transaksi", false);
    }
}

// Ubah format DD-MM-YYYY ke YYYY-MM-DD buat input tanggal
function convertDateForInput(dateStr) {
    if (!dateStr) return getTodayISODate();
    const parts = String(dateStr).split("-");
    if (parts.length === 3 && parts[0].length <= 2) {
        // DD-MM-YYYY → YYYY-MM-DD
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
}

// Balikin format YYYY-MM-DD ke DD-MM-YYYY buat backend
function convertDateForBackend(dateStr) {
    if (!dateStr) return "";
    const [year, month, day] = String(dateStr).split("-");
    if (!year || !month || !day) return String(dateStr).trim();
    return `${day}-${month}-${year}`;
}

let currentEditingIndex = null;

function cancelInlineEdit() {
    if (currentEditingIndex === null) return;
    currentEditingIndex = null;
    // Render ulang biar balik ke tampilan normal
    fetchTransactions().then(renderTransactions);
}

function startInlineEdit(index, tx) {
    // Kalo lagi edit baris lain, batalin dulu aja
    if (currentEditingIndex !== null) {
        cancelInlineEdit();
    }
    currentEditingIndex = index;

    const rows = els.txTbody.querySelectorAll("tr");
    const row = rows[index];
    if (!row) return;

    const dateForInput = convertDateForInput(tx.date || "");

    row.classList.add("editing-row");
    row.innerHTML = `
        <td>
            <div class="edit-field">
                <label class="edit-label">Nama</label>
                <input class="edit-input" data-field="name" type="text" value="${escapeText(tx.name || '')}" placeholder="Nama" />
            </div>
        </td>
        <td>
            <div class="edit-field">
                <label class="edit-label">Kategori</label>
                <input class="edit-input" data-field="category" type="text" value="${escapeText(tx.category || '')}" placeholder="Kategori" />
            </div>
        </td>
        <td>
            <div class="edit-field">
                <label class="edit-label">Tanggal</label>
                <input class="edit-input" data-field="date" type="date" value="${dateForInput}" />
            </div>
        </td>
        <td>
            <div class="edit-field">
                <label class="edit-label">Jumlah</label>
                <input class="edit-input" data-field="amount" type="number" min="1000" step="1000" value="${Number(tx.amount) || 0}" placeholder="Jumlah" />
            </div>
        </td>
        <td>
            <div class="edit-field">
                <label class="edit-label">Deskripsi</label>
                <input class="edit-input" data-field="description" type="text" value="${escapeText(tx.description || '')}" placeholder="Deskripsi" />
            </div>
        </td>
        <td>
            <div class="tx-actions edit-actions">
                <button class="btn primary btn-sm" data-action="save-edit" data-index="${index}" type="button">
                    Simpan
                </button>
                <button class="btn ghost btn-sm" data-action="cancel-edit" data-index="${index}" type="button">
                    Batal
                </button>
            </div>
        </td>
    `;

    // Langsung fokus ke input pertama
    const firstInput = row.querySelector('.edit-input');
    if (firstInput) firstInput.focus();
}

function getEditPayloadFromRow(index) {
    const rows = els.txTbody.querySelectorAll("tr");
    const row = rows[index];
    if (!row) return null;

    const inputs = row.querySelectorAll(".edit-input");
    const data = {};
    inputs.forEach((inp) => {
        data[inp.getAttribute("data-field")] = inp.value;
    });

    return {
        name: (data.name || "").trim(),
        category: (data.category || "").trim(),
        amount: Number(data.amount) || 0,
        description: (data.description || "").trim(),
        date: convertDateForBackend((data.date || "").trim()),
    };
}

async function handleEdit(index) {
    const txs = await fetchTransactions();
    const existing = txs[index];
    if (!existing) return;
    startInlineEdit(index, existing);
}

async function handleSaveEdit(index) {
    const payload = getEditPayloadFromRow(index);
    if (!payload) return;
    try {
        await apiPut(`/transactions/${index}`, payload);
        currentEditingIndex = null;
        showToast("Transaksi diperbarui ✅", true);
        await refreshDashboard();
    } catch (err) {
        showToast(err.message || "Gagal memperbarui", false);
    }
}

async function handleDelete(index) {
    const ok = confirm("Hapus transaksi ini?");
    if (!ok) return;
    try {
        await apiDelete(`/transactions/${index}`);
        showToast("Transaksi dihapus ✅", true);
        await refreshDashboard();
    } catch (err) {
        showToast(err.message || "Gagal menghapus transaksi", false);
    }
}

function attachTableDelegation() {
    els.txTbody.addEventListener("click", async (e) => {
        const btn = e.target?.closest?.("button[data-action]");
        if (!btn) return;
        const action = btn.getAttribute("data-action");
        const index = Number(btn.getAttribute("data-index"));
        if (Number.isNaN(index)) return;
        if (action === "edit") {
            await handleEdit(index);
        } else if (action === "save-edit") {
            await handleSaveEdit(index);
        } else if (action === "cancel-edit") {
            cancelInlineEdit();
        } else if (action === "delete") {
            await handleDelete(index);
        }
    });

    // Biar bisa pencet Enter pas edit input buat nyimpen
    els.txTbody.addEventListener("keydown", async (e) => {
        if (e.key === "Enter" && currentEditingIndex !== null) {
            const input = e.target?.closest?.(".edit-input");
            if (input) {
                e.preventDefault();
                await handleSaveEdit(currentEditingIndex);
            }
        }
        if (e.key === "Escape" && currentEditingIndex !== null) {
            cancelInlineEdit();
        }
    });
}

function attachNavHandlers() {
    els.navBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const view = btn.getAttribute("data-view");
            setView(view);
        });
    });
}

function attachSegHandlers() {
    els.dashSegs.forEach((btn) => {
        btn.addEventListener("click", async () => {
            const period = btn.getAttribute("data-period");
            setActiveSeg(els.dashSegs, period);
            await loadStatistics(period, "dashboard");
        });
    });
    els.statSegs.forEach((btn) => {
        btn.addEventListener("click", async () => {
            const period = btn.getAttribute("data-period");
            setActiveSeg(els.statSegs, period);
            await loadStatistics(period, "statistics");
        });
    });
}

function attachAddHandlers() {
    els.txForm.addEventListener("submit", handleAddSubmit);
    els.cancelAdd.addEventListener("click", () => {
        clearForm();
        setView("dashboard");
    });
}

async function init() {
    attachNavHandlers();
    attachSegHandlers();
    attachAddHandlers();
    attachTableDelegation();

    const dateInput = els.txForm.elements.namedItem("date");
    if (dateInput) {
        dateInput.value = getTodayISODate();
    }
    // theme
    if (els.themeToggle) {
        els.themeToggle.addEventListener("click", async () => {
            try {
                await toggleTheme();
                // refresh total statistik kalo emang butuh
                await refreshDashboard();
            } catch (err) {
                showToast(err.message || "Gagal mengganti tema", false);
            }
        });
    }
    const stored = localStorage.getItem("et_theme");
    if (stored) {
        document.documentElement.setAttribute("data-theme", stored);
    }
    await loadTheme();
    // segment default
    setActiveSeg(els.dashSegs, "weekly");
    setActiveSeg(els.statSegs, "all");
    await refreshDashboard();
}

document.addEventListener("DOMContentLoaded", init);
