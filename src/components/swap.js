import React, { Component, useContext, useState } from 'react'
import { createClient, useSubscription } from 'urql'
import { UngrundContext } from '../context/UngrundContext'
import { Loading } from './load'
import { ethers } from 'ethers'
import { set } from 'lodash'

var Contract = require('web3-eth-contract')
const Web3 = require('web3')

export const Swap = ({ id }) => {

    const { swapAbi, v1, erc1155Abi, erc1155, account } = useContext(UngrundContext)
    const [amount, setAmount] = useState(undefined)
    const [value, setValue] = useState(undefined)
    const [loading, setLoading] = useState(false)

    const transaction = async () => {

        setLoading(true)

        Contract.setProvider(Web3.givenProvider);
        let web3 = new Web3(Web3.givenProvider);

        let s = new Contract(swapAbi, v1)
        let tk = new Contract(erc1155Abi, erc1155)

        let batch = new web3.BatchRequest()

        // verify if already approved ?
        if (!await tk.methods.isApprovedForAll(account, v1).call()) batch.add(tk.methods.setApprovalForAll(v1, true).send({ from: account }))
        batch.add(s.methods.swap(id, amount, (value * 1000000000000000000).toString(), erc1155).send({ from: account }))

        try {
            console.log(await batch.execute(res => res))
            setLoading(false)
        } catch (err) {
            setLoading(false)
        }
    }

    const frax = async () => { }

    return (
        <div><br />
            {
                <div>
                    <input type="text" placeholder="amount" name="amount" onChange={(e) => setAmount(e.target.value)} /><br />
                    <input type="text" placeholder="value" name="value" onChange={(e) => setValue(e.target.value)} /><br />

                    <a class="button style" onClick={transaction} style={{ cursor: 'pointer' }}>swap</a>
                </div>
            }
        </div>
    )
}
