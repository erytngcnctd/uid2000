
import React, { Component } from 'react'
import { UngrundContext } from '../context/UngrundContext'
import { Contract } from 'web3-eth-contract'
import { Web3 } from 'web3'

// var Contract = require('web3-eth-contract')
// const Web3 = require('web3')

export class Exchange extends Component {
    static contextType = UngrundContext

    state = {
        price : undefined,
        amount : undefined
    }

    componentWillMount = () => {
        this.context.setSelected(window.location.hash.split('/')[1])
    }

    exchange = async () => {
        Contract.setProvider(Web3.givenProvider);

        let contract = new Contract(this.context.aggregator, '0x39Cb69D07aDB65E92DD39Ed38f54c33Ebc7401fC')
        let result = await contract.methods.aggregate([[3, 1, 5000000]], '0xC1292a5a0bbBAf8A3245f424fAF7353C57cbC1bF', '0x50410ABD29C09b3e1379CA54cc3643e725cE9c9A').send({ from: this.context.account, value: 50000000000000 })

    }

    handleChange = e => this.setState({ [e.target.name]: e.target.value })

    render() {
        return (
            <div>
                {/* limit order */}
                <input type="text" placeholder="price" name="price" onChange={this.handleChange} /><br />
                <input type="text" placeholder="amount" name="amount" onChange={this.handleChange} /><br />
                <a class='style button' style={{ cursor: 'pointer' }} onClick={this.exchange}>BUY X</a><br />
                
                <input type="text" placeholder="price" name="price" onChange={this.handleChange} /><br />
                <input type="text" placeholder="amount" name="amount" onChange={this.handleChange} /><br />
                <a class='style button' style={{ cursor: 'pointer' }} onClick={this.exchange}>SELL X</a><br/><br/>

                {/* market */}

                <input type="text" placeholder="amount" name="amount" onChange={this.handleChange} /><br/>
                <a class="stile button" style={{ cursor: 'pointer' }} onClick={this.exchange}>BUY X</a><br/><br/>

                <input type="text" placeholder="amount" name="amount" onChange={this.handleChange} /><br/>
                <a class="stile button" style={{ cursor: 'pointer' }} onClick={this.exchange}>SELL X</a>
            </div>
        )
    }
}
