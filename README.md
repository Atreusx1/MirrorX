cd mirrorclone
echo "# MirrorClone

MirrorClone is a decentralized blogging platform inspired by Mirror.xyz, built with a Solidity smart contract, an Express.js backend with MongoDB, and a Vite + React frontend. Users can connect their Ethereum wallet via MetaMask, create posts, and like posts, with data stored on-chain and off-chain.

## Project Structure

- \`smart-contracts/\`: Solidity contract (\`MirrorPost.sol\`) and Hardhat setup.
- \`backend/\`: Express.js server with MongoDB for post metadata.
- \`frontend/\`: Vite + React app with a dark-themed UI.

## Prerequisites

- **Node.js**: v22.14.0+ (\`node --version\`).
- **npm**: Included with Node.js (\`npm --version\`).
- **MongoDB**: Local (\`mongod\`) or MongoDB Atlas URI.
- **MetaMask**: Browser extension (Chrome/Firefox).
- **Git**: Optional, for cloning.

## Setup Instructions

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd mirrorclone
\`\`\`

### 2. Smart Contracts (Hardhat)

#### Install Dependencies

\`\`\`bash
cd smart-contracts
npm install
\`\`\`

#### Start Hardhat Node

\`\`\`bash
npx hardhat node
\`\`\`

- Keep this terminal running.
- Note a test account private key (e.g., \`0xac0974...\`).

#### Deploy Contract

\`\`\`bash
npx hardhat run scripts/deploy.js --network hardhat
\`\`\`

- Copy the contract address (e.g., \`0x5FbDB2315678afecb367f032d93F642f64180aa3\`).

#### Copy ABI

\`\`\`bash
cp artifacts/contracts/MirrorPost.sol/MirrorPost.json ../frontend/public/abis/
\`\`\`

### 3. Backend (Express.js + MongoDB)

#### Install Dependencies

\`\`\`bash
cd ../backend
npm install
\`\`\`

#### Set Up Environment

\`\`\`bash
echo \"MONGO_URI=mongodb://localhost:27017/mirrorclone\" > .env
\`\`\`

- For MongoDB Atlas, replace with your Atlas URI.
- Ensure MongoDB is running (\`mongod\`).

#### Start Backend Server

\`\`\`bash
node server.js
\`\`\`

- Confirm: \`MongoDB Connected: localhost\` and \`Server running on port 5000\`.
- Keep this terminal running.

### 4. Frontend (Vite + React)

#### Install Dependencies

\`\`\`bash
cd ../frontend
npm install
\`\`\`

#### Update Contract Address

Edit \`src/services/web3.js\`:

\`\`\`bash
nano src/services/web3.js
\`\`\`

Update:

\`\`\`javascript
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Your address
\`\`\`

#### Start Frontend Server

\`\`\`bash
npm run dev
\`\`\`

- Open \`http://localhost:5173\` in a browser with MetaMask.
- Keep this terminal running.

### 5. Configure MetaMask

#### Add Hardhat Network

1. Open MetaMask.
2. Network dropdown > **Add Network** > **Add a network manually**.
3. Enter:

   \`\`\`
   Network Name: Hardhat Local
   New RPC URL: http://127.0.0.1:8545
   Chain ID: 1337
   Currency Symbol: ETH
   \`\`\`
4. Click **Save**.
5. Switch to **Hardhat Local**.

#### Import Test Account

1. Copy a private key from Hardhat node output (e.g., \`0xac0974...\`).
2. MetaMask > Account circle > **Import Account**.
3. Paste the private key and click **Import**.
4. Confirm 10,000 ETH balance.

### 6. Run the Application

1. **Connect Wallet**:
   - On \`http://localhost:5173\`, click **\"Connect Wallet\"**.
   - Approve in MetaMask.
   - UI shows connected address and post form.

2. **Create a Post**:
   - Enter text (e.g., \"My first post!\").
   - Click **\"Post\"**.
   - Confirm transaction in MetaMask.
   - Post appears in feed after reload.

3. **Like a Post**:
   - Click ❤️ on a post.
   - Confirm transaction.
   - Like count updates.

## Troubleshooting

- **Hardhat Node**:
  - Ensure \`npx hardhat node\` is running.
  - Restart: \`Ctrl+C\` and \`npx hardhat node\`.
- **Contract**:
  - Verify address in \`frontend/src/services/web3.js\`.
  - Redeploy: \`npx hardhat run scripts/deploy.js --network hardhat\`.
- **Backend**:
  - Check \`MONGO_URI\` in \`backend/.env\`.
  - Test: \`curl http://localhost:5000/api/health\` (returns \`{\"status\":\"OK\"}\`).
- **Frontend**:
  - Ensure \`public/abis/MirrorPost.json\` exists.
  - Check Vite logs: \`npm run dev\`.
- **MetaMask**:
  - Verify network (RPC: \`http://127.0.0.1:8545\`, Chain ID: 1337).
  - Re-import test account if no ETH.

## Notes

- Use separate terminals for Hardhat, backend, and frontend.
- Hardhat blockchain resets on node restart; redeploy contract if needed.
- Contact developer for issues or feature requests." > README.md