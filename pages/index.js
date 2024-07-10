import { useState, useEffect } from "react";
import { ethers } from "ethers";
import bank_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
import styles from "./styles/HomePage.module.css"; // Import the CSS module

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [bank, setBank] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [depositAmount, setDepositAmount] = useState(1); // Default deposit amount is 1
  const [withdrawAmount, setWithdrawAmount] = useState(1); // Default withdraw amount is 1
  const [ethBalance, setEthBalance] = useState(undefined);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const bankABI = bank_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts[0]);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts[0]);

    // once the wallet is set, we can get a reference to our deployed contract
    getBankContract();
  };

  const getBankContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const bankContract = new ethers.Contract(contractAddress, bankABI, signer);

    setBank(bankContract);
  };

  const getBalance = async () => {
    if (bank) {
      const balanceValue = await bank.getBalance();
      setBalance(balanceValue);
      setEthBalance(ethers.utils.formatEther(balanceValue));
    }
  };

  const deposit = async () => {
    if (bank) {
      let tx = await bank.deposit(ethers.utils.parseEther(depositAmount.toString()));
      await tx.wait();
      getBalance();
      addTransactionToHistory("Deposit", depositAmount);
    }
  };

  const withdraw = async () => {
    if (bank) {
      let tx = await bank.withdraw(ethers.utils.parseEther(withdrawAmount.toString()));
      await tx.wait();
      getBalance();
      addTransactionToHistory("Withdraw", -withdrawAmount);
    }
  };

  const refreshBalance = () => {
    getBalance();
  };

  useEffect(() => {
    getWallet();
  }, []);

  const initUser = () => {
    // Check to see if the user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if the user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount} className={styles.button}>
          Connect your Metamask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
    <div className={styles.container}>
    <div className={styles.accountInfo}>
    <p className={styles.paragraph}>Your Account: {account}</p>
    <p className={styles.balance}>Current Balance: {ethBalance !== undefined ? `${Number(ethBalance).toFixed(2)} ETH` : "Loading..."} </p>
    <div className={styles.buttonGroup}>
    <input
      type="number"
        value={depositAmount}
        onChange={(e) => setDepositAmount(parseFloat(e.target.value))}
        className={styles.input}
         />
    <button onClick={deposit} className={styles.button}>
        Add ETH Balance
          </button>
    </div>


          <div className={styles.buttonGroup}>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(parseFloat(e.target.value))}
              className={styles.input}
            />
            <button onClick={withdraw} className={styles.button}>
              Withdraw Balance
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles["page-wrapper"]}>
      <main className={styles["main-container"]}>
        <header className={styles.header}>
          <h1 className={styles.heading}>Online BANKER</h1>
        </header>
        {initUser()}
      </main>
    </div>
  );
}
