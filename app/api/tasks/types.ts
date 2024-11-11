interface AirtableRecord {
  id: string;
  fields: {
    title: string;
    content: string;
    date: string;
    completed: boolean;
    completedDate?: string | null;
  };
}

interface TaskResponse {
  id: string;
  title: string;
  content: string;
  date: string;
  completed: boolean;
  completedDate?: string | null;
} 