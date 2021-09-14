import React, { createContext, Component } from 'react'
import { withRouter } from 'react-router'
import subjkts from '../abis/subjkts.json'
import minter from '../abis/minter.json'
import swap from '../abis/swap.json'
import erc1155 from '../abis/erc1155.json'

export const UngrundContext = createContext()

class UngrundContextProviderClass extends Component {
    constructor(props) {
      super(props)
    
      this.state = {
        feed : [],
        setFeed : (feed) => this.setState({ feed : feed }),
        erc1155 : '0xC51c86431865872f665Be75Cc181E4e1C036760b',
        subjkt : '0xD38f85BC8eE06f49ae43BfF78a8aaD9Ec47B64aA',
        swap : '0x02011ce90d7b3A67B223f89378d1f4BBdc6559BF',
        minterAbi : minter,
        swapAbi : swap,
        erc1155Abi : erc1155,
        account : undefined,
        setAccount : (account) => this.setState({ account : account })
      }
    }

render() {
    return (
      <UngrundContext.Provider
        value={{
          ...this.state,
        }}
      >
        {this.props.children}
      </UngrundContext.Provider>
    )
  }
}

const UngrundContextProvider = UngrundContextProviderClass
export default UngrundContextProvider