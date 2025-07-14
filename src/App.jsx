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

  useEffect(() => {
    localStorage.setItem('weeklyPlannerTasks', JSON.stringify(tasksByDay));
  }, [tasksByDay]);

  const handleDragStart = (e) => {
    e.dataTransfer.setData("taskId", e.target.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // <<< INÍCIO DA LÓGICA ATUALIZADA >>>
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    // Encontra a coluna de destino
    const targetColumnEl = e.target.closest('.bg-gray-100\\/80');
    if (!targetColumnEl) return;
    const targetDay = targetColumnEl.id;

    // Encontra o dia de origem da tarefa
    let sourceDay;
    for (const day in tasksByDay) {
      if (tasksByDay[day].some(t => t.id === taskId)) {
        sourceDay = day;
        break;
      }
    }
    if (!sourceDay) return;

    // Pega o objeto da tarefa que está a ser arrastada
    const draggedTask = tasksByDay[sourceDay].find(t => t.id === taskId);
    if (!draggedTask) return;

    // Encontra a tarefa de destino (sobre a qual soltámos) para saber a posição
    const targetTaskEl = e.target.closest('.cursor-grab');
    const targetTaskId = targetTaskEl ? targetTaskEl.id : null;

    // Evita soltar uma tarefa sobre ela mesma
    if (taskId === targetTaskId) {
      return;
    }

    // Atualiza o estado de forma imutável
    setTasksByDay(prev => {
      // Cria uma cópia profunda para evitar mutações inesperadas
      const newTasksByDay = JSON.parse(JSON.stringify(prev));

      // 1. Remove a tarefa da sua posição original
      const sourceTasks = newTasksByDay[sourceDay];
      const taskIndex = sourceTasks.findIndex(t => t.id === taskId);
      sourceTasks.splice(taskIndex, 1);

      // 2. Encontra o ponto de inserção correto na lista do dia de destino
      const targetTasks = newTasksByDay[targetDay];
      let insertAtIndex = targetTasks.length; // Padrão: insere no final

      if (targetTaskId) {
        const dropTargetIndex = targetTasks.findIndex(t => t.id === targetTaskId);
        if (dropTargetIndex !== -1) {
          insertAtIndex = dropTargetIndex; // Insere antes da tarefa de destino
        }
      }
      
      // 3. Insere a tarefa arrastada na nova posição
      targetTasks.splice(insertAtIndex, 0, draggedTask);

      return newTasksByDay;
    });
  };
  // <<< FIM DA LÓGICA ATUALIZADA >>>

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
      <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
        <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
          <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-3xl font-bold text-blue-600">Meu Cronograma Semanal</h1>
              <button 
                  onClick={() => setShowResetModal(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                  <Trash2 className="h-4 w-4" />
                  Resetar
              </button>
          </div>
        </header>
        
        <main className="p-4 sm:p-6 md:p-8">
          <div className="flex gap-6 overflow-x-auto pb-4">
            {daysOfWeek.map(day => (
              <DayColumn
                key={day}
                day={day}
                tasks={tasksByDay[day] || []}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragStart={handleDragStart}
                onDeleteTask={handleDeleteTask}
                onAddTask={handleAddTask}
              />
            ))}
          </div>
        </main>
        <footer className="text-center p-4 text-gray-500 text-sm">
          <p>Desenvolvido por NordicManX, com React (Vite) e Go. Arraste as tarefas para reorganizar.</p>
        </footer>
      </div>
    </>
  );
}

export default App;