# Fractal Fireworks

A beautiful web application that generates fractal fireworks animations when you click a button or anywhere on the screen.

## Features

- **Interactive Fireworks**: Click the launch button or anywhere on the screen to create fireworks
- **Fractal Patterns**: Each firework uses mathematical fractals to create unique, branching patterns
- **Particle Physics**: Realistic particle behavior with gravity, decay, and trails
- **Responsive Design**: Works on desktop and mobile devices
- **Auto-launch**: Periodic automatic fireworks for continuous display

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

## Deploy to Digital Ocean

### Method 1: Using Digital Ocean App Platform

1. Fork this repository to your GitHub account
2. Go to [Digital Ocean App Platform](https://cloud.digitalocean.com/apps)
3. Click "Create App"
4. Connect your GitHub repository
5. Select this repository and the main branch
6. Digital Ocean will automatically detect the Node.js app and use the configuration

### Method 2: Using doctl CLI

1. Install doctl and authenticate with Digital Ocean
2. Run from the project directory:
```bash
doctl apps create --spec .do/app.yaml
```

## How It Works

The application creates fractal fireworks by:
1. Generating particles in mathematical patterns using sine and cosine functions
2. Applying fractal transformations to create branching effects
3. Using particle physics for realistic movement and decay
4. Rendering with HTML5 Canvas for smooth animation

## Controls

- **Launch Fireworks Button**: Creates a firework at a random location
- **Clear Button**: Clears all active fireworks
- **Click anywhere**: Creates a firework at the clicked location

## Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js with Express
- **Deployment**: Digital Ocean App Platform
- **Animation**: HTML5 Canvas API with requestAnimationFrame

## Customization

You can customize the fireworks by modifying the following in `script.js`:
- `colors` array: Change firework colors
- `particleCount`: Number of particles per firework
- `branches`: Number of fractal branches
- `gravity` and `decay`: Physics parameters