import { formatDayName } from '../data/constants';
import { CalendarDays } from 'lucide-react';

const DayNavigation = ({ days, selectedDay, setSelectedDay, onDropOnNav, dragOverDay, onDragEnterNav, onDragLeaveNav }) => {
  return (
    <nav className="w-64 bg-slate-100/70 p-6 border-r h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-slate-700 mb-5 flex items-center gap-2">
        <CalendarDays className="h-6 w-6" />
        Dias da Semana
      </h2>
      <ul className="flex flex-col gap-2">
        {days.map(day => {
          const isActive = selectedDay === day;
          const isDragOver = dragOverDay === day;

          const activeClasses = 'bg-blue-500 text-white shadow-md';
          const defaultClasses = 'bg-white/50 hover:bg-blue-100 hover:text-blue-700 text-slate-600';
          const dragOverClasses = isDragOver ? 'border-2 border-dashed border-blue-500 bg-blue-100/50' : 'border-2 border-transparent';

          return (
            <li 
              key={day}
              onDrop={(e) => onDropOnNav(e, day)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => onDragEnterNav(day)}
              onDragLeave={onDragLeaveNav}
              className={`rounded-lg ${dragOverClasses}`}
            >
              <button
                onClick={() => setSelectedDay(day)}
                className={`w-full text-left p-3 rounded-lg font-semibold transition-all duration-200 ${isActive ? activeClasses : defaultClasses}`}
              >
                {formatDayName(day)}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default DayNavigation;