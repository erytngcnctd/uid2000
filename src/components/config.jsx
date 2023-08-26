import React, { useState, useEffect, useContext } from 'react'
import { UngrundContext } from '../context/UngrundContext'
import { NFTStorage  } from 'nft.storage'
import { Loading } from './load'
// import { mime } from 'mime'

import {
    useContractWrite, 
    useWaitForTransaction,
    usePrepareContractWrite, 
} from 'wagmi'


let apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEY1NDdDNUIyMjMzMTc3MDZkZDdkODNEMjA4ODRkRDgxOTIxNTBiNEUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyODE5NTc4NTc2MSwibmFtZSI6InRlc3QifQ.RED_BCrWtUgodnbLxdFV5lKxVTPruv1Cg-bcDL7jtrI'

let client = new NFTStorage({ token: apiKey })

// error handling  ??
export const Config = () => {

    const [id, setId] = useState(null)
    const [description, setDescription] = useState(null)
    const [uri, setUri] = useState('ipfs://')
    const { id: contract, idAbi, loading, setLoading, setMsg } = useContext(UngrundContext)

    const { config } = usePrepareContractWrite({
        address: contract,
        abi: idAbi,
        functionName: 'register',
        args: [id, uri],
        enabled: [Boolean(id), Boolean(uri)]
    })

    const { data, write, isError } = useContractWrite(config)
    
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    }) 

    useEffect(() => {
        isError && setMsg('error updating')
        isSuccess && setMsg('update succesful')
    }, [isError, isSuccess])
    
    useEffect(() => {
        uri !== 'ipfs://' &&  write?.()
    }, [uri])

    const ipfs = async () => {

        setLoading(true)
        setMsg('updating id')
    
        let obj = { description }
        let str = JSON.stringify(obj)

        let cid = await client.storeBlob(new Blob([str], {
            type: "application/json"
        }))

        setUri(uri => uri+cid)
        console.log('metadata', obj, 'cid', cid)

    }

    return (

        loading ? <Loading /> :
            <div><br/>
            <input type="text" placeholder="id" name="id" onChange={e => setId(e.target.value)}></input><br />
            <input type="text" placeholder="description" name="description" onChange={e => setDescription(e.target.value)}></input><br />
            {/*             <input type="text" placeholder="RPC" name="RPC"></input><br />
            <input type="text" placeholder="indexer" name="indexer"></input><br />
            <input type="checkbox" id="multiple" name="multiple" value="multiple"></input>
            <label for="multiple"> multiple collect</label><br/>
            <input type="checkbox" id="sensitive" name="sensitive" value="sensitive"></input>
            <label for="sensitive"> allow sensitive content</label><br/> */}
            {/*             <button>disable erc1155 permissions</button><br/>
            <button>disable erc20 permissions</button> */}
            <a className='style button' style={{ cursor: 'pointer' }} onClick={async ()=> await ipfs()}>update ungrund identity</a>
        </div>

    )
}