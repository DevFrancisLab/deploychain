// services/blockchain.go
package services

import (
	"context"
	"fmt"
	"os"
	"strconv"

	"deploychain/models"

	multibaas "github.com/curvegrid/multibaas-sdk-go"
)

// BlockchainService handles MultiBaas interactions
type BlockchainService struct {
	client *multibaas.APIClient
	ctx    context.Context
}

// NewBlockchainService initializes a new MultiBaas client
func NewBlockchainService() *BlockchainService {
	conf := multibaas.NewConfiguration()
	client := multibaas.NewAPIClient(conf)

	// Configure the SDK using environment variables
	ctx := context.Background()
	ctx = context.WithValue(ctx, multibaas.ContextServerVariables, map[string]string{
		"base_url": os.Getenv("MB_BASE_URL"),
	})
	ctx = context.WithValue(ctx, multibaas.ContextAccessToken, os.Getenv("MB_API_KEY"))

	return &BlockchainService{
		client: client,
		ctx:    ctx,
	}
}

// TestConnection checks the MultiBaas API connection
func (bs *BlockchainService) TestConnection() error {
	// Using a common chain name like "ethereum" to test connection
	// You might want to make this configurable
	_, _, err := bs.client.ChainsAPI.GetChainStatus(bs.ctx, "ethereum").Execute()
	return err
}

// GetChainStatus gets the status of a specific blockchain
func (bs *BlockchainService) GetChainStatus(chain multibaas.ChainName) (*multibaas.GetChainStatus200Response, error) {
	resp, _, err := bs.client.ChainsAPI.GetChainStatus(bs.ctx, chain).Execute()
	if err != nil {
		return nil, err
	}
	return resp, nil
}

// DeployContract deploys a single contract to the specified network
func (bs *BlockchainService) DeployContract(chain multibaas.ChainName, contractAddr string, contractLabel string, request multibaas.PostMethodArgs) (*multibaas.CallContractFunction200Response, error) {
	resp, _, err := bs.client.ContractsAPI.CallContractFunction(bs.ctx, chain, contractAddr, contractLabel, "deploy").PostMethodArgs(request).Execute()
	if err != nil {
		return nil, err
	}
	return resp, nil
}

// CallContractFunction calls a function on a deployed contract
func (bs *BlockchainService) CallContractFunction(chain multibaas.ChainName, contractAddr string, contractLabel string, method string, args []interface{}) (*multibaas.CallContractFunction200Response, error) {
	contractOverride := true
	payload := multibaas.PostMethodArgs{
		Args:             args,
		ContractOverride: &contractOverride,
	}

	resp, _, err := bs.client.ContractsAPI.CallContractFunction(bs.ctx, chain, contractAddr, contractLabel, method).PostMethodArgs(payload).Execute()
	if err != nil {
		return nil, err
	}
	return resp, nil
}

// DeployContracts deploys compiled contracts to the specified network
// This uses the available CallContractFunction API since direct deployment methods aren't available
func (bs *BlockchainService) DeployContracts(contracts map[string]*models.CompiledContract, chain multibaas.ChainName) (models.ContractAddressMap, []string, int64, error) {
	addresses := make(models.ContractAddressMap)
	var txHashes []string
	var totalGasUsed int64

	for contractLabel, contract := range contracts {
		// Prepare constructor arguments for deployment
		contractOverride := true
		deployArgs := multibaas.PostMethodArgs{
			Args:             []interface{}{}, // Constructor arguments - empty for now, can be customized
			ContractOverride: &contractOverride,
		}

		// Since direct deployment API isn't available, we'll need to use CallContractFunction
		// with a deployment-specific approach. This might require the contract to be pre-uploaded
		// to MultiBaas via the web interface or another method.
		resp, _, err := bs.client.ContractsAPI.CallContractFunction(
			bs.ctx,
			chain,
			contract.Name, // Empty contract address for deployment
			contractLabel, // Contract label that should exist in MultiBaas library
			"constructor", // Constructor method
		).PostMethodArgs(deployArgs).Execute()

		if err != nil {
			// If deployment fails, it might be because the contract needs to be uploaded first
			return nil, nil, 0, fmt.Errorf("deployment failed for contract %s: %w. Contract may need to be uploaded to MultiBaas library first", contractLabel, err)
		}

		// Extract deployment results from response
		if result := resp.Result; result != (multibaas.CallContractFunction200ResponseAllOfResult{}) {
			// Try to extract transaction information
			if result.TransactionToSignResponse != nil {
				tx := resp.Result.TransactionToSignResponse.Tx

				// Get contract address (might be in ContractAddress field)
				if tx.From != "" {
					addresses[contractLabel] = tx.From
				}

				// Get transaction hash
				if tx.Hash != nil && *tx.Hash != "" {
					txHashes = append(txHashes, *tx.Hash)
				}

				// Get gas used
				if tx.GasPrice != nil {
					gasPrice, err := strconv.Atoi(*tx.GasPrice)
					if err != nil {
						fmt.Println(err)
					} else {
						totalGasUsed += int64(gasPrice)
					}
				}
			}
		}

		// If we couldn't extract the contract address from transaction,
		// we might need to query it separately or handle it differently
		if _, exists := addresses[contractLabel]; !exists {
			fmt.Printf("Warning: Could not extract contract address for %s\n", contractLabel)
		}
	}

	return addresses, txHashes, totalGasUsed, nil
}

// HandleMultiBaasError provides better error handling for MultiBaas errors
func (bs *BlockchainService) HandleMultiBaasError(err error) error {
	if mbErr, ok := multibaas.IsMultiBaasErr(err); ok {
		return fmt.Errorf("MultiBaas error (status %d): %s", mbErr.Status, mbErr.Message)
	}
	return err
}

// // services/blockchain.go
// package services

// import (
// 	"context"
// 	"fmt"
// 	"os"

// 	"deploychain/models"

// 	multibaas "github.com/curvegrid/multibaas-sdk-go"
// )

// // BlockchainService handles MultiBaas interactions
// type BlockchainService struct {
// 	client *multibaas.APIClient
// 	ctx    context.Context
// }

// // NewBlockchainService initializes a new MultiBaas client
// func NewBlockchainService() *BlockchainService {
// 	conf := multibaas.NewConfiguration()
// 	client := multibaas.NewAPIClient(conf)

// 	// Configure the SDK using environment variables
// 	ctx := context.Background()
// 	ctx = context.WithValue(ctx, multibaas.ContextServerVariables, map[string]string{
// 		"base_url": os.Getenv("MB_BASE_URL"),
// 	})
// 	ctx = context.WithValue(ctx, multibaas.ContextAccessToken, os.Getenv("MB_API_KEY"))

// 	return &BlockchainService{
// 		client: client,
// 		ctx:    ctx,
// 	}
// }

// // TestConnection checks the MultiBaas API connection
// func (bs *BlockchainService) TestConnection() error {
// 	// Using a common chain name like "ethereum" to test connection
// 	// You might want to make this configurable
// 	_, _, err := bs.client.ChainsAPI.GetChainStatus(bs.ctx, "ethereum").Execute()
// 	return err
// }

// // GetChainStatus gets the status of a specific blockchain
// func (bs *BlockchainService) GetChainStatus(chain multibaas.ChainName) (*multibaas.GetChainStatus200Response, error) {
// 	resp, _, err := bs.client.ChainsAPI.GetChainStatus(bs.ctx, chain).Execute()
// 	if err != nil {
// 		return nil, err
// 	}
// 	return resp, nil
// }

// // DeployContract deploys a single contract to the specified network
// func (bs *BlockchainService) DeployContract(chain multibaas.ChainName, contractAddr string, contractLabel string, request multibaas.PostMethodArgs) (*multibaas.CallContractFunction200Response, error) {
// 	resp, _, err := bs.client.ContractsAPI.CallContractFunction(bs.ctx, chain, contractAddr, contractLabel, "deploy").PostMethodArgs(request).Execute()
// 	if err != nil {
// 		return nil, err
// 	}
// 	return resp, nil
// }

// // CallContractFunction calls a function on a deployed contract
// func (bs *BlockchainService) CallContractFunction(chain multibaas.ChainName, contractAddr string, contractLabel string, method string, args []interface{}) (*multibaas.CallContractFunction200Response, error) {
// 	contractOverride := true
// 	payload := multibaas.PostMethodArgs{
// 		Args:             args,
// 		ContractOverride: &contractOverride,
// 	}

// 	resp, _, err := bs.client.ContractsAPI.CallContractFunction(bs.ctx, chain, contractAddr, contractLabel, method).PostMethodArgs(payload).Execute()
// 	if err != nil {
// 		return nil, err
// 	}
// 	return resp, nil
// }

// // UploadContract uploads a contract to MultiBaas library
// func (bs *BlockchainService) UploadContract(contractLabel string, contract *models.CompiledContract) error {
// 	uploadRequest := multibaas.ContractUploadRequest{
// 		Label:       contractLabel,
// 		Abi:         contract.ABI,
// 		Bytecode:    contract.Bytecode,
// 		Source:      &contract.Source,
// 		CompilerVersion: &contract.CompilerVersion,
// 	}

// 	_, _, err := bs.client.ContractsAPI.UploadContract(bs.ctx).ContractUploadRequest(uploadRequest).Execute()
// 	return err
// }

// // DeployContracts deploys compiled contracts to the specified network
// func (bs *BlockchainService) DeployContracts(contracts map[string]*models.CompiledContract, chain multibaas.ChainName) (models.ContractAddressMap, []string, int64, error) {
// 	addresses := make(models.ContractAddressMap)
// 	var txHashes []string
// 	var totalGasUsed int64

// 	for contractLabel, contract := range contracts {
// 		// First, upload the contract to MultiBaas library if needed
// 		err := bs.UploadContract(contractLabel, contract)
// 		if err != nil {
// 			// Contract might already exist, continue with deployment
// 			fmt.Printf("Warning: Contract upload failed for %s: %v\n", contractLabel, err)
// 		}

// 		// Prepare deployment arguments (constructor arguments)
// 		deployRequest := multibaas.ApiCreateContractRequest{}
// 		// deployRequest := multibaas.DeployContractRequest{
// 		// 	Label: contractLabel,
// 		// 	Args:  []interface{}{}, // Empty constructor args, adjust as needed
// 		// }

// 		// Deploy the contract
// 		deployResp, _, err := bs.client.ContractsAPI.DeployContract(bs.ctx, contract.Name).DeployContractRequest(deployRequest).Execute()
// 		if err != nil {
// 			return nil, nil, 0, err
// 		}

// 		// Extract deployment results from response
// 		if deployResp.Result != nil {
// 			result := deployResp.Result

// 			// Get contract address
// 			if result.ContractAddress != nil {
// 				addresses[contractLabel] = *result.ContractAddress
// 			}

// 			// Get transaction hash
// 			if result.TxHash != nil {
// 				txHashes = append(txHashes, *result.TxHash)
// 			}

// 			// Get gas used
// 			if result.GasUsed != nil {
// 				totalGasUsed += int64(*result.GasUsed)
// 			}
// 		}
// 	}

// 	return addresses, txHashes, totalGasUsed, nil
// }

// // HandleMultiBaasError provides better error handling for MultiBaas errors
// func (bs *BlockchainService) HandleMultiBaasError(err error) error {
// 	if mbErr, ok := multibaas.IsMultiBaasErr(err); ok {
// 		return fmt.Errorf("MultiBaas error (status %d): %s", mbErr.Status, mbErr.Message)
// 	}
// 	return err
// }

// // services/blockchain.go
// package services

// import (
// 	"context"
// 	"fmt"
// 	"os"

// 	"deploychain/models"

// 	multibaas "github.com/curvegrid/multibaas-sdk-go"
// )

// // BlockchainService handles MultiBaas interactions
// type BlockchainService struct {
// 	client *multibaas.APIClient
// 	ctx    context.Context
// }

// // NewBlockchainService initializes a new MultiBaas client
// func NewBlockchainService() *BlockchainService {
// 	conf := multibaas.NewConfiguration()
// 	client := multibaas.NewAPIClient(conf)

// 	// Configure the SDK using environment variables
// 	ctx := context.Background()
// 	ctx = context.WithValue(ctx, multibaas.ContextServerVariables, map[string]string{
// 		"base_url": os.Getenv("MB_BASE_URL"),
// 	})
// 	ctx = context.WithValue(ctx, multibaas.ContextAccessToken, os.Getenv("MB_API_KEY"))

// 	return &BlockchainService{
// 		client: client,
// 		ctx:    ctx,
// 	}
// }

// // TestConnection checks the MultiBaas API connection
// func (bs *BlockchainService) TestConnection() error {
// 	// Using a common chain name like "ethereum" to test connection
// 	// You might want to make this configurable
// 	_, _, err := bs.client.ChainsAPI.GetChainStatus(bs.ctx, "ethereum").Execute()
// 	return err
// }

// // GetChainStatus gets the status of a specific blockchain
// func (bs *BlockchainService) GetChainStatus(chain multibaas.ChainName) (*multibaas.GetChainStatus200Response, error) {
// 	resp, _, err := bs.client.ChainsAPI.GetChainStatus(bs.ctx, chain).Execute()
// 	if err != nil {
// 		return nil, err
// 	}
// 	return resp, nil
// }

// // DeployContract deploys a single contract to the specified network
// func (bs *BlockchainService) DeployContract(chain multibaas.ChainName, contractAddr string, contractLabel string, request multibaas.PostMethodArgs) (*multibaas.CallContractFunction200Response, error) {
// 	// Note: The actual contract deployment might require different API calls
// 	// This is using the contract function call as shown in the example
// 	// You may need to use a different API endpoint for actual deployment
// 	resp, _, err := bs.client.ContractsAPI.CallContractFunction(bs.ctx, chain, contractAddr, contractLabel, "deploy").PostMethodArgs(request).Execute()
// 	if err != nil {
// 		return nil, err
// 	}
// 	return resp, nil
// }

// // CallContractFunction calls a function on a deployed contract
// func (bs *BlockchainService) CallContractFunction(chain multibaas.ChainName, contractAddr string, contractLabel string, method string, args []interface{}) (*multibaas.CallContractFunction200Response, error) {
// 	contractOverride := true
// 	payload := multibaas.PostMethodArgs{
// 		Args:             args,
// 		ContractOverride: &contractOverride,
// 	}

// 	resp, _, err := bs.client.ContractsAPI.CallContractFunction(bs.ctx, chain, contractAddr, contractLabel, method).PostMethodArgs(payload).Execute()
// 	if err != nil {
// 		return nil, err
// 	}
// 	return resp, nil
// }

// // DeployContracts deploys compiled contracts to the specified network
// // Note: This method may need to be adapted based on the actual MultiBaas deployment API
// func (bs *BlockchainService) DeployContracts(contracts map[string]*models.CompiledContract, network multibaas.ChainName) (models.ContractAddressMap, []string, int64, error) {
// 	addresses := make(models.ContractAddressMap)
// 	var txHashes []string
// 	var totalGasUsed int64

// 	// Note: The actual deployment process might be different
// 	// This is a placeholder implementation that needs to be adapted
// 	// based on the actual MultiBaas contract deployment API

// 	for name, contract := range contracts {
// 		// You'll need to check the MultiBaas documentation for the correct
// 		// contract deployment API endpoint and payload structure

// 		// This is a placeholder - the actual deployment might involve:
// 		// 1. Uploading the contract bytecode and ABI
// 		// 2. Calling a deployment endpoint
// 		// 3. Getting the transaction hash and contract address from the response

// 		contractOverride := true
// 		payload := multibaas.PostMethodArgs{
// 			Args: []interface{}{
// 				contract.Bytecode,
// 				contract.ABI,
// 			},
// 			ContractOverride: &contractOverride,
// 		}

// 		// This is a placeholder call - you'll need to replace with actual deployment API
// 		resp, _, err := bs.client.ContractsAPI.CallContractFunction(bs.ctx, network, "deployment", name, "deploy").PostMethodArgs(payload).Execute()
// 		if err != nil {
// 			return nil, nil, 0, err
// 		}

// 		// Extract deployment results from response
// 		// These fields might be different based on actual API response
// 		if resp.Result != nil && resp.Result.MethodCallResponse != nil {
// 			// You'll need to adapt this based on the actual response structure
// 			addresses[name] = "placeholder_address"            // Extract from resp
// 			txHashes = append(txHashes, "placeholder_tx_hash") // Extract from resp
// 			totalGasUsed += 21000                              // Extract from resp
// 		}
// 	}

// 	return addresses, txHashes, totalGasUsed, nil
// }

// // HandleMultiBaasError provides better error handling for MultiBaas errors
// func (bs *BlockchainService) HandleMultiBaasError(err error) error {
// 	if mbErr, ok := multibaas.IsMultiBaasErr(err); ok {
// 		// You can add custom error handling logic here
// 		return fmt.Errorf("MultiBaas error (status %d): %s", mbErr.Status, mbErr.Message)
// 	}
// 	return err
// }

// // services/blockchain.go
// package services

// import (
//     "os"

//     "deploychain/models"

//     multibaas "github.com/curvegrid/multibaas-sdk-go"
// )

// // BlockchainService handles MultiBaas interactions
// type BlockchainService struct {
//     client *multibaas.APIClient
// }

// // NewBlockchainService initializes a new MultiBaas client
// func NewBlockchainService() *BlockchainService {
//     client := multibaas.NewAPIClient(&multibaas.Config{
//         BaseURL: os.Getenv("MB_BASE_URL"),
//         APIKey:  os.Getenv("MB_API_KEY"),
//     })
//     return &BlockchainService{client: client}
// }

// // TestConnection checks the MultiBaas API connection
// func (bs *BlockchainService) TestConnection() error {
//     _, err := bs.client.GetChains()
//     return err
// }

// // DeployContracts deploys compiled contracts to the specified network
// func (bs *BlockchainService) DeployContracts(contracts map[string]*models.CompiledContract, network string) (models.ContractAddressMap, []string, int64, error) {
//     addresses := make(models.ContractAddressMap)
//     var txHashes []string
//     var totalGasUsed int64

//     for name, contract := range contracts {
//         deployment, err := bs.client.DeployContract(network, multibaas.DeployContractRequest{
//             ContractName:    name,
//             Bytecode:        contract.Bytecode,
//             ABI:             contract.ABI,
//             ConstructorArgs: []interface{}{},
//         })
//         if err != nil {
//             return nil, nil, 0, err
//         }

//         addresses[name] = deployment.Address
//         txHashes = append(txHashes, deployment.TransactionHash)
//         totalGasUsed += deployment.GasUsed
//     }

//     return addresses, txHashes, totalGasUsed, nil
// }
