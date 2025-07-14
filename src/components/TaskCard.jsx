import { Trash2, GripVertical } from 'lucide-react';

const TaskCard = ({ task, onDragStart, onDragEnd, onDelete, isDragging }) => {

  const draggingStyles = isDragging ? 'opacity-50 rotate-2 shadow-lg' : 'hover:scale-105 hover:shadow-md';

  return (
    <div
      id={task.id}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd} 
      
      className={`bg-white p-3 mb-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing flex justify-between items-center group transition-all duration-300 ease-in-out ${draggingStyles}`}
    >
      <div className="flex items-center">
        <GripVertical className="h-5 w-5 text-gray-300 mr-2 group-hover:text-gray-500 transition-colors" />
        <span className="font-medium text-gray-800">{task.content}</span>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Deletar tarefa"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default TaskCard;