export interface Dictionary {
  // Client Portal
  hero_badge: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_subtitle: string;
  step_1_title: string;
  check_in_label: string;
  check_out_label: string;
  date_error: string;
  loading_avail: string;
  no_vacancy: string;
  free_units: string;
  selected: string;
  select: string;
  step_2_title: string;
  full_name: string;
  full_name_placeholder: string;
  full_name_error: string;
  email_label: string;
  email_placeholder: string;
  email_error: string;
  phone_label: string;
  phone_placeholder: string;
  phone_error: string;
  step_3_title: string;
  summary_accommodation: string;
  summary_nights: string;
  summary_nights_unit: string;
  summary_total: string;
  summary_footnote: string;
  payment_paypal_desc: string;
  payment_paypal_footnote: string;
  payment_transfer_title: string;
  payment_transfer_bank: string;
  payment_transfer_beneficiary: string;
  payment_transfer_clabe: string;
  payment_transfer_upload: string;
  payment_transfer_search: string;
  payment_transfer_file: string;
  payment_transfer_error: string;
  btn_pay_paypal: string;
  btn_confirm_transfer: string;
  submitting_booking: string;
  confirm_title_completed: string;
  confirm_title_pending: string;
  confirm_desc_completed: string;
  confirm_desc_pending: string;
  confirm_code: string;
  confirm_guest: string;
  confirm_accommodation: string;
  confirm_check_in: string;
  confirm_check_out: string;
  confirm_total: string;
  btn_back_home: string;
  btn_whatsapp_help: string;
  services_title: string;
  service_1_title: string;
  service_1_desc: string;
  service_2_title: string;
  service_2_desc: string;
  service_3_title: string;
  service_3_desc: string;
  service_4_title: string;
  service_4_desc: string;
  footer_copy: string;
  footer_location: string;
  footer_official: string;

  // Admin Portal
  admin_title: string;
  admin_subtitle: string;
  admin_btn_client: string;
  admin_tab_dashboard: string;
  admin_tab_bookings: string;
  admin_tab_customers: string;
  admin_tab_catalog: string;
  admin_db_status: string;
  admin_db_status_online: string;
  admin_loading: string;
  admin_metric_revenue: string;
  admin_metric_revenue_sub: string;
  admin_metric_confirmed: string;
  admin_metric_confirmed_sub: string;
  admin_metric_pending: string;
  admin_metric_pending_sub: string;
  admin_metric_customers: string;
  admin_metric_customers_sub: string;
  admin_chart_occupancy: string;
  admin_chart_occupancy_empty: string;
  admin_chart_occupancy_footnote: string;
  admin_chart_revenue: string;
  admin_chart_revenue_empty: string;
  admin_chart_demand: string;
  admin_chart_distribution: string;
  admin_distribution_methods: string;
  admin_distribution_preferences: string;
  admin_search_placeholder: string;
  admin_filter_all: string;
  admin_filter_pending: string;
  admin_filter_confirmed: string;
  admin_filter_checked_in: string;
  admin_filter_cancelled: string;
  admin_table_code: string;
  admin_table_guest: string;
  admin_table_dates: string;
  admin_table_accommodation: string;
  admin_table_pod: string;
  admin_table_payment: string;
  admin_table_amount: string;
  admin_table_actions: string;
  admin_table_empty: string;
  admin_badge_capsule: string;
  admin_badge_room_bath: string;
  admin_badge_room_no_bath: string;
  admin_badge_payment_completed: string;
  admin_badge_payment_pending: string;
  admin_action_confirm: string;
  admin_action_checkin: string;
  admin_action_active: string;
  admin_crm_title: string;
  admin_crm_name: string;
  admin_crm_phone: string;
  admin_crm_email: string;
  admin_crm_visits: string;
  admin_crm_spent: string;
  admin_crm_last_checkin: string;
  admin_crm_empty: string;
  admin_catalog_title: string;
  admin_catalog_id: string;
  admin_catalog_capacity: string;
  admin_catalog_pods: string;
  admin_catalog_rooms: string;
  admin_catalog_rate: string;
  admin_catalog_edit: string;
  admin_catalog_save: string;
  admin_catalog_cancel: string;
  admin_catalog_placeholder: string;
  admin_catalog_validation_error: string;
  admin_logout: string;

  // Login page
  login_title: string;
  login_subtitle: string;
  login_username: string;
  login_password: string;
  login_btn: string;
  login_error: string;
  login_loading: string;
}

export const translations: { es: Dictionary; en: Dictionary } = {
  es: {
    hero_badge: "La revolución del descanso en la CDMX",
    hero_title_1: "Hospedaje de Próxima Generación en la ",
    hero_title_2: "Condesa",
    hero_subtitle: "Cabinas de descanso futuristas equipadas con climatización inteligente, aislamiento acústico y luz personalizable en la zona más emblemática de la Ciudad de México.",
    step_1_title: "Elige tus fechas y consulta disponibilidad",
    check_in_label: "Fecha de Entrada (Check-In)",
    check_out_label: "Fecha de Salida (Check-Out)",
    date_error: "La fecha de check-in debe ser anterior a la de check-out.",
    loading_avail: "Buscando cabinas disponibles...",
    no_vacancy: "SIN CUPO",
    free_units: "{available} de {capacity} libres",
    selected: "Seleccionado",
    select: "Seleccionar",
    step_2_title: "Tus Datos de Contacto",
    full_name: "Nombre Completo",
    full_name_placeholder: "Ej. Juan Pérez López",
    full_name_error: "El nombre completo es requerido.",
    email_label: "Email de Contacto",
    email_placeholder: "ejemplo@correo.com",
    email_error: "Introduce un email válido.",
    phone_label: "Celular (WhatsApp)",
    phone_placeholder: "5512345678",
    phone_error: "Introduce un número celular válido (mínimo 10 dígitos).",
    step_3_title: "Método de Pago",
    summary_accommodation: "Alojamiento:",
    summary_nights: "Noches:",
    summary_nights_unit: "noches",
    summary_total: "Total Cotizado:",
    summary_footnote: "Cupo bloqueado temporalmente por 10 min en checkout.",
    payment_paypal_desc: "Al hacer clic en pagar, abrirás el checkout seguro de PayPal.",
    payment_paypal_footnote: "*Nota: Este es un entorno Sandbox seguro para demostración.",
    payment_transfer_title: "Datos para Transferencia:",
    payment_transfer_bank: "Banco: STP / BBVA",
    payment_transfer_beneficiary: "Beneficiario: Cápsula Condesa SA de CV",
    payment_transfer_clabe: "CLABE: 0121 8001 2345 6789 01",
    payment_transfer_upload: "Sube tu comprobante (PNG/JPG/PDF)",
    payment_transfer_search: "Haga clic para buscar archivo",
    payment_transfer_file: "Archivo: {name}",
    payment_transfer_error: "Debes subir tu comprobante de transferencia bancaria.",
    btn_pay_paypal: "Proceder al Pago con PayPal",
    btn_confirm_transfer: "Enviar Comprobante y Confirmar",
    submitting_booking: "Procesando Reservación...",
    confirm_title_completed: "¡Reserva Confirmada!",
    confirm_title_pending: "¡Reserva Registrada!",
    confirm_desc_completed: "Hemos recibido tu pago de forma segura mediante PayPal. Tu código de reserva se encuentra activo y listo para tu llegada.",
    confirm_desc_pending: "Hemos registrado tu reservación y comprobante de transferencia bancaria. Tu código está bloqueado de forma segura mientras nuestro equipo valida el depósito en recepción.",
    confirm_code: "Código de Reserva:",
    confirm_guest: "Huésped:",
    confirm_accommodation: "Alojamiento:",
    confirm_check_in: "Check-in:",
    confirm_check_out: "Check-out:",
    confirm_total: "Monto Total:",
    btn_back_home: "Volver a la Página Principal",
    btn_whatsapp_help: "Preguntas por WhatsApp",
    services_title: "Servicios Incluidos en tu Cabina",
    service_1_title: "🛸 Climatización Privada",
    service_1_desc: "Cada cápsula cuenta con extractores silenciosos y flujo de aire independiente para mantener la temperatura óptima.",
    service_2_title: "⚡ Puertos Cyber-Carga",
    service_2_desc: "Puertos USB, conectores universales y carga inalámbrica de alta velocidad justo al lado de tu colchón.",
    service_3_title: "☕ Coworking Premium",
    service_3_desc: "Acceso gratuito a nuestra área de coworking con café y té ilimitado, Wi-Fi simétrico y cabinas de llamadas acústicas.",
    service_4_title: "🔐 Seguridad Encriptada",
    service_4_desc: "Lockers con cerraduras digitales de alta seguridad y cámaras de videovigilancia 24/7 en pasillos principales.",
    footer_copy: "© 2026 Cápsula Condesa. Todos los derechos reservados.",
    footer_location: "Ubicación: Av. Insurgentes Sur, Colonia Condesa, CDMX.",
    footer_official: "Sitio Oficial del Hotel",

    admin_title: "IA BOOKING CENTRAL",
    admin_subtitle: "Command Desk",
    admin_btn_client: "Ver Portal Cliente",
    admin_tab_dashboard: "Dashboard",
    admin_tab_bookings: "Reservas",
    admin_tab_customers: "Clientes Frecuentes",
    admin_tab_catalog: "Tarifas Catálogo",
    admin_db_status: "ESTADO DB:",
    admin_db_status_online: "Cloud SQL Online (SQLite Local)",
    admin_loading: "Cargando datos administrativos...",
    admin_metric_revenue: "Ingresos Confirmados",
    admin_metric_revenue_sub: "Total acumulado pagado",
    admin_metric_confirmed: "Reservas Confirmadas",
    admin_metric_confirmed_sub: "Cápsulas/Cuartos pagados",
    admin_metric_pending: "Por Verificar (Transf.)",
    admin_metric_pending_sub: "Bloqueos pendientes de pago",
    admin_metric_customers: "Clientes Únicos",
    admin_metric_customers_sub: "Base de datos CRM",
    admin_chart_occupancy: "Tasa de Ocupación Mensual (%)",
    admin_chart_occupancy_empty: "Sin datos de ocupación aún.",
    admin_chart_occupancy_footnote: "Calculado en base a 42 unidades totales.",
    admin_chart_revenue: "Ingresos Mensuales (MXN)",
    admin_chart_revenue_empty: "Sin datos de ingresos aún.",
    admin_chart_demand: "Días de Mayor Demanda (Check-in)",
    admin_chart_distribution: "Distribución de Métodos y Alojamiento",
    admin_distribution_methods: "Métodos de Pago:",
    admin_distribution_preferences: "Preferencias de Cabina:",
    admin_search_placeholder: "Buscar por código, huésped, email, celular...",
    admin_filter_all: "Todos los Estados",
    admin_filter_pending: "Por Verificar Pago",
    admin_filter_confirmed: "Confirmados (Por Check-in)",
    admin_filter_checked_in: "Check-in Realizado",
    admin_filter_cancelled: "Cancelados",
    admin_table_code: "Código",
    admin_table_guest: "Huésped",
    admin_table_dates: "Fechas",
    admin_table_accommodation: "Alojamiento",
    admin_table_pod: "Cabina",
    admin_table_payment: "Pago",
    admin_table_amount: "Monto",
    admin_table_actions: "Acciones",
    admin_table_empty: "No se encontraron reservaciones que coincidan con los filtros.",
    admin_badge_capsule: "Cápsula",
    admin_badge_room_bath: "Cuarto c/Baño",
    admin_badge_room_no_bath: "Cuarto s/Baño",
    admin_badge_payment_completed: "Completo",
    admin_badge_payment_pending: "Pendiente",
    admin_action_confirm: "Confirmar",
    admin_action_checkin: "Check-in",
    admin_action_active: "Activo en Pod",
    admin_crm_title: "Base de Clientes Frecuentes (CRM de Fidelidad)",
    admin_crm_name: "Nombre Huésped",
    admin_crm_phone: "WhatsApp Mobile",
    admin_crm_email: "Email",
    admin_crm_visits: "Visitas Realizadas",
    admin_crm_spent: "Monto Total Pagado",
    admin_crm_last_checkin: "Último Check-In",
    admin_crm_empty: "No hay registros de clientes en la base de datos.",
    admin_catalog_title: "Configuración de Catálogo de Precios",
    admin_catalog_id: "ID",
    admin_catalog_capacity: "Capacidad del Hotel",
    admin_catalog_pods: "pods",
    admin_catalog_rooms: "cuartos",
    admin_catalog_rate: "Tarifa Actual",
    admin_catalog_edit: "Modificar Tarifa",
    admin_catalog_save: "Guardar",
    admin_catalog_cancel: "Cancelar",
    admin_catalog_placeholder: "Nueva tarifa",
    admin_catalog_validation_error: "Por favor introduce un precio numérico válido.",
    admin_logout: "Cerrar Sesión",

    login_title: "PORTAL ADMIN",
    login_subtitle: "Control Desk de Cápsula Condesa",
    login_username: "Usuario administrador",
    login_password: "Password secreto",
    login_btn: "Iniciar Sesión",
    login_error: "Usuario o contraseña inválidos.",
    login_loading: "Autenticando..."
  },
  en: {
    hero_badge: "The revolutionary rest experience in CDMX",
    hero_title_1: "Next-Generation Lodging in ",
    hero_title_2: "Condesa",
    hero_subtitle: "Futuristic sleep pods equipped with smart climate control, acoustic isolation, and customizable lighting in the most iconic neighborhood of Mexico City.",
    step_1_title: "Choose your dates and check availability",
    check_in_label: "Check-In Date",
    check_out_label: "Check-Out Date",
    date_error: "The check-in date must be before the check-out date.",
    loading_avail: "Searching for available cabins...",
    no_vacancy: "NO VACANCY",
    free_units: "{available} of {capacity} free",
    selected: "Selected",
    select: "Select",
    step_2_title: "Your Contact Details",
    full_name: "Full Name",
    full_name_placeholder: "E.g. John Doe",
    full_name_error: "Full name is required.",
    email_label: "Contact Email",
    email_placeholder: "example@mail.com",
    email_error: "Enter a valid email address.",
    phone_label: "Cell Phone (WhatsApp)",
    phone_placeholder: "5512345678",
    phone_error: "Enter a valid cell phone number (minimum 10 digits).",
    step_3_title: "Payment Method",
    summary_accommodation: "Accommodation:",
    summary_nights: "Nights:",
    summary_nights_unit: "nights",
    summary_total: "Total Quote:",
    summary_footnote: "Spot temporarily blocked for 10 min during checkout.",
    payment_paypal_desc: "By clicking pay, you will open PayPal's secure checkout page.",
    payment_paypal_footnote: "*Note: This is a secure Sandbox environment for demonstration.",
    payment_transfer_title: "Bank Transfer Details:",
    payment_transfer_bank: "Bank: STP / BBVA",
    payment_transfer_beneficiary: "Beneficiary: Cápsula Condesa SA de CV",
    payment_transfer_clabe: "CLABE: 0121 8001 2345 6789 01",
    payment_transfer_upload: "Upload your receipt (PNG/JPG/PDF)",
    payment_transfer_search: "Click to browse file",
    payment_transfer_file: "File: {name}",
    payment_transfer_error: "You must upload your bank transfer receipt.",
    btn_pay_paypal: "Proceed to Pay with PayPal",
    btn_confirm_transfer: "Send Receipt and Confirm",
    submitting_booking: "Processing Reservation...",
    confirm_title_completed: "Booking Confirmed!",
    confirm_title_pending: "Booking Registered!",
    confirm_desc_completed: "We have securely received your payment via PayPal. Your booking code is active and ready for your arrival.",
    confirm_desc_pending: "We have registered your reservation and bank transfer receipt. Your booking code is safely locked while our front desk validates the deposit.",
    confirm_code: "Booking Code:",
    confirm_guest: "Guest:",
    confirm_accommodation: "Accommodation:",
    confirm_check_in: "Check-in:",
    confirm_check_out: "Check-out:",
    confirm_total: "Total Amount:",
    btn_back_home: "Back to Main Page",
    btn_whatsapp_help: "Questions via WhatsApp",
    services_title: "Included Services in your Cabin",
    service_1_title: "🛸 Private Climate Control",
    service_1_desc: "Each capsule features silent exhaust fans and independent airflow to maintain the optimum temperature.",
    service_2_title: "⚡ Cyber-Charging Ports",
    service_2_desc: "USB ports, universal sockets, and high-speed wireless charging right next to your mattress.",
    service_3_title: "☕ Premium Coworking",
    service_3_desc: "Free access to our coworking area with unlimited coffee and tea, symmetric Wi-Fi, and acoustic phone booths.",
    service_4_title: "🔐 Encrypted Security",
    service_4_desc: "Lockers with high-security digital locks and 24/7 video surveillance in main corridors.",
    footer_copy: "© 2026 Cápsula Condesa. All rights reserved.",
    footer_location: "Location: Insurgentes Sur Ave, Colonia Condesa, CDMX.",
    footer_official: "Official Hotel Website",

    admin_title: "IA BOOKING CENTRAL",
    admin_subtitle: "Command Desk",
    admin_btn_client: "View Client Portal",
    admin_tab_dashboard: "Dashboard",
    admin_tab_bookings: "Bookings",
    admin_tab_customers: "Loyal Customers",
    admin_tab_catalog: "Catalog Pricing",
    admin_db_status: "DB STATUS:",
    admin_db_status_online: "Cloud SQL Online (SQLite Local)",
    admin_loading: "Loading admin data...",
    admin_metric_revenue: "Confirmed Revenue",
    admin_metric_revenue_sub: "Total accumulated paid",
    admin_metric_confirmed: "Confirmed Bookings",
    admin_metric_confirmed_sub: "Paid capsules/rooms",
    admin_metric_pending: "To Verify (Transfer)",
    admin_metric_pending_sub: "Blocks pending payment",
    admin_metric_customers: "Unique Customers",
    admin_metric_customers_sub: "CRM database",
    admin_chart_occupancy: "Monthly Occupancy Rate (%)",
    admin_chart_occupancy_empty: "No occupancy data yet.",
    admin_chart_occupancy_footnote: "Calculated based on 42 total units.",
    admin_chart_revenue: "Monthly Revenue (MXN)",
    admin_chart_revenue_empty: "No revenue data yet.",
    admin_chart_demand: "Peak Demand Days (Check-in)",
    admin_chart_distribution: "Methods & Accommodation Distribution",
    admin_distribution_methods: "Payment Methods:",
    admin_distribution_preferences: "Cabin Preferences:",
    admin_search_placeholder: "Search by code, guest, email, phone...",
    admin_filter_all: "All Statuses",
    admin_filter_pending: "Pending Payment Verification",
    admin_filter_confirmed: "Confirmed (Pending Check-in)",
    admin_filter_checked_in: "Check-in Done",
    admin_filter_cancelled: "Cancelled",
    admin_table_code: "Code",
    admin_table_guest: "Guest",
    admin_table_dates: "Dates",
    admin_table_accommodation: "Accommodation",
    admin_table_pod: "Cabin",
    admin_table_payment: "Payment",
    admin_table_amount: "Amount",
    admin_table_actions: "Actions",
    admin_table_empty: "No reservations found matching the filters.",
    admin_badge_capsule: "Capsule",
    admin_badge_room_bath: "Room w/Bath",
    admin_badge_room_no_bath: "Room w/o Bath",
    admin_badge_payment_completed: "Completed",
    admin_badge_payment_pending: "Pending",
    admin_action_confirm: "Confirm",
    admin_action_checkin: "Check-in",
    admin_action_active: "Active in Pod",
    admin_crm_title: "Loyal Customers Database (CRM)",
    admin_crm_name: "Guest Name",
    admin_crm_phone: "WhatsApp Mobile",
    admin_crm_email: "Email",
    admin_crm_visits: "Visits Made",
    admin_crm_spent: "Total Amount Paid",
    admin_crm_last_checkin: "Last Check-In",
    admin_crm_empty: "No customer records in the database.",
    admin_catalog_title: "Price Catalog Settings",
    admin_catalog_id: "ID",
    admin_catalog_capacity: "Hotel Capacity",
    admin_catalog_pods: "pods",
    admin_catalog_rooms: "rooms",
    admin_catalog_rate: "Current Rate",
    admin_catalog_edit: "Modify Rate",
    admin_catalog_save: "Save",
    admin_catalog_cancel: "Cancel",
    admin_catalog_placeholder: "New rate",
    admin_catalog_validation_error: "Please enter a valid numeric price.",
    admin_logout: "Log Out",

    login_title: "ADMIN PORTAL",
    login_subtitle: "Control Desk of Cápsula Condesa",
    login_username: "Admin Username",
    login_password: "Secret Password",
    login_btn: "Login",
    login_error: "Invalid username or password.",
    login_loading: "Authenticating..."
  }
};
