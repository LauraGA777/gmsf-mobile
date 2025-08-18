import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from './src/constants/colors';
import { ClientsScreen, DashboardScreen, LoginScreen, ProfileScreen, TrainersScreen } from './src/screens';
import { apiService } from './src/services/api';
import { RootTabParamList } from './src/types';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App(): React.JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsCheckingAuth(true);

      // Verificar si existen datos de autenticación almacenados
      const storedUser = await AsyncStorage.getItem('user');
      const storedAccessToken = await AsyncStorage.getItem('accessToken');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');

      console.log('🔍 Verificando estado de autenticación...');

      if (storedUser && storedAccessToken && storedRefreshToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('👤 Usuario encontrado en storage:', parsedUser.correo);

          // Establecer el token en el servicio API
          await apiService.setToken(storedAccessToken);

          // Verificar que el token sea válido haciendo una petición de prueba
          try {
            await apiService.getProfile();
            console.log('✅ Token válido, usuario autenticado');
            setIsAuthenticated(true);
          } catch (apiError) {
            console.log('❌ Token inválido, limpiando sesión');
            await clearAuthData();
            setIsAuthenticated(false);
          }
        } catch (parseError) {
          console.log('❌ Error parseando datos de usuario, limpiando sesión');
          await clearAuthData();
          setIsAuthenticated(false);
        }
      } else {
        console.log('ℹ️ No hay datos de autenticación almacenados');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('💥 Error verificando autenticación:', error);
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const clearAuthData = async () => {
    try {
      console.log('🧹 Limpiando datos de autenticación...');
      await AsyncStorage.multiRemove([
        'authToken',      // Config.AUTH.TOKEN_KEY
        'user',           // Para compatibilidad con LoginScreen
        'accessToken',    // Para compatibilidad con LoginScreen  
        'refreshToken',   // Token de refresco
        'userInfo'        // Info del usuario en apiService
      ]);
      await apiService.clearSession();
      console.log('✅ Datos de autenticación limpiados completamente');
    } catch (error) {
      console.error('Error limpiando datos de autenticación:', error);
    }
  };

  const handleLoginSuccess = () => {
    console.log('🎉 Login exitoso, actualizando estado de autenticación');
    console.log('📊 Estado actual isAuthenticated:', isAuthenticated);
    setIsAuthenticated(true);
    console.log('✅ Estado cambiado a autenticado - debería redireccionar');
  };

  const handleLogout = async () => {
    console.log('🚪 Cerrando sesión...');
    try {
      // Intentar hacer logout en el servidor
      await apiService.logout();
      console.log('✅ Logout exitoso en el servidor');
    } catch (error) {
      console.warn('⚠️ Error en logout del servidor, continuando con logout local:', error);
      // Continuar con logout local aunque falle el servidor
    }

    try {
      // Limpiar datos locales siempre
      await clearAuthData();
      setIsAuthenticated(false);
      console.log('✅ Sesión cerrada exitosamente');
    } catch (error) {
      console.error('❌ Error crítico en logout local:', error);
      // Forzar logout aunque haya errores
      setIsAuthenticated(false);
    }
  };

  // Pantalla de carga mientras se verifica la autenticación
  if (isCheckingAuth) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Verificando autenticación...</Text>
        </View>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  // Si no está autenticado, mostrar LoginScreen
  if (!isAuthenticated) {
    console.log('🔑 Mostrando LoginScreen - Usuario no autenticado');
    return (
      <SafeAreaProvider>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  // Si está autenticado, mostrar la aplicación principal
  console.log('🏠 Mostrando aplicación principal - Usuario autenticado');

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.textLight,
            tabBarStyle: {
              backgroundColor: Colors.surface,
              borderTopColor: Colors.border,
              // Más alto y con padding para no chocar con nav bar de Android
              paddingBottom: 6,
              paddingTop: 6,
              height: 68,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
          }}
        >
          <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              tabBarLabel: 'Inicio',
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="dashboard" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Entrenadores"
            component={TrainersScreen}
            options={{
              tabBarLabel: 'Entrenadores',
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="fitness-center" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Clientes"
            component={ClientsScreen}
            options={{
              tabBarLabel: 'Clientes',
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="people" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Perfil"
            options={{
              tabBarLabel: 'Perfil',
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="account-circle" size={size} color={color} />
              ),
            }}
          >
            {() => <ProfileScreen onLogout={handleLogout} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});
