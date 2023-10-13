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

const encrypt = async () => {

    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
    // https://blog.secure-monkey.com/considerations-when-using-aes-gcm-for-encrypting-files/

    console.log(await this.state.file.arrayBuffer())
    console.log(ls.get('pk'))

    let pk = window.crypto.subtle.importKey('jwk', ls.get('pk'), {   //these are the algorithm options
        name: "RSA-OAEP",
        hash: { name: "SHA-256" }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    },
        false, // whether the key is extractable (i.e. can be used in exportKey)
        ["encrypt"]).then(res => res)

    let encrypted = window.crypto.subtle.encrypt('RSA-OAEP', await pk, Buffer.from(await this.state.file.arrayBuffer())).then(res => res)

    console.log(await encrypted)
    console.log(ls.get('sk'))

    let sk = window.crypto.subtle.importKey('jwk', ls.get('sk'), {   // these are the algorithm options
        name: "RSA-OAEP",
        hash: { name: "SHA-256" }, // can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    },
        false, // whether the key is extractable (i.e. can be used in exportKey)
        ["decrypt"]).then(res => res)

    let decrypted = window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP",
            //label: Uint8Array([...]) //optional
        },
        await sk, //from generateKey or importKey above
        new Uint8Array(await encrypted) //ArrayBuffer of the data
    )
        .then(res => res)

    console.log(await decrypted)
    //console.log(Buffer.from((await new File([(await decrypted)], this.state.file.name, {type: this.state.file.type, lastModified: Date.now()}).arrayBuffer())))
    //this.ipfsUpload(new File([(await decrypted)], this.state.file.name, { type: this.state.file.type, lastModified: Date.now() }))
    //Uint8Array

}


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
            <input type="text" placeholder="uuid" name="id" onChange={e => setId(e.target.value)}></input><br />
            <input type="text" placeholder="bio" name="description" onChange={e => setDescription(e.target.value)}></input><br />
            {/*             <input type="text" placeholder="RPC" name="RPC"></input><br />
            <input type="text" placeholder="indexer" name="indexer"></input><br />
            <input type="checkbox" id="multiple" name="multiple" value="multiple"></input>
            <label for="multiple"> multiple collect</label><br/>
            <input type="checkbox" id="sensitive" name="sensitive" value="sensitive"></input>
            <label for="sensitive"> allow sensitive content</label><br/> */}
            {/*             <button>disable erc1155 permissions</button><br/>
            <button>disable erc20 permissions</button> */}
            <a className='style button' style={{ cursor: 'pointer' }} onClick={async ()=> await ipfs()}>save</a>
        </div>

    )
}