/**
 * Main App Component - EZBook Service Booking Platform
 * 
 * This is the primary entry point for the EZBook application.
 * It manages:
 * - User authentication flow (customer vs. provider signup)
 * - Provider login flow
 * - Service browsing and search functionality
 * - Dark mode toggle
 * - Provider dashboard access
 * - Booking flow
 * - Navigation between different app views
 */

import { useState, useEffect, useMemo } from 'react';
import './App.css';
import ProviderDashboard from './ProviderDashboard';
import ClientDashboard from './ClientDashboard';

/**
 * Backend API base URL
 * Backend server runs on port 5000 by default
 */
const API_BASE_URL = 'http://localhost:5000';

/**
 * Timeout helper
 */
const fetchWithTimeout = (url, options = {}, timeout = 10000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeout)
    ),
  ]);
};

/**
 * Service categories displayed in the browsing interface
 */
const SERVICE_CATEGORIES = [
  { id: 1, label: 'Hair & Beauty', icon: '✂️' },
  { id: 2, label: 'Health & Wellness', icon: '🧘' },
  { id: 3, label: 'Home Services', icon: '🏠' },
  { id: 4, label: 'Fitness', icon: '🏋️' },
  { id: 5, label: 'Tutoring', icon: '📚' },
  { id: 6, label: 'Pet Care', icon: '🐾' },
];

/**
 * Navbar Component - Top navigation bar
 */
function Navbar({ darkMode, onToggle, onSignUp, onLogin, onHome, currentUser, onLogout, onDashboard }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <span className="brand" onClick={onHome} style={{ cursor: 'pointer' }}>
          EZ<span className="brand-accent">Book</span>
        </span>

        <div className="nav-links">
          {currentUser ? (
            <>
              <span className="nav-user-name">
                {currentUser.first_name} {currentUser.last_name}
              </span>

              {currentUser.role === 'provider' && (
                <button className="btn-outline" onClick={onDashboard}>
                  Dashboard
                </button>
              )}

              <button className="btn-primary" onClick={onLogout}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <button className="btn-outline" onClick={onLogin}>Log In</button>
              <button className="btn-primary" onClick={onSignUp}>Sign Up</button>
            </>
          )}

          <button
            className="theme-toggle"
            onClick={onToggle}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className="toggle-thumb">
              {darkMode ? '🌙' : '☀️'}
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}
/**
 * LoginForm Component - Existing user login form
 */
function LoginForm({ onBack, onSuccess }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        throw new Error(loginData.error || 'Login failed');
      }

      const token = loginData.data.token;
      const user = loginData.data.user;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'provider') {
        const profileRes = await fetch(`${API_BASE_URL}/api/provider/profile/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const profileData = await profileRes.json();

        if (!profileRes.ok) {
          throw new Error(profileData.error || 'Could not load provider profile');
        }

        const profile = profileData.data;

        onSuccess({
          name: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim(),
          email: user.email,
          phone: profile?.phone_number ?? '',
          businessName: profile?.business_name ?? profile?.businessName ?? '',
          businessType: profile?.service_category ?? profile?.serviceCategory ?? '',
          location: profile?.location ?? '',
          bio: profile?.bio ?? '',
          token,
          user,
          profile,
        });

        return;
      }

      onSuccess({
        name: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim(),
        email: user.email,
        token,
        user,
      });

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container signup-container--form">
        <button className="back-btn" onClick={onBack}>← Back</button>

        <h1 className="signup-title">Log In</h1>
        <p className="signup-subtitle">Welcome back to EZBook.</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <label className="form-label">
            Email
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              required
            />
          </label>

          <label className="form-label">
            Password
            <input
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={set('password')}
              required
            />
          </label>

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary form-submit" disabled={loading}>
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * SignUpChoice Component - Choice between Customer and Provider signup
 */
function SignUpChoice({ onSelectProvider, onSelectCustomer, onBack }) {
  return (
    <div className="signup-page">
      <div className="signup-container">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 className="signup-title">Join EZBook</h1>
        <p className="signup-subtitle">How would you like to sign up?</p>

        <div className="signup-choice-grid">
          <button className="choice-card" onClick={onSelectCustomer}>
            <span className="choice-icon">👤</span>
            <h2 className="choice-title">Customer</h2>
            <p className="choice-desc">Book services from trusted local providers.</p>
          </button>

          <button className="choice-card" onClick={onSelectProvider}>
            <span className="choice-icon">🏢</span>
            <h2 className="choice-title">Provider</h2>
            <p className="choice-desc">List your services and grow your business.</p>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * CustomerSignUpForm Component - Customer registration form
 */
function CustomerSignUpForm({ onBack, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const getNameParts = (fullName) => {
    const parts = fullName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    return { firstName, lastName };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const { firstName, lastName } = getNameParts(form.name);

      const registerRes = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email: form.email,
          password: form.password,
          phoneNumber: form.phone,
          role: 'customer',
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        throw new Error(registerData.error || 'Customer registration failed');
      }

      const token = registerData.data.token;
      const user = registerData.data.user;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      onSuccess({
        name: form.name,
        email: form.email,
        phone: form.phone,
        token,
        user,
      });

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container signup-container--form">
        <button className="back-btn" onClick={onBack}>← Back</button>

        <h1 className="signup-title">Customer Sign Up</h1>
        <p className="signup-subtitle">Create an account to book local services.</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <label className="form-label">
            Name
            <input
              className="form-input"
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={set('name')}
              required
            />
          </label>

          <div className="form-row">
            <label className="form-label">
              Email
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                required
              />
            </label>

            <label className="form-label">
              Phone Number
              <input
                className="form-input"
                type="tel"
                placeholder="(555) 000-0000"
                value={form.phone}
                onChange={set('phone')}
                required
              />
            </label>
          </div>

          <label className="form-label">
            Password
            <input
              className="form-input"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={set('password')}
              required
            />
          </label>

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary form-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Customer Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * ProviderSignUpForm Component - Provider registration form
 */
function ProviderSignUpForm({ onBack, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
    businessType: '',
    location: '',
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const getNameParts = (fullName) => {
    const parts = fullName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    return { firstName, lastName };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const { firstName, lastName } = getNameParts(form.name);

      const registerRes = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email: form.email,
          password: form.password,
          phoneNumber: form.phone,
          role: 'provider',
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        throw new Error(registerData.error || 'Provider registration failed');
      }

      const token = registerData.data.token;
      const user = registerData.data.user;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      const profileRes = await fetch(`${API_BASE_URL}/api/provider/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessName: form.businessName,
          bio: form.bio || 'New provider on EZBook',
          serviceCategory: form.businessType,
          location: form.location,
        }),
      });

      const profileData = await profileRes.json();

      if (!profileRes.ok) {
        throw new Error(profileData.error || 'Provider profile creation failed');
      }

      onSuccess({
        name: form.name,
        email: form.email,
        phone: form.phone,
        businessName: form.businessName,
        businessType: form.businessType,
        location: form.location,
        bio: form.bio,
        token,
        user,
        profile: profileData.data,
      });

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container signup-container--form">
        <button className="back-btn" onClick={onBack}>← Back</button>

        <h1 className="signup-title">Provider Sign Up</h1>
        <p className="signup-subtitle">Tell us about yourself and your business.</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <label className="form-label">
            Name of Provider
            <input
              className="form-input"
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={set('name')}
              required
            />
          </label>

          <div className="form-row">
            <label className="form-label">
              Email
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                required
              />
            </label>

            <label className="form-label">
              Phone Number
              <input
                className="form-input"
                type="tel"
                placeholder="(555) 000-0000"
                value={form.phone}
                onChange={set('phone')}
                required
              />
            </label>
          </div>

          <label className="form-label">
            Password
            <input
              className="form-input"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={set('password')}
              required
            />
          </label>

          <label className="form-label">
            Business Name
            <input
              className="form-input"
              type="text"
              placeholder="Your business name"
              value={form.businessName}
              onChange={set('businessName')}
              required
            />
          </label>

          <label className="form-label">
            Type of Business
            <select
              className="form-input form-select"
              value={form.businessType}
              onChange={set('businessType')}
              required
            >
              <option value="" disabled>Select a category</option>
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.label}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Location
            <input
              className="form-input"
              type="text"
              placeholder="Example: Brooklyn, NY"
              value={form.location}
              onChange={set('location')}
              required
            />
          </label>

          <label className="form-label">
            Bio
            <textarea
              className="form-input"
              placeholder="Tell customers about your business"
              value={form.bio}
              onChange={set('bio')}
              rows="3"
            />
          </label>

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary form-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Provider Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

const toStandardTime = (t) => {
  if (!t) return '';
  const [hour, minute] = t.split(':');
  const d = new Date();
  d.setHours(Number(hour), Number(minute), 0);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};



function NoticeModal({ title, message, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
          {message}
        </p>

        <div className="modal-actions">
          <button className="btn-primary" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * BookingModal Component - Customer booking form
 *
 * Loads provider availability, allows the customer to choose an available day
 * and time, then creates an appointment through the backend.
 */
function BookingModal({ service, onClose }) {
  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  todayDate.setHours(0, 0, 0, 0);

  const [step, setStep] = useState('calendar');
  const [currentMonth, setCurrentMonth] = useState({
    year: todayDate.getFullYear(),
    month: todayDate.getMonth(),
  });
  const [availableDates, setAvailableDates] = useState(new Set());
  const [datesLoading, setDatesLoading] = useState(false);

  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const providerId = service?.providerProfileId;
  const serviceId = service?.serviceId;

  useEffect(() => {
    if (!providerId || !serviceId) return;
    const fetchMonthAvailability = async () => {
      setDatesLoading(true);
      const { year, month } = currentMonth;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const dateStrings = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        date.setHours(0, 0, 0, 0);
        if (date >= todayDate) {
          dateStrings.push(
            `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          );
        }
      }

      try {
        const results = await Promise.all(
          dateStrings.map(async (dateStr) => {
            try {
              const url = `${API_BASE_URL}/api/appointments/available-times?providerProfileId=${providerId}&serviceId=${serviceId}&appointmentDate=${dateStr}`;
              const res = await fetch(url);
              const data = await res.json();
              return res.ok && data.data?.length > 0 ? dateStr : null;
            } catch {
              return null;
            }
          })
        );
        setAvailableDates(new Set(results.filter(Boolean)));
      } catch (err) {
        console.error(err);
      } finally {
        setDatesLoading(false);
      }
    };

    fetchMonthAvailability();
  }, [currentMonth, providerId, serviceId, todayDate]);

  const fetchAvailableTimes = async (date) => {
    try {
      setLoading(true);
      setError('');

      const url = `${API_BASE_URL}/api/appointments/available-times?providerProfileId=${service.providerProfileId}&serviceId=${service.serviceId}&appointmentDate=${date}`;

      console.log("AVAILABLE TIMES URL:", url);

      const res = await fetch(url);
      const text = await res.text();
      console.log("RAW RESPONSE:", text);

      const data = JSON.parse(text);

      if (!res.ok) {
        throw new Error(data.error || "Failed to load available times");
      }

      setAvailableTimes(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setAvailableTimes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    setBookingLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('You must log in before booking');
      }

      if (!selectedDate || !selectedTime) {
        throw new Error('Please select a date and time');
      }

      const res = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider_profile_id: service.providerProfileId,
          service_id: service.serviceId,
          appointment_date: selectedDate,
          start_time: selectedTime,
          notes: 'Booked from EZBook frontend',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      if (service.rescheduleAppointmentId) {
      await fetch(`${API_BASE_URL}/api/appointments/${service.rescheduleAppointmentId}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

      setNoticeModal({
        title: service.rescheduleAppointmentId ? "Appointment Rescheduled" : "Booking Created",
        message: service.rescheduleAppointmentId
          ? "Your appointment was rescheduled successfully."
          : "Your booking was created successfully.",
      });
      onClose();

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const { year, month } = currentMonth;
  const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const DAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const handlePrevMonth = () =>
    setCurrentMonth(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );

  const handleNextMonth = () =>
    setCurrentMonth(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );

  const handleDateClick = (day) => {
    if (!day) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    if (date < todayDate || !availableDates.has(dateStr)) return;
    setSelectedDate(dateStr);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--cal" onClick={(e) => e.stopPropagation()}>

        {step === 'calendar' && (
          <>
            <div className="modal-header">
              <h2 className="modal-title">Book {service.serviceName}</h2>
              <button className="modal-close" onClick={onClose}>✕</button>
            </div>

            <p className="signup-subtitle">
              {service.serviceType} · ${Number(service.price).toFixed(2)} · {service.duration} min
            </p>

            <div className="cal-nav">
              <button className="cal-nav-btn" onClick={handlePrevMonth}>‹</button>
              <span className="cal-month-label">{monthName} {year}</span>
              <button className="cal-nav-btn" onClick={handleNextMonth}>›</button>
            </div>

            {datesLoading ? (
              <p className="cal-loading">Loading availability…</p>
            ) : (
              <div className="cal-grid">
                {DAY_INITIALS.map((d, i) => (
                  <div key={i} className="cal-day-initial">{d}</div>
                ))}
                {cells.map((day, i) => {
                  if (!day) return <div key={i} className="cal-cell cal-cell--empty" />;

                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const date = new Date(year, month, day);
                  date.setHours(0, 0, 0, 0);
                  const isPast = date < todayDate;
                  const isToday = date.getTime() === todayDate.getTime();
                  const isAvail = availableDates.has(dateStr);
                  const isSel = selectedDate === dateStr;

                  let cls = 'cal-cell';
                  if (isPast) cls += ' cal-cell--past';
                  else if (isSel) cls += ' cal-cell--selected';
                  else if (isAvail) cls += ' cal-cell--available';

                  return (
                    <div key={i} className={cls} onClick={() => handleDateClick(day)}>
                      {day}
                      {isToday && <span className="cal-today-dot" />}
                    </div>
                  );
                })}
              </div>
            )}

            {error && <p className="form-error">{error}</p>}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-outline"
                onClick={onClose}
              >
                {service.rescheduleAppointmentId ? "Cancel Reschedule" : "Cancel"}
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={!selectedDate}
                onClick={async () => {
                  await fetchAvailableTimes(selectedDate);
                  setStep('time');
                }}
              >
                Confirm Date
              </button>
            </div>
          </>
        )}

        {step === 'time' && (
          <>
            <div className="modal-header">
              <h2 className="modal-title">Select a Time</h2>
              <button className="modal-close" onClick={onClose}>✕</button>
            </div>

            <p className="signup-subtitle">
              {service.serviceName} · {selectedDate} · {service.duration} min
            </p>

            {loading ? (
              <p className="cal-loading">Loading times…</p>
            ) : availableTimes.length === 0 ? (
              <p className="form-error">No availability for this date.</p>
            ) : (
              <div className="time-slot-grid">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    className={`time-slot${selectedTime === time ? ' time-slot--selected' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {toStandardTime(time)}
                  </button>
                ))}
              </div>
            )}

            {error && <p className="form-error">{error}</p>}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-outline"
                onClick={() => { setStep('calendar'); setSelectedTime(''); }}
              >
                ← Back
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={!selectedTime || bookingLoading}
                onClick={handleBook}
              >
                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

/**
 * ProviderCard Component - Individual service provider listing
 */
function ProviderCard({ service, onBook }) {
  return (
    <div className="provider-card">
      <div className="provider-avatar">{service.providerName?.[0] ?? '?'}</div>

      <div className="provider-info">
        <h3 className="provider-name">{service.serviceName}</h3>
        <p className="provider-service">
          {service.serviceType} · {service.providerName}
        </p>

        <div className="provider-meta">
          <span className="provider-rating">⏱ {service.duration} min</span>
          <span className="provider-location">
            ${Number(service.price).toFixed(2)}
          </span>
        </div>
      </div>

      <button
        className="btn-primary provider-btn"
        onClick={() => onBook(service)}
      >
        Book
      </button>
    </div>
  );
}

/**
 * ProvidersSection Component - Featured or filtered provider listings
 */
function ProvidersSection({ services, searchQuery, onBook }) {
  const filtered = services.filter((s) => {
    if (!searchQuery) return true;

    const q = searchQuery.toLowerCase();

    return (
      s.serviceName?.toLowerCase().includes(q) ||
      s.serviceType?.toLowerCase().includes(q) ||
      s.providerName?.toLowerCase().includes(q)
    );
  });

  return (
    <section className="section section-alt" id="providers">
      <h2 className="section-title">
        {searchQuery ? `Results for "${searchQuery}"` : 'Featured Providers'}
      </h2>

      {filtered.length > 0 ? (
        <div className="provider-list">
          {filtered.map((s) => (
            <ProviderCard key={s.id} service={s} onBook={onBook} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">📅</span>
          <h3>Providers coming soon</h3>
          <p>
            We're onboarding local service providers. Check back shortly or{' '}
            <a href="#signup" className="link">sign up</a> to be notified.
          </p>
        </div>
      )}
    </section>
  );
}

/**
 * HowItWorks Component - Process explanation section
 */
function HowItWorks() {
  const steps = [
    { step: '1', title: 'Search', desc: 'Find services or providers near you.' },
    { step: '2', title: 'Book', desc: 'Pick a time that works for your schedule.' },
    { step: '3', title: 'Done', desc: 'Show up and enjoy your appointment.' },
  ];

  return (
    <section className="section">
      <h2 className="section-title">How It Works</h2>

      <div className="steps-grid">
        {steps.map((s) => (
          <div key={s.step} className="step-card">
            <div className="step-number">{s.step}</div>
            <h3 className="step-title">{s.title}</h3>
            <p className="step-desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * JoinSection Component - CTA for new client and provider sign-ups
 */
function JoinSection({ onSignUpClient, onSignUpProvider }) {
  return (
    <section className="section join-section">
      <h2 className="section-title">Are you a provider or ready to support your local businesses?</h2>
      <p className="join-subtitle">Join EZBook today and start connecting.</p>

      <div className="join-cards">
        <div className="join-card">
          <span className="join-card-icon">🧑‍💼</span>
          <h3 className="join-card-title">I'm a Provider</h3>
          <p className="join-card-desc">List your services and start accepting bookings from local customers.</p>
          <button className="btn-primary join-card-btn" onClick={onSignUpProvider}>
            Sign Up as Provider
          </button>
        </div>

        <div className="join-card">
          <span className="join-card-icon">📅</span>
          <h3 className="join-card-title">I'm a Client</h3>
          <p className="join-card-desc">Discover and book trusted local service providers near you.</p>
          <button className="btn-outline join-card-btn" onClick={onSignUpClient}>
            Sign Up as Client
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * Footer Component - Page footer with branding and copyright
 */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="brand">EZ<span className="brand-accent">Book</span></span>
        <p className="footer-copy">
          © {new Date().getFullYear()} EZBook. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/**
 * App Component - Main application controller
 */
export default function App() {
  /**
   * State Management
   */
  const [darkMode, setDarkMode] = useState(false);
  const [page, setPage] = useState('home');
  const [providerData, setProviderData] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [archivedServices, setArchivedServices] = useState([]);
  const [sessionChecked, setSessionChecked] = useState(false);
  /**
 * Restore logged-in user after page refresh
 */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedPage = localStorage.getItem('page');
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (!token || !savedUser) {
          setPage(savedPage || 'home');
          return;
        }

        const user = JSON.parse(savedUser);
        setCurrentUser(user);

        if (user.role === 'provider') {
          const profileRes = await fetchWithTimeout(`${API_BASE_URL}/api/provider/profile/me`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const profileData = await profileRes.json();

          if (!profileRes.ok) {
            throw new Error(profileData.error || 'Could not restore provider session');
          }

          const profile = profileData.data;

          setProviderData({
            name: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim(),
            email: user.email,
            phone: user.phone_number ?? '',
            businessName: profile?.business_name ?? '',
            businessType: profile?.service_category ?? '',
            location: profile?.location ?? '',
            bio: profile?.bio ?? '',
            token,
            user,
            profile,
          });
        }

        setPage(savedPage || 'home');

      } catch (err) {
        console.error('Session restore failed:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('page');
        setPage('home');
      } finally {
        setSessionChecked(true);
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    if (sessionChecked) {
      localStorage.setItem('page', page);
    }
  }, [page, sessionChecked]);

  /**
   * Load services from backend
   */
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetchWithTimeout(`${API_BASE_URL}/api/services`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch services');
        }

        const mappedServices = data.data.map((s) => ({
          id: s.service_id,
          serviceId: s.service_id,
          providerProfileId: s.provider_profile_id,
          serviceName: s.service_name,
          serviceType: s.description,
          duration: s.duration_minutes,
          price: s.price,
          providerName: s.provider_name || 'Provider',
          businessName: s.business_name || '',
        }));

        setServices(mappedServices);

      } catch (err) {
        console.error('Error fetching services:', err);
      }
    };

    fetchServices();
  }, []);

  /**
   * Persistent theme change
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setDarkMode(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  /**
   * Load archived services from backend
   */
  const fetchArchivedServices = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/services/provider/me/archived`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch archived services');
      }

      const mappedArchived = data.data.map((s) => ({
        id: s.service_id,
        serviceId: s.service_id,
        providerProfileId: s.provider_profile_id,
        serviceName: s.service_name,
        serviceType: s.description,
        duration: s.duration_minutes,
        price: s.price,
        archivedAt: s.archived_at,
      }));

      setArchivedServices(mappedArchived);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (
      sessionChecked &&
      page === 'provider-dashboard' &&
      currentUser?.role === 'provider'
    ) {
      fetchArchivedServices();
    }
  }, [sessionChecked, page, currentUser]);

  /**
   * Add a new service to the platform
   */
  const handleAddService = (service) => {
    const normalizedService = {
      ...service,
      id: service.id || service.serviceId || service.service_id || Date.now(),
      serviceId: service.serviceId || service.service_id,
      providerProfileId:
        service.providerProfileId ||
        service.provider_profile_id ||
        providerData?.profile?.provider_profile_id,
      providerName: providerData?.name ?? 'Unknown',
      businessName: providerData?.businessName ?? '',
    };

    setServices((prev) => [...prev, normalizedService]);
  };

  /**
   *  Deletes a service from the platform
   */
  const handleDeleteService = async (serviceId) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('You are not logged in');
      }

      const cancelAppointments = window.confirm(
        "Do you also want to cancel all appointments booked for this service?"
      );

      const res = await fetch(
        `${API_BASE_URL}/api/services/${serviceId}?cancelAppointments=${cancelAppointments}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete service');
      }

      // Remove deleted service from frontend immediately
      setServices((prev) =>
        prev.filter((service) =>
          service.id !== serviceId && service.serviceId !== serviceId
        )
      );

    } catch (err) {
      console.error(err);
      setNoticeModal({
        title: "Something went wrong",
        message: err.message,
      });
    }
  };

  const handleArchiveService = async (serviceId) => {
    try {
      const token = localStorage.getItem('token');

      const cancelAppointments = window.confirm(
        "Do you want to cancel all future appointments booked for this service?"
      );

      const res = await fetch(
        `${API_BASE_URL}/api/services/${serviceId}/archive?cancelAppointments=${cancelAppointments}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to archive service');
      }

      setServices((prev) =>
        prev.filter((service) =>
          service.id !== serviceId && service.serviceId !== serviceId
        )
      );

      fetchArchivedServices();

    } catch (err) {
      console.error(err);
      setNoticeModal({
        title: "Something went wrong",
        message: err.message,
      });
    }
  };

  const handleUnarchiveService = async (serviceId) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/api/services/${serviceId}/unarchive`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to restore service');
      }

      const restored = data.data;

      setArchivedServices((prev) =>
        prev.filter((service) =>
          service.id !== serviceId && service.serviceId !== serviceId
        )
      );

      handleAddService({
        id: restored.service_id,
        serviceId: restored.service_id,
        providerProfileId: restored.provider_profile_id,
        serviceName: restored.service_name,
        serviceType: restored.description,
        duration: restored.duration_minutes,
        price: restored.price,
      });

    } catch (err) {
      console.error(err);
      setNoticeModal({
        title: "Something went wrong",
        message: err.message,
      });
    }
  };

  /**
   * Handle successful login
   */
  const handleLoginSuccess = (data) => {
    setCurrentUser(data.user);

    if (data.user?.role === 'provider') {
      setProviderData(data);
      setPage('provider-dashboard');
    } else {
      setPage('client-dashboard');
    }
  };

  /**
   *  Handle logout
   */

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('page');

    setCurrentUser(null);
    setProviderData(null);
    setPage('home');
  };

  /**
   * Handle booking button click
   */
  const handleBookClick = (service) => {
  console.log("BOOK/RESCHEDULE SERVICE:", service);
  setSelectedService(service);
};

  /**
   * Toggle dark mode and update document theme attribute
   */
  const toggleDark = () => {
    const next = !darkMode;
    const theme = next ? 'dark' : 'light';

    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  /**
   * Loading Protection
   */
  if (!sessionChecked) {
    return <div className="app">Loading...</div>;
  }


  /**
   * Render the appropriate view based on current page state
   */
  const renderContent = () => {
    if (page === 'login') {
      return (
        <LoginForm
          onBack={() => setPage('home')}
          onSuccess={handleLoginSuccess}
        />
      );
    }

    if (page === 'signup') {
      return (
        <SignUpChoice
          onSelectProvider={() => setPage('provider-form')}
          onSelectCustomer={() => setPage('customer-form')}
          onBack={() => setPage('home')}
        />
      );
    }

    if (page === 'customer-form') {
      return (
        <CustomerSignUpForm
          onBack={() => setPage('signup')}
          onSuccess={(data) => {
          setCurrentUser(data.user);
          setPage('client-dashboard');
        }}
        />
      );
    }

    if (page === 'provider-form') {
      return (
        <ProviderSignUpForm
          onBack={() => setPage('signup')}
          onSuccess={(data) => {
            setCurrentUser(data.user);
            setProviderData(data);
            setPage('provider-dashboard');
          }}
        />
      );
    }

    if (page === 'client-dashboard') {
      return (
        <ClientDashboard
          client={currentUser}
          onLogout={handleLogout}
          onHome={() => setPage('home')}
          darkMode={darkMode}
          onToggleTheme={toggleDark}
          services={services}
          onBook={handleBookClick}
        />
      );
    }

    if (page === 'provider-dashboard') {

      console.log("Provider Profile ID:", providerData?.profile?.provider_profile_id);
      console.log("Services:", services);

      return (
        <ProviderDashboard
          provider={providerData}
          onLogout={handleLogout}
          onHome={() => setPage('home')}
          darkMode={darkMode}
          onToggleTheme={toggleDark}
          services={services.filter((service) =>
            String(service.providerProfileId) === String(providerData?.profile?.provider_profile_id)
          )}
          archivedServices={archivedServices}
          fetchArchivedServices={fetchArchivedServices}
          onAddService={handleAddService}
          onDeleteService={handleDeleteService}
          onArchiveService={handleArchiveService}
          onUnarchiveService={handleUnarchiveService}
        />
      );
    }

    return (
      <main>
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Book local services,<br />
              <span className="hero-accent">effortlessly.</span>
            </h1>

            <p className="hero-subtitle">
              Discover and book trusted providers in your area — all in one place.
            </p>
          </div>
        </section>

        <HowItWorks />
        <ProvidersSection
          services={services}
          onBook={handleBookClick}
        />
        <JoinSection
          onSignUpClient={() => setPage('customer-form')}
          onSignUpProvider={() => setPage('provider-form')}
        />
      </main>
    );
  };

  /**
   * Determine if currently on provider dashboard
   */
  const isDashboard = page === 'provider-dashboard' || page === 'client-dashboard';

  const handleDashboardClick = async () => {
    if (currentUser?.role === 'provider') {
      try {
        const token = localStorage.getItem('token');

        const res = await fetch(`${API_BASE_URL}/api/provider/profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        setProviderData((prev) => ({
          ...prev,
          profile: data.data,
        }));

        setPage('provider-dashboard');
      } catch (err) {
        console.error(err);
        alert("Failed to load provider profile");
      }

      return;
    }

    if (currentUser) {
      setPage('client-dashboard');
      return;
    }

    alert('Please log in first.');
  };

  /**
   * Render main application layout
   */
  return (
    <div className="app">
      {!isDashboard && (
        <Navbar
          darkMode={darkMode}
          onToggle={toggleDark}
          onSignUp={() => setPage('signup')}
          onLogin={() => setPage('login')}
          onHome={() => setPage('home')}
          currentUser={currentUser}
          onDashboard={handleDashboardClick}
          onLogout={handleLogout}
        />
      )}

      {renderContent()}

      {selectedService && (
        <BookingModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}

      {!isDashboard && <Footer />}

      {noticeModal && (
        <NoticeModal
          title={noticeModal.title}
          message={noticeModal.message}
          onClose={() => setNoticeModal(null)}
        />
      )}

    </div>
  );
}