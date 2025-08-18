import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatCard, Card, Loading } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../constants/layout';
import { apiService } from '../services/api';
import { DashboardStats, OptimizedStats } from '../types';

const { width: screenWidth } = Dimensions.get('window');

export const DashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [optimizedStats, setOptimizedStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      
      console.log('🔄 Cargando datos del dashboard...');
      
      const [statsData, optimizedData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getOptimizedStats(),
      ]);
      
      console.log('📊 Datos del dashboard cargados:', { statsData, optimizedData });
      
      setStats(statsData);
      setOptimizedStats(optimizedData);
    } catch (error: any) {
      console.error('💥 Error loading dashboard data:', error);
      
      // Verificar si es un error de red o del servidor
      const isNetworkError = !error.response;
      const statusCode = error.response?.status;
      
      let errorMessage = 'No se pudieron cargar los datos del dashboard';
      
      if (isNetworkError) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (statusCode === 404) {
        errorMessage = 'Endpoint no encontrado. Verifica la configuración del servidor.';
      } else if (statusCode === 500) {
        errorMessage = 'Error interno del servidor. Intenta nuevamente.';
      }
      
      Alert.alert('Error', errorMessage);
      
      // Solo usar datos de ejemplo si la API falla completamente
      console.log('🔧 Usando datos de ejemplo para desarrollo...');
      setStats({
        ausentismos: 1,
        contratos: 1,
        ingresos: 450000,
        membresías: 1,
        clientes: 1,
      });
      
      setOptimizedStats({
        asistenciasPorDia: [
          { fecha: '2024-01-01', total: 25, mañana: 15, promedio: 20 },
          { fecha: '2024-01-02', total: 30, mañana: 18, promedio: 22 },
          { fecha: '2024-01-03', total: 28, mañana: 16, promedio: 21 },
          { fecha: '2024-01-04', total: 35, mañana: 20, promedio: 25 },
          { fecha: '2024-01-05', total: 32, mañana: 19, promedio: 24 },
        ],
        tendenciaIngresos: [
          { fecha: '2024-01-01', total: 450000, promedio: 400000, maximo: 500000, meta: 600000 },
          { fecha: '2024-01-02', total: 520000, promedio: 450000, maximo: 550000, meta: 600000 },
          { fecha: '2024-01-03', total: 480000, promedio: 430000, maximo: 520000, meta: 600000 },
          { fecha: '2024-01-04', total: 580000, promedio: 500000, maximo: 600000, meta: 600000 },
          { fecha: '2024-01-05', total: 620000, promedio: 520000, maximo: 650000, meta: 600000 },
        ],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return <Loading message="Cargando dashboard..." />;
  }

  const chartConfig = {
    backgroundColor: Colors.surface,
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: BorderRadius.md,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: Colors.primary,
    },
  };

  const assistanceData = {
    labels: optimizedStats?.charts?.attendance?.map((item: any) => 
      item.date ? new Date(item.date).toLocaleDateString('es', { weekday: 'short' }) : item.label || 'N/A'
    ) || ['Sin datos'],
    datasets: [
      {
        data: optimizedStats?.charts?.attendance?.map((item: any) => item.asistencias ?? item.value ?? item.total ?? 0) || [0],
        color: () => Colors.chartBlue,
        strokeWidth: 2,
      },
    ],
  };

  const incomeData = {
    labels: optimizedStats?.charts?.revenue?.map((item: any) => 
      item.date ? new Date(item.date).toLocaleDateString('es', { day: 'numeric' }) : item.label || 'N/A'
    ) || ['Sin datos'],
    datasets: [
      {
        data: optimizedStats?.charts?.revenue?.map((item: any) => ((item.ingresos ?? item.value ?? item.total ?? 0) as number) / 1000) || [0],
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Panel de Control</Text>
          <Text style={styles.subtitle}>Análisis de rendimiento con carga súper rápida</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <StatCard
                title="Asistencias"
                value={stats?.attendance?.total || 0}
                icon="people"
                color={Colors.primary}
                subtitle={`${stats?.attendance?.today || 0} hoy`}
              />
            </View>
            <View style={styles.statItem}>
              <StatCard
                title="Contratos"
                value={stats?.contracts?.totalContracts || 0}
                icon="description"
                color={Colors.success}
                subtitle={`${stats?.contracts?.activeContracts || 0} activos`}
              />
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.fullWidth}>
              <StatCard
                title="Ingresos del período"
                value={formatCurrency(stats?.contracts?.totalRevenue || 0)}
                icon="attach-money"
                color={Colors.warning}
                subtitle={`${formatCurrency(stats?.contracts?.periodRevenue || 0)} este período`}
              />
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <StatCard
                title="Membresías"
                value={stats?.memberships?.totalMemberships || 0}
                icon="card-membership"
                color={Colors.chartPurple}
                subtitle={`${stats?.memberships?.activeMemberships || 0} activas`}
              />
            </View>
            <View style={styles.statItem}>
              <StatCard
                title="Clientes"
                value={stats?.clients?.totalClients || 0}
                icon="group-add"
                color={Colors.primary}
                subtitle={`${stats?.clients?.activeClients || 0} activos`}
              />
            </View>
          </View>
        </View>

        <Card
          title="Asistencias por Día"
          subtitle="Tendencia de asistencias - 31 días anteriores"
        >
          {Array.isArray(optimizedStats?.charts?.attendance) && optimizedStats.charts.attendance.length > 0 && (
            <LineChart
              data={assistanceData}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          )}
        </Card>

        <Card
          title="Tendencia de Ingresos"
          subtitle="Evolución de ingresos - 31 días anteriores"
        >
          {Array.isArray(optimizedStats?.charts?.revenue) && optimizedStats.charts.revenue.length > 0 && (
            <BarChart
              data={incomeData}
              width={screenWidth - 64}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
              }}
              style={styles.chart}
              yAxisSuffix="k"
              yAxisLabel=""
            />
          )}
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Última actualización: {new Date().toLocaleString('es-CO')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  statsGrid: {
    padding: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  statItem: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  fullWidth: {
    marginHorizontal: Spacing.xs,
  },
  chart: {
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  footer: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
  },
});
