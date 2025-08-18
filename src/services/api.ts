import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../constants/config';
import {
  DashboardStats,
  OptimizedStats,
  Trainer,
  CreateTrainerRequest,
  Client,
  CreateClientRequest,
  ApiResponse,
  PaginatedResponse,
  LoginRequest,
  LoginResponse,
  User,
} from '../types';

class ApiService {
  private api: AxiosInstance;
  
  constructor() {
    // API desplegada en Vercel
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
    // Request interceptor para agregar token
    this.api.interceptors.request.use(
      async (config) => {
  const token = await AsyncStorage.getItem(Config.AUTH.TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor para manejar errores
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
      },
      async (error) => {
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
        
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem(Config.AUTH.TOKEN_KEY);
          // Aquí podrías redirigir al login
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(correo: string, contrasena: string): Promise<LoginResponse> {
    console.log('🔑 Intentando login con:', { correo });
    
  const response: AxiosResponse<LoginResponse> = await this.api.post(Config.ENDPOINTS.AUTH_LOGIN, {
      correo,
      contrasena
    });
    
    console.log('✅ Login exitoso:', { 
      status: response.data.status, 
      user: response.data.data?.user?.correo 
    });
    
    // Guardar el token y la información del usuario
    if (response.data.status === 'success' && response.data.data.accessToken) {
      await AsyncStorage.setItem(Config.AUTH.TOKEN_KEY, response.data.data.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.data.refreshToken);
      await AsyncStorage.setItem('userInfo', JSON.stringify(response.data.data.user));
      
      // Establecer el token en los headers por defecto
      this.api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.accessToken}`;
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      // Llamar al endpoint de logout del backend
      await this.api.post(Config.ENDPOINTS.AUTH_LOGOUT);
    } catch (error) {
      console.log('Error en logout del servidor:', error);
    } finally {
      // Limpiar datos locales
      await AsyncStorage.removeItem(Config.AUTH.TOKEN_KEY);
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userInfo');
      delete this.api.defaults.headers.common['Authorization'];
      console.log('🚪 Logout completado');
    }
  }

  // Limpiar sesión local sin llamar al backend (para tokens expirados)
  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(Config.AUTH.TOKEN_KEY);
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userInfo');
      delete this.api.defaults.headers.common['Authorization'];
      console.log('🧹 Sesión local limpiada');
    } catch (e) {
      console.log('Error limpiando sesión local', e);
    }
  }

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem(Config.AUTH.TOKEN_KEY);
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem('userInfo');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error al obtener usuario almacenado:', error);
      return null;
    }
  }

  async getProfile(): Promise<User> {
  const response = await this.api.get('/auth/profile');
    console.log('✅ Perfil obtenido:', response.data);
    
    if (response.data.status === 'success') {
      return response.data.data.usuario;
    }
    
    throw new Error('Error al obtener perfil');
  }

  async setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(Config.AUTH.TOKEN_KEY, token);
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Token establecido correctamente');
  }

  // Método temporal para establecer un token de demo
  async setDemoToken(): Promise<void> {
    // Token de ejemplo - reemplazar con uno real o implementar login
    const demoToken = 'demo-token-for-testing';
  await AsyncStorage.setItem(Config.AUTH.TOKEN_KEY, demoToken);
    console.log('🔑 Token de demo establecido');
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<any> {
    try {
      const response = await this.api.get(Config.ENDPOINTS.DASHBOARD_STATS);
      // Extraer los datos del formato real de la API
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  async getOptimizedStats(): Promise<any> {
    try {
      const response = await this.api.get(Config.ENDPOINTS.DASHBOARD_OPTIMIZED);
      // Extraer los datos del formato real de la API
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error getting optimized stats:', error);
      throw error;
    }
  }

  // Helpers para mapear modelos de backend a modelos de app
  private mapTrainerFromApi(item: any): Trainer {
    const usuario = item.usuario || {};
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
    const usuario = item.usuario || {};
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

  // Trainers endpoints
  async getTrainers(params?: { search?: string; page?: number; limit?: number }): Promise<any> {
    try {
      // Backend espera: pagina, limite, q
      const defaultParams = {
        pagina: params?.page ?? 1,
        limite: params?.limit ?? 10,
        q: params?.search ?? undefined,
      } as any;

      const response = await this.api.get(Config.ENDPOINTS.TRAINERS, { params: defaultParams });

      const payload = response.data?.data || response.data;
      const rawList: any[] = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

      const mapped = rawList.map(this.mapTrainerFromApi.bind(this));

      const pagination = payload?.pagination || {};
      return {
        data: mapped,
        total: pagination.total ?? 0,
        page: pagination.page ?? defaultParams.pagina,
        limit: pagination.limit ?? defaultParams.limite,
        totalPages: pagination.totalPages ?? undefined,
      };
    } catch (error) {
      console.error('Error getting trainers:', error);
      // Retornar estructura vacía en caso de error
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };
    }
  }

  async getTrainer(id: string): Promise<any> {
    try {
      const response = await this.api.get(`${Config.ENDPOINTS.TRAINERS}/${id}`);
      const payload = response.data?.data || response.data;
      const trainerRaw = payload?.trainer || payload;
      return this.mapTrainerFromApi(trainerRaw);
    } catch (error) {
      console.error('Error getting trainer:', error);
      throw error;
    }
  }

  async createTrainer(trainer: any): Promise<any> {
    try {
      const response = await this.api.post(Config.ENDPOINTS.TRAINERS, trainer);
      const payload = response.data?.data || response.data;
      return this.mapTrainerFromApi(payload?.trainer || payload);
    } catch (error) {
      console.error('Error creating trainer:', error);
      throw error;
    }
  }

  async updateTrainer(id: string, trainer: any): Promise<any> {
    try {
      const response = await this.api.put(`${Config.ENDPOINTS.TRAINERS}/${id}`, trainer);
      const payload = response.data?.data || response.data;
      return this.mapTrainerFromApi(payload?.trainer || payload);
    } catch (error) {
      console.error('Error updating trainer:', error);
      throw error;
    }
  }

  async activateTrainer(id: string): Promise<void> {
    try {
      await this.api.patch(`${Config.ENDPOINTS.TRAINERS}/${id}/activate`);
    } catch (error) {
      console.error('Error activating trainer:', error);
      throw error;
    }
  }

  async deactivateTrainer(id: string): Promise<void> {
    try {
      await this.api.patch(`${Config.ENDPOINTS.TRAINERS}/${id}/deactivate`);
    } catch (error) {
      console.error('Error deactivating trainer:', error);
      throw error;
    }
  }

  async deleteTrainer(id: string): Promise<void> {
    await this.api.delete(`${Config.ENDPOINTS.TRAINERS}/${id}`);
  }

  // Clients endpoints
  async getMyInfo(): Promise<Client> {
  const response: AxiosResponse<ApiResponse<Client>> = await this.api.get(Config.ENDPOINTS.CLIENTS_ME);
  const raw = response.data.data as any;
  return this.mapClientFromApi(raw);
  }

  async getMyBeneficiaries(): Promise<Client[]> {
  const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(Config.ENDPOINTS.CLIENTS_BENEFICIARIES);
  const raw = response.data.data || [];
  return raw.map((b: any) => this.mapClientFromApi(b.persona_beneficiaria || b));
  }

  async getClients(params?: { search?: string; page?: number; limit?: number }): Promise<any> {
    try {
      // Establecer parámetros por defecto para evitar NaN
      const defaultParams = {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        search: params?.search ?? undefined,
      };

      const response = await this.api.get(Config.ENDPOINTS.CLIENTS, { params: defaultParams });

      const rawList: any[] = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : [];

      const mapped = rawList.map(this.mapClientFromApi.bind(this));

      const pg = response.data?.pagination || {};
      return {
        data: mapped,
        total: pg.total ?? 0,
        page: pg.page ?? defaultParams.page,
        limit: pg.limit ?? defaultParams.limit,
        totalPages: pg.totalPages ?? undefined,
      };
    } catch (error) {
      console.error('Error getting clients:', error);
      // Retornar estructura vacía en caso de error
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };
    }
  }

  async checkUser(tipoDocumento: string, numeroDocumento: string): Promise<{ exists: boolean; client?: Client }> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.get(`${Config.ENDPOINTS.CLIENTS}/check-user/${tipoDocumento}/${numeroDocumento}`);
    const raw = response.data.data;
    return {
      exists: !!raw,
      client: raw ? this.mapClientFromApi({ usuario: raw, estado: true }) : undefined,
    };
  }

  async getClient(id: string): Promise<Client> {
  const response: AxiosResponse<ApiResponse<any>> = await this.api.get(`${Config.ENDPOINTS.CLIENT_DETAIL(id)}`);
  return this.mapClientFromApi(response.data.data);
  }

  async createClient(client: CreateClientRequest): Promise<Client> {
  const response: AxiosResponse<ApiResponse<any>> = await this.api.post(Config.ENDPOINTS.CLIENTS, client as any);
  return this.mapClientFromApi(response.data.data);
  }

  async updateClient(id: string, client: Partial<CreateClientRequest>): Promise<Client> {
  const response: AxiosResponse<ApiResponse<any>> = await this.api.put(`${Config.ENDPOINTS.CLIENT_DETAIL(id)}`, client as any);
  return this.mapClientFromApi(response.data.data);
  }

  async deleteClient(id: string): Promise<void> {
  await this.api.delete(`${Config.ENDPOINTS.CLIENT_DETAIL(id)}`);
  }
}

export const apiService = new ApiService();
