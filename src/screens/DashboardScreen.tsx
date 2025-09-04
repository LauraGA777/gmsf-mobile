import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
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
import { apiService } from '../services/api';

const { width: screenWidth } = Dimensions.get('window');

// Componente de tarjeta de ingresos con indicador de crecimiento
const RevenueCard = ({ dailyRevenue, growth }: { dailyRevenue: any, growth: number }) => {
  const isPositive = growth >= 0;
  const growthColor = isPositive ? Colors.success : Colors.error;
  const growthIcon = isPositive ? 'trending-up' : 'trending-down';

  return (
    <View style={styles.revenueCard}>
      <View style={styles.revenueHeader}>
        <Text style={styles.revenueTitle}>💰 Ingresos Diarios</Text>
        <View style={[styles.growthIndicator, { backgroundColor: growthColor }]}>
          <Ionicons name={growthIcon} size={16} color="white" />
          <Text style={styles.growthText}>{growth > 0 ? '+' : ''}{growth.toFixed(1)}%</Text>
        </View>
      </View>
      <Text style={styles.revenueAmount}>
        {new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
        }).format(dailyRevenue?.today || 0)}
      </Text>
      <Text style={styles.revenueSubtitle}>
        Ayer: {new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
        }).format(dailyRevenue?.yesterday || 0)}
      </Text>
      <Text style={styles.revenueDateText}>
        📅 {dailyRevenue?.date || new Date().toLocaleDateString('es-CO')}
      </Text>
    </View>
  );
};

// Componente de gráfico de barras para membresías por mes
const MembershipBarChart = ({ data }: { data: Array<{ month: string, contracts: number, fullName?: string }> }) => {
  // Filtrar meses con datos y asegurar que tenemos al menos 1 para evitar división por 0
  const validData = data.filter(item => item.contracts >= 0);
  const maxValue = Math.max(...validData.map(item => item.contracts), 1);
  const [animatedValues] = useState(validData.map(() => new Animated.Value(0)));

  useEffect(() => {
    if (validData.length > 0) {
      const animations = animatedValues.map((animatedValue, index) =>
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800 + (index * 100),
          useNativeDriver: false,
        })
      );

      Animated.stagger(100, animations).start();
    }
  }, [data]);

  // Si no hay datos, mostrar mensaje
  if (validData.length === 0 || maxValue === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>📊 Contratos por Mes (Enero - Junio)</Text>
        <View style={styles.emptyChartContainer}>
          <Ionicons name="bar-chart-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyChartText}>No hay datos de contratos disponibles</Text>
          <Text style={styles.emptyChartSubtext}>Los datos aparecerán cuando se registren contratos</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>📊 Contratos por Mes (Enero - Junio)</Text>
      <View style={styles.barsContainer}>
        {validData.slice(0, 6).map((item, index) => (
          <View key={index} style={styles.barItem}>
            <View style={styles.barWrapper}>
              <Animated.View
                style={[
                  styles.bar,
                  {
                    height: animatedValues[index]?.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, ((item.contracts || 0) / maxValue) * 120]
                    }) || 0,
                    backgroundColor: item.contracts > 0 ? Colors.primary : Colors.textLight
                  }
                ]}
              />
              <Text style={styles.barValueText}>{item.contracts || 0}</Text>
            </View>
            <Text style={styles.barLabel}>{item.month}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Componente de membresía más popular
const PopularMembershipCard = ({ membership }: { membership: any }) => (
  <View style={styles.popularCard}>
    <View style={styles.popularHeader}>
      <Text style={styles.popularTitle}>⭐ Membresía Más Popular</Text>
      <View style={styles.popularBadge}>
        <Text style={styles.popularBadgeText}>TOP</Text>
      </View>
    </View>
    <View style={styles.popularContent}>
      <Text style={styles.popularName}>{membership?.name || 'Premium'}</Text>
      <Text style={styles.popularStats}>
        {membership?.activeContracts || 0} contratos activos
      </Text>
      <Text style={styles.popularRevenue}>
        {new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
        }).format(membership?.price || 0)}/mes
      </Text>
      {membership?.description && (
        <Text style={styles.popularDescription}>
          {membership.description}
        </Text>
      )}
    </View>
    <View style={styles.popularFeatures}>
      <Text style={styles.featureText}>✓ Acceso 24/7</Text>
      <Text style={styles.featureText}>✓ Entrenador personal</Text>
      <Text style={styles.featureText}>✓ Clases grupales</Text>
    </View>
  </View>
);

// Componente de tarjeta de acceso rápido
const QuickAccessCard = ({ title, count, icon, color, active, inactive, onPress }: {
  title: string, count: number, icon: string, color: string, active?: number, inactive?: number, onPress: () => void
}) => (
  <TouchableOpacity style={[styles.quickAccessCard, { borderLeftColor: color }]} onPress={onPress}>
    <View style={styles.quickAccessHeader}>
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={styles.quickAccessCount}>{count || 0}</Text>
    </View>
    <Text style={styles.quickAccessTitle}>{title}</Text>
    {(active !== undefined && inactive !== undefined) && (
      <View style={styles.quickAccessStats}>
        <Text style={styles.quickAccessActive}>✅ {active} activos</Text>
        {inactive > 0 && <Text style={styles.quickAccessInactive}>❌ {inactive} inactivos</Text>}
      </View>
    )}
    <View style={styles.quickAccessFooter}>
      <Text style={styles.quickAccessAction}>Ver todos</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
    </View>
  </TouchableOpacity>
);

// Componente de estadísticas adicionales del widget
const WidgetStatsCard = ({ widget }: { widget: any }) => {
  if (!widget) return null;

  return (
    <View style={styles.widgetCard}>
      <View style={styles.widgetHeader}>
        <Text style={styles.widgetTitle}>📱 Resumen de Hoy</Text>
        <Text style={styles.widgetTime}>🕒 {widget.lastUpdate}</Text>
      </View>
      <View style={styles.widgetStats}>
        <View style={styles.widgetStat}>
          <Ionicons name="cash" size={20} color={Colors.success} />
          <Text style={styles.widgetStatLabel}>Ingresos</Text>
          <Text style={styles.widgetStatValue}>
            {new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0,
            }).format(widget.todayRevenue || 0)}
          </Text>
        </View>
        <View style={styles.widgetStat}>
          <Ionicons name="people" size={20} color={Colors.primary} />
          <Text style={styles.widgetStatLabel}>Asistencias</Text>
          <Text style={styles.widgetStatValue}>{widget.todayAttendance || 0}</Text>
        </View>
        <View style={styles.widgetStat}>
          <Ionicons name="person-add" size={20} color={Colors.warning} />
          <Text style={styles.widgetStatLabel}>Clientes Activos</Text>
          <Text style={styles.widgetStatValue}>{widget.activeClients || 0}</Text>
        </View>
      </View>
    </View>
  );
};

// Datos de fallback para cuando no hay conexión o falla la API
const getFallbackData = () => ({
  widget: {
    todayRevenue: 0,
    todayAttendance: 1,
    activeClients: 7,
    topMembership: "Membresía Premium",
    lastUpdate: new Date().toTimeString().slice(0, 5)
  },
  quickSummary: {
    todayStats: {
      revenue: 0,
      newContracts: 0,
      attendance: 1,
      activeClients: 7,
      date: new Date().toLocaleDateString('es-CO')
    },
    quickCounters: {
      users: 14,
      trainers: 4,
      clients: 7
    },
    revenueGrowth: {
      current: 450000,
      previous: 245000,
      growthPercentage: 83.7,
      isPositive: true
    },
    topMembership: {
      name: "Membresía Premium",
      price: 100000,
      sales: 2
    },
    lastUpdate: new Date().toISOString()
  },
  mainMetrics: {
    dailyRevenue: {
      today: 0,
      yesterday: 450000,
      growthPercentage: -100,
      isPositiveGrowth: false,
      date: new Date().toLocaleDateString('es-CO')
    },
    membershipsByMonth: [
      { month: "Ene", fullName: "Enero", contracts: 0, revenue: 0 },
      { month: "Feb", fullName: "Febrero", contracts: 0, revenue: 0 },
      { month: "Mar", fullName: "Marzo", contracts: 0, revenue: 0 },
      { month: "Abr", fullName: "Abril", contracts: 0, revenue: 0 },
      { month: "May", fullName: "Mayo", contracts: 0, revenue: 0 },
      { month: "Jun", fullName: "Junio", contracts: 0, revenue: 0 }
    ],
    popularMembership: {
      id: 3,
      name: "Membresía Premium",
      price: 100000,
      description: "Membresía con acceso completo",
      activeContracts: 2
    },
    quickAccessCounters: {
      users: { total: 17, active: 14, inactive: 3 },
      trainers: { total: 4, active: 4, inactive: 0 },
      clients: { total: 7, active: 7, inactive: 0 }
    },
    weeklyTrends: {
      revenue: { current: 450000, growth: 83.7 },
      contracts: { current: 1, growth: -66.7 },
      attendance: { current: 3, growth: -50 }
    },
    period: "today"
  }
});

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [quickSummary, setQuickSummary] = useState<any>(null);
  const [mainMetrics, setMainMetrics] = useState<any>(null);
  const [widget, setWidget] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sideNavVisible, setSideNavVisible] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // REMOVER: Ya no necesitamos estas variables de estado
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función simplificada para limpiar sesión
  const handleSessionExpired = async () => {
    try {
      console.log('🔄 Sesión expirada, limpiando datos...');
      await apiService.clearSession();

      // El AuthNavigator detectará automáticamente el cambio
      console.log('✅ Sesión limpiada, AuthNavigator manejará la redirección');
    } catch (error) {
      console.error('💥 Error limpiando sesión:', error);
    }
  };

  // Función simplificada de verificación de autenticación
  const checkAuthentication = async () => {
    try {
      console.log('🔍 DashboardScreen: Verificando autenticación...');

      const token = await apiService.getStoredToken();
      const user = await apiService.getStoredUser();

      console.log('Token encontrado:', token ? 'SÍ' : 'NO');
      console.log('Usuario encontrado:', user ? 'SÍ' : 'NO');

      if (!token || !user) {
        console.log('❌ Usuario no autenticado');
        await handleSessionExpired();
        return false;
      }

      console.log('✅ Usuario autenticado');
      return true;
    } catch (error) {
      console.error('💥 Error verificando autenticación:', error);
      await handleSessionExpired();
      return false;
    }
  };

  const loadData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setLoadError(null);

      console.log('🔄 Iniciando carga de datos del dashboard...');

      // Verificar autenticación primero
      const authenticated = await checkAuthentication();
      if (!authenticated) {
        console.log('⚠️ Usuario no autenticado, AuthNavigator manejará la redirección');
        setLoading(false);
        return;
      }

      // Verificar token en el interceptor
      await apiService.checkTokenStatus();

      // Intentar cargar datos de la API
      try {
        console.log('🔄 Intentando cargar datos desde la API...');

        const [widgetData, quickSummaryData, mainMetricsData] = await Promise.allSettled([
          apiService.getMobileWidget(),
          apiService.getMobileQuickSummary('today'),
          apiService.getMobileMainMetrics('today')
        ]);

        let hasRealData = false;

        // Procesar widget
        if (widgetData.status === 'fulfilled') {
          console.log('✅ Widget cargado desde API');
          setWidget(widgetData.value);
          hasRealData = true;
        } else {
          console.warn('⚠️ Widget falló, usando datos de fallback');
        }

        // Procesar quick summary
        if (quickSummaryData.status === 'fulfilled') {
          console.log('✅ Quick summary cargado desde API');
          setQuickSummary(quickSummaryData.value);
          hasRealData = true;
        } else {
          console.warn('⚠️ Quick summary falló, usando datos de fallback');
        }

        // Procesar main metrics
        if (mainMetricsData.status === 'fulfilled') {
          console.log('✅ Main metrics cargado desde API');
          setMainMetrics(mainMetricsData.value);
          hasRealData = true;
        } else {
          console.warn('⚠️ Main metrics falló, usando datos de fallback');
        }

        // Si no se pudieron cargar datos reales, usar fallback
        if (!hasRealData) {
          console.log('🔄 Todos los endpoints fallaron, usando datos de fallback...');
          const fallbackData = getFallbackData();
          setWidget(fallbackData.widget);
          setQuickSummary(fallbackData.quickSummary);
          setMainMetrics(fallbackData.mainMetrics);
          setLoadError('Mostrando datos de ejemplo - Verifica tu conexión');
        } else {
          // Completar con fallback los datos que fallaron
          const fallbackData = getFallbackData();

          if (widgetData.status === 'rejected') {
            setWidget(fallbackData.widget);
          }
          if (quickSummaryData.status === 'rejected') {
            setQuickSummary(fallbackData.quickSummary);
          }
          if (mainMetricsData.status === 'rejected') {
            setMainMetrics(fallbackData.mainMetrics);
          }

          if (widgetData.status === 'rejected' || quickSummaryData.status === 'rejected' || mainMetricsData.status === 'rejected') {
            setLoadError('Algunos datos pueden no estar actualizados');
          }
        }

      } catch (error: any) {
        console.error('💥 Error cargando datos desde API:', error);

        // Usar datos de fallback en caso de error total
        console.log('🔄 Usando datos de fallback debido a error...');
        const fallbackData = getFallbackData();
        setWidget(fallbackData.widget);
        setQuickSummary(fallbackData.quickSummary);
        setMainMetrics(fallbackData.mainMetrics);

        const statusCode = error.response?.status;
        if (statusCode === 401) {
          setLoadError('Sesión expirada, cerrando sesión...');
          setTimeout(() => handleSessionExpired(), 2000);
        } else if (statusCode === 500) {
          setLoadError('Error del servidor - Mostrando datos de ejemplo');
        } else {
          setLoadError('Error de conexión - Mostrando datos de ejemplo');
        }
      }

    } catch (error: any) {
      console.error('💥 Error general en loadData:', error);

      // Usar datos de fallback
      const fallbackData = getFallbackData();
      setWidget(fallbackData.widget);
      setQuickSummary(fallbackData.quickSummary);
      setMainMetrics(fallbackData.mainMetrics);
      setLoadError('Modo offline - Mostrando datos de ejemplo');

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

    switch (type) {
      case 'users':
        console.log('🚀 Navegando a pantalla de usuarios...');
        Alert.alert(
          'Próximamente',
          'La pantalla de usuarios estará disponible pronto.',
          [{ text: 'OK' }]
        );
        break;

      case 'trainers':
        console.log('🚀 Navegando a pantalla de entrenadores...');
        navigation.navigate('Trainers' as never);
        break;

      case 'clients':
        console.log('🚀 Navegando a pantalla de clientes...');
        navigation.navigate('Clients' as never);
        break;

      default:
        console.log('⚠️ Pantalla no implementada:', type);
        Alert.alert(
          'Próximamente',
          `La pantalla de ${type} estará disponible pronto.`,
          [{ text: 'OK' }]
        );
        break;
    }
  };

  const handleSideNavigation = (screen: string) => {
    setSideNavVisible(false);

    switch (screen) {
      case 'Dashboard':
        // Ya estamos en el dashboard
        break;

      case 'Users':
        console.log('🚀 Navegando a usuarios desde menú...');
        Alert.alert(
          'Próximamente',
          'La pantalla de usuarios estará disponible pronto.',
          [{ text: 'OK' }]
        );
        break;

      case 'Trainers':
        console.log('🚀 Navegando a entrenadores desde menú...');
        navigation.navigate('Trainers' as never);
        break;

      case 'Clients':
        console.log('🚀 Navegando a clientes desde menú...');
        navigation.navigate('Clients' as never);
        break;

      case 'Memberships':
        console.log('🚀 Navegando a membresías desde menú...');
        Alert.alert(
          'Próximamente',
          'La pantalla de membresías estará disponible pronto.',
          [{ text: 'OK' }]
        );
        break;

      case 'Payments':
        console.log('🚀 Navegando a pagos desde menú...');
        Alert.alert(
          'Próximamente',
          'La pantalla de pagos estará disponible pronto.',
          [{ text: 'OK' }]
        );
        break;

      case 'Reports':
        console.log('🚀 Navegando a reportes desde menú...');
        Alert.alert(
          'Próximamente',
          'La pantalla de reportes estará disponible pronto.',
          [{ text: 'OK' }]
        );
        break;

      case 'Settings':
        console.log('🚀 Navegando a configuración desde menú...');
        Alert.alert(
          'Próximamente',
          'La pantalla de configuración estará disponible pronto.',
          [{ text: 'OK' }]
        );
        break;

      default:
        Alert.alert(
          'Próximamente',
          `La pantalla de ${screen} estará disponible pronto.`,
          [{ text: 'OK' }]
        );
        break;
    }
  };

  // Componente de navegación lateral
  const SideNavigation = ({ isVisible, onClose }: { isVisible: boolean, onClose: () => void }) => {
    const menuItems = [
      { title: 'Dashboard', icon: 'home', screen: 'Dashboard' },
      { title: 'Usuarios', icon: 'people', screen: 'Users' },
    ];

    if (!isVisible) return null;

    return (
      <View style={styles.sideNavOverlay}>
        <TouchableOpacity style={styles.sideNavBackdrop} onPress={onClose} />
        <View style={styles.sideNavContainer}>
          <View style={styles.sideNavHeader}>
            <Text style={styles.sideNavTitle}>🏋️ GMSF Mobile</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.sideNavContent}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.sideNavItem}
                onPress={() => handleSideNavigation(item.screen)}
              >
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

  if (loading) {
    return <Loading message="Cargando dashboard..." />;
  }

  // REMOVER: Ya no necesitamos esta verificación aquí
  // if (!isAuthenticated) {
  //   return <Loading message="Redirigiendo al login..." />;
  // }

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
        <Text style={styles.headerTitle}>📊 Dashboard</Text>
        {loadError && (
          <TouchableOpacity onPress={() => setLoadError(null)}>
            <Ionicons name="warning" size={24} color={Colors.warning} />
          </TouchableOpacity>
        )}
        {!loadError && <View style={styles.headerSpacer} />}
      </View>

      {/* Mensaje de error/advertencia */}
      {loadError && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning-outline" size={16} color={Colors.warning} />
          <Text style={styles.errorBannerText}>{loadError}</Text>
          <TouchableOpacity onPress={() => setLoadError(null)}>
            <Ionicons name="close" size={16} color={Colors.warning} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Widget Stats */}
        {widget && (
          <View style={styles.section}>
            <WidgetStatsCard widget={widget} />
          </View>
        )}

        {/* Tarjeta de ingresos diarios */}
        <View style={styles.section}>
          <RevenueCard
            dailyRevenue={mainMetrics?.dailyRevenue}
            growth={mainMetrics?.dailyRevenue?.growthPercentage || 0}
          />
        </View>

        {/* Gráfico de membresías por mes */}
        <View style={styles.section}>
          <Card title="" subtitle="">
            <MembershipBarChart data={mainMetrics?.membershipsByMonth || []} />
          </Card>
        </View>

        {/* Membresía más popular */}
        <View style={styles.section}>
          <PopularMembershipCard membership={mainMetrics?.popularMembership} />
        </View>

        {/* Tarjetas de acceso rápido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Acceso Rápido</Text>
          <View style={styles.quickAccessGrid}>
            <QuickAccessCard
              title="Usuarios"
              count={mainMetrics?.quickAccessCounters?.users?.total || quickSummary?.quickCounters?.users || 0}
              active={mainMetrics?.quickAccessCounters?.users?.active}
              inactive={mainMetrics?.quickAccessCounters?.users?.inactive}
              icon="people"
              color={Colors.primary}
              onPress={() => handleQuickAccess('users')}
            />
            <QuickAccessCard
              title="Entrenadores"
              count={mainMetrics?.quickAccessCounters?.trainers?.total || quickSummary?.quickCounters?.trainers || 0}
              active={mainMetrics?.quickAccessCounters?.trainers?.active}
              inactive={mainMetrics?.quickAccessCounters?.trainers?.inactive}
              icon="fitness"
              color={Colors.success}
              onPress={() => handleQuickAccess('trainers')}
            />
            <QuickAccessCard
              title="Clientes"
              count={mainMetrics?.quickAccessCounters?.clients?.total || quickSummary?.quickCounters?.clients || 0}
              active={mainMetrics?.quickAccessCounters?.clients?.active}
              inactive={mainMetrics?.quickAccessCounters?.clients?.inactive}
              icon="person"
              color={Colors.warning}
              onPress={() => handleQuickAccess('clients')}
            />
          </View>
        </View>

        {/* Tendencias Semanales */}
        {mainMetrics?.weeklyTrends && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Tendencias Semanales</Text>
            <View style={styles.trendsContainer}>
              <View style={styles.trendItem}>
                <Ionicons name="cash" size={20} color={Colors.success} />
                <Text style={styles.trendLabel}>Ingresos</Text>
                <Text style={[styles.trendValue, { color: mainMetrics.weeklyTrends.revenue.growth >= 0 ? Colors.success : Colors.error }]}>
                  {mainMetrics.weeklyTrends.revenue.growth >= 0 ? '+' : ''}{mainMetrics.weeklyTrends.revenue.growth.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.trendItem}>
                <Ionicons name="document" size={20} color={Colors.primary} />
                <Text style={styles.trendLabel}>Contratos</Text>
                <Text style={[styles.trendValue, { color: mainMetrics.weeklyTrends.contracts.growth >= 0 ? Colors.success : Colors.error }]}>
                  {mainMetrics.weeklyTrends.contracts.growth >= 0 ? '+' : ''}{mainMetrics.weeklyTrends.contracts.growth.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.trendItem}>
                <Ionicons name="people" size={20} color={Colors.warning} />
                <Text style={styles.trendLabel}>Asistencia</Text>
                <Text style={[styles.trendValue, { color: mainMetrics.weeklyTrends.attendance.growth >= 0 ? Colors.success : Colors.error }]}>
                  {mainMetrics.weeklyTrends.attendance.growth >= 0 ? '+' : ''}{mainMetrics.weeklyTrends.attendance.growth.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🕒 Última actualización: {quickSummary?.lastUpdate ?
              new Date(quickSummary.lastUpdate).toLocaleString('es-CO') :
              new Date().toLocaleString('es-CO')
            }
          </Text>
          <Text style={styles.footerSubtext}>
            {loadError ? '📱 Datos de ejemplo' : '📡 Datos en tiempo real desde la API'}
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
    width: 44,
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

  // Widget Card
  widgetCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  widgetTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  widgetTime: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  widgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  widgetStat: {
    alignItems: 'center',
    flex: 1,
  },
  widgetStatLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  widgetStatValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginTop: Spacing.xs,
    textAlign: 'center',
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
    marginBottom: Spacing.xs,
  },
  revenueDateText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
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
  emptyChartContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  emptyChartSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    marginTop: Spacing.xs,
    textAlign: 'center',
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
    marginBottom: Spacing.xs,
  },
  popularDescription: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    fontStyle: 'italic',
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
  quickAccessStats: {
    marginBottom: Spacing.sm,
  },
  quickAccessActive: {
    fontSize: FontSize.xs,
    color: Colors.success,
    marginBottom: 2,
  },
  quickAccessInactive: {
    fontSize: FontSize.xs,
    color: Colors.error,
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

  // Trends
  trendsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  trendLabel: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  trendValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
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
    marginBottom: Spacing.xs,
  },
  footerSubtext: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  // Error Banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.warning + '50',
  },
  errorBannerText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.warning,
    marginHorizontal: Spacing.sm,
  },
});

