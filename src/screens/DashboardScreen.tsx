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

const { width: screenWidth } = Dimensions.get('window');

interface DashboardData {
  trainers: {
    active: number;
    inactive: number;
    total: number;
  };
  clients: {
    active: number;
    inactive: number;
    total: number;
  };
  summary: {
    totalAttendances: number;
    activeContracts: number;
    monthlyRevenue: number;
    activeMemberships: number;
    newClients: number;
  };
  trends: {
    attendanceData: Array<{ date: string; value: number }>;
    revenueData: Array<{ date: string; value: number }>;
  };
  lastUpdate?: string;
}

export const DashboardScreen: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del dashboard
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      
      console.log('🔄 Cargando datos del dashboard móvil...');
      
      // Obtener datos de entrenadores y clientes en paralelo
      const [trainersResponse, clientsResponse] = await Promise.all([
        apiService.getTrainers({ page: 1, limit: 50 }), // Máximo 50 según validación API
        apiService.getClients({ page: 1, limit: 50 })   // Máximo 50 según validación API  
      ]).catch(async (error) => {
        // Si falla getTrainers, intentar solo clientes
        console.warn('Error obteniendo entrenadores, continuando solo con clientes:', error);
        const clientsOnly = await apiService.getClients({ page: 1, limit: 50 });
        return [{ data: [] }, clientsOnly]; // Array vacío para trainers
      });

      // Procesar datos de entrenadores
      const trainers = trainersResponse.data || [];
      let trainersData = { active: 0, inactive: 0, total: 0 };
      
      console.log('🔍 Datos de entrenadores recibidos:', trainers);
      
      if (Array.isArray(trainers) && trainers.length > 0) {
        trainersData = {
          active: trainers.filter((t: any) => t.activo === true || t.estado === true).length,
          inactive: trainers.filter((t: any) => t.activo === false || t.estado === false).length,
          total: trainers.length
        };
      }

      // Procesar datos de clientes
      const clients = clientsResponse.data || [];
      let clientsData = { active: 0, inactive: 0, total: 0 };
      
      if (Array.isArray(clients) && clients.length > 0) {
        clientsData = {
          active: clients.filter((c: any) => c.activo === true || c.estado === true).length,
          inactive: clients.filter((c: any) => c.activo === false || c.estado === false).length,
          total: clients.length
        };
      }

      const dashboardData: DashboardData = {
        trainers: trainersData,
        clients: clientsData,
        summary: {
          totalAttendances: 2, // Simulado - puedes conectar con API real
          activeContracts: 5,
          monthlyRevenue: 450000,
          activeMemberships: 3,
          newClients: clientsData.total
        },
        trends: {
          attendanceData: [
            { date: '01/09', value: 0 },
            { date: '02/09', value: 1 },
            { date: '03/09', value: 2 },
            { date: '04/09', value: 1 },
            { date: '05/09', value: 0 }
          ],
          revenueData: [
            { date: '01/09', value: 100000 },
            { date: '02/09', value: 150000 },
            { date: '03/09', value: 200000 },
            { date: '04/09', value: 300000 },
            { date: '05/09', value: 450000 }
          ]
        },
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

  // Manejar pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData(true);
  }, [loadDashboardData]);

  // Preparar datos para gráficas de pie
  const getTrainersChartData = () => {
    if (!data) return [];
    
    return [
      {
        label: 'Activos',
        value: data.trainers.active,
        color: Colors.success
      },
      {
        label: 'Inactivos',
        value: data.trainers.inactive,
        color: Colors.error
      }
    ];
  };

  const getClientsChartData = () => {
    if (!data) return [];
    
    return [
      {
        label: 'Activos',
        value: data.clients.active,
        color: Colors.primary
      },
      {
        label: 'Inactivos',
        value: data.clients.inactive,
        color: Colors.warning
      }
    ];
  };

  // Pantalla de carga con animación
  if (loading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require('../../assets/lottie/loading.json')}
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
        <Text style={styles.loadingText}>Cargando datos...</Text>
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
        {/* Header mejorado */}
        <View style={styles.headerImproved}>
          <View style={styles.headerContent}>
            <View style={styles.headerMain}>
              <Text style={styles.titleImproved}>Panel de Control</Text>
              <Text style={styles.subtitleImproved}>Gestión completa del gimnasio</Text>
            </View>
            <View style={styles.headerStats}>
              <View style={styles.headerStatItem}>
                <MaterialIcons name="trending-up" size={16} color={Colors.success} />
                <Text style={styles.headerStatText}>Activo</Text>
              </View>
            </View>
          </View>
          {data?.lastUpdate && (
            <View style={styles.lastUpdateContainer}>
              <MaterialIcons name="schedule" size={14} color={Colors.textLight} />
              <Text style={styles.lastUpdateImproved}>
                Última actualización: {data.lastUpdate}
              </Text>
            </View>
          )}
        </View>

        {/* Resumen General - Estilo Moderno */}
        <View style={styles.summarySection}>
          <View style={styles.sectionHeaderImproved}>
            <View style={styles.headerIconContainer}>
              <MaterialIcons name="dashboard" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Resumen General</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>Tiempo real</Text>
            </View>
          </View>
          
          <View style={styles.modernSummaryContainer}>
            {/* Primera fila: 2 tarjetas */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryCardHalf}>
                <SummaryCard
                  title="Asistencias"
                  value={data?.summary.totalAttendances || 0}
                  subtitle="Total de asistencias registradas"
                  icon="pulse"
                  color={Colors.primary}
                  trend={{
                    value: (data?.summary.totalAttendances || 0) >= 2 ? 80.0 : 20.0,
                    isPositive: (data?.summary.totalAttendances || 0) >= 2
                  }}
                />
              </View>
              <View style={styles.summaryCardHalf}>
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
            </View>

            {/* Segunda fila: 2 tarjetas */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryCardHalf}>
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
              <View style={styles.summaryCardHalf}>
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
            </View>

            {/* Tercera fila: 1 tarjeta centrada pero con mismo ancho */}
            <View style={styles.summaryRowSingle}>
              <View style={styles.summaryCardCentered}>
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
            </View>
          </View>
        </View>

        {/* Gráficas de Tendencias - Mejorado */}
        <View style={styles.chartsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.headerIconContainer}>
              <MaterialIcons name="trending-up" size={22} color={Colors.chartBlue} />
            </View>
            <Text style={styles.sectionTitle}>Tendencias de Rendimiento</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>Últimos 7 días</Text>
            </View>
          </View>
          
          {/* Gráfica de Asistencias - Mejorada */}
          <View style={styles.chartCardImproved}>
            <View style={styles.chartHeaderImproved}>
              <View style={styles.chartTitleContainer}>
                <Text style={styles.chartTitleMain}>Asistencias Diarias</Text>
                <Text style={styles.chartSubtitle}>Monitoreo de actividad del gimnasio</Text>
              </View>
              <View style={styles.chartMetric}>
                <Text style={styles.chartMetricValue}>{data?.summary.totalAttendances || 0}</Text>
                <Text style={styles.chartMetricLabel}>Total</Text>
              </View>
            </View>
            <LineChart
              data={data?.trends.attendanceData || []}
              title=""
              color={Colors.chartBlue}
              height={200}
            />
          </View>
        </View>

        {/* Gráficas de Estado - Rediseñadas simétricamente */}
        <View style={styles.chartsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.headerIconContainer}>
              <MaterialIcons name="donut-large" size={22} color={Colors.success} />
            </View>
            <Text style={styles.sectionTitle}>Distribución de Personal y Clientes</Text>
          </View>
          
          <View style={styles.chartsContainerImproved}>
            {/* Gráfica de Entrenadores - Mejorada */}
            <View style={styles.chartCardSymmetric}>
              <View style={styles.chartHeaderSymmetric}>
                <View style={styles.chartIconContainer}>
                  <MaterialIcons name="fitness-center" size={20} color={Colors.success} />
                </View>
                <Text style={styles.chartTitleSymmetric}>Entrenadores</Text>
                <Text style={styles.chartSubtitleSymmetric}>Estado del personal</Text>
              </View>
              
              {data && data.trainers.total > 0 ? (
                <View style={styles.chartContentContainer}>
                  <PieChart
                    data={getTrainersChartData()}
                    size={140}
                    strokeWidth={14}
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
                <View style={styles.noDataContainerImproved}>
                  <MaterialIcons name="info-outline" size={40} color={Colors.textLight} />
                  <Text style={styles.noDataTextImproved}>Sin datos disponibles</Text>
                </View>
              )}
            </View>

            {/* Gráfica de Clientes - Mejorada y simétrica */}
            <View style={styles.chartCardSymmetric}>
              <View style={styles.chartHeaderSymmetric}>
                <View style={styles.chartIconContainer}>
                  <MaterialIcons name="people" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.chartTitleSymmetric}>Clientes</Text>
                <Text style={styles.chartSubtitleSymmetric}>Estado de membresías</Text>
              </View>
              
              {data && data.clients.total > 0 ? (
                <View style={styles.chartContentContainer}>
                  <PieChart
                    data={getClientsChartData()}
                    size={140}
                    strokeWidth={14}
                    centerText={data.clients.total.toString()}
                    centerSubtext="Total"
                    showLabels={false}
                  />
                  <View style={styles.chartLegend}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
                      <Text style={styles.legendText}>Activos: {data.clients.active}</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: Colors.textLight }]} />
                      <Text style={styles.legendText}>Inactivos: {data.clients.total - data.clients.active}</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.noDataContainerImproved}>
                  <MaterialIcons name="info-outline" size={40} color={Colors.textLight} />
                  <Text style={styles.noDataTextImproved}>Sin datos disponibles</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingAnimation: {
    width: 120,
    height: 120,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 32,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 8,
  },
  lastUpdate: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  
  // Nuevos estilos para el resumen y secciones
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  chartsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  metricsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  
  // Nuevos estilos para la distribución en cuadrícula
  summaryContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  summaryRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  summaryRowBottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  
  metricsContainer: {
    paddingHorizontal: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartsContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 8,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  // Nuevos estilos para el diseño moderno
  modernSummaryContainer: {
    paddingHorizontal: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  summaryCardHalf: {
    flex: 1,
  },
  summaryCardThird: {
    flex: 1,
    marginHorizontal: 2,
  },
  summaryRowSingle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  summaryCardSingle: {
    width: '70%', // 70% del ancho para centrar y dar espacio
  },
  summaryCardCentered: {
    width: '48%', // Mismo ancho que las tarjetas de arriba para simetría
  },
  
  // Estilos mejorados para headers
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  
  // Estilos mejorados para gráficas
  chartCardImproved: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeaderImproved: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  chartTitleContainer: {
    flex: 1,
  },
  chartTitleMain: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
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
  
  // Contenedor mejorado para gráficas simétricas
  chartsContainerImproved: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  chartCardSymmetric: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeaderSymmetric: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chartIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTitleSymmetric: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  chartSubtitleSymmetric: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  chartContentContainer: {
    alignItems: 'center',
  },
  chartLegend: {
    marginTop: 12,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: Colors.text,
    flex: 1,
  },
  noDataContainerImproved: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDataTextImproved: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Estilos mejorados para el header principal
  headerImproved: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerMain: {
    flex: 1,
  },
  titleImproved: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitleImproved: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '500',
  },
  headerStats: {
    alignItems: 'flex-end',
  },
  headerStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerStatText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: 4,
  },
  lastUpdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastUpdateImproved: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 6,
    fontStyle: 'italic',
  },
  
  // Header de sección mejorado
  sectionHeaderImproved: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
});
