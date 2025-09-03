import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Loading } from '../components';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/layout';

const { width: screenWidth } = Dimensions.get('window');

// Componente de tarjeta de ingresos con indicador de crecimiento
const RevenueCard = ({ dailyRevenue, growth }: { dailyRevenue: number, growth: number }) => {
  const isPositive = growth >= 0;
  const growthColor = isPositive ? Colors.success : Colors.error;
  const growthIcon = isPositive ? 'trending-up' : 'trending-down';

  return (
    <View style={styles.revenueCard}>
      <View style={styles.revenueHeader}>
        <Text style={styles.revenueTitle}>Ingresos Diarios</Text>
        <View style={[styles.growthIndicator, { backgroundColor: growthColor }]}>
          <Ionicons name={growthIcon} size={16} color="white" />
          <Text style={styles.growthText}>{growth > 0 ? '+' : ''}{growth}%</Text>
        </View>
      </View>
      <Text style={styles.revenueAmount}>
        {new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
        }).format(dailyRevenue)}
      </Text>
      <Text style={styles.revenueSubtitle}>Comparado con ayer</Text>
    </View>
  );
};

// Componente de gráfico de barras para membresías por mes
const MembershipBarChart = ({ data }: { data: Array<{ month: string, value: number }> }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  const [animatedValues] = useState(data.map(() => new Animated.Value(0)));

  useEffect(() => {
    const animations = animatedValues.map((animatedValue, index) =>
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 800 + (index * 100),
        useNativeDriver: false,
      })
    );

    Animated.stagger(100, animations).start();
  }, []);

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Membresías por Mes (Enero - Junio)</Text>
      <View style={styles.barsContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.barItem}>
            <View style={styles.barWrapper}>
              <Animated.View
                style={[
                  styles.bar,
                  {
                    height: animatedValues[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, (item.value / maxValue) * 120]
                    }),
                    backgroundColor: Colors.primary
                  }
                ]}
              />
              <Text style={styles.barValueText}>{item.value}</Text>
            </View>
            <Text style={styles.barLabel}>{item.month}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Componente de membresía más popular
const PopularMembershipCard = () => (
  <View style={styles.popularCard}>
    <View style={styles.popularHeader}>
      <Text style={styles.popularTitle}>Membresía Más Popular</Text>
      <View style={styles.popularBadge}>
        <Text style={styles.popularBadgeText}>TOP</Text>
      </View>
    </View>
    <View style={styles.popularContent}>
      <Text style={styles.popularName}>Premium</Text>
      <Text style={styles.popularStats}>156 miembros activos</Text>
      <Text style={styles.popularRevenue}>$850,000 COP/mes</Text>
    </View>
    <View style={styles.popularFeatures}>
      <Text style={styles.featureText}>✓ Acceso 24/7</Text>
      <Text style={styles.featureText}>✓ Entrenador personal</Text>
      <Text style={styles.featureText}>✓ Clases grupales</Text>
    </View>
  </View>
);

// Componente de tarjeta de acceso rápido
const QuickAccessCard = ({ title, count, icon, color, onPress }: {
  title: string, count: number, icon: string, color: string, onPress: () => void
}) => (
  <TouchableOpacity style={[styles.quickAccessCard, { borderLeftColor: color }]} onPress={onPress}>
    <View style={styles.quickAccessHeader}>
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={styles.quickAccessCount}>{count}</Text>
    </View>
    <Text style={styles.quickAccessTitle}>{title}</Text>
    <View style={styles.quickAccessFooter}>
      <Text style={styles.quickAccessAction}>Ver todos</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
    </View>
  </TouchableOpacity>
);

// Componente de navegación lateral
const SideNavigation = ({ isVisible, onClose }: { isVisible: boolean, onClose: () => void }) => {
  const menuItems = [
    { title: 'Dashboard', icon: 'home', screen: 'Dashboard' },
    { title: 'Usuarios', icon: 'people', screen: 'Users' },
    { title: 'Entrenadores', icon: 'fitness', screen: 'Trainers' },
    { title: 'Clientes', icon: 'person', screen: 'Clients' },
    { title: 'Membresías', icon: 'card', screen: 'Memberships' },
    { title: 'Pagos', icon: 'wallet', screen: 'Payments' },
    { title: 'Reportes', icon: 'bar-chart', screen: 'Reports' },
    { title: 'Configuración', icon: 'settings', screen: 'Settings' },
  ];

  if (!isVisible) return null;

  return (
    <View style={styles.sideNavOverlay}>
      <TouchableOpacity style={styles.sideNavBackdrop} onPress={onClose} />
      <View style={styles.sideNavContainer}>
        <View style={styles.sideNavHeader}>
          <Text style={styles.sideNavTitle}>GMSF Mobile</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.sideNavContent}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.sideNavItem} onPress={onClose}>
              <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
              <Text style={styles.sideNavItemText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export const DashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sideNavVisible, setSideNavVisible] = useState(false);

  const loadData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      // Datos de ejemplo realistas
      setStats({
        dailyRevenue: 2450000,
        revenueGrowth: 12.5,
        membershipsByMonth: [
          { month: 'Ene', value: 45 },
          { month: 'Feb', value: 52 },
          { month: 'Mar', value: 48 },
          { month: 'Abr', value: 67 },
          { month: 'May', value: 73 },
          { month: 'Jun', value: 85 },
        ],
        quickAccess: {
          users: 245,
          trainers: 12,
          clients: 189,
        }
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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

  const handleQuickAccess = (type: string) => {
    console.log(`Navigate to ${type}`);
    // Aquí implementarías la navegación
  };

  if (loading) {
    return <Loading message="Cargando dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header fijo visible */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setSideNavVisible(true)}
        >
          <Ionicons name="menu" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta de ingresos diarios */}
        <View style={styles.section}>
          <RevenueCard
            dailyRevenue={stats?.dailyRevenue || 0}
            growth={stats?.revenueGrowth || 0}
          />
        </View>

        {/* Gráfico de membresías por mes */}
        <View style={styles.section}>
          <Card title="" subtitle="">
            <MembershipBarChart data={stats?.membershipsByMonth || []} />
          </Card>
        </View>

        {/* Membresía más popular */}
        <View style={styles.section}>
          <PopularMembershipCard />
        </View>

        {/* Tarjetas de acceso rápido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acceso Rápido</Text>
          <View style={styles.quickAccessGrid}>
            <QuickAccessCard
              title="Usuarios"
              count={stats?.quickAccess?.users || 0}
              icon="people"
              color={Colors.primary}
              onPress={() => handleQuickAccess('users')}
            />
            <QuickAccessCard
              title="Entrenadores"
              count={stats?.quickAccess?.trainers || 0}
              icon="fitness"
              color={Colors.success}
              onPress={() => handleQuickAccess('trainers')}
            />
            <QuickAccessCard
              title="Clientes"
              count={stats?.quickAccess?.clients || 0}
              icon="person"
              color={Colors.warning}
              onPress={() => handleQuickAccess('clients')}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Última actualización: {new Date().toLocaleString('es-CO')}
          </Text>
        </View>
      </ScrollView>

      {/* Navegación lateral */}
      <SideNavigation
        isVisible={sideNavVisible}
        onClose={() => setSideNavVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header fijo y visible
  fixedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: Colors.divider,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  menuButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  headerSpacer: {
    width: 44, // Mismo ancho que el botón de menú para centrar el título
  },

  scrollView: {
    flex: 1,
  },
  section: {
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  // Revenue Card
  revenueCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  revenueTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  growthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  growthText: {
    color: 'white',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    marginLeft: 4,
  },
  revenueAmount: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  revenueSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // Chart
  chartContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  chartTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: Spacing.sm,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 32,
    position: 'relative',
  },
  bar: {
    width: 32,
    borderRadius: 4,
    minHeight: 5,
  },
  barValueText: {
    position: 'absolute',
    top: -20,
    fontSize: FontSize.xs,
    color: Colors.text,
    fontWeight: FontWeight.bold,
  },
  barLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 8,
    fontWeight: FontWeight.medium,
  },

  // Popular Membership
  popularCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  popularHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  popularTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  popularBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  popularBadgeText: {
    color: 'white',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  popularContent: {
    marginBottom: Spacing.md,
  },
  popularName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  popularStats: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  popularRevenue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.success,
  },
  popularFeatures: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.md,
  },
  featureText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },

  // Quick Access
  quickAccessGrid: {
    gap: Spacing.sm,
  },
  quickAccessCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    marginBottom: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickAccessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  quickAccessCount: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  quickAccessTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  quickAccessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickAccessAction: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },

  // Side Navigation
  sideNavOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  sideNavBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sideNavContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: Colors.surface,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
  },
  sideNavHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.primary,
  },
  sideNavTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: 'white',
  },
  sideNavContent: {
    flex: 1,
    padding: Spacing.sm,
  },
  sideNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  sideNavItemText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    marginLeft: Spacing.md,
    fontWeight: FontWeight.medium,
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
