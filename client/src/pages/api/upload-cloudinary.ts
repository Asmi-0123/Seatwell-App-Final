import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import formidable, { type Fields, type Files } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end("Method Not Allowed");

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (_err: any, fields: Fields, files: Files) => {
    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: "seatwell_games",
      });

      return res.status(200).json({ url: result.secure_url });
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      return res.status(500).json({ error: "Image upload failed" });
    }
  });
}
