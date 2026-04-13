# Kalshi Dashboard 📊

> ⚠️ **Disclaimer:** This is an unofficial, personal project and is not affiliated with, endorsed by, or connected to Kalshi in any way. Use at your own risk. The author is not responsible for any financial losses or issues arising from use of this software. Moreover, this was built with an OpenClaw bot and Claude. So the author takes even less responsibility, as in NONE for any use of this code.


## What's Here?

A sleek, personal dashboard to track your [Kalshi](https://kalshi.com) prediction market portfolio.

> **What this is (and isn't):** This is a **portfolio viewer** — it shows your existing positions, balances, and trade history. It is not a trading tool and does not help you discover or search for markets. You place trades on Kalshi directly, and this dashboard shows you what you have.

![Dashboard Screenshot](screenshot.png)

## Features

- 📈 **Real-time portfolio overview** - Total value, P/L, cash balance
- 🎯 **Active positions** - Track all your open bets with current prices
- 📅 **Event calendar** - See when your positions resolve
- 👀 **Watchlist** - Monitor markets you're interested in
- ✅ **Resolved history** - Track your wins and losses
- 🔄 **Auto-refresh** - Keep data up-to-date automatically
- 🌙 **Dark theme** - Easy on the eyes

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher (You will have to install this on your computer. Instructions below.)
- A [Kalshi](https://kalshi.com) account with API access

### Installing Node.js

Node.js doesn't typically come pre-installed on any operating system. You may have already installed it though. If not, choose your platform below and follow instructions:

**Windows:**
```bash
# Option 1: Download installer from https://nodejs.org/
# Option 2: Using winget
winget install OpenJS.NodeJS.LTS
```

**Mac:**
```bash
# Option 1: Download installer from https://nodejs.org/
# Option 2: Using Homebrew
brew install node
```

**Linux (Debian/Ubuntu):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify installation:**
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

## Quick Start

### 1. Download the code

**Option A: Download as ZIP (easiest)**

1. Go to [github.com/ScottGsHub/kalshi-dashboard](https://github.com/ScottGsHub/kalshi-dashboard)
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the ZIP to a folder (e.g., `Documents/kalshi-dashboard`)

**Option B: Clone with Git**

If you have [Git](https://git-scm.com/downloads) installed, open a terminal and run:

```bash
git clone https://github.com/ScottGsHub/kalshi-dashboard.git
cd kalshi-dashboard
```

> **New to the terminal?**
> - **Windows:** Press `Win + R`, type `cmd`, press Enter
> - **Mac:** Press `Cmd + Space`, type `Terminal`, press Enter
> - **Linux:** Press `Ctrl + Alt + T`
>
> Then navigate to your folder with `cd path/to/kalshi-dashboard`

### 2. Get your Kalshi API credentials

1. Log into [Kalshi](https://kalshi.com)
2. Go to **Settings** → **Account & Security** → **API Keys** (Note that menu choices sometimes change. Basically, you're looking for the API keys section.)
3. Click **Create New API Key** and give it a name
4. You'll see your **Key ID** and **Private Key** — copy both! (Remember that you usually can only see such things once. You should copy them to a secure place like a password manager, as well as the files we're describing here.)
5. The private key is also auto-downloaded as a `.txt` file (You'll need to rename this in a moment.)

> ⚠️ **Important:** The private key is only shown once! Save it immediately.

### 3. Create your private key file

The private key from Kalshi that likely downloaded as a .txt file is in PEM format. You need to save it to a file in the same directory / folder as your other Kalshi dashboard files. These may have been installed someplace like /Users/YourUserName/kalshi-dashboard:

**Option A: Use the downloaded file**
```bash
# Rename the downloaded txt file to .pem  You can do this in your file system, or here is a terminal command for doing so.
mv ~/Downloads/your-key-name.txt ./kalshi-private-key.pem
```

**Option B: Create from the copied text**

If you copied the private key text, create a new file called `kalshi-private-key.pem` and paste the entire key, including the header and footer lines. Be careful to copy this exactly. No extra spaces or lines, include the BEGIN and END lines with the dashes:

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA... (your key data)
-----END RSA PRIVATE KEY-----
```

### 4. Configure the dashboard

```bash
# Copy the example config into the real config file.
cp config.example.json config.json
```

Edit `config.json` with your details. You can do this with any pure text editor. That is, don't use something like a word processor. Use a raw text editor only. The API key is your main API key you should have copied. The display name is what you want it to show up as on the top of your dashboard. You can just put anything as an original deposit. It's a placeholder until the script fetches your actual data.

```json
{
  "kalshiApiKeyId": "your-api-key-id-here",
  "kalshiPrivateKeyPath": "./kalshi-private-key.pem",
  "displayName": "Your Name",
  "originalDeposit": 500.00,
  "watchlistTickers": []
}
```

> **Note:** `watchlistTickers` is optional — leave it empty to start. You can add market tickers later if you want to track markets you haven't bet on yet.
>
> **Finding tickers:** Browse [kalshi.com](https://kalshi.com) and open any market page. The ticker is shown in the URL and on the market detail page — it looks something like `KXCPIYOY-26MAR-T3.2`. Copy it exactly and paste it into the `watchlistTickers` array.

### 5. Install dependencies and run

```bash
# Install required packages (first time only)
npm install

# Start the dashboard server
npm start
```

The terminal will display something like:
```
Dashboard server running at http://localhost:3456
```

Copy that URL and paste it into your web browser to view your dashboard.

### How the data pipeline works

There are two steps every time data is refreshed:

1. **`export-data.js` runs** — it connects to the Kalshi API using your credentials, fetches your balance, positions, and trade history, and saves everything to a local file called `data.json`
2. **`index.htm` reads `data.json`** — the dashboard displays whatever is in that file

This means your dashboard is only as fresh as the last time the data was fetched. Use the **Refresh** button in the dashboard (or run `npm run refresh` in the terminal) to pull the latest data from Kalshi.

### How the server works

When you run `npm start`, it starts a small web server *just for this dashboard*:

- **It only runs while the terminal is open** — close the terminal or press `Ctrl+C` and the server stops
- **The dashboard only works while the server is running** — you'll need to run `npm start` again next time
- **It's completely local** — only you can see it, not the internet
- **It uses port 3456** — other apps on your computer can run their own servers on different ports without conflict

Think of it like turning on a lamp: `npm start` turns it on, closing the terminal turns it off.

## Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `kalshiApiKeyId` | Your Kalshi API key ID | *Required* |
| `kalshiPrivateKeyPath` | Path to your private key file | `./kalshi-private-key.pem` |
| `displayName` | Your name (shown in dashboard title) | `"My"` |
| `originalDeposit` | Your initial deposit (for P/L calculation) | `500.00` |
| `watchlistTickers` | *(Optional)* Market tickers to watch | `[]` |

## Commands

```bash
# Install dependencies (required first time)
npm install

# Start the dashboard server
npm start

# Just refresh the data (no server)
npm run refresh
```

## API Endpoints

Just for reference. When running the server:

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

- Never commit `config.json` or `.pem` files to git or share them to anyone.
- The `.gitignore` is set up to exclude sensitive files
- Don't share your API key or private key
- This dashboard is set up for personal/local use

## Troubleshooting

### "config.json not found"
Copy `config.example.json` to `config.json` and add your credentials.

### "Private key not found"
Make sure your `.pem` file exists at the path specified in `config.json`. If you only have the downloaded `.txt` file, rename it to `.pem` or update the path in your config.

### "API error: 401"
Your API credentials may be invalid or expired. Generate new ones on Kalshi. (And update the appropriate files.)

### Data not updating
Click the Refresh button or check the server console for errors.

### "Cannot find module" errors
Run `npm install` in the dashboard folder first. This installs required dependencies. If you struggle with this aspect of getting your system to work, consider asking a search engine or GPT for help.

### "fetch is not defined"
The `node-fetch` package isn't installed. Run:
```bash
npm install node-fetch
```
Then try `npm start` again.

### "crypto" or other Node.js errors
Make sure you're using Node.js v16 or higher:
```bash
node --version
```
If your version is older, [download a newer version](https://nodejs.org/).

### Dashboard runs but shows no data
1. Check the terminal for error messages
2. Make sure your `config.json` has the correct Key ID and private key path
3. Verify your `.pem` file exists at the path specified
4. Try clicking the Refresh button in the dashboard

## License

MIT License - feel free to modify and share!

## Disclaimer

This is an unofficial tool and is not affiliated with Kalshi. Use at your own risk. Always verify important information directly on Kalshi.

## Uninstalling

To remove the dashboard from your system:

1. **Stop the server** if it's running (press `Ctrl+C` in the terminal)
2. **Delete your credentials securely** — your `config.json` and `.pem` file contain sensitive API keys. Delete them or move them to a secure location.
3. **Delete the dashboard folder** — just delete the entire `kalshi-dashboard` folder

That's it! The dashboard doesn't install anything system-wide, so removing the folder removes everything.

> **Optional:** If you want to revoke the API key entirely, log into Kalshi → Settings → Account & Security → API Keys → delete the key you created.

## Issues & Contributions

Found a bug? Have a fix? There are two ways to help:

**Report a problem or suggestion:**
1. Go to the [Issues tab](https://github.com/ScottGsHub/kalshi-dashboard/issues) on GitHub
2. Click "New Issue"
3. Describe the problem or idea
4. I'll get notified, but as mentioned, this is a small personal project, so no guarantees I'll be able to quickly respond or to solve specific issues to your machine or account.

**Submit a code fix:**
1. "Fork" this repo (creates your own copy on GitHub)
2. Make your fix in your copy
3. Submit a "Pull Request" asking me to merge your changes
4. I'll review it and can accept, request changes, or discuss

All contributions are appreciated! 🙏

---

Made with ❤️ for prediction market enthusiasts
