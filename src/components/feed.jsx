import axios from 'axios'
import React, { Component } from 'react'
import { createClient, cacheExchange, fetchExchange } from 'urql/core'
import { UngrundContext } from '../context/UngrundContext'
import { Document, Page, pdfjs } from 'react-pdf'
import ReactMarkdown from 'react-markdown'
import '../App.css'

function toHex(d) {
    return (Number(d).toString(16)).slice(-2).toUpperCase()
}
  // uris (first : 8, skip : ${offset}, orderBy: timestamp,  orderDirection: desc, where : { available_not : "0", mimeType_not : "" }) {
const metadata = async (offset) => {
    const APIURL = "https://api.studio.thegraph.com/query/49421/uidgraph/v0.0.56"
    const tokensQuery = `
    query 
      {
        uris (first : 8, skip : ${offset}, where : {tokenMetaData_: {mimeType_not: ""}} orderBy: timestamp,  orderDirection: desc ) {
            id
            tokenId
            tokenMetaData {
              mimeType
              image
              animation_url
            }
            metaDataUri
            from
            timestamp
        }
    }`

    const client = createClient({
        url: APIURL,
        exchanges: [cacheExchange, fetchExchange]
    });
    const data = await client.query(tokensQuery).toPromise();
    console.log('d',data?.data?.uris)
    let assets = data?.data?.uris
    assets = assets?.map(async e => {
        if (e.tokenMetaDatamimeType?.split('/')[0] == 'text') {
            e.text = await axios.get(`https://cloudflare-ipfs.com/ipfs/${e.image.split('//')[1]}`).then(res => res.data)
            return e
        } else {
            return e
        }
    })


    return await Promise.all(assets).then(values => values)
    //    this.setState({ arr: values, loading: false })
    //})

}

export class Feed extends Component {

    static contextType = UngrundContext

    constructor(props) {
        super(props);
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
    }

    state = {
        arr: [],
        loading: true,
        offset: 0
    }

    componentWillMount = async () => this.setState({ arr: (await metadata(this.state.offset)).slice(this.state.offset, this.state.offset + 8), loading: false })

    next = async () => {
        this.setState({ loading: true })
        this.setState({ arr: await metadata(this.state.offset + 8), loading: false })
        this.setState({ offset: this.state.offset + 8 })
    }

    previous = async () => {
        this.setState({ loading: true })
        this.setState({ arr: await metadata(this.state.offset - 8), loading: false })
        this.setState({ offset: this.state.offset - 8 })
    }

    render() {
        return (
            <div><br />
                {
                    !this.state.loading ?
                        <div className='row'><br />

                            {
                                this.state.arr.map(e => {
                                    {
                                        if (e !== undefined) {
                                            return (
                                                <div key={e.tokenId} className='column'>
                                                    {
                                                        e.tokenMetaData.mimeType && e.tokenMetaData.mimeType != '' ?
                                                            <div>
                                                                {
                                                                    e.tokenMetaData.mimeType?.split('/')[0] == 'image' ?
                                                                        <a href={`#/asset/${toHex(e.tokenId)}`}>
                                                                            <img variant="top" src={`https://cloudflare-ipfs.com/ipfs/${e.tokenMetaData.image.split('//')[1]}`} />
                                                                        </a>
                                                                        :
                                                                        undefined
                                                                }
                                                                {
                                                                    e.tokenMetaData.mimeType?.split('/')[0] == 'text' ?
                                                                        <div className='txt' style={{ maxWidth: '50vw' }}>
                                                                            <a className='nostyle' href={`#/asset/${toHex(e.id)}`}>
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
                                                                            <a href={`#/asset/${toHex(e.tokenId)}`}>
                                                                                <video autoPlay={"autoplay"} loop muted style={{ maxWidth: '50vw' }}>
                                                                                    <source src={`https://cloudflare-ipfs.com/ipfs/${e.animation_url?.split('//')[1]}`}></source>
                                                                                </video>
                                                                            </a>
                                                                        </div> : undefined
                                                                }
                                                                {
                                                                    e.tokenMetaData.mimeType == 'application/pdf' ?
                                                                        <div>
                                                                            <a href={`#/asset/${toHex(e.tokenId)}`}>
                                                                                <Document
                                                                                    file={`https://cloudflare-ipfs.com/ipfs/${e.image?.split('//')[1]}`}
                                                                                >
                                                                                    <Page pageNumber={1} />
                                                                                </Document>
                                                                            </a>
                                                                        </div>
                                                                        : undefined
                                                                }
                                                                {
                                                                    e.tokenMetaData.mimeType?.split('/')[0] == 'audio' ?
                                                                        <div>
                                                                            <a href={`#/asset/${toHex(e.tokenId)}`}>
                                                                                <img src={`https://cloudflare-ipfs.com/ipfs/${e.tokenMetaData.image.split('//')[1]}`} /><br />

                                                                                <audio controls style={{ width: '100%' }}>
                                                                                    <source src={`https://cloudflare-ipfs.com/ipfs/${e.tokenMetaData.animation_url.split('//')[1]}`} />
                                                                                </audio>
                                                                            </a>
                                                                        </div> : undefined
                                                                }
                                                            </div>
                                                            : undefined
                                                    }
                                                </div>
                                            )
                                        } else {
                                            return undefined
                                        }
                                    }
                                })
                            }
                        </div>
                        :
                        undefined
                }
                <>
                    <span style={{ marginLeft : '45%', position : 'absolute' }}>
                        {
                            this.state.offset != 0 ?
                                <a className='style' onClick={this.previous} href='#/'>
                                    &#60;&#60;&#60;
                                </a>
                                :
                                undefined
                        }
                        &nbsp;
                        {
                            this.state.arr.length != 0 ?
                                <a className='style' onClick={this.next} href='#/'>
                                    &#62;&#62;&#62;
                                </a>
                                :
                                undefined
                        }
                    </span><br /><br />
                </>
            </div>
        )
    }
}