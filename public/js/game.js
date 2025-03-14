class Game {
    constructor() {
        this.boardSize = 30;
        this.currentPlayer = 1;
        this.players = {};
        this.currentTurn = 1;
        this.questionModal = document.getElementById('question-modal');
        this.questionText = document.getElementById('question-text');
        this.answerOptions = document.getElementById('answer-options');
        this.messageDisplay = document.getElementById('message-display');
        this.nameInputForm = document.getElementById('name-input-form');
        this.gameContent = document.getElementById('game-content');
        this.playerCount = 2; // Default to 2 players
        this.wildCardSpaces = new Set(); // Track wild card spaces
        this.wrongAnswers = new Map(); // Track wrong answers with their positions
        this.isWildCardQuestion = false;
        
        this.initializeEventListeners();
        this.initializeBoard();
    }

    initializeEventListeners() {
        // Add player count selector
        const playerCountSelect = document.createElement('select');
        playerCountSelect.id = 'player-count';
        playerCountSelect.innerHTML = `
            <option value="2">2 Players</option>
            <option value="3">3 Players</option>
            <option value="4">4 Players</option>
        `;
        this.nameInputForm.insertBefore(playerCountSelect, this.nameInputForm.firstChild);

        playerCountSelect.addEventListener('change', () => {
            this.playerCount = parseInt(playerCountSelect.value);
            this.updatePlayerInputs();
        });

        document.getElementById('start-game').addEventListener('click', () => {
            const playerNames = [];
            for (let i = 1; i <= this.playerCount; i++) {
                const name = document.getElementById(`player${i}-name`).value;
                if (!name) {
                    alert('Please enter names for all players!');
                    return;
                }
                playerNames.push(name);
            }

            // Initialize players
            for (let i = 1; i <= this.playerCount; i++) {
                this.players[i] = { position: 0, name: playerNames[i-1] };
            }

            this.nameInputForm.style.display = 'none';
            this.gameContent.style.display = 'block';
            this.updateUI();
            this.showQuestion();
        });
    }

    updatePlayerInputs() {
        const playerInputsContainer = document.createElement('div');
        playerInputsContainer.id = 'player-inputs';
        
        for (let i = 1; i <= this.playerCount; i++) {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'input-group';
            inputGroup.innerHTML = `
                <label for="player${i}-name">Player ${i} Name:</label>
                <input type="text" id="player${i}-name" required>
            `;
            playerInputsContainer.appendChild(inputGroup);
        }

        // Replace existing player inputs
        const existingInputs = document.getElementById('player-inputs');
        if (existingInputs) {
            existingInputs.replaceWith(playerInputsContainer);
        } else {
            this.nameInputForm.appendChild(playerInputsContainer);
        }
    }

    initializeBoard() {
        const board = document.getElementById('board');
        board.innerHTML = '';
        
        for (let i = 0; i < this.boardSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'board-cell';
            cell.textContent = i + 1;
            
            // Add click handler for wild card spaces
            cell.addEventListener('click', () => {
                if (this.wildCardSpaces.has(i) && this.players[this.currentPlayer].position === i) {
                    this.handleWildCardClick(i);
                }
            });
            
            board.appendChild(cell);
        }

        this.wildCardSpaces.clear();
        this.wrongAnswers.clear();
    }

    updateUI() {
        // Update player positions and names
        for (let i = 1; i <= this.playerCount; i++) {
            const playerElement = document.getElementById(`player${i}`);
            if (playerElement) {
                playerElement.querySelector('.player-position span').textContent = this.players[i].position + 1;
                playerElement.querySelector('h3').textContent = this.players[i].name;
            }
        }
        
        // Update current player and turn
        document.querySelector('#current-player span').textContent = this.players[this.currentPlayer].name;
        document.querySelector('#turn-counter span').textContent = this.currentTurn;
        
        // Update board
        const cells = document.querySelectorAll('.board-cell');
        cells.forEach((cell, index) => {
            cell.className = 'board-cell';
            
            // Add wild card class and wrong answer indicator
            if (this.wildCardSpaces.has(index)) {
                cell.classList.add('wild-card');
                // Add the question that was answered wrong
                if (this.wrongAnswers.has(index)) {
                    const wrongQ = this.wrongAnswers.get(index);
                    cell.setAttribute('data-question', wrongQ.question);
                }
            }
            
            // Add player position classes
            for (let i = 1; i <= this.playerCount; i++) {
                if (this.players[i].position === index) {
                    cell.classList.add(`player${i}`);
                }
            }
        });
    }

    showWinnerAnimation(winnerName) {
        const winnerDisplay = document.createElement('div');
        winnerDisplay.className = 'winner-display';
        winnerDisplay.innerHTML = `
            <div class="winner-content">
                <h2>🎉 Winner! 🎉</h2>
                <p>${winnerName} has won the game!</p>
                <button class="play-again-button">Play Again</button>
            </div>
        `;
        document.body.appendChild(winnerDisplay);

        winnerDisplay.querySelector('.play-again-button').addEventListener('click', () => {
            winnerDisplay.remove();
            this.resetGame();
        });
    }

    showMessage(message, isCorrect) {
        this.messageDisplay.textContent = message;
        this.messageDisplay.className = `message-display ${isCorrect ? 'correct-answer' : 'wrong-answer'}`;
        this.messageDisplay.style.display = 'block';
        
        setTimeout(() => {
            this.messageDisplay.style.display = 'none';
        }, 2000);
    }

    handleWildCardClick(position) {
        if (!this.questionModal.style.display || this.questionModal.style.display === 'none') {
            const wildCardPrompt = document.createElement('div');
            wildCardPrompt.className = 'wild-card-prompt';
            wildCardPrompt.innerHTML = `
                <div class="wild-card-content">
                    <h3>Wild Card Space!</h3>
                    <p>Would you like to attempt a special question?</p>
                    <p class="warning">Warning: It could be very easy or extremely challenging!</p>
                    <div class="wild-card-buttons">
                        <button class="accept-wild-card">Accept Challenge</button>
                        <button class="skip-wild-card">Skip</button>
                    </div>
                </div>
            `;
            document.body.appendChild(wildCardPrompt);

            wildCardPrompt.querySelector('.accept-wild-card').onclick = () => {
                wildCardPrompt.remove();
                this.isWildCardQuestion = true;
                this.showQuestion(true);
            };

            wildCardPrompt.querySelector('.skip-wild-card').onclick = () => {
                wildCardPrompt.remove();
                this.showQuestion(false);
            };
        }
    }

    showQuestion(isWildCard = false) {
        let randomQuestion;
        if (isWildCard && this.wrongAnswers.has(this.players[this.currentPlayer].position)) {
            // Use the previously wrong answered question for this position
            randomQuestion = this.wrongAnswers.get(this.players[this.currentPlayer].position);
        } else {
            randomQuestion = getRandomQuestion(isWildCard);
        }

        this.questionText.textContent = randomQuestion.question;
        this.answerOptions.innerHTML = '';
        
        // Create array of options with their correctness
        let options = randomQuestion.options.map((text, index) => ({
            text,
            isCorrect: index === randomQuestion.correct
        }));
        
        // Fisher-Yates shuffle algorithm
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        // Create buttons in random order
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'answer-button';
            button.textContent = option.text;
            button.onclick = () => this.handleAnswer(option.isCorrect, randomQuestion);
            this.answerOptions.appendChild(button);
        });
        
        this.questionModal.style.display = 'block';
    }

    handleAnswer(isCorrect, question) {
        this.questionModal.style.display = 'none';
        
        setTimeout(() => {
            if (isCorrect) {
                const oldPosition = this.players[this.currentPlayer].position;
                const moveSpaces = this.isWildCardQuestion ? 3 : 2;
                this.players[this.currentPlayer].position = Math.min(
                    oldPosition + moveSpaces,
                    this.boardSize - 1
                );
                const message = this.isWildCardQuestion ? 
                    `${this.players[this.currentPlayer].name} conquered the wild card! Moving forward 3 spaces!` :
                    `${this.players[this.currentPlayer].name} answered correctly! Moving forward 2 spaces!`;
                this.showMessage(message, true);

                // Remove from wrong answers if it was there
                if (this.wrongAnswers.has(oldPosition)) {
                    this.wrongAnswers.delete(oldPosition);
                    this.wildCardSpaces.delete(oldPosition);
                }
            } else {
                const currentPosition = this.players[this.currentPlayer].position;
                // Store the wrong answered question
                if (!this.isWildCardQuestion) {
                    this.wrongAnswers.set(currentPosition, question);
                    this.wildCardSpaces.add(currentPosition);
                }
                const message = this.isWildCardQuestion ?
                    `${this.players[this.currentPlayer].name} failed the wild card challenge! Staying in place.` :
                    `${this.players[this.currentPlayer].name} answered incorrectly! This space is now a wild card!`;
                this.showMessage(message, false);
            }
            
            this.updateUI();
            
            if (this.players[this.currentPlayer].position >= this.boardSize - 1) {
                setTimeout(() => {
                    this.showWinnerAnimation(this.players[this.currentPlayer].name);
                }, 2000);
                return;
            }
            
            setTimeout(() => {
                this.currentPlayer = (this.currentPlayer % this.playerCount) + 1;
                this.currentTurn++;
                this.updateUI();
                this.showQuestion();
            }, 2000);
        }, 300);
    }

    resetGame() {
        this.players = {};
        this.currentPlayer = 1;
        this.currentTurn = 1;
        this.nameInputForm.style.display = 'block';
        this.gameContent.style.display = 'none';
        document.getElementById('player-inputs').innerHTML = '';
        this.updatePlayerInputs();
        this.updateUI();
    }
}

// Start the game when the page loads
window.onload = () => {
    const game = new Game();
}; 