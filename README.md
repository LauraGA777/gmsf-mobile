# GMSF Mobile App

Aplicación móvil para el sistema de gestión de gimnasio GMSF, desarrollada con React Native, TypeScript y Expo.

## 🚀 Características

- **Dashboard interactivo** con estadísticas en tiempo real
- **Gestión de entrenadores** con búsqueda y filtros
- **Gestión de clientes** con información de membresías
- **Interfaz móvil optimizada** con excelente UX/UI
- **Gráficos y visualizaciones** de datos
- **Diseño responsive** adaptado a diferentes tamaños de pantalla

## 📱 Pantallas

### Dashboard
- Estadísticas principales (ausentismos, contratos, ingresos, membresías, clientes)
- Gráficos de tendencias de asistencias
- Gráficos de evolución de ingresos
- Actualización en tiempo real

### Entrenadores
- Lista de entrenadores con información completa
- Búsqueda por nombre, apellido o especialidad
- Estados (activo/inactivo)
- Certificaciones y experiencia
- Acciones (activar/desactivar/eliminar)

### Clientes
- Lista de clientes con datos personales
- Información de membresías
- Estados de membresía (activa/vencida/suspendida)
- Búsqueda por nombre, documento o email

### Perfil
- Información del usuario
- Configuraciones de la aplicación
- Opciones de cuenta

## 🛠️ Tecnologías

- **React Native** 0.79.5
- **TypeScript** 5.8.3
- **Expo** ~53.0.20
- **React Navigation** 6.x
- **React Native Chart Kit** para gráficos
- **Expo Vector Icons** para iconografía
- **Axios** para peticiones HTTP

## 🔧 Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd gmsf-mobile
```

2. Instala las dependencias:
```bash
npm install
```

3. Configuración completada para la API en producción:
```typescript
// La aplicación ya está configurada para usar:
baseURL: 'https://gmsf-backend.vercel.app'
```

4. Inicia la aplicación:
```bash
npm start
```

5. **Sistema de Autenticación**:
   - La aplicación incluye una pantalla de login
   - Requiere un token de acceso válido
   - Contacta al administrador para obtener tu token
   - Incluye verificación automática de tokens existentes

## 🔐 Autenticación y Uso

### Primera Vez
1. Ejecuta la aplicación
2. Se mostrará la pantalla de login
3. Ingresa tu token de acceso proporcionado por el administrador
4. La aplicación verificará el token y te dará acceso

### Tokens
- Los tokens se almacenan de forma segura en el dispositivo
- La aplicación verifica automáticamente la validez del token al iniciar
- Si un token expira, se solicita un nuevo login automáticamente

## 📋 Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run android` - Ejecuta en Android
- `npm run ios` - Ejecuta en iOS
- `npm run web` - Ejecuta en navegador web

## 🔗 Endpoints API

La aplicación está configurada para conectarse con los siguientes endpoints:

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas del dashboard
- `GET /api/dashboard/optimized` - Estadísticas optimizadas

### Entrenadores
- `GET /api/trainers/` - Listar entrenadores
- `GET /api/trainers/:id` - Detalles de entrenador
- `POST /api/trainers/` - Crear entrenador
- `PUT /api/trainers/:id` - Actualizar entrenador
- `PATCH /api/trainers/:id/activate` - Activar entrenador
- `PATCH /api/trainers/:id/deactivate` - Desactivar entrenador
- `DELETE /api/trainers/:id` - Eliminar entrenador

### Clientes
- `GET /api/clients/me` - Mi información
- `GET /api/clients/me/beneficiaries` - Mis beneficiarios
- `GET /api/clients/` - Listar clientes
- `GET /api/clients/check-user/:tipo/:numero` - Verificar usuario
- `GET /api/clients/:id` - Detalles de cliente
- `POST /api/clients/` - Crear cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente

## 🎨 Diseño

La aplicación mantiene la consistencia visual con el sistema web:

- **Colores principales**: Azul (#1e40af), Verde (#059669), Rojo (#dc2626)
- **Tipografía**: Sistema nativo optimizada
- **Espaciado**: Sistema consistente de 4px base
- **Sombras**: Múltiples niveles para profundidad
- **Iconografía**: Material Icons

## 📱 Características Mobile

- **Navegación por pestañas** intuitiva
- **Pull-to-refresh** en todas las listas
- **Búsqueda en tiempo real**
- **Estados de carga** y vacío
- **Animaciones suaves**
- **Feedback táctil**
- **Optimización de rendimiento**

## 🔐 Autenticación

La aplicación incluye interceptors para:
- Agregar tokens de autenticación automáticamente
- Manejar errores 401 (no autorizado)
- Almacenamiento seguro de tokens

## 📊 Características de Datos

- **Datos mock** para desarrollo sin backend
- **Formateo de moneda** colombiana (COP)
- **Formateo de fechas** localizadas
- **Validación de tipos** con TypeScript
- **Manejo de errores** robusto

## 🚧 Próximas Características

- [ ] Autenticación completa
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Formularios de creación/edición
- [ ] Filtros avanzados
- [ ] Exportación de datos
- [ ] Tema oscuro

## 📞 Soporte

Para soporte técnico o preguntas sobre la aplicación, contacta al equipo de desarrollo.
