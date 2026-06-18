// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package noderegistry

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

// INodeRegistryNode is an auto generated low-level Go binding around an user-defined struct.
type INodeRegistryNode struct {
	StakeAmount     *big.Int
	Status          uint8
	RegisteredAt    *big.Int
	LastHeartbeat   *big.Int
	ReputationScore *big.Int
}

// NoderegistryMetaData contains all meta data concerning the Noderegistry contract.
var NoderegistryMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"oldMinStake\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"newMinStake\",\"type\":\"uint256\"}],\"name\":\"MinStakeUpdated\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"stakeAmount\",\"type\":\"uint256\"}],\"name\":\"NodeRegistered\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"enumINodeRegistry.NodeStatus\",\"name\":\"oldStatus\",\"type\":\"uint8\"},{\"indexed\":false,\"internalType\":\"enumINodeRegistry.NodeStatus\",\"name\":\"newStatus\",\"type\":\"uint8\"}],\"name\":\"NodeStatusChanged\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"newStakeAmount\",\"type\":\"uint256\"}],\"name\":\"StakeUpdated\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"MIN_STAKE\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"caller\",\"type\":\"address\"}],\"name\":\"authorizeCaller\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getAllNodes\",\"outputs\":[{\"internalType\":\"address[]\",\"name\":\"\",\"type\":\"address[]\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getMinStake\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"}],\"name\":\"getNode\",\"outputs\":[{\"components\":[{\"internalType\":\"uint256\",\"name\":\"stakeAmount\",\"type\":\"uint256\"},{\"internalType\":\"enumINodeRegistry.NodeStatus\",\"name\":\"status\",\"type\":\"uint8\"},{\"internalType\":\"uint256\",\"name\":\"registeredAt\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"lastHeartbeat\",\"type\":\"uint256\"},{\"internalType\":\"int256\",\"name\":\"reputationScore\",\"type\":\"int256\"}],\"internalType\":\"structINodeRegistry.Node\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"}],\"name\":\"getNodeStatus\",\"outputs\":[{\"internalType\":\"enumINodeRegistry.NodeStatus\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"}],\"name\":\"getReputation\",\"outputs\":[{\"internalType\":\"int256\",\"name\":\"\",\"type\":\"int256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"}],\"name\":\"getStake\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"}],\"name\":\"isRegistered\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"}],\"name\":\"meetsMinStake\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"initialStake\",\"type\":\"uint256\"}],\"name\":\"registerNode\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"caller\",\"type\":\"address\"}],\"name\":\"revokeCaller\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"slashStake\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"}],\"name\":\"updateHeartbeat\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"newMinStake\",\"type\":\"uint256\"}],\"name\":\"updateMinStake\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"},{\"internalType\":\"enumINodeRegistry.NodeStatus\",\"name\":\"newStatus\",\"type\":\"uint8\"}],\"name\":\"updateNodeStatus\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"},{\"internalType\":\"int256\",\"name\":\"delta\",\"type\":\"int256\"}],\"name\":\"updateReputation\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"additionalStake\",\"type\":\"uint256\"}],\"name\":\"updateStake\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"withdrawStake\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]",
	Bin: "0x608060405267016345785d8a000060035534801561001c57600080fd5b506001600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff021916908315150217905550612006806100846000396000f3fe6080604052600436106101145760003560e01c80638cdb442f116100a0578063b65f817711610064578063b65f817714610391578063b7743530146103ce578063c3c5a547146103f7578063cb1c2b5c14610434578063fd0de96b1461045f57610114565b80638cdb442f1461028657806398d1c5a8146102af5780639c89a0e2146102ec5780639d20904814610329578063a1174e7d1461036657610114565b806358bc14f3116100e757806358bc14f3146101bf5780636a08b511146101e85780637a766460146102115780637c1f751f1461024e5780637f980edf1461026a57610114565b806325d5971f146101195780632c388d5d1461014257806356a3b5fa1461016b578063581f8b9b14610196575b600080fd5b34801561012557600080fd5b50610140600480360381019061013b919061166d565b61049c565b005b34801561014e57600080fd5b50610169600480360381019061016491906116f8565b6106e1565b005b34801561017757600080fd5b5061018061073c565b60405161018d9190611734565b60405180910390f35b3480156101a257600080fd5b506101bd60048036038101906101b89190611774565b610746565b005b3480156101cb57600080fd5b506101e660048036038101906101e191906116f8565b61092d565b005b3480156101f457600080fd5b5061020f600480360381019061020a91906117ea565b610aa5565b005b34801561021d57600080fd5b50610238600480360381019061023391906116f8565b610c2f565b6040516102459190611734565b60405180910390f35b6102686004803603810190610263919061166d565b610c91565b005b610284600480360381019061027f919061166d565b610dd1565b005b34801561029257600080fd5b506102ad60048036038101906102a8919061166d565b611044565b005b3480156102bb57600080fd5b506102d660048036038101906102d1919061182a565b61108f565b6040516102e39190611734565b60405180910390f35b3480156102f857600080fd5b50610313600480360381019061030e91906116f8565b611269565b6040516103209190611879565b60405180910390f35b34801561033557600080fd5b50610350600480360381019061034b91906116f8565b6112cb565b60405161035d9190611991565b60405180910390f35b34801561037257600080fd5b5061037b6113d0565b6040516103889190611a6a565b60405180910390f35b34801561039d57600080fd5b506103b860048036038101906103b391906116f8565b61145e565b6040516103c59190611a9b565b60405180910390f35b3480156103da57600080fd5b506103f560048036038101906103f091906116f8565b6114cd565b005b34801561040357600080fd5b5061041e600480360381019061041991906116f8565b611528565b60405161042b9190611ad1565b60405180910390f35b34801561044057600080fd5b5061044961157e565b6040516104569190611734565b60405180910390f35b34801561046b57600080fd5b50610486600480360381019061048191906116f8565b61158a565b6040516104939190611ad1565b60405180910390f35b336104a681611528565b6104e5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104dc90611b49565b60405180910390fd5b60008060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000209050828160000154101561056e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161056590611bb5565b60405180910390fd5b6003548382600001546105819190611c04565b10156105c2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105b990611c84565b60405180910390fd5b828160000160008282546105d69190611c04565b9250508190555060003373ffffffffffffffffffffffffffffffffffffffff168460405161060390611cd5565b60006040518083038185875af1925050503d8060008114610640576040519150601f19603f3d011682016040523d82523d6000602084013e610645565b606091505b5050905080610689576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161068090611d36565b60405180910390fd5b3373ffffffffffffffffffffffffffffffffffffffff167fab0e25dc39626189cfb41155020ba89e726b10244275733e9d7c63cf33ffccdb83600001546040516106d39190611734565b60405180910390a250505050565b6001600460008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b6000600354905090565b600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff166107d2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107c990611da2565b60405180910390fd5b816107dc81611528565b61081b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161081290611b49565b60405180910390fd5b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160009054906101000a900460ff169050826000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160006101000a81548160ff021916908360038111156108d2576108d16118a3565b5b02179055508373ffffffffffffffffffffffffffffffffffffffff167ffb5740b379943f137d27260c0f7bd5f908f4d60a4507fd1c4824d264a00f0a72828560405161091f929190611dc2565b60405180910390a250505050565b8061093781611528565b610976576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161096d90611b49565b60405180910390fd5b426000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060030181905550600260038111156109d0576109cf6118a3565b5b6000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160009054906101000a900460ff166003811115610a3157610a306118a3565b5b03610aa15760016000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160006101000a81548160ff02191690836003811115610a9b57610a9a6118a3565b5b02179055505b5050565b600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16610b31576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b2890611da2565b60405180910390fd5b81610b3b81611528565b610b7a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b7190611b49565b60405180910390fd5b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020905082816004016000828254610bd09190611deb565b925050819055508373ffffffffffffffffffffffffffffffffffffffff167fab0e25dc39626189cfb41155020ba89e726b10244275733e9d7c63cf33ffccdb8260000154604051610c219190611734565b60405180910390a250505050565b6000610c3a82611528565b610c475760009050610c8c565b6000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000015490505b919050565b33610c9b81611528565b610cda576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610cd190611b49565b60405180910390fd5b81341015610d1d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d1490611e7b565b60405180910390fd5b60008060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020905034816000016000828254610d739190611e9b565b925050819055503373ffffffffffffffffffffffffffffffffffffffff167fab0e25dc39626189cfb41155020ba89e726b10244275733e9d7c63cf33ffccdb8260000154604051610dc49190611734565b60405180910390a2505050565b80600354811015610e17576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e0e90611f1b565b60405180910390fd5b610e2033611528565b15610e60576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e5790611f87565b60405180910390fd5b81341015610ea3576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e9a90611e7b565b60405180910390fd5b60008060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020905034816000018190555060018160010160006101000a81548160ff02191690836003811115610f1657610f156118a3565b5b02179055504281600201819055504281600301819055506000816004018190555060018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055506002339080600181540180825580915050600190039060005260206000200160009091909190916101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503373ffffffffffffffffffffffffffffffffffffffff167ff773bca07d020a1bc1fdd45ea3db573da547dd27180143afaf075c158a847594346040516110379190611734565b60405180910390a2505050565b60006003549050816003819055507f171aabb8815c02fd00303450a77058600e3661eb75ce2e77972c0f080bc7099d8183604051611083929190611fa7565b60405180910390a15050565b6000600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff1661111d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161111490611da2565b60405180910390fd5b8261112781611528565b611166576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161115d90611b49565b60405180910390fd5b60008060008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002090506000816000015485116111bb57846111c1565b81600001545b9050808260000160008282546111d79190611c04565b9250508190555060038260010160006101000a81548160ff02191690836003811115611206576112056118a3565b5b02179055508573ffffffffffffffffffffffffffffffffffffffff167ffb5740b379943f137d27260c0f7bd5f908f4d60a4507fd1c4824d264a00f0a7260016003604051611255929190611dc2565b60405180910390a280935050505092915050565b600061127482611528565b61128157600090506112c6565b6000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206004015490505b919050565b6112d36115f1565b816112dd81611528565b61131c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161131390611b49565b60405180910390fd5b6000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206040518060a0016040529081600082015481526020016001820160009054906101000a900460ff166003811115611394576113936118a3565b5b60038111156113a6576113a56118a3565b5b81526020016002820154815260200160038201548152602001600482015481525050915050919050565b6060600280548060200260200160405190810160405280929190818152602001828054801561145457602002820191906000526020600020905b8160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001906001019080831161140a575b5050505050905090565b600061146982611528565b61147657600090506114c8565b6000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160009054906101000a900460ff1690505b919050565b6000600460008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff169050919050565b67016345785d8a000081565b600061159582611528565b6115a257600090506115ec565b6003546000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000154101590505b919050565b6040518060a001604052806000815260200160006003811115611617576116166118a3565b5b81526020016000815260200160008152602001600081525090565b600080fd5b6000819050919050565b61164a81611637565b811461165557600080fd5b50565b60008135905061166781611641565b92915050565b60006020828403121561168357611682611632565b5b600061169184828501611658565b91505092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006116c58261169a565b9050919050565b6116d5816116ba565b81146116e057600080fd5b50565b6000813590506116f2816116cc565b92915050565b60006020828403121561170e5761170d611632565b5b600061171c848285016116e3565b91505092915050565b61172e81611637565b82525050565b60006020820190506117496000830184611725565b92915050565b6004811061175c57600080fd5b50565b60008135905061176e8161174f565b92915050565b6000806040838503121561178b5761178a611632565b5b6000611799858286016116e3565b92505060206117aa8582860161175f565b9150509250929050565b6000819050919050565b6117c7816117b4565b81146117d257600080fd5b50565b6000813590506117e4816117be565b92915050565b6000806040838503121561180157611800611632565b5b600061180f858286016116e3565b9250506020611820858286016117d5565b9150509250929050565b6000806040838503121561184157611840611632565b5b600061184f858286016116e3565b925050602061186085828601611658565b9150509250929050565b611873816117b4565b82525050565b600060208201905061188e600083018461186a565b92915050565b61189d81611637565b82525050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b600481106118e3576118e26118a3565b5b50565b60008190506118f4826118d2565b919050565b6000611904826118e6565b9050919050565b611914816118f9565b82525050565b611923816117b4565b82525050565b60a08201600082015161193f6000850182611894565b506020820151611952602085018261190b565b5060408201516119656040850182611894565b5060608201516119786060850182611894565b50608082015161198b608085018261191a565b50505050565b600060a0820190506119a66000830184611929565b92915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6119e1816116ba565b82525050565b60006119f383836119d8565b60208301905092915050565b6000602082019050919050565b6000611a17826119ac565b611a2181856119b7565b9350611a2c836119c8565b8060005b83811015611a5d578151611a4488826119e7565b9750611a4f836119ff565b925050600181019050611a30565b5085935050505092915050565b60006020820190508181036000830152611a848184611a0c565b905092915050565b611a95816118f9565b82525050565b6000602082019050611ab06000830184611a8c565b92915050565b60008115159050919050565b611acb81611ab6565b82525050565b6000602082019050611ae66000830184611ac2565b92915050565b600082825260208201905092915050565b7f4e6f6465206e6f74207265676973746572656400000000000000000000000000600082015250565b6000611b33601383611aec565b9150611b3e82611afd565b602082019050919050565b60006020820190508181036000830152611b6281611b26565b9050919050565b7f496e73756666696369656e74207374616b650000000000000000000000000000600082015250565b6000611b9f601283611aec565b9150611baa82611b69565b602082019050919050565b60006020820190508181036000830152611bce81611b92565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000611c0f82611637565b9150611c1a83611637565b9250828203905081811115611c3257611c31611bd5565b5b92915050565b7f43616e6e6f7420676f2062656c6f77206d696e696d756d207374616b65000000600082015250565b6000611c6e601d83611aec565b9150611c7982611c38565b602082019050919050565b60006020820190508181036000830152611c9d81611c61565b9050919050565b600081905092915050565b50565b6000611cbf600083611ca4565b9150611cca82611caf565b600082019050919050565b6000611ce082611cb2565b9150819050919050565b7f5472616e73666572206661696c65640000000000000000000000000000000000600082015250565b6000611d20600f83611aec565b9150611d2b82611cea565b602082019050919050565b60006020820190508181036000830152611d4f81611d13565b9050919050565b7f43616c6c6572206e6f7420617574686f72697a65640000000000000000000000600082015250565b6000611d8c601583611aec565b9150611d9782611d56565b602082019050919050565b60006020820190508181036000830152611dbb81611d7f565b9050919050565b6000604082019050611dd76000830185611a8c565b611de46020830184611a8c565b9392505050565b6000611df6826117b4565b9150611e01836117b4565b925082820190508281121560008312168382126000841215161715611e2957611e28611bd5565b5b92915050565b7f496e636f7272656374204554482076616c756500000000000000000000000000600082015250565b6000611e65601383611aec565b9150611e7082611e2f565b602082019050919050565b60006020820190508181036000830152611e9481611e58565b9050919050565b6000611ea682611637565b9150611eb183611637565b9250828201905080821115611ec957611ec8611bd5565b5b92915050565b7f42656c6f77206d696e696d756d207374616b6500000000000000000000000000600082015250565b6000611f05601383611aec565b9150611f1082611ecf565b602082019050919050565b60006020820190508181036000830152611f3481611ef8565b9050919050565b7f416c726561647920726567697374657265640000000000000000000000000000600082015250565b6000611f71601283611aec565b9150611f7c82611f3b565b602082019050919050565b60006020820190508181036000830152611fa081611f64565b9050919050565b6000604082019050611fbc6000830185611725565b611fc96020830184611725565b939250505056fea26469706673582212206032017193bcf918eface7630731c1ecd280220782b4890d96cea4165e18464064736f6c63430008180033",
}

// NoderegistryABI is the input ABI used to generate the binding from.
// Deprecated: Use NoderegistryMetaData.ABI instead.
var NoderegistryABI = NoderegistryMetaData.ABI

// NoderegistryBin is the compiled bytecode used for deploying new contracts.
// Deprecated: Use NoderegistryMetaData.Bin instead.
var NoderegistryBin = NoderegistryMetaData.Bin

// DeployNoderegistry deploys a new Ethereum contract, binding an instance of Noderegistry to it.
func DeployNoderegistry(auth *bind.TransactOpts, backend bind.ContractBackend) (common.Address, *types.Transaction, *Noderegistry, error) {
	parsed, err := NoderegistryMetaData.GetAbi()
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	if parsed == nil {
		return common.Address{}, nil, nil, errors.New("GetABI returned nil")
	}

	address, tx, contract, err := bind.DeployContract(auth, *parsed, common.FromHex(NoderegistryBin), backend)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &Noderegistry{NoderegistryCaller: NoderegistryCaller{contract: contract}, NoderegistryTransactor: NoderegistryTransactor{contract: contract}, NoderegistryFilterer: NoderegistryFilterer{contract: contract}}, nil
}

// Noderegistry is an auto generated Go binding around an Ethereum contract.
type Noderegistry struct {
	NoderegistryCaller     // Read-only binding to the contract
	NoderegistryTransactor // Write-only binding to the contract
	NoderegistryFilterer   // Log filterer for contract events
}

// NoderegistryCaller is an auto generated read-only Go binding around an Ethereum contract.
type NoderegistryCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// NoderegistryTransactor is an auto generated write-only Go binding around an Ethereum contract.
type NoderegistryTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// NoderegistryFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type NoderegistryFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// NoderegistrySession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type NoderegistrySession struct {
	Contract     *Noderegistry     // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// NoderegistryCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type NoderegistryCallerSession struct {
	Contract *NoderegistryCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts       // Call options to use throughout this session
}

// NoderegistryTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type NoderegistryTransactorSession struct {
	Contract     *NoderegistryTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts       // Transaction auth options to use throughout this session
}

// NoderegistryRaw is an auto generated low-level Go binding around an Ethereum contract.
type NoderegistryRaw struct {
	Contract *Noderegistry // Generic contract binding to access the raw methods on
}

// NoderegistryCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type NoderegistryCallerRaw struct {
	Contract *NoderegistryCaller // Generic read-only contract binding to access the raw methods on
}

// NoderegistryTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type NoderegistryTransactorRaw struct {
	Contract *NoderegistryTransactor // Generic write-only contract binding to access the raw methods on
}

// NewNoderegistry creates a new instance of Noderegistry, bound to a specific deployed contract.
func NewNoderegistry(address common.Address, backend bind.ContractBackend) (*Noderegistry, error) {
	contract, err := bindNoderegistry(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Noderegistry{NoderegistryCaller: NoderegistryCaller{contract: contract}, NoderegistryTransactor: NoderegistryTransactor{contract: contract}, NoderegistryFilterer: NoderegistryFilterer{contract: contract}}, nil
}

// NewNoderegistryCaller creates a new read-only instance of Noderegistry, bound to a specific deployed contract.
func NewNoderegistryCaller(address common.Address, caller bind.ContractCaller) (*NoderegistryCaller, error) {
	contract, err := bindNoderegistry(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &NoderegistryCaller{contract: contract}, nil
}

// NewNoderegistryTransactor creates a new write-only instance of Noderegistry, bound to a specific deployed contract.
func NewNoderegistryTransactor(address common.Address, transactor bind.ContractTransactor) (*NoderegistryTransactor, error) {
	contract, err := bindNoderegistry(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &NoderegistryTransactor{contract: contract}, nil
}

// NewNoderegistryFilterer creates a new log filterer instance of Noderegistry, bound to a specific deployed contract.
func NewNoderegistryFilterer(address common.Address, filterer bind.ContractFilterer) (*NoderegistryFilterer, error) {
	contract, err := bindNoderegistry(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &NoderegistryFilterer{contract: contract}, nil
}

// bindNoderegistry binds a generic wrapper to an already deployed contract.
func bindNoderegistry(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := NoderegistryMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Noderegistry *NoderegistryRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Noderegistry.Contract.NoderegistryCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Noderegistry *NoderegistryRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Noderegistry.Contract.NoderegistryTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Noderegistry *NoderegistryRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Noderegistry.Contract.NoderegistryTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Noderegistry *NoderegistryCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Noderegistry.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Noderegistry *NoderegistryTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Noderegistry.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Noderegistry *NoderegistryTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Noderegistry.Contract.contract.Transact(opts, method, params...)
}

// MINSTAKE is a free data retrieval call binding the contract method 0xcb1c2b5c.
//
// Solidity: function MIN_STAKE() view returns(uint256)
func (_Noderegistry *NoderegistryCaller) MINSTAKE(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Noderegistry.contract.Call(opts, &out, "MIN_STAKE")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// MINSTAKE is a free data retrieval call binding the contract method 0xcb1c2b5c.
//
// Solidity: function MIN_STAKE() view returns(uint256)
func (_Noderegistry *NoderegistrySession) MINSTAKE() (*big.Int, error) {
	return _Noderegistry.Contract.MINSTAKE(&_Noderegistry.CallOpts)
}

// MINSTAKE is a free data retrieval call binding the contract method 0xcb1c2b5c.
//
// Solidity: function MIN_STAKE() view returns(uint256)
func (_Noderegistry *NoderegistryCallerSession) MINSTAKE() (*big.Int, error) {
	return _Noderegistry.Contract.MINSTAKE(&_Noderegistry.CallOpts)
}

// GetAllNodes is a free data retrieval call binding the contract method 0xa1174e7d.
//
// Solidity: function getAllNodes() view returns(address[])
func (_Noderegistry *NoderegistryCaller) GetAllNodes(opts *bind.CallOpts) ([]common.Address, error) {
	var out []interface{}
	err := _Noderegistry.contract.Call(opts, &out, "getAllNodes")

	if err != nil {
		return *new([]common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new([]common.Address)).(*[]common.Address)

	return out0, err

}

// GetAllNodes is a free data retrieval call binding the contract method 0xa1174e7d.
//
// Solidity: function getAllNodes() view returns(address[])
func (_Noderegistry *NoderegistrySession) GetAllNodes() ([]common.Address, error) {
	return _Noderegistry.Contract.GetAllNodes(&_Noderegistry.CallOpts)
}

// GetAllNodes is a free data retrieval call binding the contract method 0xa1174e7d.
//
// Solidity: function getAllNodes() view returns(address[])
func (_Noderegistry *NoderegistryCallerSession) GetAllNodes() ([]common.Address, error) {
	return _Noderegistry.Contract.GetAllNodes(&_Noderegistry.CallOpts)
}

// GetMinStake is a free data retrieval call binding the contract method 0x56a3b5fa.
//
// Solidity: function getMinStake() view returns(uint256)
func (_Noderegistry *NoderegistryCaller) GetMinStake(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Noderegistry.contract.Call(opts, &out, "getMinStake")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetMinStake is a free data retrieval call binding the contract method 0x56a3b5fa.
//
// Solidity: function getMinStake() view returns(uint256)
func (_Noderegistry *NoderegistrySession) GetMinStake() (*big.Int, error) {
	return _Noderegistry.Contract.GetMinStake(&_Noderegistry.CallOpts)
}

// GetMinStake is a free data retrieval call binding the contract method 0x56a3b5fa.
//
// Solidity: function getMinStake() view returns(uint256)
func (_Noderegistry *NoderegistryCallerSession) GetMinStake() (*big.Int, error) {
	return _Noderegistry.Contract.GetMinStake(&_Noderegistry.CallOpts)
}

// GetNode is a free data retrieval call binding the contract method 0x9d209048.
//
// Solidity: function getNode(address node) view returns((uint256,uint8,uint256,uint256,int256))
func (_Noderegistry *NoderegistryCaller) GetNode(opts *bind.CallOpts, node common.Address) (INodeRegistryNode, error) {
	var out []interface{}
	err := _Noderegistry.contract.Call(opts, &out, "getNode", node)

	if err != nil {
		return *new(INodeRegistryNode), err
	}

	out0 := *abi.ConvertType(out[0], new(INodeRegistryNode)).(*INodeRegistryNode)

	return out0, err

}

// GetNode is a free data retrieval call binding the contract method 0x9d209048.
//
// Solidity: function getNode(address node) view returns((uint256,uint8,uint256,uint256,int256))
func (_Noderegistry *NoderegistrySession) GetNode(node common.Address) (INodeRegistryNode, error) {
	return _Noderegistry.Contract.GetNode(&_Noderegistry.CallOpts, node)
}

// GetNode is a free data retrieval call binding the contract method 0x9d209048.
//
// Solidity: function getNode(address node) view returns((uint256,uint8,uint256,uint256,int256))
func (_Noderegistry *NoderegistryCallerSession) GetNode(node common.Address) (INodeRegistryNode, error) {
	return _Noderegistry.Contract.GetNode(&_Noderegistry.CallOpts, node)
}

// GetNodeStatus is a free data retrieval call binding the contract method 0xb65f8177.
//
// Solidity: function getNodeStatus(address node) view returns(uint8)
func (_Noderegistry *NoderegistryCaller) GetNodeStatus(opts *bind.CallOpts, node common.Address) (uint8, error) {
	var out []interface{}
	err := _Noderegistry.contract.Call(opts, &out, "getNodeStatus", node)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// GetNodeStatus is a free data retrieval call binding the contract method 0xb65f8177.
//
// Solidity: function getNodeStatus(address node) view returns(uint8)
func (_Noderegistry *NoderegistrySession) GetNodeStatus(node common.Address) (uint8, error) {
	return _Noderegistry.Contract.GetNodeStatus(&_Noderegistry.CallOpts, node)
}

// GetNodeStatus is a free data retrieval call binding the contract method 0xb65f8177.
//
// Solidity: function getNodeStatus(address node) view returns(uint8)
func (_Noderegistry *NoderegistryCallerSession) GetNodeStatus(node common.Address) (uint8, error) {
	return _Noderegistry.Contract.GetNodeStatus(&_Noderegistry.CallOpts, node)
}

// GetReputation is a free data retrieval call binding the contract method 0x9c89a0e2.
//
// Solidity: function getReputation(address node) view returns(int256)
func (_Noderegistry *NoderegistryCaller) GetReputation(opts *bind.CallOpts, node common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Noderegistry.contract.Call(opts, &out, "getReputation", node)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetReputation is a free data retrieval call binding the contract method 0x9c89a0e2.
//
// Solidity: function getReputation(address node) view returns(int256)
func (_Noderegistry *NoderegistrySession) GetReputation(node common.Address) (*big.Int, error) {
	return _Noderegistry.Contract.GetReputation(&_Noderegistry.CallOpts, node)
}

// GetReputation is a free data retrieval call binding the contract method 0x9c89a0e2.
//
// Solidity: function getReputation(address node) view returns(int256)
func (_Noderegistry *NoderegistryCallerSession) GetReputation(node common.Address) (*big.Int, error) {
	return _Noderegistry.Contract.GetReputation(&_Noderegistry.CallOpts, node)
}

// GetStake is a free data retrieval call binding the contract method 0x7a766460.
//
// Solidity: function getStake(address node) view returns(uint256)
func (_Noderegistry *NoderegistryCaller) GetStake(opts *bind.CallOpts, node common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Noderegistry.contract.Call(opts, &out, "getStake", node)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetStake is a free data retrieval call binding the contract method 0x7a766460.
//
// Solidity: function getStake(address node) view returns(uint256)
func (_Noderegistry *NoderegistrySession) GetStake(node common.Address) (*big.Int, error) {
	return _Noderegistry.Contract.GetStake(&_Noderegistry.CallOpts, node)
}

// GetStake is a free data retrieval call binding the contract method 0x7a766460.
//
// Solidity: function getStake(address node) view returns(uint256)
func (_Noderegistry *NoderegistryCallerSession) GetStake(node common.Address) (*big.Int, error) {
	return _Noderegistry.Contract.GetStake(&_Noderegistry.CallOpts, node)
}

// IsRegistered is a free data retrieval call binding the contract method 0xc3c5a547.
//
// Solidity: function isRegistered(address node) view returns(bool)
func (_Noderegistry *NoderegistryCaller) IsRegistered(opts *bind.CallOpts, node common.Address) (bool, error) {
	var out []interface{}
	err := _Noderegistry.contract.Call(opts, &out, "isRegistered", node)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// IsRegistered is a free data retrieval call binding the contract method 0xc3c5a547.
//
// Solidity: function isRegistered(address node) view returns(bool)
func (_Noderegistry *NoderegistrySession) IsRegistered(node common.Address) (bool, error) {
	return _Noderegistry.Contract.IsRegistered(&_Noderegistry.CallOpts, node)
}

// IsRegistered is a free data retrieval call binding the contract method 0xc3c5a547.
//
// Solidity: function isRegistered(address node) view returns(bool)
func (_Noderegistry *NoderegistryCallerSession) IsRegistered(node common.Address) (bool, error) {
	return _Noderegistry.Contract.IsRegistered(&_Noderegistry.CallOpts, node)
}

// MeetsMinStake is a free data retrieval call binding the contract method 0xfd0de96b.
//
// Solidity: function meetsMinStake(address node) view returns(bool)
func (_Noderegistry *NoderegistryCaller) MeetsMinStake(opts *bind.CallOpts, node common.Address) (bool, error) {
	var out []interface{}
	err := _Noderegistry.contract.Call(opts, &out, "meetsMinStake", node)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// MeetsMinStake is a free data retrieval call binding the contract method 0xfd0de96b.
//
// Solidity: function meetsMinStake(address node) view returns(bool)
func (_Noderegistry *NoderegistrySession) MeetsMinStake(node common.Address) (bool, error) {
	return _Noderegistry.Contract.MeetsMinStake(&_Noderegistry.CallOpts, node)
}

// MeetsMinStake is a free data retrieval call binding the contract method 0xfd0de96b.
//
// Solidity: function meetsMinStake(address node) view returns(bool)
func (_Noderegistry *NoderegistryCallerSession) MeetsMinStake(node common.Address) (bool, error) {
	return _Noderegistry.Contract.MeetsMinStake(&_Noderegistry.CallOpts, node)
}

// AuthorizeCaller is a paid mutator transaction binding the contract method 0x2c388d5d.
//
// Solidity: function authorizeCaller(address caller) returns()
func (_Noderegistry *NoderegistryTransactor) AuthorizeCaller(opts *bind.TransactOpts, caller common.Address) (*types.Transaction, error) {
	return _Noderegistry.contract.Transact(opts, "authorizeCaller", caller)
}

// AuthorizeCaller is a paid mutator transaction binding the contract method 0x2c388d5d.
//
// Solidity: function authorizeCaller(address caller) returns()
func (_Noderegistry *NoderegistrySession) AuthorizeCaller(caller common.Address) (*types.Transaction, error) {
	return _Noderegistry.Contract.AuthorizeCaller(&_Noderegistry.TransactOpts, caller)
}

// AuthorizeCaller is a paid mutator transaction binding the contract method 0x2c388d5d.
//
// Solidity: function authorizeCaller(address caller) returns()
func (_Noderegistry *NoderegistryTransactorSession) AuthorizeCaller(caller common.Address) (*types.Transaction, error) {
	return _Noderegistry.Contract.AuthorizeCaller(&_Noderegistry.TransactOpts, caller)
}

// RegisterNode is a paid mutator transaction binding the contract method 0x7f980edf.
//
// Solidity: function registerNode(uint256 initialStake) payable returns()
func (_Noderegistry *NoderegistryTransactor) RegisterNode(opts *bind.TransactOpts, initialStake *big.Int) (*types.Transaction, error) {
	return _Noderegistry.contract.Transact(opts, "registerNode", initialStake)
}

// RegisterNode is a paid mutator transaction binding the contract method 0x7f980edf.
//
// Solidity: function registerNode(uint256 initialStake) payable returns()
func (_Noderegistry *NoderegistrySession) RegisterNode(initialStake *big.Int) (*types.Transaction, error) {
	return _Noderegistry.Contract.RegisterNode(&_Noderegistry.TransactOpts, initialStake)
}

// RegisterNode is a paid mutator transaction binding the contract method 0x7f980edf.
//
// Solidity: function registerNode(uint256 initialStake) payable returns()
func (_Noderegistry *NoderegistryTransactorSession) RegisterNode(initialStake *big.Int) (*types.Transaction, error) {
	return _Noderegistry.Contract.RegisterNode(&_Noderegistry.TransactOpts, initialStake)
}

// RevokeCaller is a paid mutator transaction binding the contract method 0xb7743530.
//
// Solidity: function revokeCaller(address caller) returns()
func (_Noderegistry *NoderegistryTransactor) RevokeCaller(opts *bind.TransactOpts, caller common.Address) (*types.Transaction, error) {
	return _Noderegistry.contract.Transact(opts, "revokeCaller", caller)
}

// RevokeCaller is a paid mutator transaction binding the contract method 0xb7743530.
//
// Solidity: function revokeCaller(address caller) returns()
func (_Noderegistry *NoderegistrySession) RevokeCaller(caller common.Address) (*types.Transaction, error) {
	return _Noderegistry.Contract.RevokeCaller(&_Noderegistry.TransactOpts, caller)
}

// RevokeCaller is a paid mutator transaction binding the contract method 0xb7743530.
//
// Solidity: function revokeCaller(address caller) returns()
func (_Noderegistry *NoderegistryTransactorSession) RevokeCaller(caller common.Address) (*types.Transaction, error) {
	return _Noderegistry.Contract.RevokeCaller(&_Noderegistry.TransactOpts, caller)
}

// SlashStake is a paid mutator transaction binding the contract method 0x98d1c5a8.
//
// Solidity: function slashStake(address node, uint256 amount) returns(uint256)
func (_Noderegistry *NoderegistryTransactor) SlashStake(opts *bind.TransactOpts, node common.Address, amount *big.Int) (*types.Transaction, error) {
	return _Noderegistry.contract.Transact(opts, "slashStake", node, amount)
}

// SlashStake is a paid mutator transaction binding the contract method 0x98d1c5a8.
//
// Solidity: function slashStake(address node, uint256 amount) returns(uint256)
func (_Noderegistry *NoderegistrySession) SlashStake(node common.Address, amount *big.Int) (*types.Transaction, error) {
	return _Noderegistry.Contract.SlashStake(&_Noderegistry.TransactOpts, node, amount)
}

// SlashStake is a paid mutator transaction binding the contract method 0x98d1c5a8.
//
// Solidity: function slashStake(address node, uint256 amount) returns(uint256)
func (_Noderegistry *NoderegistryTransactorSession) SlashStake(node common.Address, amount *big.Int) (*types.Transaction, error) {
	return _Noderegistry.Contract.SlashStake(&_Noderegistry.TransactOpts, node, amount)
}

// UpdateHeartbeat is a paid mutator transaction binding the contract method 0x58bc14f3.
//
// Solidity: function updateHeartbeat(address node) returns()
func (_Noderegistry *NoderegistryTransactor) UpdateHeartbeat(opts *bind.TransactOpts, node common.Address) (*types.Transaction, error) {
	return _Noderegistry.contract.Transact(opts, "updateHeartbeat", node)
}

// UpdateHeartbeat is a paid mutator transaction binding the contract method 0x58bc14f3.
//
// Solidity: function updateHeartbeat(address node) returns()
func (_Noderegistry *NoderegistrySession) UpdateHeartbeat(node common.Address) (*types.Transaction, error) {
	return _Noderegistry.Contract.UpdateHeartbeat(&_Noderegistry.TransactOpts, node)
}

// UpdateHeartbeat is a paid mutator transaction binding the contract method 0x58bc14f3.
//
// Solidity: function updateHeartbeat(address node) returns()
func (_Noderegistry *NoderegistryTransactorSession) UpdateHeartbeat(node common.Address) (*types.Transaction, error) {
	return _Noderegistry.Contract.UpdateHeartbeat(&_Noderegistry.TransactOpts, node)
}

// UpdateMinStake is a paid mutator transaction binding the contract method 0x8cdb442f.
//
// Solidity: function updateMinStake(uint256 newMinStake) returns()
func (_Noderegistry *NoderegistryTransactor) UpdateMinStake(opts *bind.TransactOpts, newMinStake *big.Int) (*types.Transaction, error) {
	return _Noderegistry.contract.Transact(opts, "updateMinStake", newMinStake)
}

// UpdateMinStake is a paid mutator transaction binding the contract method 0x8cdb442f.
//
// Solidity: function updateMinStake(uint256 newMinStake) returns()
func (_Noderegistry *NoderegistrySession) UpdateMinStake(newMinStake *big.Int) (*types.Transaction, error) {
	return _Noderegistry.Contract.UpdateMinStake(&_Noderegistry.TransactOpts, newMinStake)
}

// UpdateMinStake is a paid mutator transaction binding the contract method 0x8cdb442f.
//
// Solidity: function updateMinStake(uint256 newMinStake) returns()
func (_Noderegistry *NoderegistryTransactorSession) UpdateMinStake(newMinStake *big.Int) (*types.Transaction, error) {
	return _Noderegistry.Contract.UpdateMinStake(&_Noderegistry.TransactOpts, newMinStake)
}

// UpdateNodeStatus is a paid mutator transaction binding the contract method 0x581f8b9b.
//
// Solidity: function updateNodeStatus(address node, uint8 newStatus) returns()
func (_Noderegistry *NoderegistryTransactor) UpdateNodeStatus(opts *bind.TransactOpts, node common.Address, newStatus uint8) (*types.Transaction, error) {
	return _Noderegistry.contract.Transact(opts, "updateNodeStatus", node, newStatus)
}

// UpdateNodeStatus is a paid mutator transaction binding the contract method 0x581f8b9b.
//
// Solidity: function updateNodeStatus(address node, uint8 newStatus) returns()
func (_Noderegistry *NoderegistrySession) UpdateNodeStatus(node common.Address, newStatus uint8) (*types.Transaction, error) {
	return _Noderegistry.Contract.UpdateNodeStatus(&_Noderegistry.TransactOpts, node, newStatus)
}

// UpdateNodeStatus is a paid mutator transaction binding the contract method 0x581f8b9b.
//
// Solidity: function updateNodeStatus(address node, uint8 newStatus) returns()
func (_Noderegistry *NoderegistryTransactorSession) UpdateNodeStatus(node common.Address, newStatus uint8) (*types.Transaction, error) {
	return _Noderegistry.Contract.UpdateNodeStatus(&_Noderegistry.TransactOpts, node, newStatus)
}

// UpdateReputation is a paid mutator transaction binding the contract method 0x6a08b511.
//
// Solidity: function updateReputation(address node, int256 delta) returns()
func (_Noderegistry *NoderegistryTransactor) UpdateReputation(opts *bind.TransactOpts, node common.Address, delta *big.Int) (*types.Transaction, error) {
	return _Noderegistry.contract.Transact(opts, "updateReputation", node, delta)
}

// UpdateReputation is a paid mutator transaction binding the contract method 0x6a08b511.
//
// Solidity: function updateReputation(address node, int256 delta) returns()
func (_Noderegistry *NoderegistrySession) UpdateReputation(node common.Address, delta *big.Int) (*types.Transaction, error) {
	return _Noderegistry.Contract.UpdateReputation(&_Noderegistry.TransactOpts, node, delta)
}

// UpdateReputation is a paid mutator transaction binding the contract method 0x6a08b511.
//
// Solidity: function updateReputation(address node, int256 delta) returns()
func (_Noderegistry *NoderegistryTransactorSession) UpdateReputation(node common.Address, delta *big.Int) (*types.Transaction, error) {
	return _Noderegistry.Contract.UpdateReputation(&_Noderegistry.TransactOpts, node, delta)
}

// UpdateStake is a paid mutator transaction binding the contract method 0x7c1f751f.
//
// Solidity: function updateStake(uint256 additionalStake) payable returns()
func (_Noderegistry *NoderegistryTransactor) UpdateStake(opts *bind.TransactOpts, additionalStake *big.Int) (*types.Transaction, error) {
	return _Noderegistry.contract.Transact(opts, "updateStake", additionalStake)
}

// UpdateStake is a paid mutator transaction binding the contract method 0x7c1f751f.
//
// Solidity: function updateStake(uint256 additionalStake) payable returns()
func (_Noderegistry *NoderegistrySession) UpdateStake(additionalStake *big.Int) (*types.Transaction, error) {
	return _Noderegistry.Contract.UpdateStake(&_Noderegistry.TransactOpts, additionalStake)
}

// UpdateStake is a paid mutator transaction binding the contract method 0x7c1f751f.
//
// Solidity: function updateStake(uint256 additionalStake) payable returns()
func (_Noderegistry *NoderegistryTransactorSession) UpdateStake(additionalStake *big.Int) (*types.Transaction, error) {
	return _Noderegistry.Contract.UpdateStake(&_Noderegistry.TransactOpts, additionalStake)
}

// WithdrawStake is a paid mutator transaction binding the contract method 0x25d5971f.
//
// Solidity: function withdrawStake(uint256 amount) returns()
func (_Noderegistry *NoderegistryTransactor) WithdrawStake(opts *bind.TransactOpts, amount *big.Int) (*types.Transaction, error) {
	return _Noderegistry.contract.Transact(opts, "withdrawStake", amount)
}

// WithdrawStake is a paid mutator transaction binding the contract method 0x25d5971f.
//
// Solidity: function withdrawStake(uint256 amount) returns()
func (_Noderegistry *NoderegistrySession) WithdrawStake(amount *big.Int) (*types.Transaction, error) {
	return _Noderegistry.Contract.WithdrawStake(&_Noderegistry.TransactOpts, amount)
}

// WithdrawStake is a paid mutator transaction binding the contract method 0x25d5971f.
//
// Solidity: function withdrawStake(uint256 amount) returns()
func (_Noderegistry *NoderegistryTransactorSession) WithdrawStake(amount *big.Int) (*types.Transaction, error) {
	return _Noderegistry.Contract.WithdrawStake(&_Noderegistry.TransactOpts, amount)
}

// NoderegistryMinStakeUpdatedIterator is returned from FilterMinStakeUpdated and is used to iterate over the raw logs and unpacked data for MinStakeUpdated events raised by the Noderegistry contract.
type NoderegistryMinStakeUpdatedIterator struct {
	Event *NoderegistryMinStakeUpdated // Event containing the contract specifics and raw log

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
func (it *NoderegistryMinStakeUpdatedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(NoderegistryMinStakeUpdated)
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
		it.Event = new(NoderegistryMinStakeUpdated)
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
func (it *NoderegistryMinStakeUpdatedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *NoderegistryMinStakeUpdatedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// NoderegistryMinStakeUpdated represents a MinStakeUpdated event raised by the Noderegistry contract.
type NoderegistryMinStakeUpdated struct {
	OldMinStake *big.Int
	NewMinStake *big.Int
	Raw         types.Log // Blockchain specific contextual infos
}

// FilterMinStakeUpdated is a free log retrieval operation binding the contract event 0x171aabb8815c02fd00303450a77058600e3661eb75ce2e77972c0f080bc7099d.
//
// Solidity: event MinStakeUpdated(uint256 oldMinStake, uint256 newMinStake)
func (_Noderegistry *NoderegistryFilterer) FilterMinStakeUpdated(opts *bind.FilterOpts) (*NoderegistryMinStakeUpdatedIterator, error) {

	logs, sub, err := _Noderegistry.contract.FilterLogs(opts, "MinStakeUpdated")
	if err != nil {
		return nil, err
	}
	return &NoderegistryMinStakeUpdatedIterator{contract: _Noderegistry.contract, event: "MinStakeUpdated", logs: logs, sub: sub}, nil
}

// WatchMinStakeUpdated is a free log subscription operation binding the contract event 0x171aabb8815c02fd00303450a77058600e3661eb75ce2e77972c0f080bc7099d.
//
// Solidity: event MinStakeUpdated(uint256 oldMinStake, uint256 newMinStake)
func (_Noderegistry *NoderegistryFilterer) WatchMinStakeUpdated(opts *bind.WatchOpts, sink chan<- *NoderegistryMinStakeUpdated) (event.Subscription, error) {

	logs, sub, err := _Noderegistry.contract.WatchLogs(opts, "MinStakeUpdated")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(NoderegistryMinStakeUpdated)
				if err := _Noderegistry.contract.UnpackLog(event, "MinStakeUpdated", log); err != nil {
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

// ParseMinStakeUpdated is a log parse operation binding the contract event 0x171aabb8815c02fd00303450a77058600e3661eb75ce2e77972c0f080bc7099d.
//
// Solidity: event MinStakeUpdated(uint256 oldMinStake, uint256 newMinStake)
func (_Noderegistry *NoderegistryFilterer) ParseMinStakeUpdated(log types.Log) (*NoderegistryMinStakeUpdated, error) {
	event := new(NoderegistryMinStakeUpdated)
	if err := _Noderegistry.contract.UnpackLog(event, "MinStakeUpdated", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// NoderegistryNodeRegisteredIterator is returned from FilterNodeRegistered and is used to iterate over the raw logs and unpacked data for NodeRegistered events raised by the Noderegistry contract.
type NoderegistryNodeRegisteredIterator struct {
	Event *NoderegistryNodeRegistered // Event containing the contract specifics and raw log

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
func (it *NoderegistryNodeRegisteredIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(NoderegistryNodeRegistered)
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
		it.Event = new(NoderegistryNodeRegistered)
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
func (it *NoderegistryNodeRegisteredIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *NoderegistryNodeRegisteredIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// NoderegistryNodeRegistered represents a NodeRegistered event raised by the Noderegistry contract.
type NoderegistryNodeRegistered struct {
	Node        common.Address
	StakeAmount *big.Int
	Raw         types.Log // Blockchain specific contextual infos
}

// FilterNodeRegistered is a free log retrieval operation binding the contract event 0xf773bca07d020a1bc1fdd45ea3db573da547dd27180143afaf075c158a847594.
//
// Solidity: event NodeRegistered(address indexed node, uint256 stakeAmount)
func (_Noderegistry *NoderegistryFilterer) FilterNodeRegistered(opts *bind.FilterOpts, node []common.Address) (*NoderegistryNodeRegisteredIterator, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _Noderegistry.contract.FilterLogs(opts, "NodeRegistered", nodeRule)
	if err != nil {
		return nil, err
	}
	return &NoderegistryNodeRegisteredIterator{contract: _Noderegistry.contract, event: "NodeRegistered", logs: logs, sub: sub}, nil
}

// WatchNodeRegistered is a free log subscription operation binding the contract event 0xf773bca07d020a1bc1fdd45ea3db573da547dd27180143afaf075c158a847594.
//
// Solidity: event NodeRegistered(address indexed node, uint256 stakeAmount)
func (_Noderegistry *NoderegistryFilterer) WatchNodeRegistered(opts *bind.WatchOpts, sink chan<- *NoderegistryNodeRegistered, node []common.Address) (event.Subscription, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _Noderegistry.contract.WatchLogs(opts, "NodeRegistered", nodeRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(NoderegistryNodeRegistered)
				if err := _Noderegistry.contract.UnpackLog(event, "NodeRegistered", log); err != nil {
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

// ParseNodeRegistered is a log parse operation binding the contract event 0xf773bca07d020a1bc1fdd45ea3db573da547dd27180143afaf075c158a847594.
//
// Solidity: event NodeRegistered(address indexed node, uint256 stakeAmount)
func (_Noderegistry *NoderegistryFilterer) ParseNodeRegistered(log types.Log) (*NoderegistryNodeRegistered, error) {
	event := new(NoderegistryNodeRegistered)
	if err := _Noderegistry.contract.UnpackLog(event, "NodeRegistered", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// NoderegistryNodeStatusChangedIterator is returned from FilterNodeStatusChanged and is used to iterate over the raw logs and unpacked data for NodeStatusChanged events raised by the Noderegistry contract.
type NoderegistryNodeStatusChangedIterator struct {
	Event *NoderegistryNodeStatusChanged // Event containing the contract specifics and raw log

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
func (it *NoderegistryNodeStatusChangedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(NoderegistryNodeStatusChanged)
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
		it.Event = new(NoderegistryNodeStatusChanged)
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
func (it *NoderegistryNodeStatusChangedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *NoderegistryNodeStatusChangedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// NoderegistryNodeStatusChanged represents a NodeStatusChanged event raised by the Noderegistry contract.
type NoderegistryNodeStatusChanged struct {
	Node      common.Address
	OldStatus uint8
	NewStatus uint8
	Raw       types.Log // Blockchain specific contextual infos
}

// FilterNodeStatusChanged is a free log retrieval operation binding the contract event 0xfb5740b379943f137d27260c0f7bd5f908f4d60a4507fd1c4824d264a00f0a72.
//
// Solidity: event NodeStatusChanged(address indexed node, uint8 oldStatus, uint8 newStatus)
func (_Noderegistry *NoderegistryFilterer) FilterNodeStatusChanged(opts *bind.FilterOpts, node []common.Address) (*NoderegistryNodeStatusChangedIterator, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _Noderegistry.contract.FilterLogs(opts, "NodeStatusChanged", nodeRule)
	if err != nil {
		return nil, err
	}
	return &NoderegistryNodeStatusChangedIterator{contract: _Noderegistry.contract, event: "NodeStatusChanged", logs: logs, sub: sub}, nil
}

// WatchNodeStatusChanged is a free log subscription operation binding the contract event 0xfb5740b379943f137d27260c0f7bd5f908f4d60a4507fd1c4824d264a00f0a72.
//
// Solidity: event NodeStatusChanged(address indexed node, uint8 oldStatus, uint8 newStatus)
func (_Noderegistry *NoderegistryFilterer) WatchNodeStatusChanged(opts *bind.WatchOpts, sink chan<- *NoderegistryNodeStatusChanged, node []common.Address) (event.Subscription, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _Noderegistry.contract.WatchLogs(opts, "NodeStatusChanged", nodeRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(NoderegistryNodeStatusChanged)
				if err := _Noderegistry.contract.UnpackLog(event, "NodeStatusChanged", log); err != nil {
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

// ParseNodeStatusChanged is a log parse operation binding the contract event 0xfb5740b379943f137d27260c0f7bd5f908f4d60a4507fd1c4824d264a00f0a72.
//
// Solidity: event NodeStatusChanged(address indexed node, uint8 oldStatus, uint8 newStatus)
func (_Noderegistry *NoderegistryFilterer) ParseNodeStatusChanged(log types.Log) (*NoderegistryNodeStatusChanged, error) {
	event := new(NoderegistryNodeStatusChanged)
	if err := _Noderegistry.contract.UnpackLog(event, "NodeStatusChanged", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// NoderegistryStakeUpdatedIterator is returned from FilterStakeUpdated and is used to iterate over the raw logs and unpacked data for StakeUpdated events raised by the Noderegistry contract.
type NoderegistryStakeUpdatedIterator struct {
	Event *NoderegistryStakeUpdated // Event containing the contract specifics and raw log

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
func (it *NoderegistryStakeUpdatedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(NoderegistryStakeUpdated)
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
		it.Event = new(NoderegistryStakeUpdated)
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
func (it *NoderegistryStakeUpdatedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *NoderegistryStakeUpdatedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// NoderegistryStakeUpdated represents a StakeUpdated event raised by the Noderegistry contract.
type NoderegistryStakeUpdated struct {
	Node           common.Address
	NewStakeAmount *big.Int
	Raw            types.Log // Blockchain specific contextual infos
}

// FilterStakeUpdated is a free log retrieval operation binding the contract event 0xab0e25dc39626189cfb41155020ba89e726b10244275733e9d7c63cf33ffccdb.
//
// Solidity: event StakeUpdated(address indexed node, uint256 newStakeAmount)
func (_Noderegistry *NoderegistryFilterer) FilterStakeUpdated(opts *bind.FilterOpts, node []common.Address) (*NoderegistryStakeUpdatedIterator, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _Noderegistry.contract.FilterLogs(opts, "StakeUpdated", nodeRule)
	if err != nil {
		return nil, err
	}
	return &NoderegistryStakeUpdatedIterator{contract: _Noderegistry.contract, event: "StakeUpdated", logs: logs, sub: sub}, nil
}

// WatchStakeUpdated is a free log subscription operation binding the contract event 0xab0e25dc39626189cfb41155020ba89e726b10244275733e9d7c63cf33ffccdb.
//
// Solidity: event StakeUpdated(address indexed node, uint256 newStakeAmount)
func (_Noderegistry *NoderegistryFilterer) WatchStakeUpdated(opts *bind.WatchOpts, sink chan<- *NoderegistryStakeUpdated, node []common.Address) (event.Subscription, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _Noderegistry.contract.WatchLogs(opts, "StakeUpdated", nodeRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(NoderegistryStakeUpdated)
				if err := _Noderegistry.contract.UnpackLog(event, "StakeUpdated", log); err != nil {
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

// ParseStakeUpdated is a log parse operation binding the contract event 0xab0e25dc39626189cfb41155020ba89e726b10244275733e9d7c63cf33ffccdb.
//
// Solidity: event StakeUpdated(address indexed node, uint256 newStakeAmount)
func (_Noderegistry *NoderegistryFilterer) ParseStakeUpdated(log types.Log) (*NoderegistryStakeUpdated, error) {
	event := new(NoderegistryStakeUpdated)
	if err := _Noderegistry.contract.UnpackLog(event, "StakeUpdated", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
