import "../App.css"
import React, { Component } from 'react'
import { createClient, cacheExchange, fetchExchange } from 'urql'
import { UngrundContext } from '../context/UngrundContext'
import { Swap } from './swap'
import { Burn } from './burn'
import { Transfer } from './transfer'
import { Royalties } from './royalties'
import { Collect } from './collect'
import { _ } from 'lodash'
import ReactMarkdown from 'react-markdown'

// function toHex(d) {
//     return (Number(d).toString(16)).slice(-2).toUpperCase()
// }

const APIURL = 'https://api.studio.thegraph.com/query/49421/uidgraph/v0.0.61'

export class Token extends Component {

    static contextType = UngrundContext

    state = {
        token: undefined,
        listings: undefined,
        loading: true,
        // royalties: undefined,
        market: undefined,
        editions: undefined,
        orders: undefined,
        flag: false
    }

    metadata = async (id) => {

        const tokensQuery = `
        query 
          {
            uris (where : { tokenId: ${id} }){
                tokenId
                editions
                tokenMetaData {
                  name
                  description
                  mimeType
                  image
                  animation_url
                }
                metaDataUri
                from
                timestamp
            }
            transfers(where : { tokenId: ${id} }, orderBy: timestamp, orderDirection: desc) {
                id
                from
                to
                tokenId
                value
                timestamp
            }
        }
      `

      const client = createClient({
        url: APIURL,
        exchanges: [cacheExchange, fetchExchange]
    });

        const data = await client.query(tokensQuery).toPromise();
        let tks = _.filter(_.filter(data.data.transfers, { from: "0x0000000000000000000000000000000000000000" }), { tokenId: String(id) })
        let burn = _.filter(_.filter(data.data.transfers, { to: this.context.dummy }), { tokenId: String(id) })
        burn.map(e => e.amount = Number(e.amount))
        //console.log(tks.map(e => e._value = Number(e._value)))
        // console.log(tks)
        // this.setState({ editions: _.sumBy(parseInt(tks), 'value') - _.sumBy(parseInt(burn), 'value') })
        this.setState({ editions: data.data.uris[0].editions })
        return data.data

    }

    listings = async (tokenId) => {
        const swapsQuery = `
            {
                swaps (where : { tokenId : ${tokenId} }) {
                    id
                    erc1155
                    tokenId
                    swapId
                    timestamp
                    transactionHash
                    amount
                    value
                    op
                    issuer
                }
              }
            `

        const client = createClient({
            url: APIURL,
            exchanges: [cacheExchange, fetchExchange]
        })

        const data = await client.query(swapsQuery).toPromise()
        return data.data.swaps || []

    }


    componentWillMount = async () => {

        let tokenId = parseInt(window.location.hash.split('/')[2], 16)
        // tokenId=150
        // treat metadata/display options

        let metadata = await this.metadata(tokenId)
        let aux = metadata.uris.map(async e => {
            if (e.tokenMetaData.mimeType?.split('/')[0] == 'text') e.text = await axios.get(`https://cloudflare-ipfs.com/ipfs/${e.image.split('//')[1]}`).then(res => res.data)
            return e
        })
        let transfers = metadata.transfers
        transfers = transfers.filter(e => e.from != this.context.v1.toLowerCase() && e.to != this.context.v1.toLowerCase() && e.from != '0x0000000000000000000000000000000000000000')
        //let transfers = (_.filter(metadata.tokenTransfers, { _from: "0x0000000000000000000000000000000000000000" }))
        //transfers = [...transfers, ...(_.filter(metadata.tokenTransfers, { _to: this.context.dummy }))]
        //transfers.map(e => e.timestamp = e._timestamp)
        //console.log(transfers)
        let listings = await this.listings(tokenId) 
        // console.log('listings', listings)
        listings.map(e => e.amount = Number(e.amount))
        let op2 = _.filter(listings, { op: "2" })
        let op1 = _.filter(listings, { op: "1" })
        let op0 = _.filter(listings, { op: "0" })

        op0.map(i => { op2.map(j => { if (i.swapId == j.swapId) i.amount = i.amount - j.amount }) })
        op0.map(i => { op1.map(j => { if (i.swapId == j.swapId) i.amount = i.amount - j.amount }) })
        op0.map(e => e.value = Number(e.value))

        let orders = op0.filter(e => e.amount != 0)
        //console.log(orders)
        //op1.forEach(i => { op0.forEach(j => { if (i.swapId == j.swapId) i.seller = j.issuer })})
        let market = _.sumBy(op0, 'amount')
        this.setState({ market: market })

        let history = await this.listings(tokenId)
        history.forEach(i => op0.forEach(j => { if (i.swapId == j.swapId) i.seller = j.issuer }))
        history = _.orderBy([...history, ...transfers], ['timestamp'], ['desc'])
        // console.log(history)
        
        Promise.all(aux).then(async values => {
            console.log('metadata', values)
            this.context.token = values
            this.setState({ token: values, listings: listings.reverse(), orders: _.orderBy(orders, ['value'], ['asc']), history: history, loading: false })
        })

        // let erc1155 = new Contract(this.context.erc1155Abi, this.context.erc1155)
        // this.setState({ royalties: await erc1155.methods.royalties(tokenId).call() })
    }

    // collect = async (swapId, value) => {
    //     let contract = new Contract(this.context.swapAbi, this.context.v1)
    //     contract.provider = web3
    //     console.log(swapId)
    //     try {
    //         let result = await contract.methods.collect(swapId, 1).send({ from: this.context.account, value: parseInt(value) })
    //         console.log(result)
    //     } catch (err) {
    //         console.log(err)
    //     }
    // }

    cancel = async (swapId) => {
        let contract = new Contract(this.context.swapAbi, this.context.v1)
        contract.provider = web3 
        try {
            let result = await contract.methods.cancelSwap(swapId).send({ from: this.context.account })
            console.log(result)
        } catch (err) {
            console.log(err)
        }
    }

    setOption = (option) => this.setState()

    holders = async (tokenId) => {

        const APIURL = "https://api.studio.thegraph.com/proxy/49421/v0.0.61"
        const transfers = `query
        {
            transfers(where: { tokenId : "${tokenId}" }) {
                      tokenId
                      value
                      from
                      to
            }
        }`

        const client = createClient({
            url: APIURL,
            cacheExchange, fetchExchange
        });


        let res = (await client.query(transfers).toPromise()).data.transfers
        console.log('res', res)
        return res
    }

    orderBook = async (tokenId) => {
        let res = await this.listings(parseInt(window.location.hash.split('/')[2], 16))
        // let res = await this.listings(150)
        // console.log(res)
        res = res.map(e => e.amount = Number(e.amount))
        res = _.filter(res, { op: "0" })
        let available = _.sumBy(res, 'amount')
        // this.holders(parseInt(window.location.hash.split('/')[2], 16))
        //console.log(available)
        //console.log(res)
        this.setState({ active: res, collectors: [] })
    }

    render() {
        return (
            <div style={{ marginTop: '20px' }}>
                {
                    !this.state.loading ?
                        <div>
                            <div>
                                { /* context */}
                                {
                                    this.state.token[0].tokenMetaData.mimeType?.split('/')[0] == 'video' ?
                                        <div>
                                            <video controls autoPlay={"autoplay"} loop style={{ maxWidth: '50vw' }} >
                                                <source src={`https://cloudflare-ipfs.com/ipfs/${this.state.token[0].tokenMetaData.animation_url.split('//')[1]}`}></source>
                                            </video>
                                        </div> : undefined
                                }
                                {
                                    this.state.token[0].tokenMetaData.mimeType?.split('/')[0] == 'image' ?
                                        <img variant="top" src={`https://cloudflare-ipfs.com/ipfs/${this.state.token[0].tokenMetaData.image.split('//')[1]}`} />
                                        :
                                        undefined
                                }
                                {
                                    this.state.token[0].tokenMetaData.mimeType?.split('/')[0] == 'text' ?
                                        <div className="txt" style={{ maxWidth: '50vw' }}>
                                            <ReactMarkdown>
                                                {this.state.token[0].text}
                                            </ReactMarkdown>
                                        </div>

                                        : undefined
                                }
                                {
                                    this.state.token[0].tokenMetaData.mimeType?.split('/')[1] == 'pdf' ?
                                        <iframe
                                            title="ungrund PDF renderer"
                                            src={`https://cloudflare-ipfs.com/ipfs/${this.state.token[0].tokenMetaData.image.split('//')[1]}#zoom=100`}
                                            loading="lazy"
                                            sandbox
                                        />
                                        :
                                        undefined
                                }
                                {
                                    this.state.token[0].tokenMetaData.mimeType?.split('/')[0] == 'audio' ?
                                        <div style={{ maxWidth: '50vw' }}>
                                            <img src={`https://cloudflare-ipfs.com/ipfs/${this.state.token[0].tokenMetaData.image.split('//')[1]}`} /><br />
                                            <audio controls>
                                                <source src={`https://cloudflare-ipfs.com/ipfs/${this.state.token[0].tokenMetaData.animation_url.split('//')[1]}`} />
                                            </audio>
                                        </div> : undefined
                                }
                                <br />
                                {this.state.market == 0 ? <span>X</span> : <span>{this.state.market}</span>}/{this.state.editions} ed.<br />
                                <a className='style' href={`#/${this.state.token[0].from}`}>{this.state.token[0].from.slice(0, 7)}...{this.state.token[0].from.slice(36, 42)}</a><br /><br />
                            </div>

                            {
                                this.state.orders.length > 0 ?
                                    <div>
                                        {

                                            this.state.orders.map((e, i) => {
                                                // smaller e.value
                                                if (i == 0) {
                                                    return (
                                                        <div key={i}>
                                                            <Collect swapId={e.swapId} value={e.value / 1000000000000000000}/>
                                                            <br/><br/>
                                                            {/* <a className='button style' style={{ cursor: 'pointer' }} onClick={() => this.collect(e.swapId, e.value)}>collect for {e.value / 1000000000000000000} MATIC</a><br /><br />
                                                                                                                        
                                                            {
                                                                 e.issuer == this.context.account?.toLowerCase() ? <a className='button style' style={{ cursor: 'pointer' }} onClick={() => this.cancel(e.swapId)}>cancel</a> : undefined
                                                            }  */}
                                                        </div>
                                                    )
                                                }
                                            })
                                        }
                                    </div>
                                    : undefined
                            }

                            {/* options */}

                            {
                                <div style={{ display: 'inline' }}>
                                    <span>
                                        <a className='style' style={{ cursor: 'pointer' }} onClick={() => this.setState({ option: 'info' })}>info</a>&nbsp;&nbsp;
                                        <a className='style' style={{ cursor: 'pointer' }} onClick={() => { this.setState({ option: 'book' }); this.orderBook(this.state.token[0].tokenId) }} >order book</a>&nbsp;&nbsp;
                                        <a className='style' style={{ cursor: 'pointer' }} onClick={() => this.setState({ option: 'history' })} >history</a>&nbsp;&nbsp;
                                        {
                                            // holder ?
                                        }
                                        <a className='style' style={{ cursor: 'pointer' }} onClick={() => this.setState({ option: 'swap' })} >swap</a>&nbsp;&nbsp;
                                        <a className='style' style={{ cursor: 'pointer' }} onClick={() => this.setState({ option: 'burn' })} >burn</a>&nbsp;&nbsp;
                                        <a className='style' style={{ cursor: 'pointer' }} onClick={() => this.setState({ option: 'transfer' })} >transfer</a>&nbsp;&nbsp;
                                    </span>
                                </div>
                            }
                            {
                                this.state.option === undefined || this.state.option === 'info' ? <div><br />
                                    {this.state.token[0].tokenMetaData.name ? <span>{this.state.token[0].tokenMetaData.name}<br /></span> : undefined}<br/>
                                    {this.state.token[0].tokenMetaData.description ? <span>{this.state.token[0].tokenMetaData.description}<br /></span> : undefined}<br />
                                    {this.state.token[0].tokenMetaData.mimeType ? <span>{this.state.token[0].tokenMetaData.mimeType}<br /></span> : undefined}
                                    <Royalties tokenId={this.state.token[0].tokenId} />
                                    {/* {this.state.token[0].attributes ? <span><br />{this.state.token[0].attributes.split(' ').map(e => <span><span className='tag'>{e}</span> </span>)}</span> : undefined } */}
                                </div> : undefined
                            }
                            {
                                this.state.option === 'book' ?
                                    <>
                                        <br/><br/>
                                        <table style={{ display: 'block' }}>
                                            <tbody>
                                                {/* <br /> */}
                                                {this.state.orders.map((e,i) => {
                                                    return (
                                                        <tr key={i}>
                                                            <td>{e.amount} ed.</td>
                                                            <td><a className='style' href={`#/${e.issuer}`}>{e.issuer.slice(0, 7)}...{e.issuer.slice(36, 42)}</a></td>
                                                            {/* <td><a className='button style' style={{ cursor: 'pointer' }} onClick={() => this.collect(e.swapId, e.value)}>collect for {e.value / 1000000000000000000} MATIC</a></td> */}
                                                            <td><Collect swapId={e.swapId} value={e.value / 1000000000000000000 }/></td>
                                                            {
                                                                e.issuer == this.context.account?.toLowerCase() ? <td><a className='button style' style={{ cursor: 'pointer' }} onClick={() => this.cancel(e.swapId)}>cancel</a></td> : undefined
                                                            }
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </>
                                    :
                                    undefined
                            }
                            {
                                this.state.option === 'history' ?
                                    <>
                                    <br/><br/>
                                    <table style={{ display: 'block' }}>
                                            <tbody>

                                            {
                                                this.state.history.map((e,i) => {
                                                    if (e.op == 0) {
                                                        return (
                                                                <tr key={i} style={{ width: '100%' }}>
                                                                    <td><a className="style" style={{ cursor: 'pointer' }} href={`https://polygonscan.com/tx/${e.id}`}>swap</a></td>
                                                                    <td>{new Date(parseInt(e.timestamp) * 1000).toUTCString()}</td>
                                                                    <td><a className="style" href={`#/${e.issuer}`}>{e.issuer.slice(0, 7)}...{e.issuer.slice(36, 42)}</a></td>
                                                                    <td>{e.amount} ed.</td>
                                                                    <td>{parseFloat(e.value / 1000000000000000000)} MATIC</td> 
                                                                </tr>
                                                        )
                                                    }
                                                    if (e.op == 1) {
                                                        return (
                                                            <tr key={i}>
                                                                <td><a className="style" style={{ cursor: 'pointer' }} href={`https://polygonscan.com/tx/${e.id}`}>trade</a></td>
                                                                <td>{new Date(parseInt(e.timestamp) * 1000).toUTCString()}</td>
                                                                <td><a className="style" href={`#/${e.seller}`}>{e.seller.slice(0, 7)}...{e.seller.slice(36, 42)}</a></td>
                                                                <td>{e.amount} ed.</td>
                                                                <td>{parseFloat(e.value / 1000000000000000000)} MATIC</td>
                                                                <td><a className="style" href={`#/${e.issuer}`}>{e.issuer.slice(0, 7)}...{e.issuer.slice(36, 42)}</a></td>
                                                            </tr>
                                                        )
                                                    }
                                                    if (e.op == 2) {
                                                        return (
                                                            <tr key={i}>
                                                                <td><a className="style" style={{ cursor: 'pointer' }} href={`https://polygonscan.com/tx/${e.id}`}>cancel</a></td>
                                                                <td>{new Date(parseInt(e.timestamp) * 1000).toUTCString()}</td>
                                                                <td><a className="style" href={`#/${e.issuer}`}>{e.issuer.slice(0, 7)}...{e.issuer.slice(36, 42)}</a></td>
                                                                <td>{e.amount} ed.</td>
                                                            </tr>
                                                        )
                                                    }

                                                    if (e.to == this.context.dummy.toLowerCase()) {
                                                        return (
                                                            <tr key={i}>
                                                                <td><a className="style" style={{ cursor: 'pointer' }} href={`https://polygonscan.com/tx/${e.id}`}>burn</a></td><td>{new Date(parseInt(e.timestamp) * 1000).toUTCString()}</td><td><a className="style" href={`#/${e.from}`}>{e.from.slice(0, 7)}...{e.from.slice(36, 42)}</a></td><td>{e.value} ed.</td>
                                                            </tr>
                                                        )
                                                    }
                                                    if (e.to != this.context.dummy.toLowerCase()) {
                                                        return (
                                                            <tr key={i}>
                                                                <td><a className="style" style={{ cursor: 'pointer' }} href={`https://polygonscan.com/tx/${e.id}`}>transfer</a></td><td>{new Date(parseInt(e.timestamp) * 1000).toUTCString()}</td><td><a className="style" href={`#/${e.from}`}>{e.from.slice(0, 7)}...{e.from.slice(36, 42)}</a></td><td>{e.value} ed.</td><td><a className="style" href={`#/${e.to}`}>{e.to.slice(0, 7)}...{e.to.slice(36, 42)}</a></td>
                                                            </tr>
                                                        )
                                                    }
                                                }
                                            )}
                                        {
                                            this.state.token.length != 0  ?
                                                    <tr>
                                                        <td><a className="style" href={`https://polygonscan.com/tx/${this.state.token[0].transactionHash}`}>minted</a></td>
                                                        <td>{new Date(parseInt(this.state.token[0].timestamp) * 1000).toUTCString()}</td>
                                                        <td><Royalties tokenId={this.state.token[0].tokenId} /></td>
                                                        {/* <td>     <Royalties tokenId={this.state.token[0].tokenId} /></td> */}
                                                    </tr>
                                                : undefined
                                            }
                                    </tbody>
                                    </table>
                                    </>
                                    :
                                    undefined
                            }
                            
                            {   /* limit to creator or holder */ this.state.option == 'swap' ? <Swap tokenId={this.state.token[0].tokenId} /> : undefined}
                            {this.state.option == 'burn' ? <Burn id={this.state.token[0].tokenId} /> : undefined}
                            {this.state.option == 'transfer' ? <Transfer id={this.state.token[0].tokenId} /> : undefined}
                            <br />
                            <a className='style' href={`https://cloudflare-ipfs.com/ipfs/${this.state.token[0].metaDataUri}`}>metadata</a>&nbsp;&nbsp;<a className='style' href={`https://ipfs.io/ipfs/${this.state.token[0].tokenMetaData.animation_url ? this.state.token[0].tokenMetaData.animation_url : this.state.token[0].tokenMetaData.image}`}>view on ipfs</a>
                        </div>
                        :
                        undefined
                }
                <br/>
            </div>
        )
    }
}