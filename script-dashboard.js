/**
 * AI+U - 數據後台管理與分析 腳本
 */

document.addEventListener('DOMContentLoaded', () => {
  const isLoginPage = document.body.classList.contains('login-page');
  const isDashboardPage = document.body.classList.contains('dashboard-page');

  if (isLoginPage) {
    initLogin();
  } else if (isDashboardPage) {
    checkAuth();
    initDashboard();
  }
});

/* ==========================================================================
   1. 權限認證守衛 (Authentication Guards)
   ========================================================================== */
function checkAuth() {
  const isAuth = sessionStorage.getItem('aiu_auth') === 'true';
  if (!isAuth) {
    // 未登入，重新導向至登入頁面
    window.location.href = 'login.html';
  }
}

/* ==========================================================================
   2. 登入頁面邏輯 (Login Page Logic)
   ========================================================================== */
function initLogin() {
  // 若已登入，直接導向後台
  if (sessionStorage.getItem('aiu_auth') === 'true') {
    window.location.href = 'dashboard.html';
    return;
  }

  const loginForm = document.getElementById('login-form');
  const submitBtn = document.getElementById('btn-login');
  const toast = document.getElementById('toast-notification');
  const togglePasswordBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');

  if (!loginForm) return;

  // 密碼顯示/隱藏切換
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      const icon = togglePasswordBtn.querySelector('i');
      if (icon) {
        icon.className = type === 'password' ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
      }
    });
  }

  // 登入提交事件
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showToast('請輸入管理員帳號與安全密碼！', 'fa-solid fa-triangle-exclamation');
      return;
    }

    // 進入登入載入中狀態
    const originalBtnText = submitBtn.querySelector('.btn-text').textContent;
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = '驗證管理員身份...';
    const loginIcon = submitBtn.querySelector('.login-icon');
    if (loginIcon) {
      loginIcon.className = 'fa-solid fa-spinner fa-spin login-icon';
    }

    // 模擬 1.0 秒驗證延遲
    setTimeout(() => {
      // 驗證預設帳密 (帳號: admin, 密碼: aiu888)
      if (username === 'admin' && password === 'aiu888') {
        sessionStorage.setItem('aiu_auth', 'true');
        window.location.href = 'dashboard.html';
      } else {
        // 還原按鈕狀態
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = originalBtnText;
        if (loginIcon) {
          loginIcon.className = 'fa-solid fa-right-to-bracket login-icon';
        }
        // 顯示錯誤 Toast
        showToast('管理員帳號或密碼錯誤！', 'fa-solid fa-triangle-exclamation');
      }
    }, 1000);
  });

  // 展示自訂 Toast 提示
  function showToast(message, iconClass) {
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    if (toastIcon) toastIcon.className = `${iconClass} toast-icon`;
    if (toastMessage) toastMessage.textContent = message;

    toast.classList.add('show');
    
    // 3.0 秒後自動隱藏
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

/* ==========================================================================
   3. 後台主面板邏輯 (Dashboard Main Logic)
   ========================================================================== */
function initDashboard() {
  // 顯示今日日期
  const dateBadge = document.getElementById('current-date-badge');
  if (dateBadge) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    dateBadge.textContent = new Date().toLocaleDateString('zh-TW', options);
  }

  // 登出按鈕事件
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('aiu_auth');
      window.location.href = 'login.html';
    });
  }

  // 載入數據與表格
  loadDashboardData();

  // 監聽表格篩選器變更
  const filterSelect = document.getElementById('filter-source');
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      renderInquiriesTable(e.target.value);
    });
  }
}

// 載入與計算數據
function loadDashboardData() {
  // 1. 讀取瀏覽量
  const pvWebsite = parseInt(localStorage.getItem('aiu_pv_website') || '0');
  const pvCard = parseInt(localStorage.getItem('aiu_pv_card') || '0');
  const totalPV = pvWebsite + pvCard;
  
  const pvEl = document.getElementById('kpi-total-pv');
  if (pvEl) pvEl.textContent = totalPV.toLocaleString();

  // 2. 讀取預約諮詢量
  const inquiries = JSON.parse(localStorage.getItem('aiu_inquiries') || '[]');
  const inqEl = document.getElementById('kpi-total-inq');
  if (inqEl) inqEl.textContent = inquiries.length.toLocaleString();

  // 3. 讀取下載名片次數
  const vcardClicks = parseInt(localStorage.getItem('aiu_click_vcard') || '0');
  const vcardEl = document.getElementById('kpi-vcard-clicks');
  if (vcardEl) vcardEl.textContent = vcardClicks.toLocaleString();

  // 4. 讀取捷徑社群按鈕點擊數
  const clickCall = parseInt(localStorage.getItem('aiu_click_call') || '0');
  const clickLine = parseInt(localStorage.getItem('aiu_click_line') || '0');
  const clickMap = parseInt(localStorage.getItem('aiu_click_map') || '0');
  const clickEmail = parseInt(localStorage.getItem('aiu_click_email') || '0');
  const totalSocialClicks = clickCall + clickLine + clickMap + clickEmail;
  
  const socialEl = document.getElementById('kpi-social-clicks');
  if (socialEl) socialEl.textContent = totalSocialClicks.toLocaleString();

  // 5. 渲染圖表
  renderPvTrendChart(pvWebsite, pvCard);
  renderClicksPieChart(vcardClicks, clickCall, clickLine, clickMap, clickEmail);

  // 6. 渲染表格名單
  renderInquiriesTable('all');
}

/* ==========================================================================
   4. 漸層趨勢曲線圖 (SVG Line Chart)
   ========================================================================== */
function renderPvTrendChart() {
  const chartBox = document.getElementById('pv-trend-chart-box');
  if (!chartBox) return;

  // 獲取最近 7 天的日期格式與標籤 (MM/DD)
  const days = [];
  const dateLabels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push(dateStr);
    dateLabels.push((d.getMonth() + 1) + '/' + d.getDate());
  }

  // 獲取 localStorage 中的每日趨勢數據
  const trendWebsite = JSON.parse(localStorage.getItem('aiu_pv_trend_website') || '{}');
  const trendCard = JSON.parse(localStorage.getItem('aiu_pv_trend_card') || '{}');

  const dataWebsite = days.map(day => trendWebsite[day] || 0);
  const dataCard = days.map(day => trendCard[day] || 0);

  // 若資料皆為 0，則給予一些預設模擬數據，使其看起來有高質感展示效果
  const isDataEmpty = dataWebsite.every(v => v === 0) && dataCard.every(v => v === 0);
  let finalWebsite = [...dataWebsite];
  let finalCard = [...dataCard];

  if (isDataEmpty) {
    // 預設模擬流量數據
    finalWebsite = [12, 18, 15, 25, 32, 28, 38];
    finalCard = [8, 12, 10, 18, 22, 20, 26];
  }

  // 計算 Y 軸最大刻度
  const maxVal = Math.max(...finalWebsite, ...finalCard, 10) * 1.2;

  // SVG 參數設定
  const padding = 40;
  const width = 500;
  const height = 240;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // 計算座標點
  const getCoordinates = (data) => {
    return data.map((val, index) => {
      const x = padding + (index * (chartWidth / 6));
      const y = padding + chartHeight - (val / maxVal * chartHeight);
      return { x, y };
    });
  };

  const coordsWebsite = getCoordinates(finalWebsite);
  const coordsCard = getCoordinates(finalCard);

  // 繪製 Bezier 曲線路徑的 Helper
  const getCurvePath = (points) => {
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const cpX1 = points[i].x + (points[i+1].x - points[i].x) / 3;
      const cpY1 = points[i].y;
      const cpX2 = points[i].x + 2 * (points[i+1].x - points[i].x) / 3;
      const cpY2 = points[i+1].y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i+1].x} ${points[i+1].y}`;
    }
    return path;
  };

  const pathWebsite = getCurvePath(coordsWebsite);
  const pathCard = getCurvePath(coordsCard);

  // 漸層填滿區域路徑
  const areaWebsite = `${pathWebsite} L ${coordsWebsite[6].x} ${height - padding} L ${coordsWebsite[0].x} ${height - padding} Z`;
  const areaCard = `${pathCard} L ${coordsCard[6].x} ${height - padding} L ${coordsCard[0].x} ${height - padding} Z`;

  // 繪製背景網格線
  let gridLines = '';
  for (let i = 0; i <= 4; i++) {
    const y = padding + (i * (chartHeight / 4));
    const labelVal = Math.round(maxVal - (i * (maxVal / 4)));
    gridLines += `
      <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" class="chart-grid-line" />
      <text x="${padding - 10}" y="${y + 4}" text-anchor="end" class="chart-axis-text">${labelVal}</text>
    `;
  }

  // 繪製 X 軸日期標籤
  let xAxisLabels = '';
  coordsWebsite.forEach((pt, index) => {
    xAxisLabels += `
      <text x="${pt.x}" y="${height - padding + 20}" text-anchor="middle" class="chart-axis-text">${dateLabels[index]}</text>
    `;
  });

  // 繪製折線點
  let pointsDot = '';
  coordsWebsite.forEach(pt => {
    pointsDot += `<circle cx="${pt.x}" cy="${pt.y}" class="chart-point-website" />`;
  });
  coordsCard.forEach(pt => {
    pointsDot += `<circle cx="${pt.x}" cy="${pt.y}" class="chart-point-card" />`;
  });

  // 組裝 SVG HTML
  const svgHtml = `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-website" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#E91B62" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#E91B62" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="grad-card" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#00B4D8" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#00B4D8" stop-opacity="0"/>
        </linearGradient>
      </defs>
      
      <!-- 網格線與 Y 軸 -->
      ${gridLines}
      
      <!-- X 軸標籤 -->
      ${xAxisLabels}
      
      <!-- 漸層填滿面積 -->
      <path d="${areaWebsite}" class="chart-area-website" />
      <path d="${areaCard}" class="chart-area-card" />
      
      <!-- 趨勢曲線 -->
      <path d="${pathWebsite}" class="chart-line-website" />
      <path d="${pathCard}" class="chart-line-card" />
      
      <!-- 座標圓點 -->
      ${pointsDot}
      
      <!-- 軸線 -->
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="chart-axis-line" />
    </svg>
  `;

  chartBox.innerHTML = svgHtml;
}

/* ==========================================================================
   5. 圓環比例圖 (SVG Donut Chart)
   ========================================================================== */
function renderClicksPieChart(clickVcard, clickCall, clickLine, clickMap, clickEmail) {
  const chartBox = document.getElementById('clicks-pie-chart-box');
  if (!chartBox) return;

  const total = clickVcard + clickCall + clickLine + clickMap + clickEmail;

  // 若點擊數據為 0，則使用預設模擬數值進行高質感介面展示
  const isDataEmpty = total === 0;
  const values = isDataEmpty ? [20, 15, 35, 10, 8] : [clickVcard, clickCall, clickLine, clickMap, clickEmail];
  const finalTotal = isDataEmpty ? 88 : total;

  const labels = ['儲存通訊錄', '撥號點擊', 'LINE 聯絡', '地圖導航', '電子郵件'];
  const colorsClass = ['donut-slice-vcard', 'donut-slice-call', 'donut-slice-line', 'donut-slice-map', 'donut-slice-email'];
  const rawColors = ['#E91B62', '#9C27B0', '#4CAF50', '#00B4D8', '#FFEB3B'];

  // 計算各圓弧段所佔周長比例 (圓形周長 = 2 * PI * r)
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // 約 238.76

  let currentOffset = 0;
  let circlesHtml = '';
  let legendHtml = '';

  values.forEach((val, i) => {
    const percentage = val / finalTotal;
    const strokeDash = circumference * percentage;
    const strokeOffset = currentOffset;
    
    // 累計偏移量
    currentOffset -= strokeDash;

    if (val > 0) {
      circlesHtml += `
        <circle cx="50" cy="50" r="${radius}" 
          class="donut-slice ${colorsClass[i]}" 
          stroke-dasharray="${strokeDash} ${circumference - strokeDash}" 
          stroke-dashoffset="${strokeOffset}" 
          transform="rotate(-90 50 50)" />
      `;
    }

    const percentText = Math.round(percentage * 100) + '%';
    legendHtml += `
      <div class="donut-legend-row">
        <span class="donut-legend-label">
          <span class="legend-dot" style="background: ${rawColors[i]}"></span>
          <span>${labels[i]}</span>
        </span>
        <span class="donut-legend-val">${val} (${percentText})</span>
      </div>
    `;
  });

  // 如果完全沒有數據，顯示一個空的灰圈
  if (total === 0 && !isDataEmpty) {
    circlesHtml = `<circle cx="50" cy="50" r="${radius}" class="donut-slice-empty" />`;
  }

  const svgHtml = `
    <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
      <div style="width: 140px; height: 140px;">
        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
          <!-- 底灰圈 -->
          <circle cx="50" cy="50" r="${radius}" class="donut-slice-empty" />
          <!-- 數據扇區 -->
          ${circlesHtml}
          <!-- 置中標籤與文字 -->
          <text x="50" y="47" class="donut-center-text-label">總點擊數</text>
          <text x="50" y="62" class="donut-center-text-val">${total}</text>
        </svg>
      </div>
      
      <!-- 圓環圖圖例 -->
      <div class="donut-legends-grid">
        ${legendHtml}
      </div>
    </div>
  `;

  chartBox.innerHTML = svgHtml;
}

/* ==========================================================================
   6. 預約詢問數據表格 (Data Table & Detail View / Delete Operations)
   ========================================================================== */
function renderInquiriesTable(filterSource) {
  const tableBody = document.getElementById('inquiries-table-body');
  const emptyState = document.getElementById('table-empty-state');
  
  if (!tableBody) return;

  // 讀取預約資料
  const inquiries = JSON.parse(localStorage.getItem('aiu_inquiries') || '[]');
  
  // 篩選過濾資料
  const filteredData = inquiries.filter(item => {
    if (filterSource === 'all') return true;
    return item.type === filterSource;
  });

  // 若無資料顯示空狀態
  if (filteredData.length === 0) {
    tableBody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  // 動態組裝 HTML
  let rowsHtml = '';
  filteredData.forEach(item => {
    const dateObj = new Date(item.date);
    const dateStr = dateObj.toLocaleDateString('zh-TW') + ' ' + 
                    String(dateObj.getHours()).padStart(2, '0') + ':' + 
                    String(dateObj.getMinutes()).padStart(2, '0');
    
    const sourceBadge = item.type === 'website' 
      ? '<span class="badge-source badge-website"><i class="fa-solid fa-house"></i> 首頁諮詢</span>' 
      : '<span class="badge-source badge-card"><i class="fa-solid fa-id-card"></i> 名片留言</span>';
      
    const emailText = item.email || '<span style="color:var(--text-muted)">-</span>';

    rowsHtml += `
      <tr id="row-${item.id}">
        <td class="font-date">${dateStr}</td>
        <td>${sourceBadge}</td>
        <td class="font-highlight">${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.phone)}</td>
        <td>${escapeHtml(emailText)}</td>
        <td>${escapeHtml(item.service)}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-action btn-view" onclick="viewInquiryDetail('${item.id}')" aria-label="檢視詳細資料" title="檢視詳細">
              <i class="fa-regular fa-eye"></i>
            </button>
            <button class="btn-action btn-delete" onclick="deleteInquiry('${item.id}')" aria-label="刪除此留言" title="刪除留言">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = rowsHtml;
}

// 檢視詳細留言彈窗項目
window.viewInquiryDetail = function(id) {
  const modal = document.getElementById('inquiry-detail-modal');
  if (!modal) return;

  const inquiries = JSON.parse(localStorage.getItem('aiu_inquiries') || '[]');
  const item = inquiries.find(x => x.id === id);
  if (!item) return;

  // 填寫欄位資訊
  document.getElementById('detail-source').innerHTML = item.type === 'website' 
    ? '<span class="badge-source badge-website"><i class="fa-solid fa-house"></i> 官方網站首頁</span>' 
    : '<span class="badge-source badge-card"><i class="fa-solid fa-id-card"></i> 電子名片落地頁</span>';

  const dateObj = new Date(item.date);
  document.getElementById('detail-date').textContent = dateObj.toLocaleString('zh-TW');
  document.getElementById('detail-name').textContent = item.name;
  document.getElementById('detail-phone').textContent = item.phone;
  document.getElementById('detail-email').textContent = item.email || '（無輸入電子郵件）';
  document.getElementById('detail-service').textContent = item.service;
  document.getElementById('detail-message').textContent = item.message;

  // 開啟 Modal 視窗
  modal.showModal();

  // 綁定關閉事件
  const closeModal = () => modal.close();
  document.getElementById('modal-close-btn').onclick = closeModal;
  document.getElementById('modal-close-action').onclick = closeModal;
};

// 刪除諮詢預約項目
window.deleteInquiry = function(id) {
  if (!confirm('您確定要刪除這筆留言預約紀錄嗎？此操作將無法還原。')) return;

  let inquiries = JSON.parse(localStorage.getItem('aiu_inquiries') || '[]');
  inquiries = inquiries.filter(x => x.id !== id);
  localStorage.setItem('aiu_inquiries', JSON.stringify(inquiries));

  // 重新載入數據與更新 UI
  loadDashboardData();
};

// 防 HTML 注入安全編碼器
function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
