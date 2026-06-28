/**
 * Carol 吳凱若 - 電子名片 (NFC 碰碰卡落地網頁) 互動邏輯與數據追蹤
 */

let currentLang = 'zh';

document.addEventListener('DOMContentLoaded', () => {
  trackPageView('card');
  initTheme();
  initCustomProfile();
  initLanguage();
  initClickTracking();
  initShareModal();
  initContactForm();
  initAdminPanel();
});

/* ==========================================================================
   0. 讀取並同步個性化設定的電子名片資訊 (Dynamic Settings Sync)
   ========================================================================== */
function initCustomProfile() {
  const customName = localStorage.getItem('aiu_card_name');
  const customTitle = localStorage.getItem('aiu_card_title');
  const customPhone = localStorage.getItem('aiu_card_phone');
  const customEmail = localStorage.getItem('aiu_card_email');
  const customLine = localStorage.getItem('aiu_card_line');
  const customFb = localStorage.getItem('aiu_card_fb');
  const customIg = localStorage.getItem('aiu_card_ig');
  const customWechat = localStorage.getItem('aiu_card_wechat');
  const customAddress = localStorage.getItem('aiu_card_address');

  if (customName) {
    const el = document.querySelector('.profile-name');
    if (el) el.textContent = customName;
  }
  if (customTitle) {
    const el = document.querySelector('.profile-title');
    if (el) el.textContent = customTitle;
  }
  
  if (customPhone) {
    const callBtn = document.getElementById('btn-call');
    if (callBtn) {
      callBtn.setAttribute('href', 'tel:' + customPhone);
    }
  }
  
  if (customEmail) {
    const emailBtn = document.getElementById('btn-email');
    if (emailBtn) {
      emailBtn.setAttribute('href', 'mailto:' + customEmail);
    }
  }
  
  if (customLine) {
    const heroLine = document.getElementById('btn-hero-line');
    if (heroLine) heroLine.setAttribute('href', customLine);
    
    const quickLine = document.getElementById('btn-line');
    if (quickLine) quickLine.setAttribute('href', customLine);
    
    const socialLine = document.getElementById('btn-social-line');
    if (socialLine) socialLine.setAttribute('href', customLine);
  }
  
  if (customFb) {
    const fbBtn = document.getElementById('btn-social-fb');
    if (fbBtn) fbBtn.setAttribute('href', customFb);
  }
  
  if (customIg) {
    const igBtn = document.getElementById('btn-social-ig');
    if (igBtn) igBtn.setAttribute('href', customIg);
  }
  
  if (customWechat) {
    const wechatName = document.querySelector('#btn-social-wechat .social-item-name');
    if (wechatName) wechatName.textContent = 'WeChat 微信聯絡 (' + customWechat + ')';
  }
  
  if (customAddress) {
    const addressValue = document.querySelector('[data-i18n="address_value"]');
    if (addressValue) addressValue.textContent = customAddress;
  }
}

/* ==========================================================================
   00. 多國語言翻譯邏輯 (Language Switcher)
   ========================================================================== */
function initLanguage() {
  const langSelect = document.getElementById('lang-select');
  if (!langSelect) return;

  // 讀取本地儲存語言，與首頁同步，預設為繁中 'zh'
  currentLang = localStorage.getItem('lang') || 'zh';
  langSelect.value = currentLang;

  // 初始套用語言翻譯
  applyLanguage(currentLang);

  // 監聽選單切換
  langSelect.addEventListener('change', (e) => {
    currentLang = e.target.value;
    localStorage.setItem('lang', currentLang);
    applyLanguage(currentLang);
    
    // 如果首頁開啟，可以發送事件通知同步 (本專案透過 localStorage 儲存即可跨頁面同步)
  });
}

function applyLanguage(lang) {
  if (typeof translations === 'undefined' || !translations[lang]) return;

  // 1. 翻譯所有 data-i18n 的元素
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key] !== undefined) {
      const textValue = translations[lang][key];
      if (textValue.includes('<')) {
        el.innerHTML = textValue;
      } else {
        el.textContent = textValue;
      }
    }
  });

  // 2. 翻譯所有 data-i18n-placeholder 的輸入框
  const inputs = document.querySelectorAll('[data-i18n-placeholder]');
  inputs.forEach(input => {
    const key = input.getAttribute('data-i18n-placeholder');
    if (translations[lang][key] !== undefined) {
      input.placeholder = translations[lang][key];
    }
  });

  // 3. 更新網頁 document lang 屬性
  let langAttr = 'zh-Hant-TW';
  if (lang === 'en') langAttr = 'en';
  if (lang === 'cn') langAttr = 'zh-Hans-CN';
  if (lang === 'ja') langAttr = 'ja';
  document.documentElement.lang = langAttr;
  
  // 4. 套用個性化設定，覆蓋翻譯庫中的預設名片資料
  initCustomProfile();
}

function getTranslation(key) {
  return typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang][key] !== undefined
    ? translations[currentLang][key]
    : ((typeof translations !== 'undefined' && translations['zh'] && translations['zh'][key]) || '');
}

/* ==========================================================================
   0. 數據追蹤輔助函數 (Data Tracking Helpers)
   ========================================================================== */
function trackPageView(pageType) {
  const key = `aiu_pv_${pageType}`;
  let pv = parseInt(localStorage.getItem(key) || '0');
  localStorage.setItem(key, pv + 1);
  
  // 紀錄每日趨勢
  trackDailyPV(pageType);
}

function trackDailyPV(pageType) {
  const trendKey = `aiu_pv_trend_${pageType}`;
  const trendData = JSON.parse(localStorage.getItem(trendKey) || '{}');
  const today = new Date().toISOString().split('T')[0];
  
  trendData[today] = (trendData[today] || 0) + 1;
  localStorage.setItem(trendKey, JSON.stringify(trendData));
}

function trackClick(eventKey) {
  const key = `aiu_click_${eventKey}`;
  let count = parseInt(localStorage.getItem(key) || '0');
  localStorage.setItem(key, count + 1);
}

function initClickTracking() {
  const heroLineBtn = document.getElementById('btn-hero-line');
  const callBtn = document.getElementById('btn-call');
  const lineBtn = document.getElementById('btn-line');
  const mapBtn = document.getElementById('btn-map');
  const emailBtn = document.getElementById('btn-email');

  // 新增的社群媒體連結
  const fbBtn = document.getElementById('btn-social-fb');
  const igBtn = document.getElementById('btn-social-ig');
  const lineSocialBtn = document.getElementById('btn-social-line');
  const wechatBtn = document.getElementById('btn-social-wechat');

  if (heroLineBtn) heroLineBtn.addEventListener('click', () => trackClick('line'));
  if (callBtn) callBtn.addEventListener('click', () => trackClick('call'));
  if (lineBtn) lineBtn.addEventListener('click', () => trackClick('line'));
  if (mapBtn) mapBtn.addEventListener('click', () => trackClick('map'));
  if (emailBtn) emailBtn.addEventListener('click', () => trackClick('email'));

  if (fbBtn) fbBtn.addEventListener('click', () => trackClick('fb'));
  if (igBtn) igBtn.addEventListener('click', () => trackClick('ig'));
  if (lineSocialBtn) lineSocialBtn.addEventListener('click', () => trackClick('line'));
  if (wechatBtn) {
    wechatBtn.addEventListener('click', (e) => {
      e.preventDefault();
      trackClick('wechat');
      
      const wechatId = localStorage.getItem('aiu_card_wechat') || 'wcr830';
      navigator.clipboard.writeText(wechatId).then(() => {
        // 彈出自訂 Toast 提示
        const toast = document.getElementById('toast-notification');
        if (toast) {
          const toastIcon = toast.querySelector('.toast-icon');
          const toastMessage = toast.querySelector('.toast-message');
          if (toastIcon) toastIcon.className = 'fa-solid fa-copy toast-icon';
          if (toastMessage) toastMessage.textContent = `微信帳號 (${wechatId}) 已複製！`;
          toast.classList.add('show');
          setTimeout(() => {
            toast.classList.remove('show');
          }, 3500);
        }
      }).catch(err => {
        console.error('無法複製 WeChat ID:', err);
      });
    });
  }
}

/* ==========================================================================
   1. 深淺主題切換邏輯 (Theme Manager)
   ========================================================================== */
function initTheme() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (!themeBtn) return;
  
  const icon = themeBtn.querySelector('i');
  
  // 讀取本地儲存的主題設定，與首頁同步
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark') {
    setDarkTheme();
  } else {
    setLightTheme();
  }
  
  // 綁定點擊事件
  themeBtn.addEventListener('click', () => {
    if (document.body.classList.contains('dark-theme')) {
      setLightTheme();
    } else {
      setDarkTheme();
    }
  });

  function setDarkTheme() {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
    if (icon) {
      icon.className = 'fa-solid fa-sun'; // 深色模式下顯示太陽 (用以切換到淺色)
    }
  }

  function setLightTheme() {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    localStorage.setItem('theme', 'light');
    if (icon) {
      icon.className = 'fa-solid fa-moon'; // 淺色模式下顯示月亮 (用以切換到深色)
    }
  }
}

/* ==========================================================================
   3. 分享 QR Code 彈窗管理 (Dynamic QR Code Dialog)
   ========================================================================== */
function initShareModal() {
  const shareBtn = document.getElementById('share-card-btn');
  const modal = document.getElementById('qr-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const closeAction = document.getElementById('modal-close-action');
  const qrImage = document.getElementById('qr-code-image');

  if (!shareBtn || !modal || !qrImage) return;

  // 動態生成 QR Code：指向目前網址，確保部署到任何伺服器都能自動抓取
  shareBtn.addEventListener('click', () => {
    // 獲取目前網址，若是在本地開發，會生成指向 localhost 的網址
    const currentUrl = window.location.href;
    
    // 使用高畫質且穩定的免費 QR Code API，並加上邊距設定
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(currentUrl)}`;
    
    qrImage.src = qrApiUrl;
    
    // 開啟 HTML5 原生 Dialog 彈窗
    modal.showModal();
  });

  // 關閉彈窗邏輯
  const closeModal = () => {
    modal.close();
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (closeAction) closeAction.addEventListener('click', closeModal);

  // 點擊彈窗外部遮罩亦可關閉
  modal.addEventListener('click', (e) => {
    const rect = modal.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX && e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      closeModal();
    }
  });
}

/* ==========================================================================
   4. 商務預約聯絡表單 (Simulated Form Submission & Toast Alert)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('btn-submit');
  const toast = document.getElementById('toast-notification');

  if (!form || !submitBtn || !toast) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // 攔截預設提交

    // 取得輸入欄位
    const nameInput = document.getElementById('form-name');
    const phoneInput = document.getElementById('form-phone');
    const messageInput = document.getElementById('form-message');

    // 簡易表單驗證
    if (!nameInput.value.trim() || !phoneInput.value.trim() || !messageInput.value.trim()) {
      showToast(getTranslation('card_toast_validation'), 'fa-solid fa-triangle-exclamation');
      return;
    }

    // 進入傳送載入中狀態 (Simulating Loading State)
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-submit-text').textContent = getTranslation('card_btn_submitting');
    const submitIcon = submitBtn.querySelector('.submit-icon');
    if (submitIcon) {
      submitIcon.className = 'fa-solid fa-spinner fa-spin submit-icon';
    }

    // 模擬網路傳輸延遲 1.2 秒，增加真實體驗感
    setTimeout(() => {
      // 成功狀態還原
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-submit-text').textContent = getTranslation('card_btn_submit');
      if (submitIcon) {
        submitIcon.className = 'fa-solid fa-paper-plane submit-icon';
      }

      // 儲存預約留言資訊至 localStorage (與首頁共用)
      const inquiries = JSON.parse(localStorage.getItem('aiu_inquiries') || '[]');
      const newInquiry = {
        id: 'inq_' + Date.now(),
        type: 'card',
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        email: '', // 電子名片上無 Email 欄位
        service: '個人數位名片留言諮詢',
        message: messageInput.value.trim(),
        date: new Date().toISOString(),
        read: false
      };
      inquiries.unshift(newInquiry);
      localStorage.setItem('aiu_inquiries', JSON.stringify(inquiries));

      // 輸出主控台紀錄 (方便測試驗證)
      console.log('--- 收到來自電子名片的商務洽談預約 ---');
      console.log('姓名：', nameInput.value.trim());
      console.log('電話：', phoneInput.value.trim());
      console.log('需求備註：', messageInput.value.trim());
      console.log('------------------------------------');

      // 清空表單
      form.reset();

      // 彈出奢華質感 Toast 成功提示
      showToast(getTranslation('card_toast_success'), 'fa-solid fa-circle-check');
    }, 1200);
  });

  // 展示自訂 Toast 提示
  function showToast(message, iconClass) {
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    if (toastIcon) toastIcon.className = `${iconClass} toast-icon`;
    if (toastMessage) toastMessage.textContent = message;

    toast.classList.add('show');
    
    // 3.5 秒後自動隱藏
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }
}

/* ==========================================================================
   5. 整合型個人名片數據後台管理邏輯 (Integrated Admin Panel)
   ========================================================================== */
function initAdminPanel() {
  const adminBtn = document.getElementById('btn-admin-login');
  const adminFooterBtn = document.getElementById('btn-admin-footer');
  const adminModal = document.getElementById('admin-panel-modal');
  const closeBtn = document.getElementById('admin-close-btn');

  const demoBtn = document.getElementById('btn-admin-demo');
  const clearBtn = document.getElementById('btn-admin-clear');
  const logoutBtn = document.getElementById('btn-admin-logout');

  if (!adminModal) return;

  const handleAdminClick = (e) => {
    if (e) e.preventDefault();
    const isAuthed = sessionStorage.getItem('aiu_auth') === 'true';
    if (isAuthed) {
      openAdminPanel();
    } else {
      const pass = prompt('請輸入管理員密碼：');
      if (pass === 'aiu888') {
        sessionStorage.setItem('aiu_auth', 'true');
        openAdminPanel();
      } else if (pass !== null) {
        alert('❌ 密碼錯誤，拒絕存取。');
      }
    }
  };

  // 登入後台觸發事件
  if (adminBtn) adminBtn.addEventListener('click', handleAdminClick);
  if (adminFooterBtn) adminFooterBtn.addEventListener('click', handleAdminClick);

  // 關閉按鈕
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      adminModal.close();
    });
  }

  // 注入數據按鈕
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      injectAdminDemoData();
    });
  }

  // 清空數據按鈕
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearAdminData();
    });
  }

  // 側邊欄抽屜開關邏輯
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('admin-sidebar-overlay');
  const sidebarToggle = document.getElementById('admin-sidebar-toggle');
  const sidebarClose = document.getElementById('admin-sidebar-close-btn');
  const sidebarLogoutBtn = document.getElementById('btn-admin-sidebar-logout');

  const closeSidebar = () => {
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  };

  if (sidebarToggle && sidebar && overlay) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.add('open');
      overlay.classList.add('open');
    });
  }

  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // 側邊欄選單點擊切換頁面 (SPA 邏輯)
  const menuItems = document.querySelectorAll('.admin-sidebar-menu .admin-menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      menuItems.forEach(mi => mi.classList.remove('active'));
      item.classList.add('active');

      const href = item.getAttribute('href'); // e.g. #admin-overview
      const tabId = 'admin-tab-' + href.substring(7); // e.g. admin-tab-overview
      
      const tabs = document.querySelectorAll('.admin-tab-content');
      tabs.forEach(tab => tab.classList.remove('active'));
      
      const actualTab = document.getElementById(tabId);
      if (actualTab) {
        actualTab.classList.add('active');
      }

      closeSidebar();
    });
  });

  // 側邊欄登出按鈕
  if (sidebarLogoutBtn) {
    sidebarLogoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('aiu_auth');
      alert('🔒 已安全登出管理員身份。');
      closeSidebar();
      adminModal.close();
    });
  }

  function openAdminPanel() {
    // 預設重置回第一個分頁
    menuItems.forEach(mi => mi.classList.remove('active'));
    const firstMenuOpt = document.getElementById('menu-opt-overview');
    if (firstMenuOpt) firstMenuOpt.classList.add('active');

    const tabs = document.querySelectorAll('.admin-tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    const firstTab = document.getElementById('admin-tab-overview');
    if (firstTab) firstTab.classList.add('active');

    closeSidebar();
    adminModal.showModal();
    loadAdminDashboardData();
  }
}

// 載入與計算數據渲染
function loadAdminDashboardData() {
  // 1. 讀取數據計數器
  const pvWebsite = parseInt(localStorage.getItem('aiu_pv_website') || '0');
  const pvCard = parseInt(localStorage.getItem('aiu_pv_card') || '0');

  const clickVcard = parseInt(localStorage.getItem('aiu_click_vcard') || '0');
  const clickCall = parseInt(localStorage.getItem('aiu_click_call') || '0');
  const clickLine = parseInt(localStorage.getItem('aiu_click_line') || '0');
  const clickMap = parseInt(localStorage.getItem('aiu_click_map') || '0');
  const clickEmail = parseInt(localStorage.getItem('aiu_click_email') || '0');

  const inquiries = JSON.parse(localStorage.getItem('aiu_inquiries') || '[]');

  // 2. 填入 KPI
  document.getElementById('admin-kpi-pv').textContent = pvCard.toLocaleString(); // 此名片單獨的瀏覽量
  document.getElementById('admin-kpi-inq').textContent = inquiries.filter(i => i.type === 'card').length.toLocaleString(); // 此名片的留言數
  document.getElementById('admin-kpi-vcard').textContent = clickVcard.toLocaleString();
  document.getElementById('admin-kpi-social').textContent = (clickCall + clickLine + clickMap + clickEmail).toLocaleString();

  // 3. 繪製圖表
  renderAdminPvTrendChart();
  renderAdminClicksPieChart();

  // 4. 渲染留言清單
  renderAdminInquiriesList();
}

// 繪製七日趨勢圖
function renderAdminPvTrendChart() {
  const chartBox = document.getElementById('admin-pv-chart');
  if (!chartBox) return;

  const days = [];
  const websiteData = [];
  const cardData = [];

  const trendWebsite = JSON.parse(localStorage.getItem('aiu_pv_trend_website') || '{}');
  const trendCard = JSON.parse(localStorage.getItem('aiu_pv_trend_card') || '{}');

  // 計算最近七日
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // 取簡短日期 (M/D) 供圖表標籤使用
    const label = (d.getMonth() + 1) + '/' + d.getDate();
    days.push(label);
    
    websiteData.push(trendWebsite[dateStr] || 0);
    cardData.push(trendCard[dateStr] || 0);
  }

  const allVals = [...websiteData, ...cardData];
  const maxVal = Math.max(...allVals, 10);
  const graphMax = Math.ceil(maxVal / 10) * 10;

  // SVG 模板
  let pointsWebsite = '';
  let pointsCard = '';
  let areaWebsite = '';
  let areaCard = '';
  
  const width = 280;
  const height = 110;
  const paddingLeft = 25;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 20;
  
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  for (let i = 0; i < 7; i++) {
    const x = paddingLeft + (i / 6) * plotWidth;
    const yWebsite = paddingTop + plotHeight - (websiteData[i] / graphMax) * plotHeight;
    const yCard = paddingTop + plotHeight - (cardData[i] / graphMax) * plotHeight;

    pointsWebsite += `${x},${yWebsite} `;
    pointsCard += `${x},${yCard} `;
    
    if (i === 0) {
      areaWebsite += `${x},${paddingTop + plotHeight} ${x},${yWebsite} `;
      areaCard += `${x},${paddingTop + plotHeight} ${x},${yCard} `;
    } else {
      areaWebsite += `${x},${yWebsite} `;
      areaCard += `${x},${yCard} `;
    }
    
    if (i === 6) {
      areaWebsite += `${x},${paddingTop + plotHeight}`;
      areaCard += `${x},${paddingTop + plotHeight}`;
    }
  }

  // 建構 SVG
  let svgHtml = `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg">
      <defs>
        <linearGradient id="grad-website-admin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#C2185B" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#C2185B" stop-opacity="0.0"/>
        </linearGradient>
        <linearGradient id="grad-card-admin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#00B4D8" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#00B4D8" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      
      <!-- Grid Lines -->
      <line x1="${paddingLeft}" y1="${paddingTop}" x2="${width - paddingRight}" y2="${paddingTop}" class="chart-grid-line" />
      <line x1="${paddingLeft}" y1="${paddingTop + plotHeight * 0.5}" x2="${width - paddingRight}" y2="${paddingTop + plotHeight * 0.5}" class="chart-grid-line" />
      <line x1="${paddingLeft}" y1="${paddingTop + plotHeight}" x2="${width - paddingRight}" y2="${paddingTop + plotHeight}" class="chart-axis-line" />
      
      <!-- Y-Axis Labels -->
      <text x="${paddingLeft - 4}" y="${paddingTop + 3}" text-anchor="end" class="chart-axis-text">${graphMax}</text>
      <text x="${paddingLeft - 4}" y="${paddingTop + plotHeight * 0.5 + 3}" text-anchor="end" class="chart-axis-text">${graphMax / 2}</text>
      <text x="${paddingLeft - 4}" y="${paddingTop + plotHeight + 3}" text-anchor="end" class="chart-axis-text">0</text>
      
      <!-- X-Axis Labels -->
  `;

  for (let i = 0; i < 7; i++) {
    const x = paddingLeft + (i / 6) * plotWidth;
    svgHtml += `<text x="${x}" y="${height - 4}" text-anchor="middle" class="chart-axis-text">${days[i]}</text>`;
  }

  svgHtml += `
      <!-- Area Paths -->
      <polygon points="${areaWebsite}" fill="url(#grad-website-admin)"/>
      <polygon points="${areaCard}" fill="url(#grad-card-admin)"/>
      
      <!-- Line Paths -->
      <polyline points="${pointsWebsite}" class="chart-line-website" />
      <polyline points="${pointsCard}" class="chart-line-card" />
  `;

  // Draw points
  for (let i = 0; i < 7; i++) {
    const x = paddingLeft + (i / 6) * plotWidth;
    const yWebsite = paddingTop + plotHeight - (websiteData[i] / graphMax) * plotHeight;
    const yCard = paddingTop + plotHeight - (cardData[i] / graphMax) * plotHeight;

    svgHtml += `
      <circle cx="${x}" cy="${yWebsite}" class="chart-point-website"/>
      <circle cx="${x}" cy="${yCard}" class="chart-point-card"/>
    `;
  }

  svgHtml += `</svg>`;
  chartBox.innerHTML = svgHtml;
}

// 繪製社群點擊圓環圖
function renderAdminClicksPieChart() {
  const chartBox = document.getElementById('admin-pie-chart');
  if (!chartBox) return;

  const clickVcard = parseInt(localStorage.getItem('aiu_click_vcard') || '0');
  const clickCall = parseInt(localStorage.getItem('aiu_click_call') || '0');
  const clickLine = parseInt(localStorage.getItem('aiu_click_line') || '0');
  const clickMap = parseInt(localStorage.getItem('aiu_click_map') || '0');
  const clickEmail = parseInt(localStorage.getItem('aiu_click_email') || '0');
  
  const total = clickVcard + clickCall + clickLine + clickMap + clickEmail;

  if (total === 0) {
    chartBox.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 30px 0;">
        <i class="fa-solid fa-chart-pie" style="font-size: 24px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
        尚無點擊統計數據，請注入數據或點擊上方按鈕測試。
      </div>
    `;
    return;
  }

  const values = [clickVcard, clickCall, clickLine, clickMap, clickEmail];
  const percentages = values.map(v => (v / total) * 100);

  // SVG Donut calculation
  const radius = 28;
  const circ = 2 * Math.PI * radius; // 175.929
  
  const strokeDasharrays = [];

  for (let i = 0; i < 5; i++) {
    const strokeLen = (values[i] / total) * circ;
    const spaceLen = circ - strokeLen;
    strokeDasharrays.push(`${strokeLen} ${spaceLen}`);
  }

  const offset0 = 0;
  const offset1 = -((values[0] / total) * circ);
  const offset2 = -(((values[0] + values[1]) / total) * circ);
  const offset3 = -(((values[0] + values[1] + values[2]) / total) * circ);
  const offset4 = -(((values[0] + values[1] + values[2] + values[3]) / total) * circ);

  const offsets = [offset0, offset1, offset2, offset3, offset4];

  let svgHtml = `
    <div style="display: flex; align-items: center; justify-content: space-around; width: 100%; gap: 10px; flex-wrap: wrap;">
      <svg width="100" height="100" viewBox="0 0 80 80" style="flex-shrink: 0; transform: rotate(-90deg);">
        <circle cx="40" cy="40" r="${radius}" class="donut-slice-empty" />
        
        <!-- Vcard -->
        ${values[0] > 0 ? `<circle cx="40" cy="40" r="${radius}" class="donut-slice donut-slice-vcard" stroke-dasharray="${strokeDasharrays[0]}" stroke-dashoffset="${offsets[0]}"/>` : ''}
        <!-- Call -->
        ${values[1] > 0 ? `<circle cx="40" cy="40" r="${radius}" class="donut-slice donut-slice-call" stroke-dasharray="${strokeDasharrays[1]}" stroke-dashoffset="${offsets[1]}"/>` : ''}
        <!-- Line -->
        ${values[2] > 0 ? `<circle cx="40" cy="40" r="${radius}" class="donut-slice donut-slice-line" stroke-dasharray="${strokeDasharrays[2]}" stroke-dashoffset="${offsets[2]}"/>` : ''}
        <!-- Map -->
        ${values[3] > 0 ? `<circle cx="40" cy="40" r="${radius}" class="donut-slice donut-slice-map" stroke-dasharray="${strokeDasharrays[3]}" stroke-dashoffset="${offsets[3]}"/>` : ''}
        <!-- Email -->
        ${values[4] > 0 ? `<circle cx="40" cy="40" r="${radius}" class="donut-slice donut-slice-email" stroke-dasharray="${strokeDasharrays[4]}" stroke-dashoffset="${offsets[4]}"/>` : ''}
        
        <text x="40" y="38" class="donut-center-text-label" transform="rotate(90 40 40)">總點擊數</text>
        <text x="40" y="52" class="donut-center-text-val" transform="rotate(90 40 40)">${total}</text>
      </svg>

      <!-- Legends -->
      <div style="flex: 1; min-width: 140px;">
        <div class="donut-legends-grid" style="grid-template-columns: 1fr; gap: 4px;">
          <div class="donut-legend-row">
            <span class="donut-legend-label"><span class="legend-dot" style="background:#E91B62;"></span>通訊錄 vCard</span>
            <span class="donut-legend-val">${clickVcard}次 (${Math.round(percentages[0])}%)</span>
          </div>
          <div class="donut-legend-row">
            <span class="donut-legend-label"><span class="legend-dot" style="background:#9C27B0;"></span>電話熱線</span>
            <span class="donut-legend-val">${clickCall}次 (${Math.round(percentages[1])}%)</span>
          </div>
          <div class="donut-legend-row">
            <span class="donut-legend-label"><span class="legend-dot" style="background:#4CAF50;"></span>LINE 對接</span>
            <span class="donut-legend-val">${clickLine}次 (${Math.round(percentages[2])}%)</span>
          </div>
          <div class="donut-legend-row">
            <span class="donut-legend-label"><span class="legend-dot" style="background:#00B4D8;"></span>導航地圖</span>
            <span class="donut-legend-val">${clickMap}次 (${Math.round(percentages[3])}%)</span>
          </div>
          <div class="donut-legend-row">
            <span class="donut-legend-label"><span class="legend-dot" style="background:#FFEB3B;"></span>Email 信箱</span>
            <span class="donut-legend-val">${clickEmail}次 (${Math.round(percentages[4])}%)</span>
          </div>
        </div>
      </div>
    </div>
  `;

  chartBox.innerHTML = svgHtml;
}

// 渲染管理留言清單 (Mobile Cards layout)
function renderAdminInquiriesList() {
  const listBox = document.getElementById('admin-inquiries-list-box');
  if (!listBox) return;

  const inquiries = JSON.parse(localStorage.getItem('aiu_inquiries') || '[]');
  
  // 只顯示此張電子名片的預約留言 (type === 'card')
  const cardInquiries = inquiries.filter(item => item.type === 'card');

  if (cardInquiries.length === 0) {
    listBox.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 24px 0; background: var(--quick-link-bg); border-radius: var(--border-radius-md);">
        目前尚無名片預約留言。
      </div>
    `;
    return;
  }

  let listHtml = '';
  cardInquiries.forEach(item => {
    const d = new Date(item.date);
    const dateFormatted = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    
    listHtml += `
      <div class="admin-inquiry-card" id="card-${item.id}">
        <div class="inquiry-card-header">
          <span class="inquiry-card-name">${escapeHtml(item.name)}</span>
          <span class="inquiry-card-date">${dateFormatted}</span>
        </div>
        <div class="inquiry-card-body">
          ${escapeHtml(item.message)}
        </div>
        <div class="inquiry-card-actions">
          <button class="inquiry-card-btn btn-card-view" onclick="showAdminInquiryDetail('${item.id}')">
            <i class="fa-solid fa-eye"></i> 查看
          </button>
          <button class="inquiry-card-btn btn-card-delete" onclick="deleteAdminInquiry('${item.id}')">
            <i class="fa-solid fa-trash-can"></i> 刪除
          </button>
        </div>
      </div>
    `;
  });

  listBox.innerHTML = listHtml;
}

// 彈出詳細資訊視窗
function showAdminInquiryDetail(id) {
  const inquiries = JSON.parse(localStorage.getItem('aiu_inquiries') || '[]');
  const item = inquiries.find(i => i.id === id);
  if (!item) return;

  const detailModal = document.getElementById('admin-inquiry-detail-modal');
  const d = new Date(item.date);
  const dateFormatted = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  document.getElementById('admin-detail-source').innerHTML = item.type === 'card' ? '<span class="badge badge-card"><i class="fa-solid fa-id-card"></i> 名片留言</span>' : '<span class="badge badge-website"><i class="fa-solid fa-house"></i> 首頁諮詢</span>';
  document.getElementById('admin-detail-date').textContent = dateFormatted;
  document.getElementById('admin-detail-name').textContent = item.name;
  document.getElementById('admin-detail-phone').textContent = item.phone;
  document.getElementById('admin-detail-message').textContent = item.message;

  // 關閉事件綁定
  const closeBtn = document.getElementById('admin-detail-close-btn');
  const closeAction = document.getElementById('admin-detail-close-action');
  
  const closeModal = () => detailModal.close();
  if (closeBtn) closeBtn.onclick = closeModal;
  if (closeAction) closeAction.onclick = closeModal;

  detailModal.showModal();
}
window.showAdminInquiryDetail = showAdminInquiryDetail; // 綁定到 window 供 HTML 點擊觸發

// 刪除留言
function deleteAdminInquiry(id) {
  if (!confirm('⚠️ 確定要刪除這筆留言嗎？此動作無法復原。')) return;

  let inquiries = JSON.parse(localStorage.getItem('aiu_inquiries') || '[]');
  inquiries = inquiries.filter(item => item.id !== id);
  localStorage.setItem('aiu_inquiries', JSON.stringify(inquiries));

  // 重新載入數據
  loadAdminDashboardData();
}
window.deleteAdminInquiry = deleteAdminInquiry; // 綁定到 window 供 HTML 點擊觸發

// HTML 跳脫防止 XSS
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 注入展示數據
function injectAdminDemoData() {
  localStorage.setItem('aiu_pv_website', '1254');
  localStorage.setItem('aiu_pv_card', '846');
  localStorage.setItem('aiu_click_vcard', '124');
  localStorage.setItem('aiu_click_call', '45');
  localStorage.setItem('aiu_click_line', '98');
  localStorage.setItem('aiu_click_map', '32');
  localStorage.setItem('aiu_click_email', '18');

  // 動態生成最近 7 日趨勢數據
  const trendWebsite = {};
  const trendCard = {};
  const websiteBaseVals = [62, 85, 78, 105, 128, 110, 142];
  const cardBaseVals = [35, 48, 42, 68, 75, 70, 94];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    trendWebsite[dateStr] = websiteBaseVals[6 - i];
    trendCard[dateStr] = cardBaseVals[6 - i];
  }
  localStorage.setItem('aiu_pv_trend_website', JSON.stringify(trendWebsite));
  localStorage.setItem('aiu_pv_trend_card', JSON.stringify(trendCard));

  // 設置模擬名片預約留言
  const mockInquiries = [
    {
      id: 'inq_demo1',
      type: 'card',
      name: '林雅婷',
      phone: '0988-765-432',
      email: '',
      service: '個人數位名片留言諮詢',
      message: '剛才與 Carol 執行長在商務晚宴上碰面，對你們的 Kyimc AI+U 品牌孵化方案很感興趣。希望能索取詳細的合作說明簡報，並安排會議，謝謝！',
      date: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30分鐘前
    },
    {
      id: 'inq_demo2',
      type: 'card',
      name: '許宇軒',
      phone: '0966-888-999',
      email: '',
      service: '個人數位名片留言諮詢',
      message: '希望能租借「品空間」作為我們新書發表會的場地（約40人），想了解場地租借費用與設備配備。',
      date: new Date(Date.now() - 1000 * 60 * 180).toISOString() // 3小時前
    },
    {
      id: 'inq_demo3',
      type: 'card',
      name: '黃智遠',
      phone: '0911-222-333',
      email: '',
      service: '個人數位名片留言諮詢',
      message: '我目前想要進行企業品牌再造，想約 Carol 顧問下週進行 30 分鐘諮詢會議。',
      date: new Date(Date.now() - 1000 * 60 * 1000 * 24).toISOString() // 1天前
    }
  ];
  
  // 保留原有 website 的留言，只覆蓋或合著名片留言
  const originalInquiries = JSON.parse(localStorage.getItem('aiu_inquiries') || '[]');
  const websiteOnly = originalInquiries.filter(i => i.type !== 'card');
  const newInquiriesList = [...mockInquiries, ...websiteOnly];
  
  localStorage.setItem('aiu_inquiries', JSON.stringify(newInquiriesList));

  alert('✨ 電子名片展示數據注入成功！');
  loadAdminDashboardData();
}

// 清空數據
function clearAdminData() {
  if (confirm('⚠️ 確定要清空所有統計數據與預約名單嗎？此動作將清除相關儲存紀錄。')) {
    localStorage.removeItem('aiu_pv_website');
    localStorage.removeItem('aiu_pv_card');
    localStorage.removeItem('aiu_click_vcard');
    localStorage.removeItem('aiu_click_call');
    localStorage.removeItem('aiu_click_line');
    localStorage.removeItem('aiu_click_map');
    localStorage.removeItem('aiu_click_email');
    localStorage.removeItem('aiu_pv_trend_website');
    localStorage.removeItem('aiu_pv_trend_card');
    
    // 只清空名片留言，保留官網留言
    const originalInquiries = JSON.parse(localStorage.getItem('aiu_inquiries') || '[]');
    const websiteOnly = originalInquiries.filter(i => i.type !== 'card');
    localStorage.setItem('aiu_inquiries', JSON.stringify(websiteOnly));

    alert('🧹 數據已全部清空，後台已重設。');
    loadAdminDashboardData();
  }
}
