import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DashboardScreen, TrainersScreen, ClientsScreen, ProfileScreen, LoginScreen } from './src/screens';
import { Colors } from './src/constants/colors';
import { RootTabParamList } from './src/types';
import { apiService } from './src/services/api';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App(): React.JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await apiService.getStoredToken();
      if (token) {
        // Establecer el token y verificar que sea válido
        await apiService.setToken(token);
        try {
          await apiService.getProfile(); // Verificar token con el endpoint de perfil
          setIsAuthenticated(true);
        } catch (error) {
          console.log('Token inválido, limpiando sesión local');
          await apiService.clearSession();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await apiService.logout();
    setIsAuthenticated(false);
  };

  if (isCheckingAuth) {
    // Mostrar una pantalla de carga mientras se verifica la autenticación
    return <SafeAreaProvider><></></SafeAreaProvider>;
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

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
              paddingBottom: 14,
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
