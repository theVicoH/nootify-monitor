# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Discord monitoring bot for sneaker restock notifications called "nootify-monitor". It listens to specific Discord channels (primarily from Dustify guild) for sneaker restock embeds, processes them, and forwards the data to Trinity API for automated purchasing decisions and profit checking.

## Core Architecture

### Main Entry Point
- `index.js` - Main application entry point that initializes logging, Discord gateway connection, and message handlers
- Uses ES modules (`"type": "module"` in package.json)

### Key Components

**Discord Integration**
- `src/services/selcore.js` - Discord gateway client connection and authentication
- `src/globals/channels.js` - Discord channel and guild ID mappings for different regions (EU, UK, FR, etc.)

**Message Processing Pipeline**
1. Raw Discord messages → `handleMeshBackupMsg()` (src/handlers/index.js:40)
2. Message parsing → `parseMessage()` extracts PID, store, product details
3. Additional data enrichment → `getAdditionalDetails()` gets SKU, sizes, pricing
4. Profit analysis → `checkIfWorthBuying()` via Trinity API
5. Multiple outputs:
   - Discord webhooks (with/without SKU channels)
   - Trinity API requests for automated purchasing
   - Special handling for French market (`handleMeshFrSpecific()` in index.js:139)

**Trinity API Integration**
- `src/handlers/trinity.js` - Main Trinity API interface
- Endpoints: `/mesh/backend` (general), `/mesh/backend/price` (pricing), specific FR endpoint
- Handles profit checking, automated purchasing decisions, and session management

**Utility Modules**
- `src/utils/parsers.js` - Product data extraction (brand, gender, sizes, etc.)
- `src/utils/webhooks.js` - Discord webhook management
- `src/utils/regex.js` - Text parsing utilities
- `src/globals/` - Configuration constants (currencies, countries, websites)

## Commands

### Development
```bash
# Start the application
npm start

# Development with auto-restart
npx nodemon index.js

# Install dependencies
npm install
```

### Docker
```bash
# Build Docker image
docker build -t nootify-monitor .

# Run container
docker run nootify-monitor
```

## Environment Variables Required

The application requires a `.env` file with:
- `TRINITY_URL` - Trinity API base URL
- `TRINITY_TOKEN` - Trinity API authentication token
- `WEBHOOK_URL` - Primary Discord webhook URL
- `WEBHOOK_URL_WITH_SKU` - Webhook for products with found SKUs
- `WEBHOOK_URL_NO_SKU` - Webhook for products without SKUs
- Discord authentication tokens for selcore service

## Key Data Flow

1. **Message Reception**: Discord gateway receives embed messages from monitored channels
2. **Channel Routing**: Messages routed by guild/channel ID to appropriate handlers
3. **Data Extraction**: Product information parsed from Discord embeds (PID, store, URL, etc.)
4. **Enrichment**: Additional product data fetched (SKU conversion, sizing, pricing)
5. **Profit Analysis**: Trinity API evaluates profitability across different marketplaces
6. **Multi-channel Output**: Results sent to Discord webhooks and Trinity for potential automated purchasing

## Special Features

- **Regional Support**: Multi-country channel monitoring (EU, UK, FR, DE, etc.)
- **French Market Integration**: Special Trinity endpoint for French sneaker market (mesh FR)
- **Profit Classification**: Categorizes opportunities as "CERTAIN GAIN", "PROBABLE GAIN", etc.
- **Store Support**: Handles multiple sneaker retailers (JD Sports, Size?, Footpatrol, etc.)
- **Size-based Analysis**: Per-size profit calculations and automated purchase decisions

## Store Integration

Supported stores are defined in `src/globals/websites_allowed.js` with current focus on major European sneaker retailers.