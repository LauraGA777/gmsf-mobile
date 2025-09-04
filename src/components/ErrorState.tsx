import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { Colors } from '../constants/colors';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showAnimation?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Error de conexión',
  message = 'No se pudieron cargar los datos. Verifica tu conexión e intenta nuevamente.',
  onRetry,
  showAnimation = true
}) => {
  return (
    <View style={styles.container}>
      {showAnimation && (
        <LottieView
          source={require('../../assets/lottie/loading.json')}
          autoPlay={false}
          loop={false}
          style={styles.animation}
        />
      )}
      
      <MaterialIcons 
        name="wifi-off" 
        size={64} 
        color={Colors.textLight} 
        style={styles.icon}
      />
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <MaterialIcons name="refresh" size={20} color={Colors.surface} />
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.background,
  },
  animation: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
