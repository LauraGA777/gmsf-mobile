export const Colors = {
  // Colores principales actualizados según tu paleta
  primary: '#1a1a1a', // Gris oscuro principal
  secondary: '#10B981', // Verde
  accent: '#dc2626', // Rojo para alertas (mantenido)

  // Colores de fondo
  background: '#F8F9FA', // Gris claro
  surface: '#FFFFFF', // Blanco
  cardBackground: '#FFFFFF', // Blanco

  // Colores de texto
  text: '#1a1a1a', // Gris oscuro principal
  textSecondary: '#6B7280', // Gris medio
  textLight: '#9CA3AF', // Gris medio claro

  // Colores de estado
  success: '#10B981', // Verde principal
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Colores adicionales
  border: '#E5E7EB', // Gris borde
  divider: '#F3F4F6', // Gris hover
  shadow: '#00000010',
  hover: '#F3F4F6', // Gris hover

  // Gradientes actualizados
  gradientPrimary: ['#1a1a1a', '#3a3a3a'],
  gradientSecondary: ['#10B981', '#059669'],
  gradientAccent: ['#dc2626', '#ef4444'],

  // Colores específicos del dashboard
  chartBlue: '#3b82f6',
  chartGreen: '#10B981',
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
