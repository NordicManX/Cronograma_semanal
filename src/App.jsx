import { useState, useEffect } from 'react';
import { Trash2, Eraser } from 'lucide-react';
import { format, addMonths, parseISO } from 'date-fns';
import DayColumn from './components/DayColumn';
import ConfirmationModal from './components/ConfirmationModal';
import CalendarSidebar from './components/CalendarSidebar';

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

  useEffect(() => {
    localStorage.setItem('monthlyPlannerTasks', JSON.stringify(tasksByDate));
  }, [tasksByDate]);

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

      // Limpa o array do dia de origem se ficar vazio
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

    const targetColumnEl = e.target.closest('.bg-slate-100\\/70');
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

  const handleAddTask = (date, content) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const newTaskId = `task-${new Date().getTime()}`;
    const newTask = { id: newTaskId, content };
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

  const handleClearConfirm = () => {
    setTasksByDate({});
    setShowClearModal(false);
  };
  
  const handleResetConfirm = () => {
    // A função de reset agora apenas limpa o cronograma
    setTasksByDate({});
    setShowResetModal(false);
  };

  return (
    <>
      {showClearModal && <ConfirmationModal message="Tem certeza que deseja limpar todas as tarefas?" onConfirm={handleClearConfirm} onCancel={() => setShowClearModal(false)} />}
      {showResetModal && <ConfirmationModal message="Tem certeza que deseja resetar o cronograma para um estado vazio?" onConfirm={handleResetConfirm} onCancel={() => setShowResetModal(false)} />}
      
      <div className="h-screen w-full font-sans text-gray-900 bg-gradient-to-br from-sky-50 via-slate-50 to-slate-200 flex flex-col">
        <header className="bg-white/80 backdrop-blur-md p-4 z-10 border-b shrink-0">
          <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Meu Cronograma Mensal</h1>
              <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={() => setShowClearModal(true)} className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 active:bg-amber-700 transition-all duration-200 flex items-center gap-2 transform hover:scale-105">
                    <Eraser className="h-4 w-4" />
                    <span className="hidden sm:inline">Limpar</span>
                </button>
                <button onClick={() => setShowResetModal(true)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 active:bg-red-700 transition-all duration-200 flex items-center gap-2 transform hover:scale-105">
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Resetar</span>
                </button>
              </div>
          </div>
        </header>
        
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
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
              draggingTaskId={draggingTaskId}
            />
          </main>
        </div>
      </div>
    </>
  );
}

export default App;