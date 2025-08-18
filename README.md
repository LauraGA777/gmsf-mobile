# GMSF Mobile App

Aplicación móvil de GMSF desarrollada con React Native y TypeScript usando Expo.

## 📋 Prerrequisitos

Antes de clonar y ejecutar este proyecto, asegúrate de tener instalado:

### 1. Node.js
- **Versión recomendada:** Node.js 18 LTS o superior
- Descargar desde: https://nodejs.org/

### 2. Expo CLI
```bash
npm install -g @expo/cli
```

### 3. Para desarrollo móvil (opcional):
- **Android Studio** (para emulador Android)
- **Xcode** (para emulador iOS - solo en macOS)
- **Expo Go App** en tu dispositivo móvil ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))

## 🚀 Instalación y configuración

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/LauraGA777/gmsf-mobile.git
cd gmsf-mobile
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Verificar instalación de TypeScript
Las dependencias de TypeScript ya están incluidas en el proyecto, pero si tienes problemas, ejecuta:
```bash
npm install --save-dev typescript @types/react@~19.0.10 @types/react-native
```

## 🛠️ Scripts disponibles

### Desarrollo
```bash
# Iniciar el servidor de desarrollo
npm start

# Iniciar en Android
npm run android

# Iniciar en iOS
npm run ios

# Iniciar en web (puerto 3000 - configurado)
npm run web

# Iniciar en web explícitamente en puerto 3000
npm run web:3000

# Servidor de desarrollo con puerto personalizado
npm run dev
```

### Comandos Expo alternativos
```bash
# Iniciar con Expo CLI
npx expo start

# Limpiar cache y reiniciar
npx expo start --clear

# Iniciar web en puerto específico
npx expo start --web --port 3000
```

## 📱 Cómo ejecutar la aplicación

### Opción 1: En dispositivo físico (Recomendado)
1. Instala **Expo Go** en tu dispositivo móvil
2. Ejecuta `npm start`
3. Escanea el código QR que aparece en la terminal con:
   - **Android:** App Expo Go
   - **iOS:** Cámara del iPhone

### Opción 2: En emulador
1. **Android:**
   - Abre Android Studio y inicia un emulador
   - Ejecuta `npm run android`

2. **iOS (solo macOS):**
   - Abre Xcode Simulator
   - Ejecuta `npm run ios`

### Opción 3: En navegador web (Puerto 3000)
```bash
npm run web
```
Se abrirá automáticamente en http://localhost:3000

## 🔧 Estructura del proyecto

```
gmsf-mobile/
├── App.tsx              # Componente principal (TypeScript)
├── app.json             # Configuración de Expo
├── package.json         # Dependencias y scripts
├── tsconfig.json        # Configuración de TypeScript
├── metro.config.js      # Configuración de Metro bundler
├── .env                 # Variables de entorno (puerto web: 3000)
├── assets/              # Imágenes y recursos
│   ├── icon.png
│   ├── splash-icon.png
│   └── ...
└── src/                 # Código fuente
    ├── components/      # Componentes reutilizables
    ├── screens/         # Pantallas de la aplicación
    ├── services/        # Servicios (API, etc.)
    ├── constants/       # Constantes y configuración
    └── types/           # Definiciones de tipos TypeScript
```

## 🛠️ Tecnologías utilizadas

- **React Native** 0.79.5
- **TypeScript** ~5.8.3
- **Expo** ~53.0.20
- **React** 19.0.0
- **React Navigation** 7.x
- **Axios** para peticiones HTTP
- **AsyncStorage** para almacenamiento local

## ⚙️ Configuración de puertos

- **Aplicación web:** Puerto 3000 (configurado)
- **Metro bundler:** Puerto 8081 (por defecto)
- **Servidor de desarrollo:** Puerto 8082 (alternativo)

## 🚨 Solución de problemas comunes

### Error de puerto ocupado
```bash
# Si el puerto 3000 está ocupado para web
npx expo start --web --port 3001

# Si el metro bundler tiene problemas
npx expo start --port 8082
```

### Problemas con caché
```bash
npx expo start --clear
```

### Problemas con dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error de TypeScript
Si hay errores de TypeScript, verifica que tengas las versiones correctas:
```bash
npx expo install --fix
```

### Incompatibilidad de paquetes
Si aparecen warnings sobre versiones de paquetes:
```bash
npx expo install --fix
```

## 📝 Configuración de TypeScript

El proyecto está configurado con TypeScript usando:
- Configuración base de Expo (`expo/tsconfig.base`)
- Tipado estricto habilitado
- Alias de rutas configurado (`@/*` para `./src/*`)

## 🌐 Configuración de API

La aplicación se conecta a:
- **Backend:** https://gmsf-backend.vercel.app
- **Autenticación:** JWT tokens
- **Almacenamiento local:** AsyncStorage

## 🤝 Contribución

1. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Haz commit de tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Abre un Pull Request

## 📞 Soporte

Si tienes problemas durante la instalación o ejecución:
1. Revisa que tengas las versiones correctas de Node.js y npm
2. Verifica que todas las dependencias se instalaron correctamente
3. Consulta la documentación oficial de [Expo](https://docs.expo.dev/)

---

**¡Listo para desarrollar!** 🚀

**Versión web disponible en:** http://localhost:3000