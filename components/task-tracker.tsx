"use client"


import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Edit2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ... other imports


interface Task {
  id: string;
  title: string;
  content: string;
  date: string;
  completed: boolean;
  completedDate?: string | null;
}

export function TaskTracker() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showNewTask, setShowNewTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeTab, setActiveTab] = useState("new")
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks...');
      const response = await axios.get('/api/tasks');
      console.log('Fetched tasks:', response.data);
      
      if (Array.isArray(response.data)) {
        const formattedTasks = response.data.map(task => ({
          id: task.id,
          title: task.fields.title || '',
          content: task.fields.content || '',
          date: task.fields.date || new Date().toLocaleDateString("en-GB"),
          completed: task.fields.completed || false,
          completedDate: task.fields.completedDate || null
        }));
        
        console.log('Formatted tasks:', formattedTasks);
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    try {
      const form = event.target as HTMLFormElement;
      
      const formData = {
        title: (form.elements.namedItem('title') as HTMLInputElement).value,
        content: (form.elements.namedItem('content') as HTMLInputElement).value,
        date: new Date().toLocaleDateString("en-GB"),
        completed: false,
        completedDate: null
      };
      
      console.log('Submitting task:', formData);

      const response = await axios.post('/api/tasks', formData);
      console.log('API Response:', response.data);
      
      form.reset();
      setShowNewTask(false);
      
      await fetchTasks();
      
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTask = async (id: string) => {
    setIsDeleting(id);
    setError(null);
    
    try {
      await axios.delete(`/api/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const editTask = (task: Task) => {
    setEditingTask(task)
    setShowNewTask(true)
  }

  const toggleTaskCompletion = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    setIsUpdating(id);
    setError(null);

    const updatedTask = {
      ...task,
      completed: !task.completed,
      completedDate: !task.completed ? new Date().toLocaleDateString("en-GB") : undefined,
    };

    try {
      await axios.put(`/api/tasks/${id}`, updatedTask);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    } finally {
      setIsUpdating(null);
    }
  };

  const newTasks = tasks.filter(task => !task.completed)
  const completedTasks = tasks.filter(task => task.completed)

  return (
    <div className="container mx-auto max-w-[1248px] pt-4 px-4 space-y-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Welcome to</h1>
        <h1 className="text-5xl font-bold">Slay the Day</h1>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={() => {
            setEditingTask(null)
            setShowNewTask(true)
          }}
          className="bg-green-500 hover:bg-green-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add a New Task
        </Button>
      </div>

      {showNewTask && (
        <Card className="border-2 w-[400px] h-[300px] mx-auto">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <CardHeader className="bg-gray-100 py-2">
              <Input
                placeholder="Title"
                name="title"
                required
                className="text-lg font-medium"
                defaultValue={editingTask?.title}
              />
            </CardHeader>
            <CardContent className="pt-4 flex-grow">
              <Textarea
                placeholder="Content goes here"
                name="content"
                required
                className="resize-none h-full"
                defaultValue={editingTask?.content}
              />
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {editingTask ? editingTask.date : new Date().toLocaleDateString("en-GB")}
              </span>
              <Button 
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transform hover:scale-105 transition-all duration-200 ease-in-out"
              >
                {editingTask ? "Update" : "Submit"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">New Tasks</TabsTrigger>
          <TabsTrigger value="completed">Completed Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="new">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newTasks.map((task) => (
              <TaskCard key={task.id} task={task} onDelete={deleteTask} onEdit={editTask} onComplete={toggleTaskCompletion} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="completed">
          <div className="flex flex-col items-center space-y-2">
            {completedTasks.map((task) => (
              <CompletedTaskCard key={task.id} task={task} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TaskCard({ task, onDelete, onEdit, onComplete }: { 
  task: Task, 
  onDelete: (id: string) => void, 
  onEdit: (task: Task) => void, 
  onComplete: (id: string) => void 
}) {
  return (
    <Card className="border-2 w-[400px] h-[300px]">
      <CardHeader className="bg-gray-100 py-2 flex flex-row justify-between items-center">
        <h3 className="text-lg font-medium">{task.title}</h3>
        <div className="flex space-x-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onComplete(task.id)}
            className="text-yellow-500 hover:text-yellow-600"
          >
            <CheckCircle className="h-4 w-4" />
            <span className="sr-only">
              {task.completed ? "Mark as incomplete" : "Mark as complete"}
            </span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(task)}
          >
            <Edit2 className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(task.id)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-grow overflow-auto">
        <div className="whitespace-pre-wrap">{task.content}</div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <span className="text-sm text-muted-foreground">{task.date}</span>
      </CardFooter>
    </Card>
  )
}

function CompletedTaskCard({ task }: { task: Task }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card 
      className="border w-full max-w-[600px] cursor-pointer" 
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardContent className="py-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{task.title}</h3>
          <span className="text-sm text-muted-foreground">
            Completed: {task.completedDate}
          </span>
        </div>
        {isExpanded && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Created: {task.date}</p>
            <div className="mt-2 whitespace-pre-wrap">{task.content}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}