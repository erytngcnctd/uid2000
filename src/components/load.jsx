import { useContext } from 'react'
import { UngrundContext } from '../context/UngrundContext'

export const Loading = () => {

    const { msg, setMsg, loading, setLoading } = useContext(UngrundContext)

    return (
        <div>
            { msg ? <div class="center">{msg}</div> : undefined }
            <hr class="line" />
        </div>
    )
}