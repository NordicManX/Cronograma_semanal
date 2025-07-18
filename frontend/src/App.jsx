import { useState, useEffect, useRef } from 'react';
import { Settings } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import PlannerPage from './pages/PlannerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import SettingsMenu from './components/SettingsMenu';

const App = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('authToken'));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(isLoggedIn ? 'planner' : 'login');
  const [verificationEmail, setVerificationEmail] = useState('');
  const settingsMenuRef = useRef(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsMenuRef]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    setIsSettingsOpen(false);
  };

  const handleAuthAction = () => {
    if (isLoggedIn) {
      localStorage.removeItem('authToken'); // Remove o token ao deslogar
      setIsLoggedIn(false);
      setCurrentPage('login');
    } else {
      setCurrentPage('login');
    }
    setIsSettingsOpen(false);
  };
  
  const handleLogin = (token) => {
    localStorage.setItem('authToken', token); // Guarda o token no localStorage
    setIsLoggedIn(true);
    setCurrentPage('planner');
  }
  
  const handleNavigate = (page, data) => {
      if (page === 'verify-email') {
          setVerificationEmail(data);
      }
      setCurrentPage(page);
  }

  const renderPage = () => {
    switch (currentPage) {
        case 'login':
            return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />;
        case 'register':
            return <RegisterPage onNavigate={handleNavigate} />;
        case 'verify-email':
            return <VerifyEmailPage email={verificationEmail} onNavigate={handleNavigate} />;
        case 'planner':
            if (isLoggedIn) {
                return <PlannerPage />;
            }
            return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />;
        default:
            return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="h-screen w-full font-sans text-gray-900 bg-gradient-to-br from-sky-50 to-slate-200 dark:from-slate-900 dark:to-slate-800 dark:text-slate-200 flex flex-col">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 z-10 border-b dark:border-slate-700 shrink-0">
          <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-l-lg text-white font-bold text-lg">P</div>
                  <div className="flex items-center justify-center w-8 h-8 bg-slate-700 dark:bg-slate-600 rounded-r-lg text-white font-bold text-lg">T</div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 hidden sm:block">
                  Planner Tasks
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative" ref={settingsMenuRef}>
                  <button onClick={() => setIsSettingsOpen(prev => !prev)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                    <Settings className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                  </button>
                  {isSettingsOpen && (
                    <SettingsMenu 
                      isLoggedIn={isLoggedIn}
                      onAuthAction={handleAuthAction}
                      theme={theme}
                      onToggleTheme={handleToggleTheme}
                    />
                  )}
                </div>
              </div>
          </div>
        </header>
        
        <div className="flex-1 flex flex-row overflow-hidden">
          {renderPage()}
        </div>
        
        <footer className="text-center p-4 text-slate-500 dark:text-slate-400 text-sm shrink-0 border-t dark:border-slate-700 bg-slate-100/70 dark:bg-slate-900/50">
            <p>Desenvolvido por NordicManX com React (Vite) e Go. Arraste as tarefas para reorganizar.</p>
        </footer>
      </div>
    </>
  );
}

export default App;