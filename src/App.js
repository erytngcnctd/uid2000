import './App.css'
import { React, useEffect } from 'react'
import UngrundContextProvider from './context/UngrundContext'
import { Feed } from './components/feed'
import { Mint } from './components/mint'
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Header } from './components/header'
import { Token } from './components/token'

function App() {

/*   useEffect(() => {
    console.log(window.navigator.userAgent)
  }, []) */
  return (
    <UngrundContextProvider>
      <Header />
      <BrowserRouter>
        <Switch>
          <Route exact path='/' component={Feed} />
          <Route exact path='/mint' component={Mint} />
          <Route path='/token/:id' component={Token} />
        </Switch>
      </BrowserRouter>
    </UngrundContextProvider>
  )
}

export default App
