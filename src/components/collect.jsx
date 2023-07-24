import { useAccount, useContract } from 'wagmi'



export const Collect = async (swapId, value) => {
    const { v1, erc1155Abi, erc1155, account } = useContext(UngrundContext)
    
    const { config } = usePrepareContractWrite({
        address: v1,
        abi: swapAbi,
        functionName: 'collect',
        args: [parseInt(swapId), parseInt(value)],
    })

    const { data, write } = useContractWrite(config)
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    }) 

    return (
        <div>
        <a className='button style' style={{ cursor: 'pointer' }} onClick={() => this.collect(e.swapId, e.value)}>collect for {e.value / 1000000000000000000} MATIC</a><br /><br />
        </div>
    )
}