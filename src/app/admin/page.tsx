'use client';

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, Users, Settings, Search, DollarSign, Activity, Check, X, Eye, Key, Loader2, Sparkles, LogOut } from 'lucide-react';

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
    fetchAdminData();
  }, []);

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
    if (!confirm('¿Estás seguro de confirmar el pago de esta reserva?')) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, action: 'confirm_payment' }),
      });
      if (res.ok) {
        showToast('Pago confirmado correctamente y reserva activa.', 'success');
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
    if (!confirm('¿Estás seguro de cancelar esta reserva? Liberará la disponibilidad inmediatamente.')) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, action: 'cancel' }),
      });
      if (res.ok) {
        showToast('Reserva cancelada con éxito.', 'info');
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
        showToast(`Check-in exitoso. Cabina #${assignedPodNumber} asignada.`, 'success');
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
      showToast('Por favor introduce un precio numérico válido.', 'error');
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
        showToast('Tarifa actualizada correctamente en el catálogo.', 'success');
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
                Command Desk
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="/" className="cyber-btn cyber-btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
              Ver Portal Cliente
            </a>
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
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`cyber-btn ${activeTab === 'bookings' ? 'cyber-btn-cyan' : 'cyber-btn-outline'}`}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <Calendar style={{ width: '16px', height: '16px' }} />
            Reservas
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
            Clientes Frecuentes
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`cyber-btn ${activeTab === 'catalog' ? 'cyber-btn-cyan' : 'cyber-btn-outline'}`}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <Settings style={{ width: '16px', height: '16px' }} />
            Tarifas Catálogo
          </button>

          <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="glass-panel" style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }} className="mono-text">ESTADO DB:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-cyan-neon)', marginTop: '0.25rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-cyan-neon)', display: 'inline-block' }} className="pulse-indicator"></span>
                Cloud SQL Online (SQLite Local)
              </div>
            </div>
          </div>
        </aside>

        {/* Content Box */}
        <main style={{ minWidth: 0 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', gap: '1rem' }}>
              <Loader2 className="pulse-indicator" style={{ width: '40px', height: '40px', color: 'var(--color-magenta-neon)', animation: 'spin 1.5s linear infinite' }} />
              <p className="mono-text" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Cargando datos administrativos...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: DASHBOARD METRICS */}
              {activeTab === 'dashboard' && stats && (
                <div>
                  {/* Headline cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                    <div className="glass-panel" style={{ borderBottom: '2px solid var(--color-cyan-neon)' }}>
                      <span className="cyber-label" style={{ fontSize: '0.7rem' }}>Ingresos Confirmados</span>
                      <h4 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }} className="mono-text text-glow-cyan">
                        ${stats.summary.totalRevenue.toLocaleString()} MXN
                      </h4>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Total acumulado pagado</p>
                    </div>
                    <div className="glass-panel" style={{ borderBottom: '2px solid var(--color-magenta-neon)' }}>
                      <span className="cyber-label" style={{ fontSize: '0.7rem' }}>Reservas Confirmadas</span>
                      <h4 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }} className="mono-text text-glow-magenta">
                        {stats.summary.confirmedBookings}
                      </h4>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Cápulas/Cuartos pagados</p>
                    </div>
                    <div className="glass-panel" style={{ borderBottom: '2px solid var(--color-amber-gold)' }}>
                      <span className="cyber-label" style={{ fontSize: '0.7rem' }}>Por Verificar (Transf.)</span>
                      <h4 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }} className="mono-text text-glow-gold">
                        {stats.summary.pendingBookings}
                      </h4>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Bloqueos pendientes de pago</p>
                    </div>
                    <div className="glass-panel" style={{ borderBottom: '2px solid var(--color-blue-electric)' }}>
                      <span className="cyber-label" style={{ fontSize: '0.7rem' }}>Clientes Únicos</span>
                      <h4 className="mono-text" style={{ fontSize: '1.75rem', marginTop: '0.25rem', color: 'var(--color-blue-electric)' }}>
                        {stats.allCustomers.length}
                      </h4>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Base de datos CRM</p>
                    </div>
                  </div>

                  {/* Monthly charts using SVGs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    
                    {/* SVG Chart: Occupancy Rate */}
                    <div className="glass-panel">
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Tasa de Ocupación Mensual (%)</h3>
                      {stats.monthlyReport.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '3rem 0' }}>Sin datos de ocupación aún.</p>
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
                          <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>Calculado en base a 42 unidades totales.</p>
                        </div>
                      )}
                    </div>

                    {/* SVG Chart: Monthly Revenue */}
                    <div className="glass-panel">
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Ingresos Mensuales (MXN)</h3>
                      {stats.monthlyReport.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '3rem 0' }}>Sin datos de ingresos aún.</p>
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
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Días de Mayor Demanda (Check-in)</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '120px', padding: '0 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        {stats.demandByDay.map((d, i) => {
                          const maxCount = Math.max(...stats.demandByDay.map(x => x.count), 1);
                          const pct = (d.count / maxCount) * 85; // cap height at 85%
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
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{d.day}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stats Distribution */}
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h3 style={{ fontSize: '1.1rem' }}>Distribución de Métodos y Alojamiento</h3>
                      
                      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                          <span>Métodos de Pago:</span>
                          <span style={{ color: 'var(--color-text-primary)' }}>
                            PayPal: <span className="mono-text text-glow-cyan">{stats.paymentMethods.paypal}</span> | 
                            Transf: <span className="mono-text text-glow-gold">{stats.paymentMethods.transfer}</span>
                          </span>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                          <span>Preferencias de Cabina:</span>
                          <span style={{ color: 'var(--color-text-primary)' }}>
                            Cápsulas: <span className="mono-text text-glow-cyan">{stats.accommodationDistribution.capsule}</span> | 
                            Cuartos: <span className="mono-text text-glow-magenta">{stats.accommodationDistribution.privateRoom}</span>
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
                        placeholder="Buscar por código, huésped, email, celular..."
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
                        <option value="all">Todos los Estados</option>
                        <option value="pending">Por Verificar Pago</option>
                        <option value="confirmed">Confirmados (Por Check-in)</option>
                        <option value="checked_in">Check-in Realizado</option>
                        <option value="cancelled">Cancelados</option>
                      </select>
                    </div>
                  </div>

                  {/* Bookings Table */}
                  <div className="cyber-table-container">
                    <table className="cyber-table">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Huésped</th>
                          <th>Fechas</th>
                          <th>Alojamiento</th>
                          <th>Cabina</th>
                          <th>Pago</th>
                          <th>Monto</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.length === 0 ? (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem' }}>
                              No se encontraron reservaciones que coincidan con los filtros.
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
                                  {new Date(b.checkIn).toLocaleDateString('es-MX', { timeZone: 'UTC' })} ➜ <br/>
                                  {new Date(b.checkOut).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
                                </td>
                                <td style={{ fontSize: '0.8rem' }}>
                                  {b.accommodationId === 'capsule' ? (
                                    <span className="badge badge-cyan">Cápsula</span>
                                  ) : b.accommodationId === 'private_room_bath' ? (
                                    <span className="badge badge-magenta">Cuarto c/Baño</span>
                                  ) : (
                                    <span className="badge badge-gold">Cuarto s/Baño</span>
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
                                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>Completo ({b.paymentMethod})</span>
                                  ) : (
                                    <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>Pendiente ({b.paymentMethod})</span>
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
                                        title="Ver comprobante bancario"
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
                                        title="Confirmar recepción de transferencia"
                                      >
                                        <Check style={{ width: '12px', height: '12px' }} /> Confirmar
                                      </button>
                                    )}

                                    {/* Check-In button */}
                                    {isConfirmedNoCheckin && (
                                      <button
                                        onClick={() => setCheckingInBooking(b)}
                                        className="cyber-btn"
                                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem', background: 'var(--color-amber-gold)', color: '#020409' }}
                                        title="Hacer check-in y asignar cabina física"
                                      >
                                        <Key style={{ width: '12px', height: '12px' }} /> Check-in
                                      </button>
                                    )}

                                    {/* Checked In status label */}
                                    {isCheckedIn && (
                                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center' }}>
                                        Activo en Pod
                                      </span>
                                    )}

                                    {/* Cancel button */}
                                    {b.status !== 'cancelled' && (
                                      <button
                                        onClick={() => handleCancelBooking(b.id)}
                                        className="cyber-btn"
                                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem', background: 'rgba(255,0,150,0.1)', color: 'var(--color-magenta-neon)', border: '1px solid var(--color-magenta-neon)' }}
                                        title="Cancelar Reservación"
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
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Base de Clientes Frecuentes (CRM de Fidelidad)</h3>
                  
                  <div className="cyber-table-container">
                    <table className="cyber-table">
                      <thead>
                        <tr>
                          <th>Nombre Huésped</th>
                          <th>WhatsApp Mobile</th>
                          <th>Email</th>
                          <th>Visitas Realizadas</th>
                          <th>Monto Total Pagado</th>
                          <th>Último Check-In</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.allCustomers.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem' }}>
                              No hay registros de clientes en la base de datos.
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
                                {new Date(c.lastBookingDate).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
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
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Configuración de Catálogo de Precios</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {catalog.map((item) => (
                      <div key={item.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <h4 style={{ fontSize: '1.2rem' }}>{item.name}</h4>
                            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--color-text-secondary)' }} className="mono-text">
                              ID: {item.id}
                            </span>
                          </div>
                          
                          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                            {item.description}
                          </p>

                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Capacidad del Hotel</span>
                              <p style={{ fontWeight: 'bold' }} className="mono-text">{item.capacity} {item.id === 'capsule' ? 'pods' : 'cuartos'}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Tarifa Actual</span>
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
                              placeholder="Nueva tarifa"
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
                              Guardar
                            </button>
                            <button
                              onClick={() => { setUpdatingCatalogId(null); setNewPriceValue(''); }}
                              className="cyber-btn cyber-btn-outline"
                              style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setUpdatingCatalogId(item.id); setNewPriceValue(item.basePrice.toString()); }}
                            className="cyber-btn cyber-btn-outline"
                            style={{ width: '100%', borderColor: item.id === 'capsule' ? 'var(--color-cyan-neon)' : 'var(--color-magenta-neon)', color: item.id === 'capsule' ? 'var(--color-cyan-neon)' : 'var(--color-magenta-neon)' }}
                          >
                            Modificar Tarifa
                          </button>
                        )}
                      </div>
                    ))}
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
              <h3 style={{ fontSize: '1.25rem' }}>Comprobante de Pago ({viewingReceipt.id})</h3>
              <button
                onClick={() => setViewingReceipt(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
            
            {viewingReceipt.receiptMimeType === 'application/pdf' ? (
              <div style={{ padding: '2rem 1rem', background: 'rgba(7,11,25,0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>El comprobante es un archivo PDF.</p>
                <a
                  href={`data:${viewingReceipt.receiptMimeType};base64,${viewingReceipt.receiptBase64}`}
                  download={`comprobante-${viewingReceipt.id}.pdf`}
                  className="cyber-btn cyber-btn-cyan"
                  style={{ fontSize: '0.8rem' }}
                >
                  Descargar Comprobante PDF
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
                  Aprobar Depósito
                </button>
              )}
              <button
                onClick={() => setViewingReceipt(null)}
                className="cyber-btn cyber-btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                Cerrar
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
              <h3 style={{ fontSize: '1.25rem' }}>Procesar Check-in FIFO ({checkingInBooking.id})</h3>
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
                Huésped: {checkingInBooking.customerName}
              </p>
              <p>Tipo de Alojamiento: {checkingInBooking.accommodationId === 'capsule' ? 'Cápsula Individual (Pod)' : checkingInBooking.accommodationId === 'private_room_bath' ? 'Cuarto con Baño Privado' : 'Cuarto sin Baño Privado'}</p>
              <p style={{ marginTop: '0.5rem' }}>
                *Las cápsulas se asignan al llegar el huésped (FIFO). Elige un número de cabina/cuarto libre para registrarlo operacionalmente.
              </p>
            </div>

            <div className="cyber-form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="cyber-label">
                Número de Cabina física asignada
              </label>
              <input
                type="number"
                min="1"
                max={checkingInBooking.accommodationId === 'capsule' ? 40 : 1}
                required
                placeholder={checkingInBooking.accommodationId === 'capsule' ? "Ej. 1-40" : "Ej. 1"}
                value={assignedPodNumber}
                onChange={(e) => setAssignedPodNumber(e.target.value)}
                className="cyber-input"
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                Rango permitido: {checkingInBooking.accommodationId === 'capsule' ? 'Cabina 1 a 40' : 'Habitación 1 (Cupo Único)'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={actionLoading}
                className="cyber-btn cyber-btn-cyan"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                {actionLoading ? 'Procesando...' : 'Asignar Cabina y Activar Check-In'}
              </button>
              <button
                type="button"
                onClick={() => setCheckingInBooking(null)}
                className="cyber-btn cyber-btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                Cancelar
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
