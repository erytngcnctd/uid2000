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

const metadata = async (acc) => {

    const APIURL = "https://api.thegraph.com/subgraphs/name/crzypatchwork/ungrund"

    const tokensQuery = `
    query 
      {
        assets (orderBy: timestamp,  orderDirection: desc, where : { available_not : "0", mimeType_not : "" }) {
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
    return data.data.assets

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

    componentWillMount = async () => {
        var aux = await metadata()
        aux = aux.map(async e => {
            if (e.mimeType?.split('/')[0] == 'text') {
                e.text = await axios.get(`https://ipfs.io/ipfs/${e.image.split('//')[1]}`).then(res => res.data)
                return e
            } else {
                return e
            }
        })


        Promise.all(aux).then(values => {
            this.setState({ arr: values, loading: false })
        })
    }

    render() {
        return (
            <div><br/>
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

                                                                                <audio controls>
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
            </div>
        )
    }

}