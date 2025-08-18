export const Colors = {
  // Colores principales basados en el diseño web
  primary: '#1e40af', // Azul principal
  secondary: '#059669', // Verde
  accent: '#dc2626', // Rojo para alertas
  
  // Colores de fondo
  background: '#f8fafc',
  surface: '#ffffff',
  cardBackground: '#ffffff',
  
  // Colores de texto
  text: '#1f2937',
  textSecondary: '#6b7280',
  textLight: '#9ca3af',
  
  // Colores de estado
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Colores adicionales
  border: '#e5e7eb',
  divider: '#f3f4f6',
  shadow: '#00000010',
  
  // Gradientes
  gradientPrimary: ['#1e40af', '#3b82f6'],
  gradientSecondary: ['#059669', '#10b981'],
  gradientAccent: ['#dc2626', '#ef4444'],
  
  // Colores específicos del dashboard
  chartBlue: '#3b82f6',
  chartGreen: '#10b981',
  chartOrange: '#f59e0b',
  chartPurple: '#8b5cf6',
  chartPink: '#ec4899',
};

export const Shadows = {
  small: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  medium: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};
