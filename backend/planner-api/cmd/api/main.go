package main

import (
	"log"
	"net/http"

	"planner-api/internal/database"
	"planner-api/internal/handler"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Erro ao carregar o ficheiro .env. Certifique-se de que ele existe na raiz do projeto.")
	}
	database.ConnectDatabase()
}

func main() {
	router := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE"}
	config.AllowHeaders = []string{"Origin", "Content-Type"}
	router.Use(cors.New(config))

	api := router.Group("/api/v1")
	{
		authRoutes := api.Group("/auth")
		{
			authRoutes.POST("/register", handler.Register)
			// --- NOVA ROTA DE LOGIN ---
			authRoutes.POST("/login", handler.Login)
		}

		api.GET("/ping", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "pong",
			})
		})
	}

	router.Run()
}
