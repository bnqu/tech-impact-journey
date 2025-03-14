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
        this.playerCount = 2;
        this.wildCardSpaces = new Set([9, 14, 19, 24]); // 10th, 15th, 20th, and 25th spaces (0-based index)
        this.playerWrongAnswers = new Map(); // Map to store wrong answers per player
        this.isWildCardQuestion = false;
        this.currentQuestionDifficulty = 'medium'; // Default difficulty
        this.waitingForEnter = false;
        this.isAdminPanelOpen = false;
        
        this.initializeEventListeners();
        this.initializeBoard();
    }

    initializeEventListeners() {
        // Add player count selector listener
        const playerCountSelect = document.getElementById('player-count');
        playerCountSelect.addEventListener('change', () => {
            this.playerCount = parseInt(playerCountSelect.value);
            this.updatePlayerInputs();
        });

        // Add start game button listener
        document.getElementById('start-game').addEventListener('click', (e) => {
            e.preventDefault();
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
            this.showPressEnterPrompt();
        });

        // Add keyboard listener for Enter key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.waitingForEnter) {
                this.waitingForEnter = false;
                document.querySelector('.press-enter-prompt')?.remove();
                if (this.isWildCardQuestion) {
                    this.showQuestion(true);
                } else {
                    this.showQuestion();
                }
            }
        });

        // Add admin panel listener
        document.addEventListener('keydown', (e) => {
            if (e.key === '`') {
                e.preventDefault();
                this.toggleAdminPanel();
            }
        });

        // Create initial player inputs
        this.updatePlayerInputs();
    }

    updatePlayerInputs() {
        const playerInputs = document.getElementById('player-inputs');
        playerInputs.innerHTML = '';
        
        for (let i = 1; i <= this.playerCount; i++) {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'input-group';
            inputGroup.innerHTML = `
                <label for="player${i}-name">Player ${i} Name:</label>
                <input type="text" id="player${i}-name" required>
            `;
            playerInputs.appendChild(inputGroup);
        }
    }

    initializeBoard() {
        const board = document.getElementById('board');
        board.innerHTML = '';
        
        for (let i = 0; i < this.boardSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'board-cell';
            cell.textContent = i + 1;
            
            // Add wild card spaces
            if (this.wildCardSpaces.has(i)) {
                cell.classList.add('wild-card');
                cell.title = 'Wild Card Space! Click when landed to attempt challenge.';
                
                // Add click handler for wild card spaces
                cell.addEventListener('click', () => this.handleWildCardClick(i));
            }
            
            board.appendChild(cell);
        }
    }

    updateUI() {
        // Update player positions and names
        for (let i = 1; i <= this.playerCount; i++) {
            const playerElement = document.getElementById(`player${i}`);
            if (playerElement) {
                playerElement.querySelector('.player-position span').textContent = this.players[i].position + 1;
                playerElement.querySelector('h3').textContent = this.players[i].name;
                playerElement.style.display = 'block';
            }
        }
        
        // Hide unused player elements
        for (let i = this.playerCount + 1; i <= 4; i++) {
            const playerElement = document.getElementById(`player${i}`);
            if (playerElement) {
                playerElement.style.display = 'none';
            }
        }
        
        // Update current player and turn
        document.querySelector('#current-player span').textContent = this.players[this.currentPlayer].name;
        document.querySelector('#turn-counter span').textContent = this.currentTurn;
        
        // Update board
        const cells = document.querySelectorAll('.board-cell');
        cells.forEach((cell, index) => {
            // Reset cell classes while preserving wild card status
            cell.className = 'board-cell';
            if (this.wildCardSpaces.has(index)) {
                cell.classList.add('wild-card');
                // Add visual indicator if current player is on this wild card space
                if (this.players[this.currentPlayer].position === index) {
                    cell.classList.add('active-wild-card');
                }
            }
            
            // Add player position classes
            for (let i = 1; i <= this.playerCount; i++) {
                if (this.players[i].position === index) {
                    cell.classList.add(`player${i}`);
                    // Add current player highlight
                    if (i === this.currentPlayer) {
                        cell.classList.add('current-player');
                    }
                }
            }
        });
    }

    showQuestion(isWildCard = false) {
        this.waitingForEnter = false;
        document.querySelector('.press-enter-prompt')?.remove();
        
        let randomQuestion;
        if (isWildCard) {
            // For wild cards, always get a question matching the selected difficulty
            randomQuestion = getRandomQuestion(true, this.currentQuestionDifficulty);
        } else {
            // For normal questions, randomly select difficulty
            const difficulties = ['easy', 'medium', 'hard'];
            this.currentQuestionDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
            randomQuestion = getRandomQuestion(false, this.currentQuestionDifficulty);
        }

        this.displayQuestion(randomQuestion);
    }

    displayQuestion(question) {
        // Add difficulty and reward info at the top
        const moveSpaces = this.currentQuestionDifficulty === 'easy' ? 1 : 
                          this.currentQuestionDifficulty === 'medium' ? 2 : 3;
        
        const difficultyColors = {
            easy: '#4CAF50',
            medium: '#FFC107',
            hard: '#f44336'
        };

        this.questionModal.style.display = 'block';
        this.questionText.innerHTML = `
            <div class="question-header">
                <div class="difficulty-badge" style="background: ${difficultyColors[this.currentQuestionDifficulty]}">
                    ${this.currentQuestionDifficulty.toUpperCase()}
                </div>
                <div class="reward-badge">
                    Reward: Move ${moveSpaces} space${moveSpaces > 1 ? 's' : ''}
                </div>
            </div>
            <div class="question-text">
                ${question.question}
            </div>
        `;
        
        this.answerOptions.innerHTML = '';
        
        // Create array of options with their correctness
        let options = question.options.map((text, index) => ({
            text,
            isCorrect: index === question.correct
        }));
        
        // Fisher-Yates shuffle
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        // Create buttons in random order
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'answer-button';
            button.textContent = option.text;
            button.onclick = () => this.handleAnswer(option.isCorrect, option.text, options.find(opt => opt.isCorrect).text, question);
            this.answerOptions.appendChild(button);
        });
    }

    handleAnswer(isCorrect, selectedAnswer, correctAnswer, question) {
        // First, highlight the correct answer
        const buttons = document.querySelectorAll('.answer-button');
        buttons.forEach(button => {
            if (button.textContent === correctAnswer) {
                button.classList.add('correct-answer-highlight');
            }
            // Disable all buttons
            button.disabled = true;
        });

        // If wrong answer, store it for the current player
        if (!isCorrect && !this.isWildCardQuestion) {
            if (!this.playerWrongAnswers.has(this.currentPlayer)) {
                this.playerWrongAnswers.set(this.currentPlayer, []);
            }
            this.playerWrongAnswers.get(this.currentPlayer).push({
                question: question.question,
                correctAnswer: correctAnswer,
                playerAnswer: selectedAnswer,
                options: question.options,
                difficulty: this.currentQuestionDifficulty
            });
        }

        // Wait 2 seconds before proceeding
        setTimeout(() => {
            this.questionModal.style.display = 'none';
            
            if (isCorrect) {
                const oldPosition = this.players[this.currentPlayer].position;
                let moveSpaces;
                if (this.isWildCardQuestion) {
                    moveSpaces = 3; // Always move 3 spaces for correct wild card answers
                } else {
                    switch (this.currentQuestionDifficulty) {
                        case 'easy': moveSpaces = 1; break;
                        case 'medium': moveSpaces = 2; break;
                        case 'hard': moveSpaces = 3; break;
                        default: moveSpaces = 2;
                    }
                }
                
                this.players[this.currentPlayer].position = Math.min(
                    oldPosition + moveSpaces,
                    this.boardSize - 1
                );
                
                const message = this.isWildCardQuestion ? 
                    `${this.players[this.currentPlayer].name} mastered their previous mistake! Moving forward ${moveSpaces} spaces!` :
                    `${this.players[this.currentPlayer].name} answered correctly! Moving forward ${moveSpaces} space${moveSpaces > 1 ? 's' : ''}!`;
                this.showMessage(message, true);
            } else {
                const message = this.isWildCardQuestion ?
                    `${this.players[this.currentPlayer].name} still needs practice on this one! Stay in place.` :
                    `${this.players[this.currentPlayer].name} answered incorrectly! Stay in place.`;
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
                // Check if we should give another turn (wild card space)
                const currentPosition = this.players[this.currentPlayer].position;
                if (this.wildCardSpaces.has(currentPosition)) {
                    // Show a message about getting another turn
                    this.showMessage(`${this.players[this.currentPlayer].name} landed on a wild card! Get ready for a review question!`, true);
                    setTimeout(() => {
                        this.handleWildCardClick(currentPosition);
                    }, 2000);
                } else {
                    // Normal turn progression
                    this.currentPlayer = (this.currentPlayer % this.playerCount) + 1;
                    this.currentTurn++;
                    this.updateUI();
                    this.showPressEnterPrompt();
                }
            }, 2000);
        }, 2000);
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

    showPressEnterPrompt() {
        // Remove any existing prompt
        document.querySelector('.press-enter-prompt')?.remove();

        const prompt = document.createElement('div');
        prompt.className = 'press-enter-prompt';
        prompt.innerHTML = `
            <div class="press-enter-content">
                <h3>${this.players[this.currentPlayer].name}'s Turn</h3>
                <div class="enter-key-animation">
                    Press ENTER for Question
                </div>
            </div>
        `;
        
        // Insert the prompt at the top of the game board
        const gameBoard = document.querySelector('.game-board');
        gameBoard.insertBefore(prompt, gameBoard.firstChild);
        
        this.waitingForEnter = true;
    }

    handleWildCardClick(position) {
        // Only show wild card prompt if:
        // 1. No question is currently showing
        // 2. Player is actually on a wild card space
        // 3. It's that player's turn
        if (
            (!this.questionModal.style.display || this.questionModal.style.display === 'none') &&
            this.wildCardSpaces.has(position) &&
            this.players[this.currentPlayer].position === position
        ) {
            // Remove any existing wild card prompts
            document.querySelector('.wild-card-prompt')?.remove();

            const wildCardPrompt = document.createElement('div');
            wildCardPrompt.className = 'wild-card-prompt kahoot-style';
            wildCardPrompt.innerHTML = `
                <div class="wild-card-content">
                    <div class="kahoot-header">
                        <h3>⚡ WILD CARD CHALLENGE! ⚡</h3>
                        <div class="kahoot-timer">
                            <div class="timer-bar"></div>
                        </div>
                    </div>
                    <p>Choose your challenge:</p>
                    <div class="wild-card-buttons">
                        <button class="easy-wild-card">
                            <span>Easy Question</span>
                            <small>Move 1 space if correct</small>
                        </button>
                        <button class="hard-wild-card">
                            <span>Hard Question</span>
                            <small>Move 4 spaces if correct</small>
                        </button>
                        <button class="skip-wild-card">Skip Challenge</button>
                    </div>
                </div>
            `;
            document.body.appendChild(wildCardPrompt);

            // Add timer animation
            setTimeout(() => wildCardPrompt.classList.add('show'), 100);

            // Handle easy wild card
            wildCardPrompt.querySelector('.easy-wild-card').onclick = () => {
                wildCardPrompt.remove();
                this.isWildCardQuestion = true;
                this.currentQuestionDifficulty = 'easy';
                this.showQuestion(true);
            };

            // Handle hard wild card
            wildCardPrompt.querySelector('.hard-wild-card').onclick = () => {
                wildCardPrompt.remove();
                this.isWildCardQuestion = true;
                this.currentQuestionDifficulty = 'hard';
                this.showQuestion(true);
            };

            // Handle skip
            wildCardPrompt.querySelector('.skip-wild-card').onclick = () => {
                wildCardPrompt.remove();
                this.showMessage(`${this.players[this.currentPlayer].name} skipped the wild card challenge!`, false);
                setTimeout(() => {
                    this.currentPlayer = (this.currentPlayer % this.playerCount) + 1;
                    this.currentTurn++;
                    this.updateUI();
                    this.showPressEnterPrompt();
                }, 2000);
            };
        }
    }

    showPreviousWrongQuestion(wrongAnswer) {
        this.questionText.textContent = wrongAnswer.question;
        this.answerOptions.innerHTML = '';
        
        // Create array of options
        let options = wrongAnswer.options.map(text => ({
            text,
            isCorrect: text === wrongAnswer.correctAnswer
        }));
        
        // Fisher-Yates shuffle
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'answer-button';
            button.textContent = option.text;
            button.onclick = () => this.handleAnswer(option.isCorrect, option.text, wrongAnswer.correctAnswer, wrongAnswer);
            this.answerOptions.appendChild(button);
        });
        
        this.questionModal.style.display = 'block';
    }

    resetGame() {
        this.players = {};
        this.currentPlayer = 1;
        this.currentTurn = 1;
        this.nameInputForm.style.display = 'block';
        this.gameContent.style.display = 'none';
        this.updatePlayerInputs();
        this.initializeBoard();
    }

    toggleAdminPanel() {
        if (this.isAdminPanelOpen) {
            document.querySelector('.admin-panel')?.remove();
            this.isAdminPanelOpen = false;
            return;
        }

        const adminPanel = document.createElement('div');
        adminPanel.className = 'admin-panel';
        adminPanel.innerHTML = `
            <div class="admin-content">
                <h3>🔒 Admin Panel</h3>
                <div class="admin-controls">
                    <button class="admin-button move-player">
                        Move Current Player
                        <small>Move to any space</small>
                    </button>
                    <button class="admin-button skip-turn">
                        Skip Turn
                        <small>Move to next player</small>
                    </button>
                    <button class="admin-button force-wild">
                        Force Wild Card
                        <small>Show wild card prompt</small>
                    </button>
                    <button class="admin-button reset-game">
                        Reset Game
                        <small>Start fresh</small>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(adminPanel);
        this.isAdminPanelOpen = true;

        // Add button listeners
        adminPanel.querySelector('.move-player').onclick = () => {
            const space = prompt('Enter space number (1-30):');
            if (space && !isNaN(space)) {
                const spaceNum = parseInt(space);
                if (spaceNum >= 1 && spaceNum <= 30) {
                    this.players[this.currentPlayer].position = spaceNum - 1;
                    this.updateUI();
                }
            }
        };

        adminPanel.querySelector('.skip-turn').onclick = () => {
            this.currentPlayer = (this.currentPlayer % this.playerCount) + 1;
            this.currentTurn++;
            this.updateUI();
            this.showPressEnterPrompt();
        };

        adminPanel.querySelector('.force-wild').onclick = () => {
            this.handleWildCardClick(this.players[this.currentPlayer].position);
        };

        adminPanel.querySelector('.reset-game').onclick = () => {
            if (confirm('Are you sure you want to reset the game?')) {
                this.resetGame();
                adminPanel.remove();
                this.isAdminPanelOpen = false;
            }
        };
    }
}

// Start the game when the page loads
window.onload = () => {
    const game = new Game();
}; 