import { useState } from 'react';
import './ProviderDashboard.css';

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

function OverviewSection({ provider }) {
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
            <button className="btn-primary dash-action-btn">+ Add Service</button>
            <button className="btn-outline dash-action-btn">Share Profile</button>
            <button className="btn-outline dash-action-btn">View Schedule</button>
          </div>
        </div>
      </div>
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

function ServicesSection() {
  return (
    <div className="dash-section">
      <div className="dash-section-header">
        <h2 className="dash-section-heading">My Services</h2>
        <button className="btn-primary">+ Add Service</button>
      </div>

      <div className="dash-card">
        <div className="dash-empty">
          <span>🛠️</span>
          <p>No services listed yet. Add your first service to start accepting bookings.</p>
        </div>
      </div>
    </div>
  );
}

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

export default function ProviderDashboard({ provider, onLogout }) {
  const [activeSection, setActiveSection] = useState('overview');

  const renderSection = () => {
    switch (activeSection) {
      case 'bookings': return <BookingsSection />;
      case 'services': return <ServicesSection />;
      case 'profile':  return <ProfileSection provider={provider} />;
      default:         return <OverviewSection provider={provider} />;
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
