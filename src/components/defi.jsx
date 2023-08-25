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
import { polygon } from 'wagmi/chains'

import { all } from 'axios'
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

    const onSubmit = () => write?.()

    return (
        <div><br />
            {
                <div>
                    <a className="button style" onClick={() => onSubmit()} style={{ cursor: 'pointer' }}>approve for swap</a>
                </div>
            }
        </div>
    )
}

const GetDy = props => {
    const { lp, lpAbi } = useContext(UngrundContext)
    const { data, isError, isLoading } = useContractRead(props._dx > 0 ? {
        address: lp,
        abi: lpAbi,
        functionName: 'get_dy',
        args: props._directional ? [1, 0, parseEther(props._dx.toString())] : [0, 1, parseEther(props._dx.toString())],
    } : {})
    return (
        <div>
            <input type="text" placeholder="0" id="dy" onChange={()=>{}} value={data ? parseInt(BigInt(data)) / 10 ** 18 : 0} />
            {!props._directional ? <span>MATIC</span> : <span>███</span>}
            <br />
        </div>
    )
}

const Exchange = props => {
    const { lp, lpAbi, account } = useContext(UngrundContext)
    let config = {}
    props._directional ?
        config = {
            address: lp,
            abi: lpAbi,
            chainId: polygon.id,
            functionName: 'exchange_underlying',
            stateMutability: 'payable',
            value: parseEther(props._dx.toString()),
            args: [1, 0, parseEther(props._dx.toString()), parseEther("0"), account]    
        } :
        config = {
            address: lp,
            abi: lpAbi,
            chainId: polygon.id,
            functionName: 'exchange_underlying',
            args: [0, 1, parseEther(props._dx.toString()), parseEther("0"), account],
        }

    const { data, write } = useContractWrite(config)

    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    })

    const onSubmit = () => write?.()

    return (
        <div><br />
            {
                <div>
                    {/*                     <input type="text" placeholder="0" id="dx" value={dx} onChange={(e) => {
                        setDirectional(true)
                        setDx(e.target.value)
                        }} /><br />
                    <a className="button style" style={{ cursor : 'pointer'}}>⇅</a><br/>
                    <input type="text" placeholder="0" id="dy" value={dy} onChange={e => {
                        setDirectional(false)
                        setDy(e.target.value)
                        }} /><br /> */}
                    <a className="button style" onClick={() => onSubmit()} style={{ cursor: 'pointer' }}>convert</a>
                </div>
            }
        </div>
    )
}

export const Defi = () => {
    const [directional, setDirectional] = useState(true)
    const [dx, setDx] = useState(0)

    // review allowances
    
    //let allowance = getAllowance()
    //console.log(allowance)

    //if (!allowance) return <Approve  account={account} amount={dx} />
    //else return <Transaction tokenId={ tokenId } />
    return (
        <div>
            <div>
                <br />
                <input type="text" placeholder="0" id="dx" value={dx} onChange={(e) => { setDx(e.target.value) }} />
                {directional ? <span>MATIC</span> : <span>███</span>}
                <br />
                <a className="button style" style={{ cursor: 'pointer', marginLeft: '172px' }} onClick={() => setDirectional(!directional)}>⇅</a>
                <br />
                <GetDy _directional={directional} _dx={dx} />
                {/* slippage warning */}
            </div>
            <Exchange _directional={directional} _dx={dx} />
        </div>
    )
}
