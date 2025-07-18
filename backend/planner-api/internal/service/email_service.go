package service

import (
	"fmt"
	"net/smtp"
	"os"
)

// SendVerificationEmail envia um email de confirmação para o novo utilizador.
func SendVerificationEmail(toEmail, token string) error {
	// 1. Obtém as credenciais do servidor de email a partir do ficheiro .env.
	from := os.Getenv("SMTP_SENDER_EMAIL")
	password := os.Getenv("SMTP_PASS")
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")

	// 2. Constrói a mensagem do email em formato HTML.
	// O link de verificação aponta para o nosso frontend (que ainda vamos criar).
	verificationLink := fmt.Sprintf("http://localhost:5173/verify?token=%s", token)

	subject := "Subject: Confirme a sua conta no Planner Tasks\r\n"
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	body := fmt.Sprintf(`
	<html>
		<body>
			<h2>Bem-vindo ao Planner Tasks!</h2>
			<p>Obrigado por se registar. Por favor, clique no link abaixo para verificar a sua conta:</p>
			<p><a href="%s">Verificar a minha conta</a></p>
			<p>Se não se registou, por favor ignore este email.</p>
		</body>
	</html>
	`, verificationLink)

	msg := []byte(subject + mime + body)

	// 3. Autentica-se no servidor SMTP.
	auth := smtp.PlainAuth("", from, password, smtpHost)

	// 4. Envia o email.
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{toEmail}, msg)
	if err != nil {
		return err
	}

	return nil
}
