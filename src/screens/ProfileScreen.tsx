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

// Componente para iconos mejorado usando MaterialIcons
const IconField = ({
  iconName,
  size = 20,
  color = Colors.textSecondary
}: {
  iconName: keyof typeof MaterialIcons.glyphMap;
  size?: number;
  color?: string;
}) => (
  <MaterialIcons name={iconName} size={size} color={color} />
);

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // Intentar obtener del perfil de la API
      const profileData = await apiService.getProfile();
      setUser(profileData);
    } catch (error) {
      console.error('Error cargando perfil:', error);
      // Fallback a datos almacenados localmente
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
        return 'C\u00E9dula de Ciudadan\u00EDa';
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
        return `${age - 1} a\u00F1os`;
      }
      return `${age} a\u00F1os`;
    } catch {
      return 'Edad inválida';
    }
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Card Container */}
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <MaterialIcons name="account-circle" size={40} color={Colors.primary} />
                <View style={styles.headerText}>
                  <Text style={styles.title}>Mi Información Personal</Text>
                  <Text style={styles.description}>
                    Información completa de tu perfil en el sistema
                  </Text>
                </View>
              </View>
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
              {/* Información Básica */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Información Básica</Text>

                {/* Nombre y Apellido */}
                <View style={styles.row}>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>
                      Nombre <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={[styles.fieldValue, styles.fieldWithIcon]}>
                      <IconField iconName="person" />
                      <Text style={styles.valueText}>{user.nombre || 'No especificado'}</Text>
                    </View>
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>
                      Apellido <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.fieldValue}>
                      <Text style={styles.valueText}>{user.apellido || 'No especificado'}</Text>
                    </View>
                  </View>
                </View>

                {/* Correo Electrónico */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>
                    Correo Electrónico <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={[styles.fieldValue, styles.fieldWithIcon]}>
                    <IconField iconName="email" />
                    <Text style={styles.valueText}>{user.correo}</Text>
                  </View>
                </View>

                {/* Teléfono y Género */}
                <View style={styles.row}>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Teléfono</Text>
                    <View style={[styles.fieldValue, styles.fieldWithIcon]}>
                      <IconField iconName="phone" />
                      <Text style={styles.valueText}>{user.telefono || 'No especificado'}</Text>
                    </View>
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Género</Text>
                    <View style={[styles.fieldValue, styles.fieldWithIcon]}>
                      <IconField iconName="wc" />
                      <Text style={styles.valueText}>{getGenderName(user.genero)}</Text>
                    </View>
                  </View>
                </View>

                {/* Dirección */}
                {user.direccion && (
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Dirección</Text>
                    <View style={[styles.fieldValue, styles.fieldWithIcon]}>
                      <IconField iconName="location-on" />
                      <Text style={styles.valueText}>{user.direccion}</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Información de Documento */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Identificación</Text>

                <View style={styles.row}>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Tipo de Documento</Text>
                    <View style={[styles.fieldValue, styles.fieldWithIcon]}>
                      <IconField iconName="badge" />
                      <Text style={styles.valueText}>{getDocumentTypeName(user.tipo_documento)}</Text>
                    </View>
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Número de Documento</Text>
                    <View style={styles.fieldValue}>
                      <Text style={styles.valueText}>{user.numero_documento || 'No especificado'}</Text>
                    </View>
                  </View>
                </View>

                {/* Fecha de Nacimiento y Edad */}
                <View style={styles.row}>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Fecha de Nacimiento</Text>
                    <View style={[styles.fieldValue, styles.fieldWithIcon]}>
                      <IconField iconName="cake" />
                      <Text style={styles.valueText}>{formatDate(user.fecha_nacimiento)}</Text>
                    </View>
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Edad</Text>
                    <View style={[styles.fieldValue, styles.fieldWithIcon]}>
                      <IconField iconName="calendar-today" />
                      <Text style={styles.valueText}>{calculateAge(user.fecha_nacimiento)}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Información del Sistema */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Información del Sistema</Text>

                {/* Estado y Asistencias */}
                <View style={styles.row}>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Estado</Text>
                    <View style={[styles.fieldValue, styles.fieldWithIcon]}>
                      <IconField
                        iconName={user.estado ? "check-circle" : "cancel"}
                        color={user.estado ? Colors.success : Colors.error}
                      />
                      <Text style={[
                        styles.valueText,
                        { color: user.estado ? Colors.success : Colors.error }
                      ]}>
                        {user.estado ? 'Activo' : 'Inactivo'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Asistencias Totales</Text>
                    <View style={[styles.fieldValue, styles.fieldWithIcon]}>
                      <IconField iconName="fitness-center" />
                      <Text style={styles.valueText}>
                        {user.asistencias_totales !== undefined ? user.asistencias_totales : '0'} visitas
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Rol */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Rol en el Sistema</Text>
                  <View style={[styles.fieldValue, styles.fieldWithIcon]}>
                    <IconField iconName="admin-panel-settings" />
                    <Text style={styles.valueText}>Administrador</Text>
                  </View>
                </View>

                {/* Última Actualización */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Última Actualización</Text>
                  <View style={[styles.fieldValue, styles.fieldWithIcon]}>
                    <IconField iconName="update" />
                    <Text style={styles.valueText}>{formatDate(user.fecha_actualizacion)}</Text>
                  </View>
                </View>
              </View>

            </View>

            {/* Actions Footer */}
            <View style={styles.footer}>
              <Pressable
                style={styles.refreshButton}
                onPress={loadUserProfile}
              >
                <MaterialIcons name="refresh" size={20} color={Colors.primary} />
                <Text style={styles.refreshButtonText}>Actualizar Información</Text>
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
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
              </Pressable>
            </View>
          </View>

          {/* Footer minimalista */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>© 2024 StrongFit GYM</Text>
          </View>

          {/* Información de la App - Diseño especial */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
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
  content: {
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  cardContent: {
    padding: 24,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  row: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  fieldContainer: {
    flex: 1,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  labelWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  fieldValue: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  fieldWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  valueText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 12,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.error,
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  appInfoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    padding: 16,
    marginTop: 24,
  },
  appInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  appIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfoContent: {
    flex: 1,
    marginLeft: 12,
  },
  appName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  appSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  versionBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  versionBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  platformInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  platformItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  platformDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  footerDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 2,
  },
});
