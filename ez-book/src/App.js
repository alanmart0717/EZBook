/**
 * Main App Component - EZBook Service Booking Platform
 * 
 * This is the primary entry point for the EZBook application.
 * It manages:
 * - User authentication flow (customer vs. provider signup)
 * - Service browsing and search functionality
 * - Dark mode toggle
 * - Provider dashboard access
 * - Navigation between different app views
 */

import { useState } from 'react';
import './App.css';
import ProviderDashboard from './ProviderDashboard';

/**
 * Service categories displayed in the browsing interface
 * TODO: Replace with real API data once providers are integrated
 * Each category includes an ID, display label, and emoji icon
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
 * Displays the EZBook brand, navigation buttons, and theme toggle
 * 
 * @param {boolean} darkMode - Current theme state
 * @param {function} onToggle - Callback to toggle dark mode
 * @param {function} onSignUp - Callback to navigate to signup
 * @param {function} onHome - Callback to navigate to home
 */
function Navbar({ darkMode, onToggle, onSignUp, onHome }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <span className="brand" onClick={onHome} style={{ cursor: 'pointer' }}>
          EZ<span className="brand-accent">Book</span>
        </span>
        <div className="nav-links">
          <button className="btn-outline">Log In</button>
          <button className="btn-primary" onClick={onSignUp}>Sign Up</button>
          <button
            className="theme-toggle"
            onClick={onToggle}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className="toggle-thumb">{darkMode ? '🌙' : '☀️'}</div>
          </button>
        </div>
      </div>
    </nav>
  );
}

/**
 * SignUpChoice Component - Choice between Customer and Provider signup
 * Allows users to select their account type during the signup flow
 * 
 * @param {function} onSelectProvider - Callback when provider option is clicked
 * @param {function} onSelectCustomer - Callback when customer option is clicked
 * @param {function} onBack - Callback to return to previous page
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
 * ProviderSignUpForm Component - Signup form for service providers
 * Collects provider information including name, email, phone, business details
 * 
 * @param {function} onBack - Callback to return to signup choice page
 * @param {function} onSuccess - Callback when form is successfully submitted
 */
function ProviderSignUpForm({ onBack, onSuccess }) {
  // Form state containing provider details
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
  });

  /**
   * Helper function to create input change handlers
   * Returns a function that updates a specific form field
   */
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  /**
   * Handle form submission
   * TODO: Wire this to the backend API for provider registration
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: wire to backend
    onSuccess(form);
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
          <button type="submit" className="btn-primary form-submit">
            Create Provider Account
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * SearchBar Component - Service/provider search input
 * Allows users to search for services or providers by keyword
 * Triggers search on Enter key press or button click
 * 
 * @param {string} query - Current search query text
 * @param {function} onChange - Callback when search input changes
 * @param {function} onSearch - Callback to execute the search
 */
function SearchBar({ query, onChange, onSearch }) {
  /**
   * Handle Enter key press to trigger search
   */
  const handleKey = (e) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className="search-wrapper">
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
        <button className="btn-primary search-btn" onClick={onSearch}>
          Search
        </button>
      </div>
    </div>
  );
}

/**
 * CategoryGrid Component - Browse services by category
 * Displays all available service categories as clickable cards
 * 
 * @param {function} onCategoryClick - Callback when a category is selected
 */
function CategoryGrid({ onCategoryClick }) {
  return (
    <section className="section" id="services">
      <h2 className="section-title">Browse by Category</h2>
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
    </section>
  );
}

/**
 * ProviderCard Component - Individual service provider listing
 * Displays service details including provider name, service type, duration, and price
 * 
 * @param {object} service - Service object containing provider and service information
 */
function ProviderCard({ service }) {
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
      <button className="btn-primary provider-btn">Book</button>
    </div>
  );
}

/**
 * ProvidersSection Component - Featured or filtered provider listings
 * Shows search results or featured providers
 * Filters services by search query across service name, type, and provider name
 * 
 * @param {array} services - Array of available services
 * @param {string} searchQuery - Current search query to filter providers
 */
function ProvidersSection({ services, searchQuery }) {
  /**
   * Filter services based on the search query
   * Performs case-insensitive search across multiple fields
   */
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
            <ProviderCard key={s.id} service={s} />
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
 * Displays a 3-step guide to using the EZBook platform
 */
function HowItWorks() {
  // Step-by-step process for using EZBook
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
 * Footer Component - Page footer with branding and copyright
 */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="brand">EZ<span className="brand-accent">Book</span></span>
        <p className="footer-copy">© {new Date().getFullYear()} EZBook. All rights reserved.</p>
      </div>
    </footer>
  );
}

/**
 * App Component - Main application controller
 * Manages:
 * - Navigation between different pages/views
 * - User authentication state
 * - Service listings and search
 * - Dark mode theme
 */
export default function App() {
  /**
   * State Management
   */
  // Current search input value (unfiltered)
  const [searchQuery, setSearchQuery] = useState('');
  
  // Last confirmed search query (used for filtering)
  const [activeQuery, setActiveQuery] = useState('');
  
  // Dark mode theme toggle
  const [darkMode, setDarkMode] = useState(false);
  
  // Current page/view: 'home' | 'signup' | 'provider-form' | 'provider-dashboard'
  const [page, setPage] = useState('home');
  
  // Authenticated provider data (null if no provider is logged in)
  const [providerData, setProviderData] = useState(null);
  
  // List of all services offered by providers
  const [services, setServices] = useState([]);

  /**
   * Add a new service to the platform
   * Combines service data with current provider's information
   */
  const handleAddService = (service) => {
    setServices((prev) => [
      ...prev,
      {
        ...service,
        providerName: providerData?.name ?? 'Unknown',
        businessName: providerData?.businessName ?? '',
      },
    ]);
  };

  /**
   * Toggle dark mode and update document theme attribute
   */
  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  };

  /**
   * Execute search and scroll to results section
   */
  const handleSearch = () => {
    setActiveQuery(searchQuery.trim());
    document.getElementById('providers')?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Handle category selection
   * Sets search query and scrolls to provider results
   */
  const handleCategoryClick = (label) => {
    setSearchQuery(label);
    setActiveQuery(label);
    document.getElementById('providers')?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Render the appropriate view based on current page state
   * Routes between home, signup choice, provider signup form, and provider dashboard
   */
  const renderContent = () => {
    // Show signup choice page
    if (page === 'signup') {
      return (
        <SignUpChoice
          onSelectProvider={() => setPage('provider-form')}
          onSelectCustomer={() => {}}
          onBack={() => setPage('home')}
        />
      );
    }
    // Show provider signup form
    if (page === 'provider-form') {
      return (
        <ProviderSignUpForm
          onBack={() => setPage('signup')}
          onSuccess={(data) => { setProviderData(data); setPage('provider-dashboard'); }}
        />
      );
    }
    // Show provider dashboard for logged-in providers
    if (page === 'provider-dashboard') {
      return (
        <ProviderDashboard
          provider={providerData}
          onLogout={() => { setProviderData(null); setPage('home'); }}
          services={services}
          onAddService={handleAddService}
        />
      );
    }
    // Default: Show home page with search and browsing
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
            <SearchBar
              query={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
            />
          </div>
        </section>
        <CategoryGrid onCategoryClick={handleCategoryClick} />
        <HowItWorks />
        <ProvidersSection services={services} searchQuery={activeQuery} />
      </main>
    );
  };

  /**
   * Determine if currently on provider dashboard
   * Used to conditionally show/hide navbar and footer
   */
  const isDashboard = page === 'provider-dashboard';

  /**
   * Render main application layout
   * Conditionally displays navbar and footer (hidden on dashboard)
   */
  return (
    <div className="app">
      {!isDashboard && (
        <Navbar
          darkMode={darkMode}
          onToggle={toggleDark}
          onSignUp={() => setPage('signup')}
          onHome={() => setPage('home')}
        />
      )}
      {renderContent()}
      {!isDashboard && <Footer />}
    </div>
  );
}
