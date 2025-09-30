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
git clone https://github.com/YOUR_USERNAME/pm2-ui.git
cd pm2-ui
```

### 2. Install dependencies

```bash
npm run install:all
```

This will install dependencies for both the server and client applications.

### 3. Configuration

Copy the example configuration files:

```bash
cp config.json.example config.json
cp server/.env.example server/.env
```

Edit `config.json` to customize your settings:

```json
{
  "server": {
    "port": 3030,
    "host": "0.0.0.0"
  },
  "logs": {
    "maxLines": 1000,
    "initialLines": 100
  }
}
```

## Usage

### Development Mode

Run both server and client in development mode:

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3030
- Frontend dev server on http://localhost:3000

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

### Root Level

- `npm run dev` - Run both server and client in development
- `npm run build` - Build both server and client
- `npm run start` - Start production server
- `npm run test` - Run all tests
- `npm run lint` - Run linters

### Server

- `npm run server:dev` - Run server in development
- `npm run build:server` - Build server
- `npm run test:server` - Run server tests

### Client

- `npm run client:dev` - Run client in development
- `npm run build:client` - Build client
- `npm run test:client` - Run client tests

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