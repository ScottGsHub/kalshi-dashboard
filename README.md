# Kalshi Dashboard 📊

A sleek, personal dashboard to track your [Kalshi](https://kalshi.com) prediction market portfolio.

![Dashboard Screenshot](screenshot.png)
*Add your own screenshot here*

## Features

- 📈 **Real-time portfolio overview** - Total value, P/L, cash balance
- 🎯 **Active positions** - Track all your open bets with current prices
- 📅 **Event calendar** - See when your positions resolve
- 👀 **Watchlist** - Monitor markets you're interested in
- ✅ **Resolved history** - Track your wins and losses
- 🔄 **Auto-refresh** - Keep data up-to-date automatically
- 🌙 **Dark theme** - Easy on the eyes

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [Kalshi](https://kalshi.com) account with API access

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/kalshi-dashboard.git
cd kalshi-dashboard
```

### 2. Get your Kalshi API credentials

1. Log into [Kalshi](https://kalshi.com)
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Download your private key (`.pem` file)
5. Copy your API Key ID

### 3. Configure the dashboard

```bash
# Copy the example config
cp config.example.json config.json

# Move your private key to the dashboard folder
mv ~/Downloads/kalshi-private-key.pem ./
```

Edit `config.json` with your details:

```json
{
  "kalshiApiKeyId": "your-api-key-id-here",
  "kalshiPrivateKeyPath": "./kalshi-private-key.pem",
  "displayName": "Your Name",
  "originalDeposit": 500.00,
  "watchlistTickers": [
    "TICKER-1",
    "TICKER-2"
  ]
}
```

### 4. Run the dashboard

```bash
npm start
```

Open [http://localhost:3456](http://localhost:3456) in your browser.

## Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `kalshiApiKeyId` | Your Kalshi API key ID | *Required* |
| `kalshiPrivateKeyPath` | Path to your private key file | `./kalshi-private-key.pem` |
| `displayName` | Your name (shown in dashboard title) | `"My"` |
| `originalDeposit` | Your initial deposit (for P/L calculation) | `500.00` |
| `watchlistTickers` | Array of market tickers to watch | `[]` |

### Finding Market Tickers

To add markets to your watchlist:

1. Go to a market on Kalshi (e.g., `https://kalshi.com/markets/kxcpi/...`)
2. The ticker is in the URL or shown on the market page
3. Add it to your `watchlistTickers` array in `config.json`

## Commands

```bash
# Start the dashboard server
npm start

# Just refresh the data (no server)
npm run refresh
```

## API Endpoints

When running the server:

- `GET /` - Dashboard page
- `GET /data.json` - Raw portfolio data
- `GET /api/refresh` - Trigger a data refresh
- `GET /api/status` - Check configuration status

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3456` |

## Security Notes

⚠️ **Keep your credentials safe!**

- Never commit `config.json` or `.pem` files to git
- The `.gitignore` is set up to exclude sensitive files
- Don't share your API key or private key
- This dashboard is for personal/local use

## Troubleshooting

### "config.json not found"
Copy `config.example.json` to `config.json` and add your credentials.

### "Private key not found"
Make sure your `.pem` file exists at the path specified in `config.json`.

### "API error: 401"
Your API credentials may be invalid or expired. Generate new ones on Kalshi.

### Data not updating
Click the Refresh button or check the server console for errors.

## License

MIT License - feel free to modify and share!

## Disclaimer

This is an unofficial tool and is not affiliated with Kalshi. Use at your own risk. Always verify important information directly on Kalshi.

---

Made with ❤️ for prediction market enthusiasts
