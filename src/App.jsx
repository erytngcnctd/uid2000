import './App.css'
import { React, useEffect } from 'react'
import UngrundContextProvider from './context/UngrundContext'
import  Feed  from './components/feed'
import { Mint } from './components/mint'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Header } from './components/header'
import { Token } from './components/token'
import { About } from './components/about'
import { Assets } from './components/assets'
import { Exchange } from './components/exchange'
import { Search } from './components/search'
import { Tags } from './components/tags'
import { Landing } from './components/landing'
import { Config } from './components/config'
import { Swap } from './components/swap'
import { Defi } from './components/defi'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains,createConfig, WagmiConfig } from 'wagmi'
import { polygon } from 'wagmi/chains'


const chains = [polygon]
const projectId = 'f3f6cde61fee13c3e6db2a0c47d0e7c2'

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

function App() {
/*   useEffect(() => {
    console.log(window.navigator.userAgent)
  }, []) */
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <UngrundContextProvider>
          <Header />
          <HashRouter>
            <Routes>
              <Route exact path='/' element={ <Landing />} />
              <Route exact path='/feed' element={ <Feed />} />
              <Route exact path='/publish' element={ <Mint/> } />
              <Route path='/search' element={ <Search/>} />
              <Route exact path='/tag/:id' element={ <Tags/> } />
              <Route exact path='/asset/:id' element={ <Token/> } />
              <Route exact path='/about' element={ <About /> } />
              <Route exact path='/config' element={ <Config /> } />
              <Route exact path='/:id' element={ <Assets/> } />
              <Route exact path='/search/:id' element={ <Search/> } />
              <Route exact path='/defi' element={ <Defi /> } />
            </Routes>
          </HashRouter>
        </UngrundContextProvider>
      </WagmiConfig>

    <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
  </>
  )
}

export default App
