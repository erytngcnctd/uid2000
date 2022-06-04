import { useContext, useState } from 'react'
import { UngrundContext } from '../context/UngrundContext'
const findHashtags = require('find-hashtags')

export const Search = () => {

    const { msg, setMsg, loading, setLoading } = useContext(UngrundContext)
    const [ search, setSearch ] = useState(undefined)

    const query = async (e) => {
        setSearch(e.target.value)
    }

    const handleKey = async (e) => {
        if (e.key == 'Enter') console.log(search)
    }

    return (
        <div>
            <input type="text" placeholder="search" onChange={e => query(e)} onKeyPress={e => handleKey(e)} />
            <button>search</button>
        </div>
    )
}