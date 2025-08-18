// Configuración de la aplicación GMSF Mobile

export const Config = {
  // URL de la API en producción
  API_BASE_URL: 'https://gmsf-backend.vercel.app',
  
  // Configuración de la aplicación
  APP_NAME: 'GMSF Mobile',
  APP_VERSION: '1.0.0',
  
  // Configuración de timeouts (en milisegundos)
  API_TIMEOUT: 15000,
  
  // Configuración de autenticación
  AUTH: {
    TOKEN_KEY: 'authToken',
    AUTO_REFRESH_ON_STARTUP: true,
  },
  
  // Configuración de logging
  LOGGING: {
    ENABLED: __DEV__, // Solo en desarrollo
    API_REQUESTS: true,
    API_RESPONSES: true,
  },
  
  // Endpoints de la API (sin el baseURL)
  ENDPOINTS: {
    // Dashboard
    DASHBOARD_STATS: '/dashboard/stats',
    DASHBOARD_OPTIMIZED: '/dashboard/optimized',
    
    // Entrenadores
    TRAINERS: '/trainers',
    TRAINER_DETAIL: (id: string) => `/trainers/${id}`,
    TRAINER_ACTIVATE: (id: string) => `/trainers/${id}/activate`,
    TRAINER_DEACTIVATE: (id: string) => `/trainers/${id}/deactivate`,
    
    // Clientes
    CLIENTS: '/clients',
    CLIENTS_ME: '/clients/me',
    CLIENTS_BENEFICIARIES: '/clients/me/beneficiaries',
    CLIENT_DETAIL: (id: string) => `/clients/${id}`,
    CLIENT_CHECK: (tipo: string, numero: string) => `/clients/check-user/${tipo}/${numero}`,
    
    // Autenticación (si se implementa en el futuro)
    AUTH_LOGIN: '/auth/login',
    AUTH_LOGOUT: '/auth/logout',
    AUTH_REFRESH: '/auth/refresh',
  },
  
  // Configuración de la UI
  UI: {
    REFRESH_INDICATORS: true,
    LOADING_ANIMATIONS: true,
    HAPTIC_FEEDBACK: true,
  },
  
  // Mensajes de error por defecto
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
    UNAUTHORIZED: 'Token inválido o expirado. Por favor, inicia sesión nuevamente.',
    NOT_FOUND: 'Recurso no encontrado.',
    SERVER_ERROR: 'Error interno del servidor. Intenta nuevamente.',
    UNKNOWN_ERROR: 'Ocurrió un error inesperado.',
  },
};

export default Config;
