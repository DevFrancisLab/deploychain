// main.go
package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"

	"deploychain/handlers"
	"deploychain/services"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize services
	db, err := services.NewDatabase()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	daggerService := services.NewDaggerService()
	blockchainService := services.NewBlockchainService()

	// Test MultiBaas connection
	if err := blockchainService.TestConnection(); err != nil {
		log.Printf("Warning: MultiBaas connection failed: %v", err)
	} else {
		log.Println("✅ MultiBaas connected successfully")
	}

	// Initialize handlers
	handler := handlers.NewHandler(db, daggerService, blockchainService)

	// Setup Gin router
	r := setupRoutes(handler)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 DeployChain API starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func setupRoutes(handler *handlers.Handler) *gin.Engine {
	// Initialize Gin router with default middleware (logging and recovery)
	r := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{
		"http://localhost:3000",           // React dev server
		"http://localhost:3001",           // Alternative React port
		"http://localhost:5173",           // Same origin
		"https://deploychain.locci.cloud", // Production frontend
	}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "Accept", "X-Requested-With"}
	config.AllowCredentials = true

	// Use CORS middleware
	r.Use(cors.New(config))

	// Serve static files for dashboard
	r.Static("/static", "./static")
	r.GET("/", serveDashboard)

	// API routes
	api := r.Group("/api")
	{
		api.GET("/deployments", handler.ListDeployments)
		api.GET("/deployments/:id", handler.GetDeployment)
		api.POST("/deploy", handler.TriggerManualDeploy)
		api.GET("/health", handler.HealthCheck)
	}

	// Webhook routes
	r.POST("/webhook/github", handler.HandleGitHubWebhook)

	return r
}

func serveDashboard(c *gin.Context) {
	c.File("./static/index.html")
}
