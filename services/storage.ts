import { promises as fs } from 'fs';
import path from 'path';

import { v2 as cloudinary } from 'cloudinary';

type UploadResult = {
  videoUrl: string;
  thumbnailUrl: string | null;
  storageProvider: 'cloudinary' | 'local';
  storageKey: string | null;
};

function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
  );
}

export async function uploadVideoFile(filePath: string, originalName: string) {
  if (cloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });

    const folder = process.env.CLOUDINARY_FOLDER || 'playlite';
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder,
      public_id: `${Date.now()}-${path.parse(originalName).name}`
    });

    return {
      videoUrl: result.secure_url,
      thumbnailUrl: result.secure_url.replace('/upload/', '/upload/so_6/').replace(/\.[^.]+$/, '.jpg'),
      storageProvider: 'cloudinary' as const,
      storageKey: result.public_id
    } satisfies UploadResult;
  }

  const publicUploads = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(publicUploads, { recursive: true });
  const fileName = `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
  const destination = path.join(publicUploads, fileName);
  await fs.copyFile(filePath, destination);

  return {
    videoUrl: `/uploads/${fileName}`,
    thumbnailUrl: '/video-thumb.svg',
    storageProvider: 'local' as const,
    storageKey: fileName
  } satisfies UploadResult;
}