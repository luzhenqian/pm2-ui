# PM2 UI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red)](https://nestjs.com/)

A modern, real-time web-based management interface for PM2 processes with comprehensive monitoring, control, and log viewing capabilities.

![PM2 UI Screenshot](https://via.placeholder.com/800x400.png?text=PM2+UI)

## Features

- 📊 **Real-time Log Streaming** - View logs from PM2 processes in real-time
- 🔧 **Process Management** - Complete control over PM2 processes
- 🌐 **Port & PID Display** - View network ports and process IDs
- ⏱️ **Uptime Tracking** - Monitor process uptime and restart counts
- 🎨 **Modern UI** - Built with React, Tailwind CSS, and Radix UI for a clean, responsive interface
- 🌓 **Dark/Light Mode** - Toggle between dark and light themes
- 🔍 **Search & Filter** - Search through logs with regex support
- 📈 **Process Metrics** - Monitor CPU, memory usage, and process status
- 💾 **Export Logs** - Download logs for offline analysis
- 🔄 **Process Control** - Start, stop, and restart PM2 processes from the UI
- 🚀 **High Performance** - Virtual scrolling for handling large log volumes
- 🔌 **WebSocket Support** - Real-time updates via Socket.io
- 🛡️ **TypeScript** - Full type safety across frontend and backend

## Requirements

- Node.js >= 16.0.0
- npm >= 7.0.0
- PM2 installed globally (`npm install -g pm2`)

## Installation

### 1. Clone the repository

```bash
git clone git@github.com:luzhenqian/pm2-ui.git
cd pm2-ui
```

### 2. Install dependencies

```bash
npm run install:all
```

This will install dependencies for both the server and client applications.

### 3. Setup Database

Start PostgreSQL database using Docker Compose (must run from server directory):

```bash
cd server
docker-compose up -d
cd ..
```

This will start a PostgreSQL database on port 5433.

> **Note:** Make sure you're in the `server` directory when running `docker-compose up -d`

### 4. Configuration

Copy the environment file and configure it:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` to customize your settings:

```env
# Database Configuration
DATABASE_URL="postgresql://pm2ui:pm2ui_password@localhost:5433/pm2ui_db?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"

# Server Configuration
NODE_ENV=development
PORT=3030
HOST=0.0.0.0
```

**Important:** Change the `JWT_SECRET` to a secure random string in production.

### 5. Initialize Database

Run Prisma migrations to set up the database schema:

```bash
cd server
npx prisma migrate deploy
cd ..
```

This will create the necessary database tables for user authentication and management.

## Usage

### Default Login Credentials

On first run, a default super admin account is created:
- **Username:** `admin`
- **Password:** `admin123`

**Important:** Change the default password immediately after first login!

### Development Mode

Run both server and client in development mode:

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3030
- Frontend dev server on http://localhost:5174 (Vite default)

### Production Mode

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

Access the application at http://localhost:3030

## PM2 Deployment

PM2 UI includes built-in PM2 configuration for production deployment.

### Initial Setup

1. **Install PM2 globally** (if not already installed):

```bash
npm install -g pm2
```

2. **Build the application**:

```bash
npm run build
```

3. **Start with PM2**:

```bash
npm run pm2:start
```

This will start the application using the `ecosystem.config.js` configuration file.

### PM2 Management Commands

| Command | Description |
|---------|-------------|
| `npm run pm2:start` | Start the application with PM2 |
| `npm run pm2:stop` | Stop the application |
| `npm run pm2:restart` | Restart the application (with downtime) |
| `npm run pm2:reload` | Reload the application (zero-downtime) |
| `npm run pm2:delete` | Remove the application from PM2 |
| `npm run pm2:logs` | View application logs |
| `npm run pm2:monit` | Monitor application metrics |
| `npm run deploy` | Build and restart (quick deployment) |

### PM2 Configuration

The `ecosystem.config.js` file contains the PM2 configuration:

```javascript
module.exports = {
  apps: [{
    name: 'pm2-ui',
    script: 'server/dist/main.js',
    instances: 1,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3030,
      HOST: '0.0.0.0',
    }
  }]
};
```

You can customize this configuration based on your requirements.

### Quick Deployment Workflow

For rapid deployment after code changes:

```bash
# Pull latest changes
git pull

# Build and restart
npm run deploy
```

This will build both frontend and backend, then restart the PM2 process.

### Auto-start on System Boot

To ensure PM2 starts on system reboot:

```bash
# Save the current PM2 process list
pm2 save

# Generate and configure startup script
pm2 startup
```

Follow the instructions printed by the `pm2 startup` command.

## Docker Support

Build the Docker image:

```bash
docker build -t pm2-ui .
```

Run the container:

```bash
docker run -p 3030:3030 -v /var/run/docker.sock:/var/run/docker.sock pm2-ui
```

## API Documentation

### REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/processes` | Get list of PM2 processes |
| GET | `/api/processes/:name` | Get process details |
| POST | `/api/processes/:name/restart` | Restart a process |
| POST | `/api/processes/:name/stop` | Stop a process |
| POST | `/api/processes/:name/start` | Start a process |
| GET | `/api/health` | Health check endpoint |

### WebSocket Events

#### Client → Server

- `subscribe-logs` - Subscribe to process logs
- `unsubscribe-logs` - Unsubscribe from logs
- `search-logs` - Search in logs
- `get-metrics` - Request process metrics

#### Server → Client

- `log` - New log entry
- `initial-logs` - Initial log batch
- `metrics` - Process metrics update
- `error` - Error message

## Project Structure

```
pm2-ui/
├── server/                      # Backend NestJS application
│   ├── src/
│   │   ├── main.ts             # Server entry point
│   │   ├── app.module.ts       # Root application module
│   │   ├── auth/               # Authentication & authorization module
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/     # Passport strategies
│   │   │   ├── guards/         # Auth guards
│   │   │   ├── decorators/     # Auth decorators
│   │   │   └── dto/            # Data transfer objects
│   │   ├── process/            # PM2 process management module
│   │   │   ├── process.module.ts
│   │   │   ├── process.controller.ts
│   │   │   ├── process.service.ts
│   │   │   └── dto/
│   │   ├── logs/               # Log viewing & streaming module
│   │   │   ├── logs.module.ts
│   │   │   ├── logs.service.ts
│   │   │   └── dto/
│   │   ├── websocket/          # Real-time communication module
│   │   │   ├── websocket.module.ts
│   │   │   └── websocket.gateway.ts
│   │   ├── common/             # Shared code across modules
│   │   │   ├── interfaces/     # Shared interfaces
│   │   │   ├── decorators/     # Shared decorators
│   │   │   ├── filters/        # Exception filters
│   │   │   └── pipes/          # Validation pipes
│   │   └── config/             # Configuration files
│   └── package.json
├── client/                      # Frontend React application
│   ├── src/
│   │   ├── App.tsx             # Main application component
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API services
│   │   └── types/              # TypeScript types
│   └── package.json
├── config.json                  # Application configuration
└── package.json                # Root package.json
```

### Architecture Principles

- **Server**: Business-oriented modular architecture. Each top-level directory under `src/` represents a business domain (auth, process, logs, websocket), containing all related code (controllers, services, DTOs, etc.)
- **Client**: Component-based architecture with React and TypeScript

## Scripts

### Development

- `npm run dev` - Run both server and client in development mode
- `npm run server:dev` - Run server only in development mode
- `npm run client:dev` - Run client only in development mode

### Build & Start

- `npm run build` - Build both server and client for production
- `npm run build:server` - Build server only
- `npm run build:client` - Build client only
- `npm run start` - Start production server (without PM2)

### PM2 Management

- `npm run pm2:start` - Start application with PM2
- `npm run pm2:stop` - Stop PM2 process
- `npm run pm2:restart` - Restart PM2 process (with downtime)
- `npm run pm2:reload` - Reload PM2 process (zero-downtime)
- `npm run pm2:delete` - Remove from PM2
- `npm run pm2:logs` - View PM2 logs
- `npm run pm2:monit` - Monitor PM2 processes
- `npm run deploy` - Build and restart (quick deployment)

### Testing & Quality

- `npm run test` - Run all tests
- `npm run test:server` - Run server tests
- `npm run test:client` - Run client tests
- `npm run lint` - Run all linters
- `npm run lint:server` - Run server linter
- `npm run lint:client` - Run client linter

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Security

- No authentication is implemented by default
- For production use, consider implementing authentication
- Use environment variables for sensitive configuration
- Keep dependencies up to date

## Troubleshooting

### Common Issues

1. **PM2 not found**
   - Ensure PM2 is installed globally: `npm install -g pm2`

2. **Permission errors**
   - The application needs permission to read PM2 logs
   - Run with appropriate permissions or adjust log file permissions

3. **WebSocket connection fails**
   - Check firewall settings
   - Ensure the port is not blocked

4. **High memory usage**
   - Adjust `maxLogEntries` in configuration
   - Enable log rotation in PM2

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [PM2](https://pm2.keymetrics.io/) - Process management
- [React](https://reactjs.org/) - Frontend framework
- [NestJS](https://nestjs.com/) - Node.js framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible UI components
- [Socket.io](https://socket.io/) - Real-time communication
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Support

For issues, questions, or suggestions, please [open an issue](https://github.com/YOUR_USERNAME/pm2-ui/issues).

## Roadmap

- [ ] Authentication and authorization
- [ ] Log persistence and history
- [ ] Advanced filtering options
- [ ] Log analytics and insights
- [ ] Multi-server support
- [ ] Custom alerts and notifications
- [ ] Log aggregation from multiple sources
- [ ] Plugin system for extensibility

---

Made with ❤️ by the open-source community