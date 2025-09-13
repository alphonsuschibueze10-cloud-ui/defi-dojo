# DeFi Dojo Backend

AI-powered DeFi gaming platform backend built with FastAPI, SQLite, and Groq AI.

## Features

- **Wallet Authentication**: Nonce-based signature verification for Stacks wallets
- **Quest System**: Gamified DeFi challenges with server-authoritative validation
- **AI Mentor**: Groq-powered AI hints and guidance
- **Reward System**: On-chain badge minting via Clarity smart contracts
- **Leaderboard**: Real-time XP and badge tracking
- **WebSocket Support**: Real-time updates for quest progress and AI responses

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Setup

Copy the example environment file and configure:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL=sqlite:///./defidojo.db
REDIS_URL=redis://localhost:6379/0
GROQ_API_KEY=your_groq_api_key_here
STACKS_API_URL=https://stacks-node-api.testnet.stacks.co
JWT_SECRET=your_jwt_secret_here
HIRO_API_KEY=optional_hiro_api_key
ENVIRONMENT=development
DEBUG=True
```

### 3. Seed Database

```bash
python seed_data.py
```

### 4. Run the Server

```bash
python -m app.main
```

The API will be available at `http://localhost:8000`

## API Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /api/v1/auth/nonce` - Generate nonce for wallet authentication
- `POST /api/v1/auth/verify` - Verify wallet signature and create session

### Quests
- `GET /api/v1/quests/` - List active quests
- `POST /api/v1/quests/{quest_id}/start` - Start quest instance
- `POST /api/v1/quests/{quest_id}/action` - Submit quest action
- `GET /api/v1/quests/{user_quest_id}/status` - Get quest status

### AI Mentor
- `POST /api/v1/ai/hint` - Request AI hint for quest
- `GET /api/v1/ai/hint/{ai_run_id}` - Get AI hint result

### Rewards
- `POST /api/v1/rewards/prepare` - Prepare reward minting payload
- `POST /api/v1/rewards/execute` - Execute reward minting
- `GET /api/v1/rewards/status` - Check reward transaction status

### Leaderboard
- `GET /api/v1/leaderboard/` - Get top players
- `GET /api/v1/leaderboard/user/{user_id}` - Get user rank

### WebSocket
- `WS /ws` - General real-time updates
- `WS /ws/tx-status` - Transaction status updates

## Database Schema

The backend uses SQLite with the following main tables:

- **users**: User accounts with wallet addresses
- **quests**: Quest definitions and rules
- **user_quests**: User quest instances and progress
- **ai_runs**: AI hint requests and responses
- **reward_transactions**: On-chain reward minting records
- **leaderboard**: Cached leaderboard data

## Game Mechanics

### Quest Types

1. **Liquidity Kata** - Learn to provide liquidity to DeFi pools
2. **Yield Sprint** - Master yield farming strategies
3. **Arbitrage Master** - Spot and execute arbitrage opportunities
4. **DeFi Ninja** - Advanced DeFi strategies and flash loans

### Scoring System

- Server-authoritative validation prevents cheating
- XP awarded based on quest completion and performance
- Badges minted as NFTs on Stacks blockchain
- Real-time leaderboard updates

### AI Integration

- Groq LLM provides contextual hints
- Prompts include wallet balances and quest context
- Responses cached to reduce API costs
- Background processing for better performance

## Development

### Running Tests

```bash
pytest tests/
```

### Database Migrations

The database schema is managed through SQLAlchemy models. To update the schema:

1. Modify the models in `app/models/`
2. Delete the existing database file
3. Restart the application (tables will be recreated)

### Adding New Quests

1. Add quest data to `seed_data.py`
2. Implement validation logic in `app/api/v1/quests.py`
3. Update AI prompts in `app/services/groq_client.py`

## Security

- JWT tokens for authentication
- Nonce-based signature verification
- Server-authoritative game validation
- Rate limiting (to be implemented)
- Input validation and sanitization

## Deployment

### Docker

```bash
docker build -t defidojo-backend .
docker run -p 8000:8000 defidojo-backend
```

### Environment Variables

Required for production:
- `GROQ_API_KEY`: Your Groq API key
- `JWT_SECRET`: Strong secret for JWT signing
- `STACKS_API_URL`: Stacks node API URL
- `ENVIRONMENT=production`
- `DEBUG=False`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
