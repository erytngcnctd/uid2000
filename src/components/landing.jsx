
import React, { useState, useContext, useEffect } from 'react'
import { UngrundContext } from '../context/UngrundContext'

export const Landing = () => {

    const [search, setSearch] = useState('');
    const { loading, setLoading, setMsg, path, setSelected, account } = useContext(UngrundContext)

    useEffect(() => { setSelected(undefined)}, [])

    const handleKey = e => {
        if (e.key == 'Enter') {
            window.location.hash = `#/search/${search}`
            window.location.reload()
        }
    }

    const handleChange = e => setSearch(e.target.value)


    return (
        <div style={{
            textAlign: 'center', display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '55vh',
        }}>
            <div style={{ fontSize: '75px' }}>
                ███
            </div>
            <br /><br />
            <div>
                <input
                    type="text"
                    name="search"
                    placeholder="search ↵"
                    onChange={handleChange}
                    onKeyPress={handleKey}
                />
            </div>
            <br />
            <div>
                <span>
                    <a className='style' onClick={() => setSelected('feed')} href='#/feed'> {/* filters ? */}
                        feed
                    </a>&nbsp;&nbsp;
                    <a className='style' onClick={() => setSelected('publish')} href='#/publish'>
                        publish
                    </a>&nbsp;&nbsp;
                    {account ?
                        <span>
                            <a className='style' onClick={() => setSelected('defi')} href='#/defi'>
                                DeFi
                            </a>&nbsp;&nbsp;
                            <a className='style' onClick={() => setSelected('assets')} href={`#/${account}`}>
                                assets
                            </a>&nbsp;&nbsp;
                            <a className='style' onClick={() => setSelected('config')} href='#/config'>
                                config
                            </a>&nbsp;&nbsp;
                        </span>
                        : undefined
                    }
                    <a className='style' onClick={() => setSelected('about')} href='#/about'>
                        about
                    </a>
                </span>
            </div>
        </div>
    )
}



