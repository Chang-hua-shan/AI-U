/**
 * AI+U - 官方行銷首頁 互動邏輯
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initTheme();
  initScrollReveal();
  initCard3DTilt();
  initShareModal();
  initConsultationForm();
});

/* ==========================================================================
   1. 導覽列滾動與行動版選單 (Navbar & Mobile Menu)
   ========================================================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!navbar) return;

  // 監聽滾動事件，加上毛玻璃與陰影
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 行動版漢堡選單切換
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !isExpanded);
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // 點擊選單連結後自動關閉選單
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }
}

/* ==========================================================================
   2. 深淺主題切換邏輯 (Theme Manager)
   ========================================================================== */
function initTheme() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (!themeBtn) return;
  
  const icon = themeBtn.querySelector('i');
  
  // 讀取本地儲存的主題設定，預設為淺色模式
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
      icon.className = 'fa-solid fa-sun'; // 深色模式顯示太陽 (用來切回淺色)
    }
  }

  function setLightTheme() {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    localStorage.setItem('theme', 'light');
    if (icon) {
      icon.className = 'fa-solid fa-moon'; // 淺色模式顯示月亮 (用來切回深色)
    }
  }
}

/* ==========================================================================
   3. 網頁滾動進入動畫 (Scroll Reveal Animations)
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('[data-reveal]');
  
  if (revealElements.length === 0) return;

  const revealOnScroll = () => {
    const triggerBottom = window.innerHeight * 0.85; // 視窗 85% 位置觸發
    
    revealElements.forEach(el => {
      const elTop = el.getBoundingClientRect().top;
      
      if (elTop < triggerBottom) {
        el.classList.add('active');
      }
    });
  };

  // 初始載入時先執行一次，接著監聽滾動
  revealOnScroll();
  window.addEventListener('scroll', revealOnScroll);
}

/* ==========================================================================
   4. 電子名片 Mockup 3D 傾斜效果 (3D Card Tilt Effect)
   ========================================================================== */
function initCard3DTilt() {
  const card = document.getElementById('digital-card-mockup');
  
  if (!card) return;

  // 點擊 Mockup 直接跳轉到名片頁面
  card.addEventListener('click', () => {
    window.location.href = 'card.html';
  });

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // 滑鼠在卡片內的 X 座標
    const y = e.clientY - rect.top;  // 滑鼠在卡片內的 Y 座標
    
    // 計算卡片中心點
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // 計算偏移百分比 (-10 ~ 10 度)
    const rotateX = ((centerY - y) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    // 套用 3D 傾斜變形
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    
    // 動態更新光澤效果位置
    const glow = card.querySelector('.card-mockup-glow');
    if (glow) {
      const glowX = (x / rect.width) * 100;
      const glowY = (y / rect.height) * 100;
      glow.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(233, 27, 98, 0.4) 0%, rgba(20, 20, 22, 0) 70%)`;
    }
  });

  // 移開滑鼠時重設卡片狀態
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    const glow = card.querySelector('.card-mockup-glow');
    if (glow) {
      glow.style.background = 'radial-gradient(circle, rgba(233, 27, 98, 0.35) 0%, rgba(20, 20, 22, 0) 70%)';
    }
  });
}

/* ==========================================================================
   5. QR Code 分享彈窗管理 (QR Code Dialog)
   ========================================================================== */
function initShareModal() {
  const showQrBtn = document.getElementById('btn-show-qr');
  const modal = document.getElementById('qr-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const closeAction = document.getElementById('modal-close-action');
  const qrImage = document.getElementById('qr-code-image');

  if (!showQrBtn || !modal || !qrImage) return;

  // 彈出 QR Code，指向 Carol 的個人電子名片頁面 (card.html)
  showQrBtn.addEventListener('click', () => {
    // 獲取目前網址路徑，並將尾端的 index.html 替換為 card.html
    let cardUrl = window.location.href;
    if (cardUrl.endsWith('index.html')) {
      cardUrl = cardUrl.replace('index.html', 'card.html');
    } else if (cardUrl.endsWith('/')) {
      cardUrl = cardUrl + 'card.html';
    } else {
      // 處理沒有後綴檔名的情況，確保指向同目錄下的 card.html
      const lastSlashIndex = cardUrl.lastIndexOf('/');
      cardUrl = cardUrl.substring(0, lastSlashIndex + 1) + 'card.html';
    }
    
    // QR Code API 呼叫
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(cardUrl)}`;
    qrImage.src = qrApiUrl;
    
    // 開啟 HTML5 原生 Dialog 彈窗
    modal.showModal();
  });

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
   6. 諮詢留言表單提交與 Toast 提示 (Simulated Consultation Submission)
   ========================================================================== */
function initConsultationForm() {
  const form = document.getElementById('consultation-form');
  const submitBtn = document.getElementById('btn-submit');
  const toast = document.getElementById('toast-notification');

  if (!form || !submitBtn || !toast) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // 阻擋預設送出

    // 取得輸入欄位
    const nameInput = document.getElementById('form-name');
    const phoneInput = document.getElementById('form-phone');
    const emailInput = document.getElementById('form-email');
    const serviceInput = document.getElementById('form-service');
    const messageInput = document.getElementById('form-message');

    // 簡易表單驗證
    if (!nameInput.value.trim() || !phoneInput.value.trim() || !emailInput.value.trim() || !serviceInput.value || !messageInput.value.trim()) {
      showToast('請填寫所有欄位並選擇諮詢項目！', 'fa-solid fa-triangle-exclamation');
      return;
    }

    // 進入傳送載入中狀態 (Simulating Loading State)
    const originalBtnText = submitBtn.querySelector('.btn-submit-text').textContent;
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-submit-text').textContent = '諮詢表單傳送中...';
    const submitIcon = submitBtn.querySelector('.submit-icon');
    if (submitIcon) {
      submitIcon.className = 'fa-solid fa-spinner fa-spin submit-icon';
    }

    // 模擬網路延遲 1.5 秒
    setTimeout(() => {
      // 成功狀態還原
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-submit-text').textContent = originalBtnText;
      if (submitIcon) {
        submitIcon.className = 'fa-solid fa-paper-plane submit-icon';
      }

      // 輸出主控台紀錄 (方便測試驗證)
      console.log('--- 收到來自官方網站的商務諮詢申請 ---');
      console.log('姓名：', nameInput.value.trim());
      console.log('電話：', phoneInput.value.trim());
      console.log('信箱：', emailInput.value.trim());
      console.log('諮詢服務：', serviceInput.options[serviceInput.selectedIndex].text);
      console.log('合作備註：', messageInput.value.trim());
      console.log('------------------------------------');

      // 清空表單
      form.reset();

      // 顯示高級 Toast 成功通知
      showToast('您的諮詢表單已成功傳送！我們將儘快聯絡您。', 'fa-solid fa-circle-check');
    }, 1500);
  });

  // 展示自訂 Toast 提示
  function showToast(message, iconClass) {
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    if (toastIcon) toastIcon.className = `${iconClass} toast-icon`;
    if (toastMessage) toastMessage.textContent = message;

    toast.classList.add('show');
    
    // 3.8 秒後自動隱藏
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }
}
