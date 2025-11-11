import React, { useState, useEffect } from 'react';
import { Task, ChecklistItem, DailyStandup, TaskPriority } from '../types';
import { XMarkIcon, TrashIcon, PlusIcon } from './icons';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityOptions: { value: TaskPriority; label: string; color: string, ring: string }[] = [
    { value: 'low', label: 'Low', color: 'bg-sky-500', ring: 'ring-sky-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500', ring: 'ring-yellow-500' },
    { value: 'high', label: 'High', color: 'bg-red-500', ring: 'ring-red-500' },
];

const InputField = ({ name, value, onChange, placeholder, label }: { name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string, label: string }) => (
    <div>
        <label className="text-sm font-medium text-amber-100/80">{label}</label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-300 focus:ring-purple-500 focus:border-purple-500"
        />
    </div>
);

const TextareaField = ({ name, value, onChange, placeholder, label }: { name: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, placeholder: string, label: string }) => (
    <div>
        <label className="text-sm font-medium text-amber-100/80">{label}</label>
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={2}
            className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-300 focus:ring-purple-500 focus:border-purple-500"
        />
    </div>
);


const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSave, onDelete }) => {
  const [editedTask, setEditedTask] = useState<Task | null>(task);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newStandup, setNewStandup] = useState({ yesterday: '', today: '', blockers: '' });

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  if (!editedTask) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedTask(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTask(prev => prev ? { ...prev, dueDate: e.target.value || null } : null);
  };

  const handleChecklistChange = (id: string) => {
    const updatedChecklist = editedTask.definitionOfDone.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setEditedTask(prev => prev ? { ...prev, definitionOfDone: updatedChecklist } : null);
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim() === '') return;
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newChecklistItem,
      completed: false
    };
    setEditedTask(prev => prev ? { ...prev, definitionOfDone: [...prev.definitionOfDone, newItem] } : null);
    setNewChecklistItem('');
  };

  const deleteChecklistItem = (id: string) => {
    const updatedChecklist = editedTask.definitionOfDone.filter(item => item.id !== id);
    setEditedTask(prev => prev ? { ...prev, definitionOfDone: updatedChecklist } : null);
  };
  
  const addStandup = () => {
    if (newStandup.today.trim() === '') return;
    const standup: DailyStandup = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      ...newStandup
    };
    setEditedTask(prev => prev ? { ...prev, dailyStandups: [standup, ...prev.dailyStandups] } : null);
    setNewStandup({ yesterday: '', today: '', blockers: '' });
  };
  
  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
    }
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to banish this goal forever?')) {
        onDelete(editedTask.id);
        onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl shadow-purple-950/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            name="title"
            value={editedTask.title}
            onChange={handleInputChange}
            placeholder="Goal Title"
            className="bg-transparent text-2xl font-bold text-amber-50 w-full border-0 focus:ring-0 p-0"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XMarkIcon />
          </button>
        </div>

        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Priority */}
                <div>
                    <label className="text-sm font-medium text-amber-100/80 mb-2 block">Priority</label>
                    <div className="flex gap-3">
                        {priorityOptions.map(({value, label, color, ring}) => (
                            <button
                                key={value}
                                onClick={() => setEditedTask(prev => prev ? { ...prev, priority: value } : null)}
                                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all border border-transparent ${
                                    editedTask.priority === value
                                        ? `ring-2 ${ring} text-white`
                                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                                }`}
                            >
                                <span className={`w-3 h-3 rounded-full ${color}`}></span>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                 {/* Due Date */}
                <div>
                    <label htmlFor="dueDate" className="text-sm font-medium text-amber-100/80 mb-2 block">Due Date</label>
                    <input
                        type="date"
                        id="dueDate"
                        value={editedTask.dueDate || ''}
                        onChange={handleDateChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-300 focus:ring-purple-500 focus:border-purple-500"
                        style={{ colorScheme: 'dark' }}
                    />
                </div>
            </div>

          {/* User Story Section */}
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <h3 className="text-lg font-bold font-serif text-purple-300 mb-3">Magical User Story</h3>
            <div className="space-y-4">
              <InputField name="role" value={editedTask.role} onChange={handleInputChange} placeholder="e.g., Witch, Student of the Occult" label="As a..." />
              <TextareaField name="action" value={editedTask.action} onChange={handleInputChange} placeholder="e.g., research planetary hours for Jupiter" label="I want to..." />
              <TextareaField name="goal" value={editedTask.goal} onChange={handleInputChange} placeholder="e.g., find the best time for my prosperity spell" label="So that I can..." />
            </div>
          </div>

          {/* Definition of Done */}
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <h3 className="text-lg font-bold font-serif text-purple-300 mb-3">Definition of Done</h3>
            <div className="space-y-2">
              {editedTask.definitionOfDone.map(item => (
                <div key={item.id} className="flex items-center group">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleChecklistChange(item.id)}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-600 ring-offset-gray-800 focus:ring-2"
                  />
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                        const newText = e.target.value;
                        const updatedChecklist = editedTask.definitionOfDone.map(i =>
                            i.id === item.id ? { ...i, text: newText } : i
                        );
                        setEditedTask(prev => prev ? { ...prev, definitionOfDone: updatedChecklist } : null);
                    }}
                    className={`ml-3 bg-transparent w-full text-slate-300 focus:outline-none focus:ring-0 focus:border-b focus:border-purple-500 ${item.completed ? 'line-through text-slate-500' : ''}`}
                   />
                  <button onClick={() => deleteChecklistItem(item.id)} className="ml-auto text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center mt-4">
              <input
                type="text"
                value={newChecklistItem}
                onChange={e => setNewChecklistItem(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addChecklistItem()}
                placeholder="Add a completion step..."
                className="flex-grow bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-300 focus:ring-purple-500 focus:border-purple-500"
              />
              <button onClick={addChecklistItem} className="ml-2 p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
           {/* Daily Standup */}
           {editedTask.status === 'sprint' &&
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <h3 className="text-lg font-bold font-serif text-purple-300 mb-3">Daily Stand-Up</h3>
                <div className="space-y-3">
                    <TextareaField name="yesterday" value={newStandup.yesterday} onChange={e => setNewStandup({...newStandup, yesterday: e.target.value})} placeholder="e.g., I bought the green candles." label="What did I do yesterday?" />
                    <TextareaField name="today" value={newStandup.today} onChange={e => setNewStandup({...newStandup, today: e.target.value})} placeholder="e.g., Tonight, I will write out my petition." label="What will I do today?" />
                    <TextareaField name="blockers" value={newStandup.blockers} onChange={e => setNewStandup({...newStandup, blockers: e.target.value})} placeholder="e.g., I feel drained and unmotivated." label="What's blocking me?" />
                </div>
                <button onClick={addStandup} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 w-full">Log Check-in</button>

                <div className="mt-4 max-h-40 overflow-y-auto">
                    {editedTask.dailyStandups.map(s => (
                        <div key={s.id} className="text-sm p-3 border-b border-slate-700">
                            <p className="font-semibold text-amber-200">{s.date}</p>
                            <p><strong className="text-slate-400">Yesterday:</strong> {s.yesterday}</p>
                            <p><strong className="text-slate-400">Today:</strong> {s.today}</p>
                            <p><strong className="text-slate-400">Blockers:</strong> {s.blockers}</p>
                        </div>
                    ))}
                </div>
            </div>
           }
        </div>

        <div className="flex justify-between items-center mt-8">
            <button onClick={handleDelete} className="text-red-500 hover:text-red-400 p-2 rounded-md flex items-center">
                <TrashIcon className="w-5 h-5 mr-1" /> Banish Goal
            </button>
            <button onClick={handleSave} className="px-6 py-2 bg-amber-500 text-slate-900 font-bold rounded-md hover:bg-amber-400 transition-colors">
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;