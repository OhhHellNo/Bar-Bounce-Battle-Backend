import { Server, Socket } from 'socket.io';
import { joinQueue, handleDisconnect } from '../controllers/roomController';

export default (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Matchmaking
    socket.on('join_queue', () => {
      joinQueue(socket, io);
    });

    // Game Events
    socket.on('player_move', (data: any) => {
      // Broadcast to everyone else in the room
      const room = Array.from(socket.rooms).find(r => r !== socket.id);
      if (room) {
        socket.to(room).emit('player_moved', data);
      }
    });

    socket.on('spawn_item', (item: any) => {
      const room = Array.from(socket.rooms).find(r => r !== socket.id);
      if (room) {
        socket.to(room).emit('spawn_item', item);
      }
    });

    socket.on('player_update', (data: any) => {
      const room = Array.from(socket.rooms).find(r => r !== socket.id);
      if (room) {
        socket.to(room).emit('player_updated', data);
      }
    });

    socket.on('game_over', (data: any) => {
        const room = Array.from(socket.rooms).find(r => r !== socket.id);
        if (room) {
            io.to(room).emit('game_ended', data);
        }
    });

    socket.on('leave_game', () => {
        handleDisconnect(socket, io);
    });

    // Handle disconnecting explicitly to notify opponent before rooms are cleared
    socket.on('disconnecting', () => {
        const room = Array.from(socket.rooms).find(r => r !== socket.id);
        if (room) {
            socket.to(room).emit('opponent_disconnected');
        }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      handleDisconnect(socket, io);
    });
  });
};