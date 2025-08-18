import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../constants/layout';
import { apiService } from '../services/api';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkExistingToken();
  }, []);

  const checkExistingToken = async () => {
    try {
      const existingToken = await apiService.getStoredToken();
      if (existingToken) {
        console.log('🔑 Token existente encontrado, verificando...');
        try {
          // Establecer el token en los headers
          await apiService.setToken(existingToken);
          
          // Verificar que el token sea válido haciendo una petición de prueba
          await apiService.getProfile();
          console.log('✅ Token válido, redirigiendo...');
          onLoginSuccess();
          return;
        } catch (error) {
          console.log('❌ Token inválido, requiere nuevo login');
          await apiService.logout();
        }
      }
    } catch (error) {
      console.log('Error verificando token existente:', error);
    } finally {
      setIsCheckingToken(false);
    }
  };

  const handleLogin = async () => {
    // Validaciones
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Intentando login...');
      
      const response = await apiService.login(email.trim().toLowerCase(), password);
      
      if (response.status === 'success') {
        console.log('✅ Login exitoso');
        Alert.alert('¡Bienvenido!', `Hola ${response.data.user.nombre}`, [
          { text: 'Continuar', onPress: onLoginSuccess }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      console.error('💥 Error en login:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response?.status === 401) {
        errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Usuario no encontrado. Verifica tu email.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error del servidor. Intenta nuevamente en unos momentos.';
      } else if (!error.response) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error de Inicio de Sesión', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar Contraseña',
      'Contacta al administrador para recuperar tu contraseña.',
      [{ text: 'Entendido' }]
    );
  };

  if (isCheckingToken) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
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
          <View style={styles.content}>
            <View style={styles.header}>
              <MaterialIcons name="fitness-center" size={80} color={Colors.primary} />
              <Text style={styles.title}>GMSF</Text>
              <Text style={styles.subtitle}>Sistema de Gestión</Text>
              <Text style={styles.description}>Inicia sesión para continuar</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor={Colors.textLight}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={Colors.textLight}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  editable={!loading}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <MaterialIcons 
                    name={showPassword ? "visibility-off" : "visibility"} 
                    size={20} 
                    color={Colors.textLight} 
                  />
                </Pressable>
              </View>

              <Pressable
                style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.surface} />
                ) : (
                  <>
                    <MaterialIcons name="login" size={20} color={Colors.surface} />
                    <Text style={styles.buttonText}>Iniciar Sesión</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
                disabled={loading}
              >
                <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Si no tienes cuenta, contacta al administrador
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.lg,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: Spacing.xxl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  input: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  eyeButton: {
    padding: Spacing.xs,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  buttonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.surface,
    marginLeft: Spacing.sm,
  },
  secondaryButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  forgotPasswordButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  forgotPasswordText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});
