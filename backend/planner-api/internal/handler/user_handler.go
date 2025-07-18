package handler

import (
	"net/http"
	"time"

	"planner-api/internal/auth"
	"planner-api/internal/database"
	"planner-api/internal/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// RegisterInput define a estrutura de dados que esperamos para o registo.
type RegisterInput struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// Register é o handler para o registo de um novo utilizador.
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

	verificationToken, err := auth.GenerateSecureToken(32)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao gerar o token de verificação"})
		return
	}

	user := model.User{
		Username:              input.Username,
		Email:                 input.Email,
		Password:              hashedPassword,
		VerificationToken:     verificationToken,
		VerificationExpiresAt: time.Now().Add(time.Hour * 24),
	}

	result := database.DB.Create(&user)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao criar o utilizador. O email ou nome de utilizador podem já existir."})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Utilizador registado com sucesso. Verifique o seu email."})
}

// LoginInput define a estrutura de dados que esperamos para o login.
type LoginInput struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// Login é o handler para a autenticação de um utilizador.
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

	if !user.Verified {
		c.JSON(http.StatusForbidden, gin.H{"error": "Por favor, verifique o seu email antes de fazer o login."})
		return
	}

	if !auth.CheckPasswordHash(input.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email ou senha inválidos"})
		return
	}

	token, err := auth.GenerateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao gerar o token de autenticação"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login realizado com sucesso",
		"token":   token,
	})
}

// VerifyEmail é o handler para verificar a conta de um utilizador.
func VerifyEmail(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token de verificação em falta"})
		return
	}

	var user model.User
	result := database.DB.Where("verification_token = ?", token).First(&user)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Token de verificação inválido ou expirado"})
		return
	}

	if time.Now().After(user.VerificationExpiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token de verificação expirado"})
		return
	}

	// --- CORREÇÃO APLICADA AQUI ---
	// Usamos .Model(&user).Updates(...) para garantir que os campos são atualizados corretamente.
	// Isto é mais explícito e seguro do que .Save().
	updates := model.User{Verified: true, VerificationToken: ""}
	database.DB.Model(&user).Updates(updates)

	c.JSON(http.StatusOK, gin.H{"message": "Email verificado com sucesso! Já pode fazer o login."})
}
