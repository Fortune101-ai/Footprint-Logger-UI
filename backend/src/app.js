import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectToDatabase from '#config/db.js';
import errorHandler from '#middleware/errorHandler.middleware.js';
import authRoutes from '#routes/auth.routes.js';
import activityRoutes from '#routes/activity.routes.js';
import helmet from 'helmet';
import logger from '#config/logger.js';
import { Server } from 'socket.io';
import http from 'http';
import securityMiddleware from '#middleware/security.middleware.js';
import { socketAuth } from '#middleware/socketAuth.middleware.js';

connectToDatabase().catch((err) => {
  logger.error('Failed to connect to the database', err);
  process.exit(1);
});

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    path: '/socket.io',
    methods: ['GET', 'POST'],
  },
});

io.use(socketAuth);

io.on('connection', (socket) => {
  if (!socket.userId) return;
  logger.info(`User connected: ${socket.userId}`);
  socket.join(`user-${socket.userId}`);

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.userId}`);
  });
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(securityMiddleware);

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);

app.get('/', (req, res) => {
  logger.info('Root route accessed');
  res.send('Carbon Footprint Logger API!');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use((req, res) => {
  logger.warn('Route not found', { url: req.originalUrl });
  res.status(404).json({ message: 'Route Not Found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
