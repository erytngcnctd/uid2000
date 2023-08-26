import axios from 'axios'
import React, { Component } from 'react'
import { createClient, cacheExchange, fetchExchange } from 'urql/core'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { UngrundContext } from '../context/UngrundContext'
// import { Document, Page, pdfjs } from 'react-pdf'
import ReactMarkdown from 'react-markdown'
import { Loading } from './load'
import { _ } from 'lodash'
// const _ = require('lodash')

function toHex(d) {
    return (Number(d).toString(16)).slice(-2).toUpperCase()
}

const assets = async (address) => {
    const APIURL = "https://api.studio.thegraph.com/query/49421/uidgraph/v0.0.66"
    // available_not : "0"
    const tokensQuery = `query
    {
        tokens(where: { editions_not : "0", creator : "${address}", tokenMetaData_: {mimeType_not: ""}}, orderBy: timestamp,  orderDirection: desc) {
                  id
                  tokenMetaData {
                    mimeType
                    image
                    animation_url
                  }
                  metaDataUri
                  creator
                  timestamp
        }
    }`

    const client = createClient({
        url: APIURL,
        exchanges: [cacheExchange, fetchExchange]
    })

    const data = await client.query(tokensQuery).toPromise();
    return data.data?.tokens

}

const collection = async (address, creations) => {

    const APIURL = "https://api.studio.thegraph.com/query/49421/uidgraph/v0.0.66"

    const from = `query
    {
        transfers(where: { from : "${address}" }) {
                  value
                  from
                  tokenId
                  to
        }
    }`

    const to = `query
    {
        transfers(where: { to : "${address}" }) {
                  value
                  tokenId
                  from
                  to
        }
    }`

    const client = createClient({
        url: APIURL,
        exchanges: [cacheExchange, fetchExchange]
    })

    let _out = (await client.query(from).toPromise()).data.transfers
    let _in = (await client.query(to).toPromise()).data.transfers

    // remove creations

    _in = _in.filter(e => e.from != "0x0000000000000000000000000000000000000000" && !creations.map(e => e.tokenId).includes(e.tokenId))

    _in.map(e => e.value = Number(e.value))
    // console.log(_in)

    _out.map(e => e.value = Number(e.value))
    // console.log(_out)

    // filter market/burn/secondary

    let id_in = _in.map(e => e.tokenId)

    // in - out + on sale
    // console.log(JSON.stringify(id_in))

    const metadata = `query
    {
        uris ( where : { tokenId_in : ${JSON.stringify(id_in)}, tokenMetaData_: {mimeType_not: ""} }, orderBy: timestamp,  orderDirection: desc) {
          metaDataUri
          tokenId
          tokenMetaData{
            animation_url
            mimeType
            image
          }
        }
    }`
    let data = await client.query(metadata).toPromise()
    // console.log('data', data)
    return data.data.uris

}

const getID = async (id) => {
    const APIURL = "https://api.thegraph.com/subgraphs/name/crzypatchwork/ungrund"
    // console.log(decodeURI(id))
    const transfers = `query
    {
        ungrundIds (where: { id : "${encodeURI(id)}" }) {
                  id
                  metaDataUri
                  uidMetaData {
                    description
                    image
                  }
                  ungrundId
        }
    }`

    const client = createClient({
        url: APIURL,
        exchanges: [cacheExchange, fetchExchange]
    })


    let res = (await client.query(transfers).toPromise()).data
    return res?.ungrundIds[0] || null
}

const ungrundID = async (id) => {
    const APIURL = "https://api.thegraph.com/subgraphs/name/crzypatchwork/ungrund"
    const uids = `query
    {
        ungrundIds (where: { id : "${encodeURI(id)}" }) {
                  id
                  metaDataUri
                  uidMetaData {
                    description
                    image
                  }
                  ungrundId
        }
    }`

    const client = createClient({
        url: APIURL,
        exchanges: [cacheExchange, fetchExchange]
    });


    let res = (await client.query(uids).toPromise()).data
    return res?.ungrundIds[0] || null
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
        // console.log(uid)
        uid?.id == undefined ? aux = await assets(window.location.hash.split('/')[1]) : aux = await assets(uid.id)
        if (uid?.id == undefined) uid = await getID(window.location.hash.split('/')[1])
        //window.location.hash = uid.ungrundId
        this.setState({
            uid: uid?.ungrundId ? uid.ungrundId : undefined,
            description: uid?.uidMetaData.description ? uid.uidMetaData.description : undefined,
            id: uid?.id ? uid.id : window.location.hash.split('/')[1]
        })

        // console.log(aux)
        aux = await aux.map(async e => {
            if (e.tokenMetaData.mimeType?.split('/')[0] == 'text') e.text = await axios.get(`https://cloudflare-ipfs.com/ipfs/${e.tokenMetaData.image.split('//')[1]}`).then(res => res.data)
            return e
        })

        Promise.all(aux).then(values => {
            // console.log(values)
            this.setState({ arr: values.slice(this.state.offset, this.state.offset + 8), aux: values, creations: values, loading: false })
        })

    }

    setCreations = async id => {
        this.setState({ loading: true })

        let aux = await assets(id)
console.log(aux)
        aux = await aux.map(async e => {
            if (e.tokenMetaData.mimeType?.split('/')[0] == 'text') e.text = await axios.get(`https://cloudflare-ipfs.com/ipfs/${e.tokenMetadata.image.split('//')[1]}`).then(res => res.data)
            return e
        })

        Promise.all(aux).then(values => {
            // console.log(values)
            this.setState({ arr: values.slice(this.state.offset, this.state.offset + 8), aux: values, loading: false })
        })

    }

    setCollection = async id => {
        this.setState({ loading: true })

        let aux = await collection(id, this.state.creations)

        aux = await aux.map(async e => {
            if (e.tokenMetaData.mimeType?.split('/')[0] == 'text') e.text = await axios.get(`https://cloudflare-ipfs.com/ipfs/${e.tokenMetaData.image.split('//')[1]}`).then(res => res.data)
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
                                        <span><a className="style" href={`https://polygonscan.com/address/${this.state.id}`}>{this.state.uid}</a><span> {this.state.description}</span></span>
                                        :
                                        <a className="style" href={`https://polygonscan.com/address/${this.state.id}`}>{this.state.id.slice(0, 7)}...{this.state.id.slice(36, 42)}</a>
                                }
                                <div><br />
                                    <a className="style" style={{ cursor: 'pointer' }} onClick={() => { this.setCreations(this.state.id); this.setState({ section: 'creations' }); this.setState({ offset: 0 }) }}>creations</a>&nbsp;&nbsp;
                                    <a className="style" style={{ cursor: 'pointer' }} onClick={() => { this.setCollection(this.state.id); this.setState({ section: 'collection' }); this.setState({ offset: 0 }) }}>collection</a>
                                </div>
                                <div className="row">
                                    {
                                        this.state.arr.map(e => {
                                            {
                                                return (
                                                    <div key={e.tokenId || e.id} className="column">
                                                        {
                                                            e.tokenMetaData.mimeType?.split('/')[0] == 'image' ?
                                                                <a href={`#/asset/${toHex(e.tokenId || e.id)}`}>
                                                                    <LazyLoadImage
                                                                        placeholder={<Loading />}
                                                                        src={`https://cloudflare-ipfs.com/ipfs/${e.tokenMetaData.image.split('//')[1]}`} 
                                                                    />
                                                                </a>
                                                                :
                                                                undefined
                                                        }
                                                        {
                                                            e.tokenMetaData.mimeType?.split('/')[0] == 'text' ?
                                                                <div className='txt' style={{ maxWidth: '50vw' }}>
                                                                    <a className='nostyle' href={`#/asset/${toHex(e.tokenId || e.id)}`}>
                                                                        <ReactMarkdown>
                                                                            {e.text}
                                                                        </ReactMarkdown>
                                                                    </a>
                                                                </div>
                                                                : undefined
                                                        }
                                                        {
                                                            e.tokenMetaData.mimeType?.split('/')[0] == 'video' ?
                                                                <div>
                                                                    <a href={`#/asset/${toHex(e.tokenId || e.id)}`}>
                                                                        <video autoPlay={"autoplay"} loop muted style={{ maxWidth: '50vw' }}>
                                                                            <source src={`https://cloudflare-ipfs.com/ipfs/${e.tokenMetaData.animation_url.split('//')[1]}`}></source>
                                                                        </video>
                                                                    </a>
                                                                </div> : undefined
                                                        }
                                                        {
                                                            e.tokenMetaData.mimeType?.split('/')[0] == 'audio' ?
                                                                <div>
                                                                    <a href={`#/asset/${toHex(e.tokenId || e.id)}`}>
                                                                        <LazyLoadImage
                                                                            placeholder={<Loading />}
                                                                            src={`https://cloudflare-ipfs.com/ipfs/${e.tokenMetaData.image.split('//')[1]}`} 
                                                                        /><br/>
                                                                        <audio controls style={{ width: '100%' }}>
                                                                            <source src={`https://cloudflare-ipfs.com/ipfs/${e.tokenMetaData.animation_url.split('//')[1]}`} />
                                                                        </audio>
                                                                    </a>
                                                                </div> : undefined
                                                        }
                                                        {
                                                            // e.tokenMetaData.mimeType == 'application/pdf' ?
                                                            //     <div>
                                                            //         <a href={`#/asset/${toHex(e.tokenId || e.id)}`}>
                                                            //             <Document
                                                            //                 file={`https://cloudflare-ipfs.com/ipfs/${e.tokenMetaData.image.split('//')[1]}`}
                                                            //             >
                                                            //                 <Page pageNumber={1} />
                                                            //             </Document>
                                                            //         </a>
                                                            //     </div>
                                                            //     : undefined
                                                        }
                                                    </div>
                                                )
                                            }
                                        })
                                    }
                                </div>
                            </div>
                            :
                            undefined
                    }
                    <>
                        <span style={{ marginLeft: '45%', position: 'absolute' }}>
                            {
                                this.state.offset != 0 ?
                                    <a className='style' onClick={this.previous} style={{ cursor: 'pointer' }}>
                                        &#60;&#60;&#60;
                                    </a>
                                    :
                                    undefined
                            }
                            &nbsp;
                            {
                                this.state.arr.length == 8 ?
                                    <a className='style' onClick={this.next} style={{ cursor: 'pointer' }}>
                                        &#62;&#62;&#62;
                                    </a>
                                    :
                                    undefined
                            }
                            <br />
                        </span>
                    </>
                </div>
            </div>
        )
    }
}