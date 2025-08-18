import { apiService } from '../src/services/api';

// Script de prueba para verificar la conexión con la API
async function testApiConnection() {
  console.log('🔬 Iniciando pruebas de conexión con la API...');
  console.log('🌐 URL de la API:', 'https://gmsf-backend.vercel.app');
  
  try {
    // Probar conexión con dashboard
    console.log('\n📊 Probando endpoint de dashboard/stats...');
    const stats = await apiService.getDashboardStats();
    console.log('✅ Dashboard stats:', stats);
  } catch (error: any) {
    console.log('❌ Error dashboard stats:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
  }

  try {
    console.log('\n📈 Probando endpoint de dashboard/optimized...');
    const optimized = await apiService.getOptimizedStats();
    console.log('✅ Dashboard optimized:', optimized);
  } catch (error: any) {
    console.log('❌ Error dashboard optimized:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
  }

  try {
    console.log('\n👨‍💼 Probando endpoint de trainers...');
    const trainers = await apiService.getTrainers();
    console.log('✅ Trainers:', trainers);
  } catch (error: any) {
    console.log('❌ Error trainers:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
  }

  try {
    console.log('\n👥 Probando endpoint de clients...');
    const clients = await apiService.getClients();
    console.log('✅ Clients:', clients);
  } catch (error: any) {
    console.log('❌ Error clients:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
  }

  console.log('\n🏁 Pruebas de API completadas.');
}

// Ejecutar las pruebas si se llama directamente
if (require.main === module) {
  testApiConnection();
}

export { testApiConnection };
