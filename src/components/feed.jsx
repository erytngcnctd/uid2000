import React, { Component } from 'react'
import { UngrundContext } from '../context/UngrundContext'
// import { Document, Page, Thumbnail, pdfjs } from 'react-pdf'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { createClient, cacheExchange, fetchExchange } from 'urql/core'
// import { Navigate } from "react-router-dom"
import { Loading } from './load'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'
import '../App.css'


function toHex(d) {
    return (Number(d).toString(16)).slice(-2).toUpperCase()
}
const metadata = async (offset) => {
    const APIURL = "https://api.studio.thegraph.com/query/49421/uidgraph/v0.0.66"
    const tokensQuery = `
    query 
      {
        tokens(first : 8, skip : ${offset}, where : {tokenMetaData_: {mimeType_not_in: ["application/pdf", "text/plain"]}, editions_gt: "0"}, orderBy: timestamp,  orderDirection: desc ) {
            id
            tokenMetaData {
              mimeType
              image
              animation_url
            }
            metaDataUri
            creator
        }
    }`

    const client = createClient({
        url: APIURL,
        exchanges: [cacheExchange, fetchExchange]
    });
    const data = await client.query(tokensQuery).toPromise();
    // console.log('d',data?.data?.tokens)
    let assets = data?.data?.tokens
    assets = assets?.map(async e => {
        if (e.tokenMetaData.mimeType?.split('/')[0] == 'text') {
            e.text = await axios.get(`https://cloudflare-ipfs.com/ipfs/${e.tokenMetaData.image.split('//')[1]}`).then(res => res.data)
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
        // pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
        // pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        //     'pdfjs-dist/build/pdf.worker.min.js',
        //     import.meta.url,
        //   ).toString();
    }

    state = {
        arr: [],
        loading: true,
        pdf: false,
        offset: 0,
        mediaLoadedCount: 0
    }

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

    async componentDidMount() {
        await this.loadMetadataAndMedia();
    }

    loadMetadataAndMedia = async () => {
        const arr = await metadata(this.state.offset);
        this.setState({ arr }, () => {
            this.loadMedia();
        });
    }

    loadMedia = () => {
        const { arr } = this.state;
        let loadedMediaCount = 0;

        arr.forEach(e => {
            const mediaElement = e.tokenMetaData.mimeType.split('/')[0] === 'image' ? new Image() : document.createElement('video');

            mediaElement.onload = () => {
                loadedMediaCount++;
                if (loadedMediaCount === arr.length) {
                    this.setState({ loading: false });
                }
            };

            if (e.tokenMetaData.mimeType.split('/')[0] === 'image') {
                mediaElement.src = `https://cloudflare-ipfs.com/ipfs/${e.tokenMetaData.image.split('//')[1]}`;
            } else if (e.tokenMetaData.mimeType.split('/')[0] === 'video') {
                mediaElement.src = `https://cloudflare-ipfs.com/ipfs/${e.tokenMetaData.animation_url?.split('//')[1]}`;
                mediaElement.setAttribute('preload', 'auto'); // Preload the video
                mediaElement.load(); // Load the video
            }
        });
    }

    render() {
        const { arr, loading } = this.state;

        return (
            <div>
                <br />
                {loading ? (
                    <Loading />
                ) : (
                    <div className='row'>
                        <br />
                        {arr.map(e => (
                            <div key={e.id} className='column'>
                                {e !== undefined && (
                                    <div>
                                        {e.tokenMetaData.mimeType && e.tokenMetaData.mimeType !== '' && (
                                            <div>
                                                {e.tokenMetaData.mimeType.split('/')[0] === 'image' && (
                                                    <a href={`#/asset/${toHex(e.id)}`}>
                                                        <img
                                                            src={`https://cloudflare-ipfs.com/ipfs/${e.tokenMetaData.image.split('//')[1]}`}
                                                        />
                                                    </a>
                                                )}
                                                {e.tokenMetaData.mimeType.split('/')[0] === 'video' && (
                                                    <div>
                                                        <a href={`#/asset/${toHex(e.id)}`}>
                                                            <video
                                                                autoPlay={"autoplay"}
                                                                loop
                                                                muted
                                                                style={{ maxWidth: '50vw' }}>
                                                                <source src={`https://cloudflare-ipfs.com/ipfs/${e.tokenMetaData.animation_url?.split('//')[1]}`}></source>
                                                            </video>
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <>
                    <div style={{ position: 'fixed', bottom: 0, left: '45%' }}>
                        {this.state.offset !== 0 && (
                            <a className='button style' onClick={this.previous} href='#/'>
                                &#60;&#60;&#60;
                            </a>
                        )}
                        &nbsp;
                        {this.state.arr.length !== 0 && (
                            <a className='button style' onClick={this.next} href='#/'>
                                &#62;&#62;&#62;
                            </a>
                        )}
                    </div>
                </>
            </div>
        )
    }
}