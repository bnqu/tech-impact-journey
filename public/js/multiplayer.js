class MultiplayerGame extends Game {
    constructor() {
        super();
        this.socket = io();
        this.roomId = null;
        this.setupSocketListeners();
    }

    setupSocketListeners() {
        this.socket.on('playerJoined', (data) => {
            this.updatePlayers(data.players);
            if (data.gameStarted) {
                this.startGame();
            }
        });

        this.socket.on('gameStart', (data) => {
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
            this.updatePlayers(data.players);
            this.updateUI();
        });

        this.socket.on('roomFull', () => {
            alert('This room is full. Please try another room.');
            window.location.reload();
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

    initializeEventListeners() {
        // Create room input
        const roomInput = document.createElement('input');
        roomInput.type = 'text';
        roomInput.id = 'room-id';
        roomInput.placeholder = 'Enter Room ID';
        roomInput.required = true;
        this.nameInputForm.insertBefore(roomInput, this.nameInputForm.firstChild);

        document.getElementById('start-game').addEventListener('click', (e) => {
            e.preventDefault();
            const playerName = document.getElementById('player1-name').value;
            const roomId = document.getElementById('room-id').value;

            if (!playerName || !roomId) {
                alert('Please enter both your name and a room ID!');
                return;
            }

            this.roomId = roomId;
            this.socket.emit('joinGame', { roomId, playerName });
        });
    }

    startGame() {
        this.nameInputForm.style.display = 'none';
        this.gameContent.style.display = 'block';
        this.updateUI();
    }
} 