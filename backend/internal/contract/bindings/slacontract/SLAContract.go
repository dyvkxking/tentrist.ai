// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package slacontract

import (
	"errors"
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
	_ = abi.ConvertType
)

// SLABenchmark is an auto generated low-level Go binding around an user-defined struct.
type SLABenchmark struct {
	RequiredUptime     *big.Int
	RequiredThroughput *big.Int
	Deadline           *big.Int
	Fulfilled          bool
	Exists             bool
}

// SlacontractMetaData contains all meta data concerning the Slacontract contract.
var SlacontractMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"contractIEscrow\",\"name\":\"_escrow\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"jobId\",\"type\":\"bytes32\"},{\"indexed\":false,\"internalType\":\"bool\",\"name\":\"success\",\"type\":\"bool\"}],\"name\":\"SLAFulfilled\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"jobId\",\"type\":\"bytes32\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"requiredUptime\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"requiredThroughput\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"deadline\",\"type\":\"uint256\"}],\"name\":\"SLARecorded\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"caller\",\"type\":\"address\"}],\"name\":\"authorizeCaller\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"escrow\",\"outputs\":[{\"internalType\":\"contractIEscrow\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"jobId\",\"type\":\"bytes32\"},{\"internalType\":\"bool\",\"name\":\"success\",\"type\":\"bool\"}],\"name\":\"fulfillSLA\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getEscrow\",\"outputs\":[{\"internalType\":\"contractIEscrow\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"jobId\",\"type\":\"bytes32\"}],\"name\":\"getSLA\",\"outputs\":[{\"components\":[{\"internalType\":\"uint256\",\"name\":\"requiredUptime\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"requiredThroughput\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"deadline\",\"type\":\"uint256\"},{\"internalType\":\"bool\",\"name\":\"fulfilled\",\"type\":\"bool\"},{\"internalType\":\"bool\",\"name\":\"exists\",\"type\":\"bool\"}],\"internalType\":\"structSLABenchmark\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"jobId\",\"type\":\"bytes32\"}],\"name\":\"getSLAParams\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"uptime\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"throughput\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"deadline\",\"type\":\"uint256\"},{\"internalType\":\"bool\",\"name\":\"fulfilled\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"jobId\",\"type\":\"bytes32\"}],\"name\":\"hasSLA\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"caller\",\"type\":\"address\"}],\"name\":\"isAuthorized\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"jobId\",\"type\":\"bytes32\"}],\"name\":\"isBreached\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"jobId\",\"type\":\"bytes32\"}],\"name\":\"isFulfilled\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"jobId\",\"type\":\"bytes32\"},{\"internalType\":\"uint256\",\"name\":\"requiredUptime\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"requiredThroughput\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"deadline\",\"type\":\"uint256\"}],\"name\":\"recordSLA\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"caller\",\"type\":\"address\"}],\"name\":\"revokeCaller\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]",
	Bin: "0x60806040523480156200001157600080fd5b5060405162001646380380620016468339818101604052810190620000379190620001c7565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603620000a9576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620000a0906200025a565b60405180910390fd5b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506001600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff021916908315150217905550506200027c565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006200017b826200014e565b9050919050565b60006200018f826200016e565b9050919050565b620001a18162000182565b8114620001ad57600080fd5b50565b600081519050620001c18162000196565b92915050565b600060208284031215620001e057620001df62000149565b5b6000620001f084828501620001b0565b91505092915050565b600082825260208201905092915050565b7f457363726f7720616464726573732063616e6e6f74206265207a65726f000000600082015250565b600062000242601d83620001f9565b91506200024f826200020a565b602082019050919050565b60006020820190508181036000830152620002758162000233565b9050919050565b6113ba806200028c6000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c8063e350ec1e11610071578063e350ec1e14610190578063e5b92d4a146101ac578063eae89574146101c8578063ed75e1cc146101f8578063fa832d5f14610228578063fe9fbb8014610258576100b4565b806302b0ce7b146100b95780632c388d5d146100ec5780635913b8d514610108578063a208ae3814610138578063b774353014610156578063e2fdcc1714610172575b600080fd5b6100d360048036038101906100ce9190610c50565b610288565b6040516100e39493929190610cb1565b60405180910390f35b61010660048036038101906101019190610d54565b61038b565b005b610122600480360381019061011d9190610c50565b6103e6565b60405161012f9190610e07565b60405180910390f35b6101406104ca565b60405161014d9190610e81565b60405180910390f35b610170600480360381019061016b9190610d54565b6104f4565b005b61017a61054f565b6040516101879190610e81565b60405180910390f35b6101aa60048036038101906101a59190610ec8565b610575565b005b6101c660048036038101906101c19190610f5b565b610861565b005b6101e260048036038101906101dd9190610c50565b610a1f565b6040516101ef9190610f9b565b60405180910390f35b610212600480360381019061020d9190610c50565b610a4b565b60405161021f9190610f9b565b60405180910390f35b610242600480360381019061023d9190610c50565b610adb565b60405161024f9190610f9b565b60405180910390f35b610272600480360381019061026d9190610d54565b610b8c565b60405161027f9190610f9b565b60405180910390f35b6000806000808460008082815260200190815260200160002060030160019054906101000a900460ff166102f1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102e890611013565b60405180910390fd5b60008060008881526020019081526020016000206040518060a00160405290816000820154815260200160018201548152602001600282015481526020016003820160009054906101000a900460ff161515151581526020016003820160019054906101000a900460ff16151515158152505090508060000151816020015182604001518360600151955095509550955050509193509193565b6001600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b6103ee610be2565b8160008082815260200190815260200160002060030160019054906101000a900460ff16610451576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161044890611013565b60405180910390fd5b6000808481526020019081526020016000206040518060a00160405290816000820154815260200160018201548152602001600282015481526020016003820160009054906101000a900460ff161515151581526020016003820160019054906101000a900460ff161515151581525050915050919050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16610601576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105f89061107f565b60405180910390fd5b6000801b8403610646576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161063d906110eb565b60405180910390fd5b60008085815260200190815260200160002060030160019054906101000a900460ff16156106a9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106a09061117d565b60405180910390fd5b6000831180156106bb57506127108311155b6106fa576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106f1906111e9565b60405180910390fd5b6000821161073d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161073490611255565b60405180910390fd5b42811161077f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610776906112c1565b60405180910390fd5b6040518060a001604052808481526020018381526020018281526020016000151581526020016001151581525060008086815260200190815260200160002060008201518160000155602082015181600101556040820151816002015560608201518160030160006101000a81548160ff02191690831515021790555060808201518160030160016101000a81548160ff021916908315150217905550905050837f4d59dc5fc9b1da3ef9ff6af7a4738231844ed7bbb1d32f655a8623c32e879590848484604051610853939291906112e1565b60405180910390a250505050565b600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff166108ed576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108e49061107f565b60405180910390fd5b8160008082815260200190815260200160002060030160019054906101000a900460ff16610950576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161094790611013565b60405180910390fd5b8260008082815260200190815260200160002060030160009054906101000a900460ff16156109b4576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109ab90611364565b60405180910390fd5b8260008086815260200190815260200160002060030160006101000a81548160ff021916908315150217905550837f2c3ee55f1f7cb8bb7c016c8d1356e0486e0a9cd9ca9b7084fc4cf9d538c9c55e84604051610a119190610f9b565b60405180910390a250505050565b600080600083815260200190815260200160002060030160019054906101000a900460ff169050919050565b60008160008082815260200190815260200160002060030160019054906101000a900460ff16610ab0576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610aa790611013565b60405180910390fd5b60008084815260200190815260200160002060030160009054906101000a900460ff16915050919050565b60008160008082815260200190815260200160002060030160019054906101000a900460ff16610b40576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b3790611013565b60405180910390fd5b6000808481526020019081526020016000206002015442118015610b84575060008084815260200190815260200160002060030160009054906101000a900460ff16155b915050919050565b6000600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff169050919050565b6040518060a001604052806000815260200160008152602001600081526020016000151581526020016000151581525090565b600080fd5b6000819050919050565b610c2d81610c1a565b8114610c3857600080fd5b50565b600081359050610c4a81610c24565b92915050565b600060208284031215610c6657610c65610c15565b5b6000610c7484828501610c3b565b91505092915050565b6000819050919050565b610c9081610c7d565b82525050565b60008115159050919050565b610cab81610c96565b82525050565b6000608082019050610cc66000830187610c87565b610cd36020830186610c87565b610ce06040830185610c87565b610ced6060830184610ca2565b95945050505050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610d2182610cf6565b9050919050565b610d3181610d16565b8114610d3c57600080fd5b50565b600081359050610d4e81610d28565b92915050565b600060208284031215610d6a57610d69610c15565b5b6000610d7884828501610d3f565b91505092915050565b610d8a81610c7d565b82525050565b610d9981610c96565b82525050565b60a082016000820151610db56000850182610d81565b506020820151610dc86020850182610d81565b506040820151610ddb6040850182610d81565b506060820151610dee6060850182610d90565b506080820151610e016080850182610d90565b50505050565b600060a082019050610e1c6000830184610d9f565b92915050565b6000819050919050565b6000610e47610e42610e3d84610cf6565b610e22565b610cf6565b9050919050565b6000610e5982610e2c565b9050919050565b6000610e6b82610e4e565b9050919050565b610e7b81610e60565b82525050565b6000602082019050610e966000830184610e72565b92915050565b610ea581610c7d565b8114610eb057600080fd5b50565b600081359050610ec281610e9c565b92915050565b60008060008060808587031215610ee257610ee1610c15565b5b6000610ef087828801610c3b565b9450506020610f0187828801610eb3565b9350506040610f1287828801610eb3565b9250506060610f2387828801610eb3565b91505092959194509250565b610f3881610c96565b8114610f4357600080fd5b50565b600081359050610f5581610f2f565b92915050565b60008060408385031215610f7257610f71610c15565b5b6000610f8085828601610c3b565b9250506020610f9185828601610f46565b9150509250929050565b6000602082019050610fb06000830184610ca2565b92915050565b600082825260208201905092915050565b7f534c4120646f6573206e6f742065786973740000000000000000000000000000600082015250565b6000610ffd601283610fb6565b915061100882610fc7565b602082019050919050565b6000602082019050818103600083015261102c81610ff0565b9050919050565b7f43616c6c6572206e6f7420617574686f72697a65640000000000000000000000600082015250565b6000611069601583610fb6565b915061107482611033565b602082019050919050565b600060208201905081810360008301526110988161105c565b9050919050565b7f4a6f622049442063616e6e6f74206265207a65726f0000000000000000000000600082015250565b60006110d5601583610fb6565b91506110e08261109f565b602082019050919050565b60006020820190508181036000830152611104816110c8565b9050919050565b7f534c4120616c7265616479207265636f7264656420666f722074686973206a6f60008201527f6200000000000000000000000000000000000000000000000000000000000000602082015250565b6000611167602183610fb6565b91506111728261110b565b604082019050919050565b600060208201905081810360008301526111968161115a565b9050919050565b7f496e76616c696420757074696d652076616c7565000000000000000000000000600082015250565b60006111d3601483610fb6565b91506111de8261119d565b602082019050919050565b60006020820190508181036000830152611202816111c6565b9050919050565b7f5468726f756768707574206d75737420626520706f7369746976650000000000600082015250565b600061123f601b83610fb6565b915061124a82611209565b602082019050919050565b6000602082019050818103600083015261126e81611232565b9050919050565b7f446561646c696e65206d75737420626520696e20746865206675747572650000600082015250565b60006112ab601e83610fb6565b91506112b682611275565b602082019050919050565b600060208201905081810360008301526112da8161129e565b9050919050565b60006060820190506112f66000830186610c87565b6113036020830185610c87565b6113106040830184610c87565b949350505050565b7f534c4120616c72656164792066756c66696c6c65640000000000000000000000600082015250565b600061134e601583610fb6565b915061135982611318565b602082019050919050565b6000602082019050818103600083015261137d81611341565b905091905056fea26469706673582212200d559756f801e0f5af91036e559fd8b8830f1d84cff8f759f688d684f87f774164736f6c63430008180033",
}

// SlacontractABI is the input ABI used to generate the binding from.
// Deprecated: Use SlacontractMetaData.ABI instead.
var SlacontractABI = SlacontractMetaData.ABI

// SlacontractBin is the compiled bytecode used for deploying new contracts.
// Deprecated: Use SlacontractMetaData.Bin instead.
var SlacontractBin = SlacontractMetaData.Bin

// DeploySlacontract deploys a new Ethereum contract, binding an instance of Slacontract to it.
func DeploySlacontract(auth *bind.TransactOpts, backend bind.ContractBackend, _escrow common.Address) (common.Address, *types.Transaction, *Slacontract, error) {
	parsed, err := SlacontractMetaData.GetAbi()
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	if parsed == nil {
		return common.Address{}, nil, nil, errors.New("GetABI returned nil")
	}

	address, tx, contract, err := bind.DeployContract(auth, *parsed, common.FromHex(SlacontractBin), backend, _escrow)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &Slacontract{SlacontractCaller: SlacontractCaller{contract: contract}, SlacontractTransactor: SlacontractTransactor{contract: contract}, SlacontractFilterer: SlacontractFilterer{contract: contract}}, nil
}

// Slacontract is an auto generated Go binding around an Ethereum contract.
type Slacontract struct {
	SlacontractCaller     // Read-only binding to the contract
	SlacontractTransactor // Write-only binding to the contract
	SlacontractFilterer   // Log filterer for contract events
}

// SlacontractCaller is an auto generated read-only Go binding around an Ethereum contract.
type SlacontractCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// SlacontractTransactor is an auto generated write-only Go binding around an Ethereum contract.
type SlacontractTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// SlacontractFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type SlacontractFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// SlacontractSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type SlacontractSession struct {
	Contract     *Slacontract      // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// SlacontractCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type SlacontractCallerSession struct {
	Contract *SlacontractCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts      // Call options to use throughout this session
}

// SlacontractTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type SlacontractTransactorSession struct {
	Contract     *SlacontractTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts      // Transaction auth options to use throughout this session
}

// SlacontractRaw is an auto generated low-level Go binding around an Ethereum contract.
type SlacontractRaw struct {
	Contract *Slacontract // Generic contract binding to access the raw methods on
}

// SlacontractCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type SlacontractCallerRaw struct {
	Contract *SlacontractCaller // Generic read-only contract binding to access the raw methods on
}

// SlacontractTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type SlacontractTransactorRaw struct {
	Contract *SlacontractTransactor // Generic write-only contract binding to access the raw methods on
}

// NewSlacontract creates a new instance of Slacontract, bound to a specific deployed contract.
func NewSlacontract(address common.Address, backend bind.ContractBackend) (*Slacontract, error) {
	contract, err := bindSlacontract(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Slacontract{SlacontractCaller: SlacontractCaller{contract: contract}, SlacontractTransactor: SlacontractTransactor{contract: contract}, SlacontractFilterer: SlacontractFilterer{contract: contract}}, nil
}

// NewSlacontractCaller creates a new read-only instance of Slacontract, bound to a specific deployed contract.
func NewSlacontractCaller(address common.Address, caller bind.ContractCaller) (*SlacontractCaller, error) {
	contract, err := bindSlacontract(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &SlacontractCaller{contract: contract}, nil
}

// NewSlacontractTransactor creates a new write-only instance of Slacontract, bound to a specific deployed contract.
func NewSlacontractTransactor(address common.Address, transactor bind.ContractTransactor) (*SlacontractTransactor, error) {
	contract, err := bindSlacontract(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &SlacontractTransactor{contract: contract}, nil
}

// NewSlacontractFilterer creates a new log filterer instance of Slacontract, bound to a specific deployed contract.
func NewSlacontractFilterer(address common.Address, filterer bind.ContractFilterer) (*SlacontractFilterer, error) {
	contract, err := bindSlacontract(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &SlacontractFilterer{contract: contract}, nil
}

// bindSlacontract binds a generic wrapper to an already deployed contract.
func bindSlacontract(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := SlacontractMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Slacontract *SlacontractRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Slacontract.Contract.SlacontractCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Slacontract *SlacontractRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Slacontract.Contract.SlacontractTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Slacontract *SlacontractRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Slacontract.Contract.SlacontractTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Slacontract *SlacontractCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Slacontract.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Slacontract *SlacontractTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Slacontract.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Slacontract *SlacontractTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Slacontract.Contract.contract.Transact(opts, method, params...)
}

// Escrow is a free data retrieval call binding the contract method 0xe2fdcc17.
//
// Solidity: function escrow() view returns(address)
func (_Slacontract *SlacontractCaller) Escrow(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _Slacontract.contract.Call(opts, &out, "escrow")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// Escrow is a free data retrieval call binding the contract method 0xe2fdcc17.
//
// Solidity: function escrow() view returns(address)
func (_Slacontract *SlacontractSession) Escrow() (common.Address, error) {
	return _Slacontract.Contract.Escrow(&_Slacontract.CallOpts)
}

// Escrow is a free data retrieval call binding the contract method 0xe2fdcc17.
//
// Solidity: function escrow() view returns(address)
func (_Slacontract *SlacontractCallerSession) Escrow() (common.Address, error) {
	return _Slacontract.Contract.Escrow(&_Slacontract.CallOpts)
}

// GetEscrow is a free data retrieval call binding the contract method 0xa208ae38.
//
// Solidity: function getEscrow() view returns(address)
func (_Slacontract *SlacontractCaller) GetEscrow(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _Slacontract.contract.Call(opts, &out, "getEscrow")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// GetEscrow is a free data retrieval call binding the contract method 0xa208ae38.
//
// Solidity: function getEscrow() view returns(address)
func (_Slacontract *SlacontractSession) GetEscrow() (common.Address, error) {
	return _Slacontract.Contract.GetEscrow(&_Slacontract.CallOpts)
}

// GetEscrow is a free data retrieval call binding the contract method 0xa208ae38.
//
// Solidity: function getEscrow() view returns(address)
func (_Slacontract *SlacontractCallerSession) GetEscrow() (common.Address, error) {
	return _Slacontract.Contract.GetEscrow(&_Slacontract.CallOpts)
}

// GetSLA is a free data retrieval call binding the contract method 0x5913b8d5.
//
// Solidity: function getSLA(bytes32 jobId) view returns((uint256,uint256,uint256,bool,bool))
func (_Slacontract *SlacontractCaller) GetSLA(opts *bind.CallOpts, jobId [32]byte) (SLABenchmark, error) {
	var out []interface{}
	err := _Slacontract.contract.Call(opts, &out, "getSLA", jobId)

	if err != nil {
		return *new(SLABenchmark), err
	}

	out0 := *abi.ConvertType(out[0], new(SLABenchmark)).(*SLABenchmark)

	return out0, err

}

// GetSLA is a free data retrieval call binding the contract method 0x5913b8d5.
//
// Solidity: function getSLA(bytes32 jobId) view returns((uint256,uint256,uint256,bool,bool))
func (_Slacontract *SlacontractSession) GetSLA(jobId [32]byte) (SLABenchmark, error) {
	return _Slacontract.Contract.GetSLA(&_Slacontract.CallOpts, jobId)
}

// GetSLA is a free data retrieval call binding the contract method 0x5913b8d5.
//
// Solidity: function getSLA(bytes32 jobId) view returns((uint256,uint256,uint256,bool,bool))
func (_Slacontract *SlacontractCallerSession) GetSLA(jobId [32]byte) (SLABenchmark, error) {
	return _Slacontract.Contract.GetSLA(&_Slacontract.CallOpts, jobId)
}

// GetSLAParams is a free data retrieval call binding the contract method 0x02b0ce7b.
//
// Solidity: function getSLAParams(bytes32 jobId) view returns(uint256 uptime, uint256 throughput, uint256 deadline, bool fulfilled)
func (_Slacontract *SlacontractCaller) GetSLAParams(opts *bind.CallOpts, jobId [32]byte) (struct {
	Uptime     *big.Int
	Throughput *big.Int
	Deadline   *big.Int
	Fulfilled  bool
}, error) {
	var out []interface{}
	err := _Slacontract.contract.Call(opts, &out, "getSLAParams", jobId)

	outstruct := new(struct {
		Uptime     *big.Int
		Throughput *big.Int
		Deadline   *big.Int
		Fulfilled  bool
	})
	if err != nil {
		return *outstruct, err
	}

	outstruct.Uptime = *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)
	outstruct.Throughput = *abi.ConvertType(out[1], new(*big.Int)).(**big.Int)
	outstruct.Deadline = *abi.ConvertType(out[2], new(*big.Int)).(**big.Int)
	outstruct.Fulfilled = *abi.ConvertType(out[3], new(bool)).(*bool)

	return *outstruct, err

}

// GetSLAParams is a free data retrieval call binding the contract method 0x02b0ce7b.
//
// Solidity: function getSLAParams(bytes32 jobId) view returns(uint256 uptime, uint256 throughput, uint256 deadline, bool fulfilled)
func (_Slacontract *SlacontractSession) GetSLAParams(jobId [32]byte) (struct {
	Uptime     *big.Int
	Throughput *big.Int
	Deadline   *big.Int
	Fulfilled  bool
}, error) {
	return _Slacontract.Contract.GetSLAParams(&_Slacontract.CallOpts, jobId)
}

// GetSLAParams is a free data retrieval call binding the contract method 0x02b0ce7b.
//
// Solidity: function getSLAParams(bytes32 jobId) view returns(uint256 uptime, uint256 throughput, uint256 deadline, bool fulfilled)
func (_Slacontract *SlacontractCallerSession) GetSLAParams(jobId [32]byte) (struct {
	Uptime     *big.Int
	Throughput *big.Int
	Deadline   *big.Int
	Fulfilled  bool
}, error) {
	return _Slacontract.Contract.GetSLAParams(&_Slacontract.CallOpts, jobId)
}

// HasSLA is a free data retrieval call binding the contract method 0xeae89574.
//
// Solidity: function hasSLA(bytes32 jobId) view returns(bool)
func (_Slacontract *SlacontractCaller) HasSLA(opts *bind.CallOpts, jobId [32]byte) (bool, error) {
	var out []interface{}
	err := _Slacontract.contract.Call(opts, &out, "hasSLA", jobId)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// HasSLA is a free data retrieval call binding the contract method 0xeae89574.
//
// Solidity: function hasSLA(bytes32 jobId) view returns(bool)
func (_Slacontract *SlacontractSession) HasSLA(jobId [32]byte) (bool, error) {
	return _Slacontract.Contract.HasSLA(&_Slacontract.CallOpts, jobId)
}

// HasSLA is a free data retrieval call binding the contract method 0xeae89574.
//
// Solidity: function hasSLA(bytes32 jobId) view returns(bool)
func (_Slacontract *SlacontractCallerSession) HasSLA(jobId [32]byte) (bool, error) {
	return _Slacontract.Contract.HasSLA(&_Slacontract.CallOpts, jobId)
}

// IsAuthorized is a free data retrieval call binding the contract method 0xfe9fbb80.
//
// Solidity: function isAuthorized(address caller) view returns(bool)
func (_Slacontract *SlacontractCaller) IsAuthorized(opts *bind.CallOpts, caller common.Address) (bool, error) {
	var out []interface{}
	err := _Slacontract.contract.Call(opts, &out, "isAuthorized", caller)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// IsAuthorized is a free data retrieval call binding the contract method 0xfe9fbb80.
//
// Solidity: function isAuthorized(address caller) view returns(bool)
func (_Slacontract *SlacontractSession) IsAuthorized(caller common.Address) (bool, error) {
	return _Slacontract.Contract.IsAuthorized(&_Slacontract.CallOpts, caller)
}

// IsAuthorized is a free data retrieval call binding the contract method 0xfe9fbb80.
//
// Solidity: function isAuthorized(address caller) view returns(bool)
func (_Slacontract *SlacontractCallerSession) IsAuthorized(caller common.Address) (bool, error) {
	return _Slacontract.Contract.IsAuthorized(&_Slacontract.CallOpts, caller)
}

// IsBreached is a free data retrieval call binding the contract method 0xfa832d5f.
//
// Solidity: function isBreached(bytes32 jobId) view returns(bool)
func (_Slacontract *SlacontractCaller) IsBreached(opts *bind.CallOpts, jobId [32]byte) (bool, error) {
	var out []interface{}
	err := _Slacontract.contract.Call(opts, &out, "isBreached", jobId)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// IsBreached is a free data retrieval call binding the contract method 0xfa832d5f.
//
// Solidity: function isBreached(bytes32 jobId) view returns(bool)
func (_Slacontract *SlacontractSession) IsBreached(jobId [32]byte) (bool, error) {
	return _Slacontract.Contract.IsBreached(&_Slacontract.CallOpts, jobId)
}

// IsBreached is a free data retrieval call binding the contract method 0xfa832d5f.
//
// Solidity: function isBreached(bytes32 jobId) view returns(bool)
func (_Slacontract *SlacontractCallerSession) IsBreached(jobId [32]byte) (bool, error) {
	return _Slacontract.Contract.IsBreached(&_Slacontract.CallOpts, jobId)
}

// IsFulfilled is a free data retrieval call binding the contract method 0xed75e1cc.
//
// Solidity: function isFulfilled(bytes32 jobId) view returns(bool)
func (_Slacontract *SlacontractCaller) IsFulfilled(opts *bind.CallOpts, jobId [32]byte) (bool, error) {
	var out []interface{}
	err := _Slacontract.contract.Call(opts, &out, "isFulfilled", jobId)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// IsFulfilled is a free data retrieval call binding the contract method 0xed75e1cc.
//
// Solidity: function isFulfilled(bytes32 jobId) view returns(bool)
func (_Slacontract *SlacontractSession) IsFulfilled(jobId [32]byte) (bool, error) {
	return _Slacontract.Contract.IsFulfilled(&_Slacontract.CallOpts, jobId)
}

// IsFulfilled is a free data retrieval call binding the contract method 0xed75e1cc.
//
// Solidity: function isFulfilled(bytes32 jobId) view returns(bool)
func (_Slacontract *SlacontractCallerSession) IsFulfilled(jobId [32]byte) (bool, error) {
	return _Slacontract.Contract.IsFulfilled(&_Slacontract.CallOpts, jobId)
}

// AuthorizeCaller is a paid mutator transaction binding the contract method 0x2c388d5d.
//
// Solidity: function authorizeCaller(address caller) returns()
func (_Slacontract *SlacontractTransactor) AuthorizeCaller(opts *bind.TransactOpts, caller common.Address) (*types.Transaction, error) {
	return _Slacontract.contract.Transact(opts, "authorizeCaller", caller)
}

// AuthorizeCaller is a paid mutator transaction binding the contract method 0x2c388d5d.
//
// Solidity: function authorizeCaller(address caller) returns()
func (_Slacontract *SlacontractSession) AuthorizeCaller(caller common.Address) (*types.Transaction, error) {
	return _Slacontract.Contract.AuthorizeCaller(&_Slacontract.TransactOpts, caller)
}

// AuthorizeCaller is a paid mutator transaction binding the contract method 0x2c388d5d.
//
// Solidity: function authorizeCaller(address caller) returns()
func (_Slacontract *SlacontractTransactorSession) AuthorizeCaller(caller common.Address) (*types.Transaction, error) {
	return _Slacontract.Contract.AuthorizeCaller(&_Slacontract.TransactOpts, caller)
}

// FulfillSLA is a paid mutator transaction binding the contract method 0xe5b92d4a.
//
// Solidity: function fulfillSLA(bytes32 jobId, bool success) returns()
func (_Slacontract *SlacontractTransactor) FulfillSLA(opts *bind.TransactOpts, jobId [32]byte, success bool) (*types.Transaction, error) {
	return _Slacontract.contract.Transact(opts, "fulfillSLA", jobId, success)
}

// FulfillSLA is a paid mutator transaction binding the contract method 0xe5b92d4a.
//
// Solidity: function fulfillSLA(bytes32 jobId, bool success) returns()
func (_Slacontract *SlacontractSession) FulfillSLA(jobId [32]byte, success bool) (*types.Transaction, error) {
	return _Slacontract.Contract.FulfillSLA(&_Slacontract.TransactOpts, jobId, success)
}

// FulfillSLA is a paid mutator transaction binding the contract method 0xe5b92d4a.
//
// Solidity: function fulfillSLA(bytes32 jobId, bool success) returns()
func (_Slacontract *SlacontractTransactorSession) FulfillSLA(jobId [32]byte, success bool) (*types.Transaction, error) {
	return _Slacontract.Contract.FulfillSLA(&_Slacontract.TransactOpts, jobId, success)
}

// RecordSLA is a paid mutator transaction binding the contract method 0xe350ec1e.
//
// Solidity: function recordSLA(bytes32 jobId, uint256 requiredUptime, uint256 requiredThroughput, uint256 deadline) returns()
func (_Slacontract *SlacontractTransactor) RecordSLA(opts *bind.TransactOpts, jobId [32]byte, requiredUptime *big.Int, requiredThroughput *big.Int, deadline *big.Int) (*types.Transaction, error) {
	return _Slacontract.contract.Transact(opts, "recordSLA", jobId, requiredUptime, requiredThroughput, deadline)
}

// RecordSLA is a paid mutator transaction binding the contract method 0xe350ec1e.
//
// Solidity: function recordSLA(bytes32 jobId, uint256 requiredUptime, uint256 requiredThroughput, uint256 deadline) returns()
func (_Slacontract *SlacontractSession) RecordSLA(jobId [32]byte, requiredUptime *big.Int, requiredThroughput *big.Int, deadline *big.Int) (*types.Transaction, error) {
	return _Slacontract.Contract.RecordSLA(&_Slacontract.TransactOpts, jobId, requiredUptime, requiredThroughput, deadline)
}

// RecordSLA is a paid mutator transaction binding the contract method 0xe350ec1e.
//
// Solidity: function recordSLA(bytes32 jobId, uint256 requiredUptime, uint256 requiredThroughput, uint256 deadline) returns()
func (_Slacontract *SlacontractTransactorSession) RecordSLA(jobId [32]byte, requiredUptime *big.Int, requiredThroughput *big.Int, deadline *big.Int) (*types.Transaction, error) {
	return _Slacontract.Contract.RecordSLA(&_Slacontract.TransactOpts, jobId, requiredUptime, requiredThroughput, deadline)
}

// RevokeCaller is a paid mutator transaction binding the contract method 0xb7743530.
//
// Solidity: function revokeCaller(address caller) returns()
func (_Slacontract *SlacontractTransactor) RevokeCaller(opts *bind.TransactOpts, caller common.Address) (*types.Transaction, error) {
	return _Slacontract.contract.Transact(opts, "revokeCaller", caller)
}

// RevokeCaller is a paid mutator transaction binding the contract method 0xb7743530.
//
// Solidity: function revokeCaller(address caller) returns()
func (_Slacontract *SlacontractSession) RevokeCaller(caller common.Address) (*types.Transaction, error) {
	return _Slacontract.Contract.RevokeCaller(&_Slacontract.TransactOpts, caller)
}

// RevokeCaller is a paid mutator transaction binding the contract method 0xb7743530.
//
// Solidity: function revokeCaller(address caller) returns()
func (_Slacontract *SlacontractTransactorSession) RevokeCaller(caller common.Address) (*types.Transaction, error) {
	return _Slacontract.Contract.RevokeCaller(&_Slacontract.TransactOpts, caller)
}

// SlacontractSLAFulfilledIterator is returned from FilterSLAFulfilled and is used to iterate over the raw logs and unpacked data for SLAFulfilled events raised by the Slacontract contract.
type SlacontractSLAFulfilledIterator struct {
	Event *SlacontractSLAFulfilled // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *SlacontractSLAFulfilledIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SlacontractSLAFulfilled)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(SlacontractSLAFulfilled)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *SlacontractSLAFulfilledIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SlacontractSLAFulfilledIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SlacontractSLAFulfilled represents a SLAFulfilled event raised by the Slacontract contract.
type SlacontractSLAFulfilled struct {
	JobId   [32]byte
	Success bool
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterSLAFulfilled is a free log retrieval operation binding the contract event 0x2c3ee55f1f7cb8bb7c016c8d1356e0486e0a9cd9ca9b7084fc4cf9d538c9c55e.
//
// Solidity: event SLAFulfilled(bytes32 indexed jobId, bool success)
func (_Slacontract *SlacontractFilterer) FilterSLAFulfilled(opts *bind.FilterOpts, jobId [][32]byte) (*SlacontractSLAFulfilledIterator, error) {

	var jobIdRule []interface{}
	for _, jobIdItem := range jobId {
		jobIdRule = append(jobIdRule, jobIdItem)
	}

	logs, sub, err := _Slacontract.contract.FilterLogs(opts, "SLAFulfilled", jobIdRule)
	if err != nil {
		return nil, err
	}
	return &SlacontractSLAFulfilledIterator{contract: _Slacontract.contract, event: "SLAFulfilled", logs: logs, sub: sub}, nil
}

// WatchSLAFulfilled is a free log subscription operation binding the contract event 0x2c3ee55f1f7cb8bb7c016c8d1356e0486e0a9cd9ca9b7084fc4cf9d538c9c55e.
//
// Solidity: event SLAFulfilled(bytes32 indexed jobId, bool success)
func (_Slacontract *SlacontractFilterer) WatchSLAFulfilled(opts *bind.WatchOpts, sink chan<- *SlacontractSLAFulfilled, jobId [][32]byte) (event.Subscription, error) {

	var jobIdRule []interface{}
	for _, jobIdItem := range jobId {
		jobIdRule = append(jobIdRule, jobIdItem)
	}

	logs, sub, err := _Slacontract.contract.WatchLogs(opts, "SLAFulfilled", jobIdRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SlacontractSLAFulfilled)
				if err := _Slacontract.contract.UnpackLog(event, "SLAFulfilled", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseSLAFulfilled is a log parse operation binding the contract event 0x2c3ee55f1f7cb8bb7c016c8d1356e0486e0a9cd9ca9b7084fc4cf9d538c9c55e.
//
// Solidity: event SLAFulfilled(bytes32 indexed jobId, bool success)
func (_Slacontract *SlacontractFilterer) ParseSLAFulfilled(log types.Log) (*SlacontractSLAFulfilled, error) {
	event := new(SlacontractSLAFulfilled)
	if err := _Slacontract.contract.UnpackLog(event, "SLAFulfilled", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// SlacontractSLARecordedIterator is returned from FilterSLARecorded and is used to iterate over the raw logs and unpacked data for SLARecorded events raised by the Slacontract contract.
type SlacontractSLARecordedIterator struct {
	Event *SlacontractSLARecorded // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *SlacontractSLARecordedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SlacontractSLARecorded)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(SlacontractSLARecorded)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *SlacontractSLARecordedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SlacontractSLARecordedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SlacontractSLARecorded represents a SLARecorded event raised by the Slacontract contract.
type SlacontractSLARecorded struct {
	JobId              [32]byte
	RequiredUptime     *big.Int
	RequiredThroughput *big.Int
	Deadline           *big.Int
	Raw                types.Log // Blockchain specific contextual infos
}

// FilterSLARecorded is a free log retrieval operation binding the contract event 0x4d59dc5fc9b1da3ef9ff6af7a4738231844ed7bbb1d32f655a8623c32e879590.
//
// Solidity: event SLARecorded(bytes32 indexed jobId, uint256 requiredUptime, uint256 requiredThroughput, uint256 deadline)
func (_Slacontract *SlacontractFilterer) FilterSLARecorded(opts *bind.FilterOpts, jobId [][32]byte) (*SlacontractSLARecordedIterator, error) {

	var jobIdRule []interface{}
	for _, jobIdItem := range jobId {
		jobIdRule = append(jobIdRule, jobIdItem)
	}

	logs, sub, err := _Slacontract.contract.FilterLogs(opts, "SLARecorded", jobIdRule)
	if err != nil {
		return nil, err
	}
	return &SlacontractSLARecordedIterator{contract: _Slacontract.contract, event: "SLARecorded", logs: logs, sub: sub}, nil
}

// WatchSLARecorded is a free log subscription operation binding the contract event 0x4d59dc5fc9b1da3ef9ff6af7a4738231844ed7bbb1d32f655a8623c32e879590.
//
// Solidity: event SLARecorded(bytes32 indexed jobId, uint256 requiredUptime, uint256 requiredThroughput, uint256 deadline)
func (_Slacontract *SlacontractFilterer) WatchSLARecorded(opts *bind.WatchOpts, sink chan<- *SlacontractSLARecorded, jobId [][32]byte) (event.Subscription, error) {

	var jobIdRule []interface{}
	for _, jobIdItem := range jobId {
		jobIdRule = append(jobIdRule, jobIdItem)
	}

	logs, sub, err := _Slacontract.contract.WatchLogs(opts, "SLARecorded", jobIdRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SlacontractSLARecorded)
				if err := _Slacontract.contract.UnpackLog(event, "SLARecorded", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseSLARecorded is a log parse operation binding the contract event 0x4d59dc5fc9b1da3ef9ff6af7a4738231844ed7bbb1d32f655a8623c32e879590.
//
// Solidity: event SLARecorded(bytes32 indexed jobId, uint256 requiredUptime, uint256 requiredThroughput, uint256 deadline)
func (_Slacontract *SlacontractFilterer) ParseSLARecorded(log types.Log) (*SlacontractSLARecorded, error) {
	event := new(SlacontractSLARecorded)
	if err := _Slacontract.contract.UnpackLog(event, "SLARecorded", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
