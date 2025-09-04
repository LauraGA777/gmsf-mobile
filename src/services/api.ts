import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Config from '../constants/config';
import {
  Client,
  CreateClientRequest,
  PaginatedResponse,
  PaginationParams,
  Trainer,
  User
} from '../types';

// Interface para la respuesta de login real
interface LoginApiResponse {
  status: string;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: number;
      nombre: string;
      correo: string;
      id_rol: number;
      id_persona: number | null;
    };
  };
}

// Interface simplificada para administradores
interface LoginResponse {
  success: boolean;
  error?: string;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: Config.API_BASE_URL,
      timeout: Config.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(Config.AUTH.TOKEN_KEY);
        console.log(`🔍 Request: ${config.method?.toUpperCase()} ${config.url}`);

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
      },
      async (error) => {
        const status = error.response?.status;
        console.error(`❌ API Error: ${status}`, error.response?.data);

        if (status === 401) {
          console.log('🔄 Token expirado, limpiando sesión...');
          await this.clearSession();
        }

        return Promise.reject(error);
      }
    );
  }

  // MÉTODO DE LOGIN SOLO PARA ADMINISTRADORES
  async login(correo: string, contrasena: string): Promise<LoginResponse> {
    try {
      console.log('🔑 Intentando login de administrador:', { correo });

      const response: AxiosResponse<LoginApiResponse> = await this.api.post(Config.ENDPOINTS.AUTH_LOGIN, {
        correo,
        contrasena
      });

      console.log('✅ Respuesta de login:', response.data);

      if (response.data.status === 'success' && response.data.data) {
        const { accessToken, refreshToken, user } = response.data.data;

        // ✅ VALIDACIÓN CRÍTICA: Solo administradores pueden acceder
        if (user.id_rol !== 1) {
          console.log('❌ Acceso denegado: Usuario no es administrador', {
            rol: user.id_rol,
            usuario: user.nombre
          });

          return {
            success: false,
            error: 'Acceso denegado. Esta aplicación es exclusiva para administradores del gimnasio.'
          };
        }

        // Guardar datos de sesión
        await AsyncStorage.setItem(Config.AUTH.TOKEN_KEY, accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('userInfo', JSON.stringify(user));

        // Establecer token en headers
        this.api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        console.log('✅ Administrador autenticado correctamente:', user.nombre);

        // Mapear usuario para compatibilidad
        const mappedUser: User = {
          id: String(user.id),
          nombre: user.nombre,
          correo: user.correo,
          id_rol: user.id_rol,
          roleCode: 'ADMIN',
          roleName: 'Administrador',
        };

        return {
          success: true,
          data: {
            user: mappedUser,
            accessToken,
            refreshToken
          }
        };
      } else {
        throw new Error(response.data.message || 'Error en el login');
      }

    } catch (error: any) {
      console.error('💥 Error en login:', error);

      let errorMessage = 'Error al iniciar sesión';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Acceso denegado. Esta aplicación es exclusiva para administradores.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error del servidor. Intenta nuevamente en unos momentos.';
      } else if (!error.response) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Métodos de sesión simplificados
  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(Config.AUTH.TOKEN_KEY);
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  }

  async getStoredUser(): Promise<any | null> {
    try {
      const userJson = await AsyncStorage.getItem('userInfo');

      if (userJson) {
        const userData = JSON.parse(userJson);

        // Convertir formato de API a formato de app con todos los campos disponibles
        return {
          id: String(userData.id),
          codigo: userData.codigo,
          nombre: userData.nombre,
          apellido: userData.apellido,
          correo: userData.correo,
          telefono: userData.telefono,
          direccion: userData.direccion,
          genero: userData.genero,
          tipo_documento: userData.tipo_documento,
          numero_documento: userData.numero_documento,
          fecha_nacimiento: userData.fecha_nacimiento,
          id_rol: userData.id_rol,
          estado: userData.estado,
          asistencias_totales: userData.asistencias_totales,
          fecha_actualizacion: userData.fecha_actualizacion || userData.updatedAt,
          rol: userData.rol,
          roleCode: 'ADMIN',
          roleName: 'Administrador',
        };
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  }

  async clearSession(): Promise<void> {
    try {
      console.log('🧹 Limpiando sesión de administrador...');

      await AsyncStorage.multiRemove([
        Config.AUTH.TOKEN_KEY,
        'refreshToken',
        'userInfo'
      ]);

      delete this.api.defaults.headers.common['Authorization'];

      console.log('✅ Sesión de administrador limpiada');
    } catch (error) {
      console.error('❌ Error limpiando sesión:', error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post(Config.ENDPOINTS.AUTH_LOGOUT);
      console.log('✅ Logout exitoso en servidor');
    } catch (error) {
      console.warn('⚠️ Error en logout del servidor:', error);
    } finally {
      await this.clearSession();
    }
  }

  async checkTokenStatus(): Promise<void> {
    const token = await this.getStoredToken();
    if (!token) {
      throw new Error('No token found');
    }

    // Verificar token con el servidor
    await this.api.get('/auth/profile');
  }

  async getProfile(): Promise<any> {
    try {
      const response = await this.api.get('/auth/profile');

      if (response.data.status === 'success') {
        const userData = response.data.data.usuario;

        // Verificar que sigue siendo administrador
        if (userData.id_rol !== 1) {
          throw new Error('Usuario ya no es administrador');
        }

        // Mapear todos los datos del perfil completo
        return {
          // Información básica
          id: String(userData.id || Math.random()),
          codigo: userData.codigo,
          nombre: userData.nombre,
          apellido: userData.apellido,
          correo: userData.correo,
          telefono: userData.telefono,
          direccion: userData.direccion,
          genero: userData.genero,

          // Información de identificación
          tipo_documento: userData.tipo_documento,
          numero_documento: userData.numero_documento,
          fecha_nacimiento: userData.fecha_nacimiento,

          // Información del sistema
          id_rol: userData.id_rol,
          estado: userData.estado,
          asistencias_totales: userData.asistencias_totales,
          fecha_actualizacion: userData.updatedAt || userData.fecha_actualizacion,

          // Información del rol (incluye permisos y privilegios)
          rol: userData.rol,

          // Campos de compatibilidad con la app
          roleCode: 'ADMIN',
          roleName: 'Administrador',
        };
      }

      throw new Error('Error al obtener perfil');
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      throw error;
    }
  }

  // Mappers simplificados
  private mapTrainerFromApi(item: any): Trainer {
    const usuario = item.usuario || item;
    return {
      id: String(item.id ?? item.id_entrenador ?? usuario.id ?? Math.random()),
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      email: usuario.correo || '',
      telefono: usuario.telefono || '',
      especialidad: item.especialidad || 'General',
      fechaIngreso: usuario.fecha_registro || new Date().toISOString(),
      activo: item.estado ?? usuario.estado ?? true,
      experiencia: 0,
      certificaciones: [],
      foto: undefined,
    };
  }

  private mapClientFromApi(item: any): Client {
    const usuario = item.usuario || item;
    return {
      id: String(item.id_persona ?? item.id ?? usuario.id ?? Math.random()),
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      email: usuario.correo || '',
      telefono: usuario.telefono || '',
      tipoDocumento: usuario.tipo_documento || 'CC',
      numeroDocumento: usuario.numero_documento || '',
      fechaNacimiento: usuario.fecha_nacimiento || new Date().toISOString(),
      fechaRegistro: item.fecha_registro || usuario.fecha_registro || new Date().toISOString(),
      activo: item.estado ?? usuario.estado ?? true,
      membresia: undefined,
      beneficiarios: Array.isArray(item.beneficiarios)
        ? item.beneficiarios.map((b: any) => this.mapClientFromApi(b.persona_beneficiaria || b))
        : undefined,
    };
  }

  // ENTRENADORES
  async getTrainers(params?: PaginationParams): Promise<PaginatedResponse<Trainer>> {
    try {
      console.log('🔄 Admin: Obteniendo entrenadores...');

      const queryParams = {
        pagina: params?.page ?? 1,
        limite: params?.limit ?? 10,
        q: params?.search ?? undefined,
      };

      const response = await this.api.get(Config.ENDPOINTS.TRAINERS, { params: queryParams });

      console.log('✅ Entrenadores obtenidos:', response.data);

      let trainersData: any[] = [];
      let pagination: any = {};

      // Extraer datos según la estructura de respuesta real
      if (response.data.success && response.data.data) {
        // Estructura: { success: true, data: { data: [...], pagination: {...} } }
        const apiData = response.data.data;
        trainersData = Array.isArray(apiData.data) ? apiData.data : [];
        pagination = apiData.pagination || {};
        console.log('🔍 Entrenadores extraídos del formato success:', trainersData.length);
      } else if (response.data.status === 'success' && response.data.data) {
        // Estructura: { status: 'success', data: { data: [...], pagination: {...} } }
        const apiData = response.data.data;
        trainersData = Array.isArray(apiData.data) ? apiData.data : [];
        pagination = apiData.pagination || {};
        console.log('🔍 Entrenadores extraídos del formato status success:', trainersData.length);
      } else {
        // Fallback: intentar extraer directamente
        trainersData = Array.isArray(response.data?.data) ? response.data.data : Array.isArray(response.data) ? response.data : [];
        pagination = response.data?.pagination || {};
        console.log('🔍 Entrenadores extraídos del fallback:', trainersData.length);
      }

      console.log('🔍 Array de entrenadores a mapear:', trainersData);

      const mappedTrainers: Trainer[] = trainersData.map(this.mapTrainerFromApi.bind(this));

      const totalCount = pagination.total ?? mappedTrainers.length;
      const currentLimit = queryParams.limite;

      return {
        data: mappedTrainers,
        total: totalCount,
        page: pagination.page ?? queryParams.pagina,
        limit: pagination.limit ?? currentLimit,
        totalPages: pagination.totalPages ?? Math.ceil(totalCount / currentLimit),
      };

    } catch (error) {
      console.error('💥 Error obteniendo entrenadores:', error);

      return {
        data: [],
        total: 0,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        totalPages: 0,
      };
    }
  }

  // CLIENTES
  async getClients(params?: PaginationParams): Promise<PaginatedResponse<Client>> {
    try {
      console.log('🔄 Admin: Obteniendo clientes...');

      const queryParams = {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        search: params?.search ?? undefined,
      };

      const response = await this.api.get(Config.ENDPOINTS.CLIENTS, { params: queryParams });

      console.log('✅ Clientes obtenidos:', response.data);

      let clientsData: any[] = [];
      let pagination: any = {};

      if (response.data.status === 'success') {
        const data = response.data.data;
        clientsData = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        pagination = data?.pagination || {};
      } else {
        clientsData = Array.isArray(response.data?.data) ? response.data.data : Array.isArray(response.data) ? response.data : [];
        pagination = response.data?.pagination || {};
      }

      const mappedClients: Client[] = clientsData.map(this.mapClientFromApi.bind(this));

      const totalCount = pagination.total ?? mappedClients.length;
      const currentLimit = queryParams.limit;

      return {
        data: mappedClients,
        total: totalCount,
        page: pagination.page ?? queryParams.page,
        limit: pagination.limit ?? currentLimit,
        totalPages: pagination.totalPages ?? Math.ceil(totalCount / currentLimit),
      };

    } catch (error) {
      console.error('💥 Error obteniendo clientes:', error);

      return {
        data: [],
        total: 0,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        totalPages: 0,
      };
    }
  }

  // DASHBOARD
  async getMobileQuickSummary(period: 'today' | 'week' | 'month' = 'today'): Promise<any> {
    try {
      console.log('🔄 Admin: Obteniendo resumen del dashboard...');

      const response = await this.api.get('/dashboard-mobile/quick-summary', {
        params: { period, compact: true }
      });

      console.log('✅ Resumen dashboard obtenido:', response.data);

      if (response.data.status === 'success') {
        return response.data.data;
      }

      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('💥 Error obteniendo resumen dashboard:', error);
      throw error;
    }
  }

  async getMobileMainMetrics(period: 'today' | 'week' | 'month' = 'today'): Promise<any> {
    try {
      console.log('🔄 Admin: Obteniendo métricas principales...');

      const response = await this.api.get('/dashboard-mobile/main-metrics', {
        params: { period }
      });

      console.log('✅ Métricas principales obtenidas:', response.data);

      if (response.data.status === 'success') {
        return response.data.data;
      }

      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('💥 Error obteniendo métricas principales:', error);
      throw error;
    }
  }

  async getMobileWidget(): Promise<any> {
    try {
      console.log('🔄 Admin: Obteniendo widget...');

      const response = await this.api.get('/dashboard-mobile/widget');

      console.log('✅ Widget obtenido:', response.data);

      if (response.data.status === 'success') {
        return response.data.data;
      }

      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('💥 Error obteniendo widget:', error);
      throw error;
    }
  }

  // Resto de métodos CRUD simplificados...
  async getTrainer(id: string): Promise<any> {
    try {
      const response = await this.api.get(`${Config.ENDPOINTS.TRAINERS}/${id}`);
      const data = response.data.status === 'success' ? response.data.data : response.data;
      return this.mapTrainerFromApi(data?.trainer || data);
    } catch (error) {
      console.error('Error getting trainer:', error);
      throw error;
    }
  }

  async createTrainer(trainer: any): Promise<any> {
    try {
      const response = await this.api.post(Config.ENDPOINTS.TRAINERS, trainer);
      const data = response.data.status === 'success' ? response.data.data : response.data;
      return this.mapTrainerFromApi(data?.trainer || data);
    } catch (error) {
      console.error('Error creating trainer:', error);
      throw error;
    }
  }

  async updateTrainer(id: string, trainer: any): Promise<any> {
    try {
      const response = await this.api.put(`${Config.ENDPOINTS.TRAINERS}/${id}`, trainer);
      const data = response.data.status === 'success' ? response.data.data : response.data;
      return this.mapTrainerFromApi(data?.trainer || data);
    } catch (error) {
      console.error('Error updating trainer:', error);
      throw error;
    }
  }

  async deleteTrainer(id: string): Promise<void> {
    await this.api.delete(`${Config.ENDPOINTS.TRAINERS}/${id}`);
  }

  async getClient(id: string): Promise<Client> {
    const response = await this.api.get(`${Config.ENDPOINTS.CLIENT_DETAIL(id)}`);
    const data = response.data.status === 'success' ? response.data.data : response.data;
    return this.mapClientFromApi(data);
  }

  async createClient(client: CreateClientRequest): Promise<Client> {
    const response = await this.api.post(Config.ENDPOINTS.CLIENTS, client as any);
    const data = response.data.status === 'success' ? response.data.data : response.data;
    return this.mapClientFromApi(data);
  }

  async updateClient(id: string, client: Partial<CreateClientRequest>): Promise<Client> {
    const response = await this.api.put(`${Config.ENDPOINTS.CLIENT_DETAIL(id)}`, client as any);
    const data = response.data.status === 'success' ? response.data.data : response.data;
    return this.mapClientFromApi(data);
  }

  async deleteClient(id: string): Promise<void> {
    await this.api.delete(`${Config.ENDPOINTS.CLIENT_DETAIL(id)}`);
  }

  async checkUser(tipoDocumento: string, numeroDocumento: string): Promise<{ exists: boolean; client?: Client }> {
    const response = await this.api.get(`${Config.ENDPOINTS.CLIENTS}/check-user/${tipoDocumento}/${numeroDocumento}`);
    const data = response.data.status === 'success' ? response.data.data : response.data;
    return {
      exists: !!data,
      client: data ? this.mapClientFromApi({ usuario: data, estado: true }) : undefined,
    };
  }
}

export const apiService = new ApiService();
