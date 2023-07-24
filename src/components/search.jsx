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

export const Search = () => {

    const { msg, setMsg, loading, setLoading } = useContext(UngrundContext)
    const [search, setSearch] = useState(undefined)
    const [subjkts, setSubjkts] = useState([])
    const [assets, setAssets] = useState([])

    useEffect(() => {
        const getInfo = async () => {
            //setSubjkts([])
            //setAssets([])

            let endpoint = `https://api.studio.thegraph.com/query/49421/uidgraph/v0.0.56`
                //available_not: "0"
            let description = `{
                uris (orderBy: timestamp,  orderDirection: desc, where : { description_contains_nocase : "${window.location.hash.split('/')[2]}", tokenMetaData_: {mimeType_not: ""}}){
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

            let title = `{
                uris (orderBy: timestamp,  orderDirection: desc, where : { title_contains_nocase : "${window.location.hash.split('/')[2]}", tokenMetaData_: {mimeType_not: ""}}){
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

            console.log(_.uniqBy([...description_data.data.uris, ...title_data.data.uris], 'tokenId'))
            setAssets(_.uniqBy([...description_data.data.uris, ...title_data.data.uris], 'tokenId'))
            let aux = _.uniqBy([...description_data.data.uris, ...title_data.data.uris], 'tokenId').map(async e => {
                if (e.tokenMetaData.mimeType?.split('/')[0] == 'text') {
                    e.text = await axios.get(`https://ipfs.io/ipfs/${e.tokenMetaData.image.split('//')[1]}`).then(res => res.data)
                    return e
                } else {
                    return e
                }
            })
            setAssets(aux)
            console.log(assets)
            setSubjkts(subjkt_data.data.ungrundIds)
        }
        getInfo()
    }, [])

    return (
        
        <div>
            <br />
            {
                subjkts.length > 0 ?
                    subjkts.map(e => {
                        return (
                            <div>
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
                        assets.map(e => {
                            {
                                return (
                                    <div className="column">
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
                                                    <a className='nostyle' href={`#/asset/${toHex(e.tokenId)}`}>
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
                                                            <source src={`https://ipfs.io/ipfs/${e.tokenMetaData.animation_url.split('//')[1]}`}></source>
                                                        </video>
                                                    </a>
                                                </div> : undefined
                                        }
                                        {
                                            e.tokenMetaData.mimeType?.split('/')[0] == 'audio' ?
                                                <div>
                                                    <a href={`#/asset/${toHex(e.tokenId)}`}>
                                                        <img src={`https://ipfs.io/ipfs/${e.tokenMetaData.image.split('//')[1]}`} />
                                                        <audio controls>
                                                            <source src={`https://ipfs.io/ipfs/${e.tokenMetaData.animation_url.split('//')[1]}`} />
                                                        </audio>
                                                    </a>
                                                </div> : undefined
                                        }
                                        {
                                            e.tokenMetaData.mimeType == 'application/pdf' ?
                                                <div>
                                                    <a href={`#/asset/${toHex(e.tokenId)}`}>
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