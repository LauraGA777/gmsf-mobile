// Tipos de autenticación
export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface LoginResponse {
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
      id_persona?: number;
    };
  };
}

export interface User {
  id: number;
  codigo?: string;
  nombre: string;
  apellido?: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  genero?: string;
  tipo_documento?: string;
  numero_documento?: string;
  fecha_nacimiento?: string;
  asistencias_totales?: number;
  estado?: boolean;
  id_rol: number;
  rol?: any;
}

// Tipos para el Dashboard
export interface DashboardStats {
  ausentismos: number;
  contratos: number;
  ingresos: number;
  membresías: number;
  clientes: number;
}

export interface OptimizedStats {
  asistenciasPorDia: AssistanceByDay[];
  tendenciaIngresos: IncomeData[];
}

export interface AssistanceByDay {
  fecha: string;
  total: number;
  mañana: number;
  promedio: number;
}

export interface IncomeData {
  fecha: string;
  total: number;
  promedio: number;
  maximo: number;
  meta: number;
}

// Tipos para Entrenadores
export interface Trainer {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  especialidad: string;
  fechaIngreso: string;
  activo: boolean;
  experiencia: number;
  certificaciones: string[];
  foto?: string;
}

export interface CreateTrainerRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  especialidad: string;
  experiencia: number;
  certificaciones: string[];
}

// Tipos para Clientes
export interface Client {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  fechaRegistro: string;
  activo: boolean;
  membresia?: Membership;
  beneficiarios?: Client[];
}

export interface Membership {
  id: string;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'activa' | 'vencida' | 'suspendida';
  precio: number;
}

export interface CreateClientRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
}

// Tipos de navegación
export type RootTabParamList = {
  Dashboard: undefined;
  Entrenadores: undefined;
  Clientes: undefined;
  Perfil: undefined;
};

export type TrainersStackParamList = {
  TrainersList: undefined;
  TrainerDetail: { trainerId: string };
  CreateTrainer: undefined;
  EditTrainer: { trainerId: string };
};

export type ClientsStackParamList = {
  ClientsList: undefined;
  ClientDetail: { clientId: string };
  CreateClient: undefined;
  EditClient: { clientId: string };
  MyProfile: undefined;
};

// Tipos de respuesta de API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
