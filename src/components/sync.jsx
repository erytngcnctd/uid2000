import { useWeb3Modal, useWeb3ModalTheme } from "@web3modal/react"
import { useState, useEffect, useContext } from "react"
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from "wagmi"
import { polygon } from 'wagmi/chains'
import { UngrundContext } from '../context/UngrundContext'

export const SyncButton = () => {
  const [loading, setLoading] = useState(false)
  const { open, setDefaultChain } = useWeb3Modal()
  const { chain  } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()
  const { theme, setTheme } = useWeb3ModalTheme()
  const { isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { account, setAccount } = useContext(UngrundContext)
  const label = isConnected ? "unsync" : "sync"

  useEffect(() => {
   if (isConnected) {
    if (chain.id !== polygon.id) {
      try {
        switchNetwork(polygon.id)
      } catch (e) { 'network error', e }
  }

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

  useEffect(() => {
    setTheme({
      // themeMode: 'dark',
      themeVariables: {
        '--w3m-font-family': 'monospace',
        '--w3m-accent-color': '#000',
        '--w3m-wallet-icon-small-border-radius': '0',
        '--w3m-wallet-icon-large-border-radius': '0',
        '--w3m-icon-button-border-radius': '0',
      //  '--w3m-overlay-background-color': '#fff',
       '--w3m-background-color': "#fff",
       '--w3m-background-border-radius': '0',
       '--w3m-wallet-icon-border-radius': '0',
       '--w3m-button-border-radius': '0',
       '--w3m-secondary-button-border-radius': '0',
       '--w3m-button-hover-highlight-border-radius': '0',
       '--w3m-container-border-radius': '0',
       '--w3m-logo-image-url': '/favicon.ico'
        // ...
      }
    })
  }, [])
  

  const onOpen = async() => {
    setLoading(true);
    setDefaultChain(polygon)
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
    <div style={{ display: 'inline' }}>
      <a style={{ float: 'right', marginTop: '15px',textDecoration: 'underline', cursor: 'pointer' }} onClick={onClick} disabled={loading}>
        {label}
      </a>
      { account && 
        <span style={{ float: 'right', marginRight: '6px', marginTop: '15px' }}>
          {account.slice(0, 7)}...{account.slice(account.length - 5, account.length)} /
        </span> }
    </div>
  );
}