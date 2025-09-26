// models/deployment.go
package models

import (
    "database/sql/driver"
    "encoding/json"
    "errors"
    "time"
)

type Deployment struct {
    ID                int                `json:"id" db:"id"`
    ProjectName       string             `json:"project_name" db:"project_name"`
    Status            string             `json:"status" db:"status"`
    URL               string             `json:"url" db:"url"`
    DeploymentType    string             `json:"deployment_type" db:"deployment_type"`
    ContractAddresses ContractAddressMap `json:"contract_addresses" db:"contract_addresses"`
    TransactionHashes StringArray        `json:"transaction_hashes" db:"transaction_hashes"`
    BlockchainNetwork string             `json:"blockchain_network" db:"blockchain_network"`
    GasUsed           int64              `json:"gas_used" db:"gas_used"`
    ErrorMessage      string             `json:"error_message" db:"error_message"`
    CreatedAt         time.Time          `json:"created_at" db:"created_at"`
    UpdatedAt         time.Time          `json:"updated_at" db:"updated_at"`
}

// ContractAddressMap represents a mapping of contract names to addresses
type ContractAddressMap map[string]string

// Scan implements the sql.Scanner interface for reading from database
func (cam *ContractAddressMap) Scan(value interface{}) error {
    if value == nil {
        *cam = make(ContractAddressMap)
        return nil
    }

    bytes, ok := value.([]byte)
    if !ok {
        return errors.New("type assertion to []byte failed")
    }

    return json.Unmarshal(bytes, cam)
}

// Value implements the driver.Valuer interface for writing to database
func (cam ContractAddressMap) Value() (driver.Value, error) {
    if cam == nil {
        return nil, nil
    }
    return json.Marshal(cam)
}

// StringArray represents an array of strings for JSON storage
type StringArray []string

// Scan implements the sql.Scanner interface for reading from database
func (sa *StringArray) Scan(value interface{}) error {
    if value == nil {
        *sa = StringArray{}
        return nil
    }

    bytes, ok := value.([]byte)
    if !ok {
        return errors.New("type assertion to []byte failed")
    }

    return json.Unmarshal(bytes, sa)
}

// Value implements the driver.Valuer interface for writing to database
func (sa StringArray) Value() (driver.Value, error) {
    if sa == nil {
        return nil, nil
    }
    return json.Marshal(sa)
}

// DeploymentStatus constants
const (
    StatusPending   = "pending"
    StatusBuilding  = "building"
    StatusDeployed  = "deployed"
    StatusFailed    = "failed"
)

// DeploymentType constants
const (
    TypeStatic = "static"
    TypeDApp   = "dapp"
)

// NetworkName constants
const (
    NetworkEthereum = "ethereum"
    NetworkSepolia  = "sepolia"
    NetworkGoerli   = "goerli"
    NetworkPolygon  = "polygon"
    NetworkMumbai   = "mumbai"
)

// BuildResult represents the result of a build operation
type BuildResult struct {
    DeploymentType     string                       `json:"deployment_type"`
    FrontendURL        string                       `json:"frontend_url"`
    CompiledContracts  map[string]*CompiledContract `json:"compiled_contracts,omitempty"`
    ContractAddresses  ContractAddressMap           `json:"contract_addresses,omitempty"`
    TransactionHashes  []string                     `json:"transaction_hashes,omitempty"`
    GasUsed           int64                        `json:"gas_used,omitempty"`
    BuildLogs         []string                     `json:"build_logs,omitempty"`
    Error             string                       `json:"error,omitempty"`
}

// CompiledContract represents a compiled smart contract
type CompiledContract struct {
    Name            string `json:"name"`
    Bytecode        string `json:"bytecode"`
    ABI             string `json:"abi"`
    SourceCode      string `json:"source_code,omitempty"`
    CompilerVersion string `json:"compiler_version,omitempty"`
}

// ContractDeployment represents a blockchain contract deployment
type ContractDeployment struct {
    Name            string    `json:"name"`
    Address         string    `json:"address"`
    TransactionHash string    `json:"transaction_hash"`
    GasUsed         int64     `json:"gas_used"`
    Network         string    `json:"network"`
    ChainID         int64     `json:"chain_id"`
    Status          string    `json:"status"`
    DeployedAt      time.Time `json:"deployed_at"`
}

// ContractInfo represents information about a deployed contract
type ContractInfo struct {
    Name         string `json:"name"`
    Address      string `json:"address"`
    Network      string `json:"network"`
    ChainID      int64  `json:"chain_id"`
    EtherscanURL string `json:"etherscan_url"`
    ABI          string `json:"abi,omitempty"`
    Bytecode     string `json:"bytecode,omitempty"`
}

// BuildLog represents a build log entry
type BuildLog struct {
    ID           int       `json:"id" db:"id"`
    DeploymentID int       `json:"deployment_id" db:"deployment_id"`
    Stage        string    `json:"stage" db:"stage"`
    Message      string    `json:"message" db:"message"`
    Level        string    `json:"level" db:"level"`
    Timestamp    time.Time `json:"timestamp" db:"timestamp"`
}