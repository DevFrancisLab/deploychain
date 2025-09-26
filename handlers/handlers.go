// handlers/handlers.go
package handlers

import (
    "log"
    "net/http"
    "strconv"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
    "deploychain/models"
    "deploychain/services"
)

// Handler holds service dependencies
type Handler struct {
    db                *services.Database
    daggerService     *services.DaggerService
    blockchainService *services.BlockchainService
}

// NewHandler creates a new handler with service dependencies
func NewHandler(db *services.Database, dagger *services.DaggerService, blockchain *services.BlockchainService) *Handler {
    return &Handler{
        db:                db,
        daggerService:     dagger,
        blockchainService: blockchain,
    }
}

// HealthCheck handles the /api/health endpoint
func (h *Handler) HealthCheck(c *gin.Context) {
    response := map[string]string{"status": "healthy"}
    if err := h.db.Ping(); err != nil {
        response["status"] = "unhealthy"
        response["error"] = "Database connection failed"
        c.JSON(http.StatusServiceUnavailable, response)
        return
    }
    if err := h.blockchainService.TestConnection(); err != nil {
        response["status"] = "unhealthy"
        response["error"] = "MultiBaas connection failed"
        c.JSON(http.StatusServiceUnavailable, response)
        return
    }
    c.JSON(http.StatusOK, response)
}

// TriggerManualDeploy handles the /api/deploy endpoint
func (h *Handler) TriggerManualDeploy(c *gin.Context) {
    var request struct {
        RepoURL     string `json:"repo_url" binding:"required"`
        Branch      string `json:"branch" binding:"required"`
        ProjectName string `json:"project_name" binding:"required"`
    }

    if err := c.ShouldBindJSON(&request); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
        return
    }

    // Create deployment record
    deployment := models.Deployment{
        ProjectName:       request.ProjectName,
        Status:            models.StatusPending,
        DeploymentType:    models.TypeDApp,
        BlockchainNetwork: models.NetworkSepolia,
        CreatedAt:         time.Now(),
        UpdatedAt:         time.Now(),
    }

    id, err := h.db.CreateDeployment(deployment)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create deployment"})
        return
    }

    // Start deployment pipeline asynchronously
    go func() {
        result, err := h.daggerService.RunPipeline(request.RepoURL, request.Branch, id)
        if err != nil {
            log.Printf("Pipeline failed: %v", err)
            h.db.UpdateDeploymentStatus(id, models.StatusFailed, err.Error())
            return
        }

        // Deploy contracts to blockchain
        contractAddresses, txHashes, gasUsed, err := h.blockchainService.DeployContracts(result.CompiledContracts, models.NetworkSepolia)
        if err != nil {
            log.Printf("Contract deployment failed: %v", err)
            h.db.UpdateDeploymentStatus(id, models.StatusFailed, err.Error())
            return
        }

        // Update deployment with results
        deployment.Status = models.StatusDeployed
        deployment.URL = result.FrontendURL
        deployment.ContractAddresses = contractAddresses
        deployment.TransactionHashes = txHashes
        deployment.GasUsed = gasUsed
        deployment.UpdatedAt = time.Now()

        if err := h.db.UpdateDeployment(deployment); err != nil {
            log.Printf("Failed to update deployment: %v", err)
        }
    }()

    c.JSON(http.StatusCreated, gin.H{
        "deployment_id": id,
        "status":        "started",
    })
}

// ListDeployments handles the /api/deployments endpoint
func (h *Handler) ListDeployments(c *gin.Context) {
    deployments, err := h.db.GetDeployments()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch deployments"})
        return
    }

    c.JSON(http.StatusOK, deployments)
}

// GetDeployment handles the /api/deployments/:id endpoint
func (h *Handler) GetDeployment(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid deployment ID"})
        return
    }

    deployment, err := h.db.GetDeployment(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Deployment not found"})
        return
    }

    c.JSON(http.StatusOK, deployment)
}

// HandleGitHubWebhook handles the /webhook/github endpoint
func (h *Handler) HandleGitHubWebhook(c *gin.Context) {
    var payload struct {
        Repository struct {
            CloneURL string `json:"clone_url"`
        } `json:"repository"`
        Ref string `json:"ref"`
    }

    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid webhook payload"})
        return
    }

    // Extract branch from ref (e.g., refs/heads/main -> main)
    branch := strings.TrimPrefix(payload.Ref, "refs/heads/")

    // Create deployment record
    deployment := models.Deployment{
        ProjectName:       payload.Repository.CloneURL,
        Status:            models.StatusPending,
        DeploymentType:    models.TypeDApp,
        BlockchainNetwork: models.NetworkSepolia,
        CreatedAt:         time.Now(),
        UpdatedAt:         time.Now(),
    }

    id, err := h.db.CreateDeployment(deployment)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create deployment"})
        return
    }

    // Start deployment pipeline asynchronously
    go h.daggerService.RunPipeline(payload.Repository.CloneURL, branch, id)

    c.JSON(http.StatusOK, gin.H{"status": "received"})
}