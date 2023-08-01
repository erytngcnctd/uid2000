import React, { Component, useContext, useState } from 'react'
// import { createClient, useSubscription } from 'urql'
import { UngrundContext } from '../context/UngrundContext'
import {
    useContractRead,
    useContractWrite, 
    useWaitForTransaction,
    usePrepareContractWrite, 
} from 'wagmi'
import { parseEther } from 'viem'
import { useDebounce } from 'usehooks-ts'
// import { Loading } from './load'
// import { set } from 'lodash'
// import { Contract } from 'web3-eth-contract'
// import { Web3 } from 'web3'

// var Contract = require('web3-eth-contract')
// const Web3 = require('web3')
const getApproval = () => {
    const { v1, erc1155Abi, erc1155, account } = useContext(UngrundContext)
    const { data, isError, isLoading } = useContractRead({
        address: erc1155,
        abi: erc1155Abi,
        functionName: 'isApprovedForAll',
        args: [account, v1],
    })
    return data
}

const Approve = () => {
    const { v1, erc1155Abi, erc1155 } = useContext(UngrundContext)
    const { config } = usePrepareContractWrite({
        address: erc1155,
        abi: erc1155Abi,
        functionName: 'setApprovalForAll',
        args: [v1, true],
    })
    const { data, write } = useContractWrite(config)
    const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    })
    const onSubmit = () => {
        console.log('hi')
        write?.()
    }
    return(
        <div><br />
            {
                <div>
                    <a className="button style" onClick={() => onSubmit() } style={{ cursor: 'pointer' }}>approve for swap</a>
                </div>
            }
        </div>
    )
}

const Transaction = ({ tokenId }) => {
    const { swapAbi, v1, erc1155 } = useContext(UngrundContext)
    const [amount, setAmount] = useState(1)
    const [value, setValue] = useState(0)
    const debouncedAmount = useDebounce(amount, 500)
    const debouncedValue = useDebounce(value, 500)
    const { config } = usePrepareContractWrite({
        address: v1,
        abi: swapAbi,
        functionName: 'swap',
        args: [parseInt(tokenId), parseInt(debouncedAmount), parseEther(debouncedValue.toString()), erc1155],
        enabled: [Boolean(tokenId), Boolean(debouncedAmount), Boolean(debouncedValue), Boolean(erc1155)]
    })

    const { data, write } = useContractWrite(config)
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    }) 

    return (
        <div><br />
            {
                <div>
                    <input type="text" placeholder="amount" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} /><br />
                    <input type="text" placeholder="value" id="value" value={value} onChange={(e) => setValue(e.target.value)} /><br />
                    <a className="button style" onClick={() => write?.() } style={{ cursor: 'pointer' }}>swap</a>
                </div>
            }
        </div>
    )
}

export const Swap = ({ tokenId }) => {
    console.log (tokenId)
    // const { swapAbi, v1, erc1155Abi, erc1155, account } = useContext(UngrundContext)
    // const transaction = async () => {

    //     setLoading(true)

    //     Contract.setProvider(Web3.givenProvider);
    //     let web3 = new Web3(Web3.givenProvider);

    //     let s = new Contract(swapAbi, v1)
    //     let tk = new Contract(erc1155Abi, erc1155)

    //     let batch = new web3.BatchRequest()

    //     // verify if already approved ?
    //     if (!await tk.methods.isApprovedForAll(account, v1).call()) batch.add(tk.methods.setApprovalForAll(v1, true).send({ from: account }))
    //     batch.add(s.methods.swap(id, amount, (value * 1000000000000000000).toString(), erc1155).send({ from: account }))

    //     try {
    //         console.log(await batch.execute(res => res))
    //         setLoading(false)
    //     } catch (err) {
    //         setLoading(false)
    //     }
    // }
    console.log(tokenId)
    let approval = getApproval(tokenId); 
    const frax = async () => { }

    if (!approval) return <Approve />
    else return <Transaction tokenId={ tokenId } />
}
