import React, { Component, useState } from 'react'
import { UngrundContext } from '../context/UngrundContext'
import { Search } from './search'
import { disconnect, connect } from '@wagmi/core'
import { getAccount, getContract } from '@wagmi/core'
import { SyncButton } from './sync/'
import icon from '../media/favicon.jpeg';


// import { Web3 } from 'web3'
// const Web3 = require('web3')
// const localStorage = require('local-storage')

// var web3;


export class Header extends Component {

    constructor(props) {
        super(props);
        this.state = {
            account: undefined,
            synced: false,
            selected: undefined,
            redirect: false,
            path: undefined
        }
    }

    static contextType = UngrundContext

    //componentDidUpdate = async () => this.setState({ path : window.location.hash.split('/')[1] })

    componentWillMount = async () => {

        //console.log(window.location.hash.split('/')[1])
        this.setState({ path: window.location.pathname })
        this.context.setSelected(window.location.hash.split('/')[1])

        this.context.setAccount(localStorage.getItem('account') || null, localStorage.getItem('sync') || null)

        window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["encrypt", "decrypt"]
        ).then((keyPair) => {
            window.crypto.subtle.exportKey('jwk', keyPair.publicKey).then(res => {
                if (!localStorage.getItem('pk')) localStorage.setItem('pk', res)
            })
            window.crypto.subtle.exportKey('jwk', keyPair.privateKey).then(res => {
                if (!localStorage.getItem('sk')) localStorage.setItem('sk', res)
            })
        });
    }

    // sync = async () => {
    //     // window.ethereum.enable()
    //     // web3 = new Web3(window.ethereum);
    //     // window.ethereum.request({ method: 'eth_requestAccounts' })
    //     await this.context.wallet.openModal({
    //         options: {
    //             route: 'SelectNetwork'
    //         }
    //     })
    //     // await connect()
    //     // let test = connect()    
    //     let account = getAccount()
    //     console.log('acc', account)
    //     if (account.address !== undefined) {
    //         console.log('acc', account)
    //         this.context.setAccount(account.address, true)
    //         localStorage.setItem('account', account.address)
    //         localStorage.setItem('sync', true)
    //     }
    //     // this.context.setAccount(web3.eth.currentProvider.selectedAddress, true)
    //     // localStorage.setItem('account', web3.eth.currentProvider.selectedAddress)
    //     // localStorage.setItem('sync', true)
    // }

    // unsync = async () => {
    //     disconnect()
    //     this.context.setAccount('', false)
    //     localStorage.removeItem('account')
    //     localStorage.setItem('sync', false)
    // }

    // look into later. . .

    // addToken = async () => {

    //     const tokenAddress = '0xfb8B533921c00E2C7EfA59F8f0b8C9Dcf3904aAE';
    //     const tokenSymbol = 'CTFSH';
    //     const tokenDecimals = 6;
    //     const tokenImage = 'https://ipfs.io/ipfs/QmbETnBNoSqTwNPxUdPj1S3f8d3FbLzXx7J7KhMDUHzBk8';

    //     window.web3 = new Web3(window.web3.currentProvider)

    //     try {
    //         await window.web3.currentProvider.sendAsync({
    //             method: 'wallet_watchAsset',
    //             params: {
    //                 type: 'ERC20', // Initially only supports ERC20, but eventually more!
    //                 options: {
    //                     address: tokenAddress, // The address that the token is at.
    //                     symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
    //                     decimals: tokenDecimals, // The number of decimals in the token
    //                     image: tokenImage, // A string url of the token logo
    //                 },
    //             },
    //         });

    //     } catch (err) { }
    // }

    handleKey = e => {
        if (e.key == 'Enter') {
            window.location.hash = `#/search/${this.state.search}`
            window.location.reload()
        }
    }

    handleChange = e => this.setState({ [e.target.name]: e.target.value })

    render() {
        return (
            <div style={{ position: 'sticky', top: 0, left: 0, width: '100%', zIndex: 1, background: 'white' }}>
                <div style={{ /* borderBottom: 'solid', */ height: '50px' }}>
                    <SyncButton />
                    {this.context.selected == undefined ?
                        undefined :
                        <div>
                            <span><a href='#/' style={{ marginTop: '7.5px', zIndex: 1, position: 'absolute', fontSize: '25px', cursor: 'pointer' }} onClick={() => this.context.setSelected(undefined)}>███</a></span>
                            <div style={{ paddingTop: '50px' }}>
                                <input type="text" name="search" placeholder="search ↵" onChange={this.handleChange} onKeyPress={this.handleKey}></input>
                            </div>
                        </div>
                    }
                </div>
                {this.context.selected == undefined ?
                    undefined :
                    <div style={{ paddingTop: '35px' }}>
                        <span>
                            <a className='style' onClick={() => this.context.setSelected('feed')} href='#/feed'> {/* filters ? */}
                                feed
                            </a>&nbsp;&nbsp;
                            <a className='style' onClick={() => this.context.setSelected('publish')} href='#/publish'>
                                publish
                            </a>&nbsp;&nbsp;
                            <a className='style' onClick={() => this.context.setSelected('finance')} href='#/finance'>
                                finance
                            </a>&nbsp;&nbsp;
                            {/*                         <a className='style' onClick={() => this.context.setSelected('analytics')} href='#/analytics'>
                            analytics
                        </a>&nbsp;&nbsp; 
*/}
                            <a className='style' onClick={() => this.context.setSelected('assets')} href={`#/${this.context.account}`}>
                                assets
                            </a>&nbsp;&nbsp;
                            <a className='style' onClick={() => this.context.setSelected('config')} href='#/uuid'>
                                uuid
                            </a>&nbsp;&nbsp;

                            <a className='style' onClick={() => this.context.setSelected('about')} href='#/about'>
                                about
                            </a>
                            <span style={{ float: 'right' }}>
                                {/*                             network:
                            <select style={{ border: 'none', fontFamily: 'monospace' }}>
                                <option value='0'>polygon</option>
                            </select> 
                            */}
                                {/*
                            <option value='1'>fantom</option>
                            <option value='2'>avax</option>
                            <option value='3'>aurora</option>
                            <option value='4'>near</option>
                            <option value='5'>ethereum</option>
                            <option value='6'>bnb</option>
                            <option value='7'>xDAI</option>
                            */}
                            </span>
                            {/*                         {
                            this.context.selected == 'mint' ?
                                <div>
                                    <a className='style' style={{ cursor: 'pointer' }} onClick={() => this.context.setOpen(true)}>
                                        //open collection //
                                    </a>
                                    <a className='style' style={{ cursor: 'pointer' }} onClick={() => this.context.setOpen(false)}>
                                        private collections
                                    </a>
                                </div> : undefined
                        } */}
                            {/*<a href='#' onClick={() => this.addToken()} >
                            add token //
                        </a>
                        <a href='#'>無為</a>
                        <a href='collections'></a> */}
                        </span>
                    </div>
                }
            </div>
        )
    }
}