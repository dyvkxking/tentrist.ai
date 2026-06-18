// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package escrow

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

// EscrowMetaData contains all meta data concerning the Escrow contract.
var EscrowMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"oldSlasher\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"newSlasher\",\"type\":\"address\"}],\"name\":\"SlasherUpdated\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"StakeDeposited\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"string\",\"name\":\"reason\",\"type\":\"string\"}],\"name\":\"StakeSlashed\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"StakeWithdrawn\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"MIN_STAKE\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"newSlasher\",\"type\":\"address\"}],\"name\":\"authorizeSlasher\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"}],\"name\":\"emergencyWithdraw\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getMinStake\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getSlasher\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"}],\"name\":\"getStake\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getStakerCount\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getStakers\",\"outputs\":[{\"internalType\":\"address[]\",\"name\":\"\",\"type\":\"address[]\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getTotalStaked\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"}],\"name\":\"hasStaked\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"internalType\":\"string\",\"name\":\"reason\",\"type\":\"string\"}],\"name\":\"slash\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"slasher\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"stake\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"withdraw\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]",
	Bin: "0x608060405234801561001057600080fd5b5033600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555033600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550611b16806100a26000396000f3fe6080604052600436106100e85760003560e01c80636ff1c9bc1161008a578063b134427111610059578063b1344271146102c3578063c93c8f34146102ee578063cb1c2b5c1461032b578063d0c80f1314610356576100e8565b80636ff1c9bc1461020957806372756718146102325780637a7664601461025b5780638da5cb5b14610298576100e8565b80633a4b66f1116100c65780633a4b66f11461016c57806343352d611461017657806356a3b5fa146101a1578063678b3ee2146101cc576100e8565b80630917e776146100ed5780631319649d146101185780632e1a7d4d14610143575b600080fd5b3480156100f957600080fd5b50610102610381565b60405161010f9190611141565b60405180910390f35b34801561012457600080fd5b5061012d61038b565b60405161013a9190611141565b60405180910390f35b34801561014f57600080fd5b5061016a60048036038101906101659190611192565b610398565b005b6101746106b6565b005b34801561018257600080fd5b5061018b6108c3565b60405161019891906112af565b60405180910390f35b3480156101ad57600080fd5b506101b6610951565b6040516101c39190611141565b60405180910390f35b3480156101d857600080fd5b506101f360048036038101906101ee9190611362565b610960565b60405161020091906113f1565b60405180910390f35b34801561021557600080fd5b50610230600480360381019061022b919061140c565b610c71565b005b34801561023e57600080fd5b506102596004803603810190610254919061140c565b610dfa565b005b34801561026757600080fd5b50610282600480360381019061027d919061140c565b610fbf565b60405161028f9190611141565b60405180910390f35b3480156102a457600080fd5b506102ad611007565b6040516102ba9190611448565b60405180910390f35b3480156102cf57600080fd5b506102d861102d565b6040516102e59190611448565b60405180910390f35b3480156102fa57600080fd5b506103156004803603810190610310919061140c565b611053565b60405161032291906113f1565b60405180910390f35b34801561033757600080fd5b506103406110f3565b60405161034d9190611141565b60405180910390f35b34801561036257600080fd5b5061036b6110fe565b6040516103789190611448565b60405180910390f35b6000600354905090565b6000600280549050905090565b336103a281611053565b6103e1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103d8906114c0565b60405180910390fd5b60008211610424576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161041b9061152c565b60405180910390fd5b816000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410156104a5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161049c90611598565b60405180910390fd5b6000826000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546104f191906115e7565b90506000811480610509575066b1a2bc2ec500008110155b610548576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161053f90611667565b60405180910390fd5b826000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461059691906115e7565b9250508190555082600360008282546105af91906115e7565b9250508190555060003373ffffffffffffffffffffffffffffffffffffffff16846040516105dc906116b8565b60006040518083038185875af1925050503d8060008114610619576040519150601f19603f3d011682016040523d82523d6000602084013e61061e565b606091505b5050905080610662576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161065990611719565b60405180910390fd5b3373ffffffffffffffffffffffffffffffffffffffff167f8108595eb6bad3acefa9da467d90cc2217686d5c5ac85460f8b7849c840645fc856040516106a89190611141565b60405180910390a250505050565b600034116106f9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106f090611785565b60405180910390fd5b600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff166108055760018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055506002339080600181540180825580915050600190039060005260206000200160009091909190916101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b346000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461085391906117a5565b92505081905550346003600082825461086c91906117a5565b925050819055503373ffffffffffffffffffffffffffffffffffffffff167f0a7bb2e28cc4698aac06db79cf9163bfcc20719286cf59fa7d492ceda1b8edc2346040516108b99190611141565b60405180910390a2565b6060600280548060200260200160405190810160405280929190818152602001828054801561094757602002820191906000526020600020905b8160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190600101908083116108fd575b5050505050905090565b600066b1a2bc2ec50000905090565b6000600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146109f2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109e990611825565b60405180910390fd5b846109fc81611053565b610a3b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a32906114c0565b60405180910390fd5b60008060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020548611610a885785610ac8565b6000808873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020545b9050806000808973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610b1891906115e7565b925050819055508060036000828254610b3191906115e7565b925050819055506000811115610c11576000600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1682604051610b89906116b8565b60006040518083038185875af1925050503d8060008114610bc6576040519150601f19603f3d011682016040523d82523d6000602084013e610bcb565b606091505b5050905080610c0f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c0690611891565b60405180910390fd5b505b8673ffffffffffffffffffffffffffffffffffffffff167fc32d81504c00ce92eaeed0852b187e372b250d24935ca5a510426adbd42cc257828787604051610c5b939291906118fe565b60405180910390a2600192505050949350505050565b600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610d01576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610cf89061197c565b60405180910390fd5b600047905060008111610d49576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d40906119e8565b60405180910390fd5b60008273ffffffffffffffffffffffffffffffffffffffff1682604051610d6f906116b8565b60006040518083038185875af1925050503d8060008114610dac576040519150601f19603f3d011682016040523d82523d6000602084013e610db1565b606091505b5050905080610df5576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610dec90611a54565b60405180910390fd5b505050565b600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610e8a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e819061197c565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610ef9576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ef090611ac0565b60405180910390fd5b6000600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167fe0d49a54274423183dadecbdf239eaac6e06ba88320b26fe8cc5ec9d050a639560405160405180910390a35050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff1680156110ec575060008060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054115b9050919050565b66b1a2bc2ec5000081565b6000600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000819050919050565b61113b81611128565b82525050565b60006020820190506111566000830184611132565b92915050565b600080fd5b600080fd5b61116f81611128565b811461117a57600080fd5b50565b60008135905061118c81611166565b92915050565b6000602082840312156111a8576111a761115c565b5b60006111b68482850161117d565b91505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000611216826111eb565b9050919050565b6112268161120b565b82525050565b6000611238838361121d565b60208301905092915050565b6000602082019050919050565b600061125c826111bf565b61126681856111ca565b9350611271836111db565b8060005b838110156112a2578151611289888261122c565b975061129483611244565b925050600181019050611275565b5085935050505092915050565b600060208201905081810360008301526112c98184611251565b905092915050565b6112da8161120b565b81146112e557600080fd5b50565b6000813590506112f7816112d1565b92915050565b600080fd5b600080fd5b600080fd5b60008083601f840112611322576113216112fd565b5b8235905067ffffffffffffffff81111561133f5761133e611302565b5b60208301915083600182028301111561135b5761135a611307565b5b9250929050565b6000806000806060858703121561137c5761137b61115c565b5b600061138a878288016112e8565b945050602061139b8782880161117d565b935050604085013567ffffffffffffffff8111156113bc576113bb611161565b5b6113c88782880161130c565b925092505092959194509250565b60008115159050919050565b6113eb816113d6565b82525050565b600060208201905061140660008301846113e2565b92915050565b6000602082840312156114225761142161115c565b5b6000611430848285016112e8565b91505092915050565b6114428161120b565b82525050565b600060208201905061145d6000830184611439565b92915050565b600082825260208201905092915050565b7f4e6f646520686173206e6f74207374616b656400000000000000000000000000600082015250565b60006114aa601383611463565b91506114b582611474565b602082019050919050565b600060208201905081810360008301526114d98161149d565b9050919050565b7f43616e6e6f742077697468647261772030000000000000000000000000000000600082015250565b6000611516601183611463565b9150611521826114e0565b602082019050919050565b6000602082019050818103600083015261154581611509565b9050919050565b7f496e73756666696369656e74207374616b650000000000000000000000000000600082015250565b6000611582601283611463565b915061158d8261154c565b602082019050919050565b600060208201905081810360008301526115b181611575565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006115f282611128565b91506115fd83611128565b9250828203905081811115611615576116146115b8565b5b92915050565b7f43616e6e6f7420676f2062656c6f77206d696e696d756d207374616b65000000600082015250565b6000611651601d83611463565b915061165c8261161b565b602082019050919050565b6000602082019050818103600083015261168081611644565b9050919050565b600081905092915050565b50565b60006116a2600083611687565b91506116ad82611692565b600082019050919050565b60006116c382611695565b9150819050919050565b7f5472616e73666572206661696c65640000000000000000000000000000000000600082015250565b6000611703600f83611463565b915061170e826116cd565b602082019050919050565b60006020820190508181036000830152611732816116f6565b9050919050565b7f43616e6e6f74207374616b652030000000000000000000000000000000000000600082015250565b600061176f600e83611463565b915061177a82611739565b602082019050919050565b6000602082019050818103600083015261179e81611762565b9050919050565b60006117b082611128565b91506117bb83611128565b92508282019050808211156117d3576117d26115b8565b5b92915050565b7f43616c6c6572206e6f7420736c61736865720000000000000000000000000000600082015250565b600061180f601283611463565b915061181a826117d9565b602082019050919050565b6000602082019050818103600083015261183e81611802565b9050919050565b7f536c617368207472616e73666572206661696c65640000000000000000000000600082015250565b600061187b601583611463565b915061188682611845565b602082019050919050565b600060208201905081810360008301526118aa8161186e565b9050919050565b82818337600083830152505050565b6000601f19601f8301169050919050565b60006118dd8385611463565b93506118ea8385846118b1565b6118f3836118c0565b840190509392505050565b60006040820190506119136000830186611132565b81810360208301526119268184866118d1565b9050949350505050565b7f43616c6c6572206e6f74206f776e657200000000000000000000000000000000600082015250565b6000611966601083611463565b915061197182611930565b602082019050919050565b6000602082019050818103600083015261199581611959565b9050919050565b7f4e6f2062616c616e636500000000000000000000000000000000000000000000600082015250565b60006119d2600a83611463565b91506119dd8261199c565b602082019050919050565b60006020820190508181036000830152611a01816119c5565b9050919050565b7f456d657267656e6379207769746864726177206661696c656400000000000000600082015250565b6000611a3e601983611463565b9150611a4982611a08565b602082019050919050565b60006020820190508181036000830152611a6d81611a31565b9050919050565b7f496e76616c696420736c61736865722061646472657373000000000000000000600082015250565b6000611aaa601783611463565b9150611ab582611a74565b602082019050919050565b60006020820190508181036000830152611ad981611a9d565b905091905056fea26469706673582212202e486d2bef654efd80d25cec2c4fed044b9a134867347861f5b8856f6bef6a7c64736f6c63430008180033",
}

// EscrowABI is the input ABI used to generate the binding from.
// Deprecated: Use EscrowMetaData.ABI instead.
var EscrowABI = EscrowMetaData.ABI

// EscrowBin is the compiled bytecode used for deploying new contracts.
// Deprecated: Use EscrowMetaData.Bin instead.
var EscrowBin = EscrowMetaData.Bin

// DeployEscrow deploys a new Ethereum contract, binding an instance of Escrow to it.
func DeployEscrow(auth *bind.TransactOpts, backend bind.ContractBackend) (common.Address, *types.Transaction, *Escrow, error) {
	parsed, err := EscrowMetaData.GetAbi()
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	if parsed == nil {
		return common.Address{}, nil, nil, errors.New("GetABI returned nil")
	}

	address, tx, contract, err := bind.DeployContract(auth, *parsed, common.FromHex(EscrowBin), backend)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &Escrow{EscrowCaller: EscrowCaller{contract: contract}, EscrowTransactor: EscrowTransactor{contract: contract}, EscrowFilterer: EscrowFilterer{contract: contract}}, nil
}

// Escrow is an auto generated Go binding around an Ethereum contract.
type Escrow struct {
	EscrowCaller     // Read-only binding to the contract
	EscrowTransactor // Write-only binding to the contract
	EscrowFilterer   // Log filterer for contract events
}

// EscrowCaller is an auto generated read-only Go binding around an Ethereum contract.
type EscrowCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// EscrowTransactor is an auto generated write-only Go binding around an Ethereum contract.
type EscrowTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// EscrowFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type EscrowFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// EscrowSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type EscrowSession struct {
	Contract     *Escrow           // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// EscrowCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type EscrowCallerSession struct {
	Contract *EscrowCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts // Call options to use throughout this session
}

// EscrowTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type EscrowTransactorSession struct {
	Contract     *EscrowTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// EscrowRaw is an auto generated low-level Go binding around an Ethereum contract.
type EscrowRaw struct {
	Contract *Escrow // Generic contract binding to access the raw methods on
}

// EscrowCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type EscrowCallerRaw struct {
	Contract *EscrowCaller // Generic read-only contract binding to access the raw methods on
}

// EscrowTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type EscrowTransactorRaw struct {
	Contract *EscrowTransactor // Generic write-only contract binding to access the raw methods on
}

// NewEscrow creates a new instance of Escrow, bound to a specific deployed contract.
func NewEscrow(address common.Address, backend bind.ContractBackend) (*Escrow, error) {
	contract, err := bindEscrow(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Escrow{EscrowCaller: EscrowCaller{contract: contract}, EscrowTransactor: EscrowTransactor{contract: contract}, EscrowFilterer: EscrowFilterer{contract: contract}}, nil
}

// NewEscrowCaller creates a new read-only instance of Escrow, bound to a specific deployed contract.
func NewEscrowCaller(address common.Address, caller bind.ContractCaller) (*EscrowCaller, error) {
	contract, err := bindEscrow(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &EscrowCaller{contract: contract}, nil
}

// NewEscrowTransactor creates a new write-only instance of Escrow, bound to a specific deployed contract.
func NewEscrowTransactor(address common.Address, transactor bind.ContractTransactor) (*EscrowTransactor, error) {
	contract, err := bindEscrow(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &EscrowTransactor{contract: contract}, nil
}

// NewEscrowFilterer creates a new log filterer instance of Escrow, bound to a specific deployed contract.
func NewEscrowFilterer(address common.Address, filterer bind.ContractFilterer) (*EscrowFilterer, error) {
	contract, err := bindEscrow(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &EscrowFilterer{contract: contract}, nil
}

// bindEscrow binds a generic wrapper to an already deployed contract.
func bindEscrow(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := EscrowMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Escrow *EscrowRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Escrow.Contract.EscrowCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Escrow *EscrowRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Escrow.Contract.EscrowTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Escrow *EscrowRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Escrow.Contract.EscrowTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Escrow *EscrowCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Escrow.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Escrow *EscrowTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Escrow.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Escrow *EscrowTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Escrow.Contract.contract.Transact(opts, method, params...)
}

// MINSTAKE is a free data retrieval call binding the contract method 0xcb1c2b5c.
//
// Solidity: function MIN_STAKE() view returns(uint256)
func (_Escrow *EscrowCaller) MINSTAKE(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Escrow.contract.Call(opts, &out, "MIN_STAKE")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// MINSTAKE is a free data retrieval call binding the contract method 0xcb1c2b5c.
//
// Solidity: function MIN_STAKE() view returns(uint256)
func (_Escrow *EscrowSession) MINSTAKE() (*big.Int, error) {
	return _Escrow.Contract.MINSTAKE(&_Escrow.CallOpts)
}

// MINSTAKE is a free data retrieval call binding the contract method 0xcb1c2b5c.
//
// Solidity: function MIN_STAKE() view returns(uint256)
func (_Escrow *EscrowCallerSession) MINSTAKE() (*big.Int, error) {
	return _Escrow.Contract.MINSTAKE(&_Escrow.CallOpts)
}

// GetMinStake is a free data retrieval call binding the contract method 0x56a3b5fa.
//
// Solidity: function getMinStake() view returns(uint256)
func (_Escrow *EscrowCaller) GetMinStake(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Escrow.contract.Call(opts, &out, "getMinStake")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetMinStake is a free data retrieval call binding the contract method 0x56a3b5fa.
//
// Solidity: function getMinStake() view returns(uint256)
func (_Escrow *EscrowSession) GetMinStake() (*big.Int, error) {
	return _Escrow.Contract.GetMinStake(&_Escrow.CallOpts)
}

// GetMinStake is a free data retrieval call binding the contract method 0x56a3b5fa.
//
// Solidity: function getMinStake() view returns(uint256)
func (_Escrow *EscrowCallerSession) GetMinStake() (*big.Int, error) {
	return _Escrow.Contract.GetMinStake(&_Escrow.CallOpts)
}

// GetSlasher is a free data retrieval call binding the contract method 0xd0c80f13.
//
// Solidity: function getSlasher() view returns(address)
func (_Escrow *EscrowCaller) GetSlasher(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _Escrow.contract.Call(opts, &out, "getSlasher")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// GetSlasher is a free data retrieval call binding the contract method 0xd0c80f13.
//
// Solidity: function getSlasher() view returns(address)
func (_Escrow *EscrowSession) GetSlasher() (common.Address, error) {
	return _Escrow.Contract.GetSlasher(&_Escrow.CallOpts)
}

// GetSlasher is a free data retrieval call binding the contract method 0xd0c80f13.
//
// Solidity: function getSlasher() view returns(address)
func (_Escrow *EscrowCallerSession) GetSlasher() (common.Address, error) {
	return _Escrow.Contract.GetSlasher(&_Escrow.CallOpts)
}

// GetStake is a free data retrieval call binding the contract method 0x7a766460.
//
// Solidity: function getStake(address node) view returns(uint256)
func (_Escrow *EscrowCaller) GetStake(opts *bind.CallOpts, node common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Escrow.contract.Call(opts, &out, "getStake", node)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetStake is a free data retrieval call binding the contract method 0x7a766460.
//
// Solidity: function getStake(address node) view returns(uint256)
func (_Escrow *EscrowSession) GetStake(node common.Address) (*big.Int, error) {
	return _Escrow.Contract.GetStake(&_Escrow.CallOpts, node)
}

// GetStake is a free data retrieval call binding the contract method 0x7a766460.
//
// Solidity: function getStake(address node) view returns(uint256)
func (_Escrow *EscrowCallerSession) GetStake(node common.Address) (*big.Int, error) {
	return _Escrow.Contract.GetStake(&_Escrow.CallOpts, node)
}

// GetStakerCount is a free data retrieval call binding the contract method 0x1319649d.
//
// Solidity: function getStakerCount() view returns(uint256)
func (_Escrow *EscrowCaller) GetStakerCount(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Escrow.contract.Call(opts, &out, "getStakerCount")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetStakerCount is a free data retrieval call binding the contract method 0x1319649d.
//
// Solidity: function getStakerCount() view returns(uint256)
func (_Escrow *EscrowSession) GetStakerCount() (*big.Int, error) {
	return _Escrow.Contract.GetStakerCount(&_Escrow.CallOpts)
}

// GetStakerCount is a free data retrieval call binding the contract method 0x1319649d.
//
// Solidity: function getStakerCount() view returns(uint256)
func (_Escrow *EscrowCallerSession) GetStakerCount() (*big.Int, error) {
	return _Escrow.Contract.GetStakerCount(&_Escrow.CallOpts)
}

// GetStakers is a free data retrieval call binding the contract method 0x43352d61.
//
// Solidity: function getStakers() view returns(address[])
func (_Escrow *EscrowCaller) GetStakers(opts *bind.CallOpts) ([]common.Address, error) {
	var out []interface{}
	err := _Escrow.contract.Call(opts, &out, "getStakers")

	if err != nil {
		return *new([]common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new([]common.Address)).(*[]common.Address)

	return out0, err

}

// GetStakers is a free data retrieval call binding the contract method 0x43352d61.
//
// Solidity: function getStakers() view returns(address[])
func (_Escrow *EscrowSession) GetStakers() ([]common.Address, error) {
	return _Escrow.Contract.GetStakers(&_Escrow.CallOpts)
}

// GetStakers is a free data retrieval call binding the contract method 0x43352d61.
//
// Solidity: function getStakers() view returns(address[])
func (_Escrow *EscrowCallerSession) GetStakers() ([]common.Address, error) {
	return _Escrow.Contract.GetStakers(&_Escrow.CallOpts)
}

// GetTotalStaked is a free data retrieval call binding the contract method 0x0917e776.
//
// Solidity: function getTotalStaked() view returns(uint256)
func (_Escrow *EscrowCaller) GetTotalStaked(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Escrow.contract.Call(opts, &out, "getTotalStaked")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetTotalStaked is a free data retrieval call binding the contract method 0x0917e776.
//
// Solidity: function getTotalStaked() view returns(uint256)
func (_Escrow *EscrowSession) GetTotalStaked() (*big.Int, error) {
	return _Escrow.Contract.GetTotalStaked(&_Escrow.CallOpts)
}

// GetTotalStaked is a free data retrieval call binding the contract method 0x0917e776.
//
// Solidity: function getTotalStaked() view returns(uint256)
func (_Escrow *EscrowCallerSession) GetTotalStaked() (*big.Int, error) {
	return _Escrow.Contract.GetTotalStaked(&_Escrow.CallOpts)
}

// HasStaked is a free data retrieval call binding the contract method 0xc93c8f34.
//
// Solidity: function hasStaked(address node) view returns(bool)
func (_Escrow *EscrowCaller) HasStaked(opts *bind.CallOpts, node common.Address) (bool, error) {
	var out []interface{}
	err := _Escrow.contract.Call(opts, &out, "hasStaked", node)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// HasStaked is a free data retrieval call binding the contract method 0xc93c8f34.
//
// Solidity: function hasStaked(address node) view returns(bool)
func (_Escrow *EscrowSession) HasStaked(node common.Address) (bool, error) {
	return _Escrow.Contract.HasStaked(&_Escrow.CallOpts, node)
}

// HasStaked is a free data retrieval call binding the contract method 0xc93c8f34.
//
// Solidity: function hasStaked(address node) view returns(bool)
func (_Escrow *EscrowCallerSession) HasStaked(node common.Address) (bool, error) {
	return _Escrow.Contract.HasStaked(&_Escrow.CallOpts, node)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() view returns(address)
func (_Escrow *EscrowCaller) Owner(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _Escrow.contract.Call(opts, &out, "owner")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() view returns(address)
func (_Escrow *EscrowSession) Owner() (common.Address, error) {
	return _Escrow.Contract.Owner(&_Escrow.CallOpts)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() view returns(address)
func (_Escrow *EscrowCallerSession) Owner() (common.Address, error) {
	return _Escrow.Contract.Owner(&_Escrow.CallOpts)
}

// Slasher is a free data retrieval call binding the contract method 0xb1344271.
//
// Solidity: function slasher() view returns(address)
func (_Escrow *EscrowCaller) Slasher(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _Escrow.contract.Call(opts, &out, "slasher")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// Slasher is a free data retrieval call binding the contract method 0xb1344271.
//
// Solidity: function slasher() view returns(address)
func (_Escrow *EscrowSession) Slasher() (common.Address, error) {
	return _Escrow.Contract.Slasher(&_Escrow.CallOpts)
}

// Slasher is a free data retrieval call binding the contract method 0xb1344271.
//
// Solidity: function slasher() view returns(address)
func (_Escrow *EscrowCallerSession) Slasher() (common.Address, error) {
	return _Escrow.Contract.Slasher(&_Escrow.CallOpts)
}

// AuthorizeSlasher is a paid mutator transaction binding the contract method 0x72756718.
//
// Solidity: function authorizeSlasher(address newSlasher) returns()
func (_Escrow *EscrowTransactor) AuthorizeSlasher(opts *bind.TransactOpts, newSlasher common.Address) (*types.Transaction, error) {
	return _Escrow.contract.Transact(opts, "authorizeSlasher", newSlasher)
}

// AuthorizeSlasher is a paid mutator transaction binding the contract method 0x72756718.
//
// Solidity: function authorizeSlasher(address newSlasher) returns()
func (_Escrow *EscrowSession) AuthorizeSlasher(newSlasher common.Address) (*types.Transaction, error) {
	return _Escrow.Contract.AuthorizeSlasher(&_Escrow.TransactOpts, newSlasher)
}

// AuthorizeSlasher is a paid mutator transaction binding the contract method 0x72756718.
//
// Solidity: function authorizeSlasher(address newSlasher) returns()
func (_Escrow *EscrowTransactorSession) AuthorizeSlasher(newSlasher common.Address) (*types.Transaction, error) {
	return _Escrow.Contract.AuthorizeSlasher(&_Escrow.TransactOpts, newSlasher)
}

// EmergencyWithdraw is a paid mutator transaction binding the contract method 0x6ff1c9bc.
//
// Solidity: function emergencyWithdraw(address to) returns()
func (_Escrow *EscrowTransactor) EmergencyWithdraw(opts *bind.TransactOpts, to common.Address) (*types.Transaction, error) {
	return _Escrow.contract.Transact(opts, "emergencyWithdraw", to)
}

// EmergencyWithdraw is a paid mutator transaction binding the contract method 0x6ff1c9bc.
//
// Solidity: function emergencyWithdraw(address to) returns()
func (_Escrow *EscrowSession) EmergencyWithdraw(to common.Address) (*types.Transaction, error) {
	return _Escrow.Contract.EmergencyWithdraw(&_Escrow.TransactOpts, to)
}

// EmergencyWithdraw is a paid mutator transaction binding the contract method 0x6ff1c9bc.
//
// Solidity: function emergencyWithdraw(address to) returns()
func (_Escrow *EscrowTransactorSession) EmergencyWithdraw(to common.Address) (*types.Transaction, error) {
	return _Escrow.Contract.EmergencyWithdraw(&_Escrow.TransactOpts, to)
}

// Slash is a paid mutator transaction binding the contract method 0x678b3ee2.
//
// Solidity: function slash(address node, uint256 amount, string reason) returns(bool)
func (_Escrow *EscrowTransactor) Slash(opts *bind.TransactOpts, node common.Address, amount *big.Int, reason string) (*types.Transaction, error) {
	return _Escrow.contract.Transact(opts, "slash", node, amount, reason)
}

// Slash is a paid mutator transaction binding the contract method 0x678b3ee2.
//
// Solidity: function slash(address node, uint256 amount, string reason) returns(bool)
func (_Escrow *EscrowSession) Slash(node common.Address, amount *big.Int, reason string) (*types.Transaction, error) {
	return _Escrow.Contract.Slash(&_Escrow.TransactOpts, node, amount, reason)
}

// Slash is a paid mutator transaction binding the contract method 0x678b3ee2.
//
// Solidity: function slash(address node, uint256 amount, string reason) returns(bool)
func (_Escrow *EscrowTransactorSession) Slash(node common.Address, amount *big.Int, reason string) (*types.Transaction, error) {
	return _Escrow.Contract.Slash(&_Escrow.TransactOpts, node, amount, reason)
}

// Stake is a paid mutator transaction binding the contract method 0x3a4b66f1.
//
// Solidity: function stake() payable returns()
func (_Escrow *EscrowTransactor) Stake(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Escrow.contract.Transact(opts, "stake")
}

// Stake is a paid mutator transaction binding the contract method 0x3a4b66f1.
//
// Solidity: function stake() payable returns()
func (_Escrow *EscrowSession) Stake() (*types.Transaction, error) {
	return _Escrow.Contract.Stake(&_Escrow.TransactOpts)
}

// Stake is a paid mutator transaction binding the contract method 0x3a4b66f1.
//
// Solidity: function stake() payable returns()
func (_Escrow *EscrowTransactorSession) Stake() (*types.Transaction, error) {
	return _Escrow.Contract.Stake(&_Escrow.TransactOpts)
}

// Withdraw is a paid mutator transaction binding the contract method 0x2e1a7d4d.
//
// Solidity: function withdraw(uint256 amount) returns()
func (_Escrow *EscrowTransactor) Withdraw(opts *bind.TransactOpts, amount *big.Int) (*types.Transaction, error) {
	return _Escrow.contract.Transact(opts, "withdraw", amount)
}

// Withdraw is a paid mutator transaction binding the contract method 0x2e1a7d4d.
//
// Solidity: function withdraw(uint256 amount) returns()
func (_Escrow *EscrowSession) Withdraw(amount *big.Int) (*types.Transaction, error) {
	return _Escrow.Contract.Withdraw(&_Escrow.TransactOpts, amount)
}

// Withdraw is a paid mutator transaction binding the contract method 0x2e1a7d4d.
//
// Solidity: function withdraw(uint256 amount) returns()
func (_Escrow *EscrowTransactorSession) Withdraw(amount *big.Int) (*types.Transaction, error) {
	return _Escrow.Contract.Withdraw(&_Escrow.TransactOpts, amount)
}

// EscrowSlasherUpdatedIterator is returned from FilterSlasherUpdated and is used to iterate over the raw logs and unpacked data for SlasherUpdated events raised by the Escrow contract.
type EscrowSlasherUpdatedIterator struct {
	Event *EscrowSlasherUpdated // Event containing the contract specifics and raw log

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
func (it *EscrowSlasherUpdatedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(EscrowSlasherUpdated)
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
		it.Event = new(EscrowSlasherUpdated)
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
func (it *EscrowSlasherUpdatedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *EscrowSlasherUpdatedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// EscrowSlasherUpdated represents a SlasherUpdated event raised by the Escrow contract.
type EscrowSlasherUpdated struct {
	OldSlasher common.Address
	NewSlasher common.Address
	Raw        types.Log // Blockchain specific contextual infos
}

// FilterSlasherUpdated is a free log retrieval operation binding the contract event 0xe0d49a54274423183dadecbdf239eaac6e06ba88320b26fe8cc5ec9d050a6395.
//
// Solidity: event SlasherUpdated(address indexed oldSlasher, address indexed newSlasher)
func (_Escrow *EscrowFilterer) FilterSlasherUpdated(opts *bind.FilterOpts, oldSlasher []common.Address, newSlasher []common.Address) (*EscrowSlasherUpdatedIterator, error) {

	var oldSlasherRule []interface{}
	for _, oldSlasherItem := range oldSlasher {
		oldSlasherRule = append(oldSlasherRule, oldSlasherItem)
	}
	var newSlasherRule []interface{}
	for _, newSlasherItem := range newSlasher {
		newSlasherRule = append(newSlasherRule, newSlasherItem)
	}

	logs, sub, err := _Escrow.contract.FilterLogs(opts, "SlasherUpdated", oldSlasherRule, newSlasherRule)
	if err != nil {
		return nil, err
	}
	return &EscrowSlasherUpdatedIterator{contract: _Escrow.contract, event: "SlasherUpdated", logs: logs, sub: sub}, nil
}

// WatchSlasherUpdated is a free log subscription operation binding the contract event 0xe0d49a54274423183dadecbdf239eaac6e06ba88320b26fe8cc5ec9d050a6395.
//
// Solidity: event SlasherUpdated(address indexed oldSlasher, address indexed newSlasher)
func (_Escrow *EscrowFilterer) WatchSlasherUpdated(opts *bind.WatchOpts, sink chan<- *EscrowSlasherUpdated, oldSlasher []common.Address, newSlasher []common.Address) (event.Subscription, error) {

	var oldSlasherRule []interface{}
	for _, oldSlasherItem := range oldSlasher {
		oldSlasherRule = append(oldSlasherRule, oldSlasherItem)
	}
	var newSlasherRule []interface{}
	for _, newSlasherItem := range newSlasher {
		newSlasherRule = append(newSlasherRule, newSlasherItem)
	}

	logs, sub, err := _Escrow.contract.WatchLogs(opts, "SlasherUpdated", oldSlasherRule, newSlasherRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(EscrowSlasherUpdated)
				if err := _Escrow.contract.UnpackLog(event, "SlasherUpdated", log); err != nil {
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

// ParseSlasherUpdated is a log parse operation binding the contract event 0xe0d49a54274423183dadecbdf239eaac6e06ba88320b26fe8cc5ec9d050a6395.
//
// Solidity: event SlasherUpdated(address indexed oldSlasher, address indexed newSlasher)
func (_Escrow *EscrowFilterer) ParseSlasherUpdated(log types.Log) (*EscrowSlasherUpdated, error) {
	event := new(EscrowSlasherUpdated)
	if err := _Escrow.contract.UnpackLog(event, "SlasherUpdated", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// EscrowStakeDepositedIterator is returned from FilterStakeDeposited and is used to iterate over the raw logs and unpacked data for StakeDeposited events raised by the Escrow contract.
type EscrowStakeDepositedIterator struct {
	Event *EscrowStakeDeposited // Event containing the contract specifics and raw log

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
func (it *EscrowStakeDepositedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(EscrowStakeDeposited)
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
		it.Event = new(EscrowStakeDeposited)
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
func (it *EscrowStakeDepositedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *EscrowStakeDepositedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// EscrowStakeDeposited represents a StakeDeposited event raised by the Escrow contract.
type EscrowStakeDeposited struct {
	Node   common.Address
	Amount *big.Int
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterStakeDeposited is a free log retrieval operation binding the contract event 0x0a7bb2e28cc4698aac06db79cf9163bfcc20719286cf59fa7d492ceda1b8edc2.
//
// Solidity: event StakeDeposited(address indexed node, uint256 amount)
func (_Escrow *EscrowFilterer) FilterStakeDeposited(opts *bind.FilterOpts, node []common.Address) (*EscrowStakeDepositedIterator, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _Escrow.contract.FilterLogs(opts, "StakeDeposited", nodeRule)
	if err != nil {
		return nil, err
	}
	return &EscrowStakeDepositedIterator{contract: _Escrow.contract, event: "StakeDeposited", logs: logs, sub: sub}, nil
}

// WatchStakeDeposited is a free log subscription operation binding the contract event 0x0a7bb2e28cc4698aac06db79cf9163bfcc20719286cf59fa7d492ceda1b8edc2.
//
// Solidity: event StakeDeposited(address indexed node, uint256 amount)
func (_Escrow *EscrowFilterer) WatchStakeDeposited(opts *bind.WatchOpts, sink chan<- *EscrowStakeDeposited, node []common.Address) (event.Subscription, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _Escrow.contract.WatchLogs(opts, "StakeDeposited", nodeRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(EscrowStakeDeposited)
				if err := _Escrow.contract.UnpackLog(event, "StakeDeposited", log); err != nil {
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

// ParseStakeDeposited is a log parse operation binding the contract event 0x0a7bb2e28cc4698aac06db79cf9163bfcc20719286cf59fa7d492ceda1b8edc2.
//
// Solidity: event StakeDeposited(address indexed node, uint256 amount)
func (_Escrow *EscrowFilterer) ParseStakeDeposited(log types.Log) (*EscrowStakeDeposited, error) {
	event := new(EscrowStakeDeposited)
	if err := _Escrow.contract.UnpackLog(event, "StakeDeposited", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// EscrowStakeSlashedIterator is returned from FilterStakeSlashed and is used to iterate over the raw logs and unpacked data for StakeSlashed events raised by the Escrow contract.
type EscrowStakeSlashedIterator struct {
	Event *EscrowStakeSlashed // Event containing the contract specifics and raw log

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
func (it *EscrowStakeSlashedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(EscrowStakeSlashed)
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
		it.Event = new(EscrowStakeSlashed)
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
func (it *EscrowStakeSlashedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *EscrowStakeSlashedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// EscrowStakeSlashed represents a StakeSlashed event raised by the Escrow contract.
type EscrowStakeSlashed struct {
	Node   common.Address
	Amount *big.Int
	Reason string
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterStakeSlashed is a free log retrieval operation binding the contract event 0xc32d81504c00ce92eaeed0852b187e372b250d24935ca5a510426adbd42cc257.
//
// Solidity: event StakeSlashed(address indexed node, uint256 amount, string reason)
func (_Escrow *EscrowFilterer) FilterStakeSlashed(opts *bind.FilterOpts, node []common.Address) (*EscrowStakeSlashedIterator, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _Escrow.contract.FilterLogs(opts, "StakeSlashed", nodeRule)
	if err != nil {
		return nil, err
	}
	return &EscrowStakeSlashedIterator{contract: _Escrow.contract, event: "StakeSlashed", logs: logs, sub: sub}, nil
}

// WatchStakeSlashed is a free log subscription operation binding the contract event 0xc32d81504c00ce92eaeed0852b187e372b250d24935ca5a510426adbd42cc257.
//
// Solidity: event StakeSlashed(address indexed node, uint256 amount, string reason)
func (_Escrow *EscrowFilterer) WatchStakeSlashed(opts *bind.WatchOpts, sink chan<- *EscrowStakeSlashed, node []common.Address) (event.Subscription, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _Escrow.contract.WatchLogs(opts, "StakeSlashed", nodeRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(EscrowStakeSlashed)
				if err := _Escrow.contract.UnpackLog(event, "StakeSlashed", log); err != nil {
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

// ParseStakeSlashed is a log parse operation binding the contract event 0xc32d81504c00ce92eaeed0852b187e372b250d24935ca5a510426adbd42cc257.
//
// Solidity: event StakeSlashed(address indexed node, uint256 amount, string reason)
func (_Escrow *EscrowFilterer) ParseStakeSlashed(log types.Log) (*EscrowStakeSlashed, error) {
	event := new(EscrowStakeSlashed)
	if err := _Escrow.contract.UnpackLog(event, "StakeSlashed", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// EscrowStakeWithdrawnIterator is returned from FilterStakeWithdrawn and is used to iterate over the raw logs and unpacked data for StakeWithdrawn events raised by the Escrow contract.
type EscrowStakeWithdrawnIterator struct {
	Event *EscrowStakeWithdrawn // Event containing the contract specifics and raw log

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
func (it *EscrowStakeWithdrawnIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(EscrowStakeWithdrawn)
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
		it.Event = new(EscrowStakeWithdrawn)
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
func (it *EscrowStakeWithdrawnIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *EscrowStakeWithdrawnIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// EscrowStakeWithdrawn represents a StakeWithdrawn event raised by the Escrow contract.
type EscrowStakeWithdrawn struct {
	Node   common.Address
	Amount *big.Int
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterStakeWithdrawn is a free log retrieval operation binding the contract event 0x8108595eb6bad3acefa9da467d90cc2217686d5c5ac85460f8b7849c840645fc.
//
// Solidity: event StakeWithdrawn(address indexed node, uint256 amount)
func (_Escrow *EscrowFilterer) FilterStakeWithdrawn(opts *bind.FilterOpts, node []common.Address) (*EscrowStakeWithdrawnIterator, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _Escrow.contract.FilterLogs(opts, "StakeWithdrawn", nodeRule)
	if err != nil {
		return nil, err
	}
	return &EscrowStakeWithdrawnIterator{contract: _Escrow.contract, event: "StakeWithdrawn", logs: logs, sub: sub}, nil
}

// WatchStakeWithdrawn is a free log subscription operation binding the contract event 0x8108595eb6bad3acefa9da467d90cc2217686d5c5ac85460f8b7849c840645fc.
//
// Solidity: event StakeWithdrawn(address indexed node, uint256 amount)
func (_Escrow *EscrowFilterer) WatchStakeWithdrawn(opts *bind.WatchOpts, sink chan<- *EscrowStakeWithdrawn, node []common.Address) (event.Subscription, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _Escrow.contract.WatchLogs(opts, "StakeWithdrawn", nodeRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(EscrowStakeWithdrawn)
				if err := _Escrow.contract.UnpackLog(event, "StakeWithdrawn", log); err != nil {
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

// ParseStakeWithdrawn is a log parse operation binding the contract event 0x8108595eb6bad3acefa9da467d90cc2217686d5c5ac85460f8b7849c840645fc.
//
// Solidity: event StakeWithdrawn(address indexed node, uint256 amount)
func (_Escrow *EscrowFilterer) ParseStakeWithdrawn(log types.Log) (*EscrowStakeWithdrawn, error) {
	event := new(EscrowStakeWithdrawn)
	if err := _Escrow.contract.UnpackLog(event, "StakeWithdrawn", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
