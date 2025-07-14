import { useState } from 'react';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import { formatDayName } from '../data/constants';

const DayColumn = ({ day, tasks, onDrop, onDragOver, onDragStart, onDragEnd, onDeleteTask, onAddTask, draggingTaskId }) => {
  const [newTaskContent, setNewTaskContent] = useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskContent.trim()) {
      onAddTask(day, newTaskContent.trim());
      setNewTaskContent('');
    }
  };

  return (
    <div
      id={day}
      onDrop={onDrop}
      onDragOver={onDragOver}
      // ATUALIZADO: Classes responsivas para largura
      className="bg-slate-100/70 rounded-xl p-4 w-full lg:flex-1 lg:min-w-[300px] flex flex-col shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      <h2 className="text-xl font-bold text-slate-700 mb-5 text-center capitalize tracking-wide">{formatDayName(day)}</h2>
      <div className="flex-grow min-h-[100px]">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDelete={(taskId) => onDeleteTask(day, taskId)}
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