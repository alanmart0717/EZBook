import { useState } from 'react';
import './ProviderDashboard.css';

// ── Static Data ────────────────────────────────────────────────────────────────

// Drives the sidebar and mobile bottom nav. Add a new entry here to add a new section.
const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',    icon: '🏠' },
  { id: 'bookings',  label: 'Bookings',    icon: '📅' },
  { id: 'services',  label: 'My Services', icon: '🛠️' },
  { id: 'profile',   label: 'Profile',     icon: '👤' },
];

// Placeholder stat cards — values will come from the backend once wired up.
const STAT_CARDS = [
  { label: 'Total Bookings',  value: '0',      icon: '📅', note: 'All time' },
  { label: 'Earnings',        value: '$0.00',  icon: '💰', note: 'This month' },
  { label: 'Avg Rating',      value: '—',      icon: '⭐', note: 'From reviews' },
  { label: 'Upcoming Today',  value: '0',      icon: '🕐', note: 'Scheduled' },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

// Renders a single metric tile in the Overview stats grid.
function StatCard({ stat }) {
  return (
    <div className="dash-stat-card">
      <div className="dash-stat-icon">{stat.icon}</div>
      <div className="dash-stat-body">
        <div className="dash-stat-value">{stat.value}</div>
        <div className="dash-stat-label">{stat.label}</div>
        <div className="dash-stat-note">{stat.note}</div>
      </div>
    </div>
  );
}

// ── Add Service Modal ──────────────────────────────────────────────────────────
// Pops up when the provider clicks "+ Add Service" from either the Overview
// quick-actions panel or the My Services section header.
// Calls onUpload with a typed service object, then closes itself.
function AddServiceModal({ onClose, onUpload }) {
  // All four fields start empty; the form is controlled so nothing submits blank.
  const [form, setForm] = useState({
    serviceType: '',
    serviceName: '',
    duration: '',   // stored as string while typing; cast to int on submit
    price: '',      // stored as string while typing; cast to float on submit
  });

  // Curried updater — returns a ready-made onChange handler for any field.
  // e.g. onChange={set('serviceName')} updates only serviceName, leaving others intact.
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // Reads the final form state, casts numeric strings to their proper types,
  // stamps a unique id, and lifts the finished object up to App via onUpload.
  const handleSubmit = (e) => {
    e.preventDefault();
    onUpload({
      id: Date.now(),             // temporary client-side id; replace with DB id when backend is wired
      serviceType: form.serviceType,
      serviceName: form.serviceName,
      duration: parseInt(form.duration, 10),  // minutes as integer
      price: parseFloat(form.price),          // dollars as double
    });
    onClose();
  };

  return (
    // Clicking the dark overlay closes the modal without submitting.
    <div className="modal-overlay" onClick={onClose}>
      {/* stopPropagation prevents a click inside the modal from bubbling to the overlay */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add a Service</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="signup-form" onSubmit={handleSubmit}>
          <label className="form-label">
            Type of Service
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Hair & Beauty"
              value={form.serviceType}
              onChange={set('serviceType')}
              required
            />
          </label>
          <label className="form-label">
            Service Name
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Men's Haircut"
              value={form.serviceName}
              onChange={set('serviceName')}
              required
            />
          </label>
          {/* Duration and price sit side-by-side on wider screens */}
          <div className="form-row">
            <label className="form-label">
              Duration (minutes)
              <input
                className="form-input"
                type="number"
                min="1"
                step="1"          // whole minutes only
                placeholder="e.g. 30"
                value={form.duration}
                onChange={set('duration')}
                required
              />
            </label>
            <label className="form-label">
              Price ($)
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"       // allows cents
                placeholder="e.g. 25.00"
                value={form.price}
                onChange={set('price')}
                required
              />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
            {/* "Upload" publishes the service to the dashboard and homepage */}
            <button type="submit" className="btn-primary">Upload</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Overview Section ───────────────────────────────────────────────────────────
// The default landing section of the dashboard. Shows a welcome banner,
// live stat cards, a recent bookings preview, and quick-action shortcuts.
// onAddService is passed down so the quick-action "Add Service" button can open
// the modal without navigating away from Overview.
function OverviewSection({ provider, onAddService }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="dash-section">
      {/* Welcome banner — uses the first letter of the provider's name as the avatar */}
      <div className="dash-welcome">
        <div className="dash-welcome-avatar">
          {provider?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <h2 className="dash-welcome-title">
            Welcome, {provider?.name ?? 'Provider'}!
          </h2>
          <p className="dash-welcome-sub">
            {provider?.businessName ?? 'Your Business'}
            {provider?.businessType ? ` · ${provider.businessType}` : ''}
          </p>
        </div>
      </div>

      {/* Stat grid — hardcoded zeros for now; swap with real API data later */}
      <div className="dash-stats-grid">
        {STAT_CARDS.map((s) => <StatCard key={s.label} stat={s} />)}
      </div>

      <div className="dash-row">
        {/* Left column: recent bookings (empty state until backend is ready) */}
        <div className="dash-card dash-card--flex1">
          <h3 className="dash-card-title">Recent Bookings</h3>
          <div className="dash-empty">
            <span>📅</span>
            <p>No bookings yet. Share your profile link to start receiving requests.</p>
          </div>
        </div>

        {/* Right column: shortcuts — "Add Service" opens the modal inline */}
        <div className="dash-card dash-card--sidebar">
          <h3 className="dash-card-title">Quick Actions</h3>
          <div className="dash-actions">
            <button className="btn-primary dash-action-btn" onClick={() => setShowModal(true)}>+ Add Service</button>
            <button className="btn-outline dash-action-btn">Share Profile</button>
            <button className="btn-outline dash-action-btn">View Schedule</button>
          </div>
        </div>
      </div>

      {/* Modal is conditionally rendered; unmounts fully when closed so form resets */}
      {showModal && (
        <AddServiceModal onClose={() => setShowModal(false)} onUpload={onAddService} />
      )}
    </div>
  );
}

// ── Bookings Section ───────────────────────────────────────────────────────────
// Lists the provider's bookings filtered by status. Currently shows an empty
// state — replace the empty state with real booking rows once the backend is ready.
function BookingsSection() {
  const [filter, setFilter] = useState('all');
  const filters = ['all', 'upcoming', 'completed', 'cancelled'];

  return (
    <div className="dash-section">
      <h2 className="dash-section-heading">Bookings</h2>

      {/* Filter pills — active pill is highlighted via the .active class */}
      <div className="dash-filter-row">
        {filters.map((f) => (
          <button
            key={f}
            className={`dash-filter-btn${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* TODO: replace with a mapped list of BookingRow components from the API */}
      <div className="dash-card">
        <div className="dash-empty">
          <span>📅</span>
          <p>No {filter === 'all' ? '' : filter + ' '}bookings yet.</p>
        </div>
      </div>
    </div>
  );
}

// ── Services Section ───────────────────────────────────────────────────────────
// Lists all services the provider has uploaded. Each service card shows the
// name, type, duration, and price. "services" and "onAddService" both flow down
// from App so that new uploads are also reflected on the homepage immediately.
function ServicesSection({ services, onAddService }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="dash-section">
      <div className="dash-section-header">
        <h2 className="dash-section-heading">My Services</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Service</button>
      </div>

      {/* Show empty state until at least one service has been uploaded */}
      {services.length === 0 ? (
        <div className="dash-card">
          <div className="dash-empty">
            <span>🛠️</span>
            <p>No services listed yet. Add your first service to start accepting bookings.</p>
          </div>
        </div>
      ) : (
        <div className="service-list">
          {services.map((s) => (
            // Each row uses s.id (set to Date.now() at upload time) as the React key.
            <div key={s.id} className="dash-card service-item">
              <div className="service-item-info">
                <h3 className="service-item-name">{s.serviceName}</h3>
                <p className="service-item-type">{s.serviceType}</p>
              </div>
              <div className="service-item-meta">
                <span className="service-item-duration">⏱ {s.duration} min</span>
                <span className="service-item-price">${Number(s.price).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal unmounts on close so the form always opens blank */}
      {showModal && (
        <AddServiceModal onClose={() => setShowModal(false)} onUpload={onAddService} />
      )}
    </div>
  );
}

// ── Profile Section ────────────────────────────────────────────────────────────
// Lets the provider edit their account details. Pre-populated from the sign-up
// form data passed in via `provider`. Bio is new here — not collected at sign-up.
// TODO: wire handleSave to a PATCH /providers/:id endpoint.
function ProfileSection({ provider }) {
  // Initialize form from the provider object that came in through sign-up.
  // The ?? '' fallbacks ensure inputs are always controlled (never undefined).
  const [form, setForm] = useState({
    name:         provider?.name         ?? '',
    email:        provider?.email        ?? '',
    phone:        provider?.phone        ?? '',
    businessName: provider?.businessName ?? '',
    businessType: provider?.businessType ?? '',
    bio:          '',
  });

  // Same curried updater pattern used in AddServiceModal — one handler for all fields.
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: wire to backend PATCH endpoint — currently just logs the payload.
    console.log('Profile update:', form);
  };

  return (
    <div className="dash-section">
      <h2 className="dash-section-heading">Profile Settings</h2>

      <div className="dash-card">
        <form className="signup-form" onSubmit={handleSave}>
          <div className="form-row">
            <label className="form-label">
              Name
              <input className="form-input" type="text" value={form.name} onChange={set('name')} />
            </label>
            <label className="form-label">
              Business Name
              <input className="form-input" type="text" value={form.businessName} onChange={set('businessName')} />
            </label>
          </div>
          <div className="form-row">
            <label className="form-label">
              Email
              <input className="form-input" type="email" value={form.email} onChange={set('email')} />
            </label>
            <label className="form-label">
              Phone
              <input className="form-input" type="tel" value={form.phone} onChange={set('phone')} />
            </label>
          </div>
          <label className="form-label">
            Bio
            <textarea
              className="form-input"
              rows={4}
              placeholder="Tell customers about yourself and your services..."
              value={form.bio}
              onChange={set('bio')}
              style={{ resize: 'vertical' }}
            />
          </label>
          <button type="submit" className="btn-primary form-submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
}

// ── Provider Dashboard (root export) ──────────────────────────────────────────
// The top-level dashboard shell. Manages which section is active and renders
// the matching section component. Also owns the sidebar, topbar, and mobile nav.
//
// Props:
//   provider     — the sign-up form data (name, email, phone, businessName, businessType)
//   onLogout     — called when the provider clicks "Log Out"; navigates back to home in App
//   services     — array of uploaded service objects, owned by App so the homepage shares them
//   onAddService — lifts a new service up to App's state, updating both the dashboard and homepage
export default function ProviderDashboard({ provider, onLogout, services, onAddService }) {
  const [activeSection, setActiveSection] = useState('overview');

  // Swaps the main content area based on the active nav item.
  const renderSection = () => {
    switch (activeSection) {
      case 'bookings': return <BookingsSection />;
      case 'services': return <ServicesSection services={services} onAddService={onAddService} />;
      case 'profile':  return <ProfileSection provider={provider} />;
      default:         return <OverviewSection provider={provider} onAddService={onAddService} />;
    }
  };

  return (
    <div className="dash-layout">
      {/* ── Sidebar (hidden on mobile, replaced by bottom nav) ── */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar-brand">
          EZ<span className="brand-accent">Book</span>
        </div>

        <nav className="dash-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`dash-nav-item${activeSection === item.id ? ' active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="dash-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button className="dash-logout-btn" onClick={onLogout}>← Log Out</button>
      </aside>

      {/* ── Main content area ── */}
      <div className="dash-main">
        {/* Topbar: shows the active section label and the provider's avatar/name */}
        <header className="dash-topbar">
          <h1 className="dash-topbar-title">
            {NAV_ITEMS.find((n) => n.id === activeSection)?.label ?? 'Dashboard'}
          </h1>
          <div className="dash-topbar-provider">
            <div className="dash-topbar-avatar">
              {provider?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="dash-topbar-name">{provider?.name ?? 'Provider'}</span>
          </div>
        </header>

        <div className="dash-content">{renderSection()}</div>
      </div>

      {/* ── Mobile bottom nav (visible only on small screens via CSS) ── */}
      <nav className="dash-mobile-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`dash-mobile-nav-item${activeSection === item.id ? ' active' : ''}`}
            onClick={() => setActiveSection(item.id)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
