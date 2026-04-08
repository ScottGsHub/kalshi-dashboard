#!/usr/bin/env node
/**
 * Export Kalshi portfolio data to JSON for dashboard
 * 
 * Reads configuration from config.json in the same directory.
 * Outputs data.json to the same directory.
 */

const crypto = require("node:crypto");
const path = require("node:path");
const fs = require("node:fs");

// Use __dirname so script works from any directory
const SCRIPT_DIR = __dirname;
const CONFIG_PATH = path.join(SCRIPT_DIR, "config.json");
const OUTPUT_PATH = path.join(SCRIPT_DIR, "data.json");
const BASE_URL = "https://api.elections.kalshi.com";

/**
 * Sign a Kalshi API request using RSA-PSS
 */
function signRequest(timestampMs, method, pathWithQuery, privateKeyPem) {
  const payload = `${timestampMs}${method.toUpperCase()}${pathWithQuery}`;
  const signature = crypto.sign("sha256", Buffer.from(payload, "utf8"), {
    key: privateKeyPem,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
  });
  return signature.toString("base64");
}

/**
 * Make an authenticated GET request to Kalshi API
 */
async function apiGet(endpoint, keyId, privateKeyPem) {
  const url = `${BASE_URL}${endpoint}`;
  const timestampMs = String(Date.now());
  const signature = signRequest(timestampMs, "GET", endpoint, privateKeyPem);
  
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "KALSHI-ACCESS-KEY": keyId,
      "KALSHI-ACCESS-TIMESTAMP": timestampMs,
      "KALSHI-ACCESS-SIGNATURE": signature
    }
  });
  
  if (!resp.ok) {
    throw new Error(`API error: ${resp.status} ${resp.statusText}`);
  }
  
  return await resp.json();
}

/**
 * Load and validate configuration
 */
function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error("❌ config.json not found!");
    console.error("   Copy config.example.json to config.json and add your credentials.");
    process.exit(1);
  }
  
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  
  // Validate required fields
  if (!config.kalshiApiKeyId || config.kalshiApiKeyId === "YOUR-API-KEY-HERE") {
    console.error("❌ Please set your Kalshi API key in config.json");
    process.exit(1);
  }
  
  if (!config.kalshiPrivateKeyPath) {
    console.error("❌ Please set kalshiPrivateKeyPath in config.json");
    process.exit(1);
  }
  
  // Resolve private key path relative to config directory
  const keyPath = path.resolve(SCRIPT_DIR, config.kalshiPrivateKeyPath);
  if (!fs.existsSync(keyPath)) {
    console.error(`❌ Private key not found: ${keyPath}`);
    process.exit(1);
  }
  
  config.privateKeyPem = fs.readFileSync(keyPath, "utf8");
  config.displayName = config.displayName || "My";
  config.originalDeposit = config.originalDeposit || 500.00;
  config.watchlistTickers = config.watchlistTickers || [];
  
  return config;
}

async function main() {
  console.log("📊 Exporting Kalshi data...");
  
  const config = loadConfig();
  const { kalshiApiKeyId: keyId, privateKeyPem, displayName, originalDeposit, watchlistTickers } = config;
  
  // Fetch account balance
  const balanceData = await apiGet("/trade-api/v2/portfolio/balance", keyId, privateKeyPem);
  
  // Fetch positions
  const positionsData = await apiGet("/trade-api/v2/portfolio/positions", keyId, privateKeyPem);
  
  const positions = [];
  if (positionsData.market_positions) {
    for (const pos of positionsData.market_positions) {
      const marketData = await apiGet(`/trade-api/v2/markets/${pos.ticker}`, keyId, privateKeyPem);
      const market = marketData.market || {};
      
      const isYes = parseFloat(pos.position_fp || 0) > 0;
      const contracts = Math.abs(parseFloat(pos.position_fp || 0));
      const totalCost = parseFloat(pos.total_traded_dollars || 0);
      const avgPrice = contracts > 0 ? totalCost / contracts : 0;
      
      // Use last traded price for current value (matches Kalshi's portfolio valuation)
      const yesBid = parseFloat(market.yes_bid_dollars || 0);
      const yesAsk = parseFloat(market.yes_ask_dollars || 0);
      const lastPrice = parseFloat(market.last_price_dollars || 0);
      const currentPrice = isYes ? lastPrice : (1 - lastPrice);
      const currentValue = contracts * currentPrice;
      const pnl = currentValue - totalCost;
      const exitBid = isYes ? yesBid : (1 - yesAsk);
      
      positions.push({
        ticker: pos.ticker,
        title: market.title || pos.ticker,
        side: isYes ? "YES" : "NO",
        contracts,
        totalCost,
        avgPrice,
        currentPrice,
        currentValue,
        pnl,
        exitBid,
        probability: currentPrice,
        closeTime: market.close_time,
        status: market.status || "active"
      });
    }
  }
  
  // Fetch watchlist markets
  const watchlist = [];
  for (const ticker of watchlistTickers) {
    try {
      const marketData = await apiGet(`/trade-api/v2/markets/${ticker}`, keyId, privateKeyPem);
      if (marketData.market) {
        const m = marketData.market;
        watchlist.push({
          ticker,
          title: m.title,
          yesAsk: parseFloat(m.yes_ask_dollars || 0),
          yesBid: parseFloat(m.yes_bid_dollars || 0),
          closeTime: m.close_time
        });
      }
    } catch (e) {
      console.warn(`⚠️  Could not fetch watchlist ticker: ${ticker}`);
    }
  }
  
  // Fetch settlements (resolved bets)
  const settlementsData = await apiGet("/trade-api/v2/portfolio/settlements", keyId, privateKeyPem);
  const settlements = [];
  if (settlementsData.settlements) {
    for (const s of settlementsData.settlements) {
      const yesCount = parseFloat(s.yes_count_fp) || 0;
      const noCount = parseFloat(s.no_count_fp) || 0;
      const yesCost = parseFloat(s.yes_total_cost_dollars) || 0;
      const noCost = parseFloat(s.no_total_cost_dollars) || 0;
      const totalCost = yesCost + noCost;
      const revenue = (s.revenue || 0) / 100;
      const fees = parseFloat(s.fee_cost) || 0;
      const pnl = revenue - totalCost - fees;
      const isYes = yesCount > 0;
      
      // Try to get market title
      let title = s.ticker;
      try {
        const marketData = await apiGet(`/trade-api/v2/markets/${s.ticker}`, keyId, privateKeyPem);
        if (marketData.market?.title) title = marketData.market.title;
      } catch (e) {
        // Use ticker as fallback
      }
      
      settlements.push({
        ticker: s.ticker,
        title,
        side: isYes ? "YES" : "NO",
        contracts: isYes ? yesCount : noCount,
        totalCost,
        revenue,
        pnl,
        result: s.market_result?.toUpperCase() || "?",
        won: (isYes && s.market_result === "yes") || (!isYes && s.market_result === "no"),
        settledTime: s.settled_time
      });
    }
  }
  
  // Calculate totals
  const cashBalance = (balanceData.balance || 0) / 100;
  const portfolioValue = (balanceData.portfolio_value || 0) / 100;
  const totalValue = cashBalance + portfolioValue;
  const realizedPnl = settlements.reduce((sum, s) => sum + s.pnl, 0);
  
  const output = {
    updated: new Date().toISOString(),
    updatedFormatted: new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }) + " EDT",
    displayName,
    account: {
      total: totalValue,
      cash: cashBalance,
      portfolioValue,
      originalDeposit,
      totalPnl: totalValue - originalDeposit,
      totalPnlPercent: ((totalValue - originalDeposit) / originalDeposit) * 100,
      unrealizedPnl: positions.reduce((sum, p) => sum + p.pnl, 0),
      realizedPnl
    },
    positions,
    watchlist,
    settlements
  };
  
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`✅ Exported to ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
