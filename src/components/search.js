import { useContext, useState, useEffect } from 'react'
import { UngrundContext } from '../context/UngrundContext'
import { createClient } from 'urql'
import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack'
import ReactMarkdown from 'react-markdown'

const findHashtags = require('find-hashtags')
const _ = require('lodash')
const axios = require('axios')

function toHex(d) {
    return (Number(d).toString(16)).slice(-2).toUpperCase()
}

export const Search = () => {

    const { msg, setMsg, loading, setLoading } = useContext(UngrundContext)
    const [search, setSearch] = useState(undefined)
    const [subjkts, setSubjkts] = useState([])
    const [assets, setAssets] = useState([])

    useEffect(async () => {

        //setSubjkts([])
        //setAssets([])

        let endpoint = `https://api.thegraph.com/subgraphs/name/crzypatchwork/ungrund`

        let description = `{
            assets (where : { description_contains_nocase : "${window.location.hash.split('/')[2]}" }){
              id
              metadata
              image
              animation
              mimeType
            }
          }`

        let title = `{
            assets (where : { title_contains_nocase : "${window.location.hash.split('/')[2]}" }){
              id
              metadata
              image
              animation
              mimeType
            }
          }`

        let subjkt = `
        {
            ungrundIDs (where : { ungrundId_contains_nocase : "${window.location.hash.split('/')[2]}" }){
              id
              ungrundId
            }
          }
        `

        const client = createClient({
            url: endpoint
        })

        let description_data = await client.query(description).toPromise()
        let title_data = await client.query(title).toPromise()
        let subjkt_data = await client.query(subjkt).toPromise()

        setAssets(_.uniqBy([...description_data.data.assets, ...title_data.data.assets], 'id'))
/*         let aux = _.uniqBy([...description_data.data.assets, ...title_data.data.assets], 'id').map(async e => {
            if (e.mimeType?.split('/')[0] == 'text') {
                e.text = await axios.get(`https://ipfs.io/ipfs/${e.image.split('//')[1]}`).then(res => res.data)
                return e
            } else {
                return e
            }
        })
        setAssets(aux) */
        console.log(assets)
        setSubjkts(subjkt_data.data.ungrundIDs)

    }, [])

    return (
        <div>
            <br />
            {
                subjkts.length > 0 ?
                    subjkts.map(e => {
                        return (
                            <div>
                                <a class='style' href={`#/${e.id}`}>{e.ungrundId}</a><br />
                            </div>
                        )
                    })
                    :
                    undefined
            }
            <div class="row">
                {
                    assets.length > 0 ?
                        assets.map(e => {
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
                                                        <audio controls>
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
                        :
                        undefined
                }
            </div>
        </div>
    )
}