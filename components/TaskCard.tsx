import React from 'react';
import { Task, TaskPriority } from '../types';
import { CalendarIcon } from './icons';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const priorityStyles: { [key in TaskPriority]: string } = {
    low: 'bg-sky-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
  };
    
  const completedChecks = task.definitionOfDone.filter(item => item.completed).length;
  const totalChecks = task.definitionOfDone.length;
  const progress = totalChecks > 0 ? (completedChecks / totalChecks) * 100 : 0;

  const isOverdue = () => {
      if (!task.dueDate) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // The date from the input is YYYY-MM-DD. new Date() will parse it as UTC midnight.
      // To avoid timezone issues, we add the current timezone offset.
      const dueDate = new Date(task.dueDate);
      const userTimezoneOffset = dueDate.getTimezoneOffset() * 60000;
      return new Date(dueDate.getTime() + userTimezoneOffset) < today;
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg p-4 mb-4 cursor-pointer hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
            <span className={`flex-shrink-0 w-3 h-3 rounded-full mt-1.5 ${priorityStyles[task.priority]}`} title={`Priority: ${task.priority}`}></span>
            <h4 className="font-bold text-lg text-amber-50 truncate">{task.title}</h4>
        </div>
        {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isOverdue() ? 'text-red-300 bg-red-900/50' : 'text-slate-300 bg-slate-700/50'}`}>
                <CalendarIcon className="w-3.5 h-3.5"/>
                <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
        )}
      </div>
      <p className="text-slate-400 text-sm mt-1 italic line-clamp-2 pl-6">
        As a {task.role || 'Witch'}, I want to {task.action || '...'} so that I can {task.goal || '...'}.
      </p>
      {task.status !== 'backlog' && totalChecks > 0 && (
         <div className="mt-4">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                <span>Definition of Done</span>
                <span>{completedChecks}/{totalChecks}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;