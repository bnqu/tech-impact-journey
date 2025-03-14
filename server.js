const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Game rooms storage
const gameRooms = new Map();

io.on('connection', (socket) => {
    console.log('A user connected');

    // Create or join a game room
    socket.on('joinGame', (data) => {
        const { roomId, playerName } = data;
        
        // Create room if it doesn't exist
        if (!gameRooms.has(roomId)) {
            gameRooms.set(roomId, {
                players: [],
                currentTurn: 0,
                gameStarted: false
            });
        }

        const room = gameRooms.get(roomId);

        // Check if room is full
        if (room.players.length >= 4) {
            socket.emit('roomFull');
            return;
        }

        // Add player to room
        socket.join(roomId);
        room.players.push({
            id: socket.id,
            name: playerName,
            position: 0
        });

        // Notify all players in room
        io.to(roomId).emit('playerJoined', {
            players: room.players,
            gameStarted: room.gameStarted
        });

        // Start game if 2 or more players
        if (room.players.length >= 2 && !room.gameStarted) {
            room.gameStarted = true;
            room.currentTurn = 0;
            io.to(roomId).emit('gameStart', {
                players: room.players,
                currentPlayer: room.players[0]
            });
        }
    });

    // Handle player answer
    socket.on('playerAnswer', (data) => {
        const { roomId, isCorrect, isWildCard } = data;
        const room = gameRooms.get(roomId);
        
        if (!room) return;

        const playerIndex = room.players.findIndex(p => p.id === socket.id);
        const currentPlayer = room.players[playerIndex];

        // Update player position
        if (isCorrect) {
            const moveSpaces = isWildCard ? 3 : 2;
            currentPlayer.position = Math.min(currentPlayer.position + moveSpaces, 29);
        }

        // Check for winner
        if (currentPlayer.position >= 29) {
            io.to(roomId).emit('gameWon', { winner: currentPlayer });
            return;
        }

        // Next turn
        room.currentTurn = (room.currentTurn + 1) % room.players.length;
        
        // Update all players
        io.to(roomId).emit('gameUpdate', {
            players: room.players,
            currentPlayer: room.players[room.currentTurn]
        });
    });

    // Handle wild card creation
    socket.on('createWildCard', (data) => {
        const { roomId, position } = data;
        io.to(roomId).emit('wildCardCreated', { position });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        for (const [roomId, room] of gameRooms.entries()) {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                
                if (room.players.length === 0) {
                    gameRooms.delete(roomId);
                } else {
                    // Adjust current turn if necessary
                    if (room.currentTurn >= room.players.length) {
                        room.currentTurn = 0;
                    }
                    
                    // Notify remaining players
                    io.to(roomId).emit('playerLeft', {
                        players: room.players,
                        currentPlayer: room.players[room.currentTurn]
                    });
                }
                break;
            }
        }
    });
});

// Start server
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 