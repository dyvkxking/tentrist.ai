// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package slashmanager

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

// SlashmanagerMetaData contains all meta data concerning the Slashmanager contract.
var SlashmanagerMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"contractIEscrow\",\"name\":\"_escrow\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"client\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"bytes32\",\"name\":\"jobId\",\"type\":\"bytes32\"}],\"name\":\"CreditIssued\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"bytes32\",\"name\":\"jobId\",\"type\":\"bytes32\"}],\"name\":\"NodeSlashed\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"BASIS_POINTS\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"CREDIT_PERCENT\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"SLASH_PERCENT\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"caller\",\"type\":\"address\"}],\"name\":\"authorizeCaller\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"jobValue\",\"type\":\"uint256\"}],\"name\":\"calculateCredit\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"jobValue\",\"type\":\"uint256\"}],\"name\":\"calculateSlash\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"jobValue\",\"type\":\"uint256\"}],\"name\":\"calculateTreasury\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"escrow\",\"outputs\":[{\"internalType\":\"contractIEscrow\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getBasisPoints\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getCreditPercent\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getEscrow\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getSlashPercent\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"caller\",\"type\":\"address\"}],\"name\":\"isAuthorized\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"caller\",\"type\":\"address\"}],\"name\":\"revokeCaller\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"client\",\"type\":\"address\"},{\"internalType\":\"bytes32\",\"name\":\"jobId\",\"type\":\"bytes32\"},{\"internalType\":\"uint256\",\"name\":\"jobValue\",\"type\":\"uint256\"}],\"name\":\"slashAndCredit\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"stateMutability\":\"payable\",\"type\":\"receive\"}]",
	Bin: "0x60806040523480156200001157600080fd5b5060405162001426380380620014268339818101604052810190620000379190620001c5565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603620000a9576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620000a09062000258565b60405180910390fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff021916908315150217905550506200027a565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600062000179826200014c565b9050919050565b60006200018d826200016c565b9050919050565b6200019f8162000180565b8114620001ab57600080fd5b50565b600081519050620001bf8162000194565b92915050565b600060208284031215620001de57620001dd62000147565b5b6000620001ee84828501620001ae565b91505092915050565b600082825260208201905092915050565b7f457363726f7720616464726573732063616e6e6f74206265207a65726f000000600082015250565b600062000240601d83620001f7565b91506200024d8262000208565b602082019050919050565b60006020820190508181036000830152620002738162000231565b9050919050565b61119c806200028a6000396000f3fe6080604052600436106100eb5760003560e01c8063a8cee8f01161008a578063e2fdcc1711610059578063e2fdcc17146102ee578063e993130b14610319578063f6e8913d14610356578063fe9fbb8014610381576100f2565b8063a8cee8f014610234578063b774353014610271578063da1e57571461029a578063e1f1c4a7146102c3576100f2565b806381e35e3c116100c657806381e35e3c1461018857806397a18e5f146101b3578063a208ae38146101de578063a5f4ac1914610209576100f2565b806257d43e146100f75780631f4c9205146101345780632c388d5d1461015f576100f2565b366100f257005b600080fd5b34801561010357600080fd5b5061011e60048036038101906101199190610a10565b6103be565b60405161012b9190610a4c565b60405180910390f35b34801561014057600080fd5b506101496103e2565b6040516101569190610a4c565b60405180910390f35b34801561016b57600080fd5b5061018660048036038101906101819190610ac5565b6103ec565b005b34801561019457600080fd5b5061019d610446565b6040516101aa9190610a4c565b60405180910390f35b3480156101bf57600080fd5b506101c861044c565b6040516101d59190610a4c565b60405180910390f35b3480156101ea57600080fd5b506101f3610456565b6040516102009190610b01565b60405180910390f35b34801561021557600080fd5b5061021e61047f565b60405161022b9190610a4c565b60405180910390f35b34801561024057600080fd5b5061025b60048036038101906102569190610a10565b610489565b6040516102689190610a4c565b60405180910390f35b34801561027d57600080fd5b5061029860048036038101906102939190610ac5565b6104ba565b005b3480156102a657600080fd5b506102c160048036038101906102bc9190610b52565b610515565b005b3480156102cf57600080fd5b506102d861091f565b6040516102e59190610a4c565b60405180910390f35b3480156102fa57600080fd5b50610303610925565b6040516103109190610c18565b60405180910390f35b34801561032557600080fd5b50610340600480360381019061033b9190610a10565b610949565b60405161034d9190610a4c565b60405180910390f35b34801561036257600080fd5b5061036b610979565b6040516103789190610a4c565b60405180910390f35b34801561038d57600080fd5b506103a860048036038101906103a39190610ac5565b61097f565b6040516103b59190610c4e565b60405180910390f35b60006127106103e8836103d19190610c98565b6103db9190610d09565b9050919050565b6000611b58905090565b60018060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b611b5881565b6000612710905090565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60006103e8905090565b600080610495836103be565b9050612710611b58826104a89190610c98565b6104b29190610d09565b915050919050565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff166105a1576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161059890610d97565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff1603610610576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161060790610e03565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160361067f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161067690610e6f565b60405180910390fd5b600081116106c2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106b990610edb565b60405180910390fd5b60006106cd826103be565b905060008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663678b3ee287846040518363ffffffff1660e01b815260040161072d929190610f47565b6020604051808303816000875af115801561074c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107709190610faf565b9050806107b2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107a990611028565b60405180910390fd5b60006107bd84610489565b905060008111156108765760008673ffffffffffffffffffffffffffffffffffffffff16826040516107ee90611079565b60006040518083038185875af1925050503d806000811461082b576040519150601f19603f3d011682016040523d82523d6000602084013e610830565b606091505b5050905080610874576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161086b906110da565b60405180910390fd5b505b8673ffffffffffffffffffffffffffffffffffffffff167f84773aadf1f07fea4e87d3ab83916d60678c12dccabfd1c635500ebc01265a6f84876040516108be929190611109565b60405180910390a28573ffffffffffffffffffffffffffffffffffffffff167f4fd3268b7e0638c5c001ea51eb4f98c02a7160e9e9defe9e9628be176254ac5f828760405161090e929190611109565b60405180910390a250505050505050565b61271081565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080610955836103be565b9050600061096284610489565b905080826109709190611132565b92505050919050565b6103e881565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff169050919050565b600080fd5b6000819050919050565b6109ed816109da565b81146109f857600080fd5b50565b600081359050610a0a816109e4565b92915050565b600060208284031215610a2657610a256109d5565b5b6000610a34848285016109fb565b91505092915050565b610a46816109da565b82525050565b6000602082019050610a616000830184610a3d565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610a9282610a67565b9050919050565b610aa281610a87565b8114610aad57600080fd5b50565b600081359050610abf81610a99565b92915050565b600060208284031215610adb57610ada6109d5565b5b6000610ae984828501610ab0565b91505092915050565b610afb81610a87565b82525050565b6000602082019050610b166000830184610af2565b92915050565b6000819050919050565b610b2f81610b1c565b8114610b3a57600080fd5b50565b600081359050610b4c81610b26565b92915050565b60008060008060808587031215610b6c57610b6b6109d5565b5b6000610b7a87828801610ab0565b9450506020610b8b87828801610ab0565b9350506040610b9c87828801610b3d565b9250506060610bad878288016109fb565b91505092959194509250565b6000819050919050565b6000610bde610bd9610bd484610a67565b610bb9565b610a67565b9050919050565b6000610bf082610bc3565b9050919050565b6000610c0282610be5565b9050919050565b610c1281610bf7565b82525050565b6000602082019050610c2d6000830184610c09565b92915050565b60008115159050919050565b610c4881610c33565b82525050565b6000602082019050610c636000830184610c3f565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610ca3826109da565b9150610cae836109da565b9250828202610cbc816109da565b91508282048414831517610cd357610cd2610c69565b5b5092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b6000610d14826109da565b9150610d1f836109da565b925082610d2f57610d2e610cda565b5b828204905092915050565b600082825260208201905092915050565b7f43616c6c6572206e6f7420617574686f72697a65640000000000000000000000600082015250565b6000610d81601583610d3a565b9150610d8c82610d4b565b602082019050919050565b60006020820190508181036000830152610db081610d74565b9050919050565b7f4e6f646520616464726573732063616e6e6f74206265207a65726f0000000000600082015250565b6000610ded601b83610d3a565b9150610df882610db7565b602082019050919050565b60006020820190508181036000830152610e1c81610de0565b9050919050565b7f436c69656e7420616464726573732063616e6e6f74206265207a65726f000000600082015250565b6000610e59601d83610d3a565b9150610e6482610e23565b602082019050919050565b60006020820190508181036000830152610e8881610e4c565b9050919050565b7f4a6f622076616c7565206d75737420626520706f736974697665000000000000600082015250565b6000610ec5601a83610d3a565b9150610ed082610e8f565b602082019050919050565b60006020820190508181036000830152610ef481610eb8565b9050919050565b7f534c412076696f6c6174696f6e00000000000000000000000000000000000000600082015250565b6000610f31600d83610d3a565b9150610f3c82610efb565b602082019050919050565b6000606082019050610f5c6000830185610af2565b610f696020830184610a3d565b8181036040830152610f7a81610f24565b90509392505050565b610f8c81610c33565b8114610f9757600080fd5b50565b600081519050610fa981610f83565b92915050565b600060208284031215610fc557610fc46109d5565b5b6000610fd384828501610f9a565b91505092915050565b7f536c617368206661696c65640000000000000000000000000000000000000000600082015250565b6000611012600c83610d3a565b915061101d82610fdc565b602082019050919050565b6000602082019050818103600083015261104181611005565b9050919050565b600081905092915050565b50565b6000611063600083611048565b915061106e82611053565b600082019050919050565b600061108482611056565b9150819050919050565b7f437265646974207472616e73666572206661696c656400000000000000000000600082015250565b60006110c4601683610d3a565b91506110cf8261108e565b602082019050919050565b600060208201905081810360008301526110f3816110b7565b9050919050565b61110381610b1c565b82525050565b600060408201905061111e6000830185610a3d565b61112b60208301846110fa565b9392505050565b600061113d826109da565b9150611148836109da565b92508282039050818111156111605761115f610c69565b5b9291505056fea264697066735822122029c1afef7feb61b1e04cf5c0aad620550790f05156c9f2177858061e13ca724364736f6c63430008180033",
}

// SlashmanagerABI is the input ABI used to generate the binding from.
// Deprecated: Use SlashmanagerMetaData.ABI instead.
var SlashmanagerABI = SlashmanagerMetaData.ABI

// SlashmanagerBin is the compiled bytecode used for deploying new contracts.
// Deprecated: Use SlashmanagerMetaData.Bin instead.
var SlashmanagerBin = SlashmanagerMetaData.Bin

// DeploySlashmanager deploys a new Ethereum contract, binding an instance of Slashmanager to it.
func DeploySlashmanager(auth *bind.TransactOpts, backend bind.ContractBackend, _escrow common.Address) (common.Address, *types.Transaction, *Slashmanager, error) {
	parsed, err := SlashmanagerMetaData.GetAbi()
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	if parsed == nil {
		return common.Address{}, nil, nil, errors.New("GetABI returned nil")
	}

	address, tx, contract, err := bind.DeployContract(auth, *parsed, common.FromHex(SlashmanagerBin), backend, _escrow)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &Slashmanager{SlashmanagerCaller: SlashmanagerCaller{contract: contract}, SlashmanagerTransactor: SlashmanagerTransactor{contract: contract}, SlashmanagerFilterer: SlashmanagerFilterer{contract: contract}}, nil
}

// Slashmanager is an auto generated Go binding around an Ethereum contract.
type Slashmanager struct {
	SlashmanagerCaller     // Read-only binding to the contract
	SlashmanagerTransactor // Write-only binding to the contract
	SlashmanagerFilterer   // Log filterer for contract events
}

// SlashmanagerCaller is an auto generated read-only Go binding around an Ethereum contract.
type SlashmanagerCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// SlashmanagerTransactor is an auto generated write-only Go binding around an Ethereum contract.
type SlashmanagerTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// SlashmanagerFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type SlashmanagerFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// SlashmanagerSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type SlashmanagerSession struct {
	Contract     *Slashmanager     // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// SlashmanagerCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type SlashmanagerCallerSession struct {
	Contract *SlashmanagerCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts       // Call options to use throughout this session
}

// SlashmanagerTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type SlashmanagerTransactorSession struct {
	Contract     *SlashmanagerTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts       // Transaction auth options to use throughout this session
}

// SlashmanagerRaw is an auto generated low-level Go binding around an Ethereum contract.
type SlashmanagerRaw struct {
	Contract *Slashmanager // Generic contract binding to access the raw methods on
}

// SlashmanagerCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type SlashmanagerCallerRaw struct {
	Contract *SlashmanagerCaller // Generic read-only contract binding to access the raw methods on
}

// SlashmanagerTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type SlashmanagerTransactorRaw struct {
	Contract *SlashmanagerTransactor // Generic write-only contract binding to access the raw methods on
}

// NewSlashmanager creates a new instance of Slashmanager, bound to a specific deployed contract.
func NewSlashmanager(address common.Address, backend bind.ContractBackend) (*Slashmanager, error) {
	contract, err := bindSlashmanager(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Slashmanager{SlashmanagerCaller: SlashmanagerCaller{contract: contract}, SlashmanagerTransactor: SlashmanagerTransactor{contract: contract}, SlashmanagerFilterer: SlashmanagerFilterer{contract: contract}}, nil
}

// NewSlashmanagerCaller creates a new read-only instance of Slashmanager, bound to a specific deployed contract.
func NewSlashmanagerCaller(address common.Address, caller bind.ContractCaller) (*SlashmanagerCaller, error) {
	contract, err := bindSlashmanager(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &SlashmanagerCaller{contract: contract}, nil
}

// NewSlashmanagerTransactor creates a new write-only instance of Slashmanager, bound to a specific deployed contract.
func NewSlashmanagerTransactor(address common.Address, transactor bind.ContractTransactor) (*SlashmanagerTransactor, error) {
	contract, err := bindSlashmanager(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &SlashmanagerTransactor{contract: contract}, nil
}

// NewSlashmanagerFilterer creates a new log filterer instance of Slashmanager, bound to a specific deployed contract.
func NewSlashmanagerFilterer(address common.Address, filterer bind.ContractFilterer) (*SlashmanagerFilterer, error) {
	contract, err := bindSlashmanager(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &SlashmanagerFilterer{contract: contract}, nil
}

// bindSlashmanager binds a generic wrapper to an already deployed contract.
func bindSlashmanager(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := SlashmanagerMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Slashmanager *SlashmanagerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Slashmanager.Contract.SlashmanagerCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Slashmanager *SlashmanagerRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Slashmanager.Contract.SlashmanagerTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Slashmanager *SlashmanagerRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Slashmanager.Contract.SlashmanagerTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Slashmanager *SlashmanagerCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Slashmanager.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Slashmanager *SlashmanagerTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Slashmanager.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Slashmanager *SlashmanagerTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Slashmanager.Contract.contract.Transact(opts, method, params...)
}

// BASISPOINTS is a free data retrieval call binding the contract method 0xe1f1c4a7.
//
// Solidity: function BASIS_POINTS() view returns(uint256)
func (_Slashmanager *SlashmanagerCaller) BASISPOINTS(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Slashmanager.contract.Call(opts, &out, "BASIS_POINTS")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// BASISPOINTS is a free data retrieval call binding the contract method 0xe1f1c4a7.
//
// Solidity: function BASIS_POINTS() view returns(uint256)
func (_Slashmanager *SlashmanagerSession) BASISPOINTS() (*big.Int, error) {
	return _Slashmanager.Contract.BASISPOINTS(&_Slashmanager.CallOpts)
}

// BASISPOINTS is a free data retrieval call binding the contract method 0xe1f1c4a7.
//
// Solidity: function BASIS_POINTS() view returns(uint256)
func (_Slashmanager *SlashmanagerCallerSession) BASISPOINTS() (*big.Int, error) {
	return _Slashmanager.Contract.BASISPOINTS(&_Slashmanager.CallOpts)
}

// CREDITPERCENT is a free data retrieval call binding the contract method 0x81e35e3c.
//
// Solidity: function CREDIT_PERCENT() view returns(uint256)
func (_Slashmanager *SlashmanagerCaller) CREDITPERCENT(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Slashmanager.contract.Call(opts, &out, "CREDIT_PERCENT")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// CREDITPERCENT is a free data retrieval call binding the contract method 0x81e35e3c.
//
// Solidity: function CREDIT_PERCENT() view returns(uint256)
func (_Slashmanager *SlashmanagerSession) CREDITPERCENT() (*big.Int, error) {
	return _Slashmanager.Contract.CREDITPERCENT(&_Slashmanager.CallOpts)
}

// CREDITPERCENT is a free data retrieval call binding the contract method 0x81e35e3c.
//
// Solidity: function CREDIT_PERCENT() view returns(uint256)
func (_Slashmanager *SlashmanagerCallerSession) CREDITPERCENT() (*big.Int, error) {
	return _Slashmanager.Contract.CREDITPERCENT(&_Slashmanager.CallOpts)
}

// SLASHPERCENT is a free data retrieval call binding the contract method 0xf6e8913d.
//
// Solidity: function SLASH_PERCENT() view returns(uint256)
func (_Slashmanager *SlashmanagerCaller) SLASHPERCENT(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Slashmanager.contract.Call(opts, &out, "SLASH_PERCENT")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// SLASHPERCENT is a free data retrieval call binding the contract method 0xf6e8913d.
//
// Solidity: function SLASH_PERCENT() view returns(uint256)
func (_Slashmanager *SlashmanagerSession) SLASHPERCENT() (*big.Int, error) {
	return _Slashmanager.Contract.SLASHPERCENT(&_Slashmanager.CallOpts)
}

// SLASHPERCENT is a free data retrieval call binding the contract method 0xf6e8913d.
//
// Solidity: function SLASH_PERCENT() view returns(uint256)
func (_Slashmanager *SlashmanagerCallerSession) SLASHPERCENT() (*big.Int, error) {
	return _Slashmanager.Contract.SLASHPERCENT(&_Slashmanager.CallOpts)
}

// CalculateCredit is a free data retrieval call binding the contract method 0xa8cee8f0.
//
// Solidity: function calculateCredit(uint256 jobValue) view returns(uint256)
func (_Slashmanager *SlashmanagerCaller) CalculateCredit(opts *bind.CallOpts, jobValue *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Slashmanager.contract.Call(opts, &out, "calculateCredit", jobValue)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// CalculateCredit is a free data retrieval call binding the contract method 0xa8cee8f0.
//
// Solidity: function calculateCredit(uint256 jobValue) view returns(uint256)
func (_Slashmanager *SlashmanagerSession) CalculateCredit(jobValue *big.Int) (*big.Int, error) {
	return _Slashmanager.Contract.CalculateCredit(&_Slashmanager.CallOpts, jobValue)
}

// CalculateCredit is a free data retrieval call binding the contract method 0xa8cee8f0.
//
// Solidity: function calculateCredit(uint256 jobValue) view returns(uint256)
func (_Slashmanager *SlashmanagerCallerSession) CalculateCredit(jobValue *big.Int) (*big.Int, error) {
	return _Slashmanager.Contract.CalculateCredit(&_Slashmanager.CallOpts, jobValue)
}

// CalculateSlash is a free data retrieval call binding the contract method 0x0057d43e.
//
// Solidity: function calculateSlash(uint256 jobValue) view returns(uint256)
func (_Slashmanager *SlashmanagerCaller) CalculateSlash(opts *bind.CallOpts, jobValue *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Slashmanager.contract.Call(opts, &out, "calculateSlash", jobValue)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// CalculateSlash is a free data retrieval call binding the contract method 0x0057d43e.
//
// Solidity: function calculateSlash(uint256 jobValue) view returns(uint256)
func (_Slashmanager *SlashmanagerSession) CalculateSlash(jobValue *big.Int) (*big.Int, error) {
	return _Slashmanager.Contract.CalculateSlash(&_Slashmanager.CallOpts, jobValue)
}

// CalculateSlash is a free data retrieval call binding the contract method 0x0057d43e.
//
// Solidity: function calculateSlash(uint256 jobValue) view returns(uint256)
func (_Slashmanager *SlashmanagerCallerSession) CalculateSlash(jobValue *big.Int) (*big.Int, error) {
	return _Slashmanager.Contract.CalculateSlash(&_Slashmanager.CallOpts, jobValue)
}

// CalculateTreasury is a free data retrieval call binding the contract method 0xe993130b.
//
// Solidity: function calculateTreasury(uint256 jobValue) view returns(uint256)
func (_Slashmanager *SlashmanagerCaller) CalculateTreasury(opts *bind.CallOpts, jobValue *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Slashmanager.contract.Call(opts, &out, "calculateTreasury", jobValue)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// CalculateTreasury is a free data retrieval call binding the contract method 0xe993130b.
//
// Solidity: function calculateTreasury(uint256 jobValue) view returns(uint256)
func (_Slashmanager *SlashmanagerSession) CalculateTreasury(jobValue *big.Int) (*big.Int, error) {
	return _Slashmanager.Contract.CalculateTreasury(&_Slashmanager.CallOpts, jobValue)
}

// CalculateTreasury is a free data retrieval call binding the contract method 0xe993130b.
//
// Solidity: function calculateTreasury(uint256 jobValue) view returns(uint256)
func (_Slashmanager *SlashmanagerCallerSession) CalculateTreasury(jobValue *big.Int) (*big.Int, error) {
	return _Slashmanager.Contract.CalculateTreasury(&_Slashmanager.CallOpts, jobValue)
}

// Escrow is a free data retrieval call binding the contract method 0xe2fdcc17.
//
// Solidity: function escrow() view returns(address)
func (_Slashmanager *SlashmanagerCaller) Escrow(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _Slashmanager.contract.Call(opts, &out, "escrow")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// Escrow is a free data retrieval call binding the contract method 0xe2fdcc17.
//
// Solidity: function escrow() view returns(address)
func (_Slashmanager *SlashmanagerSession) Escrow() (common.Address, error) {
	return _Slashmanager.Contract.Escrow(&_Slashmanager.CallOpts)
}

// Escrow is a free data retrieval call binding the contract method 0xe2fdcc17.
//
// Solidity: function escrow() view returns(address)
func (_Slashmanager *SlashmanagerCallerSession) Escrow() (common.Address, error) {
	return _Slashmanager.Contract.Escrow(&_Slashmanager.CallOpts)
}

// GetBasisPoints is a free data retrieval call binding the contract method 0x97a18e5f.
//
// Solidity: function getBasisPoints() pure returns(uint256)
func (_Slashmanager *SlashmanagerCaller) GetBasisPoints(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Slashmanager.contract.Call(opts, &out, "getBasisPoints")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetBasisPoints is a free data retrieval call binding the contract method 0x97a18e5f.
//
// Solidity: function getBasisPoints() pure returns(uint256)
func (_Slashmanager *SlashmanagerSession) GetBasisPoints() (*big.Int, error) {
	return _Slashmanager.Contract.GetBasisPoints(&_Slashmanager.CallOpts)
}

// GetBasisPoints is a free data retrieval call binding the contract method 0x97a18e5f.
//
// Solidity: function getBasisPoints() pure returns(uint256)
func (_Slashmanager *SlashmanagerCallerSession) GetBasisPoints() (*big.Int, error) {
	return _Slashmanager.Contract.GetBasisPoints(&_Slashmanager.CallOpts)
}

// GetCreditPercent is a free data retrieval call binding the contract method 0x1f4c9205.
//
// Solidity: function getCreditPercent() view returns(uint256)
func (_Slashmanager *SlashmanagerCaller) GetCreditPercent(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Slashmanager.contract.Call(opts, &out, "getCreditPercent")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetCreditPercent is a free data retrieval call binding the contract method 0x1f4c9205.
//
// Solidity: function getCreditPercent() view returns(uint256)
func (_Slashmanager *SlashmanagerSession) GetCreditPercent() (*big.Int, error) {
	return _Slashmanager.Contract.GetCreditPercent(&_Slashmanager.CallOpts)
}

// GetCreditPercent is a free data retrieval call binding the contract method 0x1f4c9205.
//
// Solidity: function getCreditPercent() view returns(uint256)
func (_Slashmanager *SlashmanagerCallerSession) GetCreditPercent() (*big.Int, error) {
	return _Slashmanager.Contract.GetCreditPercent(&_Slashmanager.CallOpts)
}

// GetEscrow is a free data retrieval call binding the contract method 0xa208ae38.
//
// Solidity: function getEscrow() view returns(address)
func (_Slashmanager *SlashmanagerCaller) GetEscrow(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _Slashmanager.contract.Call(opts, &out, "getEscrow")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// GetEscrow is a free data retrieval call binding the contract method 0xa208ae38.
//
// Solidity: function getEscrow() view returns(address)
func (_Slashmanager *SlashmanagerSession) GetEscrow() (common.Address, error) {
	return _Slashmanager.Contract.GetEscrow(&_Slashmanager.CallOpts)
}

// GetEscrow is a free data retrieval call binding the contract method 0xa208ae38.
//
// Solidity: function getEscrow() view returns(address)
func (_Slashmanager *SlashmanagerCallerSession) GetEscrow() (common.Address, error) {
	return _Slashmanager.Contract.GetEscrow(&_Slashmanager.CallOpts)
}

// GetSlashPercent is a free data retrieval call binding the contract method 0xa5f4ac19.
//
// Solidity: function getSlashPercent() view returns(uint256)
func (_Slashmanager *SlashmanagerCaller) GetSlashPercent(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Slashmanager.contract.Call(opts, &out, "getSlashPercent")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetSlashPercent is a free data retrieval call binding the contract method 0xa5f4ac19.
//
// Solidity: function getSlashPercent() view returns(uint256)
func (_Slashmanager *SlashmanagerSession) GetSlashPercent() (*big.Int, error) {
	return _Slashmanager.Contract.GetSlashPercent(&_Slashmanager.CallOpts)
}

// GetSlashPercent is a free data retrieval call binding the contract method 0xa5f4ac19.
//
// Solidity: function getSlashPercent() view returns(uint256)
func (_Slashmanager *SlashmanagerCallerSession) GetSlashPercent() (*big.Int, error) {
	return _Slashmanager.Contract.GetSlashPercent(&_Slashmanager.CallOpts)
}

// IsAuthorized is a free data retrieval call binding the contract method 0xfe9fbb80.
//
// Solidity: function isAuthorized(address caller) view returns(bool)
func (_Slashmanager *SlashmanagerCaller) IsAuthorized(opts *bind.CallOpts, caller common.Address) (bool, error) {
	var out []interface{}
	err := _Slashmanager.contract.Call(opts, &out, "isAuthorized", caller)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// IsAuthorized is a free data retrieval call binding the contract method 0xfe9fbb80.
//
// Solidity: function isAuthorized(address caller) view returns(bool)
func (_Slashmanager *SlashmanagerSession) IsAuthorized(caller common.Address) (bool, error) {
	return _Slashmanager.Contract.IsAuthorized(&_Slashmanager.CallOpts, caller)
}

// IsAuthorized is a free data retrieval call binding the contract method 0xfe9fbb80.
//
// Solidity: function isAuthorized(address caller) view returns(bool)
func (_Slashmanager *SlashmanagerCallerSession) IsAuthorized(caller common.Address) (bool, error) {
	return _Slashmanager.Contract.IsAuthorized(&_Slashmanager.CallOpts, caller)
}

// AuthorizeCaller is a paid mutator transaction binding the contract method 0x2c388d5d.
//
// Solidity: function authorizeCaller(address caller) returns()
func (_Slashmanager *SlashmanagerTransactor) AuthorizeCaller(opts *bind.TransactOpts, caller common.Address) (*types.Transaction, error) {
	return _Slashmanager.contract.Transact(opts, "authorizeCaller", caller)
}

// AuthorizeCaller is a paid mutator transaction binding the contract method 0x2c388d5d.
//
// Solidity: function authorizeCaller(address caller) returns()
func (_Slashmanager *SlashmanagerSession) AuthorizeCaller(caller common.Address) (*types.Transaction, error) {
	return _Slashmanager.Contract.AuthorizeCaller(&_Slashmanager.TransactOpts, caller)
}

// AuthorizeCaller is a paid mutator transaction binding the contract method 0x2c388d5d.
//
// Solidity: function authorizeCaller(address caller) returns()
func (_Slashmanager *SlashmanagerTransactorSession) AuthorizeCaller(caller common.Address) (*types.Transaction, error) {
	return _Slashmanager.Contract.AuthorizeCaller(&_Slashmanager.TransactOpts, caller)
}

// RevokeCaller is a paid mutator transaction binding the contract method 0xb7743530.
//
// Solidity: function revokeCaller(address caller) returns()
func (_Slashmanager *SlashmanagerTransactor) RevokeCaller(opts *bind.TransactOpts, caller common.Address) (*types.Transaction, error) {
	return _Slashmanager.contract.Transact(opts, "revokeCaller", caller)
}

// RevokeCaller is a paid mutator transaction binding the contract method 0xb7743530.
//
// Solidity: function revokeCaller(address caller) returns()
func (_Slashmanager *SlashmanagerSession) RevokeCaller(caller common.Address) (*types.Transaction, error) {
	return _Slashmanager.Contract.RevokeCaller(&_Slashmanager.TransactOpts, caller)
}

// RevokeCaller is a paid mutator transaction binding the contract method 0xb7743530.
//
// Solidity: function revokeCaller(address caller) returns()
func (_Slashmanager *SlashmanagerTransactorSession) RevokeCaller(caller common.Address) (*types.Transaction, error) {
	return _Slashmanager.Contract.RevokeCaller(&_Slashmanager.TransactOpts, caller)
}

// SlashAndCredit is a paid mutator transaction binding the contract method 0xda1e5757.
//
// Solidity: function slashAndCredit(address node, address client, bytes32 jobId, uint256 jobValue) returns()
func (_Slashmanager *SlashmanagerTransactor) SlashAndCredit(opts *bind.TransactOpts, node common.Address, client common.Address, jobId [32]byte, jobValue *big.Int) (*types.Transaction, error) {
	return _Slashmanager.contract.Transact(opts, "slashAndCredit", node, client, jobId, jobValue)
}

// SlashAndCredit is a paid mutator transaction binding the contract method 0xda1e5757.
//
// Solidity: function slashAndCredit(address node, address client, bytes32 jobId, uint256 jobValue) returns()
func (_Slashmanager *SlashmanagerSession) SlashAndCredit(node common.Address, client common.Address, jobId [32]byte, jobValue *big.Int) (*types.Transaction, error) {
	return _Slashmanager.Contract.SlashAndCredit(&_Slashmanager.TransactOpts, node, client, jobId, jobValue)
}

// SlashAndCredit is a paid mutator transaction binding the contract method 0xda1e5757.
//
// Solidity: function slashAndCredit(address node, address client, bytes32 jobId, uint256 jobValue) returns()
func (_Slashmanager *SlashmanagerTransactorSession) SlashAndCredit(node common.Address, client common.Address, jobId [32]byte, jobValue *big.Int) (*types.Transaction, error) {
	return _Slashmanager.Contract.SlashAndCredit(&_Slashmanager.TransactOpts, node, client, jobId, jobValue)
}

// Receive is a paid mutator transaction binding the contract receive function.
//
// Solidity: receive() payable returns()
func (_Slashmanager *SlashmanagerTransactor) Receive(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Slashmanager.contract.RawTransact(opts, nil) // calldata is disallowed for receive function
}

// Receive is a paid mutator transaction binding the contract receive function.
//
// Solidity: receive() payable returns()
func (_Slashmanager *SlashmanagerSession) Receive() (*types.Transaction, error) {
	return _Slashmanager.Contract.Receive(&_Slashmanager.TransactOpts)
}

// Receive is a paid mutator transaction binding the contract receive function.
//
// Solidity: receive() payable returns()
func (_Slashmanager *SlashmanagerTransactorSession) Receive() (*types.Transaction, error) {
	return _Slashmanager.Contract.Receive(&_Slashmanager.TransactOpts)
}

// SlashmanagerCreditIssuedIterator is returned from FilterCreditIssued and is used to iterate over the raw logs and unpacked data for CreditIssued events raised by the Slashmanager contract.
type SlashmanagerCreditIssuedIterator struct {
	Event *SlashmanagerCreditIssued // Event containing the contract specifics and raw log

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
func (it *SlashmanagerCreditIssuedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SlashmanagerCreditIssued)
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
		it.Event = new(SlashmanagerCreditIssued)
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
func (it *SlashmanagerCreditIssuedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SlashmanagerCreditIssuedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SlashmanagerCreditIssued represents a CreditIssued event raised by the Slashmanager contract.
type SlashmanagerCreditIssued struct {
	Client common.Address
	Amount *big.Int
	JobId  [32]byte
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterCreditIssued is a free log retrieval operation binding the contract event 0x4fd3268b7e0638c5c001ea51eb4f98c02a7160e9e9defe9e9628be176254ac5f.
//
// Solidity: event CreditIssued(address indexed client, uint256 amount, bytes32 jobId)
func (_Slashmanager *SlashmanagerFilterer) FilterCreditIssued(opts *bind.FilterOpts, client []common.Address) (*SlashmanagerCreditIssuedIterator, error) {

	var clientRule []interface{}
	for _, clientItem := range client {
		clientRule = append(clientRule, clientItem)
	}

	logs, sub, err := _Slashmanager.contract.FilterLogs(opts, "CreditIssued", clientRule)
	if err != nil {
		return nil, err
	}
	return &SlashmanagerCreditIssuedIterator{contract: _Slashmanager.contract, event: "CreditIssued", logs: logs, sub: sub}, nil
}

// WatchCreditIssued is a free log subscription operation binding the contract event 0x4fd3268b7e0638c5c001ea51eb4f98c02a7160e9e9defe9e9628be176254ac5f.
//
// Solidity: event CreditIssued(address indexed client, uint256 amount, bytes32 jobId)
func (_Slashmanager *SlashmanagerFilterer) WatchCreditIssued(opts *bind.WatchOpts, sink chan<- *SlashmanagerCreditIssued, client []common.Address) (event.Subscription, error) {

	var clientRule []interface{}
	for _, clientItem := range client {
		clientRule = append(clientRule, clientItem)
	}

	logs, sub, err := _Slashmanager.contract.WatchLogs(opts, "CreditIssued", clientRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SlashmanagerCreditIssued)
				if err := _Slashmanager.contract.UnpackLog(event, "CreditIssued", log); err != nil {
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

// ParseCreditIssued is a log parse operation binding the contract event 0x4fd3268b7e0638c5c001ea51eb4f98c02a7160e9e9defe9e9628be176254ac5f.
//
// Solidity: event CreditIssued(address indexed client, uint256 amount, bytes32 jobId)
func (_Slashmanager *SlashmanagerFilterer) ParseCreditIssued(log types.Log) (*SlashmanagerCreditIssued, error) {
	event := new(SlashmanagerCreditIssued)
	if err := _Slashmanager.contract.UnpackLog(event, "CreditIssued", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// SlashmanagerNodeSlashedIterator is returned from FilterNodeSlashed and is used to iterate over the raw logs and unpacked data for NodeSlashed events raised by the Slashmanager contract.
type SlashmanagerNodeSlashedIterator struct {
	Event *SlashmanagerNodeSlashed // Event containing the contract specifics and raw log

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
func (it *SlashmanagerNodeSlashedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SlashmanagerNodeSlashed)
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
		it.Event = new(SlashmanagerNodeSlashed)
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
func (it *SlashmanagerNodeSlashedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SlashmanagerNodeSlashedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SlashmanagerNodeSlashed represents a NodeSlashed event raised by the Slashmanager contract.
type SlashmanagerNodeSlashed struct {
	Node   common.Address
	Amount *big.Int
	JobId  [32]byte
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterNodeSlashed is a free log retrieval operation binding the contract event 0x84773aadf1f07fea4e87d3ab83916d60678c12dccabfd1c635500ebc01265a6f.
//
// Solidity: event NodeSlashed(address indexed node, uint256 amount, bytes32 jobId)
func (_Slashmanager *SlashmanagerFilterer) FilterNodeSlashed(opts *bind.FilterOpts, node []common.Address) (*SlashmanagerNodeSlashedIterator, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _Slashmanager.contract.FilterLogs(opts, "NodeSlashed", nodeRule)
	if err != nil {
		return nil, err
	}
	return &SlashmanagerNodeSlashedIterator{contract: _Slashmanager.contract, event: "NodeSlashed", logs: logs, sub: sub}, nil
}

// WatchNodeSlashed is a free log subscription operation binding the contract event 0x84773aadf1f07fea4e87d3ab83916d60678c12dccabfd1c635500ebc01265a6f.
//
// Solidity: event NodeSlashed(address indexed node, uint256 amount, bytes32 jobId)
func (_Slashmanager *SlashmanagerFilterer) WatchNodeSlashed(opts *bind.WatchOpts, sink chan<- *SlashmanagerNodeSlashed, node []common.Address) (event.Subscription, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _Slashmanager.contract.WatchLogs(opts, "NodeSlashed", nodeRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SlashmanagerNodeSlashed)
				if err := _Slashmanager.contract.UnpackLog(event, "NodeSlashed", log); err != nil {
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

// ParseNodeSlashed is a log parse operation binding the contract event 0x84773aadf1f07fea4e87d3ab83916d60678c12dccabfd1c635500ebc01265a6f.
//
// Solidity: event NodeSlashed(address indexed node, uint256 amount, bytes32 jobId)
func (_Slashmanager *SlashmanagerFilterer) ParseNodeSlashed(log types.Log) (*SlashmanagerNodeSlashed, error) {
	event := new(SlashmanagerNodeSlashed)
	if err := _Slashmanager.contract.UnpackLog(event, "NodeSlashed", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
