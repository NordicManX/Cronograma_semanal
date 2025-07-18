package handler

import (
	"net/http"
	"time"

	"planner-api/internal/database"
	"planner-api/internal/model"

	"github.com/gin-gonic/gin"
)

// CreateTaskInput define a estrutura que esperamos receber no corpo do pedido para criar uma tarefa.
type CreateTaskInput struct {
	Content  string `json:"content" binding:"required"`
	IsUrgent bool   `json:"isUrgent"`
	Date     string `json:"date" binding:"required"` // Recebemos a data como string no formato "AAAA-MM-DD"
}

// CreateTask é o handler para criar uma nova tarefa.
func CreateTask(c *gin.Context) {
	var input CreateTaskInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input inválido: " + err.Error()})
		return
	}

	// Obtém o userID que foi adicionado ao contexto pelo middleware de autenticação.
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Utilizador não autenticado"})
		return
	}

	taskDate, err := time.Parse("2006-01-02", input.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido. Use AAAA-MM-DD."})
		return
	}

	task := model.Task{
		Content:  input.Content,
		IsUrgent: input.IsUrgent,
		Date:     taskDate,
		UserID:   userID.(uint), // Converte o userID para o tipo uint
	}

	result := database.DB.Create(&task)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao criar a tarefa."})
		return
	}

	c.JSON(http.StatusCreated, task)
}

// GetTasksByDay é o handler para obter todas as tarefas de um dia específico.
func GetTasksByDay(c *gin.Context) {
	dateStr := c.Param("date")
	_, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido na URL. Use AAAA-MM-DD."})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Utilizador não autenticado"})
		return
	}

	var tasks []model.Task
	// Agora, a busca no banco de dados filtra as tarefas pelo ID do utilizador autenticado.
	result := database.DB.Where("user_id = ? AND DATE(date) = ?", userID, dateStr).Find(&tasks)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao buscar as tarefas."})
		return
	}

	c.JSON(http.StatusOK, tasks)
}
