// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package reputationledger

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

// ReputationledgerMetaData contains all meta data concerning the Reputationledger contract.
var ReputationledgerMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"int256\",\"name\":\"delta\",\"type\":\"int256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"newScore\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"timestamp\",\"type\":\"uint256\"}],\"name\":\"ReputationUpdated\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"DECAY_PERIOD\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"DECAY_RATE\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"INITIAL_REPUTATION\",\"outputs\":[{\"internalType\":\"int256\",\"name\":\"\",\"type\":\"int256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"MAX_REPUTATION\",\"outputs\":[{\"internalType\":\"int256\",\"name\":\"\",\"type\":\"int256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"MIN_REPUTATION\",\"outputs\":[{\"internalType\":\"int256\",\"name\":\"\",\"type\":\"int256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"}],\"name\":\"applyDecay\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"caller\",\"type\":\"address\"}],\"name\":\"authorizeCaller\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address[]\",\"name\":\"nodes\",\"type\":\"address[]\"}],\"name\":\"batchApplyDecay\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"},{\"internalType\":\"int256\",\"name\":\"delta\",\"type\":\"int256\"}],\"name\":\"decrementReputation\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getDecayPeriod\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getDecayRate\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getInitialReputation\",\"outputs\":[{\"internalType\":\"int256\",\"name\":\"\",\"type\":\"int256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"}],\"name\":\"getLastUpdate\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getMaxReputation\",\"outputs\":[{\"internalType\":\"int256\",\"name\":\"\",\"type\":\"int256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getMinReputation\",\"outputs\":[{\"internalType\":\"int256\",\"name\":\"\",\"type\":\"int256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"}],\"name\":\"getReputation\",\"outputs\":[{\"internalType\":\"int256\",\"name\":\"\",\"type\":\"int256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"}],\"name\":\"getReputationTier\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"}],\"name\":\"hasReputation\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"},{\"internalType\":\"int256\",\"name\":\"delta\",\"type\":\"int256\"}],\"name\":\"incrementReputation\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"}],\"name\":\"initializeNode\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"caller\",\"type\":\"address\"}],\"name\":\"isAuthorized\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"lastUpdate\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"registeredAt\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"reputationScore\",\"outputs\":[{\"internalType\":\"int256\",\"name\":\"\",\"type\":\"int256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"caller\",\"type\":\"address\"}],\"name\":\"revokeCaller\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]",
	Bin: "0x608060405234801561001057600080fd5b506001600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff021916908315150217905550611b91806100786000396000f3fe608060405234801561001057600080fd5b50600436106101735760003560e01c80637f29ee4c116100de578063cb03fb1e11610097578063d31696cc11610071578063d31696cc14610460578063d5b84dba1461047e578063edfcc4371461049c578063fe9fbb80146104b857610173565b8063cb03fb1e146103f6578063cb3b89d814610426578063d213c0f21461044257610173565b80637f29ee4c146103125780639469dc92146103425780639c1a64e41461035e5780639c89a0e21461037a578063aaea3d9c146103aa578063b7743530146103da57610173565b806350d061cb1161013057806350d061cb146102285780635a7e198914610258578063697c6045146102885780636be2cefb146102a6578063728c769a146102d65780637b057258146102f457610173565b80631de40e49146101785780631e9d4904146101965780632c388d5d146101b457806339066bf5146101d05780633bbb9b71146101ee5780633fa9409b1461020c575b600080fd5b6101806104e8565b60405161018d9190611339565b60405180910390f35b61019e6104ed565b6040516101ab9190611339565b60405180910390f35b6101ce60048036038101906101c991906113bc565b6104f4565b005b6101d861054f565b6040516101e59190611402565b60405180910390f35b6101f6610559565b6040516102039190611402565b60405180910390f35b61022660048036038101906102219190611449565b610562565b005b610242600480360381019061023d91906113bc565b61064a565b60405161024f9190611402565b60405180910390f35b610272600480360381019061026d91906113bc565b610662565b60405161027f9190611339565b60405180910390f35b6102906106ab565b60405161029d9190611402565b60405180910390f35b6102c060048036038101906102bb91906113bc565b6106cf565b6040516102cd9190611519565b60405180910390f35b6102de6108a9565b6040516102eb9190611339565b60405180910390f35b6102fc6108b4565b6040516103099190611402565b60405180910390f35b61032c600480360381019061032791906113bc565b6108b9565b6040516103399190611556565b60405180910390f35b61035c60048036038101906103579190611449565b610904565b005b610378600480360381019061037391906115d6565b6109e3565b005b610394600480360381019061038f91906113bc565b610a95565b6040516103a19190611402565b60405180910390f35b6103c460048036038101906103bf91906113bc565b610af4565b6040516103d19190611339565b60405180910390f35b6103f460048036038101906103ef91906113bc565b610b0c565b005b610410600480360381019061040b91906113bc565b610b67565b60405161041d9190611339565b60405180910390f35b610440600480360381019061043b91906113bc565b610b7f565b005b61044a610d57565b6040516104579190611402565b60405180910390f35b610468610d5d565b6040516104759190611339565b60405180910390f35b610486610d66565b6040516104939190611402565b60405180910390f35b6104b660048036038101906104b191906113bc565b610d8e565b005b6104d260048036038101906104cd91906113bc565b61107c565b6040516104df9190611556565b60405180910390f35b606481565b62278d0081565b6001600360008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b6000612710905090565b60006064905090565b600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff166105ee576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105e59061166f565b60405180910390fd5b8060008113610632576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610629906116db565b60405180910390fd5b61064583836106409061172a565b6110d2565b505050565b60006020528060005260406000206000915090505481565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc1881565b606060003073ffffffffffffffffffffffffffffffffffffffff16639c89a0e2846040518263ffffffff1660e01b815260040161070c9190611781565b602060405180830381865afa158015610729573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061074d91906117b1565b90506113888112610796576040518060400160405280600981526020017f457863656c6c656e7400000000000000000000000000000000000000000000008152509150506108a4565b6109c481126107dd576040518060400160405280600481526020017f476f6f64000000000000000000000000000000000000000000000000000000008152509150506108a4565b6103e88112610824576040518060400160405280600481526020017f46616972000000000000000000000000000000000000000000000000000000008152509150506108a4565b6000811261086a576040518060400160405280600481526020017f506f6f72000000000000000000000000000000000000000000000000000000008152509150506108a4565b6040518060400160405280600881526020017f437269746963616c0000000000000000000000000000000000000000000000008152509150505b919050565b600062278d00905090565b606481565b600080600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054119050919050565b600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16610990576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109879061166f565b60405180910390fd5b80600081136109d4576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109cb906116db565b60405180910390fd5b6109de83836110d2565b505050565b60005b82829050811015610a90573073ffffffffffffffffffffffffffffffffffffffff1663edfcc437848484818110610a2057610a1f6117de565b5b9050602002016020810190610a3591906113bc565b6040518263ffffffff1660e01b8152600401610a519190611781565b600060405180830381600087803b158015610a6b57600080fd5b505af1158015610a7f573d6000803e3d6000fd5b5050505080806001019150506109e6565b505050565b6000610aa0826108b9565b610aad5760009050610aef565b6000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205490505b919050565b60026020528060005260406000206000915090505481565b6000600360008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b60016020528060005260406000206000915090505481565b600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16610c0b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c029061166f565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610c7a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c7190611859565b60405180910390fd5b610c83816108b9565b610ccc5760646000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055505b42600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555042600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555050565b61271081565b60006064905090565b60007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc18905090565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610dfd576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610df490611859565b60405180910390fd5b610e06816108b9565b610e45576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e3c906118c5565b60405180910390fd5b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205442610e9291906118e5565b905062278d00811061107857600062278d0082610eaf9190611948565b90506000816064610ec09190611979565b612710610ecd91906118e5565b90506000811215610edd57600090505b60008060008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905060006127108383610f3191906119bb565b610f3b9190611a33565b90507ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc18811215610f89577ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc1890505b60008282610f979190611a9d565b9050816000808973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555042600160008973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508673ffffffffffffffffffffffffffffffffffffffff167fe35f9c182810425ce2ad512d42e43c5ff30b370f73e3277f7fe538adfda2072682844260405161106a93929190611ae0565b60405180910390a250505050505b5050565b6000600360008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff169050919050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603611141576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161113890611859565b60405180910390fd5b61114a826108b9565b6111935760646000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055505b6000816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546111df9190611b17565b90506127108113156111f5576127109050611242565b7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc18811215611241577ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc1890505b5b806000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555042600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff167fe35f9c182810425ce2ad512d42e43c5ff30b370f73e3277f7fe538adfda2072683834260405161131393929190611ae0565b60405180910390a2505050565b6000819050919050565b61133381611320565b82525050565b600060208201905061134e600083018461132a565b92915050565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006113898261135e565b9050919050565b6113998161137e565b81146113a457600080fd5b50565b6000813590506113b681611390565b92915050565b6000602082840312156113d2576113d1611354565b5b60006113e0848285016113a7565b91505092915050565b6000819050919050565b6113fc816113e9565b82525050565b600060208201905061141760008301846113f3565b92915050565b611426816113e9565b811461143157600080fd5b50565b6000813590506114438161141d565b92915050565b600080604083850312156114605761145f611354565b5b600061146e858286016113a7565b925050602061147f85828601611434565b9150509250929050565b600081519050919050565b600082825260208201905092915050565b60005b838110156114c35780820151818401526020810190506114a8565b60008484015250505050565b6000601f19601f8301169050919050565b60006114eb82611489565b6114f58185611494565b93506115058185602086016114a5565b61150e816114cf565b840191505092915050565b6000602082019050818103600083015261153381846114e0565b905092915050565b60008115159050919050565b6115508161153b565b82525050565b600060208201905061156b6000830184611547565b92915050565b600080fd5b600080fd5b600080fd5b60008083601f84011261159657611595611571565b5b8235905067ffffffffffffffff8111156115b3576115b2611576565b5b6020830191508360208202830111156115cf576115ce61157b565b5b9250929050565b600080602083850312156115ed576115ec611354565b5b600083013567ffffffffffffffff81111561160b5761160a611359565b5b61161785828601611580565b92509250509250929050565b7f43616c6c6572206e6f7420617574686f72697a65640000000000000000000000600082015250565b6000611659601583611494565b915061166482611623565b602082019050919050565b600060208201905081810360008301526116888161164c565b9050919050565b7f44656c7461206d75737420626520706f73697469766500000000000000000000600082015250565b60006116c5601683611494565b91506116d08261168f565b602082019050919050565b600060208201905081810360008301526116f4816116b8565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000611735826113e9565b91507f80000000000000000000000000000000000000000000000000000000000000008203611767576117666116fb565b5b816000039050919050565b61177b8161137e565b82525050565b60006020820190506117966000830184611772565b92915050565b6000815190506117ab8161141d565b92915050565b6000602082840312156117c7576117c6611354565b5b60006117d58482850161179c565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e6f646520616464726573732063616e6e6f74206265207a65726f0000000000600082015250565b6000611843601b83611494565b915061184e8261180d565b602082019050919050565b6000602082019050818103600083015261187281611836565b9050919050565b7f4e6f646520686173206e6f2072657075746174696f6e00000000000000000000600082015250565b60006118af601683611494565b91506118ba82611879565b602082019050919050565b600060208201905081810360008301526118de816118a2565b9050919050565b60006118f082611320565b91506118fb83611320565b9250828203905081811115611913576119126116fb565b5b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b600061195382611320565b915061195e83611320565b92508261196e5761196d611919565b5b828204905092915050565b600061198482611320565b915061198f83611320565b925082820261199d81611320565b915082820484148315176119b4576119b36116fb565b5b5092915050565b60006119c6826113e9565b91506119d1836113e9565b92508282026119df816113e9565b91507f80000000000000000000000000000000000000000000000000000000000000008414600084121615611a1757611a166116fb565b5b8282058414831517611a2c57611a2b6116fb565b5b5092915050565b6000611a3e826113e9565b9150611a49836113e9565b925082611a5957611a58611919565b5b600160000383147f800000000000000000000000000000000000000000000000000000000000000083141615611a9257611a916116fb565b5b828205905092915050565b6000611aa8826113e9565b9150611ab3836113e9565b9250828203905081811260008412168282136000851215161715611ada57611ad96116fb565b5b92915050565b6000606082019050611af560008301866113f3565b611b02602083018561132a565b611b0f604083018461132a565b949350505050565b6000611b22826113e9565b9150611b2d836113e9565b925082820190508281121560008312168382126000841215161715611b5557611b546116fb565b5b9291505056fea2646970667358221220b5d2282448de6a89ba7f46e6c96a973ec2cf32a9616aa4c0c6f35cd2511d7dc364736f6c63430008180033",
}

// ReputationledgerABI is the input ABI used to generate the binding from.
// Deprecated: Use ReputationledgerMetaData.ABI instead.
var ReputationledgerABI = ReputationledgerMetaData.ABI

// ReputationledgerBin is the compiled bytecode used for deploying new contracts.
// Deprecated: Use ReputationledgerMetaData.Bin instead.
var ReputationledgerBin = ReputationledgerMetaData.Bin

// DeployReputationledger deploys a new Ethereum contract, binding an instance of Reputationledger to it.
func DeployReputationledger(auth *bind.TransactOpts, backend bind.ContractBackend) (common.Address, *types.Transaction, *Reputationledger, error) {
	parsed, err := ReputationledgerMetaData.GetAbi()
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	if parsed == nil {
		return common.Address{}, nil, nil, errors.New("GetABI returned nil")
	}

	address, tx, contract, err := bind.DeployContract(auth, *parsed, common.FromHex(ReputationledgerBin), backend)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &Reputationledger{ReputationledgerCaller: ReputationledgerCaller{contract: contract}, ReputationledgerTransactor: ReputationledgerTransactor{contract: contract}, ReputationledgerFilterer: ReputationledgerFilterer{contract: contract}}, nil
}

// Reputationledger is an auto generated Go binding around an Ethereum contract.
type Reputationledger struct {
	ReputationledgerCaller     // Read-only binding to the contract
	ReputationledgerTransactor // Write-only binding to the contract
	ReputationledgerFilterer   // Log filterer for contract events
}

// ReputationledgerCaller is an auto generated read-only Go binding around an Ethereum contract.
type ReputationledgerCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// ReputationledgerTransactor is an auto generated write-only Go binding around an Ethereum contract.
type ReputationledgerTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// ReputationledgerFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type ReputationledgerFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// ReputationledgerSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type ReputationledgerSession struct {
	Contract     *Reputationledger // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// ReputationledgerCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type ReputationledgerCallerSession struct {
	Contract *ReputationledgerCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts           // Call options to use throughout this session
}

// ReputationledgerTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type ReputationledgerTransactorSession struct {
	Contract     *ReputationledgerTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts           // Transaction auth options to use throughout this session
}

// ReputationledgerRaw is an auto generated low-level Go binding around an Ethereum contract.
type ReputationledgerRaw struct {
	Contract *Reputationledger // Generic contract binding to access the raw methods on
}

// ReputationledgerCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type ReputationledgerCallerRaw struct {
	Contract *ReputationledgerCaller // Generic read-only contract binding to access the raw methods on
}

// ReputationledgerTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type ReputationledgerTransactorRaw struct {
	Contract *ReputationledgerTransactor // Generic write-only contract binding to access the raw methods on
}

// NewReputationledger creates a new instance of Reputationledger, bound to a specific deployed contract.
func NewReputationledger(address common.Address, backend bind.ContractBackend) (*Reputationledger, error) {
	contract, err := bindReputationledger(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Reputationledger{ReputationledgerCaller: ReputationledgerCaller{contract: contract}, ReputationledgerTransactor: ReputationledgerTransactor{contract: contract}, ReputationledgerFilterer: ReputationledgerFilterer{contract: contract}}, nil
}

// NewReputationledgerCaller creates a new read-only instance of Reputationledger, bound to a specific deployed contract.
func NewReputationledgerCaller(address common.Address, caller bind.ContractCaller) (*ReputationledgerCaller, error) {
	contract, err := bindReputationledger(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &ReputationledgerCaller{contract: contract}, nil
}

// NewReputationledgerTransactor creates a new write-only instance of Reputationledger, bound to a specific deployed contract.
func NewReputationledgerTransactor(address common.Address, transactor bind.ContractTransactor) (*ReputationledgerTransactor, error) {
	contract, err := bindReputationledger(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &ReputationledgerTransactor{contract: contract}, nil
}

// NewReputationledgerFilterer creates a new log filterer instance of Reputationledger, bound to a specific deployed contract.
func NewReputationledgerFilterer(address common.Address, filterer bind.ContractFilterer) (*ReputationledgerFilterer, error) {
	contract, err := bindReputationledger(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &ReputationledgerFilterer{contract: contract}, nil
}

// bindReputationledger binds a generic wrapper to an already deployed contract.
func bindReputationledger(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := ReputationledgerMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Reputationledger *ReputationledgerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Reputationledger.Contract.ReputationledgerCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Reputationledger *ReputationledgerRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Reputationledger.Contract.ReputationledgerTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Reputationledger *ReputationledgerRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Reputationledger.Contract.ReputationledgerTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Reputationledger *ReputationledgerCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Reputationledger.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Reputationledger *ReputationledgerTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Reputationledger.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Reputationledger *ReputationledgerTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Reputationledger.Contract.contract.Transact(opts, method, params...)
}

// DECAYPERIOD is a free data retrieval call binding the contract method 0x1e9d4904.
//
// Solidity: function DECAY_PERIOD() view returns(uint256)
func (_Reputationledger *ReputationledgerCaller) DECAYPERIOD(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Reputationledger.contract.Call(opts, &out, "DECAY_PERIOD")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// DECAYPERIOD is a free data retrieval call binding the contract method 0x1e9d4904.
//
// Solidity: function DECAY_PERIOD() view returns(uint256)
func (_Reputationledger *ReputationledgerSession) DECAYPERIOD() (*big.Int, error) {
	return _Reputationledger.Contract.DECAYPERIOD(&_Reputationledger.CallOpts)
}

// DECAYPERIOD is a free data retrieval call binding the contract method 0x1e9d4904.
//
// Solidity: function DECAY_PERIOD() view returns(uint256)
func (_Reputationledger *ReputationledgerCallerSession) DECAYPERIOD() (*big.Int, error) {
	return _Reputationledger.Contract.DECAYPERIOD(&_Reputationledger.CallOpts)
}

// DECAYRATE is a free data retrieval call binding the contract method 0x1de40e49.
//
// Solidity: function DECAY_RATE() view returns(uint256)
func (_Reputationledger *ReputationledgerCaller) DECAYRATE(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Reputationledger.contract.Call(opts, &out, "DECAY_RATE")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// DECAYRATE is a free data retrieval call binding the contract method 0x1de40e49.
//
// Solidity: function DECAY_RATE() view returns(uint256)
func (_Reputationledger *ReputationledgerSession) DECAYRATE() (*big.Int, error) {
	return _Reputationledger.Contract.DECAYRATE(&_Reputationledger.CallOpts)
}

// DECAYRATE is a free data retrieval call binding the contract method 0x1de40e49.
//
// Solidity: function DECAY_RATE() view returns(uint256)
func (_Reputationledger *ReputationledgerCallerSession) DECAYRATE() (*big.Int, error) {
	return _Reputationledger.Contract.DECAYRATE(&_Reputationledger.CallOpts)
}

// INITIALREPUTATION is a free data retrieval call binding the contract method 0x7b057258.
//
// Solidity: function INITIAL_REPUTATION() view returns(int256)
func (_Reputationledger *ReputationledgerCaller) INITIALREPUTATION(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Reputationledger.contract.Call(opts, &out, "INITIAL_REPUTATION")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// INITIALREPUTATION is a free data retrieval call binding the contract method 0x7b057258.
//
// Solidity: function INITIAL_REPUTATION() view returns(int256)
func (_Reputationledger *ReputationledgerSession) INITIALREPUTATION() (*big.Int, error) {
	return _Reputationledger.Contract.INITIALREPUTATION(&_Reputationledger.CallOpts)
}

// INITIALREPUTATION is a free data retrieval call binding the contract method 0x7b057258.
//
// Solidity: function INITIAL_REPUTATION() view returns(int256)
func (_Reputationledger *ReputationledgerCallerSession) INITIALREPUTATION() (*big.Int, error) {
	return _Reputationledger.Contract.INITIALREPUTATION(&_Reputationledger.CallOpts)
}

// MAXREPUTATION is a free data retrieval call binding the contract method 0xd213c0f2.
//
// Solidity: function MAX_REPUTATION() view returns(int256)
func (_Reputationledger *ReputationledgerCaller) MAXREPUTATION(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Reputationledger.contract.Call(opts, &out, "MAX_REPUTATION")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// MAXREPUTATION is a free data retrieval call binding the contract method 0xd213c0f2.
//
// Solidity: function MAX_REPUTATION() view returns(int256)
func (_Reputationledger *ReputationledgerSession) MAXREPUTATION() (*big.Int, error) {
	return _Reputationledger.Contract.MAXREPUTATION(&_Reputationledger.CallOpts)
}

// MAXREPUTATION is a free data retrieval call binding the contract method 0xd213c0f2.
//
// Solidity: function MAX_REPUTATION() view returns(int256)
func (_Reputationledger *ReputationledgerCallerSession) MAXREPUTATION() (*big.Int, error) {
	return _Reputationledger.Contract.MAXREPUTATION(&_Reputationledger.CallOpts)
}

// MINREPUTATION is a free data retrieval call binding the contract method 0x697c6045.
//
// Solidity: function MIN_REPUTATION() view returns(int256)
func (_Reputationledger *ReputationledgerCaller) MINREPUTATION(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Reputationledger.contract.Call(opts, &out, "MIN_REPUTATION")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// MINREPUTATION is a free data retrieval call binding the contract method 0x697c6045.
//
// Solidity: function MIN_REPUTATION() view returns(int256)
func (_Reputationledger *ReputationledgerSession) MINREPUTATION() (*big.Int, error) {
	return _Reputationledger.Contract.MINREPUTATION(&_Reputationledger.CallOpts)
}

// MINREPUTATION is a free data retrieval call binding the contract method 0x697c6045.
//
// Solidity: function MIN_REPUTATION() view returns(int256)
func (_Reputationledger *ReputationledgerCallerSession) MINREPUTATION() (*big.Int, error) {
	return _Reputationledger.Contract.MINREPUTATION(&_Reputationledger.CallOpts)
}

// GetDecayPeriod is a free data retrieval call binding the contract method 0x728c769a.
//
// Solidity: function getDecayPeriod() pure returns(uint256)
func (_Reputationledger *ReputationledgerCaller) GetDecayPeriod(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Reputationledger.contract.Call(opts, &out, "getDecayPeriod")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetDecayPeriod is a free data retrieval call binding the contract method 0x728c769a.
//
// Solidity: function getDecayPeriod() pure returns(uint256)
func (_Reputationledger *ReputationledgerSession) GetDecayPeriod() (*big.Int, error) {
	return _Reputationledger.Contract.GetDecayPeriod(&_Reputationledger.CallOpts)
}

// GetDecayPeriod is a free data retrieval call binding the contract method 0x728c769a.
//
// Solidity: function getDecayPeriod() pure returns(uint256)
func (_Reputationledger *ReputationledgerCallerSession) GetDecayPeriod() (*big.Int, error) {
	return _Reputationledger.Contract.GetDecayPeriod(&_Reputationledger.CallOpts)
}

// GetDecayRate is a free data retrieval call binding the contract method 0xd31696cc.
//
// Solidity: function getDecayRate() pure returns(uint256)
func (_Reputationledger *ReputationledgerCaller) GetDecayRate(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Reputationledger.contract.Call(opts, &out, "getDecayRate")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetDecayRate is a free data retrieval call binding the contract method 0xd31696cc.
//
// Solidity: function getDecayRate() pure returns(uint256)
func (_Reputationledger *ReputationledgerSession) GetDecayRate() (*big.Int, error) {
	return _Reputationledger.Contract.GetDecayRate(&_Reputationledger.CallOpts)
}

// GetDecayRate is a free data retrieval call binding the contract method 0xd31696cc.
//
// Solidity: function getDecayRate() pure returns(uint256)
func (_Reputationledger *ReputationledgerCallerSession) GetDecayRate() (*big.Int, error) {
	return _Reputationledger.Contract.GetDecayRate(&_Reputationledger.CallOpts)
}

// GetInitialReputation is a free data retrieval call binding the contract method 0x3bbb9b71.
//
// Solidity: function getInitialReputation() pure returns(int256)
func (_Reputationledger *ReputationledgerCaller) GetInitialReputation(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Reputationledger.contract.Call(opts, &out, "getInitialReputation")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetInitialReputation is a free data retrieval call binding the contract method 0x3bbb9b71.
//
// Solidity: function getInitialReputation() pure returns(int256)
func (_Reputationledger *ReputationledgerSession) GetInitialReputation() (*big.Int, error) {
	return _Reputationledger.Contract.GetInitialReputation(&_Reputationledger.CallOpts)
}

// GetInitialReputation is a free data retrieval call binding the contract method 0x3bbb9b71.
//
// Solidity: function getInitialReputation() pure returns(int256)
func (_Reputationledger *ReputationledgerCallerSession) GetInitialReputation() (*big.Int, error) {
	return _Reputationledger.Contract.GetInitialReputation(&_Reputationledger.CallOpts)
}

// GetLastUpdate is a free data retrieval call binding the contract method 0x5a7e1989.
//
// Solidity: function getLastUpdate(address node) view returns(uint256)
func (_Reputationledger *ReputationledgerCaller) GetLastUpdate(opts *bind.CallOpts, node common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Reputationledger.contract.Call(opts, &out, "getLastUpdate", node)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetLastUpdate is a free data retrieval call binding the contract method 0x5a7e1989.
//
// Solidity: function getLastUpdate(address node) view returns(uint256)
func (_Reputationledger *ReputationledgerSession) GetLastUpdate(node common.Address) (*big.Int, error) {
	return _Reputationledger.Contract.GetLastUpdate(&_Reputationledger.CallOpts, node)
}

// GetLastUpdate is a free data retrieval call binding the contract method 0x5a7e1989.
//
// Solidity: function getLastUpdate(address node) view returns(uint256)
func (_Reputationledger *ReputationledgerCallerSession) GetLastUpdate(node common.Address) (*big.Int, error) {
	return _Reputationledger.Contract.GetLastUpdate(&_Reputationledger.CallOpts, node)
}

// GetMaxReputation is a free data retrieval call binding the contract method 0x39066bf5.
//
// Solidity: function getMaxReputation() pure returns(int256)
func (_Reputationledger *ReputationledgerCaller) GetMaxReputation(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Reputationledger.contract.Call(opts, &out, "getMaxReputation")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetMaxReputation is a free data retrieval call binding the contract method 0x39066bf5.
//
// Solidity: function getMaxReputation() pure returns(int256)
func (_Reputationledger *ReputationledgerSession) GetMaxReputation() (*big.Int, error) {
	return _Reputationledger.Contract.GetMaxReputation(&_Reputationledger.CallOpts)
}

// GetMaxReputation is a free data retrieval call binding the contract method 0x39066bf5.
//
// Solidity: function getMaxReputation() pure returns(int256)
func (_Reputationledger *ReputationledgerCallerSession) GetMaxReputation() (*big.Int, error) {
	return _Reputationledger.Contract.GetMaxReputation(&_Reputationledger.CallOpts)
}

// GetMinReputation is a free data retrieval call binding the contract method 0xd5b84dba.
//
// Solidity: function getMinReputation() pure returns(int256)
func (_Reputationledger *ReputationledgerCaller) GetMinReputation(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Reputationledger.contract.Call(opts, &out, "getMinReputation")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetMinReputation is a free data retrieval call binding the contract method 0xd5b84dba.
//
// Solidity: function getMinReputation() pure returns(int256)
func (_Reputationledger *ReputationledgerSession) GetMinReputation() (*big.Int, error) {
	return _Reputationledger.Contract.GetMinReputation(&_Reputationledger.CallOpts)
}

// GetMinReputation is a free data retrieval call binding the contract method 0xd5b84dba.
//
// Solidity: function getMinReputation() pure returns(int256)
func (_Reputationledger *ReputationledgerCallerSession) GetMinReputation() (*big.Int, error) {
	return _Reputationledger.Contract.GetMinReputation(&_Reputationledger.CallOpts)
}

// GetReputation is a free data retrieval call binding the contract method 0x9c89a0e2.
//
// Solidity: function getReputation(address node) view returns(int256)
func (_Reputationledger *ReputationledgerCaller) GetReputation(opts *bind.CallOpts, node common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Reputationledger.contract.Call(opts, &out, "getReputation", node)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetReputation is a free data retrieval call binding the contract method 0x9c89a0e2.
//
// Solidity: function getReputation(address node) view returns(int256)
func (_Reputationledger *ReputationledgerSession) GetReputation(node common.Address) (*big.Int, error) {
	return _Reputationledger.Contract.GetReputation(&_Reputationledger.CallOpts, node)
}

// GetReputation is a free data retrieval call binding the contract method 0x9c89a0e2.
//
// Solidity: function getReputation(address node) view returns(int256)
func (_Reputationledger *ReputationledgerCallerSession) GetReputation(node common.Address) (*big.Int, error) {
	return _Reputationledger.Contract.GetReputation(&_Reputationledger.CallOpts, node)
}

// GetReputationTier is a free data retrieval call binding the contract method 0x6be2cefb.
//
// Solidity: function getReputationTier(address node) view returns(string)
func (_Reputationledger *ReputationledgerCaller) GetReputationTier(opts *bind.CallOpts, node common.Address) (string, error) {
	var out []interface{}
	err := _Reputationledger.contract.Call(opts, &out, "getReputationTier", node)

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// GetReputationTier is a free data retrieval call binding the contract method 0x6be2cefb.
//
// Solidity: function getReputationTier(address node) view returns(string)
func (_Reputationledger *ReputationledgerSession) GetReputationTier(node common.Address) (string, error) {
	return _Reputationledger.Contract.GetReputationTier(&_Reputationledger.CallOpts, node)
}

// GetReputationTier is a free data retrieval call binding the contract method 0x6be2cefb.
//
// Solidity: function getReputationTier(address node) view returns(string)
func (_Reputationledger *ReputationledgerCallerSession) GetReputationTier(node common.Address) (string, error) {
	return _Reputationledger.Contract.GetReputationTier(&_Reputationledger.CallOpts, node)
}

// HasReputation is a free data retrieval call binding the contract method 0x7f29ee4c.
//
// Solidity: function hasReputation(address node) view returns(bool)
func (_Reputationledger *ReputationledgerCaller) HasReputation(opts *bind.CallOpts, node common.Address) (bool, error) {
	var out []interface{}
	err := _Reputationledger.contract.Call(opts, &out, "hasReputation", node)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// HasReputation is a free data retrieval call binding the contract method 0x7f29ee4c.
//
// Solidity: function hasReputation(address node) view returns(bool)
func (_Reputationledger *ReputationledgerSession) HasReputation(node common.Address) (bool, error) {
	return _Reputationledger.Contract.HasReputation(&_Reputationledger.CallOpts, node)
}

// HasReputation is a free data retrieval call binding the contract method 0x7f29ee4c.
//
// Solidity: function hasReputation(address node) view returns(bool)
func (_Reputationledger *ReputationledgerCallerSession) HasReputation(node common.Address) (bool, error) {
	return _Reputationledger.Contract.HasReputation(&_Reputationledger.CallOpts, node)
}

// IsAuthorized is a free data retrieval call binding the contract method 0xfe9fbb80.
//
// Solidity: function isAuthorized(address caller) view returns(bool)
func (_Reputationledger *ReputationledgerCaller) IsAuthorized(opts *bind.CallOpts, caller common.Address) (bool, error) {
	var out []interface{}
	err := _Reputationledger.contract.Call(opts, &out, "isAuthorized", caller)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// IsAuthorized is a free data retrieval call binding the contract method 0xfe9fbb80.
//
// Solidity: function isAuthorized(address caller) view returns(bool)
func (_Reputationledger *ReputationledgerSession) IsAuthorized(caller common.Address) (bool, error) {
	return _Reputationledger.Contract.IsAuthorized(&_Reputationledger.CallOpts, caller)
}

// IsAuthorized is a free data retrieval call binding the contract method 0xfe9fbb80.
//
// Solidity: function isAuthorized(address caller) view returns(bool)
func (_Reputationledger *ReputationledgerCallerSession) IsAuthorized(caller common.Address) (bool, error) {
	return _Reputationledger.Contract.IsAuthorized(&_Reputationledger.CallOpts, caller)
}

// LastUpdate is a free data retrieval call binding the contract method 0xcb03fb1e.
//
// Solidity: function lastUpdate(address ) view returns(uint256)
func (_Reputationledger *ReputationledgerCaller) LastUpdate(opts *bind.CallOpts, arg0 common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Reputationledger.contract.Call(opts, &out, "lastUpdate", arg0)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// LastUpdate is a free data retrieval call binding the contract method 0xcb03fb1e.
//
// Solidity: function lastUpdate(address ) view returns(uint256)
func (_Reputationledger *ReputationledgerSession) LastUpdate(arg0 common.Address) (*big.Int, error) {
	return _Reputationledger.Contract.LastUpdate(&_Reputationledger.CallOpts, arg0)
}

// LastUpdate is a free data retrieval call binding the contract method 0xcb03fb1e.
//
// Solidity: function lastUpdate(address ) view returns(uint256)
func (_Reputationledger *ReputationledgerCallerSession) LastUpdate(arg0 common.Address) (*big.Int, error) {
	return _Reputationledger.Contract.LastUpdate(&_Reputationledger.CallOpts, arg0)
}

// RegisteredAt is a free data retrieval call binding the contract method 0xaaea3d9c.
//
// Solidity: function registeredAt(address ) view returns(uint256)
func (_Reputationledger *ReputationledgerCaller) RegisteredAt(opts *bind.CallOpts, arg0 common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Reputationledger.contract.Call(opts, &out, "registeredAt", arg0)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// RegisteredAt is a free data retrieval call binding the contract method 0xaaea3d9c.
//
// Solidity: function registeredAt(address ) view returns(uint256)
func (_Reputationledger *ReputationledgerSession) RegisteredAt(arg0 common.Address) (*big.Int, error) {
	return _Reputationledger.Contract.RegisteredAt(&_Reputationledger.CallOpts, arg0)
}

// RegisteredAt is a free data retrieval call binding the contract method 0xaaea3d9c.
//
// Solidity: function registeredAt(address ) view returns(uint256)
func (_Reputationledger *ReputationledgerCallerSession) RegisteredAt(arg0 common.Address) (*big.Int, error) {
	return _Reputationledger.Contract.RegisteredAt(&_Reputationledger.CallOpts, arg0)
}

// ReputationScore is a free data retrieval call binding the contract method 0x50d061cb.
//
// Solidity: function reputationScore(address ) view returns(int256)
func (_Reputationledger *ReputationledgerCaller) ReputationScore(opts *bind.CallOpts, arg0 common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Reputationledger.contract.Call(opts, &out, "reputationScore", arg0)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// ReputationScore is a free data retrieval call binding the contract method 0x50d061cb.
//
// Solidity: function reputationScore(address ) view returns(int256)
func (_Reputationledger *ReputationledgerSession) ReputationScore(arg0 common.Address) (*big.Int, error) {
	return _Reputationledger.Contract.ReputationScore(&_Reputationledger.CallOpts, arg0)
}

// ReputationScore is a free data retrieval call binding the contract method 0x50d061cb.
//
// Solidity: function reputationScore(address ) view returns(int256)
func (_Reputationledger *ReputationledgerCallerSession) ReputationScore(arg0 common.Address) (*big.Int, error) {
	return _Reputationledger.Contract.ReputationScore(&_Reputationledger.CallOpts, arg0)
}

// ApplyDecay is a paid mutator transaction binding the contract method 0xedfcc437.
//
// Solidity: function applyDecay(address node) returns()
func (_Reputationledger *ReputationledgerTransactor) ApplyDecay(opts *bind.TransactOpts, node common.Address) (*types.Transaction, error) {
	return _Reputationledger.contract.Transact(opts, "applyDecay", node)
}

// ApplyDecay is a paid mutator transaction binding the contract method 0xedfcc437.
//
// Solidity: function applyDecay(address node) returns()
func (_Reputationledger *ReputationledgerSession) ApplyDecay(node common.Address) (*types.Transaction, error) {
	return _Reputationledger.Contract.ApplyDecay(&_Reputationledger.TransactOpts, node)
}

// ApplyDecay is a paid mutator transaction binding the contract method 0xedfcc437.
//
// Solidity: function applyDecay(address node) returns()
func (_Reputationledger *ReputationledgerTransactorSession) ApplyDecay(node common.Address) (*types.Transaction, error) {
	return _Reputationledger.Contract.ApplyDecay(&_Reputationledger.TransactOpts, node)
}

// AuthorizeCaller is a paid mutator transaction binding the contract method 0x2c388d5d.
//
// Solidity: function authorizeCaller(address caller) returns()
func (_Reputationledger *ReputationledgerTransactor) AuthorizeCaller(opts *bind.TransactOpts, caller common.Address) (*types.Transaction, error) {
	return _Reputationledger.contract.Transact(opts, "authorizeCaller", caller)
}

// AuthorizeCaller is a paid mutator transaction binding the contract method 0x2c388d5d.
//
// Solidity: function authorizeCaller(address caller) returns()
func (_Reputationledger *ReputationledgerSession) AuthorizeCaller(caller common.Address) (*types.Transaction, error) {
	return _Reputationledger.Contract.AuthorizeCaller(&_Reputationledger.TransactOpts, caller)
}

// AuthorizeCaller is a paid mutator transaction binding the contract method 0x2c388d5d.
//
// Solidity: function authorizeCaller(address caller) returns()
func (_Reputationledger *ReputationledgerTransactorSession) AuthorizeCaller(caller common.Address) (*types.Transaction, error) {
	return _Reputationledger.Contract.AuthorizeCaller(&_Reputationledger.TransactOpts, caller)
}

// BatchApplyDecay is a paid mutator transaction binding the contract method 0x9c1a64e4.
//
// Solidity: function batchApplyDecay(address[] nodes) returns()
func (_Reputationledger *ReputationledgerTransactor) BatchApplyDecay(opts *bind.TransactOpts, nodes []common.Address) (*types.Transaction, error) {
	return _Reputationledger.contract.Transact(opts, "batchApplyDecay", nodes)
}

// BatchApplyDecay is a paid mutator transaction binding the contract method 0x9c1a64e4.
//
// Solidity: function batchApplyDecay(address[] nodes) returns()
func (_Reputationledger *ReputationledgerSession) BatchApplyDecay(nodes []common.Address) (*types.Transaction, error) {
	return _Reputationledger.Contract.BatchApplyDecay(&_Reputationledger.TransactOpts, nodes)
}

// BatchApplyDecay is a paid mutator transaction binding the contract method 0x9c1a64e4.
//
// Solidity: function batchApplyDecay(address[] nodes) returns()
func (_Reputationledger *ReputationledgerTransactorSession) BatchApplyDecay(nodes []common.Address) (*types.Transaction, error) {
	return _Reputationledger.Contract.BatchApplyDecay(&_Reputationledger.TransactOpts, nodes)
}

// DecrementReputation is a paid mutator transaction binding the contract method 0x3fa9409b.
//
// Solidity: function decrementReputation(address node, int256 delta) returns()
func (_Reputationledger *ReputationledgerTransactor) DecrementReputation(opts *bind.TransactOpts, node common.Address, delta *big.Int) (*types.Transaction, error) {
	return _Reputationledger.contract.Transact(opts, "decrementReputation", node, delta)
}

// DecrementReputation is a paid mutator transaction binding the contract method 0x3fa9409b.
//
// Solidity: function decrementReputation(address node, int256 delta) returns()
func (_Reputationledger *ReputationledgerSession) DecrementReputation(node common.Address, delta *big.Int) (*types.Transaction, error) {
	return _Reputationledger.Contract.DecrementReputation(&_Reputationledger.TransactOpts, node, delta)
}

// DecrementReputation is a paid mutator transaction binding the contract method 0x3fa9409b.
//
// Solidity: function decrementReputation(address node, int256 delta) returns()
func (_Reputationledger *ReputationledgerTransactorSession) DecrementReputation(node common.Address, delta *big.Int) (*types.Transaction, error) {
	return _Reputationledger.Contract.DecrementReputation(&_Reputationledger.TransactOpts, node, delta)
}

// IncrementReputation is a paid mutator transaction binding the contract method 0x9469dc92.
//
// Solidity: function incrementReputation(address node, int256 delta) returns()
func (_Reputationledger *ReputationledgerTransactor) IncrementReputation(opts *bind.TransactOpts, node common.Address, delta *big.Int) (*types.Transaction, error) {
	return _Reputationledger.contract.Transact(opts, "incrementReputation", node, delta)
}

// IncrementReputation is a paid mutator transaction binding the contract method 0x9469dc92.
//
// Solidity: function incrementReputation(address node, int256 delta) returns()
func (_Reputationledger *ReputationledgerSession) IncrementReputation(node common.Address, delta *big.Int) (*types.Transaction, error) {
	return _Reputationledger.Contract.IncrementReputation(&_Reputationledger.TransactOpts, node, delta)
}

// IncrementReputation is a paid mutator transaction binding the contract method 0x9469dc92.
//
// Solidity: function incrementReputation(address node, int256 delta) returns()
func (_Reputationledger *ReputationledgerTransactorSession) IncrementReputation(node common.Address, delta *big.Int) (*types.Transaction, error) {
	return _Reputationledger.Contract.IncrementReputation(&_Reputationledger.TransactOpts, node, delta)
}

// InitializeNode is a paid mutator transaction binding the contract method 0xcb3b89d8.
//
// Solidity: function initializeNode(address node) returns()
func (_Reputationledger *ReputationledgerTransactor) InitializeNode(opts *bind.TransactOpts, node common.Address) (*types.Transaction, error) {
	return _Reputationledger.contract.Transact(opts, "initializeNode", node)
}

// InitializeNode is a paid mutator transaction binding the contract method 0xcb3b89d8.
//
// Solidity: function initializeNode(address node) returns()
func (_Reputationledger *ReputationledgerSession) InitializeNode(node common.Address) (*types.Transaction, error) {
	return _Reputationledger.Contract.InitializeNode(&_Reputationledger.TransactOpts, node)
}

// InitializeNode is a paid mutator transaction binding the contract method 0xcb3b89d8.
//
// Solidity: function initializeNode(address node) returns()
func (_Reputationledger *ReputationledgerTransactorSession) InitializeNode(node common.Address) (*types.Transaction, error) {
	return _Reputationledger.Contract.InitializeNode(&_Reputationledger.TransactOpts, node)
}

// RevokeCaller is a paid mutator transaction binding the contract method 0xb7743530.
//
// Solidity: function revokeCaller(address caller) returns()
func (_Reputationledger *ReputationledgerTransactor) RevokeCaller(opts *bind.TransactOpts, caller common.Address) (*types.Transaction, error) {
	return _Reputationledger.contract.Transact(opts, "revokeCaller", caller)
}

// RevokeCaller is a paid mutator transaction binding the contract method 0xb7743530.
//
// Solidity: function revokeCaller(address caller) returns()
func (_Reputationledger *ReputationledgerSession) RevokeCaller(caller common.Address) (*types.Transaction, error) {
	return _Reputationledger.Contract.RevokeCaller(&_Reputationledger.TransactOpts, caller)
}

// RevokeCaller is a paid mutator transaction binding the contract method 0xb7743530.
//
// Solidity: function revokeCaller(address caller) returns()
func (_Reputationledger *ReputationledgerTransactorSession) RevokeCaller(caller common.Address) (*types.Transaction, error) {
	return _Reputationledger.Contract.RevokeCaller(&_Reputationledger.TransactOpts, caller)
}

// ReputationledgerReputationUpdatedIterator is returned from FilterReputationUpdated and is used to iterate over the raw logs and unpacked data for ReputationUpdated events raised by the Reputationledger contract.
type ReputationledgerReputationUpdatedIterator struct {
	Event *ReputationledgerReputationUpdated // Event containing the contract specifics and raw log

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
func (it *ReputationledgerReputationUpdatedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(ReputationledgerReputationUpdated)
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
		it.Event = new(ReputationledgerReputationUpdated)
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
func (it *ReputationledgerReputationUpdatedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *ReputationledgerReputationUpdatedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// ReputationledgerReputationUpdated represents a ReputationUpdated event raised by the Reputationledger contract.
type ReputationledgerReputationUpdated struct {
	Node      common.Address
	Delta     *big.Int
	NewScore  *big.Int
	Timestamp *big.Int
	Raw       types.Log // Blockchain specific contextual infos
}

// FilterReputationUpdated is a free log retrieval operation binding the contract event 0xe35f9c182810425ce2ad512d42e43c5ff30b370f73e3277f7fe538adfda20726.
//
// Solidity: event ReputationUpdated(address indexed node, int256 delta, uint256 newScore, uint256 timestamp)
func (_Reputationledger *ReputationledgerFilterer) FilterReputationUpdated(opts *bind.FilterOpts, node []common.Address) (*ReputationledgerReputationUpdatedIterator, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _Reputationledger.contract.FilterLogs(opts, "ReputationUpdated", nodeRule)
	if err != nil {
		return nil, err
	}
	return &ReputationledgerReputationUpdatedIterator{contract: _Reputationledger.contract, event: "ReputationUpdated", logs: logs, sub: sub}, nil
}

// WatchReputationUpdated is a free log subscription operation binding the contract event 0xe35f9c182810425ce2ad512d42e43c5ff30b370f73e3277f7fe538adfda20726.
//
// Solidity: event ReputationUpdated(address indexed node, int256 delta, uint256 newScore, uint256 timestamp)
func (_Reputationledger *ReputationledgerFilterer) WatchReputationUpdated(opts *bind.WatchOpts, sink chan<- *ReputationledgerReputationUpdated, node []common.Address) (event.Subscription, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _Reputationledger.contract.WatchLogs(opts, "ReputationUpdated", nodeRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(ReputationledgerReputationUpdated)
				if err := _Reputationledger.contract.UnpackLog(event, "ReputationUpdated", log); err != nil {
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

// ParseReputationUpdated is a log parse operation binding the contract event 0xe35f9c182810425ce2ad512d42e43c5ff30b370f73e3277f7fe538adfda20726.
//
// Solidity: event ReputationUpdated(address indexed node, int256 delta, uint256 newScore, uint256 timestamp)
func (_Reputationledger *ReputationledgerFilterer) ParseReputationUpdated(log types.Log) (*ReputationledgerReputationUpdated, error) {
	event := new(ReputationledgerReputationUpdated)
	if err := _Reputationledger.contract.UnpackLog(event, "ReputationUpdated", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
