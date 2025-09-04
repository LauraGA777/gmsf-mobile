import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { Loading } from '../components';
import { Colors } from '../constants/colors';
import { ClientsScreen } from '../screens/ClientsScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TrainersScreen } from '../screens/TrainersScreen';
import { apiService } from '../services/api';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack para usuarios autenticados con tabs
const AuthenticatedTabs = ({ onLogout }: { onLogout: () => void }) => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.textLight,
            tabBarStyle: {
                backgroundColor: Colors.surface,
                borderTopColor: Colors.border,
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
            name="Trainers"
            component={TrainersScreen}
            options={{
                tabBarLabel: 'Entrenadores',
                tabBarIcon: ({ color, size }) => (
                    <MaterialIcons name="fitness-center" size={size} color={color} />
                ),
            }}
        />
        <Tab.Screen
            name="Clients"
            component={ClientsScreen}
            options={{
                tabBarLabel: 'Clientes',
                tabBarIcon: ({ color, size }) => (
                    <MaterialIcons name="people" size={size} color={color} />
                ),
            }}
        />
        <Tab.Screen
            name="Profile"
            options={{
                tabBarLabel: 'Perfil',
                tabBarIcon: ({ color, size }) => (
                    <MaterialIcons name="account-circle" size={size} color={color} />
                ),
            }}
        >
            {() => <ProfileScreen onLogout={async () => await onLogout()} />}
        </Tab.Screen>
    </Tab.Navigator>
);

// Stack para usuarios no autenticados
const UnauthenticatedStack = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login">
            {() => <LoginScreen onLoginSuccess={onLoginSuccess} />}
        </Stack.Screen>
    </Stack.Navigator>
);

export const AuthNavigator: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Verificar estado de autenticación al iniciar
    const checkAuthStatus = async () => {
        try {
            console.log('🔍 AuthNavigator: Verificando estado de autenticación...');

            const token = await apiService.getStoredToken();
            const user = await apiService.getStoredUser();

            console.log('🔍 AuthNavigator: Token encontrado:', token ? 'SÍ' : 'NO');
            console.log('🔍 AuthNavigator: Usuario encontrado:', user ? 'SÍ' : 'NO');

            if (token && user) {
                try {
                    // Verificar que el token sea válido
                    await apiService.checkTokenStatus();
                    console.log('✅ AuthNavigator: Token válido, usuario autenticado');
                    setIsAuthenticated(true);
                } catch (error) {
                    console.log('❌ AuthNavigator: Token inválido, limpiando sesión');
                    await apiService.clearSession();
                    setIsAuthenticated(false);
                }
            } else {
                console.log('ℹ️ AuthNavigator: No hay datos de autenticación');
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('💥 AuthNavigator: Error verificando autenticación:', error);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Manejar login exitoso
    const handleLoginSuccess = () => {
        console.log('🎉 AuthNavigator: Login exitoso');
        setIsAuthenticated(true);
    };

    // Manejar logout
    const handleLogout = async () => {
        try {
            console.log('🚪 AuthNavigator: Cerrando sesión...');
            await apiService.logout();
            setIsAuthenticated(false);
            console.log('✅ AuthNavigator: Sesión cerrada exitosamente');
        } catch (error) {
            console.error('❌ AuthNavigator: Error en logout:', error);
            // Forzar logout local aunque falle el servidor
            await apiService.clearSession();
            setIsAuthenticated(false);
        }
    };

    // Verificar autenticación al montar el componente
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Verificar periódicamente el estado de autenticación
    useEffect(() => {
        if (isAuthenticated) {
            const interval = setInterval(() => {
                checkAuthStatus();
            }, 60000); // Cada minuto

            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    // Mostrar loading mientras verificamos autenticación
    if (isLoading) {
        return <Loading message="Verificando acceso..." />;
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? (
                <AuthenticatedTabs onLogout={handleLogout} />
            ) : (
                <UnauthenticatedStack onLoginSuccess={handleLoginSuccess} />
            )}
        </NavigationContainer>
    );
};