// app/api/tasks/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import base from '../../../../lib/airtable';

// PUT: Update a task
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const body = await request.json();
    
    const updatedRecords = await base('tasks').update([
      {
        id: id,
        fields: {
          title: body.title,
          content: body.content,
          date: body.date,
          completed: body.completed,
          completedDate: body.completedDate
        }
      }
    ]);

    const updatedRecord = updatedRecords[0];
    const updatedTask = {
      id: updatedRecord.id,
      ...updatedRecord.fields
    };

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ 
      error: 'Failed to update task',
      details: error instanceof Error ? error.message : 'Unknown error',
      taskId: id 
    }, { status: 500 });
  }
}

// DELETE: Delete a task
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    await base('tasks').destroy([id]);
    return NextResponse.json({ 
      message: 'Task deleted successfully',
      taskId: id 
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ 
      error: 'Failed to delete task',
      details: error instanceof Error ? error.message : 'Unknown error',
      taskId: id 
    }, { status: 500 });
  }
}
