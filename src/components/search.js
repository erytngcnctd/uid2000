import { useContext, useState } from 'react'
import { UngrundContext } from '../context/UngrundContext'

export const Search = () => {

    const { msg, setMsg, loading, setLoading } = useContext(UngrundContext)
    const [ search, setSearch ] = useState(undefined)

    return (
        <div>
            <input type="text" placeholder="search" onChange={e => console.log(e)} />
        </div>
    )
}