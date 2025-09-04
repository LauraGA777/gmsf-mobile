import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      // Si es un número grande que parece dinero
      if (val >= 1000000) {
        return `$ ${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        // Si el título incluye "Ingreso" formatear como dinero
        if (title.toLowerCase().includes('ingreso')) {
          return `$ ${(val / 1000).toFixed(0)}.000`;
        }
        return `${(val / 1000).toFixed(0)}K`;
      }
      // Si es dinero pequeño
      if (title.toLowerCase().includes('ingreso') && val > 0) {
        return `$ ${val.toLocaleString()}`;
      }
      return val.toString();
    }
    return val;
  };

  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      {/* Header con icono y título */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Valor principal */}
      <Text style={styles.value}>{formatValue(value)}</Text>

      {/* Trending */}
      {trend && (
        <View style={styles.trendContainer}>
          <Ionicons 
            name={trend.isPositive ? 'trending-up' : 'trending-down'} 
            size={16} 
            color={trend.isPositive ? Colors.success : Colors.error} 
          />
          <Text style={[
            styles.trendText,
            { color: trend.isPositive ? Colors.success : Colors.error }
          ]}>
            {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}%
          </Text>
        </View>
      )}

      {/* Subtítulo */}
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    flex: 1,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 36,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 16,
  },
});
