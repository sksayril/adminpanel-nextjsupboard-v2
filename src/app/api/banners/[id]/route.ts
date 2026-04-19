import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Banner from '@/models/Banner';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    await connectToDatabase();
    
    // Find banner first to get the S3 Key
    const banner = await Banner.findById(params.id);
    if (!banner) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Delete from S3
    if (banner.s3Key) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: banner.s3Key,
          })
        );
      } catch (s3Error) {
        console.error('S3 Deletion failed (AccessDenied?), proceeding to delete DB record:', s3Error);
      }
    }

    // Delete from DB
    await Banner.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
