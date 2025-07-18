import { useState } from 'react';
import { Plus, ClipboardPaste } from 'lucide-react';
import TaskCard from './TaskCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DayColumn = ({ date, tasks, onDrop, onDragOver, onDragStart, onDragEnd, onDeleteTask, onAddTask, onToggleUrgent, draggingTaskId, selectedTaskIdForMove, onSelectForMove, onPasteTask }) => {
  const [newTaskContent, setNewTaskContent] = useState('');
  const [isNewTaskUrgent, setIsNewTaskUrgent] = useState(false);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskContent.trim()) {
      onAddTask(date, newTaskContent.trim(), isNewTaskUrgent);
      setNewTaskContent('');
      setIsNewTaskUrgent(false);
    }
  };

  const formattedTitle = format(date, "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div
      id={format(date, 'yyyy-MM-dd')}
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="bg-slate-100/70 dark:bg-slate-800/50 rounded-xl p-4 w-full flex-1 flex flex-col shadow-sm"
    >
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 text-center capitalize tracking-wide flex-1">{formattedTitle}</h2>
        {/* Botão "Colar" que aparece quando uma tarefa está selecionada */}
        {selectedTaskIdForMove && (
          <button
            onClick={() => onPasteTask(date)}
            className="flex items-center gap-2 text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors animate-fade-in lg:hidden"
          >
            <ClipboardPaste className="h-4 w-4" />
            Colar
          </button>
        )}
      </div>
      <div className="flex-grow min-h-[100px]">
        {tasks.map(task => (
          <TaskCard 
            key={task.ID} 
            task={task} 
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDelete={(taskId) => onDeleteTask(date, taskId)}
            onToggleUrgent={(taskId) => onToggleUrgent(date, taskId)}
            isDragging={draggingTaskId === String(task.ID)}
            onSelectForMove={onSelectForMove}
            isSelectedForMove={selectedTaskIdForMove === task.ID}
          />
        ))}
        {tasks.length === 0 && (
            <div className="text-center text-slate-400 dark:text-slate-500 p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg h-full flex items-center justify-center">
                <span>Nenhuma tarefa.</span>
            </div>
        )}
      </div>
      <form onSubmit={handleAddTask} className="mt-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            placeholder="Nova tarefa..."
            className="flex-grow p-2 rounded-md border bg-white dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors transform hover:scale-105" aria-label="Adicionar tarefa">
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer self-start">
          <input
            type="checkbox"
            checked={isNewTaskUrgent}
            onChange={(e) => setIsNewTaskUrgent(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-blue-600 focus:ring-blue-500"
          />
          Marcar como urgente
        </label>
      </form>
    </div>
  );
};

export default DayColumn;