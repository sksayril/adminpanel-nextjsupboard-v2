import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AdSettings from '@/models/AdSettings';
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

export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectToDatabase();
    let settings = await AdSettings.findOne();
    if (!settings) {
      settings = await AdSettings.create({});
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectToDatabase();
    const data = await req.json();
    data.updatedAt = new Date();
    
    // There's only one master global settings row
    const settings = await AdSettings.findOneAndUpdate({}, data, { new: true, upsert: true });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
