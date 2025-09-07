import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { apiService } from '../services/api';

interface ProfileScreenProps {
  onLogout?: () => Promise<void>;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profileData = await apiService.getProfile();
      setUser(profileData);
    } catch (error) {
      console.error('Error cargando perfil:', error);
      const storedUser = await apiService.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const getGenderName = (genero?: string): string => {
    switch (genero) {
      case 'M':
        return 'Masculino';
      case 'F':
        return 'Femenino';
      case 'O':
        return 'Otro';
      default:
        return 'No especificado';
    }
  };

  const getDocumentTypeName = (tipo?: string): string => {
    switch (tipo) {
      case 'CC':
        return 'Cédula de Ciudadanía';
      case 'CE':
        return 'Cédula de Extranjería';
      case 'TI':
        return 'Tarjeta de Identidad';
      case 'PP':
        return 'Pasaporte';
      case 'DIE':
        return 'Documento de Identificación Extranjero';
      default:
        return 'No especificado';
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No especificada';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const calculateAge = (birthDate?: string): string => {
    if (!birthDate) return 'No especificada';
    try {
      const birth = new Date(birthDate);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        return `${age - 1} años`;
      }
      return `${age} años`;
    } catch {
      return 'Edad inválida';
    }
  };

  const getInitials = (nombre?: string, apellido?: string): string => {
    const firstInitial = nombre ? nombre.charAt(0).toUpperCase() : '';
    const lastInitial = apellido ? apellido.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>No se pudo cargar la información del perfil</Text>
          <Pressable style={styles.retryButton} onPress={loadUserProfile}>
            <Text style={styles.retryButtonText}>Intentar nuevamente</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Información Personal Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="person" size={20} color={Colors.primary} />
              <Text style={styles.cardTitle}>Información Personal</Text>
            </View>

            {/* Avatar y nombre */}
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{getInitials(user.nombre, user.apellido)}</Text>
              </View>
              <View style={styles.nameSection}>
                <Text style={styles.userName}>{user.nombre} {user.apellido}</Text>
                <Text style={styles.userRole}>Administrador</Text>
              </View>
            </View>

            {/* Info Items */}
            <View style={styles.infoItem}>
              <MaterialIcons name="email" size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Correo Electrónico</Text>
                <Text style={styles.infoValue}>{user.correo}</Text>
              </View>
            </View>

            {user.telefono && (
              <View style={styles.infoItem}>
                <MaterialIcons name="phone" size={20} color={Colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Teléfono</Text>
                  <Text style={styles.infoValue}>{user.telefono}</Text>
                </View>
              </View>
            )}

            {user.direccion && (
              <View style={styles.infoItem}>
                <MaterialIcons name="location-on" size={20} color={Colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Dirección</Text>
                  <Text style={styles.infoValue}>{user.direccion}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Información de Documento Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="badge" size={20} color={Colors.primary} />
              <Text style={styles.cardTitle}>Información de Documento</Text>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="credit-card" size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tipo de Documento</Text>
                <Text style={styles.infoValue}>{getDocumentTypeName(user.tipo_documento)}</Text>
              </View>
            </View>

            {user.numero_documento && (
              <View style={styles.infoItem}>
                <MaterialIcons name="confirmation-number" size={20} color={Colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Número de Documento</Text>
                  <Text style={styles.infoValue}>{user.numero_documento}</Text>
                </View>
              </View>
            )}

            {user.fecha_nacimiento && (
              <View style={styles.infoItem}>
                <MaterialIcons name="cake" size={20} color={Colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Fecha de Nacimiento</Text>
                  <Text style={styles.infoValue}>{formatDate(user.fecha_nacimiento)}</Text>
                </View>
              </View>
            )}

            {user.fecha_nacimiento && (
              <View style={styles.infoItem}>
                <MaterialIcons name="today" size={20} color={Colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Edad</Text>
                  <Text style={styles.infoValue}>{calculateAge(user.fecha_nacimiento)}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Información del Sistema Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="admin-panel-settings" size={20} color={Colors.primary} />
              <Text style={styles.cardTitle}>Información del Sistema</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: user.estado ? Colors.success : Colors.error }
              ]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Estado</Text>
                <Text style={[
                  styles.infoValue,
                  { color: user.estado ? Colors.success : Colors.error }
                ]}>
                  {user.estado ? 'Activo' : 'Inactivo'}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="admin-panel-settings" size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Rol en el Sistema</Text>
                <Text style={[styles.infoValue, { color: Colors.primary }]}>Administrador</Text>
              </View>
            </View>
          </View>

          {/* Acciones Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="settings" size={20} color={Colors.primary} />
              <Text style={styles.cardTitle}>Acciones</Text>
            </View>

            <View style={styles.actionsContainer}>
              <Pressable style={styles.updateButton} onPress={loadUserProfile}>
                <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.updateButtonText}>Actualizar Información</Text>
              </Pressable>

              <Pressable
                style={styles.logoutButton}
                onPress={async () => {
                  Alert.alert(
                    'Cerrar Sesión',
                    '¿Estás seguro de que deseas cerrar sesión?',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Cerrar Sesión',
                        style: 'destructive',
                        onPress: async () => {
                          if (onLogout) {
                            try {
                              await onLogout();
                            } catch (error) {
                              console.error('Error durante logout:', error);
                              Alert.alert(
                                'Error',
                                'Hubo un problema al cerrar sesión, pero se limpiaron los datos locales.'
                              );
                            }
                          } else {
                            Alert.alert('Error', 'Función de logout no disponible');
                          }
                        }
                      }
                    ]
                  );
                }}
              >
                <MaterialIcons name="logout" size={20} color={Colors.error} />
                <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 GMSF - Gym Management System. Todos los derechos reservados.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 4,
    borderColor: Colors.surface,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: "#FFFFFF",
  },
  nameSection: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: "#F8FAFC",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: "#FFFFFF",
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
  footer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
