import pkg from './src/generated/prisma/index.js';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('🔍 Testing database...');
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL!');
    
    const users = await prisma.user.count();
    const transactions = await prisma.transaction.count();
    const ocrLogs = await prisma.ocrLog.count();
    
    console.log(`📊 Users: ${users}`);
    console.log(`💰 Transactions: ${transactions}`);
    console.log(`📸 OCR Logs: ${ocrLogs}`);
    
    await prisma.$disconnect();
    console.log('✅ Database setup berhasil!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();