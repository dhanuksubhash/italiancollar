/* ==========================================
   UrbanGifts Theme — JavaScript
   urbangifts.in
   ========================================== */

(function () {
  'use strict';

  // === Sticky Header ===
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // === Mobile Menu ===
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
  }

  // === Cart Drawer ===
  const cartOverlay = document.querySelector('.cart-overlay');
  const cartDrawer = document.querySelector('.cart-drawer');
  const cartBtns = document.querySelectorAll('[data-open-cart]');
  const cartClose = document.querySelector('.cart-close');

  function openCart() {
    cartOverlay?.classList.add('open');
    cartDrawer?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartOverlay?.classList.remove('open');
    cartDrawer?.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartBtns.forEach(btn => btn.addEventListener('click', openCart));
  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  // === Gift Finder Quiz ===
  const quizSteps = document.querySelectorAll('.quiz-step');
  const quizOptions = document.querySelectorAll('.quiz-option');
  let currentStep = 0;
  const answers = {};

  quizOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const step = opt.closest('.quiz-step');
      step.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      answers[currentStep] = opt.dataset.value;

      setTimeout(() => {
        if (currentStep < quizSteps.length - 1) {
          quizSteps[currentStep].classList.remove('active');
          currentStep++;
          quizSteps[currentStep].classList.add('active');
          updateProgress();
        } else {
          submitQuiz();
        }
      }, 400);
    });
  });

  function updateProgress() {
    document.querySelectorAll('.quiz-progress-dot').forEach((dot, i) => {
      dot.classList.toggle('done', i <= currentStep);
    });
  }

  function submitQuiz() {
    const params = new URLSearchParams(answers).toString();
    window.location.href = `/collections/all?${params}`;
  }

  // === Quantity Input ===
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.qty-wrap').querySelector('.qty-input');
      let val = parseInt(input.value) || 1;
      if (btn.dataset.action === 'plus') val = Math.min(val + 1, 99);
      if (btn.dataset.action === 'minus') val = Math.max(val - 1, 1);
      input.value = val;
    });
  });

  // === Product Image Gallery ===
  const thumbs = document.querySelectorAll('.product-thumb');
  const mainImg = document.querySelector('.product-main-img img');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      if (mainImg && thumb.dataset.src) {
        mainImg.src = thumb.dataset.src;
      }
    });
  });

  // === Gift Message Toggle ===
  const giftToggle = document.querySelector('#gift-message-toggle');
  const giftTextarea = document.querySelector('#gift-message-text');
  if (giftToggle && giftTextarea) {
    giftToggle.addEventListener('change', () => {
      giftTextarea.style.display = giftToggle.checked ? 'block' : 'none';
    });
  }

  // === Variant Selection ===
  document.querySelectorAll('.variant-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.variant-options').querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // === Fade-in on scroll ===
  const fadeEls = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    fadeEls.forEach(el => observer.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  // === Quick Add to Cart ===
  document.querySelectorAll('.product-quick-add').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const variantId = btn.dataset.variantId;
      if (!variantId) return;

      btn.textContent = 'Adding...';
      btn.disabled = true;

      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity: 1 })
        });
        if (res.ok) {
          btn.textContent = 'Added!';
          updateCartCount();
          openCart();
          setTimeout(() => { btn.textContent = 'Add to Cart'; btn.disabled = false; }, 2000);
        }
      } catch {
        btn.textContent = 'Error';
        btn.disabled = false;
      }
    });
  });

  // === Update Cart Count ===
  async function updateCartCount() {
    try {
      const res = await fetch('/cart.js');
      const cart = await res.json();
      document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = cart.item_count;
        el.style.display = cart.item_count > 0 ? 'flex' : 'none';
      });
    } catch {}
  }

  // === Newsletter Form ===
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]').value;
      const btn = newsletterForm.querySelector('button');
      btn.textContent = 'Subscribing...';
      btn.disabled = true;
      // Shopify newsletter form submission
      try {
        const res = await fetch('/contact#contact_form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ 'contact[email]': email, form_type: 'customer', utf8: '✓' })
        });
        if (res.ok) {
          btn.textContent = '✓ Subscribed!';
          newsletterForm.querySelector('input').value = '';
        }
      } catch {
        btn.textContent = 'Subscribe';
        btn.disabled = false;
      }
    });
  }

  // === Add to Cart (Product Page) ===
  const addToCartForm = document.querySelector('#add-to-cart-form');
  if (addToCartForm) {
    addToCartForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(addToCartForm);
      const btn = addToCartForm.querySelector('[type="submit"]');
      btn.textContent = 'Adding...';
      btn.disabled = true;

      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: formData.get('id'),
            quantity: parseInt(formData.get('quantity')) || 1,
            properties: { 'Gift Message': formData.get('gift_message') || '' }
          })
        });
        if (res.ok) {
          btn.textContent = '✓ Added to Cart!';
          updateCartCount();
          openCart();
          setTimeout(() => { btn.textContent = 'Add to Cart'; btn.disabled = false; }, 2000);
        }
      } catch {
        btn.textContent = 'Add to Cart';
        btn.disabled = false;
      }
    });
  }

  // === Init ===
  updateCartCount();
})();
