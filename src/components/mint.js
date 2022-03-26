import axios from 'axios'
import React, { Component } from 'react'
import { createClient } from 'urql'
import { UngrundContext } from '../context/UngrundContext'
import { NFTStorage, File } from 'nft.storage'
import { create } from 'ipfs-http-client'
import { Loading } from './load'

var Contract = require('web3-eth-contract')
const Web3 = require('web3')
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEY1NDdDNUIyMjMzMTc3MDZkZDdkODNEMjA4ODRkRDgxOTIxNTBiNEUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyODE5NTc4NTc2MSwibmFtZSI6InRlc3QifQ.RED_BCrWtUgodnbLxdFV5lKxVTPruv1Cg-bcDL7jtrI'
const ls = require('local-storage')

export class Mint extends Component {

    static contextType = UngrundContext

    state = {
        title: undefined,
        description: undefined,
        amount: undefined,
        royalties: undefined,
        file: undefined,
        display: undefined,
        result: undefined,
        video: false
    }

    componentWillMount = async () => { }

    handleChange = e => this.setState({ [e.target.name]: e.target.value })

    onFileUpload = e => {
        this.setState({ file: e.target.files[0] })
        console.log(e.target.files[0].type)
        console.log(e.target.files[0].type !== undefined)
        if (e.target.files[0].type.split('/')[0] != 'image' && e.target.files[0].type.split('/')[0] != 'text' && e.target.files[0].type != 'application/pdf') this.setState({ video: true })
        console.log(this.state.video)
    }

    onDisplayUpload = e => this.setState({ display: e.target.files[0] })

    encrypt = async () => {

        // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
        // https://blog.secure-monkey.com/considerations-when-using-aes-gcm-for-encrypting-files/
        
        console.log(await this.state.file.arrayBuffer())
        console.log(ls.get('pk'))

        const pk = window.crypto.subtle.importKey('jwk', ls.get('pk'), {   //these are the algorithm options
            name: "RSA-OAEP",
            hash: { name: "SHA-256" }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
        },
            false, //whether the key is extractable (i.e. can be used in exportKey)
            ["encrypt"]).then(res => res)

        let encrypted = window.crypto.subtle.encrypt('RSA-OAEP', await pk, Buffer.from(await this.state.file.arrayBuffer())).then(res => res)

        console.log(await encrypted)
        console.log(ls.get('sk'))

        const sk = window.crypto.subtle.importKey('jwk', ls.get('sk'), {   //these are the algorithm options
            name: "RSA-OAEP",
            hash: { name: "SHA-256" }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
        },
            false, //whether the key is extractable (i.e. can be used in exportKey)
            ["decrypt"]).then(res => res)

        let decrypted = window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP",
                //label: Uint8Array([...]) //optional
            },
            await sk, //from generateKey or importKey above
            new Uint8Array(await encrypted) //ArrayBuffer of the data
        )
            .then(res => res)

        console.log(await decrypted)
        //console.log(Buffer.from((await new File([(await decrypted)], this.state.file.name, {type: this.state.file.type, lastModified: Date.now()}).arrayBuffer())))
        this.ipfsUpload(new File([(await decrypted)], this.state.file.name, { type: this.state.file.type, lastModified: Date.now() }))
        //Uint8Array

    }

    ipfsUpload = async (file) => {
        let infuraUrl = 'https://ipfs.infura.io:5001'
        let ipfs = create(infuraUrl)
        let hash = await ipfs.add(file)
        console.log(hash)
    }

    mint = async () => {

        this.context.setLoading(true)
        this.context.setMsg('preparing asset')

        let infuraUrl = 'https://ipfs.infura.io:5001'
        let ipfs = create(infuraUrl)

        let formData = new FormData()
        formData.append('file', this.state.file)
        let artifactBuffer = Buffer.from(await this.state.file.arrayBuffer())
        console.log(artifactBuffer.byteLength)

        let info = await ipfs.add(new File([artifactBuffer], this.state.file.name, { type: this.state.file.type }))
        console.log(info)
        //let file = Buffer.from(await this.state.file.arrayBuffer())
        //let cid = await ipfs.add(new Blob([file]))

        let obj = {}

        if (this.state.video) {
            let displayBuffer = Buffer.from(await this.state.display.arrayBuffer())
            let display = await ipfs.add(new File([displayBuffer], this.state.display.name, { type: this.state.display.type }))
            obj = {
                name: this.state.title,
                description: this.state.description,
                animation_url: `ipfs://${info.path}`,
                image: `ipfs://${display.path}`
            }
        } else {
            obj = {
                name: this.state.title,
                description: this.state.description,
                image: `ipfs://${info.path}`
            }
        }

        if (this.state.file.type != undefined) obj.mimeType = this.state.file.type

        let str = JSON.stringify(obj)
        let blob = new Blob([str], {
            type: "application/json"
        });

        let nft = await ipfs.add(blob)

        console.log('metadata', obj, 'nft', nft)
        // 2 

        /*         
        
                const client = new NFTStorage({ token: apiKey })
                console.log(this.state.file)
                 const metadata = await client.store({
                     name: this.state.title,
                     description: this.state.description,
                     image: new File([buffer], this.state.file.name, { type: this.state.file.type })
                    })
        
                console.log(metadata) */

        // 3 crzy

        /*         const cid = await ipfs.add(new Blob([buffer]))
                console.log(this.state.file)
                const obj = {
                    name: this.state.title,
                    description: this.state.description,
                    image: `ipfs://${cid.path}`,
                    mimeType: this.state.file.type
                }
        
                let metadata
        
                const str = JSON.stringify(obj)
                const blob = new Blob([str], {
                    type: "application/json"
                });
        
                const nft = await ipfs.add(blob) */
        //console.log(nft)
        Contract.setProvider(Web3.givenProvider);

        let contract = new Contract(this.context.minterAbi, this.context.erc1155)
        this.context.setMsg('awaiting op confirmation')
        try {
            let result = await contract.methods.mint(
                this.state.amount,
                this.state.royalties * 100,
                `ipfs://${nft.path}`
            ).send({ from: ls.get('account') })
            this.setState({ result: result })
            this.context.setLoading(false)
        } catch (err) {
            this.context.setLoading(false)
        }
    }

    render() {
        return (
            <div>
                {
                    ls.get('sync') ?
                        this.context.loading ?
                            <Loading />
                            :
                            <div>
                                <div>
                                    <input type="text" placeholder="title" name="title" onChange={this.handleChange} /><br />
                                    <input type="text" placeholder="description" name="description" onChange={this.handleChange} /><br />
                                    <input type="text" placeholder="amount" name="amount" onChange={this.handleChange} /><br />
                                    <input type="text" placeholder="royalties" name="royalties" onChange={this.handleChange} /><br />
                                    <input type="file" name="file" onChange={this.onFileUpload} />
                                    {
                                        this.state.video ?
                                            <div>
                                                <input type="file" name="display" onChange={this.onDisplayUpload} />
                                            </div>
                                            : undefined
                                    }
                                    <div>
                                        <a class='style button' style={{ cursor: 'pointer' }} onClick={this.mint}>mint</a>
                                    </div>
                                </div>
                            </div>
                        :
                        <div>
                            You must be synced.
                        </div>
                }
            </div>
        )
    }
}