const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const os = require('os');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Get local IP address
const getLocalIp = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (!iface.internal && iface.family === 'IPv4') {
                return iface.address;
            }
        }
    }
    return 'localhost';
};

const localIp = getLocalIp();

// Serve static files
app.use(express.static('public'));

// Game rooms storage
const gameRooms = new Map();

// Log active rooms and players
const logGameStatus = () => {
    console.log('\nActive Game Rooms:');
    gameRooms.forEach((room, roomId) => {
        console.log(`\nRoom ${roomId}:`);
        console.log('Players:', room.players.map(p => p.name).join(', '));
        console.log('Game Started:', room.gameStarted);
        console.log('Host:', room.hostId ? 'Yes' : 'No');
    });
    console.log('\n');
};

io.on('connection', (socket) => {
    console.log(`New connection from ${socket.handshake.address}`);

    // Create or join a game room
    socket.on('joinGame', (data) => {
        const { roomId, playerName } = data;
        console.log(`${playerName} is joining room ${roomId}`);
        
        // Create room if it doesn't exist
        if (!gameRooms.has(roomId)) {
            gameRooms.set(roomId, {
                players: [],
                currentTurn: 0,
                gameStarted: false,
                hostId: socket.id // Set the creator as host
            });
            console.log(`Created new room: ${roomId}`);
        }

        const room = gameRooms.get(roomId);

        // Check if room is full
        if (room.players.length >= 4) {
            socket.emit('roomFull');
            console.log(`Room ${roomId} is full, rejected ${playerName}`);
            return;
        }

        // Add player to room
        socket.join(roomId);
        room.players.push({
            id: socket.id,
            name: playerName,
            position: 0
        });

        console.log(`${playerName} joined room ${roomId}`);
        logGameStatus();

        // Notify all players in room
        io.to(roomId).emit('playerJoined', {
            players: room.players,
            gameStarted: room.gameStarted
        });
    });

    // Handle start game request (only from host)
    socket.on('startGame', (data) => {
        const { roomId } = data;
        const room = gameRooms.get(roomId);

        if (room && room.hostId === socket.id && room.players.length >= 2) {
            room.gameStarted = true;
            room.currentTurn = 0;
            console.log(`Game started in room ${roomId}`);
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

        console.log(`${currentPlayer.name} answered ${isCorrect ? 'correctly' : 'incorrectly'} in room ${roomId}`);

        // Update player position
        if (isCorrect) {
            const moveSpaces = isWildCard ? 3 : 2;
            currentPlayer.position = Math.min(currentPlayer.position + moveSpaces, 29);
        }

        // Check for winner
        if (currentPlayer.position >= 29) {
            console.log(`${currentPlayer.name} won the game in room ${roomId}!`);
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
        console.log(`Wild card created at position ${position} in room ${roomId}`);
        io.to(roomId).emit('wildCardCreated', { position });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        for (const [roomId, room] of gameRooms.entries()) {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            
            if (playerIndex !== -1) {
                const playerName = room.players[playerIndex].name;
                room.players.splice(playerIndex, 1);
                console.log(`${playerName} disconnected from room ${roomId}`);
                
                if (room.players.length === 0) {
                    gameRooms.delete(roomId);
                    console.log(`Room ${roomId} closed - no players remaining`);
                } else {
                    // If host disconnected, assign new host
                    if (socket.id === room.hostId && room.players.length > 0) {
                        room.hostId = room.players[0].id;
                        console.log(`New host assigned in room ${roomId}: ${room.players[0].name}`);
                    }
                    
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
                logGameStatus();
                break;
            }
        }
    });
});

// Start server
http.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=== Tech Impact Journey Server ===`);
    console.log(`Server running on:`);
    console.log(`- Local: http://localhost:${PORT}`);
    console.log(`- Network: http://${localIp}:${PORT}`);
    console.log(`\nShare the Network URL with players to join!`);
    console.log(`=====================================\n`);
}); 