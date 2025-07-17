import { Mail, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyEmailPage = ({ email, onNavigate }) => {
  
  const handleResendEmail = () => {
    // Simula o reenvio do email
    console.log('Resending verification email to:', email);
    toast.success('Email de verificação reenviado!');
  };

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50">
          <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Verifique o seu Email</h1>
        <p className="text-gray-600 dark:text-slate-400">
          Enviámos um link de confirmação para <br/>
          <strong className="text-slate-700 dark:text-slate-300">{email}</strong>.
        </p>
        <p className="text-sm text-gray-500 dark:text-slate-500">
          Por favor, clique no link para ativar a sua conta.
        </p>
        <div className="pt-4">
          <button
            onClick={handleResendEmail}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4" />
            Reenviar Email
          </button>
        </div>
        <p className="text-center text-sm text-gray-600 dark:text-slate-400 pt-4">
          Já verificou?{' '}
          <button onClick={() => onNavigate('login')} className="font-medium text-blue-600 hover:text-blue-500">
            Ir para o Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;