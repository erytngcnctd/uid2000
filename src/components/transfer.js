import { useContext, useState } from 'react'
import { UngrundContext } from '../context/UngrundContext'

var Contract = require('web3-eth-contract')
const Web3 = require('web3')

export const Transfer = ({ id }) => {

    const { erc1155Abi, erc1155, account } = useContext(UngrundContext)
    const [to, setTo] = useState(undefined)
    const [amount, setAmount] = useState(undefined)

    const transfer = async () => {
        let contract = new Contract(erc1155Abi, erc1155)
        console.log()
        let res = await contract.methods.safeTransferFrom(account, to, id, amount, '0x0').send({ from : account })
        console.log(res)
    }

    return (
        <div><br />
            <input type="text" placeholder="to" name="to" onChange={(e) => setTo(e.target.value)} /><br />
            <input type="text" placeholder="amount" name="amount" onChange={(e) => setAmount(e.target.value)} /><br />                
            <a class="button style" onClick={transfer} style={{ cursor : 'pointer' }}>transfer</a>
        </div>
    )
}