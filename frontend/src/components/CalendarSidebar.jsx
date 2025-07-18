import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, getDaysInMonth, startOfMonth, getDay, isSameDay, isToday, eachDayOfInterval, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { WEEKDAYS_SHORT } from '../data/constants';

const CalendarSidebar = ({ currentDate, selectedDate, onDateSelect, onMonthChange, tasksByDate, onDropOnDate, dragOverDate, onDragEnterDate, onDragLeaveDate }) => {
  const monthStart = startOfMonth(currentDate);
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfWeek = getDay(monthStart);

  const days = eachDayOfInterval({
    start: monthStart,
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), daysInMonth),
  });

  const handleMonthNav = (amount) => {
    onMonthChange(addMonths(currentDate, amount));
  };

  return (
    <nav className="w-full bg-transparent p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => handleMonthNav(-1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <button onClick={() => handleMonthNav(1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-slate-500 dark:text-slate-400">
        {WEEKDAYS_SHORT.map(day => <div key={day}>{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1 mt-2 flex-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dateTasks = tasksByDate[dateStr] || [];
          const hasTasks = dateTasks.length > 0;
          const hasUrgentTasks = dateTasks.some(task => task.isUrgent);
          
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentToday = isToday(day);
          const isDragOver = dragOverDate && isSameDay(day, dragOverDate);

          let dayClasses = 'p-2 rounded-full flex items-center justify-center relative cursor-pointer transition-colors ';
          if (isSelected) {
            dayClasses += 'bg-blue-500 text-white font-bold';
          } else if (isCurrentToday) {
            dayClasses += 'bg-sky-200 dark:bg-sky-800/50 text-sky-800 dark:text-sky-200 font-bold';
          } else {
            dayClasses += 'hover:bg-slate-200 dark:hover:bg-slate-700';
          }
          if (isDragOver) {
            dayClasses += ' border-2 border-dashed border-blue-500';
          }

          return (
            <div
              key={dateStr}
              onClick={() => onDateSelect(day)}
              onDrop={(e) => onDropOnDate(e, day)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => onDragEnterDate(day)}
              onDragLeave={onDragLeaveDate}
              className={dayClasses}
            >
              <span>{format(day, 'd')}</span>
              {hasTasks && (
                <div className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${hasUrgentTasks ? 'bg-red-500' : 'bg-green-500'}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default CalendarSidebar;