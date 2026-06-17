const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

let server;

const start = async () => {
  try {
    await connectDB();
    server = app.listen(env.port, () => {
      console.log(`TaskFlow Pro API running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully.`);
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  if (server) server.close(() => process.exit(1));
});

start();
