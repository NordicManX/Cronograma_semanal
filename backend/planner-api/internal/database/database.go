package database

import (
	"fmt"
	"log"
	"os"

	"planner-api/internal/model"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("A variável de ambiente DATABASE_URL não está definida")
	}

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Falha ao conectar-se ao banco de dados!", err)
	}

	fmt.Println("Conexão com o banco de dados aberta com sucesso")

	err = database.AutoMigrate(&model.User{}, &model.Task{})
	if err != nil {
		log.Fatal("Falha ao migrar o esquema do banco de dados:", err)
	}
	fmt.Println("Banco de dados migrado")

	DB = database
}
