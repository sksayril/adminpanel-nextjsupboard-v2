import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UrlEntry from '@/models/UrlEntry';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

async function checkAuth() {
  const token = cookies().get('token')?.value;
  if (!token) return false;
  try {
    jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    return true;
  } catch {
    return false;
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const { title, url, category } = await req.json();
    await connectToDatabase();
    const updated = await UrlEntry.findByIdAndUpdate(
      params.id,
      { title, url, category },
      { new: true }
    );
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    await connectToDatabase();
    const deleted = await UrlEntry.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
