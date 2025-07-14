import { useState } from 'react';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import { formatDayName } from '../data/constants';

const DayColumn = ({ day, tasks, onDrop, onDragOver, onDragStart, onDeleteTask, onAddTask }) => {
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
      className="bg-gray-100/80 rounded-xl p-4 flex-1 min-w-[280px] flex flex-col"
    >
      <h2 className="text-xl font-bold text-gray-700 mb-4 text-center capitalize">{formatDayName(day)}</h2>
      <div className="flex-grow min-h-[100px]">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onDragStart={onDragStart} onDelete={(taskId) => onDeleteTask(day, taskId)} />
        ))}
        {tasks.length === 0 && (
            <div className="text-center text-gray-400 p-4 border-2 border-dashed border-gray-300 rounded-lg h-full flex items-center justify-center">
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
          className="flex-grow p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors" aria-label="Adicionar tarefa">
          <Plus className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default DayColumn;