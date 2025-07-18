package main

import (
	"log"
	"net/http"

	"planner-api/internal/database"
	"planner-api/internal/handler"
	"planner-api/internal/middleware"

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
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	router.Use(cors.New(config))

	api := router.Group("/api/v1")
	{
		authRoutes := api.Group("/auth")
		{
			authRoutes.POST("/register", handler.Register)
			authRoutes.POST("/login", handler.Login)
			authRoutes.GET("/verify", handler.VerifyEmail)
		}

		// --- ROTAS DE TAREFAS PROTEGIDAS ---
		taskRoutes := api.Group("/tasks").Use(middleware.AuthMiddleware())
		{
			taskRoutes.POST("/", handler.CreateTask)
			taskRoutes.GET("/:date", handler.GetTasksByDay)
		}

		api.GET("/ping", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "pong",
			})
		})
	}

	router.Run()
}
