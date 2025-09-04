import { Ionicons } from '@expo/vector-icons';
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

interface LoginFormData {
  correo: string;
  contrasena: string;
}

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    correo: '',
    contrasena: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  useEffect(() => {
    checkExistingToken();
  }, []);

  const checkExistingToken = async () => {
    try {
      setIsCheckingToken(true);
      console.log('🔍 LoginScreen: Verificando token existente...');

      const storedUser = await apiService.getStoredUser();
      const storedToken = await apiService.getStoredToken();

      if (storedUser && storedToken && storedUser.id_rol === 1) {
        console.log('👤 Usuario encontrado:', storedUser.nombre);

        try {
          await apiService.checkTokenStatus();
          console.log('✅ Token válido');

          if (onLoginSuccess) {
            onLoginSuccess();
          }
          return;
        } catch (error) {
          console.log('❌ Token inválido, limpiando datos');
          await apiService.clearSession();
        }
      } else {
        console.log('ℹ️ No hay sesión activa');
        if (storedUser && storedUser.id_rol !== 1) {
          await apiService.clearSession();
        }
      }
    } catch (error) {
      console.error('💥 Error verificando token:', error);
      await apiService.clearSession();
    } finally {
      setIsCheckingToken(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.correo)) {
        newErrors.correo = 'Ingrese un correo electrónico válido';
      }
    }

    if (!formData.contrasena.trim()) {
      newErrors.contrasena = 'La contraseña es requerida';
    } else if (formData.contrasena.length < 4) {
      newErrors.contrasena = 'La contraseña debe tener al menos 4 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      console.log('🔑 Intentando login:', { correo: formData.correo });

      if (!validateForm()) {
        console.log('❌ Validación de formulario falló');
        return;
      }

      const response = await apiService.login(
        formData.correo.trim().toLowerCase(),
        formData.contrasena
      );

      if (response.success) {
        console.log('🎉 Login exitoso');

        const storedUser = await apiService.getStoredUser();
        const storedToken = await apiService.getStoredToken();

        if (storedUser && storedToken && storedUser.id_rol === 1) {
          console.log('✅ Acceso confirmado');

          if (onLoginSuccess) {
            onLoginSuccess();
          }
        } else {
          throw new Error('Error interno: Datos de sesión no válidos');
        }
      } else {
        throw new Error(response.error || 'Error desconocido en el login');
      }

    } catch (error: any) {
      console.error('💥 Error en login:', error);

      let errorMessage = 'Error al iniciar sesión';

      if (error.message) {
        if (error.message.includes('Acceso denegado')) {
          errorMessage = 'Acceso denegado. No tienes permisos para usar esta aplicación.';
        } else if (error.message.includes('Credenciales incorrectas')) {
          errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
        } else if (error.message.includes('Usuario no encontrado')) {
          errorMessage = 'Usuario no encontrado en el sistema.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Error de conexión. Verifica tu internet.';
        } else {
          errorMessage = error.message;
        }
      } else if (error.response?.status === 401) {
        errorMessage = 'Credenciales incorrectas.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Acceso denegado.';
      } else if (!error.response) {
        errorMessage = 'Error de conexión.';
      }

      Alert.alert('Error de Inicio de Sesión', errorMessage, [
        { text: 'OK' },
        {
          text: 'Contactar Admin',
          onPress: () => setShowContactInfo(true)
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar Contraseña',
      'Para recuperar tu contraseña, contacta al administrador del sistema.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Contactar', onPress: () => setShowContactInfo(true) }
      ]
    );
  };

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
              <>
                <View style={styles.header}>
                  <Ionicons name="information-circle" size={48} color="#171717" />
                  <Text style={styles.title}>Contacto del Administrador</Text>
                  <Text style={styles.subtitle}>Información para solicitar acceso al sistema</Text>
                </View>

                <View style={styles.form}>
                  <View style={styles.contactInfoContainer}>
                    <Text style={styles.contactInfoTitle}>🏋️ StrongFit GYM</Text>
                    <Text style={styles.contactInfoText}>
                      <Text style={styles.contactInfoLabel}>📧 Email:</Text> admin@strongfit.com
                    </Text>
                    <Text style={styles.contactInfoText}>
                      <Text style={styles.contactInfoLabel}>📱 Teléfono:</Text> +57 300 123 4567
                    </Text>
                    <Text style={styles.contactInfoText}>
                      <Text style={styles.contactInfoLabel}>🕒 Horario:</Text> Lunes a Viernes, 9:00 AM - 6:00 PM
                    </Text>
                  </View>

                  <View style={styles.contactInfoContainer}>
                    <Text style={styles.contactInfoTitle}>📋 Requisitos para solicitar acceso</Text>
                    <Text style={styles.contactInfoText}>• Ser miembro del gimnasio</Text>
                    <Text style={styles.contactInfoText}>• Proporcionar identificación válida</Text>
                    <Text style={styles.contactInfoText}>• Especificar el tipo de acceso requerido</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.loginButton, styles.outlineButton]}
                    onPress={() => setShowContactInfo(false)}
                  >
                    <Ionicons name="arrow-back" size={20} color="#ffffff" />
                    <Text style={[styles.loginButtonText, styles.outlineButtonText]}>
                      Volver al inicio de sesión
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
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
                      onPress={() => setShowContactInfo(true)}
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
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
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
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#171717",
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
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
    borderRadius: 12,
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
    alignSelf: "flex-end",
    marginTop: -8,
  },
  forgotPasswordText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: "#171717",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outlineButton: {
    backgroundColor: "#171717",
    borderWidth: 2,
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
    color: "#FFFFFF",
  },
  contactContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    flexWrap: 'wrap',
  },
  contactText: {
    color: "#6B7280",
    fontSize: 14,
  },
  contactLink: {
    color: "#171717",
    fontSize: 14,
    fontWeight: "600",
  },
  contactInfoContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#171717",
  },
  contactInfoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#171717",
    marginBottom: 12,
  },
  contactInfoText: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 8,
    lineHeight: 22,
  },
  contactInfoLabel: {
    fontWeight: "600",
    color: "#171717",
  },
});