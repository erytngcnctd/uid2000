import React, { useContext } from 'react'
import {
        useWaitForTransaction,
        useContractWrite, 
        usePrepareContractWrite, 
    } from 'wagmi'
import { parseEther, parseGwei} from 'viem'
import { UngrundContext } from '../context/UngrundContext'
import { polygon } from 'wagmi/chains'


export const Cancel = ({ swapId }) => {
    const { v1, swapAbi, account } = useContext(UngrundContext)
    const amount = 1

    console.log(account)
    const { config } = usePrepareContractWrite({
        address: v1,
        abi: swapAbi,
        chainId: polygon.id,
        functionName: 'cancelSwap',
        args: [parseInt(swapId)]
    })

    const { data, write, isError } = useContractWrite(config)

    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    }) 

   
    return (
        <>
            <a className='button style' style={{ cursor: 'pointer' }} onClick={() => write?.()}>cancel</a>
        </>
    )
}   