# DeployChain 

> The Web3-Native Cloud Platform for Blockchain Developers

A Vercel-like platform specifically for dApps that automatically deploys smart contracts alongside frontend code. One git push deploys your React app, deploys contracts to testnet/mainnet, and sets up all the Web3 connections. Perfect for the Scaffold-ETH + MultiBaas stack they're providing.

## DeployChain Needs:

- Git integration (GitHub webhooks, repo cloning)
- Smart contract compilation (Solidity compiler, dependency management)
- Multi-network deployment (testnet/mainnet RPC connections, private key management)
- Frontend build system (Next.js/React bundling, static hosting)
- Database (deployment logs, contract addresses, user management)
- Container orchestration (Docker for isolated builds)

## Development Environment

- [ ] Go 1.19+ installed
- [ ] Docker installed
- [ ] Node.js 18+ installed (for contract compilation tools)
- [ ] PostgreSQL running (extend your existing database)

### API Service Setup

```bash
# On your server
git clone <repo_url> .
cd ./deploychain

# Install dependencies
go mod tidy

# Set up environment
cp .env.example .env
# Edit .env with your actual keys

# Build
go build -o ./bin/deploychain

# Test locally first
./bin/deploychain
```

