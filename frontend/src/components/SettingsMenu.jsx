import { LogIn, LogOut, Sun, Moon } from 'lucide-react';

const SettingsMenu = ({ isLoggedIn, onAuthAction, theme, onToggleTheme }) => {
  return (
    <div className="absolute top-14 right-0 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border dark:border-slate-700 p-2 z-20 animate-slide-down">
      <ul>
        <li>
          <button
            onClick={onAuthAction}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
          >
            {isLoggedIn ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            <span>{isLoggedIn ? 'Deslogar' : 'Logar'}</span>
          </button>
        </li>
        <li>
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span>Tema {theme === 'light' ? 'Escuro' : 'Claro'}</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default SettingsMenu;