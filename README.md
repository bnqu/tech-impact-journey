# Tech Impact Journey

A multiplayer board game that combines learning with fun! Players move across the board by answering questions correctly, with special wild card spaces that give players a chance to review and master previously missed questions.

## Features

- Local multiplayer support (2-4 players)
- Three difficulty levels (Easy, Medium, Hard)
- Wild card spaces for reviewing missed questions
- Beautiful, animated UI with Kahoot-style design
- Responsive layout that works on all devices

## How to Play

1. Select the number of players (2-4)
2. Enter player names
3. Take turns answering questions
4. Land on wild card spaces to review previously missed questions
5. First player to reach the end wins!

## Question Difficulties

- Easy: Move 1 space on correct answer
- Medium: Move 2 spaces on correct answer
- Hard: Move 3 spaces on correct answer
- Wild Card Review: Move 3 spaces on correct answer

## Development

To run the game locally:

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000` in your browser

## Contributing

Feel free to submit issues and enhancement requests!

## Deployment
The game can be deployed to various platforms:

### Render Deployment
1. Create an account on [Render](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Use the following settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variable: `PORT=10000`

### Railway Deployment
1. Create an account on [Railway](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. The deployment will be automatic as Railway detects the Node.js project

### Heroku Deployment
1. Create an account on [Heroku](https://heroku.com)
2. Install Heroku CLI
3. Login to Heroku:
```bash
heroku login
```
4. Create a new Heroku app:
```bash
heroku create your-app-name
```
5. Deploy:
```bash
git push heroku main
```

## Environment Variables
- `PORT`: The port number for the server (default: 3000)

## Game Rules
1. Players take turns answering questions about technology's impact
2. Correct answers move you forward 2 spaces
3. Wild card spaces offer special challenges
4. Successfully completing a wild card challenge moves you forward 3 spaces
5. First player to reach the end wins! 