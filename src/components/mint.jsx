import axios from 'axios'
import React, { Component } from 'react'
import { createClient } from 'urql'
import { UngrundContext } from '../context/UngrundContext'
import { NFTStorage, File } from 'nft.storage'
import { create } from 'ipfs-http-client'
import { Loading } from './load'
import { mime } from 'mime'
import { findHashtags } from 'find-hashtags'
import { Contract } from 'web3-eth-contract'
import { Web3 } from 'web3'

// import WebTorrent from 'webtorrent'

// let mime = require('mime')
// let findHashtags = require('find-hashtags')
// let createTorrent = require('create-torrent')
// let Contract = require('web3-eth-contract')
// let Web3 = require('web3')
let apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEY1NDdDNUIyMjMzMTc3MDZkZDdkODNEMjA4ODRkRDgxOTIxNTBiNEUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyODE5NTc4NTc2MSwibmFtZSI6InRlc3QifQ.RED_BCrWtUgodnbLxdFV5lKxVTPruv1Cg-bcDL7jtrI'
// let ls = require('local-storage')
let client = new NFTStorage({ token: apiKey })
// let wt = new WebTorrent()

export class Mint extends Component {

    static contextType = UngrundContext

    state = {
        title: undefined,
        description: undefined,
        amount: undefined,
        royalties: undefined,
        hashtags: undefined,
        file: undefined,
        display: undefined,
        result: undefined,
        video: false
    }

    componentWillMount = async () => { }

    handleChange = e => {
        if (e.target.name == 'hashtags') {
            this.setState({ [e.target.name]: findHashtags(e.target.value) })
        } else {
            this.setState({ [e.target.name]: e.target.value })
        }
    }

    onFileUpload = e => {
        this.setState({ file: e.target.files[0] })
        console.log(e.target.files[0].type)
        console.log(e.target.files[0])
        console.log(e.target.files[0].type == undefined)
        if (e.target.files[0].type.split('/')[0] != 'image' && e.target.files[0].type.split('/')[0] != 'text' && e.target.files[0].type != 'application/pdf') this.setState({ video: true })
        console.log(this.state.video)
    }

    onDisplayUpload = e => this.setState({ display: e.target.files[0] })

    encrypt = async () => {

        // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
        // https://blog.secure-monkey.com/considerations-when-using-aes-gcm-for-encrypting-files/

        console.log(await this.state.file.arrayBuffer())
        console.log(localStorage.getItem('pk'))

        let pk = window.crypto.subtle.importKey('jwk', localStorage.getItem('pk'), {   //these are the algorithm options
            name: "RSA-OAEP",
            hash: { name: "SHA-256" }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
        },
            false, // whether the key is extractable (i.e. can be used in exportKey)
            ["encrypt"]).then(res => res)

        let encrypted = window.crypto.subtle.encrypt('RSA-OAEP', await pk, Buffer.from(await this.state.file.arrayBuffer())).then(res => res)

        console.log(await encrypted)
        console.log(localStorage.getItem('sk'))

        let sk = window.crypto.subtle.importKey('jwk', localStorage.getItem('sk'), {   // these are the algorithm options
            name: "RSA-OAEP",
            hash: { name: "SHA-256" }, // can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
        },
            false, // whether the key is extractable (i.e. can be used in exportKey)
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
        //this.ipfsUpload(new File([(await decrypted)], this.state.file.name, { type: this.state.file.type, lastModified: Date.now() }))
        //Uint8Array

    }

    ipfsUpload = async (file) => {
        let infuraUrl = 'https://ipfs.infura.io:5001'
        let ipfs = create(infuraUrl)
        let hash = await ipfs.add(file)
        console.log(hash)
    }

    mint = async () => {

        console.log(this.state)
        this.context.setLoading(true)
        this.context.setMsg('preparing asset')

        let formData = new FormData()
        formData.append('file', this.state.file)

        let type = mime.getType(this.state.file)
        console.log(type)

        let artifactBuffer = Buffer.from(await this.state.file.arrayBuffer())
        console.log(artifactBuffer.byteLength)

        let artifact = await client.storeBlob(new Blob([artifactBuffer]))
        console.log(artifact)
        artifactBuffer.name = this.state.title
        artifactBuffer.comment = this.state.description
        // console.log(await createTorrent([artifactBuffer], async (err, torrent) => {
        //     if (!err) { console.log(torrent.magnetURI) }
        //     console.log(await wt.add(torrent))
        //     console.log(await wt.seed(torrent))
        // }))
        let obj = {}

        if (this.state.video) {

            let displayBuffer = Buffer.from(await this.state.display.arrayBuffer())
            let display = await client.storeBlob(new Blob([displayBuffer]))

            obj = {
                name: this.state.title ? this.state.title : undefined,
                description: this.state.description ? this.state.description : undefined,
                animation_url: `ipfs://${artifact}`,
                image: `ipfs://${display}`
            }

        } else {

            obj = {
                name: this.state.title ? this.state.title : undefined,
                description: this.state.description ? this.state.description : undefined,
                image: `ipfs://${artifact}`
            }

        }

        if (this.state.hashtags?.length > 0) obj.attributes = this.state.hashtags.map(e => { return { 'value': e } })
        if (this.state.file.type != undefined) obj.mimeType = this.state.file.type

        let str = JSON.stringify(obj)

        let nft = await client.storeBlob(new Blob([str], {
            type: "application/json"
        }))

        console.log('metadata', obj, 'nft', nft)

        // webtorrent

        Contract.setProvider(Web3.givenProvider);

        let contract = new Contract(this.context.minterAbi, this.context.erc1155)
        this.context.setMsg('awaiting op confirmation')
        try {
            let result = await contract.methods.mint(
                this.state.amount,
                this.state.royalties * 100,
                `ipfs://${nft}`
            ).send({ from: localStorage.getItem('account') })
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
                    localStorage.getItem('sync') ?
                        this.context.loading ?
                            <Loading />
                            :
                            <div><br/>
                                <div>
                                    <input type="text" placeholder="title" name="title" onChange={this.handleChange} /><br />
                                    <input type="text" placeholder="description" name="description" onChange={this.handleChange} /><br />
                                    {/* <input type="text" placeholder="#hashtags" name="hashtags" onChange={this.handleChange} /><br /> */}
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
                                        <a className='style button' style={{ cursor: 'pointer' }} onClick={this.mint}>mint</a>
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