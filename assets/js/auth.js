/**
 * STACKLY RESTAURANT - CLIENT-SIDE AUTHENTICATION & SESSION ENGINE
 * Pure Frontend LocalStorage Simulation: Users, Session, Roles, Validation
 */

const STORAGE_KEYS = {
  USERS: 'stackly_restaurant_users',
  CURRENT_USER: 'stackly_restaurant_currentUser',
  ROLE: 'stackly_restaurant_role',
  PREFERENCES: 'stackly_restaurant_preferences',
  THEME: 'stackly_restaurant_themeSettings',
  NOTIFICATIONS: 'stackly_restaurant_notifications',
  SAVED_FORMS: 'stackly_restaurant_savedForms'
};

// Initialize default system accounts if not present
function initializeAuthStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const seedUsers = [
      {
        id: 'usr_001',
        firstName: 'Chef',
        lastName: 'Lin',
        username: 'masterchef',
        email: 'chef@thestackly.com',
        role: 'Manager',
        mobile: '9876543210',
        countryCode: '+91',
        joinedAt: new Date().toISOString()
      },
      {
        id: 'usr_002',
        firstName: 'Pranesh',
        lastName: 'Admin',
        username: 'admin',
        email: 'admin@thestackly.com',
        role: 'Admin',
        mobile: '9876543211',
        countryCode: '+91',
        joinedAt: new Date().toISOString()
      },
      {
        id: 'usr_003',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        username: 'sarahj',
        email: 'sarah@thestackly.com',
        role: 'Customer',
        mobile: '9876543212',
        countryCode: '+1',
        joinedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seedUsers));
  }
}

initializeAuthStorage();

document.addEventListener('DOMContentLoaded', () => {
  initSignIn();
  initSignUp();
  initPasswordToggles();
});

/* ==========================================================================
   PASSWORD SHOW / HIDE TOGGLE
   ========================================================================== */
function initPasswordToggles() {
  document.querySelectorAll('.password-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
      btn.innerHTML = isPassword 
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    });
  });
}

/* ==========================================================================
   SIGN IN CONTROLLER
   ========================================================================== */
function initSignIn() {
  const form = document.getElementById('signin-form');
  if (!form) return;

  const emailInput = document.getElementById('signin-email');
  const passwordInput = document.getElementById('signin-password');
  const roleSelect = document.getElementById('signin-role');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstInvalid = null;

    // Email validation
    const emailVal = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      setAuthError(emailInput, 'Please provide a valid registered email address.');
      if (!firstInvalid) firstInvalid = emailInput;
    } else {
      clearAuthError(emailInput);
    }

    // Password validation (min 6 characters)
    const passVal = passwordInput.value;
    if (!passVal || passVal.length < 6) {
      setAuthError(passwordInput, 'Password must be at least 6 characters.');
      if (!firstInvalid) firstInvalid = passwordInput;
    } else {
      clearAuthError(passwordInput);
    }

    // Role selection
    const roleVal = roleSelect.value;
    if (!roleVal) {
      setAuthError(roleSelect, 'Please select your login role.');
      if (!firstInvalid) firstInvalid = roleSelect;
    } else {
      clearAuthError(roleSelect);
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Successful validation: create/update session in localStorage
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    let user = users.find(u => u.email.toLowerCase() === emailVal.toLowerCase());
    
    // If not found in users, dynamically create profile for demo smoothness
    if (!user) {
      user = {
        id: 'usr_' + Date.now(),
        firstName: emailVal.split('@')[0],
        lastName: 'Member',
        username: emailVal.split('@')[0],
        email: emailVal,
        role: roleVal,
        joinedAt: new Date().toISOString()
      };
      users.push(user);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } else {
      user.role = roleVal; // update selected role
    }

    const sessionData = {
      isLoggedIn: true,
      user: user,
      role: roleVal,
      loginTimestamp: new Date().toISOString(),
      lastLoginFormatted: new Date().toLocaleString()
    };

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(sessionData));
    localStorage.setItem(STORAGE_KEYS.ROLE, roleVal);

    if (window.showToast) window.showToast('Login successful! Redirecting to Dashboard...');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 600);
  });
}

/* ==========================================================================
   SIGN UP / REGISTRATION CONTROLLER
   ========================================================================== */
function initSignUp() {
  const form = document.getElementById('signup-form');
  if (!form) return;

  const firstNameInput = document.getElementById('signup-firstname');
  const lastNameInput = document.getElementById('signup-lastname');
  const usernameInput = document.getElementById('signup-username');
  const emailInput = document.getElementById('signup-email');
  const passwordInput = document.getElementById('signup-password');
  const confirmPasswordInput = document.getElementById('signup-confirm-password');
  const roleSelect = document.getElementById('signup-role');
  const countryCodeSelect = document.getElementById('signup-country-code');
  const phoneInput = document.getElementById('signup-phone');
  const addressInput = document.getElementById('signup-address');
  const termsCheckbox = document.getElementById('signup-terms');

  // Input restrictions: Name fields no digits
  [firstNameInput, lastNameInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[0-9]/g, '');
      });
    }
  });

  // Mobile number: exact 10 digits numerical validation
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  // Password strength meter
  if (passwordInput) {
    passwordInput.addEventListener('input', () => {
      evaluatePasswordStrength(passwordInput.value);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstInvalid = null;

    // First Name (Required, alphabets only, min 2 chars)
    const fnVal = firstNameInput.value.trim();
    if (!fnVal || !/^[A-Za-z]+$/.test(fnVal) || fnVal.length < 2) {
      setAuthError(firstNameInput, 'First name is required (alphabets only, min 2 chars).');
      if (!firstInvalid) firstInvalid = firstNameInput;
    } else {
      clearAuthError(firstNameInput);
    }

    // Last Name (Required, alphabets only, min 2 chars)
    const lnVal = lastNameInput.value.trim();
    if (!lnVal || !/^[A-Za-z]+$/.test(lnVal) || lnVal.length < 2) {
      setAuthError(lastNameInput, 'Last name is required (alphabets only, min 2 chars).');
      if (!firstInvalid) firstInvalid = lastNameInput;
    } else {
      clearAuthError(lastNameInput);
    }

    // Username (Optional, but if filled must be min 3 chars and unique)
    const unVal = usernameInput ? usernameInput.value.trim() : '';
    if (unVal) {
      if (unVal.length < 3) {
        setAuthError(usernameInput, 'Username must be at least 3 characters.');
        if (!firstInvalid) firstInvalid = usernameInput;
      } else {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        if (users.some(u => u.username && u.username.toLowerCase() === unVal.toLowerCase())) {
          setAuthError(usernameInput, 'This username is already taken.');
          if (!firstInvalid) firstInvalid = usernameInput;
        } else {
          clearAuthError(usernameInput);
        }
      }
    }

    // Email (Required, format)
    const emailVal = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      setAuthError(emailInput, 'Please provide a valid email address.');
      if (!firstInvalid) firstInvalid = emailInput;
    } else {
      clearAuthError(emailInput);
    }

    // Password Standard Requirements (Uppercase, Lowercase, Number, Special Character, min 8 chars)
    const passVal = passwordInput.value;
    const hasUpper = /[A-Z]/.test(passVal);
    const hasLower = /[a-z]/.test(passVal);
    const hasNumber = /[0-9]/.test(passVal);
    const hasSpecial = /[^A-Za-z0-9]/.test(passVal);
    const isLength = passVal.length >= 8;

    if (!isLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      setAuthError(passwordInput, 'Password must be 8+ characters and contain uppercase, lowercase, number, and special character.');
      if (!firstInvalid) firstInvalid = passwordInput;
    } else {
      clearAuthError(passwordInput);
    }

    // Confirm Password
    const confirmPassVal = confirmPasswordInput.value;
    if (confirmPassVal !== passVal) {
      setAuthError(confirmPasswordInput, 'Passwords do not match.');
      if (!firstInvalid) firstInvalid = confirmPasswordInput;
    } else {
      clearAuthError(confirmPasswordInput);
    }

    // Role (Required)
    const roleVal = roleSelect.value;
    if (!roleVal) {
      setAuthError(roleSelect, 'Please select your registration role.');
      if (!firstInvalid) firstInvalid = roleSelect;
    } else {
      clearAuthError(roleSelect);
    }

    // Mobile Number (Required, exact 10 digits)
    const phoneVal = phoneInput.value.trim();
    if (!phoneVal || phoneVal.length !== 10) {
      setAuthError(phoneInput, 'Mobile number must be exactly 10 digits.');
      if (!firstInvalid) firstInvalid = phoneInput;
    } else {
      clearAuthError(phoneInput);
    }

    // Address (Optional, if entered min 6 chars)
    if (addressInput && addressInput.value.trim()) {
      if (addressInput.value.trim().length < 6) {
        setAuthError(addressInput, 'Address should be at least 6 characters.');
        if (!firstInvalid) firstInvalid = addressInput;
      } else {
        clearAuthError(addressInput);
      }
    }

    // Mandatory Terms & Conditions Checkbox
    if (!termsCheckbox.checked) {
      const termsWrap = termsCheckbox.closest('.form-check');
      if (termsWrap) {
        let fb = termsWrap.querySelector('.invalid-feedback');
        if (!fb) {
          fb = document.createElement('div');
          fb.className = 'invalid-feedback';
          termsWrap.appendChild(fb);
        }
        fb.textContent = 'You must accept the Terms of Use and Privacy Policy.';
        fb.style.display = 'block';
      }
      if (!firstInvalid) firstInvalid = termsCheckbox;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Save newly registered account
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const newUser = {
      id: 'usr_' + Date.now(),
      firstName: fnVal,
      lastName: lnVal,
      username: unVal || fnVal.toLowerCase() + Math.floor(Math.random() * 100),
      email: emailVal,
      role: roleVal,
      countryCode: countryCodeSelect ? countryCodeSelect.value : '+91',
      mobile: phoneVal,
      address: addressInput ? addressInput.value.trim() : '',
      joinedAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    if (window.showToast) window.showToast('Account created successfully! Redirecting to Sign In...');
    setTimeout(() => {
      window.location.href = 'sign-in.html';
    }, 1200);
  });
}

function evaluatePasswordStrength(val) {
  const fill = document.getElementById('password-strength-fill');
  const label = document.getElementById('password-strength-text');
  if (!fill || !label) return;

  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[a-z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  fill.className = 'strength-fill';

  if (!val) {
    fill.style.width = '0%';
    label.textContent = 'Password strength';
    return;
  }

  if (score <= 2) {
    fill.classList.add('weak');
    label.textContent = 'Weak (add numbers & symbols)';
    label.style.color = 'var(--color-error)';
  } else if (score === 3) {
    fill.classList.add('fair');
    label.textContent = 'Fair (add uppercase & special characters)';
    label.style.color = 'var(--color-warning)';
  } else if (score === 4) {
    fill.classList.add('good');
    label.textContent = 'Good (almost strong!)';
    label.style.color = '#F5A623';
  } else {
    fill.classList.add('strong');
    label.textContent = 'Strong (excellent security)';
    label.style.color = 'var(--color-success)';
  }
}

function setAuthError(input, msg) {
  input.classList.add('is-invalid');
  input.classList.remove('is-valid');
  const parent = input.closest('.form-group') || input.parentElement;
  let feedback = parent.querySelector('.invalid-feedback');
  if (feedback) feedback.textContent = msg;
}

function clearAuthError(input) {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  const parent = input.closest('.form-group') || input.parentElement;
  let feedback = parent.querySelector('.invalid-feedback');
  if (feedback) feedback.textContent = '';
}
