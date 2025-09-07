import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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

// Obtener dimensiones de la pantalla
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Funciones responsive
const wp = (percentage: number) => {
  return (screenWidth * percentage) / 100;
};

const hp = (percentage: number) => {
  return (screenHeight * percentage) / 100;
};

// Tamaños responsivos
const responsiveFontSize = (size: number) => {
  const scale = screenWidth / 375; // iPhone SE como base
  return Math.round(size * scale);
};

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
          <MaterialIcons name="error-outline" size={wp(12)} color={Colors.error} />
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header integrado en el scroll */}
        <View style={styles.header}>
          <Text style={styles.title}>Mi Perfil</Text>
          <Text style={styles.subtitle}>Información de tu cuenta</Text>
        </View>

        <View style={styles.content}>
          {/* Información Personal Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="person" size={wp(5)} color={Colors.primary} />
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
              <MaterialIcons name="email" size={wp(5)} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Correo Electrónico</Text>
                <Text style={styles.infoValue}>{user.correo}</Text>
              </View>
            </View>

            {user.telefono && (
              <View style={styles.infoItem}>
                <MaterialIcons name="phone" size={wp(5)} color={Colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Teléfono</Text>
                  <Text style={styles.infoValue}>{user.telefono}</Text>
                </View>
              </View>
            )}

            {user.direccion && (
              <View style={styles.infoItem}>
                <MaterialIcons name="location-on" size={wp(5)} color={Colors.primary} />
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
              <MaterialIcons name="badge" size={wp(5)} color={Colors.primary} />
              <Text style={styles.cardTitle}>Información de Documento</Text>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="credit-card" size={wp(5)} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tipo de Documento</Text>
                <Text style={styles.infoValue}>{getDocumentTypeName(user.tipo_documento)}</Text>
              </View>
            </View>

            {user.numero_documento && (
              <View style={styles.infoItem}>
                <MaterialIcons name="confirmation-number" size={wp(5)} color={Colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Número de Documento</Text>
                  <Text style={styles.infoValue}>{user.numero_documento}</Text>
                </View>
              </View>
            )}

            {user.fecha_nacimiento && (
              <View style={styles.infoItem}>
                <MaterialIcons name="cake" size={wp(5)} color={Colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Fecha de Nacimiento</Text>
                  <Text style={styles.infoValue}>{formatDate(user.fecha_nacimiento)}</Text>
                </View>
              </View>
            )}

            {user.fecha_nacimiento && (
              <View style={styles.infoItem}>
                <MaterialIcons name="today" size={wp(5)} color={Colors.primary} />
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
              <MaterialIcons name="admin-panel-settings" size={wp(5)} color={Colors.primary} />
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
              <MaterialIcons name="admin-panel-settings" size={wp(5)} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Rol en el Sistema</Text>
                <Text style={[styles.infoValue, { color: Colors.primary }]}>Administrador</Text>
              </View>
            </View>
          </View>

          {/* Acciones Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="settings" size={wp(5)} color={Colors.primary} />
              <Text style={styles.cardTitle}>Acciones</Text>
            </View>

            <View style={styles.actionsContainer}>
              <Pressable style={styles.updateButton} onPress={loadUserProfile}>
                <MaterialIcons name="refresh" size={wp(5)} color="#FFFFFF" />
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
                <MaterialIcons name="logout" size={wp(5)} color={Colors.error} />
                <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
              </Pressable>
            </View>
          </View>

          {/* Footer integrado en el scroll */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2024 GMSF - Gym Management System. Todos los derechos reservados.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(1.5),
    backgroundColor: "#F8FAFC", // Mismo color que el fondo
  },
  title: {
    fontSize: responsiveFontSize(24),
    fontWeight: '700',
    color: Colors.text,
    marginBottom: hp(0.5),
  },
  subtitle: {
    fontSize: responsiveFontSize(14),
    color: Colors.textSecondary,
  },
  content: {
    padding: wp(4),
    paddingTop: 0, // Sin padding top porque ya lo tiene el header
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: wp(3),
    marginBottom: hp(3),
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
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(1.5),
  },
  cardTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: '600',
    color: Colors.text,
    marginLeft: wp(2),
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
  },
  avatarContainer: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1.5),
    borderWidth: 4,
    borderColor: Colors.surface,
  },
  avatarText: {
    fontSize: responsiveFontSize(28),
    fontWeight: '700',
    color: "#FFFFFF",
  },
  nameSection: {
    alignItems: 'center',
  },
  userName: {
    fontSize: responsiveFontSize(20),
    fontWeight: '700',
    color: Colors.text,
    marginBottom: hp(0.5),
    textAlign: 'center',
  },
  userRole: {
    fontSize: responsiveFontSize(14),
    fontWeight: '500',
    color: Colors.primary,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    backgroundColor: "#F8FAFC",
    marginHorizontal: wp(4),
    marginBottom: hp(1.5),
    borderRadius: wp(3),
    minHeight: hp(7),
  },
  infoContent: {
    flex: 1,
    marginLeft: wp(3),
  },
  infoLabel: {
    fontSize: responsiveFontSize(12),
    color: Colors.textSecondary,
    marginBottom: hp(0.3),
  },
  infoValue: {
    fontSize: responsiveFontSize(14),
    fontWeight: '500',
    color: Colors.text,
    flexWrap: 'wrap',
  },
  statusIndicator: {
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
  },
  actionsContainer: {
    padding: wp(4),
    gap: hp(1.5),
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: hp(2),
    borderRadius: wp(3),
    gap: wp(2),
    minHeight: hp(6),
  },
  updateButtonText: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
    color: "#FFFFFF",
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: hp(2),
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: Colors.error,
    gap: wp(2),
    minHeight: hp(6),
  },
  logoutButtonText: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
    color: Colors.error,
  },
  footer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    marginTop: hp(2),
    borderRadius: wp(3),
    marginHorizontal: wp(1), // Para que coincida con las cards
  },
  footerText: {
    fontSize: responsiveFontSize(10),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: responsiveFontSize(12),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: responsiveFontSize(16),
    color: Colors.textSecondary,
    marginTop: hp(2),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(8),
  },
  errorText: {
    fontSize: responsiveFontSize(16),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: hp(2),
    marginBottom: hp(3),
    lineHeight: responsiveFontSize(20),
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(16),
    fontWeight: '600',
  },
});
