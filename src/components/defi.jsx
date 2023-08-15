import React, { Component, useContext, useState } from 'react'
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

const getAllowance = () => {
    const { wuwei, wuweiAbi, lp, lpAbi, account } = useContext(UngrundContext)
    const { data, isError, isLoading } = useContractRead({
        address: wuwei,
        abi: wuweiAbi,
        functionName: 'allowance',
        args: [account, lp],
    })
    return data
}

const Approve = (account, amount) => {
    const { wuwei, wuweiAbi, lp } = useContext(UngrundContext)
    const { config } = usePrepareContractWrite({
        address: wuwei,
        abi: wuweiAbi,
        functionName: 'Approve',
        args: [account, lp, amount],
    })
    const { data, write } = useContractWrite(config)
    const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    })
    const onSubmit = () => {
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
    const { lp, lpAbi } = useContext(UngrundContext)
    const [amount, setAmount] = useState(0)
    const [swapI, setSwapI] = useState(0)
    const [swapJ, setSwapJ] = useState(1)
    
    const debouncedAmount = useDebounce(Amount, 500)

    
    const { config } = usePrepareContractWrite({
        address: lp,
        abi: lpAbi,
        functionName: 'exchange',
        args: [parseInt(swapI), parseInt(soldId), parseInt(debouncedAmount), parseEther(debouncedValue.toString()), erc1155],
        enabled: [Boolean(Address), Boolean(soldId), Boolean(soldAmount), Boolean(boughtId), Boolean(boughAmount)]
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

export const Defi = ({ tokenId }) => {

    let allowance = getAllowance(account); 

    if (!allowance) return <Approve />
    else return <Transaction tokenId={ tokenId } />
}
