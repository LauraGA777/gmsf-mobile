import { Dimensions, PixelRatio } from 'react-native';

// Base design width (iPhone X width 375)
const BASE_WIDTH = 375;

// Compute scale factor with clamp for consistency
const { width } = Dimensions.get('window');
const rawScale = width / BASE_WIDTH;
const isSmallDevice = width < 350; // e.g., very narrow devices
const scale = Math.min(Math.max(rawScale, 0.85), 1.1); // clamp between 85% and 110%

// Helper to normalize and round to .5 for crisp text
const normalize = (size: number) => {
  const newSize = size * scale;
  const rounded = Math.round(PixelRatio.roundToNearestPixel(newSize) * 2) / 2; // nearest .5
  return rounded;
};

export const Typography = {
  summary: {
    value: normalize(isSmallDevice ? 23 : 24),      // ligeramente menor en pantallas muy pequeñas
    title: normalize(isSmallDevice ? 12.3 : 13),     // reducir más en dispositivos estrechos para evitar corte de palabras largas
    subtitle: normalize(12),                        // subtitle text
    trend: normalize(isSmallDevice ? 12 : 12.5),    // trend percentage adaptativo
  }
};

// Provide matching line-heights (≈ size + 2)
export const LineHeights = {
  summary: {
    value: Typography.summary.value + 4,      // un poco más de espacio para números grandes
    title: Typography.summary.title + 6,      // mayor lineHeight evita corte de acentos ("í")
    subtitle: Typography.summary.subtitle + 4,
    trend: Typography.summary.trend + 4,
  }
};

export default Typography;