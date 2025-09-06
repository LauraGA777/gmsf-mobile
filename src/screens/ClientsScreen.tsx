import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Loading, EmptyState } from '../components';
import { Colors, Shadows } from '../constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../constants/layout';
import { apiService } from '../services/api';
import { Client } from '../types';

export const ClientsScreen: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  const loadClients = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      
      console.log('🔄 Cargando clientes...');
      
  const response = await apiService.getClients();
      
  console.log('👥 Clientes cargados:', response);
      
  const clientsData = Array.isArray(response.data) ? response.data : (Array.isArray((response as any)?.data?.data) ? (response as any).data.data : response.data || []);
      setClients(clientsData);
      setFilteredClients(clientsData);
    } catch (error: any) {
      console.error('💥 Error loading clients:', error);
      
      const isNetworkError = !error.response;
      const statusCode = error.response?.status;
      
      let errorMessage = 'No se pudieron cargar los clientes';
      
      if (isNetworkError) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (statusCode === 404) {
        errorMessage = 'Endpoint de clientes no encontrado.';
      } else if (statusCode === 500) {
        errorMessage = 'Error interno del servidor. Intenta nuevamente.';
      }
      
      Alert.alert('Error', errorMessage);
      
      // Datos de ejemplo para desarrollo cuando falla la API
      console.log('🔧 Usando datos de ejemplo para clientes...');
      const mockClients: Client[] = [
        {
          id: '1',
          nombre: 'Ana María',
          apellido: 'López',
          email: 'ana.lopez@email.com',
          telefono: '+57 300 111 2222',
          tipoDocumento: 'CC',
          numeroDocumento: '12345678',
          fechaNacimiento: '1990-05-15',
          fechaRegistro: '2024-01-10',
          activo: true,
          membresia: {
            id: '1',
            tipo: 'Premium',
            fechaInicio: '2024-01-10',
            fechaFin: '2024-12-10',
            estado: 'activa',
            precio: 150000,
          },
        },
        {
          id: '2',
          nombre: 'Luis',
          apellido: 'Martínez',
          email: 'luis.martinez@email.com',
          telefono: '+57 301 222 3333',
          tipoDocumento: 'CC',
          numeroDocumento: '87654321',
          fechaNacimiento: '1985-08-22',
          fechaRegistro: '2024-02-15',
          activo: true,
          membresia: {
            id: '2',
            tipo: 'Básica',
            fechaInicio: '2024-02-15',
            fechaFin: '2024-08-15',
            estado: 'activa',
            precio: 80000,
          },
        },
        {
          id: '3',
          nombre: 'Patricia',
          apellido: 'García',
          email: 'patricia.garcia@email.com',
          telefono: '+57 302 333 4444',
          tipoDocumento: 'CC',
          numeroDocumento: '11223344',
          fechaNacimiento: '1992-12-03',
          fechaRegistro: '2023-11-20',
          activo: false,
          membresia: {
            id: '3',
            tipo: 'Estándar',
            fechaInicio: '2023-11-20',
            fechaFin: '2024-01-20',
            estado: 'vencida',
            precio: 100000,
          },
        },
      ];
      
      setClients(mockClients);
      setFilteredClients(mockClients);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client =>
        client.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.numeroDocumento.includes(searchQuery)
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);

  const onRefresh = () => {
    setRefreshing(true);
    loadClients(true);
  };

  const getMembershipStatusColor = (status: string) => {
    switch (status) {
      case 'activa':
        return Colors.success;
      case 'vencida':
        return Colors.error;
      case 'suspendida':
        return Colors.warning;
      default:
        return Colors.textLight;
    }
  };

  const getMembershipTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'premium':
        return Colors.chartPurple;
      case 'estándar':
        return Colors.primary;
      case 'básica':
        return Colors.chartGreen;
      default:
        return Colors.textSecondary;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const renderClientCard = ({ item: client }: { item: Client }) => (
    <Card style={styles.clientCard}>
      <View style={styles.clientHeader}>
        <View style={styles.clientInfo}>
          <View style={styles.clientNameRow}>
            <Text style={styles.clientName}>
              {client.nombre} {client.apellido}
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: client.activo ? Colors.success : Colors.error }
            ]}>
              <Text style={styles.statusText}>
                {client.activo ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
            <Pressable
              accessibilityLabel={client.activo ? 'Desactivar cliente' : 'Activar cliente'}
              onPress={async () => {
                const original = client.activo;
                setClients(prev => prev.map(c => c.id === client.id ? { ...c, activo: !original } : c));
                setFilteredClients(prev => prev.map(c => c.id === client.id ? { ...c, activo: !original } : c));
                try {
                  await apiService.setClientActive(client.id, !original);
                } catch (e) {
                  setClients(prev => prev.map(c => c.id === client.id ? { ...c, activo: original } : c));
                  setFilteredClients(prev => prev.map(c => c.id === client.id ? { ...c, activo: original } : c));
                  Alert.alert('Error', 'No se pudo cambiar el estado del cliente');
                }
              }}
              style={({ pressed }) => [styles.toggleButton, pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons
                name={client.activo ? 'toggle-on' : 'toggle-off'}
                size={32}
                color={client.activo ? Colors.success : Colors.textLight}
              />
            </Pressable>
          </View>
          <Text style={styles.clientDocument}>
            {client.tipoDocumento}: {client.numeroDocumento}
          </Text>
        </View>
      </View>

      <View style={styles.clientDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="email" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{client.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="phone" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{client.telefono}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="cake" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            Nacimiento: {new Date(client.fechaNacimiento).toLocaleDateString('es-CO')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="date-range" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            Registro: {new Date(client.fechaRegistro).toLocaleDateString('es-CO')}
          </Text>
        </View>
      </View>

      {client.membresia && (
        <View style={styles.membershipContainer}>
          <Text style={styles.membershipTitle}>Membresía</Text>
          <View style={styles.membershipInfo}>
            <View style={styles.membershipHeader}>
              <View style={[
                styles.membershipTypeBadge,
                { backgroundColor: getMembershipTypeColor(client.membresia.tipo) }
              ]}>
                <Text style={styles.membershipTypeText}>{client.membresia.tipo}</Text>
              </View>
              <View style={[
                styles.membershipStatusBadge,
                { backgroundColor: getMembershipStatusColor(client.membresia.estado) }
              ]}>
                <Text style={styles.membershipStatusText}>
                  {client.membresia.estado.charAt(0).toUpperCase() + client.membresia.estado.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.membershipPrice}>
              {formatCurrency(client.membresia.precio)}/mes
            </Text>
            <Text style={styles.membershipPeriod}>
              Vigencia: {new Date(client.membresia.fechaInicio).toLocaleDateString('es-CO')} - {' '}
              {new Date(client.membresia.fechaFin).toLocaleDateString('es-CO')}
            </Text>
          </View>
        </View>
      )}
    </Card>
  );

  if (loading) {
    return <Loading message="Cargando clientes..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clientes</Text>
        <Text style={styles.subtitle}>
          {filteredClients.length} clientes encontrados
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar clientes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.textLight}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <MaterialIcons name="clear" size={20} color={Colors.textLight} />
          </Pressable>
        )}
      </View>

      {filteredClients.length === 0 ? (
        <EmptyState
          icon="people"
          title="No hay clientes"
          message={
            searchQuery
              ? "No se encontraron clientes que coincidan con tu búsqueda"
              : "Aún no hay clientes registrados en el sistema"
          }
          actionText="Agregar Cliente"
          onAction={() => Alert.alert('Info', 'Función de agregar cliente próximamente')}
        />
      ) : (
        <FlatList
          data={filteredClients}
          renderItem={renderClientCard}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  listContainer: {
    padding: Spacing.md,
  },
  clientCard: {
    marginBottom: Spacing.md,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  clientInfo: {
    flex: 1,
  },
  clientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  clientName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.surface,
  },
  clientDocument: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  clientDetails: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  detailText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  membershipContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  membershipTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  membershipInfo: {
    gap: Spacing.xs,
  },
  membershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  membershipTypeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  membershipTypeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.surface,
  },
  membershipStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  membershipStatusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.surface,
  },
  membershipPrice: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.success,
  },
  membershipPeriod: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  toggleButton: {
    marginLeft: Spacing.sm,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
});
