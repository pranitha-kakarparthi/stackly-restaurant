/**
 * STACKLY RESTAURANT - MAIN INTERACTION SCRIPT
 * High Performance, Zero Bloat, Accessibility Focused
 */

// Force page positioning to the absolute top of window upon initial load and page reload
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

window.addEventListener('beforeunload', () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
});

window.addEventListener('pageshow', () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
});

window.addEventListener('load', () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
});

document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  initLoader();
  initHeroAnimations();
  initStickyNavbar();
  initBackToTop();
  initActiveNav();
  initMobileMenu();
  initAOS();
  initTimeGreeting();
  initCartDrawer();
  initContactForm();
});

/* ==========================================================================
   1. LOADER INITIALIZATION & FALLBACK
   ========================================================================== */
function initLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  let hidden = false;
  const hideLoader = () => {
    if (hidden) return;
    hidden = true;
    loader.classList.add('loader-hidden');
    setTimeout(() => {
      loader.style.display = 'none';
    }, 450);
  };

  // Check if page already loaded or wait for window load
  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 250);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 250));
    // Hard fallback timeout to ensure accessibility
    setTimeout(hideLoader, 1200);
  }
}

/* ==========================================================================
   1.1 HERO ENTRANCE ANIMATION CHOREOGRAPHY (Phase 1 & Phase 2)
   GPU-Composited, Zero Layout Shift, Accessible, Fluid Culinary Easing
   ========================================================================== */
function initHeroAnimations() {
  const heroElements = document.querySelectorAll('.hero-section, .page-hero-banner, .error-page-section');
  if (!heroElements.length) return;

  // Set initial GPU composited prep state
  heroElements.forEach(hero => hero.classList.add('hero-animate-init'));

  const activateHeroes = () => {
    heroElements.forEach(hero => {
      hero.classList.remove('hero-animate-init');
      hero.classList.add('hero-animate-active');
    });
  };

  const loader = document.getElementById('page-loader');
  if (loader && !loader.classList.contains('loader-hidden') && window.getComputedStyle(loader).display !== 'none') {
    let triggered = false;
    const triggerOnce = () => {
      if (triggered) return;
      triggered = true;
      setTimeout(activateHeroes, 60);
    };

    const observer = new MutationObserver(() => {
      if (loader.classList.contains('loader-hidden') || loader.style.display === 'none') {
        observer.disconnect();
        triggerOnce();
      }
    });
    observer.observe(loader, { attributes: true, attributeFilter: ['class', 'style'] });

    // Safety fallback: if loader hangs or takes > 1.2s, animate hero
    setTimeout(triggerOnce, 1100);
  } else {
    // No loader present or already dismissed, trigger immediately with micro-tick
    requestAnimationFrame(() => {
      setTimeout(activateHeroes, 60);
    });
  }
}

/* ==========================================================================
   2. STICKY NAVBAR BEHAVIOR
   ========================================================================== */
function initStickyNavbar() {
  const header = document.querySelector('.site-header, .dash-header, .auth-top-header');
  if (!header) return;

  const handleScroll = () => {
    const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollPos > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   2.1 BACK TO TOP BUTTON
   ========================================================================== */
function initBackToTop() {
  let backBtn = document.getElementById('back-to-top');

  // If button not already in the markup, create it dynamically
  if (!backBtn) {
    backBtn = document.createElement('button');
    backBtn.id = 'back-to-top';
    backBtn.className = 'back-to-top';
    backBtn.setAttribute('aria-label', 'Back to top');
    backBtn.setAttribute('title', 'Back to top');
    backBtn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    `;
    document.body.appendChild(backBtn);
  }

  const handleBackToTopScroll = () => {
    const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollPos > 250) {
      backBtn.classList.add('visible');
    } else {
      backBtn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', handleBackToTopScroll, { passive: true });
  document.addEventListener('scroll', handleBackToTopScroll, { passive: true });
  handleBackToTopScroll();

  backBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    // Also scroll documentElement / body for legacy browsers
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   3. ACTIVE NAV LINK HIGHLIGHTING
   ========================================================================== */
function initActiveNav() {
  const currentPath = window.location.pathname;
  let filename = currentPath.substring(currentPath.lastIndexOf('/') + 1);
  if (!filename || filename === '') filename = 'index.html';

  const navLinks = document.querySelectorAll('.nav-link, .dropdown-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const targetFile = href.split('?')[0].split('#')[0];
    
    if (targetFile === filename) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
      // If inside dropdown, also highlight parent menu item
      const parentDropdown = link.closest('.nav-item');
      if (parentDropdown) {
        const parentLink = parentDropdown.querySelector('.nav-link');
        if (parentLink) parentLink.classList.add('active');
      }
    } else {
      link.classList.remove('active');
    }
  });
}

/* ==========================================================================
   4. MOBILE NAVIGATION & BODY SCROLL LOCK
   ========================================================================== */
function initMobileMenu() {
  const hamburger = document.querySelector('.nav-hamburger');
  const navMenu = document.querySelector('.nav-menu');
  if (!hamburger || !navMenu) return;

  const toggleMenu = () => {
    const isOpen = navMenu.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const openMenu = () => {
    hamburger.classList.add('is-active');
    hamburger.setAttribute('aria-expanded', 'true');
    navMenu.classList.add('open');
    document.body.classList.add('no-scroll');
  };

  const closeMenu = () => {
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('open');
    document.body.classList.remove('no-scroll');
  };

  hamburger.addEventListener('click', toggleMenu);

  // Close when clicking outside menu
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  // Mobile Dropdown toggles
  const dropdownParents = document.querySelectorAll('.nav-item');
  dropdownParents.forEach(item => {
    const dropdown = item.querySelector('.nav-dropdown');
    if (dropdown) {
      const link = item.querySelector('.nav-link');
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 900) {
          e.preventDefault();
          item.classList.toggle('dropdown-open');
        }
      });
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      closeMenu();
    }
  });
}

/* ==========================================================================
   5. DYNAMIC TIME-OF-DAY GREETING (WCAG & Context-Aware)
   ========================================================================== */
function initTimeGreeting() {
  const greetingElements = document.querySelectorAll('.dynamic-greeting-text');
  if (!greetingElements.length) return;

  const hour = new Date().getHours();
  let greeting = 'Good evening';
  let icon = '🌙';

  if (hour >= 5 && hour < 12) {
    greeting = 'Good morning';
    icon = '🌅';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon';
    icon = '☀️';
  } else if (hour >= 17 && hour < 22) {
    greeting = 'Good evening';
    icon = '🌇';
  }

  greetingElements.forEach(el => {
    const userName = el.getAttribute('data-user-name') || '';
    el.textContent = `${greeting}${userName ? ', ' + userName : ''}! ${icon}`;
  });
}

/* ==========================================================================
   6. AOS ANIMATION (LIGHTWEIGHT INTERSECTION OBSERVER)
   ========================================================================== */
function initAOS() {
  const animatedElements = document.querySelectorAll('[data-aos]');
  if (!animatedElements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '60px 0px 60px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));

    // Instant reveal for above-the-fold elements
    setTimeout(() => {
      document.querySelectorAll('[data-aos]').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight + 100) {
          el.classList.add('aos-animate');
        }
      });
    }, 150);
  } else {
    // Fallback for older browsers
    animatedElements.forEach(el => el.classList.add('aos-animate'));
  }
}

/* ==========================================================================
   7. SHOPPING CART DRAWER & NOTIFICATIONS
   ========================================================================== */
let cartItems = [
  { id: 1, name: 'Crispy Corn Chicken', price: 22.50, qty: 1, img: 'assets/images/asian-crispy-corn-chicken-dish.webp' }
];

function initCartDrawer() {
  const cartButtons = document.querySelectorAll('.cart-btn, [data-open-cart]');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartDrawer = document.getElementById('cart-drawer');
  const closeCartBtn = document.getElementById('close-cart-btn');

  if (!cartDrawer) return;

  const openCart = () => {
    cartOverlay.classList.add('open');
    cartDrawer.classList.add('open');
    document.body.classList.add('no-scroll');
    renderCart();
  };

  const closeCart = () => {
    cartOverlay.classList.remove('open');
    cartDrawer.classList.remove('open');
    document.body.classList.remove('no-scroll');
  };

  cartButtons.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openCart();
  }));

  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Hook Add to Cart Buttons
  document.querySelectorAll('.dish-add-btn, [data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.dish-card') || btn.closest('.menu-item-row');
      const name = card ? card.querySelector('.dish-title, .menu-item-title')?.textContent.trim() : 'Chef Special';
      const priceText = card ? card.querySelector('.dish-price, .menu-item-price')?.textContent.replace(/[^0-9.]/g, '') : '22.50';
      const price = parseFloat(priceText) || 22.50;
      const img = card ? card.querySelector('img')?.getAttribute('src') : 'assets/images/asian-crispy-corn-chicken-dish.webp';

      addToCart(name, price, img);
      showToast(`Added "${name}" to your order!`);
    });
  });

  renderCart();
}

function addToCart(name, price, img) {
  const existing = cartItems.find(item => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cartItems.push({ id: Date.now(), name, price, qty: 1, img });
  }
  updateCartBadge();
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const totalCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  badges.forEach(b => {
    b.textContent = totalCount;
  });
}

function renderCart() {
  const cartList = document.getElementById('cart-items-list');
  const cartSubtotal = document.getElementById('cart-subtotal-val');
  if (!cartList) return;

  if (cartItems.length === 0) {
    cartList.innerHTML = `
      <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
        <p style="font-size: 1.1rem; margin-bottom: 10px;">Your cart is empty.</p>
        <p style="font-size: 0.88rem;">Explore our master chef specials and add your favorites!</p>
      </div>
    `;
    if (cartSubtotal) cartSubtotal.textContent = '$0.00';
    updateCartBadge();
    return;
  }

  let total = 0;
  cartList.innerHTML = cartItems.map(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    return `
      <div class="cart-item-row" style="display: flex; gap: 14px; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-subtle);">
        <img src="${item.img || 'assets/images/asian-crispy-corn-chicken-dish.webp'}" alt="${item.name}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
        <div style="flex-grow: 1;">
          <h5 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 4px;">${item.name}</h5>
          <span style="font-size: 0.85rem; color: var(--text-muted);">$${item.price.toFixed(2)} × ${item.qty}</span>
        </div>
        <div style="text-align: right;">
          <span style="font-weight: 800; font-size: 1rem; color: var(--color-primary);">$${itemTotal.toFixed(2)}</span>
          <button onclick="removeFromCart(${item.id})" style="display: block; font-size: 0.75rem; color: var(--color-error); margin-top: 4px; text-decoration: underline;">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  if (cartSubtotal) cartSubtotal.textContent = `$${total.toFixed(2)}`;
  updateCartBadge();
}

window.removeFromCart = function(id) {
  cartItems = cartItems.filter(item => item.id !== id);
  renderCart();
  showToast('Item removed from cart.');
};

/* ==========================================================================
   8. TOAST NOTIFICATIONS
   ========================================================================== */
function showToast(message, duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
window.showToast = showToast;

/* ==========================================================================
   9. STRICT FORM VALIDATION HELPER (Used in Contact Page)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const phoneInput = document.getElementById('contact-phone');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');
  const charCounter = document.getElementById('message-char-count');

  // Alphabets only validation for Name
  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      // Remove any digits
      e.target.value = e.target.value.replace(/[0-9]/g, '');
    });
  }

  // Exactly 10 digits numerical validation for Mobile
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      // Only digits, max 10
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  // Live character counter for message
  if (messageInput && charCounter) {
    messageInput.addEventListener('input', (e) => {
      charCounter.textContent = `${e.target.value.length} / 500 characters`;
    });
  }

  // Form submission handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstInvalid = null;

    // Validate Name (Required, alphabets only, min 2 chars)
    const nameVal = nameInput.value.trim();
    if (!nameVal || !/^[A-Za-z\s]+$/.test(nameVal) || nameVal.length < 2) {
      setFieldError(nameInput, 'Please enter a valid full name (alphabets only, min 2 characters).');
      if (!firstInvalid) firstInvalid = nameInput;
    } else {
      clearFieldError(nameInput);
    }

    // Validate Email
    const emailVal = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      setFieldError(emailInput, 'Please provide a valid email address (e.g. name@domain.com).');
      if (!firstInvalid) firstInvalid = emailInput;
    } else {
      clearFieldError(emailInput);
    }

    // Validate Phone (Exact 10 digits)
    const phoneVal = phoneInput.value.trim();
    if (!phoneVal || phoneVal.length !== 10) {
      setFieldError(phoneInput, 'Mobile number must be exactly 10 digits.');
      if (!firstInvalid) firstInvalid = phoneInput;
    } else {
      clearFieldError(phoneInput);
    }

    // Validate Subject (Required)
    if (!subjectInput.value.trim()) {
      setFieldError(subjectInput, 'Please select or enter an inquiry subject.');
      if (!firstInvalid) firstInvalid = subjectInput;
    } else {
      clearFieldError(subjectInput);
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Success State
    const successBox = document.getElementById('contact-success-msg');
    if (successBox) {
      successBox.style.display = 'block';
      form.reset();
      if (charCounter) charCounter.textContent = '0 / 500 characters';
      successBox.scrollIntoView({ behavior: 'smooth' });
      showToast('Thank you! Your message has been sent to our team.');
    }
  });
}

function setFieldError(input, msg) {
  input.classList.add('is-invalid');
  input.classList.remove('is-valid');
  const parent = input.closest('.form-group') || input.parentElement;
  let feedback = parent.querySelector('.invalid-feedback');
  if (feedback) feedback.textContent = msg;
}

function clearFieldError(input) {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  const parent = input.closest('.form-group') || input.parentElement;
  let feedback = parent.querySelector('.invalid-feedback');
  if (feedback) feedback.textContent = '';
}
