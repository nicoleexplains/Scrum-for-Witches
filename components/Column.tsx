
import React from 'react';
import { Task } from '../types';
import TaskCard from './TaskCard';

interface ColumnProps {
  title: string;
  tasks: Task[];
  status: 'backlog' | 'sprint' | 'done';
  onTaskClick: (task: Task) => void;
  onDrop: (status: 'backlog' | 'sprint' | 'done') => void;
  children?: React.ReactNode;
}

const Column: React.FC<ColumnProps> = ({ title, tasks, status, onTaskClick, onDrop, children }) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDrop(status);
  };
    
  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl w-full md:w-1/3 p-4 flex flex-col"
    >
      <h3 className="text-xl font-bold font-serif text-center text-amber-200/80 mb-4 pb-2 border-b-2 border-slate-700">{title}</h3>
      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
      </div>
       {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default Column;
