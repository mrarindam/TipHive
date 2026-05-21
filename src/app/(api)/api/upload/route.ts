import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireWalletSession } from '@/lib/wallet-session';

export async function POST(req: NextRequest) {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary credentials missing' }, { status: 500 });
    }

    await requireWalletSession();

    const formData = await req.formData();
    const action = formData.get('action') as string;

    // --- CASE 1: SIGNATURE GENERATION (For direct client-side upload) ---
    if (action === 'sign') {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const paramsToSign = {
        timestamp,
        upload_preset: (formData.get('upload_preset') as string) || 'ml_default',
      };
      
      // Sort and create string for signing
      const signatureString = `timestamp=${timestamp}&upload_preset=${paramsToSign.upload_preset}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

      return NextResponse.json({
        signature,
        timestamp,
        apiKey,
        cloudName
      });
    }

    // --- CASE 2: PROXY UPLOAD (Keep old logic for small files if needed) ---
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signatureString = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', base64File);
    cloudinaryFormData.append('api_key', apiKey);
    cloudinaryFormData.append('timestamp', timestamp.toString());
    cloudinaryFormData.append('signature', signature);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: cloudinaryFormData,
    });

    const data = await uploadRes.json();
    if (!uploadRes.ok) {
      console.error('Cloudinary upload error:', data);
      return NextResponse.json({ error: data.error?.message || 'Upload failed' }, { status: uploadRes.status });
    }

    return NextResponse.json({ url: data.secure_url });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
