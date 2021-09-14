import React, { Component } from 'react'
import { createClient } from 'urql'
import { UngrundContext } from '../context/UngrundContext'
import { Swap } from './swap'

const axios = require('axios')

export class Token extends Component {

    static contextType = UngrundContext

    state = {
        token: undefined,
        listings: undefined,
        loading: true
    }

    metadata = async (id) => {

        const APIURL = "https://api.studio.thegraph.com/query/3323/erc1155/v1.2.2"

        const tokensQuery = `
        query 
          {
            metadataEntities (where : { tokenId: ${id} }){
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

    listings = async (tokenId) => {

        let endpoint = `https://api.studio.thegraph.com/query/3323/objktswap/v0.0.1`
        let swapsQuery = `
            {
                swapEntities (where : { tokenId : ${tokenId} }) {
                  id
                  timestamp
                  issuer
                  swapId
                  tokenId
                  value
                  royalties
                  op
                }
              }
            `

        const client = createClient({
            url: endpoint
        })

        const data = await client.query(swapsQuery).toPromise()
        return data.data.swapEntities

    }


    componentWillMount = async () => {
        let tokenId = parseInt(window.location.pathname.split('/')[2], 16)
        let metadata = await this.metadata(tokenId)
        let aux = metadata.map(async e => {
            if (e.metadata != 'ipfs://undefined') {
                e.extra = await axios.get(`https://ipfs.io/ipfs/${e.metadata.split('//')[1]}`).then(res => res.data)
                return e
            }
        })


        let listings = await this.listings(tokenId)
        console.log('listings', listings)

        Promise.all(aux).then(values => {
            console.log('metadata', values)
            this.setState({ token: values, listings: listings, loading: false })
        })

    }

    collect = async (swapId, value) => {
        let contract = new window.web3.eth.Contract(this.context.swapAbi, this.context.swap)
        let result = await contract.methods.collect(swapId).send({ from : this.context.account, value : parseInt(value) })
        console.log(result)
    }

    render() {
        return (
            <div>
                {
                    !this.state.loading ?
                        <div>
                            <div>
                                <img src={`https://ipfs.io/ipfs/${this.state.token[0].extra.image.split('//')[1]}`} /><br />
                                {this.state.token[0].extra.name}<br />
                                {this.state.token[0].extra.description}
                                <Swap
                                    id={this.state.token[0].tokenId}
                                    creator={this.state.token[0].creator}
                                    royalties={this.state.token[0].royalties}
                                />
                            </div>
                            {
                                this.state.listings.length > 0 ?
                                <div>
                                    {
                                    this.state.listings.map(e => {
                                        if (e.op == 0) {
                                            return (
                                                <div>
                                                    <a onClick={() => this.collect(e.swapId, e.value)}>collect for {e.value} matic</a>
                                                </div>
                                            )
                                        }
                                    })
                                    }
                                </div>
                                : undefined
                            }
                        </div>
                        :
                        undefined
                }
            </div>
        )
    }
}