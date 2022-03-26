
export const About = () => {

    const style = {
        height: '10px',
        backgroundColor: 'black',
        top: '50%',
    }

    const connectPoly = async () => {
        window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: '0x89',
                chainName: 'Polygon Network',
                nativeCurrency: {
                    name: 'Polygon Mainnet',
                    symbol: 'MATIC',
                    decimals: 18
                },
                rpcUrls: ['https://rpc-mainnet.maticvigil.com/'],
                blockExplorerUrls: ['https://polygonscan.com/']
            }]
        }).catch((error) => {
            console.log(error)
        })
    }

    const connectxDAI = async () => {
        window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: '0x64',
                chainName: 'Gnosis Chain',
                nativeCurrency: {
                    name: 'xDAI',
                    symbol: 'xDAI',
                    decimals: 18
                },
                rpcUrls: ['https://rpc.gnosischain.com/'],
                blockExplorerUrls: ['https://blockscout.com/xdai/mainnet/']
            }]
        })
    }

    const connectAvax = async () => {
        window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: '0xa86a',
                chainName: 'Avalanche',
                nativeCurrency: {
                    name: 'Avalanche C-Chain',
                    symbol: 'AVAX',
                    decimals: 18
                },
                rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
                blockExplorerUrls: ['https://snowtrace.io/']
            }]
        })
    }

    return (
        <div>
            <br /><br />
            This is an experiment led by hicetnunc2000lab intending to make digital assets accessible accross the web3 space.<br />
            To connect with the dApp you need a <a class="style" href="https://metamask.io/">metamask wallet</a> connected to a custom RPC from Polygon Network:
            
            <pre>
            Network Name: Polygon<br/>
New RPC URL: https://polygon-rpc.com<br/>
ChainID: 137<br/>
Symbol: MATIC<br/>
Block Explorer URL: https://polygonscan.com/<br/>
            </pre>
            <a class="style" style={{ cursor : 'pointer' }} onClick={() => connectPoly()}>connect to Polygon</a><br /><br />

{/*             <pre>
                Network Name: Gnosis Chain<br />
                New RPC URL: https://rpc.gnosischain.com/<br />
                ChainID: 0x64<br />
                Symbol: xDAI<br />
                Block Explorer: https://blockscout.com/xdai/mainnet/
            </pre>

            <a class="style" style={{ cursor : 'pointer' }} onClick={() => connectxDAI()}>connect to Gnosis</a><br /><br /> */}
{/*             <pre>
                Network Name: Avalanche Network<br />
                New RPC URL: https://api.avax.network/ext/bc/C/rpc<br />
                ChainID: 43114<br />
                Symbol: AVAX<br />
                Block Explorer: https://snowtrace.io/
            </pre>
            
            <a onClick={() => connectAvax()} href='#'>connect to AVAX</a><br /><br /> */}

            Exchange of digital assets can be made making use of MATIC, DAI or ███.<br /><br />
            To bridge assets from Ethereum Network to Polygon Network use <a class="style" href="https://wallet.polygon.technology/bridge">Polygon Bridge</a> <a class="style" href='https://www.youtube.com/watch?v=OOVzXvivgyM'>(see how to).</a><br />Gnosis network will also be integrated in the near future.<br />
            {/* To bridge assets from Ethereum Network to Gnosis Chain use <a class="style" href="https://bridge.xdaichain.com/">xDai Bridge</a> <a class="style" href='https://www.xdaichain.com/for-users/bridges/converting-xdai-via-bridge/moving-dai-to-xdai'>(see how to).</a><br /> */}<br />
            {/*             <div style={style}>
            </div> */}
            <a class="style" href="https://discord.gg/faGyranTsx">discord</a><br/>
            <a class="style" href={"mailto:hicetnunc2000@protonmail.com"}>email</a><br/><br/>
            <a class="style" href="https://github.com/hicetnunc2000">github</a><br/>
            <a class="style" href="https://thegraph.com/hosted-service/subgraph/crzypatchwork/ungrund">the graph</a>
        </div>
    )
}