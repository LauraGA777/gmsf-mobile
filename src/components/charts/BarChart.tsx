import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Line } from 'react-native-svg';
import { Colors } from '../../constants/colors';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  width?: number;
  height?: number;
  showValues?: boolean;
  showGrid?: boolean;
  title?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  width = 320,
  height = 200,
  showValues = true,
  showGrid = true,
  title
}) => {
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={[styles.emptyContainer, { width, height }]}>
          <Text style={styles.emptyText}>No hay datos disponibles</Text>
        </View>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = chartWidth / data.length * 0.7;
  const barSpacing = chartWidth / data.length * 0.3;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {showGrid && (
          <G>
            {gridLines.map((ratio, index) => {
              const y = padding.top + chartHeight * (1 - ratio);
              return (
                <Line
                  key={`grid-${index}`}
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke={Colors.border}
                  strokeWidth={0.5}
                  opacity={0.5}
                />
              );
            })}
          </G>
        )}
        
        {/* Bars */}
        <G>
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = padding.left + (index * (barWidth + barSpacing)) + barSpacing / 2;
            const y = padding.top + chartHeight - barHeight;
            
            return (
              <G key={`bar-${index}`}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={item.color || Colors.primary}
                  rx={4}
                />
                
                {/* Value labels */}
                {showValues && (
                  <SvgText
                    x={x + barWidth / 2}
                    y={y - 8}
                    textAnchor="middle"
                    fontSize="12"
                    fill={Colors.text}
                    fontWeight="500"
                  >
                    {item.value}
                  </SvgText>
                )}
                
                {/* Category labels */}
                <SvgText
                  x={x + barWidth / 2}
                  y={padding.top + chartHeight + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill={Colors.textLight}
                >
                  {item.label}
                </SvgText>
              </G>
            );
          })}
        </G>
        
        {/* Y-axis labels */}
        <G>
          {gridLines.map((ratio, index) => {
            const value = Math.round(maxValue * ratio);
            const y = padding.top + chartHeight * (1 - ratio);
            
            return (
              <SvgText
                key={`y-label-${index}`}
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill={Colors.textLight}
              >
                {value}
              </SvgText>
            );
          })}
        </G>
      </Svg>
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
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
