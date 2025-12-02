import express, { Request } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import socketHandler from './socket/socketHandler';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

// Basic health check route
app.get('/', (req: Request, res: any) => {
  res.send('Server is running 🍺');
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Initialize Socket Logic
socketHandler(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🍺 Server running on port ${PORT}`);
});