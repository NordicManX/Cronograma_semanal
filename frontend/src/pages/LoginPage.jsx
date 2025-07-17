import { useState } from 'react';
import toast from 'react-hot-toast';

const LoginPage = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }
    // Simula uma chamada de API
    console.log('Logging in with:', { email, password });
    toast.success('Login realizado com sucesso!');
    onLogin(); // Atualiza o estado de autenticação no App.jsx
  };

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-slate-300">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-700"
            />
          </div>
          <div>
            <label htmlFor="password"  className="text-sm font-medium text-gray-700 dark:text-slate-300">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-700"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Entrar
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-slate-400">
          Não tem uma conta?{' '}
          <button onClick={() => onNavigate('register')} className="font-medium text-blue-600 hover:text-blue-500">
            Registe-se
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;