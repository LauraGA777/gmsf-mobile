import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { PieChart, MetricCard, BarChart, LineChart, StatBox, ErrorState, SummaryCard } from '../components';
import { Colors } from '../constants/colors';
import { apiService } from '../services/api';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Márgenes estándar responsivos
const MARGINS = {
  horizontal: Math.max(16, screenWidth * 0.04), // Mínimo 16px, máximo 4% del ancho
  vertical: Math.max(8, screenHeight * 0.01), // Mínimo 8px, máximo 1% del alto
  card: Math.max(12, screenWidth * 0.03), // Mínimo 12px, máximo 3% del ancho
  section: Math.max(20, screenWidth * 0.05), // Mínimo 20px, máximo 5% del ancho
};

interface DashboardData {
  trainers: { active: number; inactive: number; total: number };
  clients: { active: number; inactive: number; total: number };
  summary: { totalAttendances: number; periodAttendances: number; todayAttendances: number; activeContracts: number; monthlyRevenue: number; activeMemberships: number; newClients: number; };
  trends: { attendanceData: Array<{ date: string; value: number }>; revenueData: Array<{ date: string; value: number }> };
  lastUpdate?: string;
}

interface AttendanceTrendPoint { label: string; value: number; start: string; end: string; }

export const DashboardScreen: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendanceMode, setAttendanceMode] = useState<'weekly' | 'monthly'>('weekly');
  const [trendMonth, setTrendMonth] = useState<number>(new Date().getMonth() + 1);
  const [trendYear, setTrendYear] = useState<number>(new Date().getFullYear());
  const [attendanceTrends, setAttendanceTrends] = useState<AttendanceTrendPoint[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [trendError, setTrendError] = useState<string | null>(null);

  // Cargar datos del dashboard
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      console.log('🔄 Cargando datos del dashboard...');

      // Obtener datos de entrenadores y clientes en paralelo y resumen rápido
      const [trainersData, clientsData, quickSummary, contractStats, membershipStats, attendanceStats] = await Promise.all([
        apiService.getTrainers({ page: 1, limit: 50 }),
        apiService.getClients({ page: 1, limit: 50 }),
        apiService.getMobileQuickSummary('today').catch(()=>null),
        apiService.getContractStats({ period: 'monthly' }).catch(()=>null),
        apiService.getMembershipStats({ period: 'monthly' }).catch(()=>null),
        apiService.getAttendanceStats({ period: 'monthly' }).catch(()=>null)
      ]);

      const todayStats = quickSummary?.todayStats;

      // Derivar métricas
      const activeContracts = contractStats?.activeContracts || todayStats?.newContracts || 0;
      const monthlyRevenue = contractStats?.periodRevenue || todayStats?.revenue || 0;
      const activeMemberships = membershipStats?.activeMemberships || 0;
      const newClients = clientsData.total; // TODO: reemplazar por endpoint específico si existe
      const totalAttendances = attendanceStats?.activos ?? attendanceStats?.total ?? todayStats?.attendance ?? 0;
      const todayAttendances = todayStats?.attendance ?? 0;

      console.log('✅ Datos obtenidos - Entrenadores:', trainersData, 'Clientes:', clientsData);

      // Procesar datos del dashboard
      const dashboardData: DashboardData = {
        trainers: {
          active: trainersData.data.filter(t => t.activo).length,
          inactive: trainersData.data.filter(t => !t.activo).length,
          total: trainersData.total
        },
        clients: {
          active: clientsData.data.filter(c => c.activo).length,
          inactive: clientsData.data.filter(c => !c.activo).length,
          total: clientsData.total
        },
        summary: {
          totalAttendances: totalAttendances,
          periodAttendances: 0,
          todayAttendances: todayAttendances,
          activeContracts: activeContracts,
          monthlyRevenue: monthlyRevenue,
          activeMemberships: activeMemberships,
          newClients: newClients
        },
        trends: { attendanceData: [], revenueData: [] },
        lastUpdate: new Date().toLocaleString('es-CO', {
          timeZone: 'America/Bogota',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setData(dashboardData);
      console.log('✅ Datos del dashboard cargados:', dashboardData);
      setError(null);

    } catch (error) {
      console.error('❌ Error cargando dashboard:', error);
      setError('No se pudieron cargar los datos. Verifica tu conexión e intenta nuevamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const loadAttendanceTrends = useCallback(async () => {
    try {
      setLoadingTrends(true);
      setTrendError(null);
      const params: any = { mode: attendanceMode };
      if (attendanceMode === 'weekly') {
        params.month = trendMonth;
        params.year = trendYear;
      } else {
        params.year = trendYear;
      }
      const trendResponse = await apiService.getAttendanceTrends(params);
      const container = trendResponse?.data || trendResponse;
      const dataset = container?.data || container;
      const list = Array.isArray(dataset?.data) ? dataset.data : Array.isArray(dataset) ? dataset : [];
      const normalized: AttendanceTrendPoint[] = list.map((item: any) => ({
        label: item.label,
        value: item.value,
        start: item.start,
        end: item.end
      }));
      setAttendanceTrends(normalized);
      setData(prev => prev ? { ...prev, summary: { ...prev.summary, periodAttendances: normalized.reduce((a,c)=>a + (c.value||0),0) } } : prev);
    } catch (e:any) {
      console.error('Error cargando tendencias de asistencia:', e);
      setTrendError('No se pudieron cargar las tendencias de asistencia');
    } finally {
      setLoadingTrends(false);
    }
  }, [attendanceMode, trendMonth, trendYear]);

  useEffect(() => {
    loadAttendanceTrends();
  }, [loadAttendanceTrends]);

  const goPrev = () => {
    if (attendanceMode === 'weekly') {
      let m = trendMonth - 1; let y = trendYear; if (m < 1) { m = 12; y -= 1; }
      setTrendMonth(m); setTrendYear(y);
    } else {
      setTrendYear(y => y - 1);
    }
  };
  const goNext = () => {
    if (attendanceMode === 'weekly') {
      let m = trendMonth + 1; let y = trendYear; if (m > 12) { m = 1; y += 1; }
      setTrendMonth(m); setTrendYear(y);
    } else {
      setTrendYear(y => y + 1);
    }
  };
  const toggleMode = () => setAttendanceMode(m => m === 'weekly' ? 'monthly' : 'weekly');

  // Manejar pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData(true);
  }, [loadDashboardData]);

  // Función para obtener datos de gráfica de entrenadores
  const getTrainersChartData = () => {
    if (!data) return [];
    return [
      { value: data.trainers.active, color: Colors.success, label: 'Activos' },
      { value: data.trainers.total - data.trainers.active, color: Colors.textLight, label: 'Inactivos' },
    ];
  };

  // Función para obtener datos de gráfica de clientes
  const getClientsChartData = () => {
    if (!data) return [];
    return [
      { value: data.clients.active, color: Colors.info, label: 'Activos' },
      { value: data.clients.total - data.clients.active, color: Colors.textLight, label: 'Inactivos' },
    ];
  };

  // Pantalla de carga
  if (loading && !data) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../../assets/lottie/loading.json')}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
          <Text style={styles.loadingText}>Cargando datos del dashboard...</Text>
        </View>
      </View>
    );
  }

  // Pantalla de error
  if (error && !data) {
    return (
      <ErrorState
        title="Error de conexión"
        message={error}
        onRetry={() => loadDashboardData()}
        showAnimation={false}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Título Principal */}
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Panel de Rendimiento</Text>
          </View>

          {/* Resumen General Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderContent}>
                <MaterialIcons name="assessment" size={24} color={Colors.primary} />
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Resumen General</Text>
                  <Text style={styles.cardDescription}>Métricas principales del gimnasio</Text>
                </View>
              </View>
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>Tiempo real</Text>
              </View>
            </View>
            
            <View style={styles.cardContent}>
              {/* Grid uniforme 2 columnas (mantiene simetría). Si elementos impares, ocupa con spacer invisible */}
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <SummaryCard
                    title="Asistencias"
                    value={data?.summary.totalAttendances || 0}
                    subtitle={`Total de asistencias registradas${data?.summary.todayAttendances ? ` (Hoy: ${data.summary.todayAttendances})` : ''}`}
                    icon="pulse"
                    color={Colors.primary}
                    trend={{
                      value: (data?.summary.todayAttendances || 0) >= 2 ? 80.0 : 20.0,
                      isPositive: (data?.summary.todayAttendances || 0) >= 2
                    }}
                  />
                </View>
                <View style={styles.summaryItem}>
                  <SummaryCard
                    title="Contratos Activos"
                    value={data?.summary.activeContracts || 0}
                    subtitle="Contratos vigentes"
                    icon="document-text"
                    color={Colors.success}
                    trend={data?.summary.activeContracts ? {
                      value: 0.0,
                      isPositive: false
                    } : undefined}
                  />
                </View>
                <View style={styles.summaryItem}>
                  <SummaryCard
                    title="Ingresos"
                    value={data?.summary.monthlyRevenue || 0}
                    subtitle="Ingresos del periodo"
                    icon="cash"
                    color={Colors.warning}
                    trend={data?.summary.monthlyRevenue ? {
                      value: 0.0,
                      isPositive: false
                    } : undefined}
                  />
                </View>
                <View style={styles.summaryItem}>
                  <SummaryCard
                    title="Membresías Activas"
                    value={data?.summary.activeMemberships || 0}
                    subtitle="Membresías vigentes"
                    icon="card"
                    color={Colors.error}
                    trend={data?.summary.activeMemberships ? {
                      value: 0.0,
                      isPositive: false
                    } : undefined}
                  />
                </View>
                <View style={styles.summaryItem}>
                  <SummaryCard
                    title="Nuevos Clientes"
                    value={data?.summary.newClients || 0}
                    subtitle="Clientes registrados este mes"
                    icon="people"
                    color={Colors.info}
                    trend={{
                      value: (data?.summary.newClients || 0) >= 2 ? 60.0 : 0.0,
                      isPositive: (data?.summary.newClients || 0) >= 2
                    }}
                  />
                </View>
                {/* Espacio fantasma para completar la cuadrícula y mantener alineación visual */}
                <View style={[styles.summaryItem, styles.summaryItemGhost]} />
              </View>
            </View>
          </View>

          {/* Gráficas de Tendencias Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderContent}>
                <MaterialIcons name="trending-up" size={24} color={Colors.primary} />
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Tendencias de Rendimiento</Text>
                  <Text style={styles.cardDescription}>Monitoreo de actividad del gimnasio</Text>
                </View>
              </View>
              <View style={styles.cardBadgeRow}>
                <Text style={styles.cardBadgeText} onPress={toggleMode}>
                  {attendanceMode === 'weekly' ? 'Vista Semanal' : 'Vista Mensual'}
                </Text>
              </View>
            </View>
            
            <View style={styles.cardContent}>
              <View style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                  <Text style={styles.chartTitle}>
                    {attendanceMode === 'weekly' ? `Asistencias Semanales (${trendMonth.toString().padStart(2,'0')}/${trendYear})` : `Asistencias Mensuales (${trendYear})`}
                  </Text>
                  <View style={styles.chartMetric}>
                    <Text style={styles.chartMetricValue}>{data?.summary.totalAttendances || 0}</Text>
                    <Text style={styles.chartMetricLabel}>Total</Text>
                  </View>
                </View>
                <View style={styles.trendControls}>
                  <Text style={styles.navButton} onPress={goPrev}>◀</Text>
                  <Text style={styles.periodLabel}>{attendanceMode === 'weekly' ? `${trendMonth.toString().padStart(2,'0')}/${trendYear}` : trendYear}</Text>
                  <Text style={styles.navButton} onPress={goNext}>▶</Text>
                </View>
                {trendError ? (
                  <Text style={styles.errorText}>{trendError}</Text>
                ) : (
                  <LineChart
                    data={attendanceTrends.map(pt => ({ date: pt.label, value: pt.value }))}
                    title=""
                    color={Colors.chartBlue}
                    height={200}
                  />
                )}
              </View>
            </View>
          </View>

          {/* Gráficas de Estado Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderContent}>
                <MaterialIcons name="donut-large" size={24} color={Colors.success} />
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Distribución de Personal y Clientes</Text>
                  <Text style={styles.cardDescription}>Estado actual del gimnasio</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.cardContent}>
              <View style={styles.chartsRow}>
                {/* Gráfica de Entrenadores */}
                <View style={styles.chartCardHalf}>
                  <View style={styles.chartHeaderCenter}>
                    <MaterialIcons name="fitness-center" size={20} color={Colors.success} />
                    <Text style={styles.chartTitleCenter}>Entrenadores</Text>
                    <Text style={styles.chartSubtitleCenter}>Estado del personal</Text>
                  </View>
                  
                  {data && data.trainers.total > 0 ? (
                    <View style={styles.chartContentCenter}>
                      <PieChart
                        data={getTrainersChartData()}
                        size={120}
                        strokeWidth={12}
                        centerText={data.trainers.total.toString()}
                        centerSubtext="Total"
                        showLabels={false}
                      />
                      <View style={styles.chartLegend}>
                        <View style={styles.legendItem}>
                          <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
                          <Text style={styles.legendText}>Activos: {data.trainers.active}</Text>
                        </View>
                        <View style={styles.legendItem}>
                          <View style={[styles.legendDot, { backgroundColor: Colors.textLight }]} />
                          <Text style={styles.legendText}>Inactivos: {data.trainers.total - data.trainers.active}</Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.noDataContainer}>
                      <MaterialIcons name="info-outline" size={32} color={Colors.textLight} />
                      <Text style={styles.noDataText}>Sin datos</Text>
                    </View>
                  )}
                </View>

                {/* Gráfica de Clientes */}
                <View style={styles.chartCardHalf}>
                  <View style={styles.chartHeaderCenter}>
                    <MaterialIcons name="people" size={20} color={Colors.info} />
                    <Text style={styles.chartTitleCenter}>Clientes</Text>
                    <Text style={styles.chartSubtitleCenter}>Estado de membresías</Text>
                  </View>
                  
                  {data && data.clients.total > 0 ? (
                    <View style={styles.chartContentCenter}>
                      <PieChart
                        data={getClientsChartData()}
                        size={120}
                        strokeWidth={12}
                        centerText={data.clients.total.toString()}
                        centerSubtext="Total"
                        showLabels={false}
                      />
                      <View style={styles.chartLegend}>
                        <View style={styles.legendItem}>
                          <View style={[styles.legendDot, { backgroundColor: Colors.info }]} />
                          <Text style={styles.legendText}>Activos: {data.clients.active}</Text>
                        </View>
                        <View style={styles.legendItem}>
                          <View style={[styles.legendDot, { backgroundColor: Colors.textLight }]} />
                          <Text style={styles.legendText}>Inactivos: {data.clients.total - data.clients.active}</Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.noDataContainer}>
                      <MaterialIcons name="info-outline" size={32} color={Colors.textLight} />
                      <Text style={styles.noDataText}>Sin datos</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Estilos base siguiendo el patrón del ProfileScreen
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: MARGINS.section,
  },
  content: {
    paddingHorizontal: MARGINS.horizontal,
    paddingVertical: MARGINS.section,
  },

  // Estilos de loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#F9FAFB",
    paddingHorizontal: MARGINS.horizontal,
  },
  loadingAnimation: {
    width: 120,
    height: 120,
  },
  loadingText: {
    marginTop: MARGINS.vertical * 2,
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Título Principal
  titleContainer: {
    paddingHorizontal: MARGINS.card,
    paddingVertical: MARGINS.vertical * 2,
    marginBottom: MARGINS.vertical * 2,
  },
  mainTitle: {
    fontSize: Math.min(32, screenWidth * 0.08),
    fontWeight: "800",
    color: "#111827",
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  // Card Container - Igual al ProfileScreen
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: MARGINS.vertical * 3,
  },
  cardHeader: {
    paddingHorizontal: MARGINS.section,
    paddingTop: MARGINS.section,
    paddingBottom: MARGINS.vertical * 2,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: MARGINS.vertical,
  },
  cardHeaderText: {
    marginLeft: MARGINS.vertical * 2,
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: MARGINS.vertical / 2,
  },
  cardDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  cardBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: MARGINS.card,
    paddingVertical: MARGINS.vertical / 2,
    borderRadius: 12,
  },
  cardBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  cardContent: {
    padding: MARGINS.card + 4,
  },

  // Estilos de summary - Responsivos
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: - (MARGINS.card / 2),
  },
  summaryItem: {
    width: '50%',
    paddingHorizontal: MARGINS.card / 2,
  },
  summaryItemGhost: {
    opacity: 0,
  },

  // Estilos de gráficas
  chartContainer: {
    marginBottom: MARGINS.vertical,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: MARGINS.vertical * 2,
    paddingHorizontal: MARGINS.card / 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  chartMetric: {
    alignItems: 'flex-end',
  },
  chartMetricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.chartBlue,
  },
  chartMetricLabel: {
    fontSize: 11,
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Gráficas en fila
  chartsRow: {
    flexDirection: 'row',
    gap: MARGINS.card,
  },
  chartCardHalf: {
    flex: 1,
    minWidth: 0,
  },
  chartHeaderCenter: {
    alignItems: 'center',
    marginBottom: MARGINS.vertical * 2,
  },
  chartTitleCenter: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginTop: MARGINS.vertical,
    marginBottom: MARGINS.vertical / 2,
  },
  chartSubtitleCenter: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  chartContentCenter: {
    alignItems: 'center',
  },
  
  // Legend y estados
  chartLegend: {
    marginTop: MARGINS.card,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: MARGINS.vertical * 0.75,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: MARGINS.vertical,
  },
  legendText: {
    fontSize: 12,
    color: Colors.text,
    flex: 1,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: MARGINS.section,
  },
  noDataText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: MARGINS.vertical,
    textAlign: 'center',
  },
  cardBadgeRow: {
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: MARGINS.card,
    paddingVertical: MARGINS.vertical / 2,
    borderRadius: 12,
  },
  trendControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: MARGINS.vertical * 2,
    gap: 16,
  },
  navButton: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 12,
    color: Colors.primary,
  },
  periodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    paddingHorizontal: 8,
  },
  errorText: {
    textAlign: 'center',
    color: Colors.error,
    marginTop: MARGINS.vertical,
    fontSize: 12,
    fontWeight: '600'
  }
});
