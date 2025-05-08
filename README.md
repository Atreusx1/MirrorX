# MirrorClone

MirrorClone is a decentralized blogging platform inspired by Mirror.xyz, enabling users to create and share posts immutably on the Ethereum blockchain while storing metadata off-chain for efficiency. Built with a Solidity smart contract, an Express.js backend with MongoDB, and a Vite + React frontend with a dark theme, it offers a seamless Web3 experience.

## Features

- **Wallet Integration**: Connect via MetaMask to interact with the blockchain.
- **Post Creation**: Write and publish posts, stored on-chain for permanence.
- **Like Posts**: Engage with content by liking posts, tracked on-chain.
- **Dark Theme UI**: Twitter-like interface with a dark aesthetic (#1a1a1a background, #1d9bf0 accents).
- **Hybrid Storage**: Posts are stored on-chain (content) and off-chain (metadata) for scalability.

## Architecture

- **Smart Contract** (`MirrorPost.sol`): Manages post creation and likes, deployed on a local Hardhat network.
- **Backend**: Express.js server with MongoDB stores post metadata (postId, author, content, timestamp, likes) for fast retrieval.
- **Frontend**: Vite + React app with Tailwind CSS and CSS Modules, interfacing with the contract via Web3.js and the backend via Axios.
- **Blockchain**: Hardhat local node simulates an Ethereum network for development.

## Project Structure

- `smart-contracts/`: Contains `MirrorPost.sol`, Hardhat config, and deployment scripts.
- `backend/`: Express.js server, MongoDB models, and API routes.
- `frontend/`: Vite + React app with components (`Header`, `WalletButton`, `PostForm`, `PostCard`), pages (`Home`), and services (`web3.js`, `api.js`).

## Prerequisites

- **Node.js**: v22.14.0 or later (`node --version` to verify).
- **npm**: Included with Node.js (`npm --version`).
- **MongoDB**: Local instance (`mongod`) or MongoDB Atlas URI.
- **MetaMask**: Browser extension installed (Chrome, Firefox, or compatible).
- **Git**: Optional, for cloning the repository.
- **Text Editor**: e.g., VS Code, for editing files like `web3.js`.

## Setup Instructions

Follow these steps to set up and run MirrorClone locally. Use separate terminal windows for Hardhat, backend, and frontend.

### 1. Clone the Repository

Clone the project (replace `<repository-url>` with your Git repo, e.g., `https://github.com/your-username/mirrorclone.git`). Skip if you already have the code.

```bash
git clone <repository-url>
cd mirrorclone
```

### 2. Smart Contracts (Hardhat)

The smart contract (`MirrorPost.sol`) handles post creation and likes, deployed on a local Hardhat Ethereum network.

#### Install Dependencies

Install Hardhat and dependencies:

```bash
cd smart-contracts
npm install
```

#### Start Hardhat Node

Run a local Ethereum blockchain:

```bash
npx hardhat node
```

- Output shows 20 test accounts with private keys (e.g., `Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)`).
- Keep this terminal running.
- Copy a private key (e.g., `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`) for MetaMask.

#### Deploy Contract

Deploy `MirrorPost.sol` to the Hardhat network:

```bash
npx hardhat run scripts/deploy.js --network hardhat
```

- Output includes the contract address (e.g., `0x5FbDB2315678afecb367f032d93F642f64180aa3`).
- Save this address for the frontend.

#### Copy ABI

Copy the contract ABI to the frontend for Web3.js interaction:

```bash
cp artifacts/contracts/MirrorPost.sol/MirrorPost.json ../frontend/public/abis/
```

- This creates `frontend/public/abis/MirrorPost.json`.

### 3. Backend (Express.js + MongoDB)

The backend stores post metadata in MongoDB and provides APIs for the frontend.

#### Install Dependencies

Install Express, Mongoose, and other dependencies:

```bash
cd ../backend
npm install
```

#### Set Up Environment

Create a `.env` file for MongoDB configuration:

```bash
echo "MONGO_URI=mongodb://localhost:27017/mirrorclone" > .env
```

- For local MongoDB, ensure it's running (`mongod`). Install MongoDB if needed (`brew install mongodb` on macOS, or see MongoDB docs).
- For MongoDB Atlas, replace with your URI (e.g., `mongodb+srv://user:password@cluster0.mongodb.net/mirrorclone`).

#### Start Backend Server

Run the Express server:

```bash
node server.js
```

- Confirm output: `MongoDB Connected: localhost` and `Server running on port 5000`.
- Test the API: `curl http://localhost:5000/api/health` (should return `{"status":"OK"}`).
- Keep this terminal running.

### 4. Frontend (Vite + React)

The frontend provides a UI to connect wallets, create posts, and view/like posts.

#### Install Dependencies

Install React, Vite, Tailwind CSS, Web3.js, and other dependencies:

```bash
cd ../frontend
npm install
```

#### Update Contract Address

Update the contract address in `src/services/web3.js` to match the deployed contract:

```bash
nano src/services/web3.js
```

Replace:

```javascript
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Your address
```

- Use the address from the deployment step (e.g., `0x5FbDB2315678afecb367f032d93F642f64180aa3`).
- Save and exit (`Ctrl+O, Enter, Ctrl+X` in nano).

#### Start Frontend Server

Run the Vite development server:

```bash
npm run dev
```

- Open `http://localhost:5173` in a browser with MetaMask installed.
- Confirm the dark-themed UI loads (black background, blue accents).
- Keep this terminal running.

### 5. Configure MetaMask

MetaMask connects the frontend to the Hardhat network for blockchain interactions.

#### Add Hardhat Network

1. Open MetaMask in your browser.
2. Click the network dropdown (e.g., "Ethereum Mainnet") > Add Network > Add a network manually.
3. Enter:

   ```
   Network Name: Hardhat Local
   New RPC URL: http://127.0.0.1:8545
   Chain ID: 1337
   Currency Symbol: ETH
   ```
4. Click Save.
5. Switch to Hardhat Local in the network dropdown.

#### Import Test Account

1. From the Hardhat node output, copy a private key (e.g., `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`). Never use these keys on a real network.
2. In MetaMask, click the account circle (top-right) > Import Account.
3. Paste the private key and click Import.
4. Verify the account shows 10,000 ETH (test ETH for Hardhat).

### 6. Run the Application

Test the full application to ensure all components work together.

1. **Connect Wallet**:
   - On `http://localhost:5173`, click "Connect Wallet".
   - MetaMask prompts to connect the imported account. Approve it.
   - The UI updates to show "Connected: 0xf39F...2266" and a textarea for posting.

2. **Create a Post**:
   - Enter text in the textarea (e.g., "My first decentralized post!").
   - Click "Post".
   - MetaMask prompts for transaction confirmation. Approve it (gas is free on Hardhat).
   - The textarea clears, and the page reloads to show the post in the feed.

3. **Like a Post**:
   - In the feed, find your post (shows author, content, timestamp, ❤️ 0).
   - Click the ❤️ button.
   - Confirm the transaction in MetaMask.
   - The like count updates (e.g., ❤️ 1).

4. **Verify Storage**:
   - Blockchain: Use Hardhat console to check posts:
     ```bash
     npx hardhat console --network hardhat
     ```
     Then:
     ```javascript
     const contract = await ethers.getContractAt("MirrorPost", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
     await contract.postCount();
     await contract.posts(1);
     ```
   - MongoDB: Check posts in MongoDB:
     ```bash
     mongo mirrorclone
     db.posts.find()
     ```
     - Should show post details (postId, author, content, timestamp, likes).

## Troubleshooting

### Hardhat Node
- **Issue**: Node doesn't start or crashes.
- **Fix**: Restart: `Ctrl+C` and `npx hardhat node`. Ensure port 8545 is free (`lsof -i :8545`).
- **Check**: Confirm accounts and private keys are logged.

### Contract Deployment
- **Issue**: Deployment fails or wrong address.
- **Fix**: Redeploy: `npx hardhat run scripts/deploy.js --network hardhat`. Verify `scripts/deploy.js` exists.
- **Check**: Ensure address matches `frontend/src/services/web3.js`.

### Backend
- **Issue**: MongoDB connection error.
- **Fix**:
  - Verify `MONGO_URI` in `backend/.env`.
  - Start local MongoDB: `mongod`, or use correct Atlas URI.
  - Reinstall: `cd backend && npm install`.
- **Check**: Test API: `curl http://localhost:5000/api/health` (returns `{"status":"OK"}`).

### Frontend
- **Issue**: Vite fails (e.g., PostCSS error).
- **Fix**:
  - Verify `postcss.config.js` uses ESM:
    ```javascript
    export default { plugins: { tailwindcss: {}, autoprefixer: {}, } };
    ```
  - Clear cache: `rm -rf node_modules package-lock.json && npm install`.
  - Check `public/abis/MirrorPost.json` exists.
- **Check**: Open `http://localhost:5173` and inspect browser console.

### MetaMask
- **Issue**: Can't connect or no ETH.
- **Fix**:
  - Verify network: RPC `http://127.0.0.1:8545`, Chain ID 1337.
  - Re-import Hardhat test account private key.
  - Restart Hardhat node if accounts reset.
- **Check**: Confirm 10,000 ETH balance.

### General
- **Logs**: Check terminal logs (Hardhat, backend, Vite) and browser console (F12).
- **Reset**: Stop all processes (`Ctrl+C`), clear caches, and restart setup.

## Development Notes

- **Terminals**: Use three terminals:
  - Hardhat: `npx hardhat node`.
  - Backend: `node server.js`.
  - Frontend: `npm run dev`.
- **Blockchain Reset**: Hardhat's blockchain resets on node restart. Redeploy the contract and update the address.
- **Security**: Hardhat private keys are for local testing only. Never use on mainnet or testnets.
- **Performance**: MongoDB caching improves feed loading; consider indexing for production.

## Future Improvements

- **Dynamic Refresh**: Update the feed without page reloads using Web3.js event listeners.
- **Comments**: Add comment functionality to posts.
- **User Profiles**: Allow users to set usernames and avatars.
- **Testnet Deployment**: Deploy to Sepolia or Goerli for public testing.
- **Testing**: Add unit tests for smart contract (`hardhat test`) and backend (`jest`).

## Contributing

Contributions are welcome! Fork the repository, create a branch, and submit a pull request. For issues or feature requests, open a GitHub issue or contact the developer.

