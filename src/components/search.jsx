import { useContext, useState, useEffect } from 'react'
import { UngrundContext } from '../context/UngrundContext'
import { createClient, cacheExchange, fetchExchange } from 'urql'
import { Document, Page, pdfjs } from 'react-pdf'
import ReactMarkdown from 'react-markdown'
import { findHashtags } from 'find-hashtags'
import { _ } from 'lodash'
import axios from 'axios'
//  const findHashtags = require('find-hashtags')
// const _ = require('lodash')
// const axios = require('axios')

function toHex(d) {
    return (Number(d).toString(16)).slice(-2).toUpperCase()
}

// move to graph?
export const Search = () => {
    const { msg, setMsg, loading, setLoading } = useContext(UngrundContext)
    const [search, setSearch] = useState(undefined)
    const [subjkts, setSubjkts] = useState([])
    const [assets, setAssets] = useState([])

    useEffect(() => {
        const getInfo = async () => {
            //setSubjkts([])
            //setAssets([])

            let endpoint = `https://api.studio.thegraph.com/query/49421/uidgraph/v0.0.66`
                //available_not: "0"
            let description = `{
                tokens (orderBy: timestamp,  orderDirection: desc, where : { editions_gt: "0", tokenMetaData_: {mimeType_not: "",  description_contains_nocase : "${window.location.hash.split('/')[2]}"}}){
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

            let title = `{
                tokens (orderBy: timestamp,  orderDirection: desc, where : { editions_gt: "0", tokenMetaData_: {mimeType_not: "",  name_contains_nocase : "${window.location.hash.split('/')[2]}"}}){
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

            let subjkt = `{
                ungrundIds (where : { ungrundId_contains_nocase : "${window.location.hash.split('/')[2]}" }){
                id
                ungrundId
                }
            }
            `

            const client = createClient({
                url: endpoint,
                exchanges: [cacheExchange, fetchExchange]
            })

            let description_data = await client.query(description).toPromise()
            let title_data = await client.query(title).toPromise()
            let subjkt_data = await client.query(subjkt).toPromise()
            let uniq = _.uniqBy([...description_data.data.tokens, ...title_data.data.tokens], 'id')
            // console.log(description_data,title_data,subjkt_data)
            // console.log(uniq)
            setAssets(uniq)
            let aux = uniq.map(async e => {
                if (e.tokenMetaData?.mimeType.split('/')[0] == 'text') {
                    e.text = await axios.get(`https://ipfs.io/ipfs/${e.tokenMetaData?.image.split('//')[1]}`).then(res => res.data)
                    return e
                } else {
                    return e
                }
            })
            await Promise.all(aux).then(values => values)
            setAssets(assets => [...assets, aux])
            setSubjkts(subjkt_data.data.ungrundIds)
        }
        getInfo()
        
    }, [])
// console.log(assets)
    return (
        
        <div>
            <br />
            {
                subjkts.length > 0 ?
                    subjkts.map((e,i) => {
                        return (
                            <div key={i}>
                                <a className='style' href={`#/${e.id}`}>{e.ungrundId}</a><br />
                            </div>
                        )
                    })
                    :
                    undefined
            }
            <div className="row">
                {
                    assets.length > 0 ?
                        assets.map((e,i) => {
                            {
                                return (
                                    <div key={i} className="column">
                                        {
                                            e.tokenMetaData?.mimeType.split('/')[0] == 'image' ?
                                                <a href={`#/asset/${toHex(e.id)}`}>
                                                    <img variant="top" src={`https://cloudflare-ipfs.com/ipfs/${e.tokenMetaData.image.split('//')[1]}`} />
                                                </a>
                                                :
                                                undefined
                                        }
                                        {
                                            e.tokenMetaData?.mimeType.split('/')[0] == 'text' ?
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
                                            e.tokenMetaData?.mimeType.split('/')[0] == 'video' ?
                                                <div>
                                                    <a href={`#/asset/${toHex(e.id)}`}>
                                                        <video autoPlay={"autoplay"} loop muted style={{ maxWidth: '50vw' }}>
                                                            <source src={`https://ipfs.io/ipfs/${e.tokenMetaData.animation_url.split('//')[1]}`}></source>
                                                        </video>
                                                    </a>
                                                </div> : undefined
                                        }
                                        {
                                            e.tokenMetaData?.mimeType.split('/')[0] == 'audio' ?
                                                <div>
                                                    <a href={`#/asset/${toHex(e.id)}`}>
                                                        <img src={`https://ipfs.io/ipfs/${e.tokenMetaData.image.split('//')[1]}`} />
                                                        <audio controls>
                                                            <source src={`https://ipfs.io/ipfs/${e.tokenMetaData.animation_url.split('//')[1]}`} />
                                                        </audio>
                                                    </a>
                                                </div> : undefined
                                        }
                                        {
                                            e.tokenMetaData?.mimeType == 'application/pdf' ?
                                                <div>
                                                    <a href={`#/asset/${toHex(e.id)}`}>
                                                        <Document
                                                            file={`https://cloudflare-ipfs.com/ipfs/${e.tokenMetaData.image.split('//')[1]}`}
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
                        :
                        undefined
                }
            </div>
        </div>
    )
}