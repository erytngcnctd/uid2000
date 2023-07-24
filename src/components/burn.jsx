import { useContext, useState } from 'react'
import { UngrundContext } from '../context/UngrundContext'
import { useDebounce } from 'usehooks-ts'
import { Loading } from './load'
import {
    useContractWrite, 
    useWaitForTransaction,
    usePrepareContractWrite, 
} from 'wagmi'


export const Burn = ({ id }) => {

    const { erc1155Abi, erc1155, dummy, account, setMsg } = useContext(UngrundContext)
    const [amount, setAmount] = useState(1)
    const debouncedAmount = useDebounce(amount, 500)

    const { config } = usePrepareContractWrite({
        address: erc1155,
        abi: erc1155Abi,
        functionName: 'safeTransferFrom',
        args: [account, dummy, parseInt(id), parseInt(debouncedAmount), '0x0'],
        enabled: [Boolean(account), Boolean(dummy), Boolean(id), Boolean(debouncedAmount), Boolean('0x0')]
    })
    const { data, write, isError } = useContractWrite(config)
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    }) 
    // redirect
    const transfer = async() => {
        write()
    }

    return (
        isLoading ? <Loading /> :
        <div><br />
            <input type="text" placeholder="amount" name="amount" onChange={(e) => setAmount(e.target.value)} /><br />                
            <a className="button style" onClick={() => transfer()} style={{ cursor : 'pointer' }}>burn</a>
            <div>
            { isLoading ? 'burning asset' 
            : isError ? 'error burning'
            : isSuccess ? 'asset burned' 
            : undefined
            }
            </div>
        </div>
    )
}