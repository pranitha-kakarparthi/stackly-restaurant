/**
 * STACKLY RESTAURANT - SAAS DASHBOARD ENGINE
 * Multi-Role Awareness (Customer, Manager, Vendor)
 * Reactive views, KPI metrics, SVG charts, and interactive tables
 */

document.addEventListener('DOMContentLoaded', () => {
  enforceAuth();
  initDashboard();
});

function enforceAuth() {
  let sessionStr = localStorage.getItem('stackly_restaurant_currentUser');
  if (!sessionStr) {
    // Seed default demo session so direct page access & testing renders smoothly
    const defaultSession = {
      isLoggedIn: true,
      user: {
        id: 'usr_003',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        username: 'sarahj',
        email: 'sarah@thestackly.com',
        role: 'Customer'
      },
      role: 'Customer',
      loginTimestamp: new Date().toISOString(),
      lastLoginFormatted: new Date().toLocaleString()
    };
    localStorage.setItem('stackly_restaurant_currentUser', JSON.stringify(defaultSession));
    localStorage.setItem('stackly_restaurant_role', 'Customer');
    sessionStr = JSON.stringify(defaultSession);
  }
  try {
    const session = JSON.parse(sessionStr);
    if (!session || !session.isLoggedIn) {
      window.location.href = 'sign-in.html';
    }
  } catch (e) {
    window.location.href = 'sign-in.html';
  }
}

function initDashboard() {
  const sessionStr = localStorage.getItem('stackly_restaurant_currentUser');
  if (!sessionStr) return;
  const session = JSON.parse(sessionStr);
  const user = session.user || { firstName: 'Patron', role: 'Customer' };
  let currentRole = localStorage.getItem('stackly_restaurant_role') || session.role || 'Customer';

  // Populate User Profile Header
  const userNameEl = document.getElementById('dash-header-username');
  const userRoleEl = document.getElementById('dash-header-role');
  const userAvatarEl = document.getElementById('dash-header-avatar');
  const roleSelectEl = document.getElementById('dash-role-preview-selector');

  const fullName = `${user.firstName || 'Patron'} ${user.lastName || ''}`.trim();
  if (userNameEl) userNameEl.textContent = fullName;
  if (userRoleEl) userRoleEl.textContent = currentRole;
  if (userAvatarEl) {
    const initials = (user.firstName ? user.firstName[0] : 'U') + (user.lastName ? user.lastName[0] : '');
    userAvatarEl.textContent = initials.toUpperCase();
  }

  // Sync role switcher dropdown
  if (roleSelectEl) {
    roleSelectEl.value = currentRole;
    roleSelectEl.addEventListener('change', (e) => {
      const newRole = e.target.value;
      localStorage.setItem('stackly_restaurant_role', newRole);
      session.role = newRole;
      localStorage.setItem('stackly_restaurant_currentUser', JSON.stringify(session));
      if (userRoleEl) userRoleEl.textContent = newRole;
      renderRoleDashboard(newRole, user);
      if (window.showToast) window.showToast(`Switched view to ${newRole} Dashboard`);
    });
  }

  // Dynamic time greeting
  updateDashboardGreeting(user.firstName);

  // Sign Out Handler
  const signOutBtn = document.getElementById('dash-signout-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('stackly_restaurant_currentUser');
      localStorage.removeItem('stackly_restaurant_role');
      if (window.showToast) window.showToast('You have been signed out.');
      setTimeout(() => {
        window.location.href = 'sign-in.html';
      }, 400);
    });
  }

  // Sidebar toggle
  initSidebarToggle();

  // Navigation tab switching
  initSidebarNav();

  // Initial render based on role
  renderRoleDashboard(currentRole, user);
}

function updateDashboardGreeting(firstName) {
  const greetingEl = document.getElementById('dash-greeting');
  if (!greetingEl) return;
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

  greetingEl.innerHTML = `${greeting}, ${firstName || 'Chef'}! <span style="font-size: 1.1em;">${icon}</span>`;
}

function initSidebarToggle() {
  const sidebar = document.getElementById('dash-sidebar');
  const toggleBtn = document.getElementById('dash-sidebar-toggle');
  const mobileToggleBtn = document.getElementById('dash-mobile-sidebar-toggle');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        sidebar.classList.toggle('open');
        document.body.classList.toggle('no-scroll', sidebar.classList.contains('open'));
      } else {
        sidebar.classList.toggle('collapsed');
      }
    });
  }

  if (mobileToggleBtn && sidebar) {
    mobileToggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      document.body.classList.toggle('no-scroll', sidebar.classList.contains('open'));
    });
  }

  // Close sidebar on link click in mobile view
  document.querySelectorAll('.dash-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900 && sidebar) {
        sidebar.classList.remove('open');
        document.body.classList.remove('no-scroll');
      }
    });
  });
}

function initSidebarNav() {
  const links = document.querySelectorAll('.dash-nav-link');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const targetView = link.getAttribute('data-view') || 'overview';
      switchView(targetView);
    });
  });
}

function switchView(viewName) {
  const sections = document.querySelectorAll('.dash-view-panel');
  sections.forEach(sec => {
    sec.style.display = (sec.id === `view-${viewName}`) ? 'block' : 'none';
  });
}

/* ==========================================================================
   ROLE DASHBOARD RENDERERS
   ========================================================================== */
function renderRoleDashboard(role, user) {
  const dynamicContainer = document.getElementById('role-dynamic-content');
  if (!dynamicContainer) return;

  if (role === 'Manager') {
    renderManagerDashboard(dynamicContainer, user);
  } else if (role === 'Vendor') {
    renderVendorDashboard(dynamicContainer, user);
  } else {
    renderCustomerDashboard(dynamicContainer, user);
  }
}

/* 1. MANAGER DASHBOARD */
function renderManagerDashboard(container, user) {
  container.innerHTML = `
    <!-- Section 1: Manager KPIs -->
    <div class="kpi-cards-grid">
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Active Dining Tables</div>
          <div class="kpi-value">24 / 28</div>
          <div class="kpi-trend up">86% Floor Utilization</div>
        </div>
        <div class="kpi-icon-wrap">🍽️</div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Kitchen Display Queue</div>
          <div class="kpi-value">12 Tickets</div>
          <div class="kpi-trend up">Target: &lt; 15 mins</div>
        </div>
        <div class="kpi-icon-wrap">⏱️</div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Staff On Duty</div>
          <div class="kpi-value">18 Active</div>
          <div class="kpi-trend">Full kitchen coverage</div>
        </div>
        <div class="kpi-icon-wrap">👨‍🍳</div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Guest Satisfaction Score</div>
          <div class="kpi-value">4.9 / 5.0</div>
          <div class="kpi-trend up">98% positive reviews</div>
        </div>
        <div class="kpi-icon-wrap">⭐</div>
      </div>
    </div>

    <!-- Section 2: Table Floor Map & Live Reservations -->
    <div class="dash-card" style="margin-bottom: 28px;">
      <div class="dash-card-header">
        <h4 class="dash-card-title">Live Dining Floor & Reservations Today</h4>
        <a href="404.html" class="btn btn-primary btn-sm">Add Reservation <span class="btn-arrow">→</span></a>
      </div>
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Table #</th>
              <th>Guest Name</th>
              <th>Party Size</th>
              <th>Time Slot</th>
              <th>Server</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Table 04 (Window)</strong></td>
              <td>Sarah Jenkins</td>
              <td>4 Guests</td>
              <td>7:30 PM</td>
              <td>David K.</td>
              <td><span class="badge badge-success">Seated</span></td>
              <td><a href="404.html" class="btn btn-sm btn-secondary">View Order</a></td>
            </tr>
            <tr>
              <td><strong>Table 12 (Booth)</strong></td>
              <td>Dr. Marcus Vance</td>
              <td>2 Guests</td>
              <td>8:00 PM</td>
              <td>Elena R.</td>
              <td><span class="badge badge-warning">Incoming</span></td>
              <td><a href="404.html" class="btn btn-sm btn-secondary">Check-In</a></td>
            </tr>
            <tr>
              <td><strong>VIP Lounge A</strong></td>
              <td>Priya Sharma</td>
              <td>8 Guests</td>
              <td>8:15 PM</td>
              <td>Lead Server Alex</td>
              <td><span class="badge badge-primary">Tasting Menu</span></td>
              <td><a href="404.html" class="btn btn-sm btn-secondary">Prep Table</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Section 3 & 4: Inventory Alerts & Shift Notes -->
    <div class="dash-section-grid">
      <div class="dash-card">
        <div class="dash-card-header">
          <h4 class="dash-card-title">Pantry & Inventory Stock Alerts</h4>
          <span class="badge badge-warning">2 Action Required</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #FFF9F5; border-radius: 8px;">
            <div>
              <strong>A5 Wagyu Beef Striploins</strong>
              <div style="font-size: 0.8rem; color: var(--text-muted);">Current: 6.2 kg | Min: 10 kg</div>
            </div>
            <a href="404.html" class="btn btn-primary btn-sm">Reorder</a>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #FFF9F5; border-radius: 8px;">
            <div>
              <strong>Organic Shiitake Mushrooms</strong>
              <div style="font-size: 0.8rem; color: var(--text-muted);">Current: 4 kg | Min: 8 kg</div>
            </div>
            <a href="404.html" class="btn btn-primary btn-sm">Reorder</a>
          </div>
        </div>
      </div>

      <div class="dash-card">
        <div class="dash-card-header">
          <h4 class="dash-card-title">Shift Handover & Manager Notes</h4>
        </div>
        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 14px;">
          "High volume anticipated for Brooklyn dinner rush. Executive Chef Qun Lin special tasting starts at 7:00 PM. Station 2 pre-pped."
        </p>
        <a href="404.html" class="btn btn-secondary btn-sm" style="width: 100%;">Add Manager Note <span class="btn-arrow">→</span></a>
      </div>
    </div>
  `;
}

/* 2. CUSTOMER DASHBOARD */
function renderCustomerDashboard(container, user) {
  container.innerHTML = `
    <!-- Section 1: Customer Welcome & Points -->
    <div class="kpi-cards-grid">
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Stackly Gourmet Club</div>
          <div class="kpi-value">Gold Member</div>
          <div class="kpi-trend up">1,420 Reward Points</div>
        </div>
        <div class="kpi-icon-wrap">🌟</div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Upcoming Reservation</div>
          <div class="kpi-value">Today, 7:30 PM</div>
          <div class="kpi-trend">Table 04 (Salem Branch)</div>
        </div>
        <div class="kpi-icon-wrap">📅</div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Active Online Order</div>
          <div class="kpi-value">Out for Delivery</div>
          <div class="kpi-trend up">Estimated in 18 mins</div>
        </div>
        <div class="kpi-icon-wrap">🛵</div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Available Dining Credit</div>
          <div class="kpi-value">$45.00</div>
          <div class="kpi-trend up">Valid until Dec 31</div>
        </div>
        <div class="kpi-icon-wrap">🎁</div>
      </div>
    </div>

    <!-- Section 2: Active Order Tracking Card -->
    <div class="dash-card" style="margin-bottom: 28px;">
      <div class="dash-card-header">
        <h4 class="dash-card-title">Live Delivery Order #STK-8924</h4>
        <span class="badge badge-success">On the Way</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: center;">
        <div>
          <p style="font-weight: 700; font-size: 1.05rem; margin-bottom: 6px;">Crispy Corn Chicken + Artisan Wagyu Ramen</p>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 14px;">Delivery to: MMR Complex, Chinna Thirupathi, Salem</p>
          <div style="display: flex; gap: 10px;">
            <a href="404.html" class="btn btn-primary btn-sm">Track Courier <span class="btn-arrow">→</span></a>
            <a href="404.html" class="btn btn-secondary btn-sm">View Digital Receipt</a>
          </div>
        </div>
        <div style="background: var(--bg-surface-alt); padding: 18px; border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 8px;">
            <span>Kitchen Prep</span>
            <span>Quality Check</span>
            <span style="color: var(--color-primary);">In Transit</span>
            <span>Arrived</span>
          </div>
          <div style="height: 8px; background: #DDD; border-radius: 4px; overflow: hidden;">
            <div style="width: 75%; height: 100%; background: var(--color-primary);"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Favorite Dishes & Quick Re-order -->
    <div class="dash-card" style="margin-bottom: 28px;">
      <div class="dash-card-header">
        <h4 class="dash-card-title">Your Favorite Chef Creations</h4>
        <a href="lunch-specials.html" class="btn btn-secondary btn-sm">Explore Menu <span class="btn-arrow">→</span></a>
      </div>
      <div class="dishes-grid" style="margin-top: 10px;">
        <div class="dish-card">
          <div class="dish-img-wrap" style="height: 160px;">
            <img src="assets/images/asian-crispy-corn-chicken-dish.webp" alt="Crispy Corn Chicken">
          </div>
          <div class="dish-content">
            <h5 class="dish-title" style="font-size: 1.05rem;">Crispy Corn Chicken</h5>
            <div class="dish-footer" style="padding-top: 10px;">
              <span class="dish-price" style="font-size: 1.15rem;">$22.50</span>
              <button class="btn btn-primary btn-sm" data-add-to-cart>Re-order</button>
            </div>
          </div>
        </div>

        <div class="dish-card">
          <div class="dish-img-wrap" style="height: 160px;">
            <img src="assets/images/artisan-wagyu-ramen-special.webp" alt="Artisan Wagyu Ramen">
          </div>
          <div class="dish-content">
            <h5 class="dish-title" style="font-size: 1.05rem;">Wagyu Artisan Ramen</h5>
            <div class="dish-footer" style="padding-top: 10px;">
              <span class="dish-price" style="font-size: 1.15rem;">$26.50</span>
              <button class="btn btn-primary btn-sm" data-add-to-cart>Re-order</button>
            </div>
          </div>
        </div>

        <div class="dish-card">
          <div class="dish-img-wrap" style="height: 160px;">
            <img src="assets/images/spicy-dan-dan-noodles-bowl.webp" alt="Spicy Dan Dan Noodles">
          </div>
          <div class="dish-content">
            <h5 class="dish-title" style="font-size: 1.05rem;">Spicy Dan Dan Noodles</h5>
            <div class="dish-footer" style="padding-top: 10px;">
              <span class="dish-price" style="font-size: 1.15rem;">$18.00</span>
              <button class="btn btn-primary btn-sm" data-add-to-cart>Re-order</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* 3. VENDOR DASHBOARD (6 Comprehensive Supply Chain & Sourcing Sections) */
function renderVendorDashboard(container, user) {
  container.innerHTML = `
    <!-- Section 1: Vendor Sourcing & Logistics KPIs -->
    <div class="kpi-cards-grid">
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Active Purchase Orders</div>
          <div class="kpi-value">4 Open POs</div>
          <div class="kpi-trend up">Next Delivery: Tomorrow 6:00 AM</div>
        </div>
        <div class="kpi-icon-wrap">📦</div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Approved Invoices (This Month)</div>
          <div class="kpi-value">$18,450.00</div>
          <div class="kpi-trend up">Disbursed on 1st & 15th</div>
        </div>
        <div class="kpi-icon-wrap">🧾</div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Monthly Fulfilled Produce</div>
          <div class="kpi-value">3,420 kg</div>
          <div class="kpi-trend up">100% Certified Organic</div>
        </div>
        <div class="kpi-icon-wrap">🥬</div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-label">On-Time Delivery Score</div>
          <div class="kpi-value">99.4% ★</div>
          <div class="kpi-trend up">Gold Supplier Tier</div>
        </div>
        <div class="kpi-icon-wrap">🚚</div>
      </div>
    </div>

    <!-- Section 2: Real-time Supply Dispatch & PO Orders Table -->
    <div class="dash-card">
      <div class="dash-card-header">
        <div>
          <h4 class="dash-card-title">Fresh Produce & Sourcing Purchase Orders</h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Live tracking of organic vegetables, premium Wagyu cuts, artisan noodles, and sea bass deliveries</p>
        </div>
        <a href="404.html" class="btn btn-primary btn-sm">Submit New Invoice <span class="btn-arrow">→</span></a>
      </div>
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Supplies & Quantity</th>
              <th>Destination Bay</th>
              <th>Dispatch Schedule</th>
              <th>Batch Status</th>
              <th>Invoice / Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>#PO-8821</strong></td>
              <td>Organic Bok Choy, Scallions & Herbs (40 kg)</td>
              <td>Salem Central Hub - Bay 2</td>
              <td>Today, 5:30 AM</td>
              <td><span class="badge badge-success">Received & Verified</span></td>
              <td><a href="404.html" class="btn btn-sm btn-secondary">Download PO</a></td>
            </tr>
            <tr>
              <td><strong>#PO-8824</strong></td>
              <td>A5 Miyazaki Wagyu Striploin (25 kg)</td>
              <td>Cold Storage Locker #4</td>
              <td>Tomorrow, 6:00 AM</td>
              <td><span class="badge badge-warning">En Route</span></td>
              <td><a href="404.html" class="btn btn-sm btn-secondary">Upload Manifest</a></td>
            </tr>
            <tr>
              <td><strong>#PO-8829</strong></td>
              <td>Artisan Alkaline Ramen Noodles & Broth Base (60 kg)</td>
              <td>Kitchen Prep Hub</td>
              <td>Nov 20, 2026</td>
              <td><span class="badge badge-primary">Processing</span></td>
              <td><a href="404.html" class="btn btn-sm btn-secondary">Generate Bill</a></td>
            </tr>
            <tr>
              <td><strong>#PO-8833</strong></td>
              <td>Wild Chilean Sea Bass & Hamachi Fillets (30 kg)</td>
              <td>Seafood Chiller #1</td>
              <td>Nov 21, 2026</td>
              <td><span class="badge badge-primary">Scheduled</span></td>
              <td><a href="404.html" class="btn btn-sm btn-secondary">View Specs</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Section 3: Weekly Supply Delivery Volume & Reorder Forecast SVG Chart -->
    <div class="dash-card">
      <div class="dash-card-header">
        <div>
          <h4 class="dash-card-title">Weekly Delivery Volume & Kitchen Reorder Forecast</h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Dynamic volume fulfillment vs restock trigger levels across restaurant pantry hubs</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-outline btn-sm active" style="padding: 4px 10px; font-size: 0.8rem;">Weekly Tonnage</button>
          <a href="404.html" class="btn btn-secondary btn-sm">Export Manifest <span class="btn-arrow">→</span></a>
        </div>
      </div>
      <div style="width: 100%; overflow-x: auto;">
        <svg viewBox="0 0 700 220" style="width: 100%; min-width: 500px; height: auto;" aria-label="Vendor Supply Chart">
          <defs>
            <linearGradient id="vendorGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#EA4E18" stop-opacity="0.32"/>
              <stop offset="100%" stop-color="#EA4E18" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <line x1="50" y1="30" x2="680" y2="30" stroke="#EAE6DF" stroke-dasharray="4"/>
          <line x1="50" y1="90" x2="680" y2="90" stroke="#EAE6DF" stroke-dasharray="4"/>
          <line x1="50" y1="150" x2="680" y2="150" stroke="#EAE6DF" stroke-dasharray="4"/>
          <line x1="50" y1="200" x2="680" y2="200" stroke="#DDD7CD"/>

          <path d="M 50,170 Q 150,110 260,130 T 470,60 T 650,45 L 650,200 L 50,200 Z" fill="url(#vendorGrad)" />
          <circle cx="260" cy="130" r="5" fill="#EA4E18" stroke="#FFFFFF" stroke-width="2" />
          <circle cx="470" cy="60" r="5" fill="#EA4E18" stroke="#FFFFFF" stroke-width="2" />
          <circle cx="650" cy="45" r="5" fill="#EA4E18" stroke="#FFFFFF" stroke-width="2" />
          <path d="M 50,170 Q 150,110 260,130 T 470,60 T 650,45" fill="none" stroke="#EA4E18" stroke-width="3" />

          <text x="50" y="215" font-size="11" fill="#888">Monday (680 kg)</text>
          <text x="180" y="215" font-size="11" fill="#888">Wednesday (740 kg)</text>
          <text x="340" y="215" font-size="11" fill="#888">Friday Restock (920 kg)</text>
          <text x="500" y="215" font-size="11" fill="#888">Weekend Rush (1,080 kg)</text>
        </svg>
      </div>
    </div>

    <!-- Section 4: Cold-Chain Storage & Quality Inspection Logs -->
    <div class="dash-card">
      <div class="dash-card-header">
        <h4 class="dash-card-title">Cold-Chain Temperature Compliance & Organic Audit</h4>
        <span class="badge badge-success">HACCP Certified</span>
      </div>
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Storage Bay / Unit</th>
              <th>Monitored Temperature</th>
              <th>Humidity</th>
              <th>Certified Inspector</th>
              <th>Compliance State</th>
              <th>Audit Log</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Cold Storage Locker #4 (Wagyu Beef)</strong></td>
              <td>-1.8°C</td>
              <td>78% RH</td>
              <td>Quality Assurance Lead</td>
              <td><span class="badge badge-success">Optimal (-2°C to 0°C)</span></td>
              <td><a href="404.html" class="btn btn-sm btn-outline">View Cert</a></td>
            </tr>
            <tr>
              <td><strong>Fresh Seafood Chiller #1 (Sea Bass)</strong></td>
              <td>0.4°C</td>
              <td>84% RH</td>
              <td>Chef Qun Lin (Receiving)</td>
              <td><span class="badge badge-success">Optimal (0°C to 2°C)</span></td>
              <td><a href="404.html" class="btn btn-sm btn-outline">View Cert</a></td>
            </tr>
            <tr>
              <td><strong>Organic Farm Produce Walk-in</strong></td>
              <td>3.8°C</td>
              <td>90% RH</td>
              <td>Head Pantry Manager</td>
              <td><span class="badge badge-success">Optimal (3°C to 5°C)</span></td>
              <td><a href="404.html" class="btn btn-sm btn-outline">View Cert</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Section 5: Real-time Supply Chain Activity Timeline -->
    <div class="dash-card">
      <div class="dash-card-header">
        <h4 class="dash-card-title">Supply Chain Logistics & Fulfillment Activity</h4>
        <a href="404.html" class="btn btn-secondary btn-sm">Full Dispatch History <span class="btn-arrow">→</span></a>
      </div>
      <ul class="activity-timeline">
        <li class="timeline-item">
          <div class="timeline-icon">🥬</div>
          <div class="timeline-content">
            <h5>Batch #PO-8821 Organic Herbs Signed by Chef Lin</h5>
            <p>Inspected at Salem Receiving Bay 2 • 42 mins ago</p>
          </div>
        </li>
        <li class="timeline-item">
          <div class="timeline-icon">🧾</div>
          <div class="timeline-content">
            <h5>Invoice #INV-2026-904 Approved for Payment</h5>
            <p>$4,320.00 scheduled for bank transfer on Friday • 2 hours ago</p>
          </div>
        </li>
        <li class="timeline-item">
          <div class="timeline-icon">🥩</div>
          <div class="timeline-content">
            <h5>Cold-Chain Delivery Vehicle #V-12 Cleared Security</h5>
            <p>Temperature logged at -1.5°C upon gate arrival • 4 hours ago</p>
          </div>
        </li>
        <li class="timeline-item">
          <div class="timeline-icon">🌱</div>
          <div class="timeline-content">
            <h5>Weekly Harvest Schedule Finalized with GreenFarm Co.</h5>
            <p>Organic greens and seasonal Asian mushrooms allocated for weekend service • Yesterday</p>
          </div>
        </li>
      </ul>
    </div>

    <!-- Section 6: Quick Vendor Portal Actions -->
    <div class="dash-card">
      <div class="dash-card-header">
        <h4 class="dash-card-title">Quick Vendor Actions & Supplier Services</h4>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
        <a href="404.html" class="btn btn-primary" style="width: 100%;">Upload Delivery Manifest <span class="btn-arrow">→</span></a>
        <a href="404.html" class="btn btn-secondary" style="width: 100%;">Submit Electronic Tax Invoice <span class="btn-arrow">→</span></a>
        <a href="404.html" class="btn btn-dark" style="width: 100%;">Request Delivery Gate Pass <span class="btn-arrow">→</span></a>
        <a href="404.html" class="btn btn-outline" style="width: 100%;">Contact Receiving Bay <span class="btn-arrow">→</span></a>
      </div>
    </div>
  `;
}

