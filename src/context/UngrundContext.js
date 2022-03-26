import React, { createContext, Component } from 'react'
import { withRouter } from 'react-router'
import subjkts from '../abis/subjkts.json'
import minter from '../abis/minter.json'
import v1 from '../abis/v1.json'
import erc1155 from '../abis/erc1155.json'
import erc20 from '../abis/erc20.json'
import aggregator from '../abis/aggregator.json'
import id from '../abis/id.json'

export const UngrundContext = createContext()

class UngrundContextProviderClass extends Component {
  constructor(props) {
    super(props)

    this.state = {
      feed: [],
      setFeed: (feed) => this.setState({ feed: feed }),

      // aurora
      //erc1155: '0x2bd355065fe6b4df4ce7c12f15b9a9b2a8392037',
      // personal
      //erc1155: '0xcc29a8b91b94819f596d3181a6b88445e9f87a02',
      //erc1155: '0xEf40f61bEBD14e16fb2523D6F123C60eaBB73b4d',
      //erc1155: '0x4728440eB6c2fB7E2794d573B2A1beaB2B69fbc1',
      //erc1155: '0x7691d7d26E0039FEadD899165de94B4aCa37f71',
      //erc1155: '0x7a60172162f5AA731b1E4ef258bB095731B94400',

      //avalanche
      //erc1155: '0x7691d7d26e0039feadd899165de94b4aca37f71b',

      // gnosis
      //erc1155 : '0xc47550CEBb8DFE8ec1B1c368DED6330446C3a224',
      //v1: '0xaA948522efEf197B36e2C1D461fDF13402eBf442'
      // matic
      //erc1155: '0xA127271AC9c1b1c9C0494164277a9A3FcF0E95f8',
      erc1155: '0x320354dBf70AB703F8dCCCC0Cf981094edDC075e',
      subjkt: '0xD38f85BC8eE06f49ae43BfF78a8aaD9Ec47B64aA',
      v1: '0x563Ae9F8CEE2dd553C62646e0328bB78B2438170',
      v2: '0xA8AacB35a9678aa2e6b1cB6411B629bc54CdDd76',
      frax: '0x45c32fa6df82ead1e2ef74d17b76547eddfaff89',
      mim: '0x130966628846bfd36ff31a822705796e8cb8c18d',
      dummy: '0x84398272c77a35e765eff8fcb95af3bf941581a5',
      id : '0x5341Aeb7F190b0e24A21E69136c6e93e1490f4C1',
      idAbi : id,
      minterAbi: minter,
      swapAbi: v1,
      aggregator: aggregator,
      erc1155Abi: erc1155,
      erc20Abi: erc20,
      account: undefined,
      token: undefined,
      setAccount: (account, sync) => this.setState({ account: account, sync : sync }),
      open: false,
      setOpen : (open) => this.setState({ open : open }),
      selected: undefined,
      setSelected : (selected) => this.setState({ selected : selected }),
      loading : false,
      setLoading : (boolean) => this.setState({ loading : boolean }),
      msg : undefined,
      setMsg : (msg) => this.setState({ msg : msg })
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