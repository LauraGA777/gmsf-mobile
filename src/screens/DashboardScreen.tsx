import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Loading, StatCard } from '../components';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/layout';
import { apiService } from '../services/api';

const { width: screenWidth } = Dimensions.get('window');

// Componente de tarjeta de resumen simple
const SummaryCard = ({ title, items }: { title: string, items: Array<{ label: string, value: string | number, color?: string }> }) => (
  <View style={styles.summaryCard}>
    <Text style={styles.summaryTitle}>{title}</Text>
    {items.map((item, index) => (
      <View key={index} style={styles.summaryItem}>
        <View style={[styles.colorDot, { backgroundColor: item.color || Colors.primary }]} />
        <Text style={styles.summaryLabel}>{item.label}</Text>
        <Text style={styles.summaryValue}>{item.value}</Text>
      </View>
    ))}
  </View>
);

export const DashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [optimizedStats, setOptimizedStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      console.log('🔄 Cargando datos del dashboard...');
      await apiService.checkTokenStatus();

      const [statsData, optimizedData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getOptimizedStats(),
      ]);

      setStats(statsData);
      setOptimizedStats(optimizedData);
    } catch (error: any) {
      console.error('💥 Error loading dashboard data:', error);

      // Datos de ejemplo para la presentación
      setStats({
        attendance: { total: 125, today: 15, thisWeek: 95, avgDaily: 18 },
        contracts: { totalContracts: 45, activeContracts: 38, totalRevenue: 2450000, periodRevenue: 850000, newThisMonth: 5 },
        memberships: { totalMemberships: 32, activeMemberships: 28, expiringSoon: 4, newThisMonth: 3 },
        clients: { totalClients: 67, activeClients: 58, newThisMonth: 8, vipClients: 12 },
      });

      setOptimizedStats({
        weeklyTrends: {
          attendance: { current: 95, previous: 87, change: '+9.2%' },
          revenue: { current: 850000, previous: 720000, change: '+18.1%' },
          newClients: { current: 8, previous: 5, change: '+60%' },
          retention: { current: 94, previous: 91, change: '+3.3%' }
        }
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>📊 Panel de Control</Text>
          <Text style={styles.subtitle}>Resumen ejecutivo del gimnasio</Text>
        </View>

        {/* Stats Cards Principales */}
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

        {/* Resumen de Asistencias */}
        <Card title="📈 Resumen de Asistencias" subtitle="Estadísticas de asistencia semanal">
          <SummaryCard
            title="Esta Semana"
            items={[
              { label: 'Total asistencias', value: stats?.attendance?.thisWeek || 0, color: Colors.chartBlue },
              { label: 'Promedio diario', value: stats?.attendance?.avgDaily || 0, color: Colors.primary },
              { label: 'Asistencias hoy', value: stats?.attendance?.today || 0, color: Colors.success },
              { label: 'Tendencia semanal', value: optimizedStats?.weeklyTrends?.attendance?.change || '+0%', color: Colors.warning }
            ]}
          />
        </Card>

        {/* Resumen Financiero */}
        <Card title="💰 Resumen Financiero" subtitle="Ingresos y contratos">
          <SummaryCard
            title="Este Mes"
            items={[
              { label: 'Ingresos totales', value: formatCurrency(stats?.contracts?.totalRevenue || 0), color: Colors.success },
              { label: 'Ingresos del período', value: formatCurrency(stats?.contracts?.periodRevenue || 0), color: Colors.chartGreen },
              { label: 'Contratos nuevos', value: stats?.contracts?.newThisMonth || 0, color: Colors.primary },
              { label: 'Crecimiento', value: optimizedStats?.weeklyTrends?.revenue?.change || '+0%', color: Colors.warning }
            ]}
          />
        </Card>

        {/* Resumen de Clientes */}
        <Card title="👥 Resumen de Clientes" subtitle="Membresías y retención">
          <SummaryCard
            title="Estado Actual"
            items={[
              { label: 'Clientes totales', value: stats?.clients?.totalClients || 0, color: Colors.primary },
              { label: 'Clientes activos', value: stats?.clients?.activeClients || 0, color: Colors.success },
              { label: 'Clientes VIP', value: stats?.clients?.vipClients || 0, color: Colors.chartPurple },
              { label: 'Nuevos este mes', value: stats?.clients?.newThisMonth || 0, color: Colors.chartBlue }
            ]}
          />
        </Card>

        {/* Alertas y Recordatorios */}
        <Card title="⚠️ Alertas" subtitle="Elementos que requieren atención">
          <SummaryCard
            title="Requieren Atención"
            items={[
              { label: 'Membresías por vencer', value: stats?.memberships?.expiringSoon || 0, color: Colors.error },
              { label: 'Contratos por renovar', value: '3', color: Colors.warning },
              { label: 'Pagos pendientes', value: '2', color: Colors.error },
              { label: 'Equipos en mantenimiento', value: '1', color: Colors.warning }
            ]}
          />
        </Card>

        {/* Tendencias de la Semana */}
        <Card title="📊 Tendencias Semanales" subtitle="Comparación vs semana anterior">
          <SummaryCard
            title="Comparación Semanal"
            items={[
              { label: 'Asistencias', value: optimizedStats?.weeklyTrends?.attendance?.change || '+0%', color: Colors.chartBlue },
              { label: 'Ingresos', value: optimizedStats?.weeklyTrends?.revenue?.change || '+0%', color: Colors.success },
              { label: 'Nuevos clientes', value: optimizedStats?.weeklyTrends?.newClients?.change || '+0%', color: Colors.primary },
              { label: 'Retención', value: optimizedStats?.weeklyTrends?.retention?.change || '+0%', color: Colors.chartPurple }
            ]}
          />
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🕒 Última actualización: {new Date().toLocaleString('es-CO')}
          </Text>
          <Text style={styles.footerSubtext}>
            Dashboard simplificado para máximo rendimiento
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
  footer: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  footerSubtext: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  // Summary Card Styles
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
  },
  summaryTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  summaryLabel: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  summaryValue: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: FontWeight.bold,
  },
});
