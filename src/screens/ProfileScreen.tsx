import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components';
import { Colors, Shadows } from '../constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../constants/layout';
import { apiService } from '../services/api';
import { User } from '../types';

interface ProfileScreenProps {
  onLogout?: () => Promise<void>;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // Intentar obtener del perfil de la API
      const profileData = await apiService.getProfile();
      setUser(profileData);
    } catch (error) {
      console.error('Error cargando perfil:', error);
      // Fallback a datos almacenados localmente
      const storedUser = await apiService.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      } else {
        // Datos por defecto si no hay información
        setUser({
          id: 1,
          correo: 'usuario@gmsf.com',
          nombre: 'Usuario',
          apellido: 'GMSF',
          estado: true,
          id_rol: 1,
        });
      }
    } finally {
      setLoading(false);
    }
  };
  const profileOptions = [
    {
      icon: 'person' as const,
      title: 'Mi Información',
      subtitle: 'Ver y editar datos personales',
      onPress: () => Alert.alert('Info', 'Función próximamente'),
    },
    {
      icon: 'card-membership' as const,
      title: 'Mi Membresía',
      subtitle: 'Estado y detalles de membresía',
      onPress: () => Alert.alert('Info', 'Función próximamente'),
    },
    {
      icon: 'history' as const,
      title: 'Historial de Asistencias',
      subtitle: 'Ver mis entrenamientos pasados',
      onPress: () => Alert.alert('Info', 'Función próximamente'),
    },
    {
      icon: 'payment' as const,
      title: 'Métodos de Pago',
      subtitle: 'Gestionar formas de pago',
      onPress: () => Alert.alert('Info', 'Función próximamente'),
    },
    {
      icon: 'notifications' as const,
      title: 'Notificaciones',
      subtitle: 'Configurar alertas y recordatorios',
      onPress: () => Alert.alert('Info', 'Función próximamente'),
    },
    {
      icon: 'help' as const,
      title: 'Ayuda y Soporte',
      subtitle: 'Obtener ayuda o reportar problemas',
      onPress: () => Alert.alert('Info', 'Función próximamente'),
    },
    {
      icon: 'settings' as const,
      title: 'Configuración',
      subtitle: 'Ajustes de la aplicación',
      onPress: () => Alert.alert('Info', 'Función próximamente'),
    },
  ];

  const renderProfileOption = (option: typeof profileOptions[0], index: number) => (
    <Pressable
      key={index}
      style={styles.optionContainer}
      onPress={option.onPress}
      android_ripple={{ color: Colors.divider }}
    >
      <View style={styles.optionIconContainer}>
        <MaterialIcons name={option.icon} size={24} color={Colors.primary} />
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{option.title}</Text>
        <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={Colors.textLight} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Mi Perfil</Text>
          <Text style={styles.subtitle}>Gestiona tu cuenta y preferencias</Text>
        </View>

        <Card style={styles.profileCard}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <MaterialIcons name="account-circle" size={80} color={Colors.primary} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {user?.nombre} {user?.apellido}
                </Text>
                <Text style={styles.userEmail}>{user?.correo}</Text>
                {user?.id_rol && (
                  <Text style={styles.userRole}>Rol: {user.id_rol === 1 ? 'Administrador' : user.id_rol === 2 ? 'Entrenador' : 'Cliente'}</Text>
                )}
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: user?.estado ? Colors.success : Colors.error }
                ]}>
                  <Text style={styles.statusText}>
                    {user?.estado ? 'Activo' : 'Inactivo'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Card>

        <Card title="Opciones de Cuenta">
          {profileOptions.map(renderProfileOption)}
        </Card>

        <View style={styles.footer}>
          <Pressable
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Confirmar', 
                '¿Estás seguro de que quieres cerrar sesión?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { 
                    text: 'Cerrar Sesión', 
                    style: 'destructive',
                    onPress: onLogout || (() => Alert.alert('Info', 'Función de logout no disponible'))
                  }
                ]
              );
            }}
          >
            <MaterialIcons name="logout" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </Pressable>
        </View>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>GMSF Mobile v1.0.0</Text>
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
  profileCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  userRole: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: FontSize.xs,
    color: '#ffffff',
    fontWeight: FontWeight.medium,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  loadingText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  optionSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  footer: {
    padding: Spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    ...Shadows.small,
  },
  logoutText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.error,
    marginLeft: Spacing.sm,
  },
  versionInfo: {
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  versionText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
  },
});
