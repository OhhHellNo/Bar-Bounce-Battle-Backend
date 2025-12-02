import { Socket, Server } from 'socket.io';

interface Player {
    id: string;
    name: string;
    color: string;
}

// In-memory queue
let waitingPlayer: Socket | null = null;

export const joinQueue = (socket: Socket, io: Server) => {
  // Prevent user from joining queue if they are already the waiting player
  if (waitingPlayer?.id === socket.id) {
    return;
  }

  if (waitingPlayer) {
    // Match found!
    const opponent = waitingPlayer;
    waitingPlayer = null;

    const roomId = `room_${opponent.id}_${socket.id}`;
    
    opponent.join(roomId);
    socket.join(roomId);

    // Define colors and initial data
    const players: Player[] = [
        { id: opponent.id, name: 'Player 1', color: '#3b82f6' }, // Blue
        { id: socket.id, name: 'Player 2', color: '#ef4444' }    // Red
    ];

    console.log(`Match starting in ${roomId}`);

    // Notify both players
    io.to(roomId).emit('match_found', {
      roomId,
      players
    });

  } else {
    // Wait in queue
    waitingPlayer = socket;
    console.log(`Player ${socket.id} waiting in queue...`);
  }
};

export const handleDisconnect = (socket: Socket, io: Server) => {
  if (waitingPlayer && waitingPlayer.id === socket.id) {
    waitingPlayer = null;
    console.log(`Player ${socket.id} removed from queue.`);
  }
  
  // Clean up handled by socket.io rooms automatically
};