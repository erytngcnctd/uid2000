import { useContext, useEffect, useState } from 'react'
import { UngrundContext } from '../context/UngrundContext'
import { findHashTags } from 'find-hashtags'
// const findHashtags = require('find-hashtags')

export const Tags = () => {

    const { msg, setMsg, loading, setLoading } = useContext(UngrundContext)
    const [ tag, setTag ] = useState(undefined)

    useEffect( async () => {
        let tag = window.location.hash.split('/')[2]
        const APIURL = "https://api.thegraph.com/subgraphs/name/crzypatchwork/ungrund"

        
        const tokensQuery = `
        query 
          {
            assets (where : { id: }){
              id
              tokenMetadata {
                mimeType
                image
                animation
              }
              metaDataUri
              from
              timestamp
            }
        }
      `

        //const client = createClient({
        //    url: APIURL
        //});

        //const data = await client.query(tokensQuery).toPromise();
    }, [])

    return (
        <div>
            
        </div>
    )
}