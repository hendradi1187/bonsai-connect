const http = require('http');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = require('./app');
const { sequelize } = require('./models');
const { ensureDefaultUsers } = require('./bootstrap/seedUsers');
const { ensurePassportSeedData } = require('./bootstrap/seedPassportData');
const { initMinio } = require('./config/minio');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Initialize Socket.io
const { init } = require('./websocket/handlers');
init(server);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    await ensureDefaultUsers();

    // Seed data demo hanya untuk development — tidak dijalankan di production
    if (process.env.NODE_ENV !== 'production') {
      await ensurePassportSeedData();
    }

    await initMinio();
    
    // In production, use migrations. For dev, sync is okay if the user wants it.
    // However, the docker-compose runs a migrate script that does this sync.
    
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
