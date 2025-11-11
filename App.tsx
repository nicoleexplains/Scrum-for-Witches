
import React, { useState, useMemo } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { Task, Sprint, Retrospective, TaskStatus } from './types';
import Column from './components/Column';
import TaskModal from './components/TaskModal';
import RetrospectiveModal from './components/RetrospectiveModal';
import { PlusIcon, MoonIcon } from './components/icons';

// Initial data for a new user
const initialTasks: Task[] = [
    { id: '1', title: 'Master the Tarot', role: 'Diviner', action: 'practice daily one-card pulls', goal: 'build intuition and card knowledge', status: 'backlog', definitionOfDone: [], dailyStandups: [] },
    { id: '2', title: 'Set Up Ancestor Altar', role: 'Witch', action: 'gather photos, offerings, and a suitable space', goal: 'honor my lineage and connect with ancestors', status: 'backlog', definitionOfDone: [], dailyStandups: [] },
    { id: '3', title: 'Learn LBRP', role: 'Student of the Occult', action: 'memorize the first two stanzas', goal: 'practice it daily without notes', status: 'backlog', definitionOfDone: [], dailyStandups: [] },
];

const initialSprints: Sprint[] = [];

const App: React.FC = () => {
    const [tasks, setTasks] = useLocalStorage<Task[]>('scrum-witches-tasks', initialTasks);
    const [sprints, setSprints] = useLocalStorage<Sprint[]>('scrum-witches-sprints', initialSprints);
    const [activeModalTask, setActiveModalTask] = useState<Task | null>(null);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [showRetroModal, setShowRetroModal] = useState<Sprint | null>(null);
    const [newBacklogTaskTitle, setNewBacklogTaskTitle] = useState('');

    const activeSprint = useMemo(() => sprints.find(s => s.status === 'active'), [sprints]);
    const completedSprints = useMemo(() => sprints.filter(s => s.status === 'completed'), [sprints]);

    const backlogTasks = useMemo(() => tasks.filter(t => t.status === 'backlog'), [tasks]);
    const sprintTasks = useMemo(() => tasks.filter(t => t.status === 'sprint'), [tasks]);
    const doneTasks = useMemo(() => tasks.filter(t => t.status === 'done' && activeSprint?.taskIds.includes(t.id)), [tasks, activeSprint]);

    const handleAddTask = () => {
        if(newBacklogTaskTitle.trim() === '') return;
        const newTask: Task = {
            id: Date.now().toString(),
            title: newBacklogTaskTitle,
            role: '',
            action: '',
            goal: '',
            status: 'backlog',
            definitionOfDone: [],
            dailyStandups: [],
        };
        setTasks(prev => [...prev, newTask]);
        setNewBacklogTaskTitle('');
    };

    const handleSaveTask = (updatedTask: Task) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    const handleDeleteTask = (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        // Also remove from any sprints
        setSprints(prev => prev.map(sprint => ({
            ...sprint,
            taskIds: sprint.taskIds.filter(id => id !== taskId)
        })));
    }

    const startNewSprint = () => {
        if(activeSprint) {
            alert('An active sprint is already in progress. Complete it before starting a new one.');
            return;
        }
        const newSprint: Sprint = {
            id: Date.now().toString(),
            name: `Moon Cycle ${sprints.length + 1}`,
            goal: 'Focus for this cycle...',
            startDate: new Date().toISOString(),
            endDate: '',
            taskIds: [],
            retrospective: null,
            status: 'active'
        };
        setSprints(prev => [...prev, newSprint]);
    };

    const completeSprint = () => {
        if(!activeSprint) return;
        setShowRetroModal(activeSprint);
    };

    const handleSaveRetrospective = (retrospective: Retrospective) => {
        if(!showRetroModal) return;
        setSprints(prev => prev.map(s => s.id === showRetroModal.id ? {...s, status: 'completed', retrospective} : s));
        // Move any unfinished sprint tasks back to backlog
        setTasks(prev => prev.map(t => {
            if (t.status === 'sprint') {
                return {...t, status: 'backlog'};
            }
            return t;
        }));
        setShowRetroModal(null);
    };

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
    };
    
    const handleDrop = (targetStatus: TaskStatus) => {
        if (!draggedTaskId) return;

        const task = tasks.find(t => t.id === draggedTaskId);
        if (!task) return;

        // Logic for moving tasks between columns
        if (task.status === 'backlog' && targetStatus === 'sprint' && activeSprint) {
            setTasks(prev => prev.map(t => t.id === draggedTaskId ? { ...t, status: 'sprint' } : t));
            setSprints(prev => prev.map(s => s.id === activeSprint.id ? {...s, taskIds: [...s.taskIds, draggedTaskId]} : s));
        } else if (task.status === 'sprint' && targetStatus === 'done' && activeSprint) {
             setTasks(prev => prev.map(t => t.id === draggedTaskId ? { ...t, status: 'done' } : t));
        } else if (task.status === 'done' && targetStatus === 'sprint' && activeSprint) {
            setTasks(prev => prev.map(t => t.id === draggedTaskId ? { ...t, status: 'sprint' } : t));
        }

        setDraggedTaskId(null);
    };
    
    const onTaskCardDrop = (status: TaskStatus) => {
        const taskId = window.event?.['dataTransfer'].getData('taskId');
        if (!taskId) return;
        handleDropOnColumn(taskId, status);
    }
    
    const handleDropOnColumn = (taskId: string, targetStatus: TaskStatus) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
    
        // From Backlog to Sprint
        if (task.status === 'backlog' && targetStatus === 'sprint' && activeSprint) {
            const newTasks = tasks.map(t => t.id === taskId ? { ...t, status: 'sprint' } : t);
            setTasks(newTasks);
            const newSprints = sprints.map(s => s.id === activeSprint.id ? { ...s, taskIds: [...s.taskIds, taskId] } : s);
            setSprints(newSprints);
        }
        // From Sprint to Done
        else if (task.status === 'sprint' && targetStatus === 'done' && activeSprint?.taskIds.includes(taskId)) {
            const newTasks = tasks.map(t => t.id === taskId ? { ...t, status: 'done' } : t);
            setTasks(newTasks);
        }
        // From Done back to Sprint
        else if (task.status === 'done' && targetStatus === 'sprint' && activeSprint?.taskIds.includes(taskId)) {
            const newTasks = tasks.map(t => t.id === taskId ? { ...t, status: 'sprint' } : t);
            setTasks(newTasks);
        }
    };


    return (
        <div className="bg-slate-900 text-white min-h-screen bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
            <header className="text-center p-6 border-b border-slate-800">
                <h1 className="text-5xl font-bold text-amber-100 font-serif tracking-wider">Scrum for Witches</h1>
                <p className="text-purple-300 mt-2">Plan Your Magic with Agile Focus</p>
            </header>

            <main className="p-4 md:p-8 flex flex-col md:flex-row gap-6 h-[calc(100vh-120px)]">
                {/* Product Backlog Column */}
                <Column title="Master Grimoire of Goals" tasks={backlogTasks} status="backlog" onTaskClick={setActiveModalTask} onDrop={() => {}}>
                    <div className="flex">
                        <input 
                            type="text"
                            value={newBacklogTaskTitle}
                            onChange={(e) => setNewBacklogTaskTitle(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleAddTask()}
                            placeholder="Add a new magical goal..."
                            className="flex-grow bg-slate-800 border border-slate-700 rounded-l-md p-2 text-slate-300 focus:ring-purple-500 focus:border-purple-500"
                        />
                        <button onClick={handleAddTask} className="bg-purple-600 p-2 rounded-r-md hover:bg-purple-700"><PlusIcon className="w-6 h-6"/></button>
                    </div>
                </Column>

                {/* Sprint Column */}
                <div className="w-full md:w-2/3 flex flex-col gap-6">
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold font-serif text-amber-100">{activeSprint ? activeSprint.name : 'No Active Moon Cycle'}</h2>
                            <p className="text-slate-400">{activeSprint ? 'Drag goals from the grimoire to plan your cycle.' : 'Start a new sprint to begin.'}</p>
                        </div>
                        {!activeSprint ? (
                            <button onClick={startNewSprint} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-900 font-bold rounded-md hover:bg-amber-400">
                                <MoonIcon className="w-5 h-5"/> New Moon Cycle
                            </button>
                        ) : (
                            <button onClick={completeSprint} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold rounded-md hover:bg-purple-700">
                                Full Moon Retrospective
                            </button>
                        )}
                    </div>
                    <div className="flex-grow flex gap-6">
                        <Column title="This Moon's Magic" tasks={sprintTasks} status="sprint" onTaskClick={setActiveModalTask} onDrop={() => onTaskCardDrop('sprint')} />
                        <Column title="Rituals Complete" tasks={doneTasks} status="done" onTaskClick={setActiveModalTask} onDrop={() => onTaskCardDrop('done')} />
                    </div>
                </div>
            </main>

            {activeModalTask && (
                <TaskModal 
                    task={activeModalTask} 
                    onClose={() => setActiveModalTask(null)}
                    onSave={handleSaveTask}
                    onDelete={handleDeleteTask}
                />
            )}

            {showRetroModal && (
                <RetrospectiveModal
                    sprint={showRetroModal}
                    onClose={() => setShowRetroModal(null)}
                    onSave={handleSaveRetrospective}
                />
            )}
        </div>
    );
};

export default App;
