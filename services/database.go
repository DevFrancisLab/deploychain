// services/database.go
package services

import (
    "database/sql"
    "errors"
    // "log"
    "os"

    "deploychain/models"

    _ "github.com/lib/pq"
)

// Database wraps the database connection
type Database struct {
    db *sql.DB
}

// NewDatabase initializes a new database connection
func NewDatabase() (*Database, error) {
    dbURL := os.Getenv("DATABASE_URL")
    if dbURL == "" {
        return nil, errors.New("DATABASE_URL not set")
    }

    db, err := sql.Open("postgres", dbURL)
    if err != nil {
        return nil, err
    }

    // Create tables if they don't exist
    if err := createTables(db); err != nil {
        return nil, err
    }

    return &Database{db: db}, nil
}

// Close closes the database connection
func (d *Database) Close() {
    d.db.Close()
}

// Ping checks the database connection
func (d *Database) Ping() error {
    return d.db.Ping()
}

// createTables sets up the database schema
func createTables(db *sql.DB) error {
    _, err := db.Exec(`
        CREATE TABLE IF NOT EXISTS deployments (
            id SERIAL PRIMARY KEY,
            project_name TEXT NOT NULL,
            status TEXT NOT NULL,
            url TEXT,
            deployment_type TEXT NOT NULL,
            contract_addresses JSONB,
            transaction_hashes JSONB,
            blockchain_network TEXT NOT NULL,
            gas_used BIGINT,
            error_message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS build_logs (
            id SERIAL PRIMARY KEY,
            deployment_id INTEGER REFERENCES deployments(id),
            stage TEXT NOT NULL,
            message TEXT NOT NULL,
            level TEXT NOT NULL,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `)
    return err
}

// CreateDeployment creates a new deployment record
func (d *Database) CreateDeployment(deployment models.Deployment) (int, error) {
    var id int
    err := d.db.QueryRow(`
        INSERT INTO deployments (
            project_name, status, url, deployment_type,
            contract_addresses, transaction_hashes, blockchain_network,
            gas_used, error_message, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id`,
        deployment.ProjectName, deployment.Status, deployment.URL, deployment.DeploymentType,
        deployment.ContractAddresses, deployment.TransactionHashes, deployment.BlockchainNetwork,
        deployment.GasUsed, deployment.ErrorMessage, deployment.CreatedAt, deployment.UpdatedAt,
    ).Scan(&id)
    return id, err
}

// UpdateDeployment updates an existing deployment
func (d *Database) UpdateDeployment(deployment models.Deployment) error {
    _, err := d.db.Exec(`
        UPDATE deployments SET
            status = $1,
            url = $2,
            contract_addresses = $3,
            transaction_hashes = $4,
            gas_used = $5,
            error_message = $6,
            updated_at = $7
        WHERE id = $8`,
        deployment.Status, deployment.URL, deployment.ContractAddresses,
        deployment.TransactionHashes, deployment.GasUsed, deployment.ErrorMessage,
        deployment.UpdatedAt, deployment.ID,
    )
    return err
}

// UpdateDeploymentStatus updates only the status and error message
func (d *Database) UpdateDeploymentStatus(id int, status, errorMessage string) error {
    _, err := d.db.Exec(`
        UPDATE deployments SET
            status = $1,
            error_message = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3`,
        status, errorMessage, id,
    )
    return err
}

// GetDeployment retrieves a deployment by ID
func (d *Database) GetDeployment(id int) (models.Deployment, error) {
    var deployment models.Deployment
    err := d.db.QueryRow(`
        SELECT id, project_name, status, url, deployment_type,
            contract_addresses, transaction_hashes, blockchain_network,
            gas_used, error_message, created_at, updated_at
        FROM deployments WHERE id = $1`,
        id,
    ).Scan(
        &deployment.ID, &deployment.ProjectName, &deployment.Status, &deployment.URL,
        &deployment.DeploymentType, &deployment.ContractAddresses, &deployment.TransactionHashes,
        &deployment.BlockchainNetwork, &deployment.GasUsed, &deployment.ErrorMessage,
        &deployment.CreatedAt, &deployment.UpdatedAt,
    )
    return deployment, err
}

// GetDeployments retrieves all deployments
func (d *Database) GetDeployments() ([]models.Deployment, error) {
    rows, err := d.db.Query(`
        SELECT id, project_name, status, url, deployment_type,
            contract_addresses, transaction_hashes, blockchain_network,
            gas_used, error_message, created_at, updated_at
        FROM deployments ORDER BY created_at DESC`,
    )
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var deployments []models.Deployment
    for rows.Next() {
        var d models.Deployment
        err := rows.Scan(
            &d.ID, &d.ProjectName, &d.Status, &d.URL,
            &d.DeploymentType, &d.ContractAddresses, &d.TransactionHashes,
            &d.BlockchainNetwork, &d.GasUsed, &d.ErrorMessage,
            &d.CreatedAt, &d.UpdatedAt,
        )
        if err != nil {
            return nil, err
        }
        deployments = append(deployments, d)
    }
    return deployments, nil
}