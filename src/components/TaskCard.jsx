import { Trash2, GripVertical, Star } from 'lucide-react';

const TaskCard = ({ task, onDragStart, onDragEnd, onDelete, onToggleUrgent, isDragging }) => {
  const draggingStyles = isDragging ? 'opacity-50 rotate-2 shadow-lg' : 'hover:scale-105 hover:shadow-md';
  const urgentStyles = task.isUrgent ? 'border-l-4 border-red-500' : 'border-l-4 border-transparent';

  return (
    <div
      id={task.id}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`bg-white dark:bg-slate-800 p-3 mb-3 rounded-lg shadow-sm flex justify-between items-center group transition-all duration-300 ease-in-out ${draggingStyles} ${urgentStyles}`}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-5 w-5 text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400 transition-colors" />
        <span className="font-medium text-gray-800 dark:text-slate-200">{task.content}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleUrgent(task.id)}
          className="text-gray-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Marcar como urgente"
        >
          <Star className={`h-4 w-4 ${task.isUrgent ? 'fill-amber-400 text-amber-500' : ''}`} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Deletar tarefa"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;