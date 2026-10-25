import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

async function initDatabase() {
  console.log('--- Initializing Farmer\'s Online Granary Database ---');
  console.log(`Connecting to MySQL host: ${config.host}:${config.port} as user: ${config.user}...`);

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('MySQL server connection established.');

    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');

    console.log(`Reading schema from: ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing database schema creation and table definitions...');
    await connection.query(schemaSql);
    console.log('Schema executed successfully. Database `farmers_granary` is ready.');

    console.log(`Reading demonstration seed data from: ${seedPath}`);
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('Executing demonstration seed data...');
    await connection.query(seedSql);
    console.log('Demonstration seed data imported successfully!');

    console.log('\n--- Database Initialization Complete! ---');
    console.log('Sample Accounts Created:');
    console.log('1. Admin: admin@farmersgranary.test | Password: Password@123');
    console.log('2. Farmer (Mandya): ramesh.farmer@farmersgranary.test | Password: Password@123');
    console.log('3. Farmer (Dharwad): basavaraj.farmer@farmersgranary.test | Password: Password@123');
    console.log('4. Farmer (Uttara Kannada): manjunath.farmer@farmersgranary.test | Password: Password@123');
    console.log('5. Buyer (Individual): anand.buyer@farmersgranary.test | Password: Password@123');
    console.log('6. Buyer (Wholesaler): mysore.traders@farmersgranary.test | Password: Password@123');
  } catch (err) {
    console.error('\nDatabase initialization failed:');
    console.error('Error Code:', err.code);
    console.error('Message:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n--> Authentication failed. Please check your DB_PASSWORD in backend/.env');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
