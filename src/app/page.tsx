'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, User, Mail, Phone, CreditCard, Send, Sparkles, Shield, Compass, CheckCircle, Upload, ArrowRight, Activity, Loader2 } from 'lucide-react';

interface AvailabilityData {
  products: {
    [id: string]: {
      id: string;
      name: string;
      basePrice: number;
      capacity: number;
      available: number;
      description: string;
    };
  };
  numberOfNights: number;
}

export default function Home() {
  // Dates state
  const getTodayString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const [checkIn, setCheckIn] = useState(getTodayString(1)); // Tomorrow
  const [checkOut, setCheckOut] = useState(getTodayString(2)); // Day after tomorrow
  
  // Availability & loading states
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [errorAvail, setErrorAvail] = useState('');

  // Selection state (stores product ID)
  const [selectedAcc, setSelectedAcc] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'transfer'>('paypal');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null);
  const [receiptMimeType, setReceiptMimeType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmation state
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | null }>({ message: '', type: null });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: null });
    }, 4000);
  };

  // Brand neon theme helpers
  const getProductColor = (id: string) => {
    if (id === 'capsule') return 'var(--color-cyan-neon)';
    if (id === 'private_room_no_bath') return 'var(--color-amber-gold)';
    return 'var(--color-magenta-neon)';
  };

  const getProductGlow = (id: string) => {
    if (id === 'capsule') return 'var(--glow-cyan-intense)';
    if (id === 'private_room_no_bath') return 'var(--glow-gold)';
    return 'var(--glow-magenta-intense)';
  };

  const getProductHoverClass = (id: string) => {
    if (id === 'capsule') return 'cyan-hover';
    if (id === 'private_room_no_bath') return 'amber-hover';
    return 'magenta-hover';
  };

  const getProductTextGlowClass = (id: string) => {
    if (id === 'capsule') return 'text-glow-cyan';
    if (id === 'private_room_no_bath') return 'text-glow-gold';
    return 'text-glow-magenta';
  };

  // Load availability when dates change
  useEffect(() => {
    fetchAvailability();
    setSelectedAcc(null); // Reset selection on date change
  }, [checkIn, checkOut]);

  const fetchAvailability = async () => {
    if (!checkIn || !checkOut) return;
    if (new Date(checkIn) >= new Date(checkOut)) {
      setErrorAvail('La fecha de check-in debe ser anterior a la de check-out.');
      setAvailability(null);
      return;
    }

    setLoadingAvail(true);
    setErrorAvail('');
    try {
      const res = await fetch(`/api/availability?checkIn=${checkIn}&checkOut=${checkOut}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al obtener la disponibilidad.');
      }
      setAvailability(data);
    } catch (err: any) {
      console.error(err);
      setErrorAvail(err.message);
      setAvailability(null);
    } finally {
      setLoadingAvail(false);
    }
  };

  // Convert receipt file to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const parts = reader.result.split(',');
          setReceiptBase64(parts[1]);
          setReceiptMimeType(file.type);
        }
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };
    }
  };

  // Form validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!fullName.trim()) errors.fullName = 'El nombre completo es requerido.';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errors.email = 'Introduce un email válido.';
    if (!phone.trim() || phone.length < 10) errors.phone = 'Introduce un número celular válido (mínimo 10 dígitos).';
    if (paymentMethod === 'transfer' && !receiptBase64) {
      errors.receipt = 'Debes subir tu comprobante de transferencia bancaria.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Book now handler (PayPal simulated checkout or Bank Transfer upload submission)
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedAcc || !availability) return;

    setIsSubmitting(true);
    try {
      let payload: any = {
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        accommodationId: selectedAcc,
        checkInStr: checkIn,
        checkOutStr: checkOut,
        paymentMethod,
        paymentStatus: paymentMethod === 'paypal' ? 'completed' : 'pending',
        receiptBase64: paymentMethod === 'transfer' ? receiptBase64 : null,
        receiptMimeType: paymentMethod === 'transfer' ? receiptMimeType : null,
      };

      if (paymentMethod === 'paypal') {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar tu reserva.');
      }

      setConfirmedBooking(data.booking);
      // Reset form fields
      setFullName('');
      setEmail('');
      setPhone('');
      setReceiptFile(null);
      setReceiptBase64(null);
      setReceiptMimeType(null);
    } catch (err: any) {
      showToast(err.message || 'Error al completar la reservación.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedPrice = () => {
    if (!selectedAcc || !availability) return 0;
    const item = availability.products[selectedAcc];
    if (!item) return 0;
    return item.basePrice * availability.numberOfNights;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Dynamic Header */}
      <header style={{
        borderBottom: 'var(--border-glass)',
        background: 'rgba(2, 4, 9, 0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '1rem 0'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img 
              src="/logo-hotel-capsula-condesa-horiz.webp" 
              alt="Cápsula Condesa Logo" 
              style={{ height: '44px', objectFit: 'contain' }}
            />
          </a>
          <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <a href="/" style={{ color: 'var(--color-cyan-neon)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Reservar</a>
            <a href="/admin" className="cyber-btn cyber-btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
              Admin Portal
            </a>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ flex: 1, padding: '3rem 1.5rem' }}>
        
        {/* HERO SECTION */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: '30px', background: 'rgba(0, 234, 255, 0.08)', border: 'var(--border-neon-cyan)', marginBottom: '1.5rem' }}>
            <Sparkles style={{ width: '14px', height: '14px', color: 'var(--color-cyan-neon)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-cyan-neon)', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="mono-text">
              La revolución del descanso en la CDMX
            </span>
          </div>
          <h2 style={{ fontSize: '3.5rem', fontWeight: 800, maxWidth: '900px', margin: '0 auto 1rem auto', lineHeight: 1.1 }}>
            Hospedaje de Próxima Generación en la <span className="text-glow-cyan">Condesa</span>
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Cabinas de descanso futuristas equipadas con climatización inteligente, aislamiento acústico y luz personalizable en la zona más emblemática de la Ciudad de México.
          </p>
        </div>

        {/* BOOKING INTERFACE */}
        {!confirmedBooking ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            
            {/* STEP 1: DATE SELECTOR & AVAILABILITY */}
            <section className="glass-panel" style={{ borderLeft: '3px solid var(--color-cyan-neon)' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ background: 'var(--color-cyan-neon)', color: '#020409', width: '26px', height: '26px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }} className="mono-text">1</span>
                Elige tus fechas y consulta disponibilidad
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="cyber-form-group">
                  <label className="cyber-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar style={{ width: '16px', height: '16px', color: 'var(--color-cyan-neon)' }} />
                    Fecha de Entrada (Check-In)
                  </label>
                  <input
                    type="date"
                    min={getTodayString()}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="cyber-input"
                  />
                </div>
                <div className="cyber-form-group">
                  <label className="cyber-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar style={{ width: '16px', height: '16px', color: 'var(--color-cyan-neon)' }} />
                    Fecha de Salida (Check-Out)
                  </label>
                  <input
                    type="date"
                    min={checkIn ? getTodayString(new Date(checkIn) > new Date() ? 1 : 2) : getTodayString(1)}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="cyber-input"
                  />
                </div>
              </div>

              {errorAvail && (
                <div style={{ color: 'var(--color-magenta-neon)', padding: '1rem', background: 'rgba(255, 0, 150, 0.05)', border: 'var(--border-neon-magenta)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  {errorAvail}
                </div>
              )}

              {loadingAvail ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: '1rem' }}>
                  <Loader2 className="pulse-indicator" style={{ width: '40px', height: '40px', color: 'var(--color-cyan-neon)', animation: 'spin 1.5s linear infinite' }} />
                  <p className="mono-text" style={{ fontSize: '0.85rem', color: 'var(--color-cyan-neon)' }}>Buscando cabinas disponibles...</p>
                  <style jsx global>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              ) : availability && availability.products ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    
                    {/* DYNAMIC ACCOMMODATION CARDS */}
                    {Object.values(availability.products)
                      .sort((a, b) => a.basePrice - b.basePrice)
                      .map((prod) => {
                        const isSelected = selectedAcc === prod.id;
                        const color = getProductColor(prod.id);
                        const glow = getProductGlow(prod.id);
                        const textGlowClass = getProductTextGlowClass(prod.id);
                        const isAvailable = prod.available > 0;

                        return (
                          <div 
                            key={prod.id}
                            className={`glass-panel interactive ${getProductHoverClass(prod.id)}`}
                            onClick={() => isAvailable && setSelectedAcc(prod.id)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              position: 'relative',
                              border: isSelected ? `2px solid ${color}` : 'var(--border-glass)',
                              boxShadow: isSelected ? glow : 'none',
                              opacity: isAvailable ? 1 : 0.6,
                              cursor: isAvailable ? 'pointer' : 'not-allowed',
                              transition: 'all 0.2s',
                              minHeight: '220px'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '1.2rem', paddingRight: '0.5rem' }}>{prod.name}</h4>
                                <div style={{ textAlign: 'right', minWidth: '90px' }}>
                                  <span style={{ fontSize: '1.4rem', fontWeight: 'bold' }} className={`price-display ${textGlowClass}`}>
                                    ${prod.basePrice}
                                  </span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', display: 'block' }}>MXN / Noche</span>
                                </div>
                              </div>
                              
                              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                                {prod.description}
                              </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Activity style={{ width: '16px', height: '16px', color: isAvailable ? color : 'var(--color-text-muted)' }} />
                                <span className="mono-text" style={{ fontSize: '0.75rem', fontWeight: 600, color: isAvailable ? color : 'var(--color-text-muted)' }}>
                                  {!isAvailable 
                                    ? 'SIN CUPO' 
                                    : `${prod.available} de ${prod.capacity} libres`}
                                </span>
                              </div>
                              
                              {isAvailable && (
                                <div 
                                  className="cyber-btn" 
                                  style={{ 
                                    padding: '0.35rem 0.85rem', 
                                    fontSize: '0.75rem',
                                    background: isSelected ? color : 'rgba(7, 11, 25, 0.5)',
                                    color: isSelected ? '#020409' : color,
                                    border: isSelected ? 'none' : `1px solid ${color}`,
                                    boxShadow: isSelected ? glow : 'none'
                                  }}
                                >
                                  {isSelected ? 'Seleccionado' : 'Seleccionar'}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    }

                  </div>
                </div>
              ) : null}
            </section>

            {/* STEP 2 & 3: FORM & PAYMENT (Only shows if accommodation selected) */}
            {selectedAcc && availability && availability.products[selectedAcc] && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                
                {/* CONTACT DETAILS */}
                <section className="glass-panel" style={{ borderLeft: '3px solid var(--color-amber-gold)' }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ background: 'var(--color-amber-gold)', color: '#020409', width: '26px', height: '26px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }} className="mono-text">2</span>
                    Tus Datos de Contacto
                  </h3>

                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="cyber-form-group">
                      <label className="cyber-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User style={{ width: '14px', height: '14px', color: 'var(--color-amber-gold)' }} />
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Juan Pérez López"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`cyber-input ${formErrors.fullName ? 'error' : ''}`}
                      />
                      {formErrors.fullName && <span className="error-text">{formErrors.fullName}</span>}
                    </div>

                    <div className="cyber-form-group">
                      <label className="cyber-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail style={{ width: '14px', height: '14px', color: 'var(--color-amber-gold)' }} />
                        Email de Contacto
                      </label>
                      <input
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`cyber-input ${formErrors.email ? 'error' : ''}`}
                      />
                      {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                    </div>

                    <div className="cyber-form-group">
                      <label className="cyber-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone style={{ width: '14px', height: '14px', color: 'var(--color-amber-gold)' }} />
                        Celular (WhatsApp)
                      </label>
                      <input
                        type="tel"
                        placeholder="5512345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`cyber-input ${formErrors.phone ? 'error' : ''}`}
                      />
                      {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                    </div>
                  </form>
                </section>

                {/* PAYMENT & SUMMARY */}
                <section className="glass-panel" style={{ borderLeft: '3px solid var(--color-blue-electric)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ background: 'var(--color-blue-electric)', color: '#ffffff', width: '26px', height: '26px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }} className="mono-text">3</span>
                      Método de Pago
                    </h3>

                    {/* Resumen de Cotización */}
                    <div style={{
                      background: 'rgba(7, 11, 25, 0.6)',
                      borderRadius: '8px',
                      padding: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        <span>Alojamiento:</span>
                        <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                          {availability.products[selectedAcc].name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        <span>Noches:</span>
                        <span style={{ color: 'var(--color-text-primary)' }} className="mono-text">
                          {availability.numberOfNights} noches
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                        <span style={{ fontWeight: 600 }}>Total Cotizado:</span>
                        <span style={{ fontWeight: 'bold', color: getProductColor(selectedAcc) }} className="mono-text price-display">
                          ${getSelectedPrice()} MXN
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Shield style={{ width: '12px', height: '12px' }} />
                        Cupo bloqueado temporalmente por 10 min en checkout.
                      </div>
                    </div>

                    {/* Selector de Pago */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('paypal')}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          borderRadius: '8px',
                          border: paymentMethod === 'paypal' ? `1px solid ${getProductColor(selectedAcc)}` : 'var(--border-glass)',
                          background: paymentMethod === 'paypal' ? `${getProductColor(selectedAcc)}1a` : 'rgba(7, 11, 25, 0.4)',
                          color: paymentMethod === 'paypal' ? getProductColor(selectedAcc) : 'var(--color-text-secondary)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-space-grotesk)',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <CreditCard style={{ width: '16px', height: '16px' }} />
                        PayPal
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('transfer')}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          borderRadius: '8px',
                          border: paymentMethod === 'transfer' ? `1px solid ${getProductColor(selectedAcc)}` : 'var(--border-glass)',
                          background: paymentMethod === 'transfer' ? `${getProductColor(selectedAcc)}1a` : 'rgba(7, 11, 25, 0.4)',
                          color: paymentMethod === 'transfer' ? getProductColor(selectedAcc) : 'var(--color-text-secondary)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-space-grotesk)',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Send style={{ width: '16px', height: '16px' }} />
                        Transferencia
                      </button>
                    </div>

                    {/* Contenido según método de pago */}
                    {paymentMethod === 'paypal' ? (
                      <div style={{ background: 'rgba(7,11,25,0.4)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '1.5rem', fontSize: '0.85rem', lineHeight: 1.4, color: 'var(--color-text-secondary)' }}>
                        <p style={{ marginBottom: '0.5rem' }}>Al hacer clic en pagar, abrirás el checkout seguro de PayPal.</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>*Nota: Este es un entorno Sandbox seguro para demostración.</p>
                      </div>
                    ) : (
                      <div style={{ background: 'rgba(7,11,25,0.4)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '1.5rem', fontSize: '0.8rem', lineHeight: 1.4 }}>
                        <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Datos para Transferencia:</p>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Banco: <span style={{ color: 'var(--color-text-primary)' }}>STP / BBVA</span></p>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Beneficiario: <span style={{ color: 'var(--color-text-primary)' }}>Cápsula Condesa SA de CV</span></p>
                        <p style={{ color: 'var(--color-text-secondary)' }}>CLABE: <span style={{ color: 'var(--color-cyan-neon)' }} className="mono-text">0121 8001 2345 6789 01</span></p>
                        
                        <div className="cyber-form-group" style={{ marginTop: '1rem' }}>
                          <label className="cyber-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                            <Upload style={{ width: '14px', height: '14px', color: 'var(--color-cyan-neon)' }} />
                            Sube tu comprobante (PNG/JPG/PDF)
                          </label>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            id="file-receipt"
                          />
                          <label htmlFor="file-receipt" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.6rem',
                            border: '1px dashed var(--color-text-muted)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: receiptFile ? 'var(--color-cyan-neon)' : 'var(--color-text-secondary)',
                            background: 'rgba(2, 4, 9, 0.4)',
                            transition: 'all 0.2s',
                            textAlign: 'center',
                            fontSize: '0.8rem'
                          }}>
                            {receiptFile ? `Archivo: ${receiptFile.name.substring(0, 20)}...` : 'Haga clic para buscar archivo'}
                          </label>
                          {formErrors.receipt && <span className="error-text">{formErrors.receipt}</span>}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={isSubmitting || !fullName || !email || !phone}
                    className="cyber-btn"
                    style={{ 
                      width: '100%', 
                      marginTop: '1rem',
                      background: getProductColor(selectedAcc),
                      color: selectedAcc === 'private_room_no_bath' ? 'var(--color-black-midnight)' : '#ffffff',
                      boxShadow: getProductGlow(selectedAcc)
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="pulse-indicator" style={{ width: '16px', height: '16px', marginRight: '0.5rem', animation: 'spin 1.5s linear infinite' }} />
                        Procesando Reservación...
                      </>
                    ) : (
                      <>
                        {paymentMethod === 'paypal' ? 'Proceder al Pago con PayPal' : 'Enviar Comprobante y Confirmar'}
                        <ArrowRight style={{ width: '16px', height: '16px', marginLeft: '0.5rem' }} />
                      </>
                    )}
                  </button>
                </section>

              </div>
            )}

          </div>
        ) : (
          
          /* BOOKING CONFIRMED SCREEN */
          <div className="glass-panel" style={{
            maxWidth: '600px',
            margin: '0 auto',
            border: `2px solid ${getProductColor(confirmedBooking.accommodationId)}`,
            boxShadow: getProductGlow(confirmedBooking.accommodationId),
            padding: '2.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: `${getProductColor(confirmedBooking.accommodationId)}1a`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              border: `1px solid ${getProductColor(confirmedBooking.accommodationId)}`
            }}>
              <CheckCircle style={{
                width: '40px',
                height: '40px',
                color: getProductColor(confirmedBooking.accommodationId)
              }} className="pulse-indicator" />
            </div>

            <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
              {confirmedBooking.paymentStatus === 'completed' ? '¡Reserva Confirmada!' : '¡Reserva Registrada!'}
            </h3>
            
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.5 }}>
              {confirmedBooking.paymentStatus === 'completed' 
                ? 'Hemos recibido tu pago de forma segura mediante PayPal. Tu código de reserva se encuentra activo y listo para tu llegada.'
                : 'Hemos registrado tu reservación y comprobante de transferencia bancaria. Tu código está bloqueado de forma segura mientras nuestro equipo valida el depósito en recepción.'
              }
            </p>

            <div style={{
              background: 'rgba(7, 11, 25, 0.8)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Código de Reserva:</span>
                <span className="booking-code text-glow-cyan" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {confirmedBooking.id}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Huésped:</span>
                <span style={{ fontWeight: 600 }}>{confirmedBooking.customerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Alojamiento:</span>
                <span>
                  {confirmedBooking.accommodationId === 'capsule' 
                    ? 'Cápsula Individual (Pod)' 
                    : confirmedBooking.accommodationId === 'private_room_bath' 
                      ? 'Cuarto con Baño Privado' 
                      : 'Cuarto sin Baño Privado'
                  }
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Check-in:</span>
                <span className="mono-text">{new Date(confirmedBooking.checkIn).toLocaleDateString('es-MX', { timeZone: 'UTC' })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Check-out:</span>
                <span className="mono-text">{new Date(confirmedBooking.checkOut).toLocaleDateString('es-MX', { timeZone: 'UTC' })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem', marginTop: '0.75rem', fontWeight: 'bold' }}>
                <span>Monto Total:</span>
                <span className="price-display" style={{ color: getProductColor(confirmedBooking.accommodationId) }}>
                  ${confirmedBooking.totalPrice} MXN
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => setConfirmedBooking(null)}
                className="cyber-btn cyber-btn-cyan"
                style={{ width: '100%' }}
              >
                Volver a la Página Principal
              </button>
              <a
                href={`https://wa.me/525512345678?text=Hola,%20tengo%20una%20reserva%20con%20código%20${confirmedBooking.id}.`}
                target="_blank"
                rel="noreferrer"
                className="cyber-btn cyber-btn-outline"
                style={{ width: '100%', borderColor: '#25D366', color: '#25D366' }}
              >
                Preguntas por WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* HOTEL INFORMATION SECTION */}
        <section style={{ marginTop: '5rem' }}>
          <h3 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '2.5rem' }}>
            Servicios Incluidos en tu Cabina
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-panel">
              <span className="text-glow-cyan" style={{ display: 'block', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🛸 Climatización Privada</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>Cada cápsula cuenta con extractores silenciosos y flujo de aire independiente para mantener la temperatura óptima.</p>
            </div>
            <div className="glass-panel">
              <span className="text-glow-magenta" style={{ display: 'block', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>⚡ Puertos Cyber-Carga</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>Puertos USB, conectores universales y carga inalámbrica de alta velocidad justo al lado de tu colchón.</p>
            </div>
            <div className="glass-panel">
              <span className="text-glow-gold" style={{ display: 'block', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>☕ Coworking Premium</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>Acceso gratuito a nuestra área de coworking con café y té ilimitado, Wi-Fi simétrico y cabinas de llamadas acústicas.</p>
            </div>
            <div className="glass-panel">
              <span className="text-glow-cyan" style={{ display: 'block', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🔐 Seguridad Encriptada</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>Lockers con cerraduras digitales de alta seguridad y cámaras de videovigilancia 24/7 en pasillos principales.</p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{
        background: '#020409',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '2rem 0',
        marginTop: '5rem',
        fontSize: '0.85rem',
        color: 'var(--color-text-secondary)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p>© 2026 Cápsula Condesa. Todos los derechos reservados.</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Ubicación: Av. Insurgentes Sur, Colonia Condesa, CDMX.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="https://hotelcapsulacondesa.com/?page_id=40" target="_blank" rel="noreferrer" style={{ color: 'var(--color-cyan-neon)', textDecoration: 'none' }}>
              Sitio Oficial del Hotel
            </a>
          </div>
        </div>
      </footer>

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
