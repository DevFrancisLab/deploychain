// services/dagger.go
package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"deploychain/models"

	"dagger.io/dagger"
)

// DaggerService handles build and deployment pipelines
type DaggerService struct {
	client *dagger.Client
}

// NewDaggerService initializes a new Dagger client
func NewDaggerService() *DaggerService {
	client, err := dagger.Connect(context.Background(), dagger.WithLogOutput(os.Stdout))
	if err != nil {
		log.Fatalf("Failed to initialize Dagger client: %v", err)
	}
	return &DaggerService{client: client}
}

// RunPipeline executes the build and deployment pipeline
func (ds *DaggerService) RunPipeline(repoURL, branch string, deploymentID int) (models.BuildResult, error) {
	ctx := context.Background()
	result := models.BuildResult{
		DeploymentType: models.TypeDApp,
	}

	// Clone repository
	repo := ds.client.Git(repoURL).Branch(branch).Tree()

	// Detect project type
	isWeb3, err := ds.detectWeb3Project(ctx, repo)
	if err != nil {
		return result, fmt.Errorf("failed to detect project type: %v", err)
	}
	if !isWeb3 {
		return result, fmt.Errorf("not a Web3 project")
	}

	// Build smart contracts
	contracts, err := ds.compileContracts(ctx, repo)
	if err != nil {
		return result, fmt.Errorf("contract compilation failed: %v", err)
	}
	result.CompiledContracts = contracts

	// // Build frontend
	// frontendURL, err := ds.buildFrontend(ctx, repo)
	// if err != nil {
	// 	return result, fmt.Errorf("frontend build failed: %v", err)
	// }
	// result.FrontendURL = frontendURL

	// Log build steps
	result.BuildLogs = append(result.BuildLogs,
		"Cloned repository",
		"Detected Web3 project",
		"Compiled smart contracts",
		"Built frontend dApp",
	)

	return result, nil
}

// detectWeb3Project checks if the repository contains a Web3 project
func (ds *DaggerService) detectWeb3Project(ctx context.Context, repo *dagger.Directory) (bool, error) {
	hasContracts, err := repo.Directory("contracts").Entries(ctx)
	if err != nil {
		return false, err
	}

	// Check if hardhat config exists
	_, err = repo.File("hardhat.config.js").Contents(ctx)
	if err != nil {
		// File doesn't exist or can't be read, only check contracts
		return len(hasContracts) > 0, nil
	}

	// Either has contracts or hardhat config
	return true, nil
}

// compileContracts compiles Solidity contracts
// func (ds *DaggerService) compileContracts(ctx context.Context, repo *dagger.Directory) (map[string]*models.CompiledContract, error) {
// 	contracts := make(map[string]*models.CompiledContract)

// 	// Use Hardhat container to compile contracts
// 	container := ds.client.Container().
// 		From("node:18-alpine").
// 		WithMountedDirectory("/app", repo).
// 		WithWorkdir("/app").
// 		WithExec([]string{"npm", "install"}).
// 		WithExec([]string{"npx", "hardhat", "compile"})

// 	output := container.Directory("/artifacts")

// 	// Process compiled contracts
// 	entries, err := output.Entries(ctx)
// 	if err != nil {
// 		return nil, err
// 	}

// 	for _, entry := range entries {
// 		if strings.HasSuffix(entry, ".json") {
// 			contractName := strings.TrimSuffix(entry, ".json")
// 			artifact, err := output.File(entry).Contents(ctx)
// 			if err != nil {
// 				return nil, err
// 			}

// 			var compiled struct {
// 				Bytecode string `json:"bytecode"`
// 				ABI      string `json:"abi"`
// 			}
// 			if err := json.Unmarshal([]byte(artifact), &compiled); err != nil {
// 				return nil, err
// 			}

// 			contracts[contractName] = &models.CompiledContract{
// 				Name:            contractName,
// 				Bytecode:        compiled.Bytecode,
// 				ABI:             compiled.ABI,
// 				CompilerVersion: "0.8.20", // Example version
// 			}
// 		}
// 	}

// 	return contracts, nil
// }

// compileContracts compiles Solidity contracts and exports to filesystem
func (ds *DaggerService) compileContracts(ctx context.Context, repo *dagger.Directory) (map[string]*models.CompiledContract, error) {
	contracts := make(map[string]*models.CompiledContract)

	// Use Hardhat container to compile contracts
	container := ds.client.Container().
		From("node:18-alpine").
		WithMountedDirectory("/app", repo).
		WithWorkdir("/app").
		WithExec([]string{"npm", "install"}).
		WithExec([]string{"npx", "hardhat", "compile"})

	// Get the artifacts directory from the container
	artifactsDir := container.Directory("/app/artifacts")

	// Export the artifacts to local filesystem
	localArtifactsPath := "./build/artifacts" // Local path where you want to save
	_, err := artifactsDir.Export(ctx, localArtifactsPath)
	if err != nil {
		return nil, fmt.Errorf("failed to export artifacts to filesystem: %w", err)
	}

	entries, err := artifactsDir.Entries(ctx)
	if err != nil {
		return nil, err
	}

	fmt.Printf("Artifacts exported to: %s\n", localArtifactsPath)

	// // Process compiled contracts from the exported directory
	// entries, err := artifactsDir.Entries(ctx)
	// if err != nil {
	// 	return nil, err
	// }

	// for _, entry := range entries {
	// 	// Skip directories, look for contract directories
	// 	if !strings.Contains(entry, ".sol") {
	// 		continue
	// 	}

	// 	// Navigate to contract directory (Hardhat structure: artifacts/contracts/ContractName.sol/)
	// 	contractDir := artifactsDir.Directory(entry)
	// 	contractEntries, err := contractDir.Entries(ctx)
	// 	if err != nil {
	// 		continue
	// 	}

	// 	for _, contractFile := range contractEntries {
	// 		if strings.HasSuffix(contractFile, ".json") && !strings.HasSuffix(contractFile, ".dbg.json") {
	// 			contractName := strings.TrimSuffix(contractFile, ".json")

	// 			// Read the JSON artifact
	// 			artifact, err := contractDir.File(contractFile).Contents(ctx)
	// 			if err != nil {
	// 				continue
	// 			}

	// 			var compiled struct {
	// 				Bytecode string      `json:"bytecode"`
	// 				ABI      interface{} `json:"abi"`
	// 			}
	// 			if err := json.Unmarshal([]byte(artifact), &compiled); err != nil {
	// 				continue
	// 			}

	// 			// Convert ABI to string
	// 			abiBytes, err := json.Marshal(compiled.ABI)
	// 			if err != nil {
	// 				continue
	// 			}

	// 			contracts[contractName] = &models.CompiledContract{
	// 				Name:            contractName,
	// 				Bytecode:        compiled.Bytecode,
	// 				ABI:             string(abiBytes),
	// 				CompilerVersion: "0.8.20", // You might want to extract this from the artifact
	// 			}

	// 			fmt.Printf("Processed contract: %s\n", contractName)
	// 		}
	// 	}
	// }

	// return contracts, nil

	// Process compiled contracts - Hardhat structure: artifacts/contracts/
	if len(entries) == 0 {
		return nil, fmt.Errorf("no entries found in artifacts directory")
	}

	// Look for the contracts subdirectory
	var contractsDir *dagger.Directory
	for _, entry := range entries {
		fmt.Printf("Checking entry: '%s'\n", entry)
		if strings.TrimSuffix(entry, "/") == "contracts" {
			contractsDir = artifactsDir.Directory("contracts")
			fmt.Printf("Found contracts directory!\n")
			break
		}
	}

	if contractsDir == nil {
		return nil, fmt.Errorf("contracts directory not found in artifacts")
	}

	// Get contract source directories (e.g., MyContract.sol/)
	contractDirs, err := contractsDir.Entries(ctx)
	if err != nil {
		return nil, err
	}

	fmt.Printf("Contract directories found: %v\n", contractDirs)

	for _, contractDirName := range contractDirs {
		if !strings.HasSuffix(contractDirName, ".sol") {
			continue
		}

		// Navigate to specific contract directory (e.g., contracts/MyContract.sol/)
		specificContractDir := contractsDir.Directory(contractDirName)
		contractFiles, err := specificContractDir.Entries(ctx)
		if err != nil {
			fmt.Printf("Error reading contract directory %s: %v\n", contractDirName, err)
			continue
		}

		fmt.Printf("Files in %s: %v\n", contractDirName, contractFiles)

		for _, contractFile := range contractFiles {
			if strings.HasSuffix(contractFile, ".json") && !strings.HasSuffix(contractFile, ".dbg.json") {
				contractName := strings.TrimSuffix(contractFile, ".json")

				fmt.Printf("Processing contract file: %s -> %s\n", contractFile, contractName)

				// Read the JSON artifact
				artifact, err := specificContractDir.File(contractFile).Contents(ctx)
				if err != nil {
					fmt.Printf("Error reading artifact for %s: %v\n", contractName, err)
					continue
				}

				var compiled struct {
					Bytecode string      `json:"bytecode"`
					ABI      interface{} `json:"abi"`
				}
				if err := json.Unmarshal([]byte(artifact), &compiled); err != nil {
					fmt.Printf("Error unmarshaling artifact for %s: %v\n", contractName, err)
					continue
				}

				// Convert ABI to string
				abiBytes, err := json.Marshal(compiled.ABI)
				if err != nil {
					fmt.Printf("Error marshaling ABI for %s: %v\n", contractName, err)
					continue
				}

				contracts[contractName] = &models.CompiledContract{
					Name:            contractName,
					Bytecode:        compiled.Bytecode,
					ABI:             string(abiBytes),
					CompilerVersion: "0.8.19", // Updated to match the compiler version from logs
				}

				fmt.Printf("✅ Processed contract: %s (bytecode length: %d)\n", contractName, len(compiled.Bytecode))
			}
		}
	}

	return contracts, nil
}

// Alternative: Export specific files instead of entire directory
func (ds *DaggerService) exportContractArtifacts(ctx context.Context, container *dagger.Container, outputPath string) error {
	// Create output directory if it doesn't exist
	if err := os.MkdirAll(outputPath, 0755); err != nil {
		return fmt.Errorf("failed to create output directory: %w", err)
	}

	// Export the entire artifacts directory
	artifactsDir := container.Directory("/app/artifacts")
	_, err := artifactsDir.Export(ctx, outputPath)
	if err != nil {
		return fmt.Errorf("failed to export artifacts: %w", err)
	}

	fmt.Printf("Contract artifacts exported to: %s\n", outputPath)
	return nil
}

// buildFrontend builds the frontend and returns the deployment URL
func (ds *DaggerService) buildFrontend(ctx context.Context, repo *dagger.Directory) (string, error) {
	// Check for Next.js or static site
	_, err := repo.File("next.config.js").Contents(ctx)
	hasNextConfig := err == nil

	var output *dagger.Directory
	if hasNextConfig {
		// Build Next.js app
		output = ds.client.Container().
			From("node:18-alpine").
			WithMountedDirectory("/src", repo).
			WithWorkdir("/src").
			WithExec([]string{"npm", "install"}).
			WithExec([]string{"npx", "run", "build"}).
			Directory("/src/out")
	} else {
		// Try to find static site directory - first check public/
		output = repo.Directory("public")

		// Check if public directory has any entries
		entries, err := output.Entries(ctx)
		if err != nil || len(entries) == 0 {
			// If public doesn't exist or is empty, try build/
			output = repo.Directory("build")

			// Optionally, you could also check if build/ exists and has content
			buildEntries, buildErr := output.Entries(ctx)
			if buildErr != nil || len(buildEntries) == 0 {
				return "", fmt.Errorf("no static site directory found (tried public/ and build/)")
			}
		}
	}

	// Deploy to storage (e.g., S3, IPFS, etc.)
	// For simplicity, return a mock URL
	return fmt.Sprintf("https://app-%d.deploychain.locci.cloud", time.Now().Unix()), nil
}
