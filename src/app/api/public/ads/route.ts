import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AdSettings from '@/models/AdSettings';

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await AdSettings.findOne();
    if (!settings) {
        settings = await AdSettings.create({});
    }
    return NextResponse.json(settings, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
