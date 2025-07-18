import { useState, useEffect, useCallback } from 'react';
import { format, addMonths, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../services/api';
import DayColumn from '../components/DayColumn';
import CalendarSidebar from '../components/CalendarSidebar';
import ConfirmationModal from '../components/ConfirmationModal';
import { X } from 'lucide-react';

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

  const fetchTasks = useCallback(async (date) => {
    setIsLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await api.get(`/tasks/${dateStr}`);
      const tasksData = response.data || [];
      setTasks(tasksData);
      setTasksByDateCache(prev => ({ ...prev, [dateStr]: tasksData }));
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
  
  const findTaskDate = (taskId) => {
    // O ID do DOM é uma string, o ID da tarefa (ID) é um número
    const numericTaskId = parseInt(taskId, 10);
    for (const date in tasksByDateCache) {
      if (tasksByDateCache[date].some(t => t.ID === numericTaskId)) {
        return date;
      }
    }
    return null;
  };

  const handleDragStart = (e) => {
    setDraggingTaskId(e.target.id);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverDate(null);
  };

  const handleDropOnDate = async (e, targetDate) => {
    e.preventDefault();
    e.stopPropagation();
    const taskId = draggingTaskId;
    if (!taskId) return;

    const sourceDateStr = findTaskDate(taskId);
    const targetDateStr = format(targetDate, 'yyyy-MM-dd');
    
    if (!sourceDateStr || sourceDateStr === targetDateStr) {
        handleDragEnd();
        return;
    }

    // Atualização otimista da UI
    const numericTaskId = parseInt(taskId, 10);
    const taskToMove = tasksByDateCache[sourceDateStr]?.find(t => t.ID === numericTaskId);
    if (taskToMove) {
        setTasksByDateCache(prev => {
            const newCache = {...prev};
            // Remove da origem
            newCache[sourceDateStr] = newCache[sourceDateStr].filter(t => t.ID !== numericTaskId);
            // Adiciona ao destino
            newCache[targetDateStr] = [...(newCache[targetDateStr] || []), taskToMove];
            return newCache;
        });
    }


    try {
        await api.put(`/tasks/${taskId}/move`, { date: targetDateStr });
        toast.success('Tarefa movida com sucesso!');
        // Sincroniza o dia de origem (que agora tem menos uma tarefa)
        const sourceDate = parseISO(sourceDateStr);
        if (sourceDate.getTime() === selectedDate.getTime()) {
            fetchTasks(sourceDate);
        }
        setSelectedDate(targetDate); // Navega para o novo dia
    } catch (error) {
        toast.error('Falha ao mover a tarefa.');
        // Reverte a alteração otimista em caso de erro
        setTasksByDateCache(prev => {
            const newCache = {...prev};
            newCache[targetDateStr] = newCache[targetDateStr].filter(t => t.ID !== numericTaskId);
            newCache[sourceDateStr] = [...(newCache[sourceDateStr] || []), taskToMove];
            return newCache;
        });
    } finally {
        handleDragEnd();
    }
  };

  const handleAddTask = async (date, content, isUrgent) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    try {
      const response = await api.post('/tasks', { content, isUrgent, date: dateStr });
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
    const originalTasks = [...tasks];
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
      setTasks(originalTasks);
    }
  };

  const handleToggleUrgent = async (date, taskId) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const originalTasks = [...tasks];
    setTasks(prev => prev.map(task => 
        task.ID === taskId ? { ...task, IsUrgent: !task.IsUrgent } : task
    ));

    try {
      const response = await api.put(`/tasks/${taskId}/toggle-urgent`);
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
      setTasks(originalTasks);
    }
  };

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
                  onDateSelect={(date) => {
                    setSelectedDate(date);
                    setIsMobileCalendarOpen(false);
                  }}
                  onMonthChange={setCurrentDate}
                  tasksByDate={tasksByDateCache}
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
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              // A reordenação vertical ainda não está ligada à API
            />
          )}
        </main>
      </div>
    </>
  );
};

export default PlannerPage;