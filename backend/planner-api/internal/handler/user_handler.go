package handler

import (
	"net/http"

	"planner-api/internal/auth"
	"planner-api/internal/database"
	"planner-api/internal/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type RegisterInput struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func Register(c *gin.Context) {
	var input RegisterInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input inválido: " + err.Error()})
		return
	}

	hashedPassword, err := auth.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao processar a senha"})
		return
	}

	user := model.User{
		Username: input.Username,
		Email:    input.Email,
		Password: hashedPassword,
	}

	result := database.DB.Create(&user)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao criar o utilizador. O email ou nome de utilizador podem já existir."})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Utilizador registado com sucesso"})
}

type LoginInput struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// Login
func Login(c *gin.Context) {
	var input LoginInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input inválido: " + err.Error()})
		return
	}

	var user model.User

	result := database.DB.Where("email = ?", input.Email).First(&user)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Email ou senha inválidos"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao procurar o utilizador"})
		return
	}

	if !auth.CheckPasswordHash(input.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email ou senha inválidos"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Login realizado com sucesso"})
}
