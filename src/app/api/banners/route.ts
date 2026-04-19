import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Banner from '@/models/Banner';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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
  await connectToDatabase();
  const banners = await Banner.find().sort({ createdAt: -1 });
  return NextResponse.json(banners);
}

export async function POST(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectToDatabase();
    
    // Check max 3 images limit
    const count = await Banner.countDocuments();
    if (count >= 3) {
      return NextResponse.json({ error: 'Maximum 3 images allowed. Please delete an image first.' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    const title = formData.get('title') as string;
    const linkUrl = formData.get('linkUrl') as string || '';

    if (!file || !title) {
      return NextResponse.json({ error: 'File and title are required' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const s3Key = `banners/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // Get public URL
    const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    const newBanner = await Banner.create({ title, imageUrl, s3Key, linkUrl });
    return NextResponse.json(newBanner, { status: 201 });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
