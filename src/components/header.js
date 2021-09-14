import React, { Component } from 'react'
import { UngrundContext } from '../context/UngrundContext'
const Web3 = require('web3')

export class Header extends Component {
    static contextType = UngrundContext

    state = {}

    componentWillMount = async () => {
        window.web3 = new Web3(window.web3.currentProvider)
        const accounts = await window.web3.eth.getAccounts()
        this.context.setAccount(accounts[0])
    }

    sync = async () => {
        window.web3 = new Web3(window.web3.currentProvider)
        window.ethereum.enable()
        const accounts = await window.web3.eth.getAccounts()
        this.context.setAccount(accounts[0])
        //console.log(this.context.account)
    }

    unsync = () => this.context.setAccount(undefined)

    render() {
        return (
            <div>
                <div style={{ borderBottom: 'solid', height: '45px' }}>
                    <div>
                        <span style={{ fontSize: '35px' }}>
                            un-
                        </span>
                        {
                            this.context.account == undefined ?
                                <span style={{ float: 'right', marginTop: '12.5px' }} onClick={this.sync}>
                                    sync
                                </span>
                                :
                                <div style={{display : 'inline'}}>
                                    <span style={{ float: 'right', marginTop: '12.5px' }}>
                                        {this.context.account.slice(0, 7)}...{this.context.account.slice(this.context.account.length - 5, this.context.account.length)}
                                    </span>
{/*                                     <span onClick={() => this.unsync}>
                                        unsync
                                    </span> */}
                                </div>
                        }
                    </div>
                </div>
                <div>
                    <a href='/'>
                    //feed  //
                    </a>
                    <a href='/mint'>
                        mint  //
                    </a>
                    <a href='/about'>
                        about
                    </a>
                </div>
            </div>
        )
    }
}