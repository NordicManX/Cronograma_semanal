import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { initialData, daysOfWeek } from './data/constants';
import DayColumn from './components/DayColumn';
import ConfirmationModal from './components/ConfirmationModal';

function App() {
  const [tasksByDay, setTasksByDay] = useState(() => {
    try {
      const savedTasks = localStorage.getItem('weeklyPlannerTasks');
      return savedTasks ? JSON.parse(savedTasks) : initialData;
    } catch (error) {
      console.error("Could not parse localStorage tasks:", error);
      return initialData;
    }
  });

  const [showResetModal, setShowResetModal] = useState(false);
  const [draggingTaskId, setDraggingTaskId] = useState(null);

  useEffect(() => {
    localStorage.setItem('weeklyPlannerTasks', JSON.stringify(tasksByDay));
  }, [tasksByDay]);

  const handleDragStart = (e) => {
    setDraggingTaskId(e.target.id);
    e.dataTransfer.setData("taskId", e.target.id);
  };
  
  const handleDragEnd = () => {
    setDraggingTaskId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    const targetColumnEl = e.target.closest('.bg-slate-100\\/70');
    if (!targetColumnEl) return;
    const targetDay = targetColumnEl.id;

    let sourceDay;
    for (const day in tasksByDay) {
      if (tasksByDay[day].some(t => t.id === taskId)) {
        sourceDay = day;
        break;
      }
    }
    if (!sourceDay) return;

    const draggedTask = tasksByDay[sourceDay].find(t => t.id === taskId);
    if (!draggedTask) return;

    const targetTaskEl = e.target.closest('.cursor-grab');
    const targetTaskId = targetTaskEl ? targetTaskEl.id : null;

    if (taskId === targetTaskId) return;

    setTasksByDay(prev => {
      const newTasksByDay = JSON.parse(JSON.stringify(prev));
      const sourceTasks = newTasksByDay[sourceDay];
      const taskIndex = sourceTasks.findIndex(t => t.id === taskId);
      sourceTasks.splice(taskIndex, 1);
      const targetTasks = newTasksByDay[targetDay];
      let insertAtIndex = targetTasks.length;
      if (targetTaskId) {
        const dropTargetIndex = targetTasks.findIndex(t => t.id === targetTaskId);
        if (dropTargetIndex !== -1) {
          insertAtIndex = dropTargetIndex;
        }
      }
      targetTasks.splice(insertAtIndex, 0, draggedTask);
      return newTasksByDay;
    });
  };

  const handleAddTask = (day, content) => {
    const newTaskId = `task-${new Date().getTime()}`;
    const newTask = { id: newTaskId, content };
    setTasksByDay(prev => ({
      ...prev,
      [day]: [...prev[day], newTask]
    }));
  };

  const handleDeleteTask = (day, taskId) => {
     setTasksByDay(prev => ({
      ...prev,
      [day]: prev[day].filter(task => task.id !== taskId)
    }));
  };

  const handleResetConfirm = () => {
    setTasksByDay(initialData);
    localStorage.setItem('weeklyPlannerTasks', JSON.stringify(initialData));
    setShowResetModal(false);
  }

  return (
    <>
      {showResetModal && (
        <ConfirmationModal 
            message="Tem certeza que deseja resetar o cronograma para o estado inicial? Esta ação não pode ser desfeita."
            onConfirm={handleResetConfirm}
            onCancel={() => setShowResetModal(false)}
        />
      )}
      <div className="min-h-screen w-full font-sans text-gray-900 bg-gradient-to-br from-sky-50 via-slate-50 to-slate-200">
        <header className="bg-white/80 backdrop-blur-md p-4 sticky top-0 z-10 border-b">
          <div className="container mx-auto flex justify-between items-center">
              {/* ATUALIZADO: Tamanho do título responsivo */}
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Meu Cronograma Semanal</h1>
              <button 
                  onClick={() => setShowResetModal(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 active:bg-red-700 transition-all duration-200 flex items-center gap-2 transform hover:scale-105"
              >
                  <Trash2 className="h-4 w-4" />
                  {/* ATUALIZADO: Esconde o texto em ecrãs muito pequenos */}
                  <span className="hidden sm:inline">Resetar</span>
              </button>
          </div>
        </header>
        
        <main className="p-4 sm:p-6 md:p-8">
          {/* ATUALIZADO: Layout de colunas responsivo */}
          <div className="flex flex-col lg:flex-row gap-6 lg:overflow-x-auto lg:pb-4">
            {daysOfWeek.map(day => (
              <DayColumn
                key={day}
                day={day}
                tasks={tasksByDay[day] || []}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDeleteTask={handleDeleteTask}
                onAddTask={handleAddTask}
                draggingTaskId={draggingTaskId}
              />
            ))}
          </div>
        </main>
        <footer className="text-center p-4 text-slate-500 text-sm">
          <p>Desenvolvido com React (Vite) e Go. Arraste as tarefas para reorganizar.</p>
        </footer>
      </div>
    </>
  );
}

export default App;