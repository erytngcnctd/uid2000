import axios from 'axios'
import React, { Component } from 'react'
import { createClient } from 'urql'
import { UngrundContext } from '../context/UngrundContext'
import { NFTStorage, File } from 'nft.storage'
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEY1NDdDNUIyMjMzMTc3MDZkZDdkODNEMjA4ODRkRDgxOTIxNTBiNEUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyODE5NTc4NTc2MSwibmFtZSI6InRlc3QifQ.RED_BCrWtUgodnbLxdFV5lKxVTPruv1Cg-bcDL7jtrI'

export class Mint extends Component {

    static contextType = UngrundContext

    state = {
        title: undefined,
        description: undefined,
        amount: undefined,
        royalties: undefined,
        file: undefined,
        result: undefined
    }

    handleChange = (e) => this.setState({ [e.target.name]: e.target.value })

    onFileUpload = (e) => this.setState({ file: e.target.files[0] })

    mint = async () => {

        const storage = new NFTStorage({ token: apiKey })
        const buffer = Buffer.from(await this.state.file.arrayBuffer())
        const cid = await storage.storeBlob(new Blob([buffer]))

        const obj = {
            name: this.state.title,
            description: this.state.description,
            image: `ipfs://${cid}`
        }


        const str = JSON.stringify(obj)
        const blob = new Blob([str], {
            type: "application/json"
        });
        
        const nft = await storage.storeBlob(blob)
        console.log(nft)
        let contract = new window.web3.eth.Contract(this.context.minterAbi, this.context.erc1155)
        let result = await contract.methods.mint(
          this.state.amount,
          this.state.royalties * 10,
          `ipfs://${nft}`
        ).send({ from: this.context.account })

        this.setState({ result : result })
    }

    render() {
        return (
            <div>
                <input type="text" placeholder="title" name="title" onChange={this.handleChange} /><br />
                <input type="text" placeholder="description" name="description" onChange={this.handleChange} /><br />
                <input type="text" placeholder="amount" name="amount" onChange={this.handleChange} /><br />
                <input type="text" placeholder="royalties" name="royalties" onChange={this.handleChange} /><br />
                <input type="file" name="file" onChange={this.onFileUpload} />
                <div>
                    <button onClick={this.mint}>mint</button>
                </div>
            </div>
        )
    }
}