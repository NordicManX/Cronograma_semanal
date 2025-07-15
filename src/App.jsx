import { useState, useEffect, useRef } from 'react';
import { Trash2, Eraser, Calendar, X, Star, Settings } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import DayColumn from './components/DayColumn';
import ConfirmationModal from './components/ConfirmationModal';
import CalendarSidebar from './components/CalendarSidebar';
import SettingsMenu from './components/SettingsMenu';

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasksByDate, setTasksByDate] = useState(() => {
    try {
      const savedTasks = localStorage.getItem('monthlyPlannerTasks');
      return savedTasks ? JSON.parse(savedTasks) : {};
    } catch (error) {
      console.error("Could not parse localStorage tasks:", error);
      return {};
    }
  });

  const [showResetModal, setShowResetModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);
  const [isMobileCalendarOpen, setIsMobileCalendarOpen] = useState(false);
  
  // Novos estados
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsMenuRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('monthlyPlannerTasks', JSON.stringify(tasksByDate));
  }, [tasksByDate]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Fecha o menu de configurações se clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsMenuRef]);

  const handleMonthChange = (amount) => {
    setCurrentDate(prev => addMonths(prev, amount));
  };

  const handleDragStart = (e) => {
    setDraggingTaskId(e.target.id);
    e.dataTransfer.setData("taskId", e.target.id);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverDate(null);
  };

  const moveTask = (taskId, sourceDateStr, targetDateStr, targetTaskIndex = -1) => {
    if (sourceDateStr === targetDateStr && targetTaskIndex === -1) return;

    setTasksByDate(prev => {
      const newTasks = JSON.parse(JSON.stringify(prev));
      const sourceTasks = newTasks[sourceDateStr] || [];
      const taskIndex = sourceTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prev;

      const [draggedTask] = sourceTasks.splice(taskIndex, 1);
      if (!newTasks[targetDateStr]) {
        newTasks[targetDateStr] = [];
      }
      
      if (targetTaskIndex !== -1) {
        newTasks[targetDateStr].splice(targetTaskIndex, 0, draggedTask);
      } else {
        newTasks[targetDateStr].push(draggedTask);
      }

      if (newTasks[sourceDateStr].length === 0) {
        delete newTasks[sourceDateStr];
      }
      
      return newTasks;
    });
  };

  const handleDropOnDate = (e, targetDate) => {
    e.preventDefault();
    e.stopPropagation();
    const taskId = e.dataTransfer.getData("taskId");
    const sourceDateStr = findTaskDate(taskId);
    if (!sourceDateStr) return;

    const targetDateStr = format(targetDate, 'yyyy-MM-dd');
    moveTask(taskId, sourceDateStr, targetDateStr);
    setSelectedDate(targetDate);
    handleDragEnd();
  };

  const handleDropOnColumn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const taskId = e.dataTransfer.getData("taskId");
    const sourceDateStr = findTaskDate(taskId);
    if (!sourceDateStr) return;

    const targetColumnEl = e.target.closest('.bg-slate-100\\/70, .dark\\:bg-slate-800\\/50');
    if (!targetColumnEl) return;
    const targetDateStr = targetColumnEl.id;
    
    const targetTaskEl = e.target.closest('.cursor-grab');
    const targetTaskId = targetTaskEl ? targetTaskEl.id : null;

    let targetIndex = -1;
    if (targetTaskId && tasksByDate[targetDateStr]) {
        targetIndex = tasksByDate[targetDateStr].findIndex(t => t.id === targetTaskId);
    }
    
    moveTask(taskId, sourceDateStr, targetDateStr, targetIndex);
    handleDragEnd();
  };
  
  const findTaskDate = (taskId) => {
    for (const date in tasksByDate) {
      if (tasksByDate[date].some(t => t.id === taskId)) {
        return date;
      }
    }
    return null;
  };

  const handleAddTask = (date, content, isUrgent = false) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const newTaskId = `task-${new Date().getTime()}`;
    const newTask = { id: newTaskId, content, isUrgent };
    setTasksByDate(prev => ({
      ...prev,
      [dateStr]: [...(prev[dateStr] || []), newTask]
    }));
  };

  const handleDeleteTask = (date, taskId) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setTasksByDate(prev => {
      const newTasks = { ...prev };
      newTasks[dateStr] = newTasks[dateStr].filter(task => task.id !== taskId);
      if (newTasks[dateStr].length === 0) {
        delete newTasks[dateStr];
      }
      return newTasks;
    });
  };

  const handleToggleUrgent = (date, taskId) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setTasksByDate(prev => {
      const newTasks = { ...prev };
      if (!newTasks[dateStr]) return prev;

      newTasks[dateStr] = newTasks[dateStr].map(task => 
        task.id === taskId ? { ...task, isUrgent: !task.isUrgent } : task
      );
      return newTasks;
    });
  };

  const handleClearDayConfirm = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    setTasksByDate(prev => {
      const newTasks = { ...prev };
      delete newTasks[dateStr];
      return newTasks;
    });
    setShowClearModal(false);
  };
  
  const handleResetAllConfirm = () => {
    setTasksByDate({});
    setShowResetModal(false);
  };

  const handleDateSelectAndClose = (date) => {
    setSelectedDate(date);
    setIsMobileCalendarOpen(false);
  };

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    setIsSettingsOpen(false);
  };

  const handleAuthAction = () => {
    setIsLoggedIn(prev => !prev);
    setIsSettingsOpen(false);
  };

  return (
    <>
      {showClearModal && <ConfirmationModal message="Tem certeza que deseja limpar as tarefas deste dia?" onConfirm={handleClearDayConfirm} onCancel={() => setShowClearModal(false)} />}
      {showResetModal && <ConfirmationModal message="Tem certeza que deseja apagar TODAS as tarefas do cronograma? Esta ação não pode ser desfeita." onConfirm={handleResetAllConfirm} onCancel={() => setShowResetModal(false)} />}
      
      <div className="h-screen w-full font-sans text-gray-900 bg-gradient-to-br from-sky-50 to-slate-200 dark:from-slate-900 dark:to-slate-800 dark:text-slate-200 flex flex-col">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 z-10 border-b dark:border-slate-700 shrink-0">
          <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center gap-2 sm:gap-4">
                <button 
                  onClick={() => setIsMobileCalendarOpen(true)}
                  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 lg:hidden"
                  aria-label="Abrir calendário"
                >
                  <Calendar className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Planner Tasks</h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={() => setShowClearModal(true)} className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 active:bg-amber-700 transition-all duration-200 flex items-center gap-2 transform hover:scale-105">
                    <Eraser className="h-4 w-4" />
                    <span className="hidden sm:inline">Limpar Dia</span>
                </button>
                <button onClick={() => setShowResetModal(true)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 active:bg-red-700 transition-all duration-200 flex items-center gap-2 transform hover:scale-105">
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Resetar Tudo</span>
                </button>
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
          <div className="hidden lg:flex lg:flex-shrink-0">
            <CalendarSidebar
              currentDate={currentDate}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onMonthChange={handleMonthChange}
              tasksByDate={tasksByDate}
              onDropOnDate={handleDropOnDate}
              dragOverDate={dragOverDate}
              onDragEnterDate={setDragOverDate}
              onDragLeaveDate={() => setDragOverDate(null)}
            />
          </div>

          {isMobileCalendarOpen && (
            <div className="fixed inset-0 z-30 lg:hidden animate-fade-in">
              <div 
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setIsMobileCalendarOpen(false)}
              ></div>
              <div className="relative bg-slate-50 dark:bg-slate-900 h-full w-full max-w-xs flex flex-col shadow-xl">
                <div className="p-2 flex justify-end">
                  <button onClick={() => setIsMobileCalendarOpen(false)} className="p-2 -mr-2 -mt-2">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex-1">
                  <CalendarSidebar
                    currentDate={currentDate}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelectAndClose}
                    onMonthChange={handleMonthChange}
                    tasksByDate={tasksByDate}
                    onDropOnDate={handleDropOnDate}
                    dragOverDate={dragOverDate}
                    onDragEnterDate={setDragOverDate}
                    onDragLeaveDate={() => setDragOverDate(null)}
                  />
                </div>
              </div>
            </div>
          )}

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            <DayColumn
              date={selectedDate}
              tasks={tasksByDate[format(selectedDate, 'yyyy-MM-dd')] || []}
              onDrop={handleDropOnColumn}
              onDragOver={(e) => e.preventDefault()}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDeleteTask={handleDeleteTask}
              onAddTask={handleAddTask}
              onToggleUrgent={handleToggleUrgent}
              draggingTaskId={draggingTaskId}
            />
          </main>
        </div>
        <footer className="text-center p-4 text-slate-500 dark:text-slate-400 text-sm shrink-0 border-t dark:border-slate-700 bg-slate-100/70 dark:bg-slate-900/50">
            <p>Desenvolvido por NordicManX com React (Vite) e Go. Arraste as tarefas para reorganizar.</p>
        </footer>
      </div>
    </>
  );
}

export default App;