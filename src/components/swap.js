import React, { Component, useContext, useState } from 'react'
import { createClient, useSubscription } from 'urql'
import { UngrundContext } from '../context/UngrundContext'

export const Swap = ({ id, royalties, creator }) => {

    const { swapAbi, swap, erc1155Abi, erc1155, account } = useContext(UngrundContext)
    const [amount, setAmount] = useState(undefined)
    const [value, setValue] = useState(undefined)

    const callback = (err, data) => console.log(data)
    const transaction = async () => {
        let s = new window.web3.eth.Contract(swapAbi, swap)
        let tk = new window.web3.eth.Contract(erc1155Abi, erc1155)
        let batch = new window.web3.BatchRequest()
    
        batch.add(tk.methods.setApprovalForAll(swap, true).send({ from: account })) 
        batch.add(s.methods.swap(id, amount, value, royalties, creator, erc1155).send({ from: account }))
        try {
            await batch.execute(res => res)
        } catch (err) {}
    }

    return (
        <div>
                <input type="text" placeholder="amount" name="amount" onChange={(e) => setAmount(e.target.value)} /><br />
                <input type="text" placeholder="value" name="value" onChange={(e) => setValue(e.target.value)} /><br />
                <button onClick={transaction}>swap</button>
        </div>
    )
}
