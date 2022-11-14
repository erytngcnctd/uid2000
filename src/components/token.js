import "../App.css"
import React, { Component } from 'react'
import { createClient } from 'urql'
import { UngrundContext } from '../context/UngrundContext'
import { Swap } from './swap'
import { Burn } from './burn'
import { Transfer } from './transfer'
import { Card, CardGroup } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'

var Contract = require('web3-eth-contract')
const axios = require('axios')
const Web3 = require('web3')
const _ = require('lodash')
// pagination https://thegraph.com/docs/en/developer/distributed-systems/

function toHex(d) {
    return (Number(d).toString(16)).slice(-2).toUpperCase()
}

export class Token extends Component {

    static contextType = UngrundContext

    state = {
        token: undefined,
        listings: undefined,
        loading: true,
        royalties: undefined,
        market: undefined,
        orders: undefined,
        flag: false
    }

    metadata = async (id) => {

        const APIURL = "https://api.thegraph.com/subgraphs/name/crzypatchwork/ungrund"

        const tokensQuery = `
        query 
          {
            assets (where : { id: ${id} }){
              id
              metadata
              mimeType
              image
              attributes
              hash
              animation
              title
              description
              timestamp
              from
              available
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
            url: APIURL
        });

        const data = await client.query(tokensQuery).toPromise();
        console.log(data)
        let tks = _.filter(_.filter(data.data.transfers, { from: "0x0000000000000000000000000000000000000000" }), { tokenId: String(id) })
        let burn = _.filter(_.filter(data.data.transfers, { to: this.context.dummy }), { tokenId: String(id) })
        console.log(data.data.transfers)
        console.log(burn)
        burn.map(e => e.amount = Number(e.amount))
        //console.log(tks.map(e => e._value = Number(e._value)))
        console.log(tks)
        this.setState({ editions: _.sumBy(parseInt(tks), 'value') - _.sumBy(parseInt(burn), 'value') })
        console.log(this.state)
        return data.data

    }

    listings = async (tokenId) => {

        let endpoint = `https://api.thegraph.com/subgraphs/name/crzypatchwork/ungrund`
        let swapsQuery = `
            {
                v1S (where : { tokenId : ${tokenId} }) {
                    id
                    erc1155
                    tokenId
                    swapId
                    timestamp
                    amount
                    value
                    op
                    issuer
                }
              }
            `

        const client = createClient({
            url: endpoint
        })

        const data = await client.query(swapsQuery).toPromise()
        console.log(data.data.v1S)

        return data.data.v1S

    }


    componentWillMount = async () => {

        Contract.setProvider(Web3.givenProvider);

        let tokenId = parseInt(window.location.hash.split('/')[2], 16)
        console.log(tokenId)
        // treat metadata/display options

        let metadata = await this.metadata(tokenId)
        console.log(metadata)
        let aux = metadata.assets.map(async e => {
            if (e.mimeType?.split('/')[0] == 'text') e.text = await axios.get(`https://ipfs.io/ipfs/${e.image.split('//')[1]}`).then(res => res.data)
            return e
        })

        let transfers = metadata.transfers
        transfers = transfers.filter(e => e.from != this.context.v1.toLowerCase() && e.to != this.context.v1.toLowerCase() && e.from != '0x0000000000000000000000000000000000000000')
        console.log(transfers)
        //let transfers = (_.filter(metadata.tokenTransfers, { _from: "0x0000000000000000000000000000000000000000" }))
        //transfers = [...transfers, ...(_.filter(metadata.tokenTransfers, { _to: this.context.dummy }))]
        //transfers.map(e => e.timestamp = e._timestamp)
        //console.log(transfers)
        let listings = await this.listings(tokenId)
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
        console.log(history)
        Promise.all(aux).then(async values => {
            console.log('metadata', values)
            this.context.token = values
            this.setState({ token: values, listings: listings.reverse(), orders: _.orderBy(orders, ['value'], ['asc']), history: history, loading: false })
        })

        let erc1155 = new Contract(this.context.erc1155Abi, this.context.erc1155)
        this.setState({ royalties: await erc1155.methods.royalties(tokenId).call() })

    }

    collect = async (swapId, value) => {
        let contract = new Contract(this.context.swapAbi, this.context.v1)
        console.log(swapId)
        try {
            let result = await contract.methods.collect(swapId, 1).send({ from: this.context.account, value: parseInt(value) })
            console.log(result)
        } catch (err) {
            console.log(err)
        }
    }

    cancel = async (swapId) => {
        let contract = new Contract(this.context.swapAbi, this.context.v1)
        try {
            let result = await contract.methods.cancelSwap(swapId).send({ from: this.context.account })
            console.log(result)
        } catch (err) {
            console.log(err)
        }
    }

    setOption = (option) => this.setState()

    holders = async (tokenId) => {

        const APIURL = "https://api.thegraph.com/subgraphs/name/crzypatchwork/ungrund"

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
            url: APIURL
        });


        let res = (await client.query(transfers).toPromise()).data.transfers
        console.log(res)
    }

    orderBook = async (tokenId) => {
        let res = await this.listings(parseInt(window.location.hash.split('/')[2], 16))
        console.log(res)
        res = res.map(e => e.amount = Number(e.amount))
        res = _.filter(res, { op: "0" })
        let available = _.sumBy(res, 'amount')
        this.holders(parseInt(window.location.hash.split('/')[2], 16))
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
                                    this.state.token[0].mimeType?.split('/')[0] == 'video' ?
                                        <div>
                                            <video controls autoPlay={"autoplay"} loop style={{ maxWidth: '50vw' }} >
                                                <source src={`https://cloudflare-ipfs.com/ipfs/${this.state.token[0].animation.split('//')[1]}`}></source>
                                            </video>
                                        </div> : undefined
                                }
                                {
                                    this.state.token[0].mimeType?.split('/')[0] == 'image' ?
                                        <img variant="top" src={`https://cloudflare-ipfs.com/ipfs/${this.state.token[0].image.split('//')[1]}`} />
                                        :
                                        undefined
                                }
                                {
                                    this.state.token[0].mimeType?.split('/')[0] == 'text' ?
                                        <div class="txt" style={{ maxWidth: '50vw' }}>
                                            <ReactMarkdown>
                                                {this.state.token[0].text}
                                            </ReactMarkdown>
                                        </div>

                                        : undefined
                                }
                                {
                                    this.state.token[0].mimeType?.split('/')[1] == 'pdf' ?
                                        <iframe
                                            title="ungrund PDF renderer"
                                            src={`https://cloudflare-ipfs.com/ipfs/${this.state.token[0].image.split('//')[1]}#zoom=100`}
                                            loading="lazy"
                                            sandbox
                                        />
                                        :
                                        undefined
                                }
                                {
                                    this.state.token[0].mimeType?.split('/')[0] == 'audio' ?
                                        <div style={{ maxWidth: '50vw' }}>
                                            <img src={`https://cloudflare-ipfs.com/ipfs/${this.state.token[0].image.split('//')[1]}`} /><br />
                                            <audio controls>
                                                <source src={`https://cloudflare-ipfs.com/ipfs/${this.state.token[0].animation.split('//')[1]}`} />
                                            </audio>
                                        </div> : undefined
                                }
                                <br />
                                {this.state.market == 0 ? <span>X</span> : <span>{this.state.market}</span>}/{this.state.token[0].available} ed.<br />
                                <a class='style' href={`#/${this.state.token[0].from}`}>{this.state.token[0].from.slice(0, 7)}...{this.state.token[0].from.slice(36, 42)}</a><br /><br />
                            </div>

                            {
                                this.state.orders.length > 0 ?
                                    <div>
                                        {

                                            this.state.orders.map((e, i) => {

                                                // smaller e.value
                                                if (i == 0) {
                                                    return (
                                                        <div>
                                                            <a class='button style' style={{ cursor: 'pointer' }} onClick={() => this.collect(e.swapId, e.value)}>collect for {e.value / 1000000000000000000} MATIC</a><br /><br />
                                                            {/*                                                             
                                                            {
                                                                e.issuer == this.context.account?.toLowerCase() ? <a class='button style' style={{ cursor: 'pointer' }} onClick={() => this.cancel(e.swapId)}>cancel</a> : undefined
                                                            } 
                                                            */}
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
                                        <a class='style' style={{ cursor: 'pointer' }} onClick={() => this.setState({ option: 'info' })}>info</a>&nbsp;&nbsp;
                                        <a class='style' style={{ cursor: 'pointer' }} onClick={() => { this.setState({ option: 'book' }); this.orderBook(this.state.token[0].tokenId) }} href='javascript:void(0);'>order book</a>&nbsp;&nbsp;
                                        <a class='style' style={{ cursor: 'pointer' }} onClick={() => this.setState({ option: 'history' })} href='javascript:void(0);'>history</a>&nbsp;&nbsp;
                                        {
                                            // holder ?
                                        }
                                        <a class='style' style={{ cursor: 'pointer' }} onClick={() => this.setState({ option: 'swap' })} href='javascript:void(0);'>swap</a>&nbsp;&nbsp;
                                        <a class='style' style={{ cursor: 'pointer' }} onClick={() => this.setState({ option: 'burn' })} href='javascript:void(0);'>burn</a>&nbsp;&nbsp;
                                        <a class='style' style={{ cursor: 'pointer' }} onClick={() => this.setState({ option: 'transfer' })} href='javascript:void(0);'>transfer</a>&nbsp;&nbsp;
                                    </span>
                                </div>
                            }
                            {
                                this.state.option === undefined || this.state.option === 'info' ? <div><br />
                                    {this.state.token[0].title ? <span>{this.state.token[0].title}<br /></span> : undefined}
                                    {this.state.token[0].description ? <span>{this.state.token[0].description}<br /></span> : undefined}
                                    {/* {this.state.token[0].attributes ? <span><br />{this.state.token[0].attributes.split(' ').map(e => <span><span class='tag'>{e}</span> </span>)}</span> : undefined } */}
                                </div> : undefined
                            }
                            {
                                this.state.option === 'book' ?
                                    <table style={{ display: 'block' }}>
                                        <br />
                                        {this.state.orders.map(e => {
                                            return (
                                                <tr>
                                                    <td>{e.amount} ed.</td>
                                                    <td><a class='style' href={`#/${e.issuer}`}>{e.issuer.slice(0, 7)}...{e.issuer.slice(36, 42)}</a><br /></td>
                                                    <td><a class='button style' style={{ cursor: 'pointer' }} onClick={() => this.collect(e.swapId, e.value)}>collect for {e.value / 1000000000000000000} MATIC</a></td>
                                                    {
                                                        e.issuer == this.context.account?.toLowerCase() ? <td><a class='button style' style={{ cursor: 'pointer' }} onClick={() => this.cancel(e.swapId)}>cancel</a></td> : undefined
                                                    }
                                                </tr>
                                            )
                                        })}
                                    </table> : undefined
                            }
                            {
                                this.state.option === 'history' ?
                                    <table style={{ display: 'block' }}><br />
                                        <div>
                                            {
                                                this.state.history.map(e => {
                                                    if (e.op == 0) {
                                                        return (
                                                            <div style={{ width: '100%' }}>
                                                                <tr>
                                                                    <td><a class="style" style={{ cursor: 'pointer' }} href={`https://polygonscan.com/tx/${e.id}`}>swap</a></td>
                                                                    <td>{new Date(parseInt(e.timestamp) * 1000).toUTCString()}</td>
                                                                    <td><a class="style" href={`#/${e.issuer}`}>{e.issuer.slice(0, 7)}...{e.issuer.slice(36, 42)}</a></td>
                                                                    <td>{e.amount} ed.</td>
                                                                    <td>{parseFloat(e.value / 1000000000000000000)} MATIC</td>
                                                                </tr>
                                                            </div>
                                                        )
                                                    }
                                                    if (e.op == 1) {
                                                        return (
                                                            <div>
                                                                <tr>
                                                                    <td><a class="style" style={{ cursor: 'pointer' }} href={`https://polygonscan.com/tx/${e.id}`}>trade</a></td>
                                                                    <td>{new Date(parseInt(e.timestamp) * 1000).toUTCString()}</td>
                                                                    <td><a class="style" href={`#/${e.seller}`}>{e.seller.slice(0, 7)}...{e.seller.slice(36, 42)}</a></td>
                                                                    <td>{e.amount} ed.</td>
                                                                    <td>{parseFloat(e.value / 1000000000000000000)} MATIC</td>
                                                                    <td><a class="style" href={`#/${e.issuer}`}>{e.issuer.slice(0, 7)}...{e.issuer.slice(36, 42)}</a></td>
                                                                </tr>
                                                            </div>
                                                        )
                                                    }
                                                    if (e.op == 2) {
                                                        return (
                                                            <div>
                                                                <tr>
                                                                    <td><a class="style" style={{ cursor: 'pointer' }} href={`https://polygonscan.com/tx/${e.id}`}>cancel</a></td>
                                                                    <td>{new Date(parseInt(e.timestamp) * 1000).toUTCString()}</td>
                                                                    <td><a class="style" href={`#/${e.issuer}`}>{e.issuer.slice(0, 7)}...{e.issuer.slice(36, 42)}</a></td>
                                                                    <td>{e.amount} ed.</td>
                                                                </tr>
                                                            </div>
                                                        )
                                                    }

                                                    if (e.to == this.context.dummy.toLowerCase()) {
                                                        return (
                                                            <div>
                                                                <tr>
                                                                    <td><a class="style" style={{ cursor: 'pointer' }} href={`https://polygonscan.com/tx/${e.id}`}>burn</a></td><td>{new Date(parseInt(e.timestamp) * 1000).toUTCString()}</td><td><a class="style" href={`#/${e.from}`}>{e.from.slice(0, 7)}...{e.from.slice(36, 42)}</a></td><td>{e.value} ed.</td>
                                                                </tr>
                                                            </div>
                                                        )
                                                    }
                                                    if (e.to != this.context.dummy.toLowerCase()) {
                                                        return (
                                                            <div>
                                                                <tr>
                                                                    <td>
                                                                        <a class="style" style={{ cursor: 'pointer' }} href={`https://polygonscan.com/tx/${e.id}`}>transfer</a></td><td>{new Date(parseInt(e.timestamp) * 1000).toUTCString()}</td><td><a class="style" href={`#/${e.from}`}>{e.from.slice(0, 7)}...{e.from.slice(36, 42)}</a></td><td>{e.value} ed.</td><td><a class="style" href={`#/${e.to}`}>{e.to.slice(0, 7)}...{e.to.slice(36, 42)}</a></td>
                                                                </tr>
                                                            </div>
                                                        )
                                                    }
                                                })
                                            }
                                        </div>
                                        {
                                            this.state.token.length != 0 ?
                                                <div>
                                                    <tr>
                                                        <td><a class="style" href={`https://polygonscan.com/tx/${this.state.token[0].hash}`}>minted</a></td>
                                                        <td>{new Date(parseInt(this.state.token[0].timestamp) * 1000).toUTCString()}</td>
                                                        <td>{this.state.royalties / 100}% royalties</td>
                                                    </tr>
                                                </div>
                                                : undefined
                                        }
                                    </table>
                                    :
                                    undefined
                            }
                            {   /* limit to creator or holder */ this.state.option == 'swap' ? <Swap id={this.state.token[0].id} /> : undefined}
                            {this.state.option == 'burn' ? <Burn id={this.state.token[0].id} /> : undefined}
                            {this.state.option == 'transfer' ? <Transfer id={this.state.token[0].id} /> : undefined}
                            <br />
                            <a class='style' href={`https://ipfs.io/ipfs/${this.state.token[0].metadata.split('//')[1]}`}>metadata</a>&nbsp;&nbsp;<a class='style' href={`https://ipfs.io/ipfs/${this.state.token[0].animation ? this.state.token[0].animation.split('//')[1] : this.state.token[0].image.split('//')[1]}`}>view on ipfs</a>
                        </div>
                        :
                        undefined
                }
            </div>
        )
    }
}