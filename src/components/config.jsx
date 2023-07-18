
import { Component } from "react"
import { UngrundContext } from "../context/UngrundContext"
import { create } from 'ipfs-http-client'
import { Contract } from 'web3-eth-contract'
import { Web3 } from 'web3'

// var Contract = require('web3-eth-contract')
// const Web3 = require('web3')
// const ls = require('local-storage')

export class Config extends Component {

    static contextType = UngrundContext

    state = {
        id : undefined,
        description : undefined
    }
    handleChange = e => this.setState({ [e.target.name]: e.target.value })

    updateId = async () => {
        let infuraUrl = 'https://ipfs.infura.io:5001'
        let ipfs = create(infuraUrl)

        Contract.setProvider(Web3.givenProvider);
        let contract = new Contract(this.context.idAbi, this.context.id)
        //let res = Web3.utils.hexToString('0x99808204135a2951893726a4bc22f73c21a0925d4015624342294c4bb93f1eae')
        //console.log(res)
        let obj = {
            description : this.state.description
        }

        let result = await contract.methods.register(this.state.id, `ipfs://${(await ipfs.add(await new Blob([JSON.stringify(obj)], {type: "application/json"}))).path}`).send({ from: localStorage.getItem('account') })
    }

    render() {

        return (
            <div><br/>
                <input type="text" placeholder="id" name="id" onChange={this.handleChange}></input><br />
                <input type="text" placeholder="description" name="description" onChange={this.handleChange}></input><br />
                {/*             <input type="text" placeholder="RPC" name="RPC"></input><br />
            <input type="text" placeholder="indexer" name="indexer"></input><br />
            <input type="checkbox" id="multiple" name="multiple" value="multiple"></input>
            <label for="multiple"> multiple collect</label><br/>
            <input type="checkbox" id="sensitive" name="sensitive" value="sensitive"></input>
            <label for="sensitive"> allow sensitive content</label><br/> */}
                {/*             <button>disable erc1155 permissions</button><br/>
            <button>disable erc20 permissions</button> */}
                <a className='style button' style={{ cursor: 'pointer' }} onClick={this.updateId}>update ungrund identity</a>
            </div>
        )
    }
}