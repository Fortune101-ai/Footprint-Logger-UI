import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectToDatabase from '#config/db.js';
import errorHandler from '#middleware/errorHandler.middleware.js';
import authRoutes from '#routes/auth.routes.js';
import activityRoutes from '#routes/activity.routes.js';
import helmet from 'helmet';
import logger from '#config/logger.js';
import {Server} from "socket.io"
import http from 'http';

connectToDatabase().catch((err) => {
  logger.error('Failed to connect to the database', err);
  process.exit(1);
});

const app = express();
const server = http.createServer(app)
const io = new Server(server, {
  cors:{
    origin:"*",
    path: "/socket.io",
    methods:["GET", "POST"]
  }
})
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req,res,next) => {
  req.io = io;
  next()
})

io.on("connection", (socket)=>{
  console.log("User connected:",socket.id)

  socket.on("join-user",userId => {
    socket.join(`user-${userId}`)
    console.log(`User ${userId} joined their room`)
  })

  socket.on("disconnect", ()=> {
    console.log("User disconnected:", socket.id)
  })
})

app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);

app.get('/', (req, res) => {
  logger.info('Root route accessed');
  res.send('Carbon Footprint Logger API!');
});

app.get('/health',(req,res)=>{
  res.status(200).json({
    status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime()
  });
});


app.use((req, res) => {
  logger.warn('Route not found', { url: req.originalUrl });
  res.status(404).json({ message: 'Route Not Found' });
});
app.use(errorHandler);

server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
