// app/api/tasks/route.ts

import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';

// Define the shape of a Task
interface Task {
  id: string;
  title: string;
  content: string;
  date: string;
  completed: boolean;
  completedDate?: string | null;
}

// GET: Fetch all tasks
export async function GET() {
  try {
    const records = await base('tasks').select().all();
    const tasks = records.map(record => ({
      id: record.id,
      fields: record.fields // Return the complete fields object
    }));
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST: Create a new task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Create record with exact field names and fields wrapper
    const newRecord = await base('tasks').create([
      {
        fields: {
          title: body.title,
          content: body.content,
          date: body.date,
          completed: body.completed || false,
          completedDate: body.completedDate || null,
        }
      }
    ]);

    // Return the first created record since we're only creating one
    const record = newRecord[0];
    
    const createdTask = {
      id: record.id,
      title: record.fields.title,
      content: record.fields.content,
      date: record.fields.date,
      completed: record.fields.completed,
      completedDate: record.fields.completedDate || null,
    };

    return NextResponse.json(createdTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ 
      error: 'Failed to create task',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
