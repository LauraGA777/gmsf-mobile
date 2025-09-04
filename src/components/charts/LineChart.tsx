import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Text as SvgText, Path, Circle } from 'react-native-svg';
import { Colors } from '../../constants/colors';

interface LineChartData {
  date: string;
  value: number;
}

interface LineChartProps {
  data: LineChartData[];
  width?: number;
  height?: number;
  color?: string;
  title?: string;
  showGrid?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export const LineChart: React.FC<LineChartProps> = ({
  data,
  width = screenWidth - 64,
  height = 200,
  color = Colors.primary,
  title,
  showGrid = true
}) => {
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No hay datos disponibles</Text>
        </View>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;

  // Crear puntos para la línea
  const points = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((item.value - minValue) / valueRange) * chartHeight;
    return { x, y, value: item.value };
  });

  // Crear path para la línea
  const pathData = points.reduce((acc, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${acc} ${command} ${point.x} ${point.y}`;
  }, '');

  const gridRatios = [0, 0.25, 0.5, 0.75, 1];

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {showGrid && (
          <>
            {gridRatios.map((ratio, index) => {
              const y = padding.top + chartHeight * ratio;
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
          </>
        )}
        
        {/* Línea principal */}
        <Path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Puntos en la línea */}
        {points.map((point, index) => (
          <Circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={color}
            stroke="#fff"
            strokeWidth={2}
          />
        ))}
        
        {/* Etiquetas del eje Y */}
        {gridRatios.map((ratio, index) => {
          const value = Math.round(minValue + (maxValue - minValue) * (1 - ratio));
          const y = padding.top + chartHeight * ratio;
          
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
        
        {/* Etiquetas del eje X */}
        {data.map((item, index) => {
          if (index % Math.ceil(data.length / 5) === 0) { // Mostrar solo algunas etiquetas
            const x = padding.left + (index / (data.length - 1)) * chartWidth;
            return (
              <SvgText
                key={`x-label-${index}`}
                x={x}
                y={padding.top + chartHeight + 20}
                textAnchor="middle"
                fontSize="10"
                fill={Colors.textLight}
              >
                {item.date.split('-')[2] || item.date} {/* Mostrar solo el día */}
              </SvgText>
            );
          }
          return null;
        })}
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
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
