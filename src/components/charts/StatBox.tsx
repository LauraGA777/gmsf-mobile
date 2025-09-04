import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface StatBoxProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  backgroundColor?: string;
}

export const StatBox: React.FC<StatBoxProps> = ({
  title,
  value,
  subtitle,
  color = Colors.primary,
  backgroundColor = Colors.primary + '20'
}) => {
  // Crear un color de fondo más elegante basado en el color principal
  const getStyledBackground = (baseColor: string) => {
    return baseColor.replace('20', '15'); // Reducir opacidad para más elegancia
  };

  const styledBackground = getStyledBackground(backgroundColor);

  return (
    <View style={[styles.container, { backgroundColor: styledBackground }]}>
      <View style={styles.content}>
        <Text style={[styles.value, { color }]} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={2} adjustsFontSizeToFit>
            {subtitle}
          </Text>
        )}
      </View>
      {/* Efecto de brillo sutil */}
      <View style={[styles.shine, { backgroundColor: color + '10' }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    margin: 4,
    minHeight: 120,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden', // Para el efecto de brillo
    position: 'relative',
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    opacity: 0.3,
  },
  value: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 36,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  title: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 14,
    fontWeight: '500',
    opacity: 0.8,
    letterSpacing: 0.2,
  },
});
