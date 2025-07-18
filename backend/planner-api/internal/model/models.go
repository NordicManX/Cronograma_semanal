package model

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username              string `gorm:"size:255;not null;unique" json:"username"`
	Email                 string `gorm:"size:255;not null;unique" json:"email"`
	Password              string `gorm:"size:255;not null" json:"-"`
	Verified              bool   `gorm:"default:false"`
	VerificationToken     string `gorm:"size:255;unique"`
	VerificationExpiresAt time.Time
}

type Task struct {
	gorm.Model
	Content  string `gorm:"size:255;not null" json:"content"`
	IsUrgent bool   `gorm:"default:false" json:"isUrgent"`
	// CORRIGIDO: Especifica que o tipo na base de dados deve ser DATE.
	Date   time.Time `gorm:"type:date;not null" json:"date"`
	UserID uint      `json:"userId"`
	User   User      `gorm:"foreignKey:UserID"`
}

// TaskResponse é um DTO (Data Transfer Object) para formatar a resposta da API.
// Isto garante que a data é sempre enviada como uma string "AAAA-MM-DD".
type TaskResponse struct {
	ID       uint   `json:"ID"`
	Content  string `json:"content"`
	IsUrgent bool   `json:"isUrgent"`
	Date     string `json:"date"`
}
