import { useContext } from 'react'
import { UngrundContext } from '../context/UngrundContext'

export const Loading = () => {

    const { msg, setMsg, loading, setLoading } = useContext(UngrundContext)

    return (
        <div>
            { msg ? <div className="center">{msg}</div> : undefined }
            <hr className="line" />
        </div>
    )
}