/**
 * Carol 吳凱若 - 電子名片 (NFC 碰碰卡落地網頁) 互動邏輯與數據追蹤
 */

let currentLang = 'zh';

document.addEventListener('DOMContentLoaded', () => {
  trackPageView('card');
  initTheme();
  initLanguage();
  initClickTracking();
  initShareModal();
  initContactForm();
});

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
  const vcardBtn = document.getElementById('btn-vcard');
  const callBtn = document.getElementById('btn-call');
  const lineBtn = document.getElementById('btn-line');
  const mapBtn = document.getElementById('btn-map');
  const emailBtn = document.getElementById('btn-email');

  if (vcardBtn) vcardBtn.addEventListener('click', () => trackClick('vcard'));
  if (callBtn) callBtn.addEventListener('click', () => trackClick('call'));
  if (lineBtn) lineBtn.addEventListener('click', () => trackClick('line'));
  if (mapBtn) mapBtn.addEventListener('click', () => trackClick('map'));
  if (emailBtn) emailBtn.addEventListener('click', () => trackClick('email'));
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
