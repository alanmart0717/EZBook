import { useState, useEffect } from 'react';
import './ProviderDashboard.css';

// ── Static Data ────────────────────────────────────────────────────────────────

// Backend API base URL. Backend server runs on port 5000 by default.
const API_BASE_URL = 'https://ezbook-x54y.onrender.com';

// Drives the sidebar and mobile bottom nav. Add a new entry here to add a new section.
const NAV_ITEMS = [
  { id: 'overview',     label: 'Overview',     icon: '🏠' },
  { id: 'bookings',     label: 'Bookings',     icon: '📅' },
  { id: 'history',      label: 'History',      icon: '📜' },
  { id: 'services',     label: 'My Services',  icon: '🛠️' },
  { id: 'availability', label: 'Availability', icon: '🗓️' },
  { id: 'profile',      label: 'Profile',      icon: '👤' },
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
// Calls onUpload with a typed service object after the backend confirms creation,
// then closes itself.
function AddServiceModal({ onClose, onUpload }) {
  // All four fields start empty; the form is controlled so nothing submits blank.
  const [form, setForm] = useState({
    serviceType: '',
    serviceName: '',
    duration: '',
    price: '',
  });

  // Loading and error state for the backend request.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Curried updater — returns a ready-made onChange handler for any field.
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // Reads the final form state, sends the service to the backend, and only updates
  // the dashboard/homepage after the database insert succeeds.
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('You are not logged in');
      }

      // Backend expects: service_name, description, duration_minutes, and price.
      const res = await fetch(`${API_BASE_URL}/api/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          service_name: form.serviceName,
          description: form.serviceType,
          duration_minutes: parseInt(form.duration, 10),
          price: parseFloat(form.price),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create service');
      }

      // Keep the existing frontend service shape so the dashboard and homepage
      // still render without changing the visual components.
      onUpload({
        id: data.data?.service_id || Date.now(),
        serviceId: data.data?.service_id,
        providerProfileId: data.data?.provider_profile_id,
        serviceType: form.serviceType,
        serviceName: form.serviceName,
        duration: parseInt(form.duration, 10),
        price: parseFloat(form.price),
      });

      onClose();

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

          {/* Shows backend/API errors without changing the page layout. */}
          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>

            {/* "Upload" saves the service to the database, then updates the dashboard/homepage. */}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload'}
            </button>
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
function OverviewSection({ provider, onAddService, onViewSchedule }) {
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
            <button className="btn-primary dash-action-btn" onClick={() => setShowModal(true)}>
              + Add Service
            </button>
            <button className="btn-outline dash-action-btn">Share Profile</button>
            <button className="btn-outline dash-action-btn" onClick={onViewSchedule}>
              View Schedule
            </button>
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

const formatTime = (timeValue) => {
  if (!timeValue) return '';

  const cleanTime = timeValue.split('-')[0]; // removes timezone
  const [hour, minute] = cleanTime.split(':');

  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0);

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatDate = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  const today = new Date();

  // Normalize time (remove hours/minutes)
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffDays = (d1 - d2) / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

function BookingsSection() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await fetch(`${API_BASE_URL}/api/appointments/provider/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch bookings');
        }

        setBookings(data.data || []);

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleUpdateStatus = async (appointmentId, action) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE_URL}/api/appointments/${appointmentId}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setBookings((prev) =>
        prev.map((b) =>
          b.appointment_id === appointmentId ? data.data : b
        )
      );

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="dash-section">
      <h2 className="dash-section-heading">Bookings</h2>

      <div className="dash-card">

        {loading ? (
          <p>Loading bookings...</p>
        ) : error ? (
          <p className="form-error">{error}</p>
        ) : bookings.length === 0 ? (
          <div className="dash-empty">
            <span>📅</span>
            <p>No bookings yet.</p>
          </div>
        ) : (
          <div className="service-list">
            {bookings.map((b) => (
              <div key={b.appointment_id} className="dash-card service-item">

                <div className="service-item-info">
                  <h3 className="service-item-name">
                    {b.service_name || "Service"}
                  </h3>
                  <p className="service-item-type">
                    {b.first_name} {b.last_name}
                  </p>
                </div>

                <div className="service-item-meta">
                  <span className="service-item-duration">
                    {formatDate(b.appointment_date)}
                  </span>

                  <span className="service-item-price">
                    {formatTime(b.start_time)} - {formatTime(b.end_time)}
                  </span>

                  {b.status === "pending" && (
                    <div style={{ marginTop: "8px" }}>
                      <button
                        className="btn-primary"
                        onClick={() => handleUpdateStatus(b.appointment_id, "accept")}
                      >
                        Accept
                      </button>

                      <button
                        className="btn-outline"
                        onClick={() => handleUpdateStatus(b.appointment_id, "decline")}
                        style={{ marginLeft: "8px" }}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// History Section

function HistorySection() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await fetch(`${API_BASE_URL}/api/appointments/provider/me/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch booking history');
        }

        setHistory(data.data || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="dash-section">
      <h2 className="dash-section-heading">Booking History</h2>

      <div className="dash-card">
        {loading ? (
          <p>Loading booking history...</p>
        ) : error ? (
          <p className="form-error">{error}</p>
        ) : history.length === 0 ? (
          <div className="dash-empty">
            <span>📜</span>
            <p>No previous or cancelled bookings yet.</p>
          </div>
        ) : (
          <div className="service-list">
            {history.map((b) => (
              <div key={b.appointment_id} className="dash-card service-item">
                <div className="service-item-info">
                  <h3 className="service-item-name">
                    {b.service_name || 'Service'}
                  </h3>

                  <p className="service-item-type">
                    {b.first_name} {b.last_name}
                  </p>
                </div>

                <div className="service-item-meta">
                  <span className="service-item-duration">
                    {formatDate(b.appointment_date)}
                  </span>

                  <span className="service-item-price">
                    {formatTime(b.start_time)} - {formatTime(b.end_time)}
                  </span>

                  <span className="archived-label">
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Services Section ───────────────────────────────────────────────────────────
// Lists all services the provider has uploaded. Each service card shows the
// name, type, duration, and price. "services" and "onAddService" both flow down
// from App so that new uploads are also reflected on the homepage immediately.
function ServicesSection({ 
  services,
  archivedServices = [],
  onAddService, 
  onDeleteService ,
  onArchiveService,
  onUnarchiveService
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="dash-section">
      <div className="dash-section-header">
        <h2 className="dash-section-heading">My Services</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Service
        </button>
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
            // Each row uses the backend service_id when available, otherwise a temporary fallback id.
            <div key={s.id} className="dash-card service-item">
              <div className="service-item-info">
                <h3 className="service-item-name">{s.serviceName}</h3>
                <p className="service-item-type">{s.serviceType}</p>
              </div>
              <div className="service-item-meta">
                <span className="service-item-duration">⏱ {s.duration} min</span>
                <span className="service-item-price">${Number(s.price).toFixed(2)}</span>
                <button
                  className="btn-outline"
                  onClick={() => onDeleteService(s.serviceId || s.id)}
                >
                  Delete
                </button>
                <button
                  className="btn-outline"
                  onClick={() => onArchiveService(s.serviceId || s.id)}
                >
                  Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="dash-section-header" style={{ marginTop: '2rem' }}>
        <h2 className="dash-section-heading">Archived / Old Services</h2>
      </div>

      {archivedServices.length === 0 ? (
        <div className="dash-card">
          <div className="dash-empty">
            <span>📦</span>
            <p>No archived services yet.</p>
          </div>
        </div>
      ) : (
        <div className="service-list">
          {archivedServices.map((s) => (
            <div key={s.serviceId || s.id} className="dash-card service-item archived-service-card">
              <div className="service-item-info">
                <h3 className="service-item-name">{s.serviceName}</h3>
                <p className="service-item-type">{s.serviceType}</p>
              </div>

              <div className="service-item-meta">
                <span className="service-item-duration">⏱ {s.duration} min</span>
                <span className="service-item-price">${Number(s.price).toFixed(2)}</span>
                <span className="archived-label">Archived</span>

                <button
                  className="btn-outline"
                  onClick={() => onUnarchiveService(s.serviceId || s.id)}
                >
                  Restore
                </button>
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

// ── Availability Section ───────────────────────────────────────────────────────
// Lets providers add working hours so customers can book appointments during
// available times. This connects to the provider availability backend routes.
function AvailabilitySection() {
  const [form, setForm] = useState({
    day: '',
    startTime: '',
    endTime: '',
  });

  const [availabilityList, setAvailabilityList] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await fetch(`${API_BASE_URL}/api/provider/availability/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load availability');
        }

        setAvailabilityList(data.data || []);

      } catch (err) {
        console.error(err);
        setMessage(err.message);
      }
    };

    fetchAvailability();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('You are not logged in');
      }

      const res = await fetch(`${API_BASE_URL}/api/provider/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          day: form.day,
          startTime: form.startTime,
          endTime: form.endTime,
          isAvailable: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add availability');
      }

      setAvailabilityList((prev) => [...prev, data.data]);

      setMessage('Availability added successfully!');
      setForm({
        day: '',
        startTime: '',
        endTime: '',
      });

    } catch (err) {
      console.error(err);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dash-section">
      <h2 className="dash-section-heading">Availability</h2>

      <div className="dash-card">
        <form className="signup-form" onSubmit={handleSubmit}>
          <label className="form-label">
            Day
            <select
              className="form-input form-select"
              value={form.day}
              onChange={set('day')}
              required
            >
              <option value="" disabled>Select a day</option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>
          </label>

          <div className="form-row">
            <label className="form-label">
              Start Time
              <input
                className="form-input"
                type="time"
                value={form.startTime}
                onChange={set('startTime')}
                required
              />
            </label>

            <label className="form-label">
              End Time
              <input
                className="form-input"
                type="time"
                value={form.endTime}
                onChange={set('endTime')}
                required
              />
            </label>
          </div>

          {message && (
            <p className="form-error">
              {message}
            </p>
          )}

          <button type="submit" className="btn-primary form-submit" disabled={loading}>
            {loading ? 'Adding Availability...' : 'Add Availability'}
          </button>
        </form>
      </div>

      <div className="dash-card" style={{ marginTop: '1rem' }}>
        <h3 className="dash-card-title">Current Availability</h3>

        {availabilityList.length === 0 ? (
          <div className="dash-empty">
            <span>🗓️</span>
            <p>No availability added yet.</p>
          </div>
        ) : (
          <div className="service-list">
            {availabilityList.map((slot) => (
              <div key={slot.availability_id} className="dash-card service-item">
                <div className="service-item-info">
                  <h3 className="service-item-name">
                    {slot.day.charAt(0).toUpperCase() + slot.day.slice(1)}
                  </h3>
                  <p className="service-item-type">
                    Available
                  </p>
                </div>

                <div className="service-item-meta">
                  <span className="service-item-duration">
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Profile Section ────────────────────────────────────────────────────────────
// Lets the provider edit their account details. Pre-populated from the sign-up
// form data passed in via `provider`. Bio is collected at sign-up now but profile
// editing is still frontend-only until an update profile endpoint is added.
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
    location:     provider?.location     ?? '',
    bio:          provider?.bio          ?? '',
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
            Location
            <input
              className="form-input"
              type="text"
              placeholder="Example: Brooklyn, NY"
              value={form.location}
              onChange={set('location')}
            />
          </label>

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
//   provider     — the sign-up form data and backend profile/token data
//   onLogout     — called when the provider clicks "Log Out"; navigates back to home in App
//   services     — array of uploaded service objects, owned by App so the homepage shares them
//   onAddService — lifts a new service up to App's state, updating both the dashboard and homepage
function ProviderDashboard({ 
  provider, 
  onLogout,
  onHome,
  darkMode,
  onToggleTheme,
  services, 
  archivedServices = [],
  onAddService, 
  onDeleteService,
  onArchiveService,
  onUnarchiveService
}) {
  const [activeSection, setActiveSection] = useState('overview');

  // Swaps the main content area based on the active nav item.
  const renderSection = () => {
    switch (activeSection) {
      case 'bookings': return <BookingsSection />;
      case 'history': return <HistorySection />;
      case 'services':
        return (
          <ServicesSection
            services={services}
            archivedServices={archivedServices}
            onAddService={onAddService}
            onDeleteService={onDeleteService}
            onArchiveService={onArchiveService}
            onUnarchiveService={onUnarchiveService}
          />
        );
      case 'availability': return <AvailabilitySection />;
      case 'profile': return <ProfileSection provider={provider} />;
      default:
        return (
          <OverviewSection
            provider={provider}
            onAddService={onAddService}
            onViewSchedule={() => setActiveSection('availability')}
          />
        );
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
        {/* Topbar: shows the active section label and the provider's avatar/name */}
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
              <div className="toggle-thumb">
                {darkMode ? '🌙' : '☀️'}
              </div>
            </button>

            <div className="dash-topbar-avatar">
              {provider?.name?.[0]?.toUpperCase() ?? '?'}
            </div>

            <span className="dash-topbar-name">
              {provider?.name ?? 'Provider'}
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

export default ProviderDashboard;