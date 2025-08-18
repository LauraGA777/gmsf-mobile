module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
  // Worklets (Reanimated) plugin debe ir al final
  'react-native-worklets/plugin',
    ],
  };
};
