import { useState, useEffect } from 'react';
import { format, addMonths } from 'date-fns';
import DayColumn from '../components/DayColumn';
import CalendarSidebar from '../components/CalendarSidebar';
import ConfirmationModal from '../components/ConfirmationModal';

const PlannerPage = () => {
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

  const [showClearModal, setShowClearModal] = useState(false);
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);
  const [isMobileCalendarOpen, setIsMobileCalendarOpen] = useState(false);

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
  
  const handleDateSelectAndClose = (date) => {
    setSelectedDate(date);
    setIsMobileCalendarOpen(false);
  };

  return (
    <>
      {showClearModal && <ConfirmationModal message="Tem certeza que deseja limpar as tarefas deste dia?" onConfirm={handleClearDayConfirm} onCancel={() => setShowClearModal(false)} />}
      
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
    </>
  );
};

export default PlannerPage;