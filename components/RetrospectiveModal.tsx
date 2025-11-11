import React, { useState } from 'react';
import { Sprint } from '../types';
import { XMarkIcon } from './icons';

interface RetrospectiveModalProps {
  sprint: Sprint | null;
  onClose: () => void;
  onSave: (retrospective: { whatWentWell: string; whatDidntGoWell: string; doDifferently: string; }) => void;
}

const TextareaField = ({ value, onChange, label, placeholder }: { value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, label: string, placeholder: string }) => (
   <div>
      <label className="text-lg font-bold font-serif text-purple-300 mb-2 block">{label}</label>
      <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 text-slate-300 focus:ring-purple-500 focus:border-purple-500"
      />
   </div>
);

const RetrospectiveModal: React.FC<RetrospectiveModalProps> = ({ sprint, onClose, onSave }) => {
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatDidntGoWell, setWhatDidntGoWell] = useState('');
  const [doDifferently, setDoDifferently] = useState('');

  if (!sprint) return null;

  const handleSave = () => {
    onSave({ whatWentWell, whatDidntGoWell, doDifferently });
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl shadow-purple-950/50 w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold font-serif text-amber-50">Sprint Retrospective</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><XMarkIcon /></button>
        </div>
        <p className="text-slate-400 mb-6">Journal on your process for the "{sprint.name}" sprint.</p>
        
        <div className="space-y-6">
            <TextareaField 
                value={whatWentWell} 
                onChange={(e) => setWhatWentWell(e.target.value)} 
                label="What went well this cycle?" 
                placeholder="e.g., My daily check-ins kept me focused."
            />
            <TextareaField 
                value={whatDidntGoWell} 
                onChange={(e) => setWhatDidntGoWell(e.target.value)} 
                label="What didn't go well?" 
                placeholder="e.g., I tried to do too much and burned out."
            />
            <TextareaField 
                value={doDifferently} 
                onChange={(e) => setDoDifferently(e.target.value)} 
                label="What will I do differently next cycle?" 
                placeholder="e.g., I will only pick one big spell for my next Sprint."
            />
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={handleSave} className="px-6 py-2 bg-amber-500 text-slate-900 font-bold rounded-md hover:bg-amber-400 transition-colors">
            Complete Retrospective
          </button>
        </div>
      </div>
    </div>
  );
};

export default RetrospectiveModal;