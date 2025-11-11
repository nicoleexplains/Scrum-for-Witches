export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface DailyStandup {
  id: string;
  date: string;
  yesterday: string;
  today: string;
  blockers: string;
}

export type TaskStatus = 'backlog' | 'sprint' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  role: string;
  action: string;
  goal: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  definitionOfDone: ChecklistItem[];
  dailyStandups: DailyStandup[];
}

export interface Retrospective {
  whatWentWell: string;
  whatDidntGoWell: string;
  doDifferently: string;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
  taskIds: string[];
  retrospective: Retrospective | null;
  status: 'active' | 'completed';
}