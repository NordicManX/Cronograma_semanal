import { useState, useEffect, useCallback } from 'react';
import { format, addMonths } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../services/api'; // Importa o nosso serviço de API
import DayColumn from '../components/DayColumn';
import CalendarSidebar from '../components/CalendarSidebar';
import ConfirmationModal from '../components/ConfirmationModal';

const PlannerPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [tasksByDateCache, setTasksByDateCache] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);
  const [isMobileCalendarOpen, setIsMobileCalendarOpen] = useState(false);

  // Função para buscar tarefas da API
  const fetchTasks = useCallback(async (date) => {
    setIsLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await api.get(`/tasks/${dateStr}`);
      setTasks(response.data || []); // Garante que tasks é sempre um array
      setTasksByDateCache(prev => ({ ...prev, [dateStr]: response.data || [] }));
    } catch (error) {
      toast.error('Falha ao buscar as tarefas.');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(selectedDate);
  }, [selectedDate, fetchTasks]);

  const handleAddTask = async (date, content, isUrgent) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    try {
      const response = await api.post('/tasks', { content, isUrgent, date: dateStr });
      // Se a tarefa foi adicionada no dia selecionado, atualiza o estado
      if (dateStr === format(selectedDate, 'yyyy-MM-dd')) {
        setTasks(prev => [...prev, response.data]);
      }
      toast.success('Tarefa criada com sucesso!');
      setTasksByDateCache(prev => ({ ...prev, [dateStr]: [...(prev[dateStr] || []), response.data] }));
    } catch (error) {
      toast.error('Falha ao criar a tarefa.');
    }
  };

  const handleDeleteTask = async (date, taskId) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    // Guarda as tarefas atuais para o caso de a chamada à API falhar
    const originalTasks = [...tasks];
    
    // Atualiza a UI otimisticamente para uma resposta mais rápida
    setTasks(prev => prev.filter(task => task.ID !== taskId));

    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Tarefa apagada!');
      setTasksByDateCache(prev => {
          const newCache = {...prev};
          if(newCache[dateStr]) {
              newCache[dateStr] = newCache[dateStr].filter(t => t.ID !== taskId);
          }
          return newCache;
      });
    } catch (error) {
      toast.error('Falha ao apagar a tarefa.');
      // Reverte a alteração se a API falhar
      setTasks(originalTasks);
    }
  };

  const handleToggleUrgent = async (date, taskId) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const originalTasks = [...tasks];

    // Atualiza a UI otimisticamente
    setTasks(prev => prev.map(task => 
        task.ID === taskId ? { ...task, IsUrgent: !task.IsUrgent } : task
    ));

    try {
      const response = await api.put(`/tasks/${taskId}/toggle-urgent`);
      // Sincroniza o estado com a resposta final da API
      setTasks(prev => prev.map(task => (task.ID === taskId ? response.data : task)));
      setTasksByDateCache(prev => {
          const newCache = {...prev};
          if(newCache[dateStr]) {
              newCache[dateStr] = newCache[dateStr].map(t => (t.ID === taskId ? response.data : t));
          }
          return newCache;
      });
    } catch (error) {
      toast.error('Falha ao atualizar a tarefa.');
      // Reverte a alteração se a API falhar
      setTasks(originalTasks);
    }
  };
  
  // A lógica de Drag-and-Drop e outras funções permanecem semelhantes
  // A sua implementação com a API será o próximo passo.

  return (
    <>
      {showClearModal && <ConfirmationModal message="Tem certeza que deseja limpar as tarefas deste dia?" onConfirm={() => {}} onCancel={() => setShowClearModal(false)} />}
      
      <div className="flex-1 flex flex-row overflow-hidden">
        <div className="hidden lg:flex lg:flex-shrink-0">
          <CalendarSidebar
            currentDate={currentDate}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onMonthChange={setCurrentDate}
            tasksByDate={tasksByDateCache}
            // ...outras props de drag-and-drop
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
                  onDateSelect={(date) => {
                    setSelectedDate(date);
                    setIsMobileCalendarOpen(false);
                  }}
                  onMonthChange={setCurrentDate}
                  tasksByDate={tasksByDateCache}
                  // ...outras props de drag-and-drop
                />
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500 dark:text-slate-400">A carregar tarefas...</p>
            </div>
          ) : (
            <DayColumn
              date={selectedDate}
              tasks={tasks}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onToggleUrgent={handleToggleUrgent}
              // ...outras props
            />
          )}
        </main>
      </div>
    </>
  );
};

export default PlannerPage;