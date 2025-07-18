package auth

import (
	"crypto/rand"
	"encoding/hex"
)

// GenerateSecureToken cria uma string de token aleatória e segura.
// Usaremos isto para os tokens de verificação de email.
func GenerateSecureToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
