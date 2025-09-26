// services/dagger.go
package services

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
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
    client, err := dagger.Connect(context.Background())
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

    // Build frontend
    frontendURL, err := ds.buildFrontend(ctx, repo)
    if err != nil {
        return result, fmt.Errorf("frontend build failed: %v", err)
    }
    result.FrontendURL = frontendURL

    // Log build steps
    result.BuildLogs = append(result.BuildLogs,
        "Cloned repository",
        "Detected Web3 project",
        "Compiled smart contracts",
        "Built frontend",
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
func (ds *DaggerService) compileContracts(ctx context.Context, repo *dagger.Directory) (map[string]*models.CompiledContract, error) {
    contracts := make(map[string]*models.CompiledContract)

    // Use Hardhat container to compile contracts
    output := ds.client.Container().
        From("node:18").
        WithMountedDirectory("/src", repo).
        WithWorkdir("/src").
        WithExec([]string{"npx", "hardhat", "compile"}).
        Directory("/src/artifacts/contracts")

    // Process compiled contracts
    entries, err := output.Entries(ctx)
    if err != nil {
        return nil, err
    }

    for _, entry := range entries {
        if strings.HasSuffix(entry, ".json") {
            contractName := strings.TrimSuffix(entry, ".json")
            artifact, err := output.File(entry).Contents(ctx)
            if err != nil {
                return nil, err
            }

            var compiled struct {
                Bytecode string `json:"bytecode"`
                ABI      string `json:"abi"`
            }
            if err := json.Unmarshal([]byte(artifact), &compiled); err != nil {
                return nil, err
            }

            contracts[contractName] = &models.CompiledContract{
                Name:            contractName,
                Bytecode:        compiled.Bytecode,
                ABI:             compiled.ABI,
                CompilerVersion: "0.8.20", // Example version
            }
        }
    }

    return contracts, nil
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
            From("node:18").
            WithMountedDirectory("/src", repo).
            WithWorkdir("/src").
            WithExec([]string{"npm", "install"}).
            WithExec([]string{"npm", "run", "build"}).
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