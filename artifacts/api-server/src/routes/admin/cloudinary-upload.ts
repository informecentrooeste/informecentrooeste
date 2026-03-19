import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { requireAuth } from "../../middleware/auth.js";

const router = Router();
router.use(requireAuth);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_MIMES = ["video/mp4", "video/quicktime", "video/x-msvideo"];

router.post("/image", upload.single("file"), async (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
  
  if (!ALLOWED_IMAGE_MIMES.includes(req.file.mimetype)) {
    res.status(400).json({ error: "Apenas imagens JPEG, PNG, WebP e GIF são permitidas" });
    return;
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "informe-centro-oeste/images", resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file!.buffer);
    });

    const uploadResult = result as any;
    res.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
    });
  } catch (err: any) {
    res.status(500).json({ error: `Upload failed: ${err.message}` });
  }
});

router.post("/video", upload.single("file"), async (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }

  if (!ALLOWED_VIDEO_MIMES.includes(req.file.mimetype)) {
    res.status(400).json({ error: "Apenas vídeos MP4, MOV e AVI são permitidos" });
    return;
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "informe-centro-oeste/videos",
          resource_type: "video",
          chunk_size: 6000000,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file!.buffer);
    });

    const uploadResult = result as any;
    res.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      duration: uploadResult.duration,
      width: uploadResult.width,
      height: uploadResult.height,
    });
  } catch (err: any) {
    res.status(500).json({ error: `Upload failed: ${err.message}` });
  }
});

export default router;
