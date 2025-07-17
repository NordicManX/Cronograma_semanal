package model

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model

	Username string `gorm:"size:255;not null;unique" json:"username"`
	Email    string `gorm:"size:255;not null;unique" json:"email"`
	Password string `gorm:"size:255;not null" json:"-"` // O '-' no json tag impede que a senha seja enviada nas respostas da API

	Verified              bool   `gorm:"default:false"`
	VerificationToken     string `gorm:"size:255;unique"`
	VerificationExpiresAt time.Time
}

type Task struct {
	gorm.Model

	Content  string    `gorm:"size:255;not null" json:"content"`
	IsUrgent bool      `gorm:"default:false" json:"isUrgent"`
	Date     time.Time `json:"date"`

	UserID uint `json:"userId"`
	User   User `gorm:"foreignKey:UserID"`
}
