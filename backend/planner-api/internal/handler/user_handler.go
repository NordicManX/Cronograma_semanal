package handler

import (
	"log" // Importa o pacote log
	"net/http"
	"time"

	"planner-api/internal/auth"
	"planner-api/internal/database"
	"planner-api/internal/model"
	"planner-api/internal/service" // Importa o nosso novo serviço de email

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ... (as structs RegisterInput e LoginInput não mudam) ...

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

	// --- ENVIO DO EMAIL DE VERIFICAÇÃO ---
	// Usamos uma goroutine (go) para enviar o email em segundo plano.
	// Isto evita que o utilizador tenha de esperar que o email seja enviado para receber a resposta.
	go func() {
		err := service.SendVerificationEmail(user.Email, user.VerificationToken)
		if err != nil {
			// Apenas registamos o erro no log do servidor, não enviamos um erro ao utilizador.
			log.Printf("Falha ao enviar o email de verificação para %s: %v", user.Email, err)
		}
	}()

	c.JSON(http.StatusCreated, gin.H{"message": "Utilizador registado com sucesso. Verifique o seu email."})
}

// ... (as funções Login e VerifyEmail não mudam) ...

type LoginInput struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

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

	updates := model.User{Verified: true, VerificationToken: ""}
	database.DB.Model(&user).Updates(updates)

	c.JSON(http.StatusOK, gin.H{"message": "Email verificado com sucesso! Já pode fazer o login."})
}
