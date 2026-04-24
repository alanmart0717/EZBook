import { useState } from 'react';
import './ProviderDashboard.css';

//Backend Information
const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',    icon: '🏠' },
  { id: 'bookings',  label: 'Bookings',    icon: '📅' },
  { id: 'services',  label: 'My Services', icon: '🛠️' },
  { id: 'profile',   label: 'Profile',     icon: '👤' },
];

const STAT_CARDS = [
  { label: 'Total Bookings',  value: '0',      icon: '📅', note: 'All time' },
  { label: 'Earnings',        value: '$0.00',  icon: '💰', note: 'This month' },
  { label: 'Avg Rating',      value: '—',      icon: '⭐', note: 'From reviews' },
  { label: 'Upcoming Today',  value: '0',      icon: '🕐', note: 'Scheduled' },
];

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

function AddServiceModal({ onClose, onUpload }) {
  const [form, setForm] = useState({
    serviceType: '',
    serviceName: '',
    duration: '',
    price: '',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpload({
      id: Date.now(),
      serviceType: form.serviceType,
      serviceName: form.serviceName,
      duration: parseInt(form.duration, 10),
      price: parseFloat(form.price),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
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
          <div className="form-row">
            <label className="form-label">
              Duration (minutes)
              <input
                className="form-input"
                type="number"
                min="1"
                step="1"
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
                step="0.01"
                placeholder="e.g. 25.00"
                value={form.price}
                onChange={set('price')}
                required
              />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Upload</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OverviewSection({ provider, onAddService }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="dash-section">
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

      <div className="dash-stats-grid">
        {STAT_CARDS.map((s) => <StatCard key={s.label} stat={s} />)}
      </div>

      <div className="dash-row">
        <div className="dash-card dash-card--flex1">
          <h3 className="dash-card-title">Recent Bookings</h3>
          <div className="dash-empty">
            <span>📅</span>
            <p>No bookings yet. Share your profile link to start receiving requests.</p>
          </div>
        </div>

        <div className="dash-card dash-card--sidebar">
          <h3 className="dash-card-title">Quick Actions</h3>
          <div className="dash-actions">
            <button className="btn-primary dash-action-btn" onClick={() => setShowModal(true)}>+ Add Service</button>
            <button className="btn-outline dash-action-btn">Share Profile</button>
            <button className="btn-outline dash-action-btn">View Schedule</button>
          </div>
        </div>
      </div>

      {showModal && (
        <AddServiceModal onClose={() => setShowModal(false)} onUpload={onAddService} />
      )}
    </div>
  );
}

function BookingsSection() {
  const [filter, setFilter] = useState('all');
  const filters = ['all', 'upcoming', 'completed', 'cancelled'];

  return (
    <div className="dash-section">
      <h2 className="dash-section-heading">Bookings</h2>

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

      <div className="dash-card">
        <div className="dash-empty">
          <span>📅</span>
          <p>No {filter === 'all' ? '' : filter + ' '}bookings yet.</p>
        </div>
      </div>
    </div>
  );
}

function ServicesSection({ services, onAddService }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="dash-section">
      <div className="dash-section-header">
        <h2 className="dash-section-heading">My Services</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Service</button>
      </div>

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

      {showModal && (
        <AddServiceModal onClose={() => setShowModal(false)} onUpload={onAddService} />
      )}
    </div>
  );
}
//TODO backend
function ProfileSection({ provider }) {
  const [form, setForm] = useState({
    name:         provider?.name         ?? '',
    email:        provider?.email        ?? '',
    phone:        provider?.phone        ?? '',
    businessName: provider?.businessName ?? '',
    businessType: provider?.businessType ?? '',
    bio:          '',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: wire to backend
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

export default function ProviderDashboard({ provider, onLogout, services, onAddService }) {
  const [activeSection, setActiveSection] = useState('overview');

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

      <div className="dash-main">
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
