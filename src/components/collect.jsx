import React, { useContext } from 'react'
import {
        useWaitForTransaction,
        useContractWrite, 
        usePrepareContractWrite, 
    } from 'wagmi'
import { parseEther, parseGwei} from 'viem'
import { UngrundContext } from '../context/UngrundContext'
import { polygon } from 'wagmi/chains'


export const Collect = ({ swapId, value }) => {
    const { v1, swapAbi, account } = useContext(UngrundContext)
    const amount = 1

    const { config } = usePrepareContractWrite({
        address: v1,
        abi: swapAbi,
        chainId: polygon.id,
        functionName: 'collect',
        stateMutability: 'payable',
        value: parseEther(value.toString()),
        args: [parseInt(swapId), parseInt(amount)],
        enabled: [Boolean(swapId), Boolean(amount)]
    })

    const { data, write, isError } = useContractWrite(config)

    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    }) 

   
    return (
        <>
            <a className='button style' style={{ cursor: 'pointer' }} onClick={() => write?.()}>collect for {value} MATIC</a>
        </>
    )
}   