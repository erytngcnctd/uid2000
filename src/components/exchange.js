
import React, { Component } from 'react'
import { UngrundContext } from '../context/UngrundContext'

var Contract = require('web3-eth-contract')
const Web3 = require('web3')

export class Exchange extends Component {
    static contextType = UngrundContext

    exchange = async () => {
        Contract.setProvider(Web3.givenProvider);

        let contract = new Contract(this.context.aggregator, '0x39Cb69D07aDB65E92DD39Ed38f54c33Ebc7401fC')
        let result = await contract.methods.aggregate([[3, 1, 5000000]], '0xC1292a5a0bbBAf8A3245f424fAF7353C57cbC1bF', '0x50410ABD29C09b3e1379CA54cc3643e725cE9c9A').send({ from: this.context.account, value : 50000000000000 })
        
    }

    render () {
        return (<div><button onClick={this.exchange}>swap</button></div>)
    }
}
