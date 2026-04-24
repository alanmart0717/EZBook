import { useState } from 'react';
import './App.css';

// Placeholder categories — swap with real API data when providers are integrated
const SERVICE_CATEGORIES = [
  { id: 1, label: 'Hair & Beauty', icon: '✂️' },
  { id: 2, label: 'Health & Wellness', icon: '🧘' },
  { id: 3, label: 'Home Services', icon: '🏠' },
  { id: 4, label: 'Fitness', icon: '🏋️' },
  { id: 5, label: 'Tutoring', icon: '📚' },
  { id: 6, label: 'Pet Care', icon: '🐾' },
];

// TODO: Replace with real provider data fetched from the backend
const FEATURED_PROVIDERS = [];

function Navbar({ darkMode, onToggle }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <span className="brand">EZ<span className="brand-accent">Book</span></span>
        <div className="nav-links">
          <a href="#services">Services</a>
          <a href="#providers">Providers</a>
          <button className="btn-outline">Log In</button>
          <button className="btn-primary">Sign Up</button>
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

function SearchBar({ query, onChange, onSearch }) {
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

function ProviderCard({ provider }) {
  return (
    <div className="provider-card">
      <div className="provider-avatar">{provider.name?.[0] ?? '?'}</div>
      <div className="provider-info">
        <h3 className="provider-name">{provider.name}</h3>
        <p className="provider-service">{provider.service}</p>
        <div className="provider-meta">
          <span className="provider-rating">★ {provider.rating}</span>
          <span className="provider-location">{provider.location}</span>
        </div>
      </div>
      <button className="btn-primary provider-btn">Book</button>
    </div>
  );
}

function ProvidersSection({ searchQuery }) {
  const filtered = FEATURED_PROVIDERS.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.service?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q)
    );
  });

  return (
    <section className="section section-alt" id="providers">
      <h2 className="section-title">
        {searchQuery ? `Results for "${searchQuery}"` : 'Featured Providers'}
      </h2>

      {filtered.length > 0 ? (
        <div className="provider-list">
          {filtered.map((p) => (
            <ProviderCard key={p.id} provider={p} />
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

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  };

  const handleSearch = () => {
    setActiveQuery(searchQuery.trim());
    document.getElementById('providers')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategoryClick = (label) => {
    setSearchQuery(label);
    setActiveQuery(label);
    document.getElementById('providers')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app">
      <Navbar darkMode={darkMode} onToggle={toggleDark} />

      <main>
        {/* Hero */}
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
        <ProvidersSection searchQuery={activeQuery} />
      </main>

      <Footer />
    </div>
  );
}
