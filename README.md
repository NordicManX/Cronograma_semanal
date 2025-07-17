# Planner Tasks

Uma aplicação web completa para planeamento e organização de tarefas, com uma interface moderna, responsiva e interativa. Este repositório contém o frontend da aplicação, desenvolvido com React, Vite e Tailwind CSS.

## 🚀 Funcionalidades Principais

* **Planeamento Mensal:** Navegue por um calendário completo, com a capacidade de ver e planear tarefas para qualquer dia, mês ou ano.
* **Gestão de Tarefas:** Adicione, remova e reordene tarefas facilmente com uma interface de arrastar e soltar (`drag-and-drop`).
* **Prioridade de Tarefas:** Marque tarefas como "urgentes" para as destacar com um indicador visual, tanto na lista do dia como no calendário.
* **Design Responsivo:** A interface adapta-se perfeitamente a qualquer dispositivo, com uma vista otimizada para telemóveis (com menu de calendário em overlay) e para desktops.
* **Tema Claro e Escuro:** Alterne entre os modos de visualização para uma melhor experiência em qualquer ambiente de iluminação.
* **Fluxo de Autenticação (UI):** Páginas de Login, Registo e Verificação de Email prontas para serem integradas com um backend.
* **Notificações (Toasts):** Feedback visual para ações do utilizador, como login ou registo.
* **Persistência Local:** O seu cronograma é guardado no seu navegador (`localStorage`), para que não perca o seu planeamento.

## 🛠️ Tecnologias Utilizadas

* **Frontend:**
    * [**React**](https://react.dev/) (v18+)
    * [**Vite**](https://vitejs.dev/) como ferramenta de build.
    * [**Tailwind CSS**](https://tailwindcss.com/) para estilização.
    * [**date-fns**](https://date-fns.org/) para manipulação de datas.
    * [**react-hot-toast**](https://react-hot-toast.com/) para notificações.
    * [**Lucide React**](https://lucide.dev/) para ícones.
* **Backend (Planeado):**
    * A arquitetura está preparada para ser integrada com um backend em [**Go (Golang)**](https://go.dev/).

## ⚙️ Como Executar o Projeto

Para executar o frontend localmente, siga estes passos. É necessário ter o [Node.js](https://nodejs.org/) (v18 ou superior) instalado.

**1. Clone o Repositório**

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd meu-cronograma/frontend 
# Nota: A pasta pode chamar-se 'vite-project' ou 'frontend'
```

**2. Instale as Dependências**

Este comando irá descarregar todos os pacotes necessários para o projeto.

```bash
npm install
```

**3. Inicie o Servidor de Desenvolvimento**

```bash
npm run dev
```

Abra o seu navegador e aceda a `http://localhost:5173` (ou o endereço que aparecer no seu terminal) para ver a aplicação a funcionar.

## 🔮 Próximos Passos

Com o frontend completo, o próximo grande passo é o desenvolvimento do **backend em Go**, que irá incluir:
* API RESTful com Gin.
* Integração com um banco de dados PostgreSQL.
* Implementação do sistema de registo, login e verificação de email.
* Criação dos endpoints para guardar e gerir as tarefas de forma permanente.
