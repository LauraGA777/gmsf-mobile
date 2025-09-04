import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  iconName?: string;
  color?: string;
  backgroundColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  onPress?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  iconName,
  color = Colors.primary,
  backgroundColor = Colors.surface,
  trend,
  subtitle,
  onPress
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toString();
    }
    return val;
  };

  const CardContent = () => (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {(icon || iconName) && (
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
              {icon || (iconName && <Ionicons name={iconName as any} size={24} color={color} />)}
            </View>
          )}
          <View style={styles.titleContent}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
        
        {trend && (
          <View style={[
            styles.trendContainer, 
            { backgroundColor: trend.isPositive ? `${Colors.success}15` : `${Colors.error}15` }
          ]}>
            <Ionicons 
              name={trend.isPositive ? 'trending-up' : 'trending-down'} 
              size={12} 
              color={trend.isPositive ? Colors.success : Colors.error} 
            />
            <Text style={[
              styles.trendValue, 
              { color: trend.isPositive ? Colors.success : Colors.error }
            ]}>
              {trend.value > 0 ? '+' : ''}{trend.value.toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
      
      <Text style={[styles.value, { color }]}>{formatValue(value)}</Text>
      
      {onPress && (
        <View style={styles.footer}>
          <Text style={[styles.actionText, { color }]}>Ver detalles</Text>
          <Ionicons name="chevron-forward" size={16} color={color} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.touchable}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};
const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    marginHorizontal: 6,
    marginVertical: 8,
  },
  container: {
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContent: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textLight,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    flex: 1,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
