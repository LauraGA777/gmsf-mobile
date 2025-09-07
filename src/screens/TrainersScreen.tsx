import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, EmptyState, Loading } from '../components';
import { Colors, Shadows } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/layout';
import { apiService } from '../services/api';
import { Trainer } from '../types';

export const TrainersScreen: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>([]);

  const loadTrainers = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      console.log('🔄 Cargando entrenadores...');

      const response = await apiService.getTrainers({
        page: 1,
        limit: 50,
        search: searchQuery || undefined
      });

      console.log('👨‍💼 Entrenadores cargados:', response);

      // Asegurar que siempre tengamos un array válido
      const trainersData = Array.isArray(response.data) ? response.data : (Array.isArray((response as any)?.data?.data) ? (response as any).data.data : (response as any).data || []);
      setTrainers(trainersData);
      setFilteredTrainers(trainersData);

    } catch (error: any) {
      console.error('💥 Error loading trainers:', error);

      // En caso de error, usar datos de ejemplo para desarrollo
      console.log('🔧 Usando datos de ejemplo para entrenadores...');
      const mockTrainers: any[] = [
        {
          id: '1',
          nombre: 'Carlos',
          apellido: 'Rodríguez',
          email: 'carlos.rodriguez@gmsf.com',
          telefono: '+57 300 123 4567',
          especialidad: 'Entrenamiento Funcional',
          fechaIngreso: '2023-01-15',
          activo: true,
          experiencia: 5,
          certificaciones: ['CrossFit Level 1', 'Entrenamiento Funcional', 'Primeros Auxilios'],
          foto: null,
        },
        {
          id: '2',
          nombre: 'María',
          apellido: 'González',
          email: 'maria.gonzalez@gmsf.com',
          telefono: '+57 310 987 6543',
          especialidad: 'Yoga y Pilates',
          fechaIngreso: '2023-03-10',
          activo: true,
          experiencia: 3,
          certificaciones: ['Yoga Alliance RYT-200', 'Pilates Mat Certification'],
          foto: null,
        },
        {
          id: '3',
          nombre: 'Diego',
          apellido: 'Martínez',
          email: 'diego.martinez@gmsf.com',
          telefono: '+57 320 456 7890',
          especialidad: 'Musculación',
          fechaIngreso: '2022-11-05',
          activo: false,
          experiencia: 7,
          certificaciones: ['NSCA-CPT', 'Nutrición Deportiva'],
          foto: null,
        },
      ];

      setTrainers(mockTrainers);
      setFilteredTrainers(mockTrainers);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrainers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTrainers(trainers);
    } else {
      const filtered = trainers.filter(trainer =>
        trainer.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer.especialidad.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTrainers(filtered);
    }
  }, [searchQuery, trainers]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTrainers(true);
  };

  const renderTrainerCard = ({ item: trainer }: { item: Trainer }) => (
    <Card style={styles.trainerCard}>
      <View style={styles.trainerHeader}>
        <View style={styles.trainerInfo}>
          <View style={styles.trainerNameRow}>
            <Text style={styles.trainerName}>
              {trainer.nombre} {trainer.apellido}
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: trainer.activo ? Colors.success : Colors.error }
            ]}>
              <Text style={styles.statusText}>
                {trainer.activo ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
            <Pressable
              accessibilityLabel={trainer.activo ? 'Desactivar entrenador' : 'Activar entrenador'}
              onPress={async () => {
                const original = trainer.activo;
                // Optimistic UI
                setTrainers(prev => prev.map(t => t.id === trainer.id ? { ...t, activo: !original } : t));
                setFilteredTrainers(prev => prev.map(t => t.id === trainer.id ? { ...t, activo: !original } : t));
                try {
                  await apiService.setTrainerActive(trainer.id, !original);
                } catch (e) {
                  // Revertir si falla
                  setTrainers(prev => prev.map(t => t.id === trainer.id ? { ...t, activo: original } : t));
                  setFilteredTrainers(prev => prev.map(t => t.id === trainer.id ? { ...t, activo: original } : t));
                  Alert.alert('Error', 'No se pudo cambiar el estado. Intenta nuevamente.');
                }
              }}
              style={({ pressed }) => [styles.toggleButton, pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons
                name={trainer.activo ? 'toggle-on' : 'toggle-off'}
                size={32}
                color={trainer.activo ? Colors.success : Colors.textLight}
              />
            </Pressable>
          </View>
          <Text style={styles.trainerSpecialty}>{trainer.especialidad}</Text>
          <Text style={styles.trainerExperience}>
            {trainer.experiencia} años de experiencia
          </Text>
        </View>
      </View>

      <View style={styles.trainerDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="email" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{trainer.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="phone" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{trainer.telefono}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="date-range" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            Desde: {new Date(trainer.fechaIngreso).toLocaleDateString('es-CO')}
          </Text>
        </View>
      </View>

      {Array.isArray(trainer.certificaciones) && trainer.certificaciones.length > 0 && (
        <View style={styles.certificationsContainer}>
          <Text style={styles.certificationsTitle}>Certificaciones:</Text>
          <View style={styles.certificationsList}>
            {(trainer.certificaciones || []).map((cert: any, index: number) => (
              <View key={index} style={styles.certificationTag}>
                <Text style={styles.certificationText}>{cert}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Card>
  );

  if (loading) {
    return <Loading message="Cargando entrenadores..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Entrenadores</Text>
        <Text style={styles.subtitle}>
          {filteredTrainers.length} entrenador{filteredTrainers.length !== 1 ? 'es' : ''} encontrado{filteredTrainers.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar entrenadores..."
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

      {filteredTrainers.length === 0 ? (
        <EmptyState
          icon="fitness-center"
          title="No hay entrenadores"
          message={
            searchQuery
              ? "No se encontraron entrenadores que coincidan con tu búsqueda"
              : "Aún no hay entrenadores registrados en el sistema"
          }
          actionText="Agregar Entrenador"
          onAction={() => Alert.alert('Info', 'Función de agregar entrenador próximamente')}
        />
      ) : (
        <FlatList
          data={filteredTrainers}
          renderItem={renderTrainerCard}
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
  trainerCard: {
    marginBottom: Spacing.md,
  },
  trainerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  trainerInfo: {
    flex: 1,
  },
  trainerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  trainerName: {
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
  toggleButton: {
    marginLeft: Spacing.sm,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trainerSpecialty: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  trainerExperience: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  trainerDetails: {
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
  certificationsContainer: {
    marginBottom: Spacing.md,
  },
  certificationsTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  certificationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  certificationTag: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  certificationText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
});
