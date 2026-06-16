/**
 * Carol 吳凱若 - 電子名片 (NFC 碰碰卡落地網頁) 互動邏輯
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initShareModal();
  initContactForm();
});

/* ==========================================================================
   1. 深淺主題切換邏輯 (Theme Manager)
   ========================================================================== */
function initTheme() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (!themeBtn) return;
  
  const icon = themeBtn.querySelector('i');
  
  // 檢查 localStorage，預設為 light 湖水綠主題 (#42BEC9 底色)
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
      showToast('請完整填寫所有欄位！', 'fa-solid fa-triangle-exclamation');
      return;
    }

    // 進入傳送載入中狀態 (Simulating Loading State)
    const originalBtnText = submitBtn.querySelector('.btn-submit-text').textContent;
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-submit-text').textContent = '傳送預約中...';
    const submitIcon = submitBtn.querySelector('.submit-icon');
    if (submitIcon) {
      submitIcon.className = 'fa-solid fa-spinner fa-spin submit-icon';
    }

    // 模擬網路傳輸延遲 1.2 秒，增加真實體驗感
    setTimeout(() => {
      // 成功狀態還原
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-submit-text').textContent = originalBtnText;
      if (submitIcon) {
        submitIcon.className = 'fa-solid fa-paper-plane submit-icon';
      }

      // 輸出主控台紀錄 (方便測試驗證)
      console.log('--- 收到來自電子名片的商務洽談預約 ---');
      console.log('姓名：', nameInput.value.trim());
      console.log('電話：', phoneInput.value.trim());
      console.log('需求備註：', messageInput.value.trim());
      console.log('------------------------------------');

      // 清空表單
      form.reset();

      // 彈出奢華質感 Toast 成功提示
      showToast('訊息已成功傳送！', 'fa-solid fa-circle-check');
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
