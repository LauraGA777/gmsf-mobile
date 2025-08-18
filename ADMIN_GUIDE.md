# Guía para Administradores - GMSF Mobile

## 🔑 Gestión de Tokens de Acceso

### Obtener Token para la Aplicación Móvil

Para usar la aplicación móvil GMSF, los usuarios necesitan un token de acceso válido. 

### Métodos para Obtener Tokens

#### Método 1: Desde la Aplicación Web
1. Inicia sesión en el panel de administración web
2. Ve a la sección de "Configuración" o "API"
3. Genera un nuevo token de acceso
4. Copia el token y proporciónalo al usuario móvil

#### Método 2: Endpoint de Autenticación (si está disponible)
```bash
# Ejemplo de petición para obtener token
curl -X POST https://gmsf-backend.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@gmsf.com",
    "password": "contraseña"
  }'
```

#### Método 3: Token de Administrador
Si tienes acceso directo a la base de datos o configuración del servidor:
1. Accede a la configuración del backend
2. Genera un token JWT válido
3. Configura el token con los permisos apropiados

### Estructura del Token

El token debe ser un JWT (JSON Web Token) válido que incluya:
- ID del usuario
- Permisos/roles
- Fecha de expiración
- Cualquier metadata necesaria

### Distribución de Tokens

#### Para Administradores
- Acceso completo a dashboard, entrenadores y clientes
- Permisos de lectura y escritura
- Acceso a estadísticas y reportes

#### Para Entrenadores
- Acceso limitado a su información y clientes asignados
- Permisos de lectura principalmente
- Acceso a horarios y asistencias

#### Para Clientes
- Acceso solo a su información personal
- Vista de su membresía y beneficiarios
- Historial de asistencias

### Configuración en la App Móvil

Una vez que tengas el token:
1. Abre la aplicación GMSF Mobile
2. En la pantalla de login, ingresa el token
3. La aplicación verificará el token automáticamente
4. Si es válido, se almacenará de forma segura

### Solución de Problemas

#### Token Inválido
- Verifica que el token no haya expirado
- Confirma que el formato del token sea correcto
- Asegúrate de que el servidor esté funcionando

#### Error de Conexión
- Verifica que la URL del backend sea correcta: `https://gmsf-backend.vercel.app`
- Confirma que el servidor esté en línea
- Revisa la conexión a internet

#### Permisos Insuficientes
- Verifica que el token tenga los permisos correctos
- Confirma el rol del usuario en el sistema
- Regenera el token si es necesario

### Endpoint de Prueba

Para verificar que un token funciona:
```bash
curl -X GET https://gmsf-backend.vercel.app/dashboard/stats \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

Si devuelve datos en lugar de error, el token es válido.

### Contacto Técnico

Para problemas técnicos o dudas sobre la integración:
- Revisa los logs del servidor backend
- Verifica la documentación de la API
- Contacta al equipo de desarrollo

## 📱 Distribución de la App

### Para Usuarios Finales
1. Comparte el APK o enlace de la app
2. Proporciona el token de acceso
3. Asiste con el primer login si es necesario

### Para Testing
1. Usa tokens de prueba en entorno de desarrollo
2. Verifica todas las funcionalidades
3. Confirma que los datos se muestren correctamente

---

**Nota**: Mantén los tokens seguros y no los compartas públicamente. Renueva los tokens periódicamente por seguridad.
