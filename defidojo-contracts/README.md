# DeFi Dojo Smart Contracts

This directory contains the Clarity smart contracts for the DeFi Dojo platform, built using Clarinet.

## Contracts

### dojo-badge.clar

The main NFT contract for minting achievement badges in the DeFi Dojo game.

**Features:**
- NFT minting for quest completion
- XP tracking and rewards
- Admin controls for badge management
- Supply limits and minting controls

**Key Functions:**
- `mint-quest-badge(recipient, badge-id)` - Mint a badge for quest completion
- `get-user-xp(user)` - Get user's total XP
- `get-badge-xp(badge-id)` - Get XP reward for a badge
- `add-badge-type(badge-id, xp-reward)` - Add new badge type (admin)
- `set-mint-enabled(enabled)` - Toggle minting (admin)
- `initialize()` - Initialize contract with default badges

**Default Badges:**
- Badge ID 1: Liquidity Kata (50 XP)
- Badge ID 2: Yield Sprint (75 XP) 
- Badge ID 3: Arbitrage Master (100 XP)
- Badge ID 4: DeFi Ninja (150 XP)

## Setup

1. Install Clarinet:
```bash
curl -L https://github.com/hirosystems/clarinet/releases/latest/download/clarinet-installer.sh | bash
```

2. Check contract syntax:
```bash
clarinet check
```

3. Run tests:
```bash
npm install
npm test
```

## Deployment

The contract is ready for deployment to Stacks testnet or mainnet. Make sure to:

1. Initialize the contract after deployment
2. Add any custom badge types
3. Configure minting permissions

## Integration with Backend

The backend API endpoints in `/backend/app/api/v1/rewards.py` are designed to work with this contract:

- `POST /api/v1/rewards/prepare` - Prepares unsigned transaction
- `POST /api/v1/rewards/execute` - Executes signed transaction

The contract address should be configured in the backend environment variables.

## Security

- Only contract owner can mint badges
- Minting can be disabled by admin
- Supply is limited to 1000 badges
- All functions include proper authorization checks

## License

MIT License
