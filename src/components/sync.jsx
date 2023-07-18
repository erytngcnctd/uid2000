import { useWeb3Modal } from "@web3modal/react";
import { useState, useEffect, useContext } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { UngrundContext } from '../context/UngrundContext'

export const SyncButton = () => {
  const [loading, setLoading] = useState(false);
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { setAccount } = useContext(UngrundContext)
  const label = isConnected ? "unsync" : "sync";

    // add when unsync on config or assets change route
  useEffect(() => {
   if (isConnected) {
    let account = JSON.parse(localStorage.getItem("wagmi.store")).state.data.account
    setAccount(account, true)
    localStorage.setItem("account", account )
    localStorage.setItem("sync", true)
   }  else {
    setAccount(undefined, false)
    localStorage.removeItem("account" )
    localStorage.removeItem("sync", false)
   }
  }, [isConnected])
  
  const onOpen = async() => {
    setLoading(true);
    await open();
    setLoading(false);
  }

  const onClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      onOpen();
    }
  }

  return (
    <a style={{float: 'right', marginTop: '15px',textDecoration: 'underline', cursor: 'pointer' }} onClick={onClick} disabled={loading}>
      {label}
    </a>
  );
}