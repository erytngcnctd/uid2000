import './App.css'
import { React, useEffect } from 'react'
import UngrundContextProvider from './context/UngrundContext'
import { Feed } from './components/feed'
import { Mint } from './components/mint'
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Header } from './components/header'
import { Token } from './components/token'
import { About } from './components/about'
import { Assets } from './components/assets'
import { Exchange } from './components/exchange'
import { Search } from './components/search'
import { Tags } from './components/tags'
import { HashRouter } from 'react-router-dom/cjs/react-router-dom.min'
import { Config } from './components/config'

function App() {

/*   useEffect(() => {
    console.log(window.navigator.userAgent)
  }, []) */
  return (
    <UngrundContextProvider>
      <Header />
      <HashRouter>
        <Switch>
          <Route exact path='/' component={Feed} />
          <Route exact path='/publish' component={Mint} />
          <Route path='/search' component={Search} />
          <Route exact path='/tag/:id' component={Tags} />
          <Route exact path='/asset/:id' component={Token} />
          <Route exact path='/about' component={About} />
          <Route exact path='/exchange' component={Exchange} />
          <Route exact path='/config' component={Config} />
          <Route exact path='/:id' component={Assets} />
          <Route exact path='/search/:id' component={Search} />
        </Switch>
      </HashRouter>
    </UngrundContextProvider>
  )
}

export default App
