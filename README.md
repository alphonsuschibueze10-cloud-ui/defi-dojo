# 🥋 DeFi Dojo - Satoshi Sensei

<div align="center">

```
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║    ██████╗ ███████╗███████╗██╗    ██████╗  ██████╗  ██████╗ ║
    ║    ██╔══██╗██╔════╝██╔════╝██║   ██╔═══██╗██╔═══██╗██╔═══██╗║
    ║    ██║  ██║█████╗  █████╗  ██║   ██║   ██║██║   ██║██║   ██║║
    ║    ██║  ██║██╔══╝  ██╔══╝  ██║   ██║   ██║██║   ██║██║   ██║║
    ║    ██████╔╝███████╗██║     ██║   ╚██████╔╝╚██████╔╝╚██████╔╝║
    ║    ╚═════╝ ╚══════╝╚═╝     ╚═╝    ╚═════╝  ╚═════╝  ╚═════╝ ║
    ║                                                              ║
    ║           ███████╗███████╗███╗   ██╗███████╗███████╗██╗     ║
    ║           ██╔════╝██╔════╝████╗  ██║██╔════╝██╔════╝██║     ║
    ║           ███████╗█████╗  ██╔██╗ ██║███████╗█████╗  ██║     ║
    ║           ╚════██║██╔══╝  ██║╚██╗██║╚════██║██╔══╝  ██║     ║
    ║           ███████║███████╗██║ ╚████║███████║███████╗███████╗║
    ║           ╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝╚══════╝║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
```

**Master the Art of DeFi • Earn XP • Become a Bitcoin Sensei**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.16-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com/)
[![Stacks](https://img.shields.io/badge/Stacks-2.0-orange.svg)](https://stacks.co/)

</div>

## 🎯 Overview

**DeFi Dojo** is an innovative gamified learning platform that transforms DeFi education into an engaging, interactive experience. Master Bitcoin and Stacks DeFi protocols through quests, earn XP, and climb the leaderboard to become a true DeFi Sensei.

### 🌟 Key Features

- **🎮 Gamified Learning**: Complete quests to master DeFi concepts
- **⚡ Real DeFi Integration**: Interact with actual Bitcoin and Stacks protocols
- **🏆 XP & Leaderboard System**: Earn experience points and compete with others
- **🤖 AI Sensei**: Get personalized hints and guidance
- **💰 Reward System**: Earn badges and achievements
- **🔐 Wallet Integration**: Connect with Stacks wallets for real transactions
- **📊 Portfolio Tracking**: Monitor your DeFi positions and performance

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (SQLite)      │
│                 │    │                 │    │                 │
│ • Quest UI      │    │ • Quest API     │    │ • User Data     │
│ • Dashboard     │    │ • Auth System   │    │ • Quest Progress│
│ • Portfolio     │    │ • AI Integration│    │ • Leaderboard   │
│ • Leaderboard   │    │ • Reward System │    │ • Transactions  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm**
- **Python** 3.9+
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/austinLorenzMccoy/defidojo.git
   cd defidojo
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python seed_data.py  # Seed initial quest data
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   pnpm install
   ```

4. **Start the Application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   source venv/bin/activate
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

   # Terminal 2 - Frontend
   cd frontend
   pnpm dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🎮 How to Play

### 1. Enter the Dojo
Visit the application and click "Enter Dojo" to begin your journey.

### 2. Choose Your Quest
Browse available quests:
- **🥋 Liquidity Kata** (Beginner) - Master liquidity provision
- **🏃 Yield Sprint** (Intermediate) - Optimize yield farming
- **⚔️ Arbitrage Master** (Advanced) - Execute profitable trades
- **🥷 DeFi Ninja** (Expert) - Advanced DeFi strategies

### 3. Complete Actions
- Start quests and follow the guided steps
- Execute real DeFi operations
- Monitor your progress and performance
- Earn XP and unlock achievements

### 4. Climb the Leaderboard
- Compete with other players
- Track your portfolio performance
- Unlock exclusive badges and rewards

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **Zustand** - State management

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - Lightweight database
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### DeFi Integration
- **Stacks** - Bitcoin smart contracts
- **Bitcoin** - Native BTC support
- **Lightning Network** - Fast payments
- **DeFi Protocols** - Various DeFi integrations

### Smart Contracts
- **dojo-badge.clar** - NFT contract for quest badges
- **dojo-badge-trait.clar** - Trait definition contract
- **Network**: Stacks Testnet (deployed)
- **Deployer**: ST18BWSNQ8AG5FT6SSTE65GZS4CJHVCPZY3DGX71Q

## 📁 Project Structure

```
defidojo/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configuration
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── main.py         # FastAPI app
│   ├── tests/              # Backend tests
│   ├── requirements.txt    # Python dependencies
│   └── seed_data.py        # Database seeding
├── frontend/               # Next.js frontend
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   ├── lib/                # Utilities and services
│   ├── public/             # Static assets
│   └── package.json        # Node dependencies
├── defidojo-contracts/     # Stacks smart contracts
│   ├── contracts/          # Clarinet contracts
│   │   ├── dojo-badge.clar
│   │   └── dojo-badge-trait.clar
│   ├── tests/              # Contract tests
│   ├── deployments/        # Deployment plans
│   └── Clarinet.toml       # Clarinet configuration
├── docs/                   # Documentation
└── README.md              # This file
```

## 🎯 Quest System

### Quest Types

1. **Liquidity Kata** 🥋
   - Learn to provide liquidity to DeFi pools
   - Understand impermanent loss
   - Master STX/sBTC pairs

2. **Yield Sprint** 🏃
   - Identify high-yield opportunities
   - Manage risk vs reward
   - Optimize farming strategies

3. **Arbitrage Master** ⚔️
   - Spot price differences
   - Execute profitable trades
   - Minimize slippage

4. **DeFi Ninja** 🥷
   - Advanced flash loan strategies
   - Complex multi-hop swaps
   - Protocol interactions

### Scoring System
- **Correctness** (60%) - Accuracy of actions
- **Efficiency** (40%) - Gas optimization and speed
- **Maximum Score** - 100 points per quest

## 🔐 Authentication

The platform supports multiple authentication methods:

- **Wallet Connection** - Connect with Stacks wallets
- **Guest Mode** - Play without authentication
- **JWT Tokens** - Secure session management

## 🏆 Smart Contract Features

### NFT Badge System
- **Quest Completion Badges** - Earn unique NFTs for completing quests
- **Achievement Badges** - Special badges for milestones and achievements
- **Rarity System** - Different badge rarities based on quest difficulty
- **Metadata Storage** - Rich metadata including quest details and completion stats

### Contract Functions
- **Mint Badge** - Mint new badges for quest completion
- **Transfer Badges** - Transfer badges between users
- **Query Badges** - Query user's badge collection
- **Badge Metadata** - Retrieve detailed badge information

### Security Features
- **Owner-Only Minting** - Only authorized addresses can mint badges
- **Quest Verification** - Badges are only minted after quest completion
- **Immutable Metadata** - Badge data cannot be modified after minting

## 📊 API Endpoints

### Quest Management
- `GET /api/v1/quests/public` - List available quests
- `POST /api/v1/quests/{id}/start` - Start a quest
- `POST /api/v1/quests/{id}/action` - Submit quest action
- `GET /api/v1/quests/{id}/status` - Get quest status

### User Management
- `POST /api/v1/auth/nonce` - Get authentication nonce
- `POST /api/v1/auth/verify` - Verify wallet signature
- `GET /api/v1/leaderboard/` - Get leaderboard
- `GET /api/v1/leaderboard/user/{id}` - Get user position

## 🧪 Testing

### Backend Tests
```bash
cd backend
source venv/bin/activate
python -m pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
pnpm test
```

### API Demo
```bash
cd backend
source venv/bin/activate
python api_demo.py
```

## 🚀 Deployment

### Smart Contract Deployment

The DeFi Dojo smart contracts are deployed on Stacks Testnet:

**Contract Addresses:**
- **dojo-badge**: `ST18BWSNQ8AG5FT6SSTE65GZS4CJHVCPZY3DGX71Q.dojo-badge`
- **dojo-badge-trait**: `ST18BWSNQ8AG5FT6SSTE65GZS4CJHVCPZY3DGX71Q.dojo-badge-trait`

**Deploy to Testnet:**
```bash
cd defidojo-contracts

# Install dependencies
npm install

# Run tests
npm test

# Generate deployment plan
clarinet deployments generate --testnet --medium-cost

# Deploy contracts
clarinet deployments apply --testnet
```

**Deploy to Mainnet:**
```bash
# Update settings/Mainnet.toml with your mainnet mnemonic
clarinet deployments generate --mainnet --medium-cost
clarinet deployments apply --mainnet
```

### Backend Deployment
```bash
# Using Docker
docker build -t defidojo-backend ./backend
docker run -p 8000:8000 defidojo-backend

# Using Railway/Heroku
# Add Procfile and requirements.txt
```

### Frontend Deployment
```bash
# Build for production
cd frontend
pnpm build
pnpm start

# Deploy to Vercel
vercel --prod
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Stacks Foundation** - For the amazing Bitcoin smart contract platform
- **Bitcoin Community** - For the revolutionary digital currency
- **DeFi Pioneers** - For building the future of finance
- **Open Source Community** - For the incredible tools and libraries

## 📞 Support

- **Discord** - Join our community
- **GitHub Issues** - Report bugs and request features
- **Email** - Contact the team

## 🔮 Roadmap

### Phase 1 ✅
- [x] Basic quest system
- [x] User authentication
- [x] Leaderboard
- [x] Portfolio tracking
- [x] Smart contract deployment (Testnet)

### Phase 2 🚧
- [ ] Advanced quest types
- [ ] NFT badge integration
- [ ] Multi-chain support
- [ ] Mobile app
- [ ] Social features

### Phase 3 🔮
- [ ] Mainnet deployment
- [ ] DAO governance
- [ ] Institutional features
- [ ] Advanced analytics

---

<div align="center">

**Ready to become a DeFi Sensei? Start your journey today! 🥋⚡**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/austinLorenzMccoy/defidojo)
[![Deploy with Railway](https://railway.app/button.svg)](https://railway.app/template/defidojo)

</div>
