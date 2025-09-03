import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../services/api';

// Types replicando la estructura de la versión web
interface LoginFormData {
  correo: string;
  contrasena: string;
}

interface User {
  id: string;
  nombre: string;
  correo: string;
  id_rol: number;
  roleCode?: string;
  roleName?: string;
  clientId?: string;
}

interface AuthResponse {
  success: boolean;
  error?: string;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

// Constantes de roles (replicando la versión web)
const ROLES = {
  ADMIN: 1,
  TRAINER: 2,
  CLIENT: 3,
  BENEFICIARY: 4
} as const;

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  // Estados del componente
  const [formData, setFormData] = useState<LoginFormData>({
    correo: '',
    contrasena: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  // Verificación de token existente al montar el componente
  useEffect(() => {
    checkExistingToken();
  }, []);

  const checkExistingToken = async () => {
    try {
      setIsCheckingToken(true);
      const storedUser = await AsyncStorage.getItem('user');
      const storedAccessToken = await AsyncStorage.getItem('accessToken');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');

      if (storedUser && storedAccessToken && storedRefreshToken) {
        try {
          const parsedUser = JSON.parse(storedUser) as User;

          if (parsedUser.id && parsedUser.id_rol) {
            // Verificar que el token sea válido
            const isValid = await verifyToken(storedAccessToken);
            if (isValid) {
              console.log('✅ Token válido encontrado, redirigiendo...');
              onLoginSuccess();
              return;
            } else {
              // Token inválido, limpiar storage
              await clearAuthData();
            }
          }
        } catch (error) {
          console.log('❌ Error parsing stored user data');
          await clearAuthData();
        }
      }
    } catch (error) {
      console.error('Error checking existing token:', error);
    } finally {
      setIsCheckingToken(false);
    }
  };

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      const API_URL = 'https://gmsf-backend.vercel.app';
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.log('❌ Error verificando token:', error);
      return false;
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove([
        'user',
        'accessToken',
        'refreshToken'
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  // Función para limpiar completamente todos los datos (para pruebas)
  const clearAllCache = async () => {
    try {
      console.log('🧹 Limpiando completamente el cache...');

      // Limpiar todos los datos de AsyncStorage
      await AsyncStorage.clear();

      // Reiniciar el estado del formulario
      setFormData({
        correo: '',
        contrasena: ''
      });
      setErrors({});
      setIsLoading(false);
      setIsCheckingToken(false);
      setShowPassword(false);
      setShowContactInfo(false);

      console.log('✅ Cache limpiado completamente');
      Alert.alert(
        'Cache Limpiado',
        'Todos los datos almacenados han sido eliminados. Ahora puedes hacer login normalmente.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Error limpiando cache:', error);
      Alert.alert('Error', 'No se pudo limpiar el cache completamente');
    }
  };

  // Validaciones del formulario (replicando la lógica web)
  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    // Validación de email
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.correo)) {
        newErrors.correo = 'Ingrese un correo electrónico válido';
      }
    }

    // Validación de contraseña
    if (!formData.contrasena.trim()) {
      newErrors.contrasena = 'La contraseña es requerida';
    } else if (formData.contrasena.length < 4) {
      newErrors.contrasena = 'La contraseña debe tener al menos 4 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función de login principal (replicando la funcionalidad web)
  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      // Validar formulario
      if (!validateForm()) {
        return;
      }

      console.log('🔄 Intentando login con:', { correo: formData.correo });

      // Verificar configuración de API
      const API_URL = 'https://gmsf-backend.vercel.app'; // Tu URL de API
      if (!API_URL) {
        throw new Error('URL de API no configurada');
      }

      // Realizar petición de login
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: formData.correo.trim().toLowerCase(),
          contrasena: formData.contrasena
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || data.error || 'Credenciales incorrectas';
        throw new Error(errorMessage);
      }

      // Procesar respuesta del servidor
      if (!data || typeof data !== 'object') {
        throw new Error('Respuesta del servidor inválida');
      }

      const authData = data;
      const userData = authData.data?.user || authData.user || authData.data || {};

      const tokens = {
        accessToken: authData.data?.accessToken || authData.accessToken || authData.token,
        refreshToken: authData.data?.refreshToken || authData.refreshToken,
      };

      if (!tokens.accessToken) {
        throw new Error('Token de acceso no recibido del servidor');
      }

      if (!userData || typeof userData !== 'object' || !userData.id) {
        throw new Error('Datos de usuario inválidos recibidos del servidor');
      }

      // Normalizar datos del usuario
      const normalizedUser: User = {
        id: userData.id.toString(),
        nombre: userData.nombre || userData.nombre_usuario || userData.name || '',
        correo: userData.correo || userData.email || formData.correo,
        id_rol: userData.id_rol || userData.rol_id || userData.roleId || null,
      };

      // Verificar campos requeridos
      if (!normalizedUser.id || !normalizedUser.id_rol) {
        throw new Error('Datos de usuario incompletos recibidos del servidor');
      }

      // Guardar datos en AsyncStorage - usando las claves correctas del Config
      await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
      await AsyncStorage.setItem('authToken', tokens.accessToken); // Cambio aquí: usar 'authToken' en lugar de 'accessToken'
      if (tokens.refreshToken) {
        await AsyncStorage.setItem('refreshToken', tokens.refreshToken);
      }

      console.log('✅ Login exitoso para:', normalizedUser.nombre);

      // Verificar que el token se guardó correctamente
      await apiService.checkTokenStatus();

      // Llamar inmediatamente a onLoginSuccess para redireccionar
      console.log('🔄 Ejecutando onLoginSuccess...');

      // Pequeño delay para asegurar que AsyncStorage termine de guardar
      setTimeout(() => {
        onLoginSuccess();
        console.log('✅ onLoginSuccess ejecutado - debería redireccionar ahora');
      }, 100);

    } catch (error: any) {
      console.error('💥 Error en login:', error);

      let errorMessage = 'Error al iniciar sesión';

      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Usuario no encontrado. Verifica tu email.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error del servidor. Intenta nuevamente en unos momentos.';
      } else if (!error.response) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      }

      Alert.alert('Error de Inicio de Sesión', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejadores de input
  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar Contraseña',
      'Contacta al administrador para recuperar tu contraseña.',
      [{ text: 'Entendido' }]
    );
  };

  const handleContactAdmin = () => {
    setShowContactInfo(true);
  };

  // Loading screen mientras verifica token
  if (isCheckingToken) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#171717" />
          <Text style={styles.loadingText}>Verificando autenticación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>

            {showContactInfo ? (
              // Contact Info Card (replicando la funcionalidad web)
              <>
                <View style={styles.header}>
                  <Text style={styles.title}>Contacto del Administrador</Text>
                  <Text style={styles.subtitle}>Información para solicitar acceso al sistema</Text>
                </View>

                <View style={styles.form}>
                  <View style={styles.contactInfoContainer}>
                    <Text style={styles.contactInfoTitle}>StrongFit GYM</Text>
                    <Text style={styles.contactInfoText}>
                      <Text style={styles.contactInfoLabel}>Email:</Text> admin@strongfit.com
                    </Text>
                    <Text style={styles.contactInfoText}>
                      <Text style={styles.contactInfoLabel}>Teléfono:</Text> 300 123 4567
                    </Text>
                    <Text style={styles.contactInfoText}>
                      <Text style={styles.contactInfoLabel}>Horario de atención:</Text> Lunes a Viernes, 9:00 AM - 6:00 PM
                    </Text>
                  </View>

                  <View style={styles.contactInfoContainer}>
                    <Text style={styles.contactInfoTitle}>Requisitos para solicitar acceso</Text>
                    <Text style={styles.contactInfoText}>• Pertenecer a la organización</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.loginButton, styles.outlineButton]}
                    onPress={() => setShowContactInfo(false)}
                  >
                    <Ionicons name="arrow-back" size={20} color="#171717" />
                    <Text style={[styles.loginButtonText, styles.outlineButtonText]}>
                      Volver al inicio de sesión
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // Login Form (replicando el diseño web)
              <>
                <View style={styles.header}>
                  <Text style={styles.title}>Bienvenido</Text>
                  <Text style={styles.subtitle}>Ingresa tus credenciales para acceder</Text>
                </View>

                <View style={styles.form}>
                  {/* Email Input */}
                  <View style={styles.inputGroup}>
                    <TextInput
                      style={[
                        styles.input,
                        errors.correo && styles.inputError
                      ]}
                      placeholder="Ingrese su correo"
                      placeholderTextColor="#9CA3AF"
                      value={formData.correo}
                      onChangeText={(value) => handleInputChange('correo', value)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                      editable={!isLoading}
                    />
                    {errors.correo && (
                      <Text style={styles.errorText}>{errors.correo}</Text>
                    )}
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputGroup}>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={[
                          styles.passwordInput,
                          errors.contrasena && styles.inputError
                        ]}
                        placeholder="Ingrese su contraseña"
                        placeholderTextColor="#9CA3AF"
                        value={formData.contrasena}
                        onChangeText={(value) => handleInputChange('contrasena', value)}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="done"
                        onSubmitEditing={handleLogin}
                        editable={!isLoading}
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off" : "eye"}
                          size={20}
                          color="#9CA3AF"
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.contrasena && (
                      <Text style={styles.errorText}>{errors.contrasena}</Text>
                    )}
                  </View>

                  {/* Forgot Password Link */}
                  <TouchableOpacity
                    style={styles.forgotPasswordContainer}
                    onPress={handleForgotPassword}
                    disabled={isLoading}
                  >
                    <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                  </TouchableOpacity>

                  {/* Login Button */}
                  <TouchableOpacity
                    style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.loginButtonText}>Iniciando sesión...</Text>
                      </>
                    ) : (
                      <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                    )}
                  </TouchableOpacity>

                  {/* Contact Admin */}
                  <View style={styles.contactContainer}>
                    <Text style={styles.contactText}>¿No tienes cuenta? </Text>
                    <TouchableOpacity
                      onPress={handleContactAdmin}
                      disabled={isLoading}
                    >
                      <Text style={styles.contactLink}>Contacta al administrador</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    minHeight: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#171717",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#171717",
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 50,
    fontSize: 16,
    color: "#171717",
    backgroundColor: "#FFFFFF",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 12,
    padding: 4,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-start",
    marginTop: -8,
  },
  forgotPasswordText: {
    color: "#374151",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#171717",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    gap: 8,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#171717",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  outlineButtonText: {
    color: "#171717",
  },
  contactContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  contactText: {
    color: "#6B7280",
    fontSize: 14,
  },
  contactLink: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  // Debug styles (temporal para pruebas)
  debugContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  clearCacheButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    opacity: 0.8,
  },
  clearCacheText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  // Contact Info Styles
  contactInfoContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  contactInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#171717",
    marginBottom: 8,
  },
  contactInfoText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  contactInfoLabel: {
    fontWeight: "600",
  },
});