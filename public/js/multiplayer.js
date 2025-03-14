class MultiplayerGame extends Game {
    constructor() {
        super();
        this.socket = io();
        this.roomId = null;
        this.isHost = false;
        this.waitingRoom = document.getElementById('waiting-room');
        this.waitingPlayers = document.getElementById('waiting-players');
        this.startButton = document.getElementById('start-game');
        this.setupSocketListeners();
        this.initializeEventListeners();
    }

    setupSocketListeners() {
        this.socket.on('playerJoined', (data) => {
            this.updateWaitingRoom(data.players);
            if (this.isHost && data.players.length >= 2) {
                this.startButton.disabled = false;
            }
        });

        this.socket.on('gameStart', (data) => {
            this.waitingRoom.style.display = 'none';
            this.updatePlayers(data.players);
            this.startGame();
        });

        this.socket.on('gameUpdate', (data) => {
            this.updatePlayers(data.players);
            this.currentPlayer = data.currentPlayer.id === this.socket.id ? 1 : 2;
            this.updateUI();
            if (data.currentPlayer.id === this.socket.id) {
                this.showQuestion();
            }
        });

        this.socket.on('wildCardCreated', (data) => {
            this.wildCardSpaces.add(data.position);
            this.updateUI();
        });

        this.socket.on('gameWon', (data) => {
            this.showWinnerAnimation(data.winner.name);
        });

        this.socket.on('playerLeft', (data) => {
            if (this.waitingRoom.style.display !== 'none') {
                this.updateWaitingRoom(data.players);
            } else {
                this.updatePlayers(data.players);
                this.updateUI();
            }
        });
    }

    updateWaitingRoom(players) {
        this.waitingPlayers.innerHTML = '';
        players.forEach((player, index) => {
            const li = document.createElement('li');
            li.textContent = player.name;
            if (player.id === this.socket.id) {
                li.classList.add('host');
            }
            this.waitingPlayers.appendChild(li);
        });

        const waitingMessage = this.waitingRoom.querySelector('.waiting-message');
        if (players.length < 2) {
            waitingMessage.textContent = 'Waiting for more players to join...';
            this.startButton.disabled = true;
        } else {
            waitingMessage.textContent = 'Ready to start!';
            if (this.isHost) {
                this.startButton.disabled = false;
            }
        }
    }

    generateRoomId() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    initializeEventListeners() {
        document.getElementById('create-game').addEventListener('click', (e) => {
            e.preventDefault();
            const hostName = document.getElementById('host-name').value;
            const playerCount = parseInt(document.getElementById('player-count').value);

            if (!hostName) {
                alert('Please enter your name!');
                return;
            }

            this.isHost = true;
            this.playerCount = playerCount;
            this.roomId = this.generateRoomId();
            
            // Show waiting room
            this.nameInputForm.style.display = 'none';
            this.waitingRoom.style.display = 'block';
            
            // Display room code
            const gameCode = this.waitingRoom.querySelector('.game-code');
            gameCode.textContent = this.roomId;
            gameCode.addEventListener('click', () => {
                navigator.clipboard.writeText(this.roomId)
                    .then(() => alert('Game code copied to clipboard!'))
                    .catch(err => console.error('Failed to copy code:', err));
            });

            // Join as host
            this.socket.emit('joinGame', { roomId: this.roomId, playerName: hostName });
        });

        this.startButton.addEventListener('click', () => {
            if (this.isHost) {
                this.socket.emit('startGame', { roomId: this.roomId });
            }
        });
    }

    updatePlayers(players) {
        this.players = {};
        players.forEach((player, index) => {
            this.players[index + 1] = {
                name: player.name,
                position: player.position,
                id: player.id
            };
        });
        this.playerCount = players.length;
    }

    handleAnswer(isCorrect) {
        this.questionModal.style.display = 'none';
        
        this.socket.emit('playerAnswer', {
            roomId: this.roomId,
            isCorrect,
            isWildCard: this.isWildCardQuestion
        });

        if (!isCorrect && !this.isWildCardQuestion) {
            const currentPosition = this.players[this.currentPlayer].position;
            this.socket.emit('createWildCard', {
                roomId: this.roomId,
                position: currentPosition
            });
        }

        setTimeout(() => {
            const message = isCorrect ? 
                (this.isWildCardQuestion ? 
                    `${this.players[this.currentPlayer].name} conquered the wild card! Moving forward 3 spaces!` :
                    `${this.players[this.currentPlayer].name} answered correctly! Moving forward 2 spaces!`) :
                (this.isWildCardQuestion ?
                    `${this.players[this.currentPlayer].name} failed the wild card challenge! Staying in place.` :
                    `${this.players[this.currentPlayer].name} answered incorrectly! This space is now a wild card!`);
            
            this.showMessage(message, isCorrect);
        }, 300);
    }

    startGame() {
        this.nameInputForm.style.display = 'none';
        this.gameContent.style.display = 'block';
        this.updateUI();
    }
} 