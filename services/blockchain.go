// services/blockchain.go
package services

import (
    "os"

    "deploychain/models"

    multibaas "github.com/curvegrid/multibaas-sdk-go"
)

// BlockchainService handles MultiBaas interactions
type BlockchainService struct {
    client *multibaas.APIClient
}

// NewBlockchainService initializes a new MultiBaas client
func NewBlockchainService() *BlockchainService {
    client := multibaas.NewAPIClient(&multibaas.Config{
        BaseURL: os.Getenv("MB_BASE_URL"),
        APIKey:  os.Getenv("MB_API_KEY"),
    })
    return &BlockchainService{client: client}
}

// TestConnection checks the MultiBaas API connection
func (bs *BlockchainService) TestConnection() error {
    _, err := bs.client.GetChains()
    return err
}

// DeployContracts deploys compiled contracts to the specified network
func (bs *BlockchainService) DeployContracts(contracts map[string]*models.CompiledContract, network string) (models.ContractAddressMap, []string, int64, error) {
    addresses := make(models.ContractAddressMap)
    var txHashes []string
    var totalGasUsed int64

    for name, contract := range contracts {
        deployment, err := bs.client.DeployContract(network, multibaas.DeployContractRequest{
            ContractName:    name,
            Bytecode:        contract.Bytecode,
            ABI:             contract.ABI,
            ConstructorArgs: []interface{}{},
        })
        if err != nil {
            return nil, nil, 0, err
        }

        addresses[name] = deployment.Address
        txHashes = append(txHashes, deployment.TransactionHash)
        totalGasUsed += deployment.GasUsed
    }

    return addresses, txHashes, totalGasUsed, nil
}