import React, { Component, useState } from 'react'
import { UngrundContext } from '../context/UngrundContext'
import { Card } from 'react-bootstrap'

const Web3 = require('web3')
const ls = require('local-storage')
var web3;

export class Header extends Component {

    state = {
        account: undefined,
        synced: false,
        selected: undefined
    }

    static contextType = UngrundContext

    componentWillMount = async () => {
        this.context.setAccount(ls.get('account'), ls.get('sync'))

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
                if (!ls.get('pk')) ls.set('pk', res) 
            })
            window.crypto.subtle.exportKey('jwk', keyPair.privateKey).then(res => {
                if (!ls.get('sk')) ls.set('sk', res)
            })
        });
    }

    sync = async () => {
        window.ethereum.enable()
        web3 = new Web3(window.ethereum);
        window.ethereum.request({ method: 'eth_requestAccounts' })
        this.context.setAccount(web3.eth.currentProvider.selectedAddress, true)
        ls.set('account', web3.eth.currentProvider.selectedAddress)
        ls.set('sync', true)
    }

    unsync = async () => {
        this.context.setAccount(undefined, false)
        ls.set('account', undefined)
        ls.set('sync', false)
    }

    addToken = async () => {

        const tokenAddress = '0xfb8B533921c00E2C7EfA59F8f0b8C9Dcf3904aAE';
        const tokenSymbol = 'CTFSH';
        const tokenDecimals = 6;
        const tokenImage = 'https://ipfs.io/ipfs/QmbETnBNoSqTwNPxUdPj1S3f8d3FbLzXx7J7KhMDUHzBk8';

        window.web3 = new Web3(window.web3.currentProvider)

        try {
            await window.web3.currentProvider.sendAsync({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20', // Initially only supports ERC20, but eventually more!
                    options: {
                        address: tokenAddress, // The address that the token is at.
                        symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
                        decimals: tokenDecimals, // The number of decimals in the token
                        image: tokenImage, // A string url of the token logo
                    },
                },
            });

        } catch (err) { }
    }

    render() {
        return (
            <div>
                <div style={{ borderBottom: 'solid', height: '50px' }}>
                    <div>
                        <a href='/' style={{ marginTop: '7.5px', zIndex: 1, position: 'absolute', fontSize: '25px', cursor: 'pointer' }}>███</a>
                        {
                            !this.context.sync || !this.context.account ?
                                <span style={{ float: 'right', marginTop: '15px' }}>
                                    <a class='style' style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={this.sync}>sync</a>
                                </span>
                                :
                                <div style={{ display: 'inline' }}>
                                    <span style={{ float: 'right', marginTop: '15px' }}>
                                        {this.context.account.slice(0, 7)}...{this.context.account.slice(this.context.account.length - 5, this.context.account.length)}
                                    </span>
                                    <span style={{ float: 'right', marginTop: '15px' }}>
                                        <a class='style' style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => this.unsync()}>unsync</a>
                                    </span>
                                    {/*                                     <span onClick={() => this.unsync}>
                                        unsync
                                    </span> */}
                                </div>
                        }
                    </div>
                </div>
                <div style={{ display: 'inline' }}>
                    <span>
                        <a class='style' onClick={() => this.context.setSelected(undefined)} href='/'> {/* filters ? */}
                        //feed  //
                        </a>
                        <a class='style' onClick={() => this.context.setSelected('publish')} href='#/publish'>
                            publish  //
                        </a>
                        {this.context.account ?
                            <span>
                                <a class='style' href={`#/${this.context.account}`}>
                                    assets //
                                </a>
                                <a class='style' href='#/config'>
                                    config //
                                </a>
                            </span>
                            : undefined
                        }
                        <a class='style' href='#/about'>
                            about //
                        </a>
                        <span style={{ float: 'right' }}>
                            network:
                            <select style={{ border: 'none', fontFamily: 'monospace' }}>
                                <option value='0'>polygon</option>
                                {/*                             <option value='1'>fantom</option>
                            <option value='2'>avax</option>
                            <option value='3'>aurora</option>
                            <option value='4'>near</option>
                            <option value='5'>ethereum</option>
                            <option value='6'>bnb</option>
                                <option value='7'>xDAI</option>*/}
                            </select>
                        </span>
{/*                         {
                            this.context.selected == 'mint' ?
                                <div>
                                    <a class='style' style={{ cursor: 'pointer' }} onClick={() => this.context.setOpen(true)}>
                                        //open collection //
                                    </a>
                                    <a class='style' style={{ cursor: 'pointer' }} onClick={() => this.context.setOpen(false)}>
                                        private collections
                                    </a>
                                </div> : undefined
                        } */}
                        {/*                         <a href='#' onClick={() => this.addToken()}>
                            add token //
                        </a>
                        <a href='#'>無為</a>
                        <a href='collections'></a> */}
                    </span>
                </div>
            </div>
        )
    }
}