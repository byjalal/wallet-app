/**
 * WALLET MONEY MANAGER - APPLICATION ENGINE
 * Features: State Management, UI Controller, Canvas Charts, Spreadsheet Importer/Exporter, Google Sheets Sync
 */

// ==========================================
// 1. DEFAULT DATA & INITIALIZATION
// ==========================================

const DEFAULT_CATEGORIES = {
  EXPENSE: [
    { id: 'cat-food', name: 'Makanan & Minuman', icon: 'fa-utensils', color: '#ef4444' },
    { id: 'cat-trans', name: 'Transportasi', icon: 'fa-car', color: '#06b6d4' },
    { id: 'cat-bills', name: 'Tagihan & Utilitas', icon: 'fa-bolt', color: '#f59e0b' },
    { id: 'cat-shop', name: 'Belanja & Hiburan', icon: 'fa-bag-shopping', color: '#a855f7' },
    { id: 'cat-health', name: 'Kesehatan', icon: 'fa-heart-pulse', color: '#ec4899' },
    { id: 'cat-edu', name: 'Pendidikan & Karir', icon: 'fa-graduation-cap', color: '#3b82f6' }
  ],
  INCOME: [
    { id: 'cat-salary', name: 'Gaji Bulanan', icon: 'fa-money-bill-wave', color: '#22c55e' },
    { id: 'cat-bonus', name: 'Bonus & Investasi', icon: 'fa-chart-line', color: '#14b8a6' },
    { id: 'cat-freelance', name: 'Freelance', icon: 'fa-laptop-code', color: '#0ea5e9' }
  ]
};

const DEFAULT_ACCOUNTS = [
  { id: 'acc-1', name: 'BCA Utama', type: 'BANK', balance: 14500000, icon: 'fa-building-columns', color: '#3b82f6' },
  { id: 'acc-2', name: 'Dompet Cash', type: 'CASH', balance: 750000, icon: 'fa-money-bill-1', color: '#10b981' },
  { id: 'acc-3', name: 'Gopay / OVO', type: 'EWALLET', balance: 520000, icon: 'fa-mobile-screen', color: '#06b6d4' },
  { id: 'acc-4', name: 'Tabungan Masa Depan', type: 'SAVINGS', balance: 25000000, icon: 'fa-piggy-bank', color: '#8b5cf6' }
];

const DEFAULT_BUDGETS = [
  { categoryId: 'cat-food', limit: 2500000 },
  { categoryId: 'cat-trans', limit: 1200000 },
  { categoryId: 'cat-shop', limit: 1500000 },
  { categoryId: 'cat-bills', limit: 2000000 }
];

const DEFAULT_GOALS = [
  { id: 'goal-1', name: 'Dana Darurat 6 Bulan', target: 30000000, current: 21500000, icon: 'fa-shield-halved' },
  { id: 'goal-2', name: 'Liburan Bali 2026', target: 10000000, current: 4800000, icon: 'fa-plane' }
];

// Helper to get current YYYY-MM-DD
function getTodayDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

// Generate rich sample transactions if empty
function generateSampleTransactions() {
  return [
    { id: 'tx-101', type: 'INCOME', amount: 12000000, category: 'cat-salary', account: 'acc-1', date: getTodayDateStr(-25), note: 'Gaji Bulanan PT Teknologi' },
    { id: 'tx-102', type: 'EXPENSE', amount: 450000, category: 'cat-food', account: 'acc-1', date: getTodayDateStr(-20), note: 'Makan Malam Keluarga' },
    { id: 'tx-103', type: 'EXPENSE', amount: 150000, category: 'cat-trans', account: 'acc-3', date: getTodayDateStr(-15), note: 'Bensin & Tol' },
    { id: 'tx-104', type: 'EXPENSE', amount: 850000, category: 'cat-bills', account: 'acc-1', date: getTodayDateStr(-10), note: 'Tagihan Listrik & WiFi' },
    { id: 'tx-105', type: 'EXPENSE', amount: 650000, category: 'cat-shop', account: 'acc-1', date: getTodayDateStr(-5), note: 'Belanja Pakaian Baru' },
    { id: 'tx-106', type: 'INCOME', amount: 2500000, category: 'cat-freelance', account: 'acc-1', date: getTodayDateStr(-3), note: 'Project Web Design Client' },
    { id: 'tx-107', type: 'EXPENSE', amount: 120000, category: 'cat-food', account: 'acc-2', date: getTodayDateStr(-1), note: 'Makan Siang Nasi Goreng' }
  ];
}

// ==========================================
// 2. STATE STORE & STORAGE
// ==========================================

class WalletState {
  constructor() {
    this.currency = localStorage.getItem('wallet_currency') || 'IDR';
    this.accounts = JSON.parse(localStorage.getItem('wallet_accounts')) || DEFAULT_ACCOUNTS;
    this.categories = JSON.parse(localStorage.getItem('wallet_categories')) || DEFAULT_CATEGORIES;
    this.transactions = JSON.parse(localStorage.getItem('wallet_transactions')) || generateSampleTransactions();
    this.budgets = JSON.parse(localStorage.getItem('wallet_budgets')) || DEFAULT_BUDGETS;
    this.goals = JSON.parse(localStorage.getItem('wallet_goals')) || DEFAULT_GOALS;
    this.webhookUrl = localStorage.getItem('wallet_webhook_url') || '';
    this.autoSync = localStorage.getItem('wallet_auto_sync') === 'true';
    this.theme = localStorage.getItem('wallet_theme') || 'dark';
    this.hideNominal = localStorage.getItem('wallet_hide_nominal') !== 'false';
    this.username = localStorage.getItem('wallet_username') || '';
    this.passcode = localStorage.getItem('wallet_passcode') || '';
    this.isRegistered = !!(this.username && this.passcode);
    this.isLoggedIn = sessionStorage.getItem('wallet_session_active') === 'true';
    this.isGuestMode = !this.isLoggedIn;
    this._lastUpdate = parseInt(localStorage.getItem('wallet_last_update')) || 0;
  }

  save() {
    this._lastUpdate = Date.now();
    localStorage.setItem('wallet_last_update', this._lastUpdate);
    localStorage.setItem('wallet_currency', this.currency);
    localStorage.setItem('wallet_accounts', JSON.stringify(this.accounts));
    localStorage.setItem('wallet_categories', JSON.stringify(this.categories));
    localStorage.setItem('wallet_transactions', JSON.stringify(this.transactions));
    localStorage.setItem('wallet_budgets', JSON.stringify(this.budgets));
    localStorage.setItem('wallet_goals', JSON.stringify(this.goals));
    localStorage.setItem('wallet_webhook_url', this.webhookUrl);
    localStorage.setItem('wallet_auto_sync', this.autoSync);
    localStorage.setItem('wallet_theme', this.theme);
    localStorage.setItem('wallet_hide_nominal', this.hideNominal);
    localStorage.setItem('wallet_username', this.username);
    localStorage.setItem('wallet_passcode', this.passcode);

    if (window._syncStateToFirebase) {
      window._syncStateToFirebase();
    }
  }

  addTransaction(tx) {
    tx.id = 'tx-' + Date.now();
    this.transactions.unshift(tx);

    // Update account balances
    const acc = this.accounts.find(a => a.id === tx.account);
    if (acc) {
      if (tx.type === 'INCOME') acc.balance += Number(tx.amount);
      if (tx.type === 'EXPENSE') acc.balance -= Number(tx.amount);
      if (tx.type === 'TRANSFER') {
        acc.balance -= Number(tx.amount);
        const targetAcc = this.accounts.find(a => a.id === tx.targetAccount);
        if (targetAcc) targetAcc.balance += Number(tx.amount);
      }
    }

    this.save();
    return tx;
  }

  deleteTransaction(id) {
    const tx = this.transactions.find(t => t.id === id);
    if (tx) {
      const acc = this.accounts.find(a => a.id === tx.account);
      if (acc) {
        if (tx.type === 'INCOME') acc.balance -= Number(tx.amount);
        if (tx.type === 'EXPENSE') acc.balance += Number(tx.amount);
        if (tx.type === 'TRANSFER') {
          acc.balance += Number(tx.amount);
          const targetAcc = this.accounts.find(a => a.id === tx.targetAccount);
          if (targetAcc) targetAcc.balance -= Number(tx.amount);
        }
      }
      this.transactions = this.transactions.filter(t => t.id !== id);
      this.save();
    }
  }

  getCategoryObj(catId) {
    const all = [...this.categories.EXPENSE, ...this.categories.INCOME];
    return all.find(c => c.id === catId) || { name: 'Transfer / Lainnya', icon: 'fa-arrow-right-arrow-left', color: '#06b6d4' };
  }

  getAccountObj(accId) {
    return this.accounts.find(a => a.id === accId) || { name: 'Unknown', type: 'CASH' };
  }
}

const state = new WalletState();

// ==========================================
// 3. CURRENCY FORMATTER
// ==========================================

function formatMoneyRaw(amount) {
  const num = Number(amount) || 0;
  if (state.currency === 'IDR') {
    return 'Rp ' + num.toLocaleString('id-ID');
  } else if (state.currency === 'USD') {
    return '$ ' + (num / 15000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (state.currency === 'EUR') {
    return '€ ' + (num / 16500).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return num.toLocaleString();
}

function formatMoney(amount) {
  return formatMoneyRaw(amount);
}

function formatMoneyMasked(amount) {
  if (state && state.hideNominal) {
    const symbol = state.currency === 'IDR' ? 'Rp ' : (state.currency === 'USD' ? '$ ' : '€ ');
    return symbol + '••••••';
  }
  return formatMoneyRaw(amount);
}

function formatDateDDMMYY(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const yy = parts[0].slice(-2);
  const mm = parts[1];
  const dd = parts[2];
  return `${dd}/${mm}/${yy}`;
}

// ==========================================
// 4. UI CONTROLLER & RENDERING
// ==========================================

function applyTheme() {
  const darkBtn = document.getElementById('profileThemeBtnDark');
  const lightBtn = document.getElementById('profileThemeBtnLight');

  if (state.theme === 'light') {
    document.body.classList.add('light-theme');
    if (darkBtn) {
      darkBtn.classList.remove('btn-primary');
      darkBtn.classList.add('btn-secondary');
    }
    if (lightBtn) {
      lightBtn.classList.remove('btn-secondary');
      lightBtn.classList.add('btn-primary');
    }
  } else {
    document.body.classList.remove('light-theme');
    if (darkBtn) {
      darkBtn.classList.remove('btn-secondary');
      darkBtn.classList.add('btn-primary');
    }
    if (lightBtn) {
      lightBtn.classList.remove('btn-primary');
      lightBtn.classList.add('btn-secondary');
    }
  }
}

function updateHideNominalUI() {
  const buttons = document.querySelectorAll('.toggle-hide-nominal');
  const icons = document.querySelectorAll('.hide-nominal-icon');

  icons.forEach(icon => {
    if (state.hideNominal) {
      icon.className = 'fa-solid fa-eye-slash hide-nominal-icon text-rose';
    } else {
      icon.className = 'fa-solid fa-eye hide-nominal-icon';
    }
  });

  buttons.forEach(btn => {
    btn.title = state.hideNominal ? 'Tampilkan Nominal' : 'Sembunyikan Nominal';
  });
}

function initUI() {
  window.addEventListener('error', function(e) {
    console.error('[GlobalError]', e.message, 'at', e.filename, 'line', e.lineno, 'col', e.colno, 'error:', e.error);
  });
  window.addEventListener('unhandledrejection', function(e) {
    console.error('[UnhandledPromiseRejection]', e.reason);
  });
  console.log('[initUI] App initializing...');
  applyTheme();
  updateHideNominalUI();
  updateSyncStatusWidget();
  updateAuthUI();
  renderDashboard();
  renderTransactionsTable();
  renderBudgetsAndGoals();
  renderAccounts();
  populateFormDropdowns();
  setupEventListeners();
  window._initFirebaseSync();

  if (state.isLoggedIn && window._syncOnLogin) {
    window._syncOnLogin().then(() => {
      renderDashboard();
      renderTransactionsTable();
      renderAccounts();
      renderBudgetsAndGoals();
    });
  }

  if (!state.isLoggedIn) {
    window._openAuthModal();
  }
}

// Switch active tab
function switchTab(tabId) {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  document.querySelectorAll('.tab-content').forEach(sec => {
    sec.classList.toggle('active', sec.id === `tab-${tabId}`);
  });

  const topHeader = document.querySelector('.top-header');
  if (tabId === 'profile') {
    if (topHeader) topHeader.style.display = 'none';
  } else {
    if (topHeader) topHeader.style.display = 'block';
    
    const titles = {
      dashboard: ['Overview Dashboard', 'Ringkasan keuangan dan analisis pengeluaran Anda'],
      transactions: ['Riwayat Transaksi', 'Daftar pencatatan pemasukan, pengeluaran & transfer'],
      budgets: ['Anggaran Bulanan & Target', 'Kelola alokasi pengeluaran dan tabungan impian Anda'],
      accounts: ['Dompet & Rekening', 'Daftar akun bank, e-wallet, dan kas tunai Anda'],
      spreadsheet: ['Spreadsheet Hub', 'Ekspor, impor, & sinkronisasi Google Sheets']
    };

    if (titles[tabId]) {
      document.getElementById('pageTitle').textContent = titles[tabId][0];
      document.getElementById('pageSubtitle').textContent = titles[tabId][1];
    }
  }

  if (tabId === 'dashboard') {
    renderDashboard();
  }
}

function updateSyncStatusWidget() {
  const widget = document.getElementById('syncStatusWidget');
  const indicator = widget.querySelector('.status-indicator');
  const statusText = document.getElementById('syncStatusText');

  if (state.webhookUrl) {
    indicator.className = 'status-indicator online';
    statusText.textContent = 'Sheets Connected';
  } else {
    indicator.className = 'status-indicator offline';
    statusText.textContent = 'Local Only';
  }
}

// Render Dashboard
function renderDashboard() {
  const el = (id) => document.getElementById(id);

  // Total Balance
  const totalBal = state.accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  const dashTotalBal = el('dashTotalBalance');
  if (dashTotalBal) dashTotalBal.textContent = formatMoneyMasked(totalBal);

  // Monthly Income & Expense
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTxs = state.transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const incTxs = monthlyTxs.filter(t => t.type === 'INCOME');
  const expTxs = monthlyTxs.filter(t => t.type === 'EXPENSE');

  const incTotal = incTxs.reduce((sum, t) => sum + Number(t.amount), 0);
  const expTotal = expTxs.reduce((sum, t) => sum + Number(t.amount), 0);

  const dashMonthlyInc = el('dashMonthlyIncome');
  const dashIncCount = el('dashIncomeCount');
  if (dashMonthlyInc) dashMonthlyInc.textContent = formatMoneyMasked(incTotal);
  if (dashIncCount) dashIncCount.textContent = `${incTxs.length} transaksi`;

  const dashMonthlyExp = el('dashMonthlyExpense');
  const dashExpCount = el('dashExpenseCount');
  if (dashMonthlyExp) dashMonthlyExp.textContent = formatMoneyMasked(expTotal);
  if (dashExpCount) dashExpCount.textContent = `${expTxs.length} transaksi`;

  // Budget remaining calculation
  const totalBudgetLimit = state.budgets.reduce((sum, b) => sum + Number(b.limit), 0);
  const remainingBudget = Math.max(0, totalBudgetLimit - expTotal);
  const dashBudgetRem = el('dashBudgetRemaining');
  if (dashBudgetRem) dashBudgetRem.textContent = formatMoneyMasked(remainingBudget);

  const budgetPct = totalBudgetLimit > 0 ? Math.min(100, Math.round((expTotal / totalBudgetLimit) * 100)) : 0;
  const dashBudgetFill = el('dashBudgetProgressFill');
  const dashBudgetPct = el('dashBudgetPercentText');
  if (dashBudgetFill) dashBudgetFill.style.width = `${budgetPct}%`;
  if (dashBudgetPct) dashBudgetPct.textContent = `${budgetPct}% terpakai`;

  // Recent transactions - show 3, with "show more"
  const allRecent = state.transactions.slice(0, 10);
  const container = el('recentTransactionsList');
  const showMoreBtn = el('showMoreRecentTxBtn');
  if (!container || !showMoreBtn) {
    renderDashboardAccounts();
    renderDonutChart();
    renderCashflowBarChart();
    return;
  }
  
  const renderRecentItems = (items) => {
    return items.map(t => {
      const isTransfer = t.type === 'TRANSFER';
      const cat = isTransfer ? { name: 'Transfer', icon: 'fa-arrow-right-arrow-left', color: '#06b6d4' } : state.getCategoryObj(t.category);
      const typeClass = t.type.toLowerCase();
      const sign = t.type === 'INCOME' ? '+' : (t.type === 'EXPENSE' ? '-' : '');
      const signStr = sign ? sign + ' ' : '';
      return `
        <div class="recent-tx-item" style="display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--glass-border);">
          <span style="width: 36px; height: 36px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: ${cat.color}15; color: ${cat.color}; font-size: 14px; flex-shrink: 0;" title="${cat.name}">
            <i class="fa-solid ${cat.icon}"></i>
          </span>
          <span style="flex: 1; font-size: 13px; color: var(--text-muted);">${formatDateDDMMYY(t.date)}</span>
          <span class="amount-display ${typeClass}" style="font-size: 14px; white-space: nowrap;">${signStr}${formatMoney(t.amount)}</span>
        </div>
      `;
    }).join('');
  };

  if (allRecent.length === 0) {
    container.innerHTML = '<p class="text-center text-dim" style="padding: 20px 0;">Belum ada transaksi</p>';
    showMoreBtn.style.display = 'none';
  } else {
    // Show first 3
    container.innerHTML = renderRecentItems(allRecent.slice(0, 3));
    if (allRecent.length > 3) {
      showMoreBtn.style.display = '';
      window._showAllRecentTx = function() {
        container.innerHTML = renderRecentItems(allRecent);
        showMoreBtn.style.display = 'none';
      };
    } else {
      showMoreBtn.style.display = 'none';
    }
  }

  // Render dashboard accounts
  renderDashboardAccounts();

  // Render Canvas Charts
  renderDonutChart();
  renderCashflowBarChart();
}

function renderDashboardAccounts() {
  const list = document.getElementById('dashAccountsList');
  if (!list) return;
  if (state.accounts.length === 0) {
    list.innerHTML = '<p class="text-center text-dim" style="padding: 16px 0;">Belum ada dompet. Tambahkan dompet baru.</p>';
    return;
  }
  list.innerHTML = state.accounts.map(a => `
    <div class="dash-account-item" style="display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--glass-border);">
      <div style="width: 36px; height: 36px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; background: ${a.color || '#6366f1'}15; color: ${a.color || '#6366f1'}; font-size: 14px; flex-shrink: 0;">
        <i class="fa-solid ${a.icon || 'fa-wallet'}"></i>
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${a.name}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${a.type}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="font-size: 14px; font-weight: 500; white-space: nowrap;">${formatMoneyMasked(a.balance)}</div>
        <div class="account-menu-wrapper">
          <button class="icon-btn-sm account-menu-btn" onclick="window._toggleAccMenu(event, '${a.id}')" title="Opsi Dompet">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
          <div class="account-dropdown-menu" id="accDropdown-${a.id}" style="display: none; position: absolute; right: 0; top: 100%; margin-top: 4px; background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); z-index: 100; min-width: 140px; overflow: hidden;">
            <button type="button" onclick="window._editAccount('${a.id}'); window._closeAllAccMenus();" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 14px; background: transparent; border: none; color: var(--text-main); font-size: 13px; cursor: pointer; text-align: left;">
              <i class="fa-solid fa-pen-to-square" style="color: var(--primary);"></i> Edit / Rename
            </button>
            <button type="button" onclick="window._deleteAccount('${a.id}'); window._closeAllAccMenus();" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 14px; background: transparent; border: none; color: var(--rose); font-size: 13px; cursor: pointer; text-align: left; border-top: 1px solid var(--glass-border);">
              <i class="fa-solid fa-trash"></i> Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Render Transactions Table with Filters
function renderTransactionsTable() {
  console.log('[renderTransactionsTable] start, total transactions:', state.transactions.length);
  const typeFilterEl = document.getElementById('txTypeFilter');
  const catFilterEl = document.getElementById('txCategoryFilter');
  const accFilterEl = document.getElementById('txAccountFilter');
  const searchEl = document.getElementById('txSearchInput');
  const monthFilterEl = document.getElementById('txMonthFilter');

  const typeFilter = typeFilterEl ? typeFilterEl.value : 'ALL';
  const catFilter = catFilterEl ? catFilterEl.value : 'ALL';
  const accFilter = accFilterEl ? accFilterEl.value : 'ALL';
  const search = searchEl ? searchEl.value.toLowerCase() : '';
  const monthFilter = monthFilterEl ? monthFilterEl.value : '';

  const filtered = state.transactions.filter(t => {
    if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
    if (catFilter !== 'ALL' && t.category !== catFilter) return false;
    if (accFilter !== 'ALL' && t.account !== accFilter) return false;
    if (search && !(t.note || '').toLowerCase().includes(search)) return false;
    if (monthFilter) {
      const txMonth = t.date.substring(0, 7);
      if (txMonth !== monthFilter) return false;
    }
    return true;
  });

  const container = document.getElementById('allTransactionsTable');
  if (!container) { console.log('[renderTransactionsTable] container not found!'); return; }

  if (filtered.length === 0) {
    console.log('[renderTransactionsTable] no transactions after filter');
    container.innerHTML = `<div class="text-center text-dim" style="padding: 30px 0; font-size: 13px;">Tidak ada transaksi ditemukan</div>`;
    return;
  }

  console.log('[renderTransactionsTable] rendering', filtered.length, 'transactions');
  container.innerHTML = filtered.map(t => {
    const isTransfer = t.type === 'TRANSFER';
    const cat = isTransfer ? { name: 'Transfer', icon: 'fa-arrow-right-arrow-left', color: '#06b6d4' } : state.getCategoryObj(t.category);
    const acc = state.getAccountObj(t.account);
    const targetAcc = isTransfer && t.targetAccount ? state.getAccountObj(t.targetAccount) : null;
    const typeClass = t.type.toLowerCase();
    const sign = t.type === 'INCOME' ? '+' : (t.type === 'EXPENSE' ? '-' : '');
    const signStr = sign ? sign + ' ' : '';

    return `
      <div class="tx-item-card" style="border-bottom: 1px solid var(--glass-border);">
        <div class="tx-main-row" onclick="toggleTxDetail('${t.id}')" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 0; cursor: pointer;">
          <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
            <span style="width: 36px; height: 36px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: ${cat.color}15; color: ${cat.color}; font-size: 14px; flex-shrink: 0;" title="${cat.name}">
              <i class="fa-solid ${cat.icon}"></i>
            </span>
            <div style="min-width: 0; flex: 1;">
              <div style="font-size: 13px; font-weight: 500; color: var(--text-main); line-height: 1.2;">${formatDateDDMMYY(t.date)}</div>
              ${t.note ? `<div style="font-size: 11px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px;">${t.note}</div>` : ''}
            </div>
          </div>
          <div style="text-align: right; flex-shrink: 0;">
            <span class="amount-display ${typeClass}" style="font-size: 14px; font-weight: 600; white-space: nowrap;">${signStr}${formatMoney(t.amount)}</span>
          </div>
        </div>
        <div class="tx-detail-row" id="tx-detail-${t.id}" style="display: none; padding-top: 6px; padding-bottom: 10px;">
          <div class="tx-detail-content" style="padding: 12px 14px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border); border-radius: var(--radius-md); position: relative;">
            
            <!-- Icon-only Trash Button -->
            <button class="icon-btn-sm" onclick="event.stopPropagation(); deleteTx('${t.id}')" title="Hapus Transaksi" style="position: absolute; right: 10px; top: 10px; color: var(--rose); width: 32px; height: 32px; border: 1px solid rgba(244, 63, 94, 0.2); background: rgba(244, 63, 94, 0.08); border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 13px;">
              <i class="fa-solid fa-trash-can"></i>
            </button>

            <!-- Kategori -->
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px; padding-right: 36px;">
              <span class="text-muted" style="font-size: 12px; width: 65px; flex-shrink: 0;">Kategori</span>
              <span style="font-size: 13px; font-weight: 600; color: ${cat.color}; flex: 1;">${cat.name}</span>
            </div>

            <!-- Catatan -->
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 8px; padding-right: 36px;">
              <span class="text-muted" style="font-size: 12px; width: 65px; flex-shrink: 0;">Catatan</span>
              <span style="font-size: 13px; font-weight: 500; color: var(--text-main); flex: 1; word-break: break-word; line-height: 1.3;">${t.note || '-'}</span>
            </div>

            <!-- Dompet -->
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="text-muted" style="font-size: 12px; width: 65px; flex-shrink: 0;">Dompet</span>
              <span class="account-tag" style="font-size: 12px; font-weight: 600; color: var(--text-main); display: inline-flex; align-items: center; gap: 6px;">
                <i class="fa-solid ${acc.icon || 'fa-wallet'}" style="color: var(--primary);"></i> ${acc.name}
                ${targetAcc ? ` <i class="fa-solid fa-arrow-right" style="font-size: 10px; margin: 0 2px; color: var(--text-muted);"></i> <i class="fa-solid ${targetAcc.icon || 'fa-wallet'}" style="color: var(--cyan);"></i> ${targetAcc.name}` : ''}
              </span>
            </div>

          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.toggleTxDetail = function(id) {
  const detailRow = document.getElementById(`tx-detail-${id}`);
  if (detailRow) {
    detailRow.style.display = detailRow.style.display === 'none' ? 'block' : 'none';
  }
};

function deleteTx(id) {
  if (state.isGuestMode) {
    window._openAuthModal();
    return;
  }
  if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
    state.deleteTransaction(id);
    renderDashboard();
    renderTransactionsTable();
    showToast('Transaksi berhasil dihapus', 'success');
  }
}

// Render Budgets & Goals
function renderBudgetsAndGoals() {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpTxs = state.transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'EXPENSE' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const grid = document.getElementById('budgetsGrid');
  if (grid) {
    grid.innerHTML = state.budgets.map(b => {
    const cat = state.getCategoryObj(b.categoryId);
    const spent = monthlyExpTxs.filter(t => t.category === b.categoryId).reduce((sum, t) => sum + Number(t.amount), 0);
    const pct = Math.min(100, Math.round((spent / b.limit) * 100));

    let statusClass = 'safe';
    if (pct >= 90) statusClass = 'danger';
    else if (pct >= 75) statusClass = 'warning';

    return `
      <div class="budget-card" style="position: relative;">
        <div class="budget-card-header">
          <div class="budget-category-info">
            <div class="icon-box" style="background: ${cat.color}20; color: ${cat.color}">
              <i class="fa-solid ${cat.icon}"></i>
            </div>
            <div>
              <strong style="font-size: 15px;">${cat.name}</strong>
              <div style="font-size: 12px; color: var(--text-muted);">${pct}% Terpakai</div>
            </div>
          </div>
          <div class="account-menu-wrapper">
            <button class="icon-btn-sm account-menu-btn" onclick="window._toggleBudgetMenu(event, '${b.categoryId}')" title="Opsi Anggaran">
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
            <div class="account-dropdown-menu" id="budgetDropdown-${b.categoryId}" style="display: none; position: absolute; right: 0; top: 100%; margin-top: 4px; background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); z-index: 100; min-width: 140px; overflow: hidden;">
              <button type="button" onclick="window._editBudget('${b.categoryId}'); window._closeAllBudgetMenus();" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 14px; background: transparent; border: none; color: var(--text-main); font-size: 13px; cursor: pointer; text-align: left;">
                <i class="fa-solid fa-pen-to-square" style="color: var(--primary);"></i> Edit Anggaran
              </button>
              <button type="button" onclick="window._deleteBudget('${b.categoryId}'); window._closeAllBudgetMenus();" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 14px; background: transparent; border: none; color: var(--rose); font-size: 13px; cursor: pointer; text-align: left; border-top: 1px solid var(--glass-border);">
                <i class="fa-solid fa-trash"></i> Hapus
              </button>
            </div>
          </div>
        </div>
        <div class="progress-bar-lg">
          <div class="progress-fill-lg ${statusClass}" style="width: ${pct}%"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 13px;">
          <span style="color: var(--text-muted);">Terpakai: <strong>${formatMoney(spent)}</strong></span>
          <span>Batas: <strong>${formatMoney(b.limit)}</strong></span>
        </div>
      </div>
    `;
  }).join('');
  }

  // Goals
  const goalsGrid = document.getElementById('goalsGrid');
  if (goalsGrid) {
    goalsGrid.innerHTML = state.goals.map(g => {
    const pct = Math.min(100, Math.round((g.current / g.target) * 100));
    return `
      <div class="goal-card" style="position: relative;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
            <div class="icon-box" style="background: rgba(139, 92, 246, 0.2); color: var(--violet); flex-shrink: 0;">
              <i class="fa-solid ${g.icon || 'fa-bullseye'}"></i>
            </div>
            <div style="min-width: 0; flex: 1;">
              <strong style="font-size: 15px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${g.name}</strong>
              <div style="font-size: 12px; color: var(--text-muted);">${pct}% Tercapai</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
            <button class="btn btn-sm btn-primary" onclick="window._addSavingsToGoal('${g.id}')" style="padding: 5px 10px; font-size: 12px; border-radius: var(--radius-md);">
              <i class="fa-solid fa-plus"></i> Tabung
            </button>
            <div class="account-menu-wrapper">
              <button class="icon-btn-sm account-menu-btn" onclick="window._toggleGoalMenu(event, '${g.id}')" title="Opsi Target">
                <i class="fa-solid fa-ellipsis-vertical"></i>
              </button>
              <div class="account-dropdown-menu" id="goalDropdown-${g.id}" style="display: none; position: absolute; right: 0; top: 100%; margin-top: 4px; background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); z-index: 100; min-width: 140px; overflow: hidden;">
                <button type="button" onclick="window._editGoal('${g.id}'); window._closeAllGoalMenus();" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 14px; background: transparent; border: none; color: var(--text-main); font-size: 13px; cursor: pointer; text-align: left;">
                  <i class="fa-solid fa-pen-to-square" style="color: var(--primary);"></i> Edit Target
                </button>
                <button type="button" onclick="window._deleteGoal('${g.id}'); window._closeAllGoalMenus();" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 14px; background: transparent; border: none; color: var(--rose); font-size: 13px; cursor: pointer; text-align: left; border-top: 1px solid var(--glass-border);">
                  <i class="fa-solid fa-trash"></i> Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="progress-bar-lg">
          <div class="progress-fill-lg safe" style="width: ${pct}%"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-top: 8px;">
          <span style="color: var(--text-muted);">Terkumpul: <strong>${formatMoney(g.current)}</strong></span>
          <span>Target: <strong>${formatMoney(g.target)}</strong></span>
        </div>
      </div>
    `;
  }).join('');
  }
}

// Global Savings Goals Management Functions
window._addSavingsToGoal = function(goalId) {
  if (state.isGuestMode) {
    window._openAuthModal();
    return;
  }
  const g = state.goals.find(x => x.id === goalId);
  if (!g) return;

  document.getElementById('savingsGoalId').value = g.id;
  document.getElementById('addSavingsTitle').textContent = `Setor Tabungan: ${g.name}`;
  document.getElementById('savingsAmount').value = '';
  document.getElementById('savingsAmountHelper').style.display = 'none';

  const select = document.getElementById('savingsSourceAccount');
  select.innerHTML = '<option value="NONE">Tanpa Potong Dompet (Catat Progress Saja)</option>' +
    state.accounts.map(a => `<option value="${a.id}">Potong dari ${a.name} (${formatMoney(a.balance)})</option>`).join('');

  document.getElementById('addSavingsModal').classList.add('active');
};

window._editGoal = function(goalId) {
  if (state.isGuestMode) {
    window._openAuthModal();
    return;
  }
  const g = state.goals.find(x => x.id === goalId);
  if (!g) return;

  document.getElementById('goalId').value = g.id;
  document.getElementById('goalName').value = g.name;

  const targetEl = document.getElementById('goalTarget');
  targetEl.value = Number(g.target).toLocaleString('id-ID');
  const targetHelp = document.getElementById('goalTargetHelper');
  if (targetHelp) {
    targetHelp.textContent = `Terbaca: ${formatMoney(g.target)}`;
    targetHelp.style.display = 'block';
  }

  const currentEl = document.getElementById('goalCurrent');
  currentEl.value = Number(g.current).toLocaleString('id-ID');
  const currentHelp = document.getElementById('goalCurrentHelper');
  if (currentHelp) {
    currentHelp.textContent = `Terbaca: ${formatMoney(g.current)}`;
    currentHelp.style.display = 'block';
  }

  document.getElementById('goalModalTitle').textContent = 'Edit Target Tabungan';
  document.getElementById('goalModal').classList.add('active');
};

window._deleteGoal = function(goalId) {
  if (state.isGuestMode) {
    window._openAuthModal();
    return;
  }
  const g = state.goals.find(x => x.id === goalId);
  if (!g) return;

  if (confirm(`Apakah Anda yakin ingin menghapus target "${g.name}"?`)) {
    state.goals = state.goals.filter(x => x.id !== goalId);
    state.save();
    renderBudgetsAndGoals();
    showToast(`Target "${g.name}" telah dihapus`, 'info');
  }
};

// Render Accounts
function renderAccounts() {
  const grid = document.getElementById('accountsGrid');
  if (!grid) return;
  grid.innerHTML = state.accounts.map(a => `
    <div class="account-card">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="icon-box" style="background: ${a.color || '#3b82f6'}20; color: ${a.color || '#3b82f6'}">
            <i class="fa-solid ${a.icon || 'fa-wallet'}"></i>
          </div>
          <div>
            <strong style="font-size: 16px;">${a.name}</strong>
            <div style="font-size: 12px; color: var(--text-muted);">${a.type}</div>
          </div>
        </div>
        <div class="account-menu-wrapper">
          <button class="icon-btn-sm account-menu-btn" onclick="window._toggleAccMenu(event, '${a.id}')" title="Opsi Dompet">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
          <div class="account-dropdown-menu" id="accDropdown-${a.id}" style="display: none; position: absolute; right: 0; top: 100%; margin-top: 4px; background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); z-index: 100; min-width: 140px; overflow: hidden;">
            <button type="button" onclick="window._editAccount('${a.id}'); window._closeAllAccMenus();" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 14px; background: transparent; border: none; color: var(--text-main); font-size: 13px; cursor: pointer; text-align: left;">
              <i class="fa-solid fa-pen-to-square" style="color: var(--primary);"></i> Edit / Rename
            </button>
            <button type="button" onclick="window._deleteAccount('${a.id}'); window._closeAllAccMenus();" style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 14px; background: transparent; border: none; color: var(--rose); font-size: 13px; cursor: pointer; text-align: left; border-top: 1px solid var(--glass-border);">
              <i class="fa-solid fa-trash"></i> Hapus
            </button>
          </div>
        </div>
      </div>
      <div style="font-size: 22px; font-weight: 800; margin-top: 10px; color: var(--text-main);">
        ${formatMoneyMasked(a.balance)}
      </div>
    </div>
  `).join('');
}

// Global 3-dot Context Menu Helpers
window._toggleAccMenu = function(evt, id) {
  evt.stopPropagation();
  const dropdown = document.getElementById(`accDropdown-${id}`);
  const isCurrentlyOpen = dropdown && dropdown.style.display === 'block';
  
  window._closeAllAccMenus();
  
  if (dropdown && !isCurrentlyOpen) {
    dropdown.style.display = 'block';
  }
};

window._closeAllAccMenus = function() {
  document.querySelectorAll('.account-dropdown-menu').forEach(menu => {
    menu.style.display = 'none';
  });
};

// Budget 3-dot Menu Helpers
window._toggleBudgetMenu = function(evt, catId) {
  evt.stopPropagation();
  const dropdown = document.getElementById(`budgetDropdown-${catId}`);
  const isCurrentlyOpen = dropdown && dropdown.style.display === 'block';
  window._closeAllAccMenus();
  if (dropdown && !isCurrentlyOpen) {
    dropdown.style.display = 'block';
  }
};

window._closeAllBudgetMenus = function() {
  window._closeAllAccMenus();
};

window._editBudget = function(catId) {
  if (state.isGuestMode) {
    window._openAuthModal();
    return;
  }
  const b = state.budgets.find(x => x.categoryId === catId);
  if (!b) return;
  document.getElementById('budgetCategory').value = b.categoryId;
  document.getElementById('budgetLimit').value = b.limit;
  document.getElementById('budgetModal').classList.add('active');
};

window._deleteBudget = function(catId) {
  if (state.isGuestMode) {
    window._openAuthModal();
    return;
  }
  const b = state.budgets.find(x => x.categoryId === catId);
  if (!b) return;
  const cat = state.getCategoryObj(catId);
  if (confirm(`Hapus anggaran untuk "${cat.name}"?`)) {
    state.budgets = state.budgets.filter(x => x.categoryId !== catId);
    state.save();
    renderBudgetsAndGoals();
    renderDashboard();
  }
};

// Goal 3-dot Menu Helpers
window._toggleGoalMenu = function(evt, goalId) {
  evt.stopPropagation();
  const dropdown = document.getElementById(`goalDropdown-${goalId}`);
  const isCurrentlyOpen = dropdown && dropdown.style.display === 'block';
  window._closeAllAccMenus();
  if (dropdown && !isCurrentlyOpen) {
    dropdown.style.display = 'block';
  }
};

window._closeAllGoalMenus = function() {
  window._closeAllAccMenus();
};

document.addEventListener('click', () => {
  window._closeAllAccMenus();
});

// Global account edit / delete functions
window._editAccount = function(id) {
  if (state.isGuestMode) {
    window._openAuthModal();
    return;
  }
  const acc = state.accounts.find(a => a.id === id);
  if (!acc) return;
  document.getElementById('accId').value = acc.id;
  document.getElementById('accName').value = acc.name;
  document.getElementById('accType').value = acc.type;
  
  const iconToSelect = acc.icon || 'fa-wallet';
  document.getElementById('accIcon').value = iconToSelect;
  const accIconBtns = document.querySelectorAll('#accIconGrid .icon-option-btn');
  accIconBtns.forEach(b => {
    if (b.dataset.icon === iconToSelect) b.classList.add('active');
    else b.classList.remove('active');
  });

  const accBalEl = document.getElementById('accBalance');
  accBalEl.value = Number(acc.balance).toLocaleString('id-ID');
  const helperEl = document.getElementById('accBalanceHelper');
  if (helperEl) {
    helperEl.textContent = `Terbaca: ${formatMoney(acc.balance)}`;
    helperEl.style.display = 'block';
  }

  document.getElementById('accountModalTitle').textContent = 'Edit / Rename Dompet';
  document.getElementById('accountModal').classList.add('active');
};

window._deleteAccount = function(id) {
  if (state.isGuestMode) {
    window._openAuthModal();
    return;
  }
  const acc = state.accounts.find(a => a.id === id);
  if (!acc) return;
  if (confirm(`Apakah Anda yakin ingin menghapus dompet "${acc.name}"?`)) {
    state.accounts = state.accounts.filter(a => a.id !== id);
    state.save();
    populateFormDropdowns();
    renderAccounts();
    renderDashboard();
    showToast(`Dompet "${acc.name}" berhasil dihapus`, 'info');
  }
};

// ==========================================
// CATEGORY MANAGEMENT LOGIC
// ==========================================
let _selectedCategoryType = 'EXPENSE';

window._switchCategoryTab = function(type) {
  _selectedCategoryType = type;
  const expBtn = document.getElementById('catTypeExpBtn');
  const incBtn = document.getElementById('catTypeIncBtn');
  if (expBtn) expBtn.classList.toggle('active', type === 'EXPENSE');
  if (incBtn) incBtn.classList.toggle('active', type === 'INCOME');
  renderCategoryManagement();
};

function renderCategoryManagement() {
  const container = document.getElementById('categoryManagerList');
  if (!container) return;

  const cats = state.categories[_selectedCategoryType] || [];
  if (cats.length === 0) {
    container.innerHTML = '<p class="text-center text-dim" style="padding: 12px 0;">Belum ada kategori</p>';
    return;
  }

  container.innerHTML = cats.map(c => `
    <div class="category-item" style="display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 12px; background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md);">
      <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
        <span style="width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: ${c.color}20; color: ${c.color}; font-size: 13px; flex-shrink: 0;">
          <i class="fa-solid ${c.icon}"></i>
        </span>
        <span style="font-size: 13px; font-weight: 600; color: var(--text-main); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.name}</span>
      </div>
      <div style="display: flex; gap: 6px; flex-shrink: 0;">
        <button class="icon-btn-sm" onclick="window._editCategory('${c.id}')" title="Rename / Edit Kategori">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button class="icon-btn-sm text-rose" onclick="window._deleteCategory('${c.id}')" title="Hapus Kategori">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

window._editCategory = function(catId) {
  const all = [...state.categories.EXPENSE, ...state.categories.INCOME];
  const cat = all.find(c => c.id === catId);
  if (!cat) return;

  document.getElementById('editCatId').value = cat.id;
  document.getElementById('catName').value = cat.name;
  
  const type = state.categories.EXPENSE.some(c => c.id === catId) ? 'EXPENSE' : 'INCOME';
  document.getElementById('catType').value = type;
  document.getElementById('catColor').value = cat.color || '#ef4444';

  const catIconBtns = document.querySelectorAll('#catIconGrid .icon-option-btn');
  const iconToSelect = cat.icon || 'fa-utensils';
  document.getElementById('catIcon').value = iconToSelect;
  catIconBtns.forEach(b => {
    if (b.dataset.icon === iconToSelect) b.classList.add('active');
    else b.classList.remove('active');
  });

  document.getElementById('categoryModalTitle').textContent = 'Edit / Rename Kategori';
  document.getElementById('categoryModal').classList.add('active');
};

window._deleteCategory = function(catId) {
  const all = [...state.categories.EXPENSE, ...state.categories.INCOME];
  const cat = all.find(c => c.id === catId);
  if (!cat) return;

  if (confirm(`Apakah Anda yakin ingin menghapus kategori "${cat.name}"?`)) {
    state.categories.EXPENSE = state.categories.EXPENSE.filter(c => c.id !== catId);
    state.categories.INCOME = state.categories.INCOME.filter(c => c.id !== catId);
    state.save();

    populateFormDropdowns();
    renderCategoryManagement();
    renderDashboard();
    renderTransactionsTable();
    showToast(`Kategori "${cat.name}" dihapus`, 'info');
  }
};

// Populate Select Form Options
function populateFormDropdowns() {
  const catSelect = document.getElementById('txCategory');
  const catFilter = document.getElementById('txCategoryFilter');
  const accSelect = document.getElementById('txAccount');
  const targetAccSelect = document.getElementById('txTargetAccount');
  const accFilter = document.getElementById('txAccountFilter');
  const budgetCatSelect = document.getElementById('budgetCategory');

  // Categories dropdown (Expense + Income)
  const expCats = state.categories.EXPENSE;
  const incCats = state.categories.INCOME;

  const catOptionsHtml = `
    <optgroup label="Pengeluaran">
      ${expCats.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
    </optgroup>
    <optgroup label="Pemasukan">
      ${incCats.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
    </optgroup>
  `;
  catSelect.innerHTML = catOptionsHtml;
  budgetCatSelect.innerHTML = expCats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  catFilter.innerHTML = `<option value="ALL">Semua Kategori</option>` +
    expCats.concat(incCats).map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  // Accounts dropdown
  const accOptionsHtml = state.accounts.map(a => `<option value="${a.id}">${a.name} (${formatMoney(a.balance)})</option>`).join('');
  accSelect.innerHTML = accOptionsHtml;
  targetAccSelect.innerHTML = accOptionsHtml;
  accFilter.innerHTML = `<option value="ALL">Semua Dompet</option>` + state.accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
}

// ==========================================
// 5. SVG CHARTS ENGINE
// ==========================================

let _cashflowPeriod = 6;
let _categoryPeriod = 6;

window.setCashflowPeriod = function(months) {
  _cashflowPeriod = months;
  const sel = document.getElementById('cashflowPeriodSelect');
  if (sel) sel.value = months;
  renderCashflowLineChart();
};

window.setCategoryPeriod = function(months) {
  _categoryPeriod = months;
  const sel = document.getElementById('categoryPeriodSelect');
  if (sel) sel.value = months;
  renderDonutChart();
};

function getMonthsData(numMonths) {
  const months = [];
  const now = new Date();
  for (let i = numMonths - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleString('id-ID', { month: 'short' }),
      fullLabel: d.toLocaleString('id-ID', { month: 'long', year: 'numeric' }),
      monthIdx: d.getMonth(),
      year: d.getFullYear(),
      income: 0,
      expense: 0
    });
  }
  state.transactions.forEach(t => {
    const d = new Date(t.date);
    const found = months.find(m => m.monthIdx === d.getMonth() && m.year === d.getFullYear());
    if (found) {
      if (t.type === 'INCOME') found.income += Number(t.amount);
      if (t.type === 'EXPENSE') found.expense += Number(t.amount);
    }
  });
  return months;
}

function renderCashflowLineChart() {
  const container = document.getElementById('cashflowChartContainer');
  if (!container) return;

  const months = getMonthsData(_cashflowPeriod);
  const maxVal = Math.max(1, ...months.flatMap(m => [m.income, m.expense]));

  const w = container.clientWidth || 360;
  const h = 220;
  const padL = 10, padR = 10, padT = 20, padB = 30;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const n = months.length;

  const getX = (i) => padL + (i / (n - 1 || 1)) * chartW;
  const getY = (val) => padT + chartH - (val / maxVal) * chartH;

  const makePath = (key) => months.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(m[key]).toFixed(1)}`).join(' ');
  const makeArea = (key) => {
    const baseline = padT + chartH;
    return makePath(key) + ` L ${getX(n - 1).toFixed(1)} ${baseline} L ${getX(0).toFixed(1)} ${baseline} Z`;
  };

  // Grid lines
  let gridLines = '';
  for (let i = 0; i <= 4; i++) {
    const y = padT + (chartH / 4) * i;
    gridLines += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" class="chart-grid-line"/>`;
  }

  // Month labels
  let labels = months.map((m, i) => `<text x="${getX(i)}" y="${h - 6}" text-anchor="middle" class="chart-label">${m.label}</text>`).join('');

  // Calculate path lengths for animation
  const incPath = makePath('income');
  const expPath = makePath('expense');

  // Dots
  let incomeDots = months.map((m, i) =>
    `<circle cx="${getX(i).toFixed(1)}" cy="${getY(m.income).toFixed(1)}" r="4" fill="#10b981" class="chart-dot" 
      style="animation: fadeInDot 0.3s ease ${0.6 + i * 0.05}s both;"
      data-idx="${i}" data-type="income"
      onmouseenter="window._showChartTip(evt,${i})" onmouseleave="window._hideChartTip()"
      ontouchstart="window._showChartTip(evt,${i})" />`
  ).join('');
  let expenseDots = months.map((m, i) =>
    `<circle cx="${getX(i).toFixed(1)}" cy="${getY(m.expense).toFixed(1)}" r="4" fill="#f43f5e" class="chart-dot"
      style="animation: fadeInDot 0.3s ease ${0.8 + i * 0.05}s both;"
      data-idx="${i}" data-type="expense"
      onmouseenter="window._showChartTip(evt,${i})" onmouseleave="window._hideChartTip()"
      ontouchstart="window._showChartTip(evt,${i})" />`
  ).join('');

  container.innerHTML = `
    <svg class="svg-chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">
      ${gridLines}
      ${labels}
      <path d="${makeArea('income')}" class="chart-area chart-area-income" style="animation: fadeInArea 0.8s ease 0.3s both;" />
      <path d="${makeArea('expense')}" class="chart-area chart-area-expense" style="animation: fadeInArea 0.8s ease 0.5s both;" />
      <path d="${incPath}" class="chart-line chart-line-income" style="stroke-dasharray: 2000; stroke-dashoffset: 2000; animation: drawLine 1.2s ease 0.2s forwards;" />
      <path d="${expPath}" class="chart-line chart-line-expense" style="stroke-dasharray: 2000; stroke-dashoffset: 2000; animation: drawLine 1.2s ease 0.4s forwards;" />
      ${incomeDots}
      ${expenseDots}
    </svg>
  `;

  // Store data for tooltip
  window._chartMonthsData = months;
}

window._showChartTip = function(evt, idx) {
  const tip = document.getElementById('chartTooltip');
  const data = window._chartMonthsData;
  if (!tip || !data || !data[idx]) return;
  const m = data[idx];
  document.getElementById('tooltipDate').textContent = m.fullLabel;
  document.getElementById('tooltipIncome').innerHTML = `<i class="fa-solid fa-arrow-down-left"></i> ${formatMoney(m.income)}`;
  document.getElementById('tooltipExpense').innerHTML = `<i class="fa-solid fa-arrow-up-right"></i> ${formatMoney(m.expense)}`;
  tip.style.display = 'block';

  const container = document.getElementById('cashflowChartContainer');
  const rect = container.getBoundingClientRect();
  const touch = evt.touches ? evt.touches[0] : evt;
  let x = touch.clientX - rect.left + 10;
  let y = touch.clientY - rect.top - 60;
  if (x + 150 > rect.width) x = x - 170;
  if (y < 0) y = 10;
  tip.style.left = x + 'px';
  tip.style.top = y + 'px';
};

window._hideChartTip = function() {
  const tip = document.getElementById('chartTooltip');
  if (tip) tip.style.display = 'none';
};

const VIVID_COLOR_MAP = {
  'cat-food': '#ef4444',
  'cat-trans': '#06b6d4',
  'cat-bills': '#f59e0b',
  'cat-shop': '#a855f7',
  'cat-health': '#ec4899',
  'cat-edu': '#3b82f6'
};

function renderDonutChart() {
  const container = document.getElementById('donutChartContainer');
  if (!container) return;

  const now = new Date();
  const expTxs = state.transactions.filter(t => {
    if (t.type !== 'EXPENSE') return false;
    const d = new Date(t.date);
    const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    return monthsAgo >= 0 && monthsAgo < _categoryPeriod;
  });

  const catTotals = {};
  let grandTotal = 0;
  expTxs.forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + Number(t.amount);
    grandTotal += Number(t.amount);
  });

  const legendBox = document.getElementById('categoriesLegend');

  if (grandTotal === 0) {
    container.innerHTML = `<svg viewBox="0 0 200 200"><text x="100" y="100" text-anchor="middle" fill="var(--text-muted)" font-size="12" font-family="Plus Jakarta Sans">Belum ada data</text></svg>`;
    if (legendBox) legendBox.innerHTML = `<span style="font-size: 12px; color: var(--text-dim);">Belum ada pengeluaran di periode ini</span>`;
    return;
  }

  const cx = 100, cy = 100, outerR = 82, innerR = 54;
  const circumference = 2 * Math.PI * ((outerR + innerR) / 2);
  let currentAngle = -90;
  let segments = '';
  const legendItems = [];
  let segIdx = 0;

  Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .forEach(([catId, amount]) => {
      const cat = state.getCategoryObj(catId);
      const pct = amount / grandTotal;
      const angle = pct * 360;

      // Calculate arc path
      const startRad = (currentAngle * Math.PI) / 180;
      const endRad = ((currentAngle + angle) * Math.PI) / 180;
      const largeArc = angle > 180 ? 1 : 0;

      const x1o = cx + outerR * Math.cos(startRad);
      const y1o = cy + outerR * Math.sin(startRad);
      const x2o = cx + outerR * Math.cos(endRad);
      const y2o = cy + outerR * Math.sin(endRad);
      const x1i = cx + innerR * Math.cos(endRad);
      const y1i = cy + innerR * Math.sin(endRad);
      const x2i = cx + innerR * Math.cos(startRad);
      const y2i = cy + innerR * Math.sin(startRad);

      const path = `M ${x1o} ${y1o} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x2i} ${y2i} Z`;

      const catColor = VIVID_COLOR_MAP[catId] || cat.color || '#6366f1';

      segments += `<path d="${path}" fill="${catColor}" class="donut-segment" 
        style="opacity: 0; transform-origin: 100px 100px; animation: fadeInSolid 0.4s ease-out ${0.1 + segIdx * 0.08}s forwards;">
        <title>${cat.name}: ${Math.round(pct * 100)}%</title>
      </path>`;

      currentAngle += angle;

      legendItems.push(`
        <div class="legend-item">
          <div class="legend-info">
            <span class="legend-color" style="background: ${catColor}"></span>
            <span class="legend-name">${cat.name}</span>
          </div>
          <span class="legend-percent">${Math.round(pct * 100)}%</span>
        </div>
      `);
      segIdx++;
    });

  container.innerHTML = `<svg viewBox="0 0 200 200" class="svg-chart">${segments}</svg>`;
  if (legendBox) legendBox.innerHTML = legendItems.join('');
}

function renderCashflowBarChart() {
  // Legacy alias - now calls line chart
  renderCashflowLineChart();
}

// ==========================================
// 6. SPREADSHEET ENGINE (EXPORT/IMPORT/SYNC)
// ==========================================

function exportToCsv() {
  const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Jumlah', 'Dompet', 'Catatan'];
  const rows = state.transactions.map(t => {
    const cat = state.getCategoryObj(t.category);
    const acc = state.getAccountObj(t.account);
    return [
      t.id,
      t.date,
      t.type,
      `"${cat.name}"`,
      t.amount,
      `"${acc.name}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Wallet_Transactions_${getTodayDateStr()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('File CSV berhasil diunduh', 'success');
}

function handleCsvImport(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length <= 1) {
      showToast('File CSV kosong atau tidak valid', 'error');
      return;
    }

    const parsedTxs = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 5) {
        parsedTxs.push({
          date: parts[1] || getTodayDateStr(),
          type: (parts[2] || 'EXPENSE').toUpperCase(),
          category: 'cat-food',
          amount: Number(parts[4]) || 0,
          account: state.accounts[0].id,
          note: parts[6] || 'Imported from CSV'
        });
      }
    }

    window._pendingImportTxs = parsedTxs;
    document.getElementById('importCountText').textContent = parsedTxs.length;
    document.getElementById('importPreviewContainer').classList.remove('hidden');
    document.getElementById('confirmImportBtn').classList.remove('hidden');

    const previewTbody = document.getElementById('importPreviewTable');
    previewTbody.innerHTML = parsedTxs.slice(0, 5).map(t => `
      <tr>
        <td>${t.date}</td>
        <td>${t.type}</td>
        <td>${formatMoney(t.amount)}</td>
        <td>${state.accounts[0].name}</td>
        <td>${t.note}</td>
      </tr>
    `).join('');
  };
  reader.readAsText(file);
}

async function syncTransactionToGoogleSheets(tx) {
  if (!state.webhookUrl) return;

  try {
    const cat = state.getCategoryObj(tx.category);
    const acc = state.getAccountObj(tx.account);

    const payload = {
      id: tx.id,
      date: tx.date,
      type: tx.type,
      category: cat.name,
      amount: tx.amount,
      account: acc.name,
      note: tx.note || ''
    };

    await fetch(state.webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    showToast('Tersinkronisasi ke Google Sheets', 'success');
  } catch (err) {
    console.error('Google Sheets Sync Error:', err);
    showToast('Gagal sync ke Google Sheets', 'error');
  }
}

// ==========================================
// 7. EVENT LISTENERS & MODAL HANDLERS
// ==========================================

function attachThousandsFormatter(inputId, helperId) {
  const input = document.getElementById(inputId);
  const helper = document.getElementById(helperId);
  if (!input) return;

  const updateVal = () => {
    let raw = input.value.replace(/[^0-9]/g, '');
    if (!raw) {
      input.value = '';
      if (helper) helper.style.display = 'none';
      return;
    }
    const num = parseInt(raw, 10);
    input.value = num.toLocaleString('id-ID');
    if (helper) {
      let verbal = '';
      if (num >= 1000000000) verbal = ` (${(num / 1000000000).toFixed(1)} Miliar)`;
      else if (num >= 1000000) verbal = ` (${(num / 1000000).toFixed(1)} Juta)`;
      else if (num >= 1000) verbal = ` (${(num / 1000).toFixed(0)} Ribu)`;
      
      helper.textContent = `Terbaca: ${formatMoney(num)}${verbal}`;
      helper.style.display = 'block';
    }
  };

  input.addEventListener('input', updateVal);
}

function parseRawNumber(str) {
  if (!str) return 0;
  const cleaned = String(str).replace(/[^0-9]/g, '');
  return Number(cleaned) || 0;
}

function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Attach Thousand Separators
  attachThousandsFormatter('txAmount', 'txAmountHelper');
  attachThousandsFormatter('accBalance', 'accBalanceHelper');

  // Currency Select
  document.getElementById('currencySelect').value = state.currency;
  document.getElementById('currencySelect').addEventListener('change', (e) => {
    state.currency = e.target.value;
    state.save();
    document.getElementById('formCurrencyPrefix').textContent = state.currency === 'IDR' ? 'Rp' : (state.currency === 'USD' ? '$' : '€');
    document.getElementById('budgetCurrencyPrefix').textContent = document.getElementById('formCurrencyPrefix').textContent;
    renderDashboard();
    renderTransactionsTable();
    renderBudgetsAndGoals();
    renderAccounts();
  });

  // Reset Data Handlers
  const resetTxOnlyBtn = document.getElementById('resetTransactionsOnlyBtn');
  if (resetTxOnlyBtn) {
    resetTxOnlyBtn.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin menghapus SELURUH riwayat transaksi dan mengosongkan saldo dompet menjadi Rp 0?')) {
        state.transactions = [];
        state.accounts.forEach(a => a.balance = 0);
        state.save();
        renderDashboard();
        renderTransactionsTable();
        renderAccounts();
        renderBudgetsAndGoals();
        populateFormDropdowns();
        showToast('Riwayat transaksi dibersihkan & saldo di-reset ke Rp 0', 'success');
      }
    });
  }

  const resetAllBtn = document.getElementById('resetAllDataBtn');
  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', () => {
      if (confirm('PERINGATAN: Ini akan menghapus SELURUH data Anda secara permanen dan mengembalikan aplikasi ke kondisi bersih awal. Lanjutkan?')) {
        localStorage.clear();
        location.reload();
      }
    });
  }

  // Hide Nominal Toggle
  document.querySelectorAll('.toggle-hide-nominal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.hideNominal = !state.hideNominal;
      state.save();
      updateHideNominalUI();
      renderDashboard();
      renderTransactionsTable();
      renderBudgetsAndGoals();
      renderAccounts();
      showToast(state.hideNominal ? 'Nominal disembunyikan' : 'Nominal ditampilkan', 'info');
    });
  });

  // Stats Carousel Scroll & Dots
  const carousel = document.getElementById('statsCarousel');
  const dots = document.querySelectorAll('#carouselDots .dot');
  if (carousel && dots.length > 0) {
    const cards = carousel.querySelectorAll('.stat-card');
    
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const cardArray = Array.from(cards);
            const idx = cardArray.indexOf(entry.target);
            if (idx !== -1) {
              dots.forEach((d, i) => {
                if (i === idx) d.classList.add('active');
                else d.classList.remove('active');
              });
            }
          }
        });
      }, { root: carousel, threshold: 0.5 });

      cards.forEach(card => observer.observe(card));
    } else {
      carousel.addEventListener('scroll', () => {
        const cardWidth = cards[0] ? cards[0].offsetWidth + 16 : 250;
        const index = Math.min(dots.length - 1, Math.max(0, Math.round(carousel.scrollLeft / cardWidth)));
        dots.forEach((d, i) => {
          if (i === index) d.classList.add('active');
          else d.classList.remove('active');
        });
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        if (cards[idx]) {
          cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }
      });
    });
  }

  // Profile Theme Switcher Buttons (Dark / Bright)
  const profileThemeBtnDark = document.getElementById('profileThemeBtnDark');
  const profileThemeBtnLight = document.getElementById('profileThemeBtnLight');
  
  if (profileThemeBtnDark) {
    profileThemeBtnDark.addEventListener('click', () => {
      if (state.theme !== 'dark') {
        state.theme = 'dark';
        state.save();
        applyTheme();
        renderDashboard();
        showToast('Tema diubah ke Dark Mode', 'info');
      }
    });
  }

  if (profileThemeBtnLight) {
    profileThemeBtnLight.addEventListener('click', () => {
      if (state.theme !== 'light') {
        state.theme = 'light';
        state.save();
        applyTheme();
        renderDashboard();
        showToast('Tema diubah ke Light Mode', 'info');
      }
    });
  }

  const mobileAddBtn = document.getElementById('mobileAddBtn');
  if (mobileAddBtn) {
    mobileAddBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openTxModalFunc();
    });
  }

  // Type Selector buttons in Form Modal
  const typeBtns = document.querySelectorAll('.type-btn');
  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const transferGroup = document.getElementById('transferTargetGroup');
      const catGroup = document.getElementById('categoryFormGroup');
      if (btn.dataset.type === 'TRANSFER') {
        transferGroup.classList.remove('hidden');
        catGroup.classList.add('hidden');
      } else {
        transferGroup.classList.add('hidden');
        catGroup.classList.remove('hidden');
      }
    });
  });

  // Add Transaction Modal
  const txModal = document.getElementById('txModal');
  const openTxModalFunc = () => {
    document.getElementById('txForm').reset();
    document.getElementById('txDate').value = getTodayDateStr();
    document.getElementById('txAmountHelper').style.display = 'none';
    txModal.style.display = '';
    txModal.classList.add('active');
  };

  const openAddTxBtn = document.getElementById('openAddTransactionBtn');
  if (openAddTxBtn) openAddTxBtn.addEventListener('click', openTxModalFunc);

  document.getElementById('closeTxModalBtn').addEventListener('click', () => txModal.classList.remove('active'));
  document.getElementById('cancelTxModalBtn').addEventListener('click', () => txModal.classList.remove('active'));

  document.getElementById('txForm').addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('[txForm] submit handler started');
    const activeTypeBtn = document.querySelector('.type-btn.active');
    const type = activeTypeBtn ? activeTypeBtn.dataset.type : 'EXPENSE';

    const tx = {
      type,
      amount: parseRawNumber(document.getElementById('txAmount').value),
      date: document.getElementById('txDate').value,
      category: type === 'TRANSFER' ? '' : document.getElementById('txCategory').value,
      account: document.getElementById('txAccount').value,
      targetAccount: document.getElementById('txTargetAccount').value,
      note: document.getElementById('txNote').value
    };
    console.log('[txForm] tx object:', tx);

    const savedTx = state.addTransaction(tx);
    console.log('[txForm] savedTx:', savedTx, 'total tx count:', state.transactions.length);
    txModal.classList.remove('active');
    txModal.style.display = 'none';
    console.log('[txForm] modal closed, rendering...');

    try {
      renderDashboard();
      console.log('[txForm] renderDashboard ok');
    } catch (err) {
      console.error('[txForm] renderDashboard error:', err);
      alert('Error renderDashboard: ' + err.message);
    }
    try {
      renderTransactionsTable();
      console.log('[txForm] renderTransactionsTable ok');
    } catch (err) {
      console.error('[txForm] renderTransactionsTable error:', err);
      alert('Error renderTransactionsTable: ' + err.message);
    }
    try {
      renderAccounts();
      console.log('[txForm] renderAccounts ok');
    } catch (err) {
      console.error('[txForm] renderAccounts error:', err);
      alert('Error renderAccounts: ' + err.message);
    }
    try {
      renderBudgetsAndGoals();
      console.log('[txForm] renderBudgetsAndGoals ok');
    } catch (err) {
      console.error('[txForm] renderBudgetsAndGoals error:', err);
      alert('Error renderBudgetsAndGoals: ' + err.message);
    }

    populateFormDropdowns();
    console.log('[txForm] populateFormDropdowns ok');

    txModal.style.display = '';
    console.log('[txForm] submit handler done');
  });

  // Account Modal
  const accModal = document.getElementById('accountModal');

  // Account Icon Selector Buttons
  const accIconBtns = document.querySelectorAll('#accIconGrid .icon-option-btn');
  accIconBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      accIconBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('accIcon').value = btn.dataset.icon;
    });
  });

  const openAccModalFunc = () => {
    document.getElementById('accId').value = '';
    document.getElementById('accountForm').reset();
    document.getElementById('accIcon').value = 'fa-wallet';
    accIconBtns.forEach(b => {
      if (b.dataset.icon === 'fa-wallet') b.classList.add('active');
      else b.classList.remove('active');
    });
    document.getElementById('accountModalTitle').textContent = 'Tambah Dompet Baru';
    document.getElementById('accBalanceHelper').style.display = 'none';
    accModal.classList.add('active');
  };

  document.getElementById('openAddAccountBtn').addEventListener('click', openAccModalFunc);
  document.getElementById('dashAddAccountBtn').addEventListener('click', openAccModalFunc);
  document.getElementById('closeAccountModalBtn').addEventListener('click', () => accModal.classList.remove('active'));
  document.getElementById('cancelAccountModalBtn').addEventListener('click', () => accModal.classList.remove('active'));

  document.getElementById('accountForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const accId = document.getElementById('accId').value;
    const name = document.getElementById('accName').value;
    const type = document.getElementById('accType').value;
    const icon = document.getElementById('accIcon').value || 'fa-wallet';
    const balance = parseRawNumber(document.getElementById('accBalance').value);

    if (accId) {
      const existing = state.accounts.find(a => a.id === accId);
      if (existing) {
        existing.name = name;
        existing.type = type;
        existing.icon = icon;
        existing.balance = balance;
      }
    } else {
      const newAcc = {
        id: 'acc-' + Date.now(),
        name,
        type,
        icon,
        balance,
        color: '#6366f1'
      };
      state.accounts.push(newAcc);
    }

    state.save();
    accModal.classList.remove('active');
    populateFormDropdowns();
    renderAccounts();
    renderDashboard();
    showToast(accId ? 'Dompet berhasil diperbarui' : 'Dompet baru berhasil ditambahkan', 'success');
  });

  // Budget Modal
  const budgetModal = document.getElementById('budgetModal');
  document.getElementById('openAddBudgetBtn').addEventListener('click', () => budgetModal.classList.add('active'));
  document.getElementById('closeBudgetModalBtn').addEventListener('click', () => budgetModal.classList.remove('active'));
  document.getElementById('cancelBudgetModalBtn').addEventListener('click', () => budgetModal.classList.remove('active'));

  document.getElementById('budgetForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const catId = document.getElementById('budgetCategory').value;
    const limit = Number(document.getElementById('budgetLimit').value);

    const existing = state.budgets.find(b => b.categoryId === catId);
    if (existing) existing.limit = limit;
    else state.budgets.push({ categoryId: catId, limit });

    state.save();
    budgetModal.classList.remove('active');
    renderBudgetsAndGoals();
    showToast('Anggaran berhasil diperbarui', 'success');
  });

  // Goal Modal & Savings Setor
  attachThousandsFormatter('goalTarget', 'goalTargetHelper');
  attachThousandsFormatter('goalCurrent', 'goalCurrentHelper');
  attachThousandsFormatter('savingsAmount', 'savingsAmountHelper');

  const goalModal = document.getElementById('goalModal');
  document.getElementById('openAddGoalBtn').addEventListener('click', () => {
    document.getElementById('goalId').value = '';
    document.getElementById('goalForm').reset();
    document.getElementById('goalTargetHelper').style.display = 'none';
    document.getElementById('goalCurrentHelper').style.display = 'none';
    document.getElementById('goalModalTitle').textContent = 'Tambah Target Tabungan';
    goalModal.classList.add('active');
  });
  document.getElementById('closeGoalModalBtn').addEventListener('click', () => goalModal.classList.remove('active'));
  document.getElementById('cancelGoalModalBtn').addEventListener('click', () => goalModal.classList.remove('active'));

  document.getElementById('goalForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const gId = document.getElementById('goalId').value;
    const name = document.getElementById('goalName').value;
    const target = parseRawNumber(document.getElementById('goalTarget').value);
    const current = parseRawNumber(document.getElementById('goalCurrent').value);

    if (gId) {
      const existing = state.goals.find(x => x.id === gId);
      if (existing) {
        existing.name = name;
        existing.target = target;
        existing.current = current;
      }
    } else {
      state.goals.push({
        id: 'goal-' + Date.now(),
        name,
        target,
        current,
        icon: 'fa-bullseye'
      });
    }

    state.save();
    goalModal.classList.remove('active');
    renderBudgetsAndGoals();
    showToast(gId ? 'Target tabungan diperbarui' : 'Target tabungan berhasil dibuat', 'success');
  });

  // Add Savings Setor Modal Handler
  const addSavingsModal = document.getElementById('addSavingsModal');
  document.getElementById('closeAddSavingsModalBtn').addEventListener('click', () => addSavingsModal.classList.remove('active'));
  document.getElementById('cancelAddSavingsModalBtn').addEventListener('click', () => addSavingsModal.classList.remove('active'));

  document.getElementById('addSavingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const goalId = document.getElementById('savingsGoalId').value;
    const amount = parseRawNumber(document.getElementById('savingsAmount').value);
    const sourceAccId = document.getElementById('savingsSourceAccount').value;

    const g = state.goals.find(x => x.id === goalId);
    if (!g || amount <= 0) return;

    g.current += amount;

    if (sourceAccId !== 'NONE') {
      const acc = state.accounts.find(a => a.id === sourceAccId);
      if (acc) {
        acc.balance -= amount;
        state.addTransaction({
          type: 'EXPENSE',
          amount,
          date: getTodayDateStr(),
          category: 'cat-shop',
          account: sourceAccId,
          note: `Setor Tabungan: ${g.name}`
        });
      }
    }

    state.save();
    addSavingsModal.classList.remove('active');
    renderBudgetsAndGoals();
    renderDashboard();
    renderTransactionsTable();
    renderAccounts();
    showToast(`Berhasil menambah ${formatMoney(amount)} ke target "${g.name}"!`, 'success');
  });

  // Spreadsheet Export/Import Listeners
  document.getElementById('exportCsvBtn').addEventListener('click', exportToCsv);

  const importModal = document.getElementById('importModal');
  document.getElementById('openImportModalBtn').addEventListener('click', () => {
    document.getElementById('importPreviewContainer').classList.add('hidden');
    document.getElementById('confirmImportBtn').classList.add('hidden');
    importModal.classList.add('active');
  });
  document.getElementById('closeImportModalBtn').addEventListener('click', () => importModal.classList.remove('active'));
  document.getElementById('cancelImportBtn').addEventListener('click', () => importModal.classList.remove('active'));

  const fileInput = document.getElementById('importFileInput');
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleCsvImport(e.target.files[0]);
  });

  document.getElementById('confirmImportBtn').addEventListener('click', () => {
    if (window._pendingImportTxs && window._pendingImportTxs.length > 0) {
      window._pendingImportTxs.forEach(t => state.addTransaction(t));
      importModal.classList.remove('active');
      renderDashboard();
      renderTransactionsTable();
      showToast(`${window._pendingImportTxs.length} transaksi berhasil diimpor`, 'success');
    }
  });

  // Webhook Modal & Config
  const webhookModal = document.getElementById('webhookModal');
  document.getElementById('openWebhookConfigBtn').addEventListener('click', () => {
    document.getElementById('webhookUrlInput').value = state.webhookUrl;
    document.getElementById('autoSyncToggle').checked = state.autoSync;
    webhookModal.classList.add('active');
  });
  document.getElementById('closeWebhookModalBtn').addEventListener('click', () => webhookModal.classList.remove('active'));

  document.getElementById('saveWebhookBtn').addEventListener('click', () => {
    state.webhookUrl = document.getElementById('webhookUrlInput').value.trim();
    state.autoSync = document.getElementById('autoSyncToggle').checked;
    state.save();
    updateSyncStatusWidget();
    webhookModal.classList.remove('active');
    showToast('Pengaturan Google Sheets disimpan', 'success');
  });

  document.getElementById('quickSyncBtn').addEventListener('click', () => {
    if (!state.webhookUrl) {
      document.getElementById('openWebhookConfigBtn').click();
    } else {
      if (state.transactions.length > 0) {
        syncTransactionToGoogleSheets(state.transactions[0]);
      } else {
        showToast('Tidak ada transaksi untuk di-sync', 'info');
      }
    }
  });

  document.getElementById('copyAppsScriptBtn').addEventListener('click', () => {
    const code = document.getElementById('appsScriptCodeText').textContent;
    navigator.clipboard.writeText(code).then(() => {
      showToast('Kode Apps Script tersalin!', 'success');
    });
  });

  // Filter Bar change listeners
  document.getElementById('txSearchInput').addEventListener('input', renderTransactionsTable);
  document.getElementById('txTypeFilter').addEventListener('change', renderTransactionsTable);
  document.getElementById('txCategoryFilter').addEventListener('change', renderTransactionsTable);
  document.getElementById('txAccountFilter').addEventListener('change', renderTransactionsTable);
  
  document.getElementById('txMonthFilter').addEventListener('change', renderTransactionsTable);

  document.getElementById('resetFilterBtn').addEventListener('click', () => {
    document.getElementById('txSearchInput').value = '';
    document.getElementById('txTypeFilter').value = 'ALL';
    document.getElementById('txCategoryFilter').value = 'ALL';
    document.getElementById('txAccountFilter').value = 'ALL';
    document.getElementById('txMonthFilter').value = '';
    renderTransactionsTable();
  });

  // Category Modal Handlers
  const catModal = document.getElementById('categoryModal');
  const catIconBtns = document.querySelectorAll('#catIconGrid .icon-option-btn');
  catIconBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catIconBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('catIcon').value = btn.dataset.icon;
    });
  });

  const openCatModalBtn = document.getElementById('openAddCategoryBtn');
  if (openCatModalBtn) {
    openCatModalBtn.addEventListener('click', () => {
      document.getElementById('editCatId').value = '';
      document.getElementById('categoryForm').reset();
      document.getElementById('catIcon').value = 'fa-utensils';
      catIconBtns.forEach(b => {
        if (b.dataset.icon === 'fa-utensils') b.classList.add('active');
        else b.classList.remove('active');
      });
      document.getElementById('categoryModalTitle').textContent = 'Tambah Kategori Baru';
      catModal.classList.add('active');
    });
  }

  document.getElementById('closeCategoryModalBtn').addEventListener('click', () => catModal.classList.remove('active'));
  document.getElementById('cancelCategoryModalBtn').addEventListener('click', () => catModal.classList.remove('active'));

  document.getElementById('categoryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('editCatId').value;
    const name = document.getElementById('catName').value;
    const type = document.getElementById('catType').value;
    const color = document.getElementById('catColor').value || '#ef4444';
    const icon = document.getElementById('catIcon').value || 'fa-utensils';

    if (editId) {
      // Find and update existing
      ['EXPENSE', 'INCOME'].forEach(t => {
        const item = state.categories[t].find(c => c.id === editId);
        if (item) {
          item.name = name;
          item.color = color;
          item.icon = icon;
        }
      });
    } else {
      // Add new category
      const newCat = {
        id: 'cat-' + Date.now(),
        name,
        icon,
        color
      };
      if (!state.categories[type]) state.categories[type] = [];
      state.categories[type].push(newCat);
    }

    state.save();
    catModal.classList.remove('active');
    populateFormDropdowns();
    renderCategoryManagement();
    renderDashboard();
    renderTransactionsTable();
    showToast(editId ? 'Kategori berhasil diperbarui' : 'Kategori baru berhasil ditambahkan', 'success');
  });

  // Floating Hide Nominal FAB Button Listeners
  document.querySelectorAll('.toggle-hide-nominal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleHideNominalState();
    });
  });

  // Render initial Category Management and set default hide nominal UI
  renderCategoryManagement();
  updateHideNominalUI();

  // Auth Form Listeners
  const authForm = document.getElementById('authForm');
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('authUsername').value.trim();
      const passcode = document.getElementById('authPasscode').value.trim();
      const errorMsg = document.getElementById('authErrorMsg');

      if (!username || !passcode) {
        if (errorMsg) {
          errorMsg.style.display = 'block';
          errorMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Username dan PIN harus diisi.';
        }
        return;
      }

      if (window._authFormMode === 'REGISTER') {
        const result = await window._checkUsernameAvailable(username);
        if (!result.available) {
          if (errorMsg) {
            errorMsg.style.display = 'block';
            errorMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> ' + result.message;
          }
          return;
        }

        try {
          if (_firebaseDb) {
            await _firebaseDb.ref('users/' + username + '/info').set({
              registeredAt: firebase.database.ServerValue.TIMESTAMP,
              passcode: passcode
            });
          }
        } catch (err) {
          console.error('Firebase register error:', err);
        }

        if (!_firebaseDb) {
          const proceed = confirm('Sinkronisasi Cloud (Firebase) belum aktif di perangkat ini.\n\nAkun baru ini hanya tersimpan di perangkat ini dan TIDAK akan tersinkron ke HP Anda.\n\nAgar bisa login di semua perangkat: buka Pengaturan → Sinkronisasi Cloud, lalu tempelkan Firebase Config yang sama seperti di HP.\n\nTetap daftar secara lokal?');
          if (!proceed) return;
        }

        state.username = username;
        state.passcode = passcode;
        state.isRegistered = true;
        state.isLoggedIn = true;
        state.isGuestMode = false;
        sessionStorage.setItem('wallet_session_active', 'true');
        await window._syncOnLogin();
        window._startFirebaseListener();
        if (errorMsg) errorMsg.style.display = 'none';
        window._closeAuthModal();
        updateAuthUI();
        renderDashboard();
        renderAccounts();
        renderBudgetsAndGoals();
        renderTransactionsTable();
      } else {
        let credentialsOk = false;

        if (_firebaseDb) {
          try {
            const snapshot = await _firebaseDb.ref('users/' + username + '/info').once('value');
            const info = snapshot.val();
            credentialsOk = !!(info && info.passcode && info.passcode === passcode);
          } catch (err) {
            console.error('Firebase login check error:', err);
            credentialsOk = false;
          }
          if (!credentialsOk) {
            credentialsOk = username.toLowerCase() === state.username.toLowerCase() && passcode === state.passcode;
          }
        } else {
          credentialsOk = username.toLowerCase() === state.username.toLowerCase() && passcode === state.passcode;
        }

        if (credentialsOk) {
          state.username = username;
          state.passcode = passcode;
          state.isRegistered = true;
          state.isLoggedIn = true;
          state.isGuestMode = false;
          sessionStorage.setItem('wallet_session_active', 'true');
          await window._syncOnLogin();
          window._startFirebaseListener();
          if (errorMsg) errorMsg.style.display = 'none';
          window._closeAuthModal();
          updateAuthUI();
          renderDashboard();
          renderAccounts();
          renderBudgetsAndGoals();
          renderTransactionsTable();
        } else {
          if (errorMsg) {
            errorMsg.style.display = 'block';
            const hint = _firebaseDb
              ? 'Pastikan Username dan PIN sama persis (Username bersifat case-sensitive) dengan yang terdaftar di HP.'
              : 'Koneksi Cloud (Firebase) belum aktif di perangkat ini. Buka Pengaturan → Sinkronisasi Cloud, tempelkan Firebase Config yang SAMA seperti di HP, lalu coba login lagi.';
            errorMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Username tidak ditemukan atau PIN salah!<br><small style="font-weight: 400;">' + hint + '</small>';
          }
        }
      }
    });
  }

  const closeAuthBtn = document.getElementById('closeAuthModalBtn');
  if (closeAuthBtn) closeAuthBtn.addEventListener('click', window._closeAuthModal);
}

// Floating Hide Nominal FAB & Auto-Hide 5-Second Timer
let _autoHideTimer = null;

window.toggleHideNominalState = function(e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }

  state.hideNominal = !state.hideNominal;
  state.save();

  if (_autoHideTimer) {
    clearTimeout(_autoHideTimer);
    _autoHideTimer = null;
  }

  if (!state.hideNominal) {
    showToast('Nominal ditampilkan (Auto-hide dalam 5 detik)', 'info');
    _autoHideTimer = setTimeout(() => {
      state.hideNominal = true;
      state.save();
      updateHideNominalUI();
      showToast('Nominal disembunyikan kembali', 'info');
    }, 5000);
  } else {
    showToast('Nominal disembunyikan', 'info');
  }

  updateHideNominalUI();
};

function updateHideNominalUI() {
  const icons = document.querySelectorAll('.hide-nominal-icon');
  icons.forEach(icon => {
    if (state.hideNominal) {
      icon.className = 'fa-solid fa-eye-slash hide-nominal-icon';
    } else {
      icon.className = 'fa-solid fa-eye hide-nominal-icon';
    }
  });

  const floatingBtn = document.getElementById('floatingHideBtn');
  if (floatingBtn) {
    floatingBtn.classList.toggle('active-unhidden', !state.hideNominal);
  }

  renderDashboard();
  renderAccounts();
}

// Toast Helper (Disabled per user request)
function showToast(message, type = 'info') {
  // Toasts disabled
  return;
}

// Authentication & Access Control Functions
window._authFormMode = 'LOGIN'; // 'LOGIN' or 'REGISTER'

window._openAuthModal = function() {
  const modal = document.getElementById('authModal');
  if (!modal) return;

  const usernameInput = document.getElementById('authUsername');
  const passcodeInput = document.getElementById('authPasscode');
  const errorMsg = document.getElementById('authErrorMsg');

  if (errorMsg) errorMsg.style.display = 'none';
  if (usernameInput) usernameInput.value = state.username || '';
  if (passcodeInput) passcodeInput.value = '';

  if (!state.isRegistered) {
    window._authFormMode = 'REGISTER';
  } else {
    window._authFormMode = 'LOGIN';
  }

  window._updateAuthFormUI();
  modal.classList.add('active');
};

window._closeAuthModal = function() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('active');
};

window._toggleAuthFormMode = function() {
  window._authFormMode = window._authFormMode === 'LOGIN' ? 'REGISTER' : 'LOGIN';
  window._updateAuthFormUI();
};

window._updateAuthFormUI = function() {
  const title = document.getElementById('authModalTitle');
  const desc = document.getElementById('authModalDesc');
  const submitBtnText = document.getElementById('authSubmitBtnText');
  const toggleBtn = document.getElementById('authToggleModeBtn');
  const usernameInput = document.getElementById('authUsername');

  if (window._authFormMode === 'REGISTER') {
    if (title) title.innerHTML = '<i class="fa-solid fa-user-plus text-primary"></i> Daftar';
    if (desc) desc.textContent = 'Buat Username dan PIN 4-6 digit angka untuk mengamankan hak akses edit.';
    if (submitBtnText) submitBtnText.textContent = 'Daftar';
    if (toggleBtn) toggleBtn.textContent = 'Sudah punya PIN? Login';
    if (usernameInput) usernameInput.readOnly = false;
  } else {
    if (title) title.innerHTML = '<i class="fa-solid fa-user-shield text-primary"></i> Login';
    if (desc) desc.textContent = 'Masukkan Username dan PIN untuk mengedit data.';
    if (submitBtnText) submitBtnText.textContent = 'Masuk';
    if (toggleBtn) toggleBtn.textContent = 'Belum punya PIN? Daftar';
  }
};

window._enterGuestMode = function() {
  state.isLoggedIn = false;
  state.isGuestMode = true;
  sessionStorage.removeItem('wallet_session_active');
  window._stopFirebaseListener();
  window._closeAuthModal();
  updateAuthUI();
};

window._logoutOwner = function() {
  console.log('[Auth] logout triggered');
  state.isLoggedIn = false;
  state.isGuestMode = true;
  sessionStorage.removeItem('wallet_session_active');
  try { window._stopFirebaseListener(); } catch (err) { console.error('[Auth] stop listener error:', err); }
  try {
    updateAuthUI();
  } catch (err) {
    console.error('[Auth] updateAuthUI error:', err);
  }
  location.reload();
};

function updateAuthUI() {
  const guestModeBanner = document.getElementById('guestModeBanner');
  const headerStatus = document.getElementById('headerUserStatus');
  const profileBadge = document.getElementById('profileAuthBadge');
  const profileInfo = document.getElementById('profileAuthInfo');
  const registerLoginBtnText = document.getElementById('profileAuthBtnText');
  const logoutBtn = document.getElementById('profileLogoutBtn');

  if (state.isLoggedIn) {
    document.body.classList.remove('guest-mode');
    document.querySelectorAll('.owner-only:not(.desktop-only)').forEach(el => el.style.setProperty('display', 'block', 'important'));
    if (window.innerWidth >= 768) {
      document.querySelectorAll('.owner-only.desktop-only').forEach(el => el.style.setProperty('display', 'block', 'important'));
    } else {
      document.querySelectorAll('.desktop-only').forEach(el => el.style.setProperty('display', 'none', 'important'));
    }
    if (guestModeBanner) guestModeBanner.style.display = 'none';

    if (headerStatus) {
      headerStatus.innerHTML = `
        <span class="owner-badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; border: 1px solid rgba(16, 185, 129, 0.3);">
          <i class="fa-solid fa-user-shield"></i> ${state.username}
        </span>
        <button onclick="window._logoutOwner()" class="btn btn-sm btn-secondary" style="padding: 4px 8px; font-size: 11px; margin-left: 6px;" title="Logout Pemilik">
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      `;
    }

    if (profileBadge) {
      profileBadge.textContent = 'Pemilik Active';
      profileBadge.className = 'badge badge-success';
    }

    if (profileInfo) {
      profileInfo.innerHTML = `Terhubung sebagai <strong>${state.username}</strong> (Mode Edit Penuh). Anda memiliki hak penuh untuk menambah, mengedit, atau menghapus data.`;
    }

    if (registerLoginBtnText) registerLoginBtnText.textContent = 'Ubah Username / PIN';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
  } else {
    document.body.classList.add('guest-mode');
    document.querySelectorAll('.owner-only').forEach(el => el.style.setProperty('display', 'none', 'important'));
    if (guestModeBanner) guestModeBanner.style.display = 'flex';

    if (headerStatus) {
      headerStatus.innerHTML = `
        <span class="guest-badge" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; border: 1px solid rgba(245, 158, 11, 0.3);">
          <i class="fa-solid fa-eye"></i> Mode Tamu
        </span>
        <button onclick="window._openAuthModal()" class="btn btn-sm btn-primary" style="padding: 4px 10px; font-size: 12px; margin-left: 6px;">Login</button>
      `;
    }

    if (profileBadge) {
      profileBadge.textContent = 'Mode Tamu (Read-Only)';
      profileBadge.className = 'badge badge-warning';
    }

    if (profileInfo) {
      if (state.isRegistered) {
        profileInfo.innerHTML = `Aplikasi dalam <strong>Mode Tamu (Hanya Lihat)</strong>. Login sebagai <strong>${state.username}</strong> dengan PIN untuk mengedit data.`;
      } else {
        profileInfo.innerHTML = `Belum ada PIN terdaftar. Daftarkan Username & PIN agar hanya Anda yang dapat mengedit data.`;
      }
    }

    if (registerLoginBtnText) registerLoginBtnText.textContent = state.isRegistered ? 'Login' : 'Daftar';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

// Firebase Realtime Cloud Sync Logic
let _firebaseDb = null;
let _isFirebaseRemoteUpdate = false;
let _firebaseUnsubscribe = null;
let _pendingSyncId = null;

function _getFirebaseUserPath() {
  if (!state.isLoggedIn || !state.username) return null;
  return 'users/' + state.username + '/wallet_data';
}

window._startFirebaseListener = function() {
  const path = _getFirebaseUserPath();
  if (!path || !_firebaseDb) return;

  if (_firebaseUnsubscribe) {
    _firebaseUnsubscribe();
    _firebaseUnsubscribe = null;
  }

  _firebaseUnsubscribe = _firebaseDb.ref(path).on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    if (_pendingSyncId && data.syncId === _pendingSyncId) {
      console.log('[Firebase] echo of own push, normalizing _lastUpdate');
      _pendingSyncId = null;
      state._lastUpdate = data.updatedAt || 0;
      localStorage.setItem('wallet_last_update', state._lastUpdate);
      return;
    }

    const remoteUpdate = data.updatedAt || 0;
    const localUpdate = state._lastUpdate || 0;
    if (remoteUpdate <= localUpdate) {
      console.log('[Firebase] skipping remote update - local is newer/equal (remote:', remoteUpdate, 'local:', localUpdate, ')');
      return;
    }
    console.log('[Firebase] applying remote update (remote:', remoteUpdate, 'local:', localUpdate, ')');
    _isFirebaseRemoteUpdate = true;
    if (data.accounts) state.accounts = data.accounts;
    if (data.transactions) state.transactions = data.transactions;
    if (data.budgets) state.budgets = data.budgets;
    if (data.goals) state.goals = data.goals;
    if (data.categories) state.categories = data.categories;

    state.save();
    state._lastUpdate = remoteUpdate;
    localStorage.setItem('wallet_last_update', remoteUpdate);

    _isFirebaseRemoteUpdate = false;

    renderDashboard();
    renderAccounts();
    renderBudgetsAndGoals();
    renderTransactionsTable();
  });
};

window._stopFirebaseListener = function() {
  if (_firebaseUnsubscribe) {
    _firebaseUnsubscribe();
    _firebaseUnsubscribe = null;
  }
  _pendingSyncId = null;
};

window._syncStateToFirebase = function() {
  if (_isFirebaseRemoteUpdate || !_firebaseDb || !state.isLoggedIn) return;
  const path = _getFirebaseUserPath();
  if (!path) return;
  try {
    _pendingSyncId = 'sync-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    _firebaseDb.ref(path).set({
      accounts: state.accounts,
      transactions: state.transactions,
      budgets: state.budgets,
      goals: state.goals,
      categories: state.categories,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
      syncId: _pendingSyncId
    });
  } catch (e) {
    console.error('Firebase sync error:', e);
  }
};

window._syncOnLogin = async function() {
  const path = _getFirebaseUserPath();
  if (!path || !_firebaseDb) {
    state.save();
    return;
  }

  try {
    const snapshot = await _firebaseDb.ref(path).once('value');
    const data = snapshot.val();

    if (data && (data.transactions || data.accounts)) {
      const remoteUpdate = data.updatedAt || 0;
      const localUpdate = state._lastUpdate || 0;
      if (remoteUpdate <= localUpdate && state.transactions.length > 0) {
        console.log('[Firebase] _syncOnLogin: local is newer/equal, keeping local data');
        state.save();
        return;
      }
      console.log('[Firebase] _syncOnLogin: loading existing cloud data');
      _isFirebaseRemoteUpdate = true;
      if (data.accounts) state.accounts = data.accounts;
      if (data.transactions) state.transactions = data.transactions;
      if (data.budgets) state.budgets = data.budgets;
      if (data.goals) state.goals = data.goals;
      if (data.categories) state.categories = data.categories;
      state.save();
      state._lastUpdate = remoteUpdate;
      localStorage.setItem('wallet_last_update', state._lastUpdate);
      _isFirebaseRemoteUpdate = false;
    } else {
      console.log('[Firebase] _syncOnLogin: no cloud data, pushing local data');
      state.save();
    }
  } catch (e) {
    console.error('Firebase sync on login error:', e);
    state.save();
  }
};

window._checkUsernameAvailable = async function(username) {
  if (!_firebaseDb) return { available: true };
  try {
    const snapshot = await _firebaseDb.ref('users/' + username + '/info').once('value');
    if (snapshot.exists()) {
      return { available: false, message: 'Username "' + username + '" sudah digunakan. Silakan pilih username lain.' };
    }
    return { available: true };
  } catch (e) {
    console.error('Firebase username check error:', e);
    return { available: true };
  }
};

const DEFAULT_FIREBASE_CONFIG = 'https://wallet-app-3e58a-default-rtdb.firebaseio.com/';

window._initFirebaseSync = function() {
  window._stopFirebaseListener();
  const configRaw = localStorage.getItem('wallet_firebase_config') || DEFAULT_FIREBASE_CONFIG;
  const badge = document.getElementById('firebaseStatusBadge');
  const input = document.getElementById('firebaseConfigInput');
  const disconnectBtn = document.getElementById('disconnectFirebaseBtn');

  if (input && configRaw) input.value = configRaw;

  if (typeof firebase === 'undefined') {
    _firebaseDb = null;
    if (badge) {
      badge.textContent = 'Nonaktif';
      badge.className = 'badge badge-warning';
    }
    if (disconnectBtn) disconnectBtn.style.display = 'none';
    return;
  }

  try {
    let configObj;
    if (configRaw.trim().startsWith('{')) {
      configObj = JSON.parse(configRaw);
    } else if (configRaw.trim().startsWith('http')) {
      configObj = { databaseURL: configRaw.trim() };
    } else {
      throw new Error('Format Firebase Config tidak valid');
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(configObj);
    }
    _firebaseDb = firebase.database();

    if (disconnectBtn) disconnectBtn.style.display = 'inline-flex';

    if (badge) {
      badge.textContent = 'Connected (Realtime)';
      badge.className = 'badge badge-success';
    }

    window._startFirebaseListener();
  } catch (err) {
    console.error('Firebase init error:', err);
    _firebaseDb = null;
    if (badge) {
      badge.textContent = 'Error Connection';
      badge.className = 'badge badge-danger';
    }
  }
};

window._saveFirebaseConfig = function() {
  const input = document.getElementById('firebaseConfigInput');
  if (!input) return;
  const val = input.value.trim();
  if (!val) {
    alert('Masukkan Firebase Config JSON atau Database URL terlebih dahulu.');
    return;
  }
  localStorage.setItem('wallet_firebase_config', val);
  alert('Firebase Config berhasil disimpan. Menghubungkan ke Realtime Cloud Database...');
  window._initFirebaseSync();
};

window._disconnectFirebase = function() {
  if (confirm('Hapus config kustom ini dan kembali ke koneksi bawaan aplikasi?')) {
    localStorage.removeItem('wallet_firebase_config');
    window._stopFirebaseListener();
    window._initFirebaseSync();
  }
};

// Prevent double-tap zoom for native iOS App feel
let _lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = (new Date()).getTime();
  if (now - _lastTouchEnd <= 300) {
    e.preventDefault();
  }
  _lastTouchEnd = now;
}, false);

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', initUI);
