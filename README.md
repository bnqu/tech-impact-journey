# Tech Impact Journey - Multiplayer Game

A multiplayer educational board game about technology's impact on society. Players compete by answering questions while learning about technology's effects on various aspects of life.

## Features
- 2-4 player support
- Real-time multiplayer gameplay
- Wild card spaces with special challenges
- Educational questions about technology's impact
- Interactive board with animations

## Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

## Local Setup
1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start the server:
```bash
npm start
```
4. Visit `http://localhost:3000` in your browser

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