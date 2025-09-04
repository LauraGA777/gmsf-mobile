import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { Colors } from '../../constants/colors';

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  strokeWidth?: number;
  showLabels?: boolean;
  centerText?: string;
  centerSubtext?: string;
  title?: string;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 200,
  strokeWidth = 20,
  showLabels = true,
  centerText,
  centerSubtext,
  title
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay datos disponibles</Text>
        </View>
      </View>
    );
  }

  let cumulativePercent = 0;

  const createArc = (percentage: number, offset: number) => {
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = -offset * circumference;
    
    return {
      strokeDasharray,
      strokeDashoffset
    };
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={[styles.chartContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} style={styles.svg}>
          <G rotation="-90" origin={`${size/2}, ${size/2}`}>
            {data.map((item, index) => {
              const percentage = item.value / total;
              const arc = createArc(percentage, cumulativePercent);
              cumulativePercent += percentage;
              
              return (
                <Circle
                  key={`${item.label}-${index}`}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={arc.strokeDasharray}
                  strokeDashoffset={arc.strokeDashoffset}
                  strokeLinecap="round"
                />
              );
            })}
          </G>
          
          {/* Texto central */}
          {centerText && (
            <SvgText
              x={size / 2}
              y={size / 2 - 8}
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
              fill={Colors.text}
            >
              {centerText}
            </SvgText>
          )}
          
          {centerSubtext && (
            <SvgText
              x={size / 2}
              y={size / 2 + 16}
              textAnchor="middle"
              fontSize="14"
              fill={Colors.textLight}
            >
              {centerSubtext}
            </SvgText>
          )}
        </Svg>
      </View>
      
      {/* Leyenda */}
      {showLabels && (
        <View style={styles.legend}>
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <View key={`legend-${item.label}-${index}`} style={styles.legendItem}>
                <View 
                  style={[styles.legendColor, { backgroundColor: item.color }]} 
                />
                <Text style={styles.legendLabel}>{item.label}</Text>
                <Text style={styles.legendValue}>
                  {item.value} ({percentage}%)
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    transform: [{ rotate: '0deg' }],
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  legend: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: 'bold',
  },
});
