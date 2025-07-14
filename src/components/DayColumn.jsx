import { useState } from 'react';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DayColumn = ({ date, tasks, onDrop, onDragOver, onDragStart, onDragEnd, onDeleteTask, onAddTask, draggingTaskId }) => {
  const [newTaskContent, setNewTaskContent] = useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskContent.trim()) {
      onAddTask(date, newTaskContent.trim());
      setNewTaskContent('');
    }
  };

  // Formata a data para o título, ex: "Segunda-Feira, 14 de Julho"
  const formattedTitle = format(date, "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div
      id={format(date, 'yyyy-MM-dd')}
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="bg-slate-100/70 rounded-xl p-4 w-full flex-1 flex flex-col shadow-sm"
    >
      <h2 className="text-xl font-bold text-slate-700 mb-5 text-center capitalize tracking-wide">{formattedTitle}</h2>
      <div className="flex-grow min-h-[100px]">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDelete={(taskId) => onDeleteTask(date, taskId)}
            isDragging={draggingTaskId === task.id}
          />
        ))}
        {tasks.length === 0 && (
            <div className="text-center text-slate-400 p-4 border-2 border-dashed border-slate-300 rounded-lg h-full flex items-center justify-center">
                <span>Nenhuma tarefa.</span>
            </div>
        )}
      </div>
      <form onSubmit={handleAddTask} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={newTaskContent}
          onChange={(e) => setNewTaskContent(e.target.value)}
          placeholder="Nova tarefa..."
          className="flex-grow p-2 rounded-md border bg-white border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors transform hover:scale-105" aria-label="Adicionar tarefa">
          <Plus className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default DayColumn;