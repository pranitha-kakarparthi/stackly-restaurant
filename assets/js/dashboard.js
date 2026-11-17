/**
 * STACKLY RESTAURANT - SAAS DASHBOARD ENGINE
 * Multi-Role Awareness (Admin, Manager, Customer, Employee, Vendor)
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

  if (role === 'Admin') {
    renderAdminDashboard(dynamicContainer, user);
  } else if (role === 'Manager') {
    renderManagerDashboard(dynamicContainer, user);
  } else if (role === 'Employee') {
    renderEmployeeDashboard(dynamicContainer, user);
  } else if (role === 'Vendor') {
    renderVendorDashboard(dynamicContainer, user);
  } else {
    renderCustomerDashboard(dynamicContainer, user);
  }
}

/* 1. ADMIN DASHBOARD (6-8 Comprehensive Sections) */
function renderAdminDashboard(container, user) {
  container.innerHTML = `
    <!-- Section 1: KPI Stats Overview -->
    <div class="kpi-cards-grid">
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Gross Revenue Today</div>
          <div class="kpi-value">$18,450.00</div>
          <div class="kpi-trend up">▲ 14.2% vs yesterday</div>
        </div>
        <div class="kpi-icon-wrap">💰</div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Total Covers / Guests</div>
          <div class="kpi-value">642</div>
          <div class="kpi-trend up">▲ 8.5% capacity</div>
        </div>
        <div class="kpi-icon-wrap">👥</div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Active Orders in Queue</div>
          <div class="kpi-value">38</div>
          <div class="kpi-trend down">Avg prep 14 mins</div>
        </div>
        <div class="kpi-icon-wrap">🍜</div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-label">System Health & API</div>
          <div class="kpi-value">99.98%</div>
          <div class="kpi-trend up">All POS Terminals Online</div>
        </div>
        <div class="kpi-icon-wrap">⚡</div>
      </div>
    </div>

    <!-- Section 2 & 3: Interactive Revenue Trends & Kitchen Prep Load -->
    <div class="dash-section-grid">
      <div class="dash-card">
        <div class="dash-card-header">
          <h4 class="dash-card-title">Real-Time Revenue Analytics (Hourly)</h4>
          <a href="404.html" class="btn btn-secondary btn-sm">Export Financials <span class="btn-arrow">→</span></a>
        </div>
        <div style="padding: 10px 0;">
          <svg viewBox="0 0 700 240" style="width: 100%; height: auto; overflow: visible;">
            <defs>
              <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#EA4E18" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="#EA4E18" stop-opacity="0.0"/>
              </linearGradient>
            </defs>
            <line x1="40" y1="200" x2="680" y2="200" stroke="#E8DED1" stroke-width="1.5" />
            <line x1="40" y1="140" x2="680" y2="140" stroke="#F0E8DC" stroke-dasharray="4" />
            <line x1="40" y1="80" x2="680" y2="80" stroke="#F0E8DC" stroke-dasharray="4" />
            <path d="M 50,180 Q 150,120 250,150 T 450,70 T 650,40" fill="none" stroke="#EA4E18" stroke-width="3.5" />
            <path d="M 50,180 Q 150,120 250,150 T 450,70 T 650,40 L 650,200 L 50,200 Z" fill="url(#adminGrad)" />
            <circle cx="250" cy="150" r="5" fill="#EA4E18" stroke="#FFFFFF" stroke-width="2" />
            <circle cx="450" cy="70" r="5" fill="#EA4E18" stroke="#FFFFFF" stroke-width="2" />
            <circle cx="650" cy="40" r="5" fill="#EA4E18" stroke="#FFFFFF" stroke-width="2" />
            <text x="50" y="222" fill="#7A6D79" font-size="12">11 AM</text>
            <text x="250" y="222" fill="#7A6D79" font-size="12">2 PM</text>
            <text x="450" y="222" fill="#7A6D79" font-size="12">6 PM</text>
            <text x="650" y="222" fill="#7A6D79" font-size="12">9 PM</text>
            <text x="10" y="85" fill="#7A6D79" font-size="11">$15k</text>
            <text x="10" y="145" fill="#7A6D79" font-size="11">$8k</text>
            <text x="10" y="205" fill="#7A6D79" font-size="11">$0</text>
          </svg>
        </div>
      </div>

      <div class="dash-card">
        <div class="dash-card-header">
          <h4 class="dash-card-title">Order Category Mix</h4>
          <span class="badge badge-primary">Live</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 10px;">
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 700; margin-bottom: 4px;">
              <span>Chef Tasting & Entrees</span>
              <span>48%</span>
            </div>
            <div style="height: 8px; background: #EEE; border-radius: 4px; overflow: hidden;">
              <div style="width: 48%; height: 100%; background: #EA4E18;"></div>
            </div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 700; margin-bottom: 4px;">
              <span>Ramen & Artisanal Bowls</span>
              <span>28%</span>
            </div>
            <div style="height: 8px; background: #EEE; border-radius: 4px; overflow: hidden;">
              <div style="width: 28%; height: 100%; background: #E58A13;"></div>
            </div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 700; margin-bottom: 4px;">
              <span>Dim Sum & Starters</span>
              <span>16%</span>
            </div>
            <div style="height: 8px; background: #EEE; border-radius: 4px; overflow: hidden;">
              <div style="width: 16%; height: 100%; background: #2E7D32;"></div>
            </div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 700; margin-bottom: 4px;">
              <span>Signature Teas & Sake</span>
              <span>8%</span>
            </div>
            <div style="height: 8px; background: #EEE; border-radius: 4px; overflow: hidden;">
              <div style="width: 8%; height: 100%; background: #241323;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 4: Franchise & Station Overview Table -->
    <div class="dash-card" style="margin-bottom: 28px;">
      <div class="dash-card-header">
        <h4 class="dash-card-title">Live Kitchen & Dining Operations (Salem & New York Hubs)</h4>
        <a href="404.html" class="btn btn-secondary btn-sm">Manage Stations <span class="btn-arrow">→</span></a>
      </div>
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Branch / Location</th>
              <th>Head Chef on Duty</th>
              <th>Tables Occupied</th>
              <th>Active Tickets</th>
              <th>Avg Ticket Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Salem Flagship (MMR Complex)</strong></td>
              <td>Chef Qun Lin</td>
              <td>28 / 32</td>
              <td>19 Orders</td>
              <td>12 mins</td>
              <td><span class="badge badge-success">Optimal</span></td>
              <td><a href="404.html" class="btn btn-sm btn-outline">Inspect</a></td>
            </tr>
            <tr>
              <td><strong>New York Ramen Hub (Brooklyn)</strong></td>
              <td>Chef Kenji Sato</td>
              <td>22 / 24</td>
              <td>14 Orders</td>
              <td>15 mins</td>
              <td><span class="badge badge-success">Optimal</span></td>
              <td><a href="404.html" class="btn btn-sm btn-outline">Inspect</a></td>
            </tr>
            <tr>
              <td><strong>Executive Banquet Lounge</strong></td>
              <td>Chef Mei Chen</td>
              <td>Private Event</td>
              <td>5 Courses</td>
              <td>On Schedule</td>
              <td><span class="badge badge-primary">VIP Tasting</span></td>
              <td><a href="404.html" class="btn btn-sm btn-outline">Inspect</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Section 5: Staff Permissions & System Audit Log -->
    <div class="dash-section-grid">
      <div class="dash-card">
        <div class="dash-card-header">
          <h4 class="dash-card-title">System Audit & POS Events</h4>
          <a href="404.html" class="btn btn-secondary btn-sm">View Full Log <span class="btn-arrow">→</span></a>
        </div>
        <div class="timeline-list">
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h6>Automated Inventory Reconciliation Completed</h6>
              <p>Wagyu beef & organic sea bass stock matched vendor bills • 12 mins ago</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h6>POS Terminal #3 Session Settled</h6>
              <p>Shift checkout verified by Floor Manager • 42 mins ago</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h6>VIP Tasting Reservation Confirmed for 8 Guests</h6>
              <p>Chef tasting menu prepped for 8:00 PM • 1 hr ago</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 6: Admin Quick Security Controls -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h4 class="dash-card-title">Quick System Actions</h4>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <a href="404.html" class="btn btn-primary" style="width: 100%;">Create New Staff Account <span class="btn-arrow">→</span></a>
          <a href="404.html" class="btn btn-secondary" style="width: 100%;">Generate Daily Financial Audit <span class="btn-arrow">→</span></a>
          <a href="404.html" class="btn btn-dark" style="width: 100%;">Flush CDN & Cache <span class="btn-arrow">→</span></a>
          <a href="404.html" class="btn btn-outline" style="width: 100%;">Backup Database State <span class="btn-arrow">→</span></a>
        </div>
      </div>
    </div>
  `;
}

/* 2. MANAGER DASHBOARD */
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

/* 3. CUSTOMER DASHBOARD */
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

/* 4. EMPLOYEE DASHBOARD */
function renderEmployeeDashboard(container, user) {
  container.innerHTML = `
    <div class="kpi-cards-grid">
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Current Shift Station</div>
          <div class="kpi-value">Wok & Sauté Station #2</div>
          <div class="kpi-trend up">Shift: 4:00 PM – 11:30 PM</div>
        </div>
        <div class="kpi-icon-wrap">🔥</div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Tickets Completed Today</div>
          <div class="kpi-value">68 Dishes</div>
          <div class="kpi-trend up">Zero remakes / 100% accuracy</div>
        </div>
        <div class="kpi-icon-wrap">📋</div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Shift Tip Share Pool</div>
          <div class="kpi-value">$142.50</div>
          <div class="kpi-trend up">Credited at shift close</div>
        </div>
        <div class="kpi-icon-wrap">💵</div>
      </div>
    </div>
    <div class="dash-card">
      <div class="dash-card-header">
        <h4 class="dash-card-title">Live Kitchen Station Tickets</h4>
        <span class="badge badge-primary">Wok & Grill</span>
      </div>
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr><th>Ticket ID</th><th>Items</th><th>Table</th><th>Time Elapsed</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            <tr><td>#TK-301</td><td>2x Crispy Corn Chicken</td><td>T-04</td><td>6 mins</td><td><span class="badge badge-warning">Cooking</span></td><td><a href="404.html" class="btn btn-sm btn-primary">Mark Ready</a></td></tr>
            <tr><td>#TK-304</td><td>1x Dan Dan Noodles (Extra Spicy)</td><td>T-12</td><td>3 mins</td><td><span class="badge badge-primary">In Queue</span></td><td><a href="404.html" class="btn btn-sm btn-secondary">Start Prep</a></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* 5. VENDOR DASHBOARD */
function renderVendorDashboard(container, user) {
  container.innerHTML = `
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
          <div class="kpi-label">Approved Invoices</div>
          <div class="kpi-value">$14,800.00</div>
          <div class="kpi-trend up">Payment processing scheduled</div>
        </div>
        <div class="kpi-icon-wrap">🧾</div>
      </div>
    </div>
    <div class="dash-card">
      <div class="dash-card-header">
        <h4 class="dash-card-title">Fresh Produce & Sourcing Orders</h4>
        <a href="404.html" class="btn btn-primary btn-sm">Submit Invoice <span class="btn-arrow">→</span></a>
      </div>
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr><th>PO Number</th><th>Supplies</th><th>Destination</th><th>Dispatch Date</th><th>Status</th><th>Invoice</th></tr>
          </thead>
          <tbody>
            <tr><td>#PO-8821</td><td>Organic Greens & Herbs (40 kg)</td><td>Salem Hub</td><td>Nov 17, 2026</td><td><span class="badge badge-success">Dispatched</span></td><td><a href="404.html" class="btn btn-sm btn-secondary">Download</a></td></tr>
            <tr><td>#PO-8829</td><td>Artisan Ramen Noodles & Broth Base</td><td>Brooklyn Hub</td><td>Nov 18, 2026</td><td><span class="badge badge-warning">Processing</span></td><td><a href="404.html" class="btn btn-sm btn-secondary">Upload Bill</a></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}
