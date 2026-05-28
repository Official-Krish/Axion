# ☁️ SolNet - Decentralized Cloud Computing Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Powered%20by-Solana-purple.svg)](https://solana.com/)
[![Anchor](https://img.shields.io/badge/Built%20with-Anchor-blue.svg)](https://www.anchor-lang.com/)

> **SolNet** is a revolutionary decentralized cloud computing platform that enables users to rent virtual machines using **SOL tokens** while providing DePIN (Decentralized Physical Infrastructure Network) services for host machines.

## 🚀 Overview

SolNet bridges the gap between traditional cloud computing and Web3 by offering:

- **Crypto-Native Payments**: Pay for cloud resources using SOL tokens
- **DePIN Hosting**: Earn SOL by sharing your compute resources
- **Instant Deployment**: Deploy VMs across AWS, GCP, or decentralized networks
- **Smart Contract Escrow**: Secure, transparent payment handling
- **Global Infrastructure**: Multi-region deployment with low latency

## ✨ Key Features

### 🔐 Crypto-Native Experience
- **No Credit Cards Required**: Pay directly with SOL tokens
- **Instant Transactions**: No lengthy verification processes
- **Transparent Pricing**: Real-time cost calculations
- **Secure Escrow**: Smart contract-managed payments

### 🌐 Multi-Provider Support
- **AWS Integration**: Deploy on Amazon Web Services
- **GCP Integration**: Deploy on Google Cloud Platform
- **DePIN Network**: Access decentralized compute resources (Docker images only)
- **Global Regions**: Deploy across multiple geographic locations

### 💻 Developer-Friendly
- **SSH Terminal Access**: Direct command-line access to VMs
- **Real-time Monitoring**: Track resource usage and costs

### 🏗️ DePIN Hosting
- **Host Registration**: Register your machines to earn SOL
- **Docker Image Support**: Currently supports Docker container deployments
- **Automated Verification**: Script-based machine validation
- **Reward System**: Earn based on usage and uptime
- **Dashboard Management**: Monitor your hosted resources

## 🏗️ Architecture

### Smart Contract Layer (Solana/Anchor)
```rust
// Core Functions
- initialize_vault()           // Setup admin vault
- transfer_to_vault_and_rent() // Start rental with escrow
- transfer_from_vault()        // End session & settle payment
- end_rental_session()        // Complete rental period

// DePIN Functions
- initialise_host_registration() // Register host machine
- activate_host()              // Activate host for requests
- claim_rewards()              // Claim earned SOL
- penalize_host()              // Penalize misbehaving hosts
```

### Transaction Indexer
- **Rust-based**: High-performance on-chain transaction monitoring
- **Dual Mode**: WebSocket (default) or Yellowstone gRPC
- **Real-time Parsing**: Identifies all contract instructions via Anchor log parsing
- **Webhook Notifications**: Pushes events to backend and ws-relayer

### Backend Services
- **API Gateway**: RESTful endpoints for VM management
- **VM Provisioning**: Automated cloud resource allocation
- **Session Tracking**: Real-time usage monitoring
- **Payment Processing**: Smart contract integration

### Frontend Application
- **React + TypeScript**: Modern, responsive UI
- **TailwindCSS**: Beautiful, consistent design
- **Wallet Integration**: Solana wallet connectivity
- **Real-time Updates**: WebSocket-based live data

## 📦 Project Structure

```
SolNet/
├── contract/                 # Solana smart contracts (Anchor)
│   ├── programs/contract/
│   │   ├── src/
│   │   │   ├── instructions/ # VM rental instructions
│   │   │   ├── depin/        # DePIN host management
│   │   │   ├── state/        # Account state definitions
│   │   │   └── lib.rs        # Main program entry
│   │   └── Cargo.toml
│   └── tests/               # Contract test suites
├── indexer/                  # Rust transaction indexer
│   ├── src/
│   │   ├── main.rs          # Entry point (mode switching)
│   │   ├── ws.rs            # WebSocket logsSubscribe mode
│   │   ├── grpc.rs          # Yellowstone gRPC mode (optional)
│   │   ├── parser.rs        # Anchor log → ParsedEvent
│   │   ├── instructions.rs  # Contract instruction definitions
│   │   ├── notifier.rs      # Webhook dispatcher
│   │   └── config.rs        # Environment config
│   └── Cargo.toml
├── web-services/            # Application services
│   ├── apps/
│   │   ├── backend/         # Bun-based API server
│   │   ├── frontend/        # React application
│   │   ├── depin-worker/    # DePIN service worker
│   │   └── ws-relayer/      # WebSocket relay service
│   └── packages/
│       ├── db/              # Database schema & migrations
│       ├── types/           # Shared TypeScript types
│       └── ui/              # Reusable UI components
└── ops/                     # Kubernetes deployment configs
```

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Bun](https://bun.sh/) (for backend)
- [Rust](https://rustup.rs/) (v1.88+, for indexer)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [PostgreSQL](https://www.postgresql.org/) database

### 1. Smart Contract Deployment

```bash
# Navigate to contract directory
cd contract

# Install dependencies
cargo install

# Build the program
anchor build

# Deploy to Solana devnet
anchor deploy
```

### 2. Database Setup

```bash
# Navigate to database package
cd web-services/packages/db

# Install dependencies
bun install

# Run migrations
bunx prisma migrate dev

# Generate Prisma client
bunx prisma generate
```

### 3. Backend Services

```bash
# Navigate to backend
cd web-services/apps/backend

# Install dependencies
bun install

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
bun dev
```

### 4. Frontend Application

```bash
# Navigate to frontend
cd web-services/apps/frontend

# Install dependencies
bun install

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
bun dev
```

### 5. Transaction Indexer

```bash
# Navigate to indexer
cd indexer

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Run in WebSocket mode (default, connects to devnet)
RUST_LOG=info cargo run

# Run with gRPC mode (requires Yellowstone endpoint)
RUST_LOG=info cargo run --features grpc
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/SolNet"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-jwt-secret"
SOLANA_RPC_URL="https://api.devnet.solana.com"
PROGRAM_ID="your-anchor-program-id"
```

#### Frontend (.env)
```bash
BACKEND_URL = "http://localhost:3000";
SECRET_KEY = "your-secret-key";
ADMIN_KEY = "your-admin-key";
WS_RELAYER_URL = "ws://localhost:9093";
DEPIN_WORKER = "http://localhost:6000";
```

#### Indexer (.env)
```bash
MODE="ws"                    # "ws" or "grpc"
SOLANA_WS_URL="wss://api.devnet.solana.com"
GRPC_ENDPOINT="http://127.0.0.1:10000"
PROGRAM_ID="your-anchor-program-id"
BACKEND_WEBHOOK_URL="http://localhost:3000/api/v2/indexer/webhook"
WS_RELAYER_URL="ws://localhost:9093"
```

## 📊 Database Schema

### Core Models
- **User**: Wallet-based user accounts
- **VMInstance**: Virtual machine instances
- **VMConfig**: Machine configuration details
- **DepinHostMachine**: DePIN host registrations
- **VMImage**: Pre-configured Docker application images

### Key Relationships
```sql
User -> VMInstance (1:1)
VMInstance -> VMConfig (1:1)
VMInstance -> VMImage (1:1)
User -> DepinHostMachine (1:many)
DepinHostMachine -> VMImage (1:1)
```

## 🔌 API Endpoints

### VM Management
```http
POST   /api/v2/vmInstance/create    # Create new VM instance
GET    /api/v2/vmInstance/:id       # Get VM details
PUT    /api/v2/vmInstance/:id       # Update VM configuration
DELETE /api/v2/vmInstance/:id       # Terminate VM instance
```

### DePIN Services
```http
POST   /api/v2/user/depin/register  # Register host machine
GET    /api/v2/user/depin/status    # Get host status
POST   /api/v2/user/depin/activate  # Activate host machine
```

### User Management
```http
POST   /api/v2/user/signup          # User registration
POST   /api/v2/user/signin          # User authentication
GET    /api/v2/user/profile         # Get user profile
```

## 🧪 Testing

### Smart Contract Tests
```bash
cd contract
anchor test
```

## 🚀 Deployment


### Kubernetes Deployment
```bash
# Apply Kubernetes manifests
kubectl apply -f ops/

# Check deployment status
kubectl get pods -n SolNet
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📈 Roadmap

### v3.0 (Future)
- 📋 AI-powered resource optimization
- 📋 Cross-chain payment support
- 📋 Decentralized storage integration
- 📋 Advanced security features

## 🐛 Troubleshooting

### Common Issues

#### Smart Contract Deployment
```bash
# If deployment fails, check:
anchor build --skip-lint
anchor deploy --provider.cluster devnet --program-keypair target/deploy/contract-keypair.json
```

#### Database Connection
```bash
# Ensure PostgreSQL is running
sudo systemctl start postgresql

# Check connection
psql -h localhost -U your_user -d SolNet
```

#### Frontend Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
bun install
```

## 📞 Support

- **Email**: Krishanand974@gmail.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Solana Foundation** for blockchain infrastructure
- **Anchor Framework** for smart contract development
- **TurboRepo** for monorepo management
- **Google Cloud Platform** for cloud infrastructure

---