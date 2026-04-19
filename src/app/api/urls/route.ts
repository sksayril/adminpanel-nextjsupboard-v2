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

export async function GET(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectToDatabase();
  const url = new URL(req.url);
  const category = url.searchParams.get('category');
  const query = category ? { category } : {};
  const urls = await UrlEntry.find(query).sort({ createdAt: -1 });
  return NextResponse.json(urls);
}

export async function POST(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const { title, url, category } = await req.json();
    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
    }

    await connectToDatabase();
    
    const newEntry = await UrlEntry.create({ title, url, category });
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
