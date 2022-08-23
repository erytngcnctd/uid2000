import axios from 'axios'
import React, { Component } from 'react'
import { createClient } from 'urql'
import { UngrundContext } from '../context/UngrundContext'
import { Card, CardGroup, Row, Col } from 'react-bootstrap'
import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack'
import ReactMarkdown from 'react-markdown'
import '../App.css'
import { Grid } from '@react-css/grid'

function toHex(d) {
    return (Number(d).toString(16)).slice(-2).toUpperCase()
}

const metadata = async (offset) => {

    const APIURL = "https://api.thegraph.com/subgraphs/name/crzypatchwork/ungrund"

    const tokensQuery = `
    query 
      {
        assets (first : 8, skip : ${offset}, orderBy: timestamp,  orderDirection: desc, where : { available_not : "0", mimeType_not : "" }) {
            id
            metadata
            image
            mimeType
            animation
        }
    }`

    const client = createClient({
        url: APIURL
    });

    const data = await client.query(tokensQuery).toPromise();
    console.log(data.data.assets)
    let assets = data.data.assets
    assets = assets.map(async e => {
        if (e.mimeType?.split('/')[0] == 'text') {
            e.text = await axios.get(`https://ipfs.io/ipfs/${e.image.split('//')[1]}`).then(res => res.data)
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
                        <div class='row'><br />

                            {
                                this.state.arr.map(e => {
                                    {
                                        if (e !== undefined) {
                                            return (
                                                <div class='column'>
                                                    {
                                                        e.mimeType && e.mimeType != '' ?
                                                            <div>
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
                                                                {
                                                                    e.mimeType?.split('/')[0] == 'audio' ?
                                                                        <div>
                                                                            <a href={`#/asset/${toHex(e.id)}`}>
                                                                                <img src={`https://ipfs.io/ipfs/${e.image.split('//')[1]}`} /><br />

                                                                                <audio controls style={{ width: '100%' }}>
                                                                                    <source src={`https://ipfs.io/ipfs/${e.animation.split('//')[1]}`} />
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
                                <a class='style' onClick={this.previous} href='#/'>
                                    &#60;&#60;&#60;
                                </a>
                                :
                                undefined
                        }
                        &nbsp;
                        {
                            this.state.arr.length != 0 ?
                                <a class='style' onClick={this.next} href='#/'>
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