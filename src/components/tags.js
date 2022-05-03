import { useContext, useEffect, useState } from 'react'
import { UngrundContext } from '../context/UngrundContext'
const findHashtags = require('find-hashtags')

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
              image
              attributes
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