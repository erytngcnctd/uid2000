import { useContext, useState } from 'react'
import { UngrundContext } from '../context/UngrundContext'
import { useContractRead } from 'wagmi'


export const Royalties = ({ tokenId }) => {

    const { erc1155Abi, erc1155, account } = useContext(UngrundContext)
    const { data, isError, isLoading } = useContractRead({
        address: erc1155,
        abi: erc1155Abi,
        functionName: 'royalties',
        args: [tokenId],
    })
    if (data) return (
        <>
            <span>{`${data/100n}% royalties`}</span>
        </>
    )
}