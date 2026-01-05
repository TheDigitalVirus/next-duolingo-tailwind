import { testMailtrap } from '@/services/send-email';

async function runTest() {
  console.log('🚀 Iniciando teste do Mailtrap...\n');
  await testMailtrap();
}

runTest().catch(console.error);