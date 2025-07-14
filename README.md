# Cronograma Semanal

Um projeto de aplicação web para planeamento e organização de tarefas semanais, com uma interface interativa de arrastar e soltar (`drag-and-drop`). Este repositório contém o frontend da aplicação, desenvolvido com React e Vite.

## 🚀 Funcionalidades

* **Visualização em Grelha:** Veja a sua semana inteira, de Segunda a Domingo.
* **Gestão de Tarefas:** Adicione e remova tarefas facilmente em qualquer dia.
* **Arrastar e Soltar:** Mova tarefas entre diferentes dias da semana de forma intuitiva.
* **Reordenação Vertical:** Organize a ordem das tarefas dentro de um mesmo dia, arrastando-as para cima ou para baixo.
* **Persistência Local:** O seu cronograma é guardado automaticamente no seu navegador (`localStorage`), para que não perca o seu planeamento ao fechar a página.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com tecnologias modernas, focando na performance e na experiência de desenvolvimento.

* **Frontend:**
    * [**React**](https://react.dev/) (v18+)
    * [**Vite**](https://vitejs.dev/) como ferramenta de build e servidor de desenvolvimento.
    * [**Tailwind CSS**](https://tailwindcss.com/) para estilização rápida e utilitária.
    * [**Lucide React**](https://lucide.dev/) para ícones.
* **Backend (Planeado):**
    * A arquitetura está preparada para ser integrada com um backend em [**Go (Golang)**](https://go.dev/) para persistência de dados em servidor e autenticação de utilizadores.

## ⚙️ Como Executar o Projeto

Para executar o frontend localmente, siga estes passos. É necessário ter o [Node.js](https://nodejs.org/) (v18 ou superior) instalado.

**1. Clone o Repositório (ou tenha os ficheiros)**

Se estiver a usar git:

```bash
git clone https://github.com/NordicManX/Cronograma_semanal.git
cd meu-cronograma/vite-project
```

Caso contrário, apenas certifique-se de que o seu terminal está aberto dentro da pasta `vite-project`.

**2. Instale as Dependências**

Este comando irá descarregar todos os pacotes necessários (React, Tailwind, etc.) para o projeto.

```bash
npm install
```

**3. Inicie o Servidor de Desenvolvimento**

Este comando irá iniciar a aplicação em modo de desenvolvimento.

```bash
npm run dev
```

Abra o seu navegador e aceda a `http://localhost:5173` (ou o endereço que aparecer no seu terminal) para ver a aplicação a funcionar.

## 📂 Estrutura de Ficheiros

O código fonte está organizado na pasta `src` da seguinte forma:

```
src/
├── components/       # Componentes React reutilizáveis (TaskCard, DayColumn, etc.)
├── data/             # Dados estáticos e constantes (dias da semana, dados iniciais)
├── App.jsx           # Componente principal que une a aplicação
├── main.jsx          # Ponto de entrada da aplicação React
└── index.css         # Ficheiro de estilos global para o Tailwind CSS
```

## 🔮 Próximos Passos

* Desenvolver a API RESTful em Go.
* Integrar o frontend com o backend para substituir o `localStorage`.
* Implementar autenticação de utilizadores (registo e login).
* Adicionar a capacidade de editar tarefas existentes.
