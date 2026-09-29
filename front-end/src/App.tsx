import { useState } from "react";
import { BrowserProvider, formatEther, Contract } from "ethers";

// Tell TypeScript that MetaMask adds this to window
declare global {
  interface Window {
    ethereum?: any;
  }
}

// set some gloabals
const CONTRACT_ADDRESS = "0x77d67F2405e30bFabdAd809285aEeEAeBAE87C11"
const ABI = [ 
  "function num() view returns (uint256)",
  "function getSlice() view returns (string[])",
  "function setNum(uint256)"
]


export default function App() {
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [currentNum, setCurrentNum] = useState<string>("");
  const [words, setWords] = useState<string[]>([]);

  // input vars
  const [input, setInput] = useState<string>("");
  const [pending, setPending] = useState<boolean>(false);

  async function refreshBalance(address: string) {
    const provider = new BrowserProvider(window.ethereum);
    const wei = await provider.getBalance(address);
    setBalance(formatEther(wei));
  }

  function getReadContract() {
    const provider = new BrowserProvider(window.ethereum);
    return new Contract(CONTRACT_ADDRESS, ABI, provider);
  }

  async function fetchNum() {
    try {
      const value: bigint = await getReadContract().num();
      setCurrentNum(value.toString()); // bigint -> string for display
      setError("");
    } catch (e: any) {
      setError(e?.message ?? "Could not read num");
    }
  }

  async function fetchSlice() {
    try {
      const result: string[] = await getReadContract().getSlice();
      setWords(Array.from(result));
      setError("");
    } catch (e: any) {
      setError(e?.message ?? "Could not read array");
    }
  }

  async function connect() {
    // verify connection to metamask
    if (!window.ethereum) {
      setError("MetaMask not found. Is the extension installed?");
      return;
    }
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts: string[] = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      await refreshBalance(accounts[0]);
      setError("");
    } catch (e: any) {
      setError(e?.message ?? "Connection failed");
    }
  }
  async function getWriteContract() {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner(); // the MetaMask account
  return new Contract(CONTRACT_ADDRESS, ABI, signer);
  }

  async function handleSetNum() {
    // 1. Validate before bothering MetaMask
    if (!/^\d+$/.test(input)) {
      setError("Enter a whole number (0 or greater).");
      return;
    }

    try {
      setPending(true);
      setError("");

      // 2. Send: MetaMask popup appears here
      const contract = await getWriteContract();
      const tx = await contract.setNum(BigInt(input));

      // 3. Wait until it's mined
      await tx.wait();

      // 4. Now the chain state is updated, so refresh the UI
      await refreshBalance(account);
      await fetchNum();
      setInput("");
    } catch (e: any) {
      if (e?.code === "ACTION_REJECTED") {
        setError("You rejected the transaction in MetaMask.");
      } else {
        setError(e?.reason ?? e?.shortMessage ?? e?.message ?? "Transaction failed");
      }
    } finally {
      setPending(false); // runs on success AND failure
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Counter dApp</h1>

      {!account ? (
        <button onClick={connect}>Connect MetaMask</button>
      ) : (
        <div>
          <p><strong>Address:</strong> {account}</p>
          <p><strong>Balance:</strong> {balance} ETH</p>
        </div>
      )}
      <hr />
      <button onClick={fetchNum}>Get num</button>
      <p><strong>Current num:</strong> {currentNum === "" ? "—" : currentNum}</p>

      <button onClick={fetchSlice}>Get sliced array</button>
      <ul>
        {words.map((w, i) => <li key={i}>{w}</li>)}
      </ul>
      <hr />
      <input 
      type="number"
      min="0"
      step="1"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="new num"
      disabled={pending}
      />
      <button onClick={handleSetNum} disabled={pending || !account}>
        {pending ? "Waiting..." :  "Set num"}
      </button>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </div>
  );
}
