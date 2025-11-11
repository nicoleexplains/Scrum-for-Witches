
import React from 'react';
import { Task } from '../types';
import { MoonIcon } from './icons';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
  };
    
  const completedChecks = task.definitionOfDone.filter(item => item.completed).length;
  const totalChecks = task.definitionOfDone.length;
  const progress = totalChecks > 0 ? (completedChecks / totalChecks) * 100 : 0;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg p-4 mb-4 cursor-pointer hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
    >
      <h4 className="font-bold text-lg text-amber-50">{task.title}</h4>
      <p className="text-slate-400 text-sm mt-1 italic line-clamp-2">
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
