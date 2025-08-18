const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// El puerto web se maneja a través de los comandos CLI de Expo
// No necesita configuración específica en metro.config.js

module.exports = config;
