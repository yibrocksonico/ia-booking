'use client';

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, Users, Settings, Search, DollarSign, Activity, Check, X, Eye, Key, Loader2, Sparkles, LogOut } from 'lucide-react';
import { translations } from '@/lib/translations';

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  accommodationId: string;
  checkIn: string;
  checkOut: string;
  basePrice: number;
  totalPrice: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  receiptBase64: string | null;
  receiptMimeType: string | null;
  assignedPod: number | null;
  expiresAt: string | null;
  createdAt: string;
}

interface Customer {
  name: string;
  phone: string;
  email: string;
  bookingCount: number;
  totalSpent: number;
  lastBookingDate: string;
}

interface StatsData {
  summary: {
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    totalRevenue: number;
  };
  monthlyReport: {
    month: string;
    revenue: number;
    bookings: number;
    occupancyRate: number;
  }[];
  paymentMethods: {
    paypal: number;
    transfer: number;
    conekta: number;
  };
  accommodationDistribution: {
    capsule: number;
    privateRoom: number;
  };
  demandByDay: {
    day: string;
    count: number;
  }[];
  topCustomers: Customer[];
  allCustomers: Customer[];
}

interface CatalogItem {
  id: string;
  name: string;
  basePrice: number;
  capacity: number;
  description: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'customers' | 'catalog'>('dashboard');
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Language state
  const [lang, setLang] = useState<'es' | 'en'>('es');

  // Data states
  const [stats, setStats] = useState<StatsData | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  
  // Loader & search states
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals / Interaction states
  const [viewingReceipt, setViewingReceipt] = useState<Booking | null>(null);
  const [checkingInBooking, setCheckingInBooking] = useState<Booking | null>(null);
  const [assignedPodNumber, setAssignedPodNumber] = useState('');
  const [updatingCatalogId, setUpdatingCatalogId] = useState<string | null>(null);
  const [newPriceValue, setNewPriceValue] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | null }>({ message: '', type: null });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: null });
    }, 4000);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('capsule_lang') as 'es' | 'en';
    if (savedLang === 'es' || savedLang === 'en') {
      setLang(savedLang);
    }

    const auth = sessionStorage.getItem('capsule_admin_logged_in');
    if (auth === 'true') {
      setIsLoggedIn(true);
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, []);

  const changeLang = (l: 'es' | 'en') => {
    setLang(l);
    localStorage.setItem('capsule_lang', l);
  };

  const t = (key: keyof typeof translations.es) => {
    return translations[lang][key] || translations.es[key];
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    
    // Simulate delay
    setTimeout(() => {
      if (usernameInput === 'Capsule-admin26' && passwordInput === 'BDrtzD@jk91lL8_SNm53') {
        sessionStorage.setItem('capsule_admin_logged_in', 'true');
        setIsLoggedIn(true);
        showToast(lang === 'es' ? 'Acceso autorizado.' : 'Access authorized.', 'success');
        fetchAdminData();
      } else {
        setLoginError(t('login_error'));
        showToast(t('login_error'), 'error');
      }
      setIsLoggingIn(false);
    }, 800);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('capsule_admin_logged_in');
    setIsLoggedIn(false);
    setUsernameInput('');
    setPasswordInput('');
    showToast(lang === 'es' ? 'Sesión cerrada exitosamente.' : 'Logged out successfully.', 'info');
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch raw bookings
      const bookingsRes = await fetch('/api/bookings');
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData);

      // Fetch catalog
      const catalogRes = await fetch('/api/catalog');
      const catalogData = await catalogRes.json();
      setCatalog(catalogData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (bookingId: string) => {
    const confirmMsg = lang === 'es'
      ? '¿Estás seguro de confirmar el pago de esta reserva?'
      : 'Are you sure you want to confirm payment for this booking?';
    if (!confirm(confirmMsg)) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, action: 'confirm_payment' }),
      });
      if (res.ok) {
        showToast(lang === 'es' ? 'Pago confirmado correctamente y reserva activa.' : 'Payment confirmed successfully and booking active.', 'success');
        await fetchAdminData();
      } else {
        const d = await res.json();
        showToast('Error: ' + d.error, 'error');
      }
    } catch (e: any) {
      showToast('Error: ' + e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const confirmMsg = lang === 'es'
      ? '¿Estás seguro de cancelar esta reserva? Liberará la disponibilidad inmediatamente.'
      : 'Are you sure you want to cancel this booking? This will release availability immediately.';
    if (!confirm(confirmMsg)) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, action: 'cancel' }),
      });
      if (res.ok) {
        showToast(lang === 'es' ? 'Reserva cancelada con éxito.' : 'Booking cancelled successfully.', 'info');
        await fetchAdminData();
      } else {
        const d = await res.json();
        showToast('Error: ' + d.error, 'error');
      }
    } catch (e: any) {
      showToast('Error: ' + e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkingInBooking || !assignedPodNumber) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: checkingInBooking.id,
          action: 'check_in',
          assignedPod: assignedPodNumber,
        }),
      });
      if (res.ok) {
        showToast(lang === 'es' 
          ? `Check-in exitoso. Cabina #${assignedPodNumber} asignada.` 
          : `Check-in successful. Cabin #${assignedPodNumber} assigned.`, 
          'success'
        );
        setCheckingInBooking(null);
        setAssignedPodNumber('');
        await fetchAdminData();
      } else {
        const d = await res.json();
        showToast('Error: ' + d.error, 'error');
      }
    } catch (e: any) {
      showToast('Error: ' + e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePrice = async (id: string) => {
    if (!newPriceValue || isNaN(parseFloat(newPriceValue))) {
      showToast(t('admin_catalog_validation_error'), 'error');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch('/api/catalog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, basePrice: parseFloat(newPriceValue) }),
      });
      if (res.ok) {
        showToast(lang === 'es' ? 'Tarifa actualizada correctamente en el catálogo.' : 'Rate updated successfully in the catalog.', 'success');
        setUpdatingCatalogId(null);
        setNewPriceValue('');
        await fetchAdminData();
      } else {
        const d = await res.json();
        showToast('Error: ' + d.error, 'error');
      }
    } catch (e: any) {
      showToast('Error: ' + e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filters for bookings list
  const filteredBookings = bookings.filter((b) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      b.id.toLowerCase().includes(query) ||
      b.customerName.toLowerCase().includes(query) ||
      b.customerEmail.toLowerCase().includes(query) ||
      b.customerPhone.includes(query);

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'pending') return matchesSearch && b.status === 'blocked' && b.paymentStatus === 'pending';
    if (statusFilter === 'confirmed') return matchesSearch && b.status === 'confirmed' && !b.assignedPod;
    if (statusFilter === 'checked_in') return matchesSearch && b.assignedPod !== null && b.status === 'confirmed';
    if (statusFilter === 'cancelled') return matchesSearch && b.status === 'cancelled';
    return matchesSearch;
  });

  // Render Login Panel if not logged in
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'radial-gradient(circle at center, rgba(16, 20, 38, 0.4) 0%, rgba(2, 4, 9, 1) 100%)', justifyContent: 'center', alignItems: 'center', padding: '1.5rem' }}>
        
        {/* Floating Language Toggle on Login */}
        <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
          <button
            onClick={() => changeLang(lang === 'es' ? 'en' : 'es')}
            className="cyber-btn cyber-btn-outline"
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-jetbrains-mono)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer'
            }}
          >
            <span>🌐</span>
            <span style={{ fontWeight: 'bold' }}>{lang === 'es' ? 'EN' : 'ES'}</span>
          </button>
        </div>

        <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', border: 'var(--border-neon-magenta)', boxShadow: 'var(--glow-magenta)', padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img 
              src="/logo-hotel-capsula-condesa-horiz.webp" 
              alt="Cápsula Condesa Logo" 
              style={{ height: '50px', objectFit: 'contain', margin: '0 auto 1.5rem auto' }}
            />
            <h2 className="text-glow-magenta" style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('login_title')}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              {t('login_subtitle')}
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="cyber-form-group">
              <label className="cyber-label">{t('login_username')}</label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="cyber-input"
                style={{ width: '100%' }}
                placeholder="Capsule-admin26"
              />
            </div>

            <div className="cyber-form-group">
              <label className="cyber-label">{t('login_password')}</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="cyber-input"
                style={{ width: '100%' }}
                placeholder="••••••••••••••••••••"
              />
            </div>

            {loginError && (
              <div style={{ color: 'var(--color-magenta-neon)', padding: '0.75rem', background: 'rgba(255, 0, 150, 0.05)', border: 'var(--border-neon-magenta)', borderRadius: '6px', fontSize: '0.8rem', textAlign: 'center' }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="cyber-btn"
              style={{ width: '100%', background: 'var(--color-magenta-neon)', color: '#ffffff', boxShadow: 'var(--glow-magenta-intense)', marginTop: '0.5rem' }}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="pulse-indicator" style={{ width: '14px', height: '14px', marginRight: '0.5rem', animation: 'spin 1.5s linear infinite' }} />
                  {t('login_loading')}
                </>
              ) : (
                t('login_btn')
              )}
            </button>
          </form>
        </div>

        {/* Toast Notification */}
        {toast.message && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'rgba(21, 26, 46, 0.95)',
            border: toast.type === 'success' ? '1px solid var(--color-cyan-neon)' : toast.type === 'error' ? '1px solid var(--color-magenta-neon)' : '1px solid var(--color-amber-gold)',
            boxShadow: toast.type === 'success' ? 'var(--glow-cyan)' : toast.type === 'error' ? 'var(--glow-magenta)' : 'var(--glow-gold)',
            color: '#ffffff',
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '0.9rem',
            backdropFilter: 'blur(12px)',
            animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: toast.type === 'success' ? 'var(--color-cyan-neon)' : toast.type === 'error' ? 'var(--color-magenta-neon)' : 'var(--color-amber-gold)',
              display: 'inline-block'
            }} className="pulse-indicator"></span>
            {toast.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Banner Control Center */}
      <header style={{
        borderBottom: 'var(--border-glass)',
        background: 'rgba(7, 11, 25, 0.95)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '1rem 0'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img 
                src="/logo-hotel-capsula-condesa-horiz.webp" 
                alt="Cápsula Condesa Logo" 
                style={{ height: '38px', objectFit: 'contain' }}
              />
            </a>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
              <h1 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                IA BOOKING <span className="text-glow-magenta">CENTRAL</span>
              </h1>
              <p style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }} className="mono-text">
                {t('admin_subtitle')}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="/" className="cyber-btn cyber-btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
              {t('admin_btn_client')}
            </a>

            {/* Language Selector */}
            <button
              onClick={() => changeLang(lang === 'es' ? 'en' : 'es')}
              className="cyber-btn cyber-btn-outline"
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-jetbrains-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
            >
              <span>🌐</span>
              <span style={{ fontWeight: 'bold' }}>{lang === 'es' ? 'EN' : 'ES'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="container" style={{ flex: 1, padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem' }}>
        
        {/* Sidebar Nav */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`cyber-btn ${activeTab === 'dashboard' ? 'cyber-btn-cyan' : 'cyber-btn-outline'}`}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <LayoutDashboard style={{ width: '16px', height: '16px' }} />
            {t('admin_tab_dashboard')}
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`cyber-btn ${activeTab === 'bookings' ? 'cyber-btn-cyan' : 'cyber-btn-outline'}`}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <Calendar style={{ width: '16px', height: '16px' }} />
            {t('admin_tab_bookings')}
            {bookings.filter(b => b.status === 'blocked' && b.paymentStatus === 'pending' && b.receiptBase64).length > 0 && (
              <span className="mono-text text-glow-magenta" style={{ fontSize: '0.75rem', fontWeight: 'bold', marginLeft: 'auto', background: 'rgba(255,0,150,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid var(--color-magenta-neon)' }}>
                {bookings.filter(b => b.status === 'blocked' && b.paymentStatus === 'pending' && b.receiptBase64).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`cyber-btn ${activeTab === 'customers' ? 'cyber-btn-cyan' : 'cyber-btn-outline'}`}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <Users style={{ width: '16px', height: '16px' }} />
            {t('admin_tab_customers')}
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`cyber-btn ${activeTab === 'catalog' ? 'cyber-btn-cyan' : 'cyber-btn-outline'}`}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <Settings style={{ width: '16px', height: '16px' }} />
            {t('admin_tab_catalog')}
          </button>

          <button
            onClick={handleLogout}
            className="cyber-btn"
            style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(255, 0, 150, 0.1)', color: 'var(--color-magenta-neon)', border: '1px solid var(--color-magenta-neon)', marginTop: '1.5rem' }}
          >
            <LogOut style={{ width: '16px', height: '16px' }} />
            {t('admin_logout')}
          </button>

          <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="glass-panel" style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }} className="mono-text">{t('admin_db_status')}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-cyan-neon)', marginTop: '0.25rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-cyan-neon)', display: 'inline-block' }} className="pulse-indicator"></span>
                {t('admin_db_status_online')}
              </div>
            </div>
          </div>
        </aside>

        {/* Content Box */}
        <main style={{ minWidth: 0 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', gap: '1rem' }}>
              <Loader2 className="pulse-indicator" style={{ width: '40px', height: '40px', color: 'var(--color-magenta-neon)', animation: 'spin 1.5s linear infinite' }} />
              <p className="mono-text" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t('admin_loading')}</p>
            </div>
          ) : (
            <>
              {/* TAB 1: DASHBOARD METRICS */}
              {activeTab === 'dashboard' && stats && (
                <div>
                  {/* Headline cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                    <div className="glass-panel" style={{ borderBottom: '2px solid var(--color-cyan-neon)' }}>
                      <span className="cyber-label" style={{ fontSize: '0.7rem' }}>{t('admin_metric_revenue')}</span>
                      <h4 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }} className="mono-text text-glow-cyan">
                        ${stats.summary.totalRevenue.toLocaleString()} MXN
                      </h4>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{t('admin_metric_revenue_sub')}</p>
                    </div>
                    <div className="glass-panel" style={{ borderBottom: '2px solid var(--color-magenta-neon)' }}>
                      <span className="cyber-label" style={{ fontSize: '0.7rem' }}>{t('admin_metric_confirmed')}</span>
                      <h4 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }} className="mono-text text-glow-magenta">
                        {stats.summary.confirmedBookings}
                      </h4>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{t('admin_metric_confirmed_sub')}</p>
                    </div>
                    <div className="glass-panel" style={{ borderBottom: '2px solid var(--color-amber-gold)' }}>
                      <span className="cyber-label" style={{ fontSize: '0.7rem' }}>{t('admin_metric_pending')}</span>
                      <h4 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }} className="mono-text text-glow-gold">
                        {stats.summary.pendingBookings}
                      </h4>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{t('admin_metric_pending_sub')}</p>
                    </div>
                    <div className="glass-panel" style={{ borderBottom: '2px solid var(--color-blue-electric)' }}>
                      <span className="cyber-label" style={{ fontSize: '0.7rem' }}>{t('admin_metric_customers')}</span>
                      <h4 className="mono-text" style={{ fontSize: '1.75rem', marginTop: '0.25rem', color: 'var(--color-blue-electric)' }}>
                        {stats.allCustomers.length}
                      </h4>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{t('admin_metric_customers_sub')}</p>
                    </div>
                  </div>

                  {/* Monthly charts using SVGs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    
                    {/* SVG Chart: Occupancy Rate */}
                    <div className="glass-panel">
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>{t('admin_chart_occupancy')}</h3>
                      {stats.monthlyReport.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '3rem 0' }}>{t('admin_chart_occupancy_empty')}</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {stats.monthlyReport.map((m, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <span className="mono-text" style={{ width: '80px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{m.month}</span>
                              <div style={{ flex: 1, height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                  width: `${m.occupancyRate}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, var(--color-blue-electric), var(--color-cyan-neon))',
                                  boxShadow: 'var(--glow-cyan)',
                                  borderRadius: '4px',
                                  transition: 'width 1s ease-in-out'
                                }}></div>
                              </div>
                              <span className="mono-text" style={{ width: '40px', textAlign: 'right', fontSize: '0.8rem', color: 'var(--color-cyan-neon)', fontWeight: 'bold' }}>{m.occupancyRate}%</span>
                            </div>
                          ))}
                          <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>{t('admin_chart_occupancy_footnote')}</p>
                        </div>
                      )}
                    </div>

                    {/* SVG Chart: Monthly Revenue */}
                    <div className="glass-panel">
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>{t('admin_chart_revenue')}</h3>
                      {stats.monthlyReport.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '3rem 0' }}>{t('admin_chart_revenue_empty')}</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {stats.monthlyReport.map((m, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <span className="mono-text" style={{ width: '80px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{m.month}</span>
                              <div style={{ flex: 1, height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                  // Normalize width relative to a max monthly revenue (e.g. 50,000 MXN for scaling)
                                  width: `${Math.min(100, Math.max(8, (m.revenue / 50000) * 100))}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #c00072, var(--color-magenta-neon))',
                                  boxShadow: 'var(--glow-magenta)',
                                  borderRadius: '4px'
                                }}></div>
                              </div>
                              <span className="mono-text" style={{ width: '80px', textAlign: 'right', fontSize: '0.8rem', color: 'var(--color-magenta-neon)', fontWeight: 'bold' }}>${m.revenue.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Payment Distribution & Weekday demand (Suggested Report) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    
                    {/* Weekday demand */}
                    <div className="glass-panel">
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>{t('admin_chart_demand')}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '120px', padding: '0 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        {stats.demandByDay.map((d, i) => {
                          const maxCount = Math.max(...stats.demandByDay.map(x => x.count), 1);
                          const pct = (d.count / maxCount) * 85; // cap height at 85%
                          
                          // Translate day names
                          let dayLabel = d.day;
                          if (lang === 'en') {
                            const dayMap: { [key: string]: string } = {
                              'Lun': 'Mon', 'Mar': 'Tue', 'Mié': 'Wed', 'Jue': 'Thu', 'Vie': 'Fri', 'Sáb': 'Sat', 'Dom': 'Sun'
                            };
                            dayLabel = dayMap[d.day] || d.day;
                          }

                          return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '0.5rem' }}>
                              <span className="mono-text" style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>{d.count}</span>
                              <div style={{
                                width: '18px',
                                height: `${Math.max(4, pct)}px`,
                                background: 'linear-gradient(0deg, var(--color-blue-electric), var(--color-cyan-neon))',
                                boxShadow: 'var(--glow-cyan)',
                                borderRadius: '3px 3px 0 0'
                              }}></div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{dayLabel}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stats Distribution */}
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h3 style={{ fontSize: '1.1rem' }}>{t('admin_chart_distribution')}</h3>
                      
                      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                          <span>{t('admin_distribution_methods')}</span>
                          <span style={{ color: 'var(--color-text-primary)' }}>
                            PayPal: <span className="mono-text text-glow-cyan">{stats.paymentMethods.paypal}</span> | 
                            Conekta: <span className="mono-text text-glow-magenta">{stats.paymentMethods.conekta || 0}</span> | 
                            Transf: <span className="mono-text text-glow-gold">{stats.paymentMethods.transfer}</span>
                          </span>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                          <span>{t('admin_distribution_preferences')}</span>
                          <span style={{ color: 'var(--color-text-primary)' }}>
                            {lang === 'es' ? 'Cápsulas' : 'Pods'}: <span className="mono-text text-glow-cyan">{stats.accommodationDistribution.capsule}</span> | 
                            {lang === 'es' ? 'Cuartos' : 'Rooms'}: <span className="mono-text text-glow-magenta">{stats.accommodationDistribution.privateRoom}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: BOOKINGS LIST */}
              {activeTab === 'bookings' && (
                <div>
                  {/* Top Bar with Filter & Search */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                      <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--color-text-muted)' }} />
                      <input
                        type="text"
                        placeholder={t('admin_search_placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="cyber-input"
                        style={{ paddingLeft: '2.5rem', width: '100%' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="cyber-select"
                      >
                        <option value="all">{t('admin_filter_all')}</option>
                        <option value="pending">{t('admin_filter_pending')}</option>
                        <option value="confirmed">{t('admin_filter_confirmed')}</option>
                        <option value="checked_in">{t('admin_filter_checked_in')}</option>
                        <option value="cancelled">{t('admin_filter_cancelled')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Bookings Table */}
                  <div className="cyber-table-container">
                    <table className="cyber-table">
                      <thead>
                        <tr>
                          <th>{t('admin_table_code')}</th>
                          <th>{t('admin_table_guest')}</th>
                          <th>{t('admin_table_dates')}</th>
                          <th>{t('admin_table_accommodation')}</th>
                          <th>{t('admin_table_pod')}</th>
                          <th>{t('admin_table_payment')}</th>
                          <th>{t('admin_table_amount')}</th>
                          <th>{t('admin_table_actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.length === 0 ? (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem' }}>
                              {t('admin_table_empty')}
                            </td>
                          </tr>
                        ) : (
                          filteredBookings.map((b) => {
                            const isPendingTransfer = b.status === 'blocked' && b.paymentMethod === 'transfer' && b.paymentStatus === 'pending';
                            const isConfirmedNoCheckin = b.status === 'confirmed' && !b.assignedPod;
                            const isCheckedIn = b.status === 'confirmed' && b.assignedPod;

                            return (
                              <tr key={b.id}>
                                <td className="mono-text text-glow-cyan" style={{ fontWeight: 'bold' }}>{b.id}</td>
                                <td>
                                  <div style={{ fontWeight: 600 }}>{b.customerName}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{b.customerPhone} | {b.customerEmail}</div>
                                </td>
                                <td className="mono-text" style={{ fontSize: '0.8rem' }}>
                                  {new Date(b.checkIn).toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { timeZone: 'UTC' })} ➜ <br/>
                                  {new Date(b.checkOut).toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { timeZone: 'UTC' })}
                                </td>
                                <td style={{ fontSize: '0.8rem' }}>
                                  {b.accommodationId === 'capsule' ? (
                                    <span className="badge badge-cyan">{t('admin_badge_capsule')}</span>
                                  ) : b.accommodationId === 'private_room_bath' ? (
                                    <span className="badge badge-magenta">{t('admin_badge_room_bath')}</span>
                                  ) : (
                                    <span className="badge badge-gold">{t('admin_badge_room_no_bath')}</span>
                                  )}
                                </td>
                                <td className="mono-text" style={{ textAlign: 'center' }}>
                                  {b.assignedPod ? (
                                    <span style={{ color: 'var(--color-cyan-neon)', fontWeight: 'bold' }}>#{b.assignedPod}</span>
                                  ) : (
                                    <span style={{ color: 'var(--color-text-muted)' }}>--</span>
                                  )}
                                </td>
                                <td>
                                  {b.paymentStatus === 'completed' ? (
                                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                                      {t('admin_badge_payment_completed')} ({b.paymentMethod})
                                    </span>
                                  ) : (
                                    <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                                      {t('admin_badge_payment_pending')} ({b.paymentMethod})
                                    </span>
                                  )}
                                </td>
                                <td className="mono-text" style={{ fontWeight: 600 }}>${b.totalPrice}</td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                    
                                    {/* View Receipt button */}
                                    {b.receiptBase64 && (
                                      <button
                                        onClick={() => setViewingReceipt(b)}
                                        className="cyber-btn cyber-btn-outline"
                                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}
                                        title={lang === 'es' ? 'Ver comprobante bancario' : 'View bank receipt'}
                                      >
                                        <Eye style={{ width: '12px', height: '12px' }} />
                                      </button>
                                    )}

                                    {/* Confirm Payment button */}
                                    {isPendingTransfer && (
                                      <button
                                        onClick={() => handleConfirmPayment(b.id)}
                                        className="cyber-btn cyber-btn-cyan"
                                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem' }}
                                        title={t('admin_action_confirm')}
                                      >
                                        <Check style={{ width: '12px', height: '12px' }} /> {t('admin_action_confirm')}
                                      </button>
                                    )}

                                    {/* Check-In button */}
                                    {isConfirmedNoCheckin && (
                                      <button
                                        onClick={() => setCheckingInBooking(b)}
                                        className="cyber-btn"
                                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem', background: 'var(--color-amber-gold)', color: '#020409' }}
                                        title={t('admin_action_checkin')}
                                      >
                                        <Key style={{ width: '12px', height: '12px' }} /> {t('admin_action_checkin')}
                                      </button>
                                    )}

                                    {/* Checked In status label */}
                                    {isCheckedIn && (
                                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center' }}>
                                        {t('admin_action_active')}
                                      </span>
                                    )}

                                    {/* Cancel button */}
                                    {b.status !== 'cancelled' && (
                                      <button
                                        onClick={() => handleCancelBooking(b.id)}
                                        className="cyber-btn"
                                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem', background: 'rgba(255,0,150,0.1)', color: 'var(--color-magenta-neon)', border: '1px solid var(--color-magenta-neon)' }}
                                        title={lang === 'es' ? 'Cancelar Reservación' : 'Cancel Reservation'}
                                      >
                                        <X style={{ width: '12px', height: '12px' }} />
                                      </button>
                                    )}

                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOMERS LOYALTY LIST */}
              {activeTab === 'customers' && stats && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>{t('admin_crm_title')}</h3>
                  
                  <div className="cyber-table-container">
                    <table className="cyber-table">
                      <thead>
                        <tr>
                          <th>{t('admin_crm_name')}</th>
                          <th>{t('admin_crm_phone')}</th>
                          <th>{t('admin_crm_email')}</th>
                          <th>{t('admin_crm_visits')}</th>
                          <th>{t('admin_crm_spent')}</th>
                          <th>{t('admin_crm_last_checkin')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.allCustomers.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem' }}>
                              {t('admin_crm_empty')}
                            </td>
                          </tr>
                        ) : (
                          stats.allCustomers.map((c, i) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 600 }}>{c.name}</td>
                              <td className="mono-text">{c.phone}</td>
                              <td>{c.email}</td>
                              <td className="mono-text" style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                <span className={c.bookingCount > 1 ? 'text-glow-cyan' : ''} style={{ fontSize: '1rem' }}>
                                  {c.bookingCount}
                                </span>
                              </td>
                              <td className="mono-text" style={{ fontWeight: 600 }}>${c.totalSpent.toLocaleString()} MXN</td>
                              <td className="mono-text" style={{ fontSize: '0.8rem' }}>
                                {new Date(c.lastBookingDate).toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { timeZone: 'UTC' })}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: CATALOG PRICING MANAGER */}
              {activeTab === 'catalog' && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>{t('admin_catalog_title')}</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {catalog.map((item) => {
                      let translatedName = item.name;
                      let translatedDesc = item.description;
                      if (lang === 'en') {
                        if (item.id === 'capsule') {
                          translatedName = 'Single Sleep Pod';
                          translatedDesc = 'Futuristic cabin with memory foam mattress, ambient LED lighting, private ventilation system, and universal power outlets.';
                        } else if (item.id === 'private_room_bath') {
                          translatedName = 'Private Room with Bathroom';
                          translatedDesc = 'Spacious private cabin with integrated private bathroom, high-end shower amenities, double bed, smart control screen, and noise cancellation.';
                        } else if (item.id === 'private_room_no_bath') {
                          translatedName = 'Private Room without Bathroom';
                          translatedDesc = 'Premium room for two guests with shared luxury bathrooms, double bed, custom climate control, and digital keyless access.';
                        }
                      }

                      return (
                        <div key={item.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                              <h4 style={{ fontSize: '1.2rem' }}>{translatedName}</h4>
                              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--color-text-secondary)' }} className="mono-text">
                                {t('admin_catalog_id')}: {item.id}
                              </span>
                            </div>
                            
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                              {translatedDesc}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                              <div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{t('admin_catalog_capacity')}</span>
                                <p style={{ fontWeight: 'bold' }} className="mono-text">
                                  {item.capacity} {item.id === 'capsule' ? t('admin_catalog_pods') : t('admin_catalog_rooms')}
                                </p>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{t('admin_catalog_rate')}</span>
                                <p style={{ fontWeight: 'bold', color: item.id === 'capsule' ? 'var(--color-cyan-neon)' : 'var(--color-magenta-neon)', fontSize: '1.3rem' }} className="mono-text">
                                  ${item.basePrice} MXN
                                </p>
                              </div>
                            </div>
                          </div>

                          {updatingCatalogId === item.id ? (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <input
                                type="number"
                                placeholder={t('admin_catalog_placeholder')}
                                value={newPriceValue}
                                onChange={(e) => setNewPriceValue(e.target.value)}
                                className="cyber-input"
                                style={{ width: '130px', padding: '0.5rem' }}
                              />
                              <button
                                onClick={() => handleUpdatePrice(item.id)}
                                className="cyber-btn cyber-btn-cyan"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                              >
                                {t('admin_catalog_save')}
                              </button>
                              <button
                                onClick={() => { setUpdatingCatalogId(null); setNewPriceValue(''); }}
                                className="cyber-btn cyber-btn-outline"
                                style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                              >
                                {t('admin_catalog_cancel')}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setUpdatingCatalogId(item.id); setNewPriceValue(item.basePrice.toString()); }}
                              className="cyber-btn cyber-btn-outline"
                              style={{ width: '100%', borderColor: item.id === 'capsule' ? 'var(--color-cyan-neon)' : 'var(--color-magenta-neon)', color: item.id === 'capsule' ? 'var(--color-cyan-neon)' : 'var(--color-magenta-neon)' }}
                            >
                              {t('admin_catalog_edit')}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </>
          )}
        </main>

      </div>

      {/* VIEW RECEIPT MODAL */}
      {viewingReceipt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(2, 4, 9, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '2rem'
        }}>
          <div className="glass-panel" style={{ maxWidth: '550px', width: '100%', border: 'var(--border-neon-cyan)', boxShadow: 'var(--glow-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                {lang === 'es' ? 'Comprobante de Pago' : 'Payment Receipt'} ({viewingReceipt.id})
              </h3>
              <button
                onClick={() => setViewingReceipt(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
            
            {viewingReceipt.receiptMimeType === 'application/pdf' ? (
              <div style={{ padding: '2rem 1rem', background: 'rgba(7,11,25,0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {lang === 'es' ? 'El comprobante es un archivo PDF.' : 'The receipt is a PDF file.'}
                </p>
                <a
                  href={`data:${viewingReceipt.receiptMimeType};base64,${viewingReceipt.receiptBase64}`}
                  download={`comprobante-${viewingReceipt.id}.pdf`}
                  className="cyber-btn cyber-btn-cyan"
                  style={{ fontSize: '0.8rem' }}
                >
                  {lang === 'es' ? 'Descargar Comprobante PDF' : 'Download PDF Receipt'}
                </a>
              </div>
            ) : (
              <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(7,11,25,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: '380px', marginBottom: '1.5rem' }}>
                <img
                  src={`data:${viewingReceipt.receiptMimeType || 'image/jpeg'};base64,${viewingReceipt.receiptBase64}`}
                  alt="Comprobante Bancario"
                  style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              {viewingReceipt.status === 'blocked' && (
                <button
                  onClick={() => {
                    handleConfirmPayment(viewingReceipt.id);
                    setViewingReceipt(null);
                  }}
                  className="cyber-btn cyber-btn-cyan"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                >
                  {lang === 'es' ? 'Aprobar Depósito' : 'Approve Deposit'}
                </button>
              )}
              <button
                onClick={() => setViewingReceipt(null)}
                className="cyber-btn cyber-btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                {lang === 'es' ? 'Cerrar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECK-IN MODAL */}
      {checkingInBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(2, 4, 9, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '2rem'
        }}>
          <form onSubmit={handleCheckInSubmit} className="glass-panel" style={{ maxWidth: '450px', width: '100%', border: 'var(--border-neon-magenta)', boxShadow: 'var(--glow-magenta)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                {lang === 'es' ? 'Procesar Check-in FIFO' : 'Process FIFO Check-in'} ({checkingInBooking.id})
              </h3>
              <button
                type="button"
                onClick={() => setCheckingInBooking(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              <p style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                {lang === 'es' ? 'Huésped' : 'Guest'}: {checkingInBooking.customerName}
              </p>
              <p>
                {lang === 'es' ? 'Tipo de Alojamiento' : 'Accommodation Type'}: {checkingInBooking.accommodationId === 'capsule' 
                  ? (lang === 'es' ? 'Cápsula Individual (Pod)' : 'Single Sleep Pod') 
                  : checkingInBooking.accommodationId === 'private_room_bath' 
                    ? (lang === 'es' ? 'Cuarto con Baño Privado' : 'Room with Private Bath') 
                    : (lang === 'es' ? 'Cuarto sin Baño Privado' : 'Room without Private Bath')
                }
              </p>
              <p style={{ marginTop: '0.5rem' }}>
                {lang === 'es'
                  ? '*Las cápsulas se asignan al llegar el huésped (FIFO). Elige un número de cabina/cuarto libre para registrarlo operacionalmente.'
                  : '*Pods are assigned upon guest arrival (FIFO). Choose a free cabin/room number to register it operationally.'
                }
              </p>
            </div>

            <div className="cyber-form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="cyber-label">
                {lang === 'es' ? 'Número de Cabina física asignada' : 'Assigned physical Cabin number'}
              </label>
              <input
                type="number"
                min="1"
                max={checkingInBooking.accommodationId === 'capsule' ? 40 : 1}
                required
                placeholder={checkingInBooking.accommodationId === 'capsule' ? (lang === 'es' ? "Ej. 1-40" : "E.g. 1-40") : "Ej. 1"}
                value={assignedPodNumber}
                onChange={(e) => setAssignedPodNumber(e.target.value)}
                className="cyber-input"
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                {lang === 'es'
                  ? `Rango permitido: ${checkingInBooking.accommodationId === 'capsule' ? 'Cabina 1 a 40' : 'Habitación 1 (Cupo Único)'}`
                  : `Allowed range: ${checkingInBooking.accommodationId === 'capsule' ? 'Cabin 1 to 40' : 'Room 1 (Single Slot)'}`
                }
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={actionLoading}
                className="cyber-btn cyber-btn-cyan"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                {actionLoading 
                  ? (lang === 'es' ? 'Procesando...' : 'Processing...') 
                  : (lang === 'es' ? 'Asignar Cabina y Activar Check-In' : 'Assign Cabin & Activate Check-In')
                }
              </button>
              <button
                type="button"
                onClick={() => setCheckingInBooking(null)}
                className="cyber-btn cyber-btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                {t('admin_catalog_cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast Notification */}
      {toast.message && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'rgba(21, 26, 46, 0.95)',
          border: toast.type === 'success' ? '1px solid var(--color-cyan-neon)' : toast.type === 'error' ? '1px solid var(--color-magenta-neon)' : '1px solid var(--color-amber-gold)',
          boxShadow: toast.type === 'success' ? 'var(--glow-cyan)' : toast.type === 'error' ? 'var(--glow-magenta)' : 'var(--glow-gold)',
          color: '#ffffff',
          padding: '1rem 1.5rem',
          borderRadius: '10px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontFamily: 'var(--font-space-grotesk)',
          fontSize: '0.9rem',
          backdropFilter: 'blur(12px)',
          animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: toast.type === 'success' ? 'var(--color-cyan-neon)' : toast.type === 'error' ? 'var(--color-magenta-neon)' : 'var(--color-amber-gold)',
            display: 'inline-block'
          }} className="pulse-indicator"></span>
          {toast.message}
        </div>
      )}

    </div>
  );
}
