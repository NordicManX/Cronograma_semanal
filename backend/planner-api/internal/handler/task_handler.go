package handler

import (
	"net/http"
	"time"

	"planner-api/internal/database"
	"planner-api/internal/model"

	"github.com/gin-gonic/gin"
)

type CreateTaskInput struct {
	Content  string `json:"content" binding:"required"`
	IsUrgent bool   `json:"isUrgent"`
	Date     string `json:"date" binding:"required"`
}

func CreateTask(c *gin.Context) {
	var input CreateTaskInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input inválido: " + err.Error()})
		return
	}

	userID, _ := c.Get("userID")

	taskDate, err := time.Parse("2006-01-02", input.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido. Use AAAA-MM-DD."})
		return
	}

	task := model.Task{
		Content:  input.Content,
		IsUrgent: input.IsUrgent,
		Date:     taskDate,
		UserID:   userID.(uint),
	}

	result := database.DB.Create(&task)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao criar a tarefa."})
		return
	}

	c.JSON(http.StatusCreated, task)
}

func GetTasksByDay(c *gin.Context) {
	dateStr := c.Param("date")
	userID, _ := c.Get("userID")

	var tasks []model.Task
	database.DB.Where("user_id = ? AND DATE(date) = ?", userID, dateStr).Find(&tasks)

	c.JSON(http.StatusOK, tasks)
}

func DeleteTask(c *gin.Context) {
	taskID := c.Param("id")
	userID, _ := c.Get("userID")

	var task model.Task
	result := database.DB.Where("id = ? AND user_id = ?", taskID, userID).First(&task)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tarefa não encontrada ou não tem permissão para a apagar"})
		return
	}

	database.DB.Delete(&task)
	c.Status(http.StatusNoContent)
}

func ToggleUrgent(c *gin.Context) {
	taskID := c.Param("id")
	userID, _ := c.Get("userID")

	var task model.Task
	result := database.DB.Where("id = ? AND user_id = ?", taskID, userID).First(&task)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tarefa não encontrada ou não tem permissão para a editar"})
		return
	}

	task.IsUrgent = !task.IsUrgent
	database.DB.Save(&task)

	c.JSON(http.StatusOK, task)
}

// --- NOVO CÓDIGO ABAIXO ---

// MoveTaskInput define a estrutura que esperamos para mover uma tarefa.
type MoveTaskInput struct {
	Date string `json:"date" binding:"required"`
}

// MoveTask é o handler para mover uma tarefa para uma nova data.
func MoveTask(c *gin.Context) {
	taskID := c.Param("id")
	userID, _ := c.Get("userID")

	var input MoveTaskInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input inválido: " + err.Error()})
		return
	}

	newDate, err := time.Parse("2006-01-02", input.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido. Use AAAA-MM-DD."})
		return
	}

	var task model.Task
	result := database.DB.Where("id = ? AND user_id = ?", taskID, userID).First(&task)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tarefa não encontrada ou não tem permissão para a mover"})
		return
	}

	task.Date = newDate
	database.DB.Save(&task)

	c.JSON(http.StatusOK, task)
}
