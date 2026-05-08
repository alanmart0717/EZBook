import { useState, useEffect } from 'react';
import './ProviderDashboard.css';
import './ClientDashboard.css';

const API_BASE_URL = 'https://ezbook-x54y.onrender.com';

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: '🏠' },
  { id: 'appointments', label: 'Appointments', icon: '📅' },
  { id: 'profile',      label: 'Profile',      icon: '👤' },
];

const SERVICE_CATEGORIES = [
  { id: 1, label: 'Hair & Beauty',    icon: '✂️' },
  { id: 2, label: 'Health & Wellness', icon: '🧘' },
  { id: 3, label: 'Home Services',    icon: '🏠' },
  { id: 4, label: 'Fitness',          icon: '🏋️' },
  { id: 5, label: 'Tutoring',         icon: '📚' },
  { id: 6, label: 'Pet Care',         icon: '🐾' },
];

const formatTime = (timeValue) => {
  if (!timeValue) return '';
  const cleanTime = timeValue.split('-')[0];
  const [hour, minute] = cleanTime.split(':');
  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const formatDate = (dateValue) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  const today = new Date();
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = (d1 - d2) / (1000 * 60 * 60 * 24);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// ── Search Bar ─────────────────────────────────────────────────────────────────
function SearchBar({ query, onChange, onSearch }) {
  const handleKey = (e) => { if (e.key === 'Enter') onSearch(); };
  return (
    <div className="search-wrapper cd-search-wrapper">
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search for a service or provider..."
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          aria-label="Search services or providers"
        />
        <button className="btn-primary search-btn" onClick={onSearch}>Search</button>
      </div>
    </div>
  );
}

// ── Category Grid ──────────────────────────────────────────────────────────────
function CategoryGrid({ onCategoryClick }) {
  return (
    <div className="cd-category-section">
      <h3 className="dash-card-title">Browse by Category</h3>
      <div className="category-grid">
        {SERVICE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className="category-card"
            onClick={() => onCategoryClick(cat.label)}
          >
            <span className="category-icon">{cat.icon}</span>
            <span className="category-label">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Provider Card ──────────────────────────────────────────────────────────────
function ProviderCard({ service, onBook }) {
  return (
    <div className="provider-card">
      <div className="provider-avatar">{service.providerName?.[0] ?? '?'}</div>
      <div className="provider-info">
        <h3 className="provider-name">{service.serviceName}</h3>
        <p className="provider-service">{service.serviceType} · {service.providerName}</p>
        <div className="provider-meta">
          <span className="provider-rating">⏱ {service.duration} min</span>
          <span className="provider-location">${Number(service.price).toFixed(2)}</span>
        </div>
      </div>
      <button className="btn-primary provider-btn" onClick={() => onBook(service)}>Book</button>
    </div>
  );
}

// ── Dashboard Section ──────────────────────────────────────────────────────────
// Brings the search-for-providers experience from the homepage into the dashboard.
function DashboardSection({ services, onBook, client }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  const handleSearch = () => setActiveQuery(searchQuery.trim());
  const handleCategoryClick = (label) => {
    setSearchQuery(label);
    setActiveQuery(label);
  };

  const filtered = services.filter((s) => {
    if (!activeQuery) return true;
    const q = activeQuery.toLowerCase();
    return (
      s.serviceName?.toLowerCase().includes(q) ||
      s.serviceType?.toLowerCase().includes(q) ||
      s.providerName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="dash-section">
      <div className="dash-welcome">
        <div className="dash-welcome-avatar">
          {client?.first_name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <h2 className="dash-welcome-title">
            Welcome back, {client?.first_name ?? 'there'}!
          </h2>
          <p className="dash-welcome-sub">Find and book your next appointment.</p>
        </div>
      </div>

      <div className="dash-card">
        <SearchBar query={searchQuery} onChange={setSearchQuery} onSearch={handleSearch} />
        <CategoryGrid onCategoryClick={handleCategoryClick} />
      </div>

      <div className="dash-card">
        <h3 className="dash-card-title">
          {activeQuery ? `Results for "${activeQuery}"` : 'Featured Providers'}
        </h3>
        {filtered.length > 0 ? (
          <div className="provider-list cd-provider-list">
            {filtered.map((s) => (
              <ProviderCard key={s.id} service={s} onBook={onBook} />
            ))}
          </div>
        ) : (
          <div className="dash-empty">
            <span>📅</span>
            <p>
              {activeQuery
                ? 'No providers matched your search. Try a different term or category.'
                : 'Providers coming soon. Check back shortly!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Cancel Confirm Modal ───────────────────────────────────────────────────────
function CancelConfirmModal({ appointment, services, onSuccess, onBack }) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const service = services.find(
    (s) => String(s.serviceId || s.id) === String(appointment.service_id)
  );

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_BASE_URL}/api/appointments/${appointment.appointment_id}/cancel`,
        { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel appointment');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay">
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="cd-cancel-success">
            <span className="cd-cancel-success-icon">✅</span>
            <h3 className="cd-cancel-success-title">Cancellation Successful</h3>
            <p className="cd-cancel-success-sub">Your appointment has been cancelled.</p>
            <button className="btn-primary" onClick={() => onSuccess(appointment.appointment_id)}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onBack}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Cancel Booking</h2>
          <button className="modal-close" onClick={onBack}>✕</button>
        </div>

        <div className="cd-cancel-details">
          <p className="cd-cancel-service">{service?.serviceName || 'Appointment'}</p>
          <p className="cd-cancel-meta"><span>📅</span> {formatDate(appointment.appointment_date)}</p>
          <p className="cd-cancel-meta">
            <span>🕐</span> {formatTime(appointment.start_time)} – {formatTime(appointment.end_time)}
          </p>
        </div>

        <p className="cd-cancel-question">Are you sure you want to cancel this booking?</p>

        {error && <p className="form-error" style={{ marginTop: '12px' }}>{error}</p>}

        <div className="modal-actions">
          <button className="btn-outline" onClick={onBack}>Back</button>
          <button className="btn-primary" onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Cancelling...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Appointments Section ───────────────────────────────────────────────────────
function AppointmentsSection({ services, onBook }) {
  const [tab, setTab] = useState('upcoming');
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [editLoading, setEditLoading] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/appointments/customer/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch appointments');

        const all = data.data || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        setUpcoming(
          all.filter((b) => {
            const apptDate = new Date(b.appointment_date);
            apptDate.setHours(0, 0, 0, 0);
            return (
              (b.status === 'pending' || b.status === 'confirmed') &&
              apptDate >= today
            );
          })
        );

        setPast(
          all.filter((b) => {
            const apptDate = new Date(b.appointment_date);
            apptDate.setHours(0, 0, 0, 0);
            return b.status === 'cancelled' || apptDate < today;
          })
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleCancelSuccess = (appointmentId) => {
    setUpcoming((prev) => prev.filter((b) => b.appointment_id !== appointmentId));
    setCancelTarget(null);
  };

  const handleEditTime = async (appointment) => {
    setEditLoading(appointment.appointment_id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_BASE_URL}/api/appointments/${appointment.appointment_id}/cancel`,
        { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to release appointment');

      setUpcoming((prev) => prev.filter((b) => b.appointment_id !== appointment.appointment_id));

      const service = services.find(
        (s) => String(s.serviceId || s.id) === String(appointment.service_id)
      );

      if (service) {
        onBook(service);
      } else {
        alert('Service is no longer available. Search for it from the Dashboard tab.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setEditLoading(null);
    }
  };

  const renderList = (list, emptyIcon, emptyMsg, showActions = false) => {
    if (loading) {
      return <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading...</p>;
    }
    if (list.length === 0) {
      return (
        <div className="dash-empty">
          <span>{emptyIcon}</span>
          <p>{emptyMsg}</p>
        </div>
      );
    }
    return (
      <div className="service-list">
        {list.map((b) => {
          const service = services.find(
            (s) => String(s.serviceId || s.id) === String(b.service_id)
          );
          return (
            <div key={b.appointment_id} className="dash-card service-item cd-appt-item">
              <div className="service-item-info">
                <h3 className="service-item-name">{service?.serviceName || 'Appointment'}</h3>
                <p className="service-item-type">{service?.providerName || 'Provider'}</p>
              </div>
              <div className="service-item-meta">
                <span className="service-item-duration">{formatDate(b.appointment_date)}</span>
                <span className="service-item-price">
                  {formatTime(b.start_time)} – {formatTime(b.end_time)}
                </span>
                {!showActions && <span className="archived-label">{b.status}</span>}
                {showActions && (
                  <div className="cd-appt-actions">
                    <button
                      className="btn-outline"
                      onClick={() => setCancelTarget(b)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => handleEditTime(b)}
                      disabled={editLoading === b.appointment_id}
                    >
                      {editLoading === b.appointment_id ? 'Releasing...' : 'Edit Time'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="dash-section">
      <h2 className="dash-section-heading">Appointments</h2>

      <div className="dash-filter-row">
        <button
          className={`dash-filter-btn${tab === 'upcoming' ? ' active' : ''}`}
          onClick={() => setTab('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`dash-filter-btn${tab === 'past' ? ' active' : ''}`}
          onClick={() => setTab('past')}
        >
          Past
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="dash-card">
        {tab === 'upcoming'
          ? renderList(
              upcoming,
              '📅',
              'You have no upcoming appointments. Head to Dashboard to book a service!',
              true
            )
          : renderList(past, '📜', 'No past appointments yet.')
        }
      </div>

      {cancelTarget && (
        <CancelConfirmModal
          appointment={cancelTarget}
          services={services}
          onSuccess={handleCancelSuccess}
          onBack={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}

// ── Profile Section ────────────────────────────────────────────────────────────
function ProfileSection({ client }) {
  const [form, setForm] = useState({
    firstName: client?.first_name   ?? '',
    lastName:  client?.last_name    ?? '',
    email:     client?.email        ?? '',
    phone:     client?.phone_number ?? '',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: wire to backend PATCH endpoint
    console.log('Client profile update:', form);
  };

  return (
    <div className="dash-section">
      <h2 className="dash-section-heading">Profile Settings</h2>

      <div className="dash-card">
        <div className="dash-welcome" style={{ marginBottom: '28px' }}>
          <div className="dash-welcome-avatar">
            {client?.first_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <h3 className="dash-welcome-title">
              {client?.first_name ?? ''} {client?.last_name ?? ''}
            </h3>
            <p className="dash-welcome-sub">{client?.email ?? ''}</p>
          </div>
        </div>

        <form className="signup-form" onSubmit={handleSave}>
          <div className="form-row">
            <label className="form-label">
              First Name
              <input
                className="form-input"
                type="text"
                value={form.firstName}
                onChange={set('firstName')}
              />
            </label>
            <label className="form-label">
              Last Name
              <input
                className="form-input"
                type="text"
                value={form.lastName}
                onChange={set('lastName')}
              />
            </label>
          </div>

          <div className="form-row">
            <label className="form-label">
              Email
              <input
                className="form-input"
                type="email"
                value={form.email}
                onChange={set('email')}
              />
            </label>
            <label className="form-label">
              Phone
              <input
                className="form-input"
                type="tel"
                value={form.phone}
                onChange={set('phone')}
              />
            </label>
          </div>

          <button type="submit" className="btn-primary form-submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
}

// ── Client Dashboard (root export) ────────────────────────────────────────────
function ClientDashboard({ client, onLogout, onHome, darkMode, onToggleTheme, services, onBook }) {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderSection = () => {
    switch (activeSection) {
      case 'appointments': return <AppointmentsSection services={services} onBook={onBook} />;
      case 'profile':      return <ProfileSection client={client} />;
      default:             return <DashboardSection services={services} onBook={onBook} client={client} />;
    }
  };

  return (
    <div className="dash-layout">
      {/* ── Sidebar (hidden on mobile, replaced by bottom nav) ── */}
      <aside className="dash-sidebar">
        <button className="dash-sidebar-brand dash-brand-button" onClick={onHome}>
          EZ<span className="brand-accent">Book</span>
        </button>

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
        <header className="dash-topbar">
          <h1 className="dash-topbar-title">
            {NAV_ITEMS.find((n) => n.id === activeSection)?.label ?? 'Dashboard'}
          </h1>

          <div className="dash-topbar-provider">
            <button
              className="theme-toggle"
              onClick={onToggleTheme}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div className="toggle-thumb">{darkMode ? '🌙' : '☀️'}</div>
            </button>

            <div className="dash-topbar-avatar">
              {client?.first_name?.[0]?.toUpperCase() ?? '?'}
            </div>

            <span className="dash-topbar-name">
              {client?.first_name ?? 'Client'} {client?.last_name ?? ''}
            </span>
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

export default ClientDashboard;
