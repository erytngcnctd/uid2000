import axios from 'axios'
import React, { Component } from 'react'
import { createClient } from 'urql'
import { UngrundContext } from '../context/UngrundContext'

function toHex(d) {
    return  (Number(d).toString(16)).slice(-2).toUpperCase()
}

const metadata = async () => {

    const APIURL = "https://api.studio.thegraph.com/query/3323/erc1155/v1.2.2"

    const tokensQuery = `
    query 
      {
        metadataEntities {
          id
          metadata
          timestamp
          creator
          tokenId
          royalties
        }
    }
  `

    const client = createClient({
        url: APIURL
    });

    const data = await client.query(tokensQuery).toPromise();
    return data.data.metadataEntities

}

export class Feed extends Component {

    static contextType = UngrundContext
    state = {
        arr: [],
        loading: true
    }

    componentWillMount = async () => {

        var aux = await metadata()
        aux = aux.map(async e => {
            console.log(e)
            if (e.metadata != 'ipfs://undefined') {
            e.extra = await axios.get(`https://ipfs.io/ipfs/${e.metadata.split('//')[1]}`).then(res => res.data)
            return e
            }
        })
        Promise.all(aux).then(values => { 
            console.log(values)
            this.setState({ arr: values, loading: false }) 
        })
    }

    render() {
        return (
            <div>
                {
                    !this.state.loading ?
                        <div>
                            {
                                this.state.arr.map(e => {
                                    {    
                                        if (e !== undefined) {
                                        return (
                                            <div>
                                                <a href={`/token/${toHex(e.tokenId)}`}>
                                                    <img src={`https://ipfs.io/ipfs/${e.extra.image.split('//')[1]}`} />
                                                </a>
                                            </div>
                                        )} else {
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