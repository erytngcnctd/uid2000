import React, { useState, useEffect, useContext } from 'react'
import { UngrundContext } from '../context/UngrundContext'
import { NFTStorage  } from 'nft.storage'
import { Loading } from './load'
// import { mime } from 'mime'
// import { findHashtags } from 'find-hashtags'
import { useDebounce } from 'usehooks-ts'
import {
    useContractWrite, 
    useWaitForTransaction,
    usePrepareContractWrite, 
} from 'wagmi'
// import { isError } from 'lodash'

let apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEY1NDdDNUIyMjMzMTc3MDZkZDdkODNEMjA4ODRkRDgxOTIxNTBiNEUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyODE5NTc4NTc2MSwibmFtZSI6InRlc3QifQ.RED_BCrWtUgodnbLxdFV5lKxVTPruv1Cg-bcDL7jtrI'

let client = new NFTStorage({ token: apiKey })

// error handling  ??
export const Mint = () => {
    const [title, setTitle] = useState(null)
    const [description, setDescription] = useState(null)
    const [amount, setAmount] = useState(1)
    const [royalties, setRoyalties] = useState(10)
    // const [hashtags, setHashtags] = useState(null)
    const [file, setFile] = useState(null)
    const [display, setDisplay] = useState(null)
    const [video, setVideo] = useState(null)
    const [preview, setPreview] = useState(null) 
    const { erc1155, minterAbi, loading, setLoading, setMsg } = useContext(UngrundContext)
    const [uri, setUri] = useState('ipfs://')

    const debouncedAmount = useDebounce(amount, 500)
    const debouncedRoyalties = useDebounce(royalties, 500)
    
    const { config } = usePrepareContractWrite({
        address: erc1155,
        abi: minterAbi,
        functionName: 'mint',
        args: [parseInt(debouncedAmount), parseInt(debouncedRoyalties * 100), uri],
        enabled: [Boolean(debouncedAmount), Boolean(debouncedRoyalties), Boolean(uri)]
    })

    const { data, write, isError } = useContractWrite(config)

    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    }) 

    useEffect(() => {
        isError && setMsg('error minting')
        isSuccess && setMsg('minting succesful')
    }, [isError, isSuccess])
    
    useEffect(() => {
        uri !== 'ipfs://' &&  write?.()
    }, [uri])

    const onFileUpload = async e => {
        if (e.target.files[0].type.split('/')[0] === 'video') setVideo(true)
           setFile(e.target.files[0])
        }
    
    const onDisplayUpload = e => setDisplay(e.target.files[0])

    const ipfs = async () => {

        setLoading(true)
        setMsg('preparing asset')

        let formData = new FormData()
        formData.append('file', file)

        let artifactBuffer = Buffer.from(await file.arrayBuffer())

        let artifact = await client.storeBlob(new Blob([artifactBuffer]))
        artifactBuffer.name = title
        artifactBuffer.comment = description
        
        let obj = {}

        if (video) {

            let displayBuffer = Buffer.from(await display.arrayBuffer())
            let display = await client.storeBlob(new Blob([displayBuffer]))

            obj = {
                name: title ? title : undefined,
                description: description ? description : undefined,
                animation_url: `ipfs://${artifact}`,
                image: `ipfs://${display}`
            }
        } else {

            obj = {
                name: title ? title : undefined,
                description: description ? description : undefined,
                image: `ipfs://${artifact}`
            }

        }

        // if (hashtags?.length > 0) obj.attributes = hashtags.map(e => { return { 'value': e } })
        if (file.type != undefined) {
            obj.mimeType = file.type
        }

        let str = JSON.stringify(obj)

        let cid = await client.storeBlob(new Blob([str], {
            type: "application/json"
        }))

        setUri(uri => uri+cid)
        console.log('metadata', obj, 'nft', cid)

    }

    return (

        loading ? <Loading /> :
        <div>  
            {
                localStorage.getItem('sync') ?
                        <div><br/>
                            <div>
                                <input type="text" placeholder="title" name="title" onChange={(e)=>setTitle(e.target.value)} /><br />
                                <input type="text" placeholder="description" name="description" onChange={(e)=>setDescription(e.target.value)} /><br />
                                {/* <input type="text" placeholder="#hashtags" name="hashtags" onChange={(e)=>setHashTags(findHashtags(e.target.value))} /><br /> */}
                                <input type="text" placeholder="amount" name="amount" onChange={(e)=>setAmount(e.target.value)} /><br />
                                <input type="text" placeholder="royalties" name="royalties" onChange={(e)=>setRoyalties(e.target.value)} /><br />
                                <br/>
                                <input type="file" name="file" onChange={onFileUpload} />
                                {
                                    video &&
                                        <div>
                                            <input type="file" name="display" onChange={onDisplayUpload} />
                                        </div>
                                }
                                <br/><br/>
                                <div>
                                    <a className='style button' style={{ cursor: 'pointer' }} onClick={() => {file && !preview ? setPreview(true) : setPreview(false)}}>{!preview ? 'preview' : 'X'}</a>
                                </div>
                            </div>
                        </div>
                    :
                    <div>
                        You must be synced.
                    </div>
            }
            
        { preview && 
            <div><br/>
                { file.type.split('/')[0] === 'image' ? 
                    <div> 
                        <img variant="top" src={URL.createObjectURL(file)} />
                    </div>
                : file.type.split('/')[0] === 'text' ?
                    <div className='txt' style={{ maxWidth: '50vw' }}>
                        <ReactMarkdown>
                            {text}
                        </ReactMarkdown>
                    </div>
                : file.type.split('/')[0] === 'video' ?
                    <div>
                        <video autoPlay={"autoplay"} loop muted style={{ maxWidth: '50vw' }}>
                            <source src={URL.createObjectURL(file)}></source>
                        </video>
                    </div>
                : file.type.split('/')[0] === 'application/pdf' ?
                    <div>
                        <Document
                            file = {URL.createObjectURL(file)}
                        >
                            <Page pageNumber={1} />
                        </Document>
                    </div>
                : file.type.split('/')[0] === 'audio' ?
                    <div>
                        <img src={URL.createObjectURL(display)} /><br />

                        <audio controls style={{ width: '100%' }}>
                            <source src={URL.createObjectURL(file)} />
                        </audio>
                    </div>
                    : undefined
                }
                <br/>
                <div>{title}</div>
                <div>{description}</div>
                <div>{amount} editions</div>
                <div>{royalties}% royalties</div>
                <br/>
                <div>
                    <a className='style button' style={{ cursor: 'pointer' }} onClick={async () => {await ipfs();setMsg('minting asset')}}>mint</a>
                    {
                            isLoading && setMsg('minting asset')
                          
                    }
                </div>
            </div>        
        }
    </div>

    )
}

