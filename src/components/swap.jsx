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
    const [amount, setAmount] = useState(0)
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
                    <input type="text" placeholder="amount" id="amount" onChange={(e) => setAmount(e.target.value)} /><br />
                    <input type="text" placeholder="value" id="value" onChange={(e) => setValue(e.target.value)} /><br />
                    <a className="button style" onClick={() => write?.() } style={{ cursor: 'pointer' }}>swap</a>
                </div>
            }
        </div>
    )
}
// add only for token holder
export const Swap = ({ tokenId }) => {

    let approval = getApproval(tokenId); 
    const frax = async () => { }

    if (!approval) return <Approve />
    else return <Transaction tokenId={ tokenId } />
}
