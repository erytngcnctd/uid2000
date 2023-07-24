import { useContext, useState } from 'react'
import { UngrundContext } from '../context/UngrundContext'
import { useDebounce } from 'usehooks-ts'
import { Loading } from './load'
import {
    useContractWrite, 
    useWaitForTransaction,
    usePrepareContractWrite, 
} from 'wagmi'


export const Transfer = ({ id }) => {

    const { erc1155Abi, erc1155, account} = useContext(UngrundContext)
    const [to, setTo] = useState(account)
    const [amount, setAmount] = useState(1)
    const debouncedTo = useDebounce(to, 500)
    const debouncedAmount = useDebounce(amount, 500)

    const { config } = usePrepareContractWrite({
        address: erc1155,
        abi: erc1155Abi,
        functionName: 'safeTransferFrom',
        args: [account, debouncedTo, parseInt(id), parseInt(debouncedAmount), '0x0'],
        enabled: [Boolean(account), Boolean(debouncedTo), Boolean(id), Boolean(debouncedAmount), Boolean('0x0')]
    })
    
    const { data, write, isError } = useContractWrite(config)
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    }) 

    // loading bar?
    const transfer = async() => {
        write()
    }

    return (
         // isLoading ? <Loading /> :
        <div><br />
            <input type="text" placeholder="to" name="to" onChange={(e) => setTo(e.target.value)} /><br />
            <input type="text" placeholder="amount" name="amount" onChange={(e) => setAmount(e.target.value)} /><br />                
            <a className="button style" onClick={() => transfer()} style={{ cursor : 'pointer' }}>transfer</a>
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