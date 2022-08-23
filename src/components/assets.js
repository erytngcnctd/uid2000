import axios from 'axios'
import { id } from 'ethers/lib/utils'
import React, { Component } from 'react'
import { createClient } from 'urql'
import { UngrundContext } from '../context/UngrundContext'
import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack'
import ReactMarkdown from 'react-markdown'

const _ = require('lodash')

function toHex(d) {
    return (Number(d).toString(16)).slice(-2).toUpperCase()
}

const assets = async (address) => {
    console.log(assets)
    const APIURL = "https://api.thegraph.com/subgraphs/name/crzypatchwork/ungrund"
    const tokensQuery = `query
    {
        assets(where: { from : "${address}", available_not : "0", mimeType_not : "" }, orderBy: timestamp,  orderDirection: desc) {
                  id
                  mimeType
                  image
                  animation
                  metadata
                  from
                  timestamp
        }
    }`

    const client = createClient({
        url: APIURL
    })

    const data = await client.query(tokensQuery).toPromise();
    return data.data?.assets

}

const collection = async (address, creations) => {

    const APIURL = "https://api.thegraph.com/subgraphs/name/crzypatchwork/ungrund"

    const from = `query
    {
        transfers(where: { from : "${address}" }) {
                  id
                  value
                  from
                  tokenId
                  to
        }
    }`

    const to = `query
    {
        transfers(where: { to : "${address}" }) {
                  id
                  value
                  tokenId
                  from
                  to
        }
    }`

    const client = createClient({
        url: APIURL
    })

    let _out = (await client.query(from).toPromise()).data.transfers
    let _in = (await client.query(to).toPromise()).data.transfers

    // remove creations

    _in = _in.filter(e => e.from != "0x0000000000000000000000000000000000000000" && !creations.map(e => e.id).includes(e.tokenId))

    _in.map(e => e.value = Number(e.value))
    console.log(_in)

    _out.map(e => e.value = Number(e.value))
    console.log(_out)

    // filter market/burn/secondary

    let id_in = _in.map(e => e.tokenId)

    // in - out + on sale
    console.log(JSON.stringify(id_in))

    const metadata = `query
    {
        assets ( where : { id_in : ${JSON.stringify(id_in)}, mimeType_not : "" }, orderBy: timestamp,  orderDirection: desc) {
          metadata
          id
          animation
          mimeType
          image
        }
    }`

    return (await client.query(metadata).toPromise()).data.assets

}

const getID = async (id) => {
    const APIURL = "https://api.thegraph.com/subgraphs/name/crzypatchwork/ungrund"
    console.log(decodeURI(id))
    const transfers = `query
    {
        ungrundIDs (where: { id : "${encodeURI(id)}" }) {
                  id
                  metadata
                  description
                  ungrundId
        }
    }`

    const client = createClient({
        url: APIURL
    })


    let res = (await client.query(transfers).toPromise()).data
    return res.ungrundIDs[0]
}

const ungrundID = async (uid) => {
    const APIURL = "https://api.thegraph.com/subgraphs/name/crzypatchwork/ungrund"
    const transfers = `query
    {
        ungrundIDs (where: { ungrundId : "${uid}" }) {
                  id
                  metadata
                  description
                  ungrundId
        }
    }`

    const client = createClient({
        url: APIURL
    });


    let res = (await client.query(transfers).toPromise()).data
    return res.ungrundIDs[0]
}

export class Assets extends Component {

    static contextType = UngrundContext

    state = {
        loading: true,
        creations: [],
        collection: [],
        arr: [],
        aux: [],
        uid: undefined, // ungrund id
        id: undefined, // wallet
        description: undefined,
        offset: 0,
        section: undefined
    }

    componentWillMount = async () => {
        let aux
        let uid = await ungrundID(window.location.hash.split('/')[1])
        console.log(uid)
        uid?.id == undefined ? aux = await assets(window.location.hash.split('/')[1]) : aux = await assets(uid.id)
        if (uid?.id == undefined) uid = await getID(window.location.hash.split('/')[1])
        //window.location.hash = uid.ungrundId
        this.setState({
            uid: uid?.ungrundId ? uid.ungrundId : undefined,
            description: uid?.description ? uid.description : undefined,
            id: uid?.id ? uid.id : window.location.hash.split('/')[1],
            loading: false
        })

        aux = await aux.map(async e => {
            if (e.mimeType?.split('/')[0] == 'text') e.text = await axios.get(`https://ipfs.io/ipfs/${e.image.split('//')[1]}`).then(res => res.data)
            return e
        })

        Promise.all(aux).then(values => {
            console.log(values)
            this.setState({ arr: values.slice(this.state.offset, this.state.offset + 8), aux: values, creations: values, loading: false })
        })

    }

    setCreations = async id => {
        this.setState({ loading: true })

        let aux = await assets(id)

        aux = await aux.map(async e => {
            if (e.mimeType?.split('/')[0] == 'text') e.text = await axios.get(`https://ipfs.io/ipfs/${e.image.split('//')[1]}`).then(res => res.data)
            return e
        })

        Promise.all(aux).then(values => {
            this.setState({ arr: values.slice(this.state.offset, this.state.offset + 8), aux: values, loading: false })
        })

    }

    setCollection = async id => {
        this.setState({ loading: true })

        let aux = await collection(id, this.state.creations)

        aux = await aux.map(async e => {
            if (e.mimeType?.split('/')[0] == 'text') e.text = await axios.get(`https://ipfs.io/ipfs/${e.image.split('//')[1]}`).then(res => res.data)
            return e
        })

        Promise.all(aux).then(values => {
            this.setState({ arr: values.slice(this.state.offset, this.state.offset + 8), aux: values, loading: false })
        })

    }

    next = async () => {
        this.setState({ loading: true })
        this.setState({ arr: this.state.aux.slice(this.state.offset + 8, this.state.offset + 16), loading: false })
        this.setState({ offset: this.state.offset + 8, loading: false })
    }

    previous = async () => {
        this.setState({ loading: true })
        this.setState({ arr: this.state.aux.slice(this.state.offset - 8, this.state.offset) })
        this.setState({ offset: this.state.offset - 8, loading: false })
    }

    render() {
        return (
            <div><br />
                <div>
                    {
                        !this.state.loading ?
                            <div>
                                {
                                    this.state.uid ?
                                        <span><a class="style" href={`https://polygonscan.com/address/${this.state.id}`}>{this.state.uid}</a><span> {this.state.description}</span></span>
                                        :
                                        <a class="style" href={`https://polygonscan.com/address/${this.state.id}`}>{this.state.id.slice(0, 7)}...{this.state.id.slice(36, 42)}</a>
                                }
                                <div><br />
                                    <a class="style" style={{ cursor: 'pointer' }} onClick={() => { this.setCreations(this.state.id); this.setState({ section: 'creations' }); this.setState({ offset: 0 }) }}>creations</a>&nbsp;&nbsp;
                                    <a class="style" style={{ cursor: 'pointer' }} onClick={() => { this.setCollection(this.state.id); this.setState({ section: 'collection' }); this.setState({ offset: 0 }) }}>collection</a>
                                </div>
                                <div class="row">
                                    {
                                        this.state.arr.map(e => {
                                            {
                                                return (
                                                    <div class="column">
                                                        {
                                                            e.mimeType?.split('/')[0] == 'image' ?
                                                                <a href={`#/asset/${toHex(e.id)}`}>
                                                                    <img variant="top" src={`https://cloudflare-ipfs.com/ipfs/${e.image.split('//')[1]}`} />
                                                                </a>
                                                                :
                                                                undefined
                                                        }
                                                        {
                                                            e.mimeType?.split('/')[0] == 'text' ?
                                                                <div class='txt' style={{ maxWidth: '50vw' }}>
                                                                    <a class='nostyle' href={`#/asset/${toHex(e.id)}`}>
                                                                        <ReactMarkdown>
                                                                            {e.text}
                                                                        </ReactMarkdown>
                                                                    </a>
                                                                </div>
                                                                : undefined
                                                        }
                                                        {
                                                            e.mimeType?.split('/')[0] == 'video' ?
                                                                <div>
                                                                    <a href={`#/asset/${toHex(e.id)}`}>
                                                                        <video autoPlay={"autoplay"} loop muted style={{ maxWidth: '50vw' }}>
                                                                            <source src={`https://ipfs.io/ipfs/${e.animation.split('//')[1]}`}></source>
                                                                        </video>
                                                                    </a>
                                                                </div> : undefined
                                                        }
                                                        {
                                                            e.mimeType?.split('/')[0] == 'audio' ?
                                                                <div>
                                                                    <a href={`#/asset/${toHex(e.id)}`}>
                                                                        <img src={`https://ipfs.io/ipfs/${e.image.split('//')[1]}`} />
                                                                        <audio controls style={{ width: '100%' }}>
                                                                            <source src={`https://ipfs.io/ipfs/${e.animation.split('//')[1]}`} />
                                                                        </audio>
                                                                    </a>
                                                                </div> : undefined
                                                        }
                                                        {
                                                            e.mimeType == 'application/pdf' ?
                                                                <div>
                                                                    <a href={`#/asset/${toHex(e.id)}`}>
                                                                        <Document
                                                                            file={`https://cloudflare-ipfs.com/ipfs/${e.image.split('//')[1]}`}
                                                                        >
                                                                            <Page pageNumber={1} />
                                                                        </Document>
                                                                    </a>
                                                                </div>
                                                                : undefined
                                                        }
                                                    </div>
                                                )
                                            }
                                        })
                                    }
                                </div>
                                <>
                                    <span style={{ marginLeft : '45%', position : 'absolute' }}>
                                        {
                                            this.state.offset != 0 ?
                                                <a class='style' onClick={this.previous} style={{ cursor: 'pointer' }}>
                                                    &#60;&#60;&#60;
                                                </a>
                                                :
                                                undefined
                                        }
                                        &nbsp;
                                        {
                                            this.state.arr.length == 8?
                                                <a class='style' onClick={this.next} style={{ cursor: 'pointer' }}>
                                                    &#62;&#62;&#62;
                                                </a>
                                                :
                                                undefined
                                        }
                                        <br />
                                    </span>
                                </>
                            </div>
                            :
                            undefined
                    }
                </div>
            </div>
        )
    }
}