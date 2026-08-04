import { diskStorage } from 'multer';
import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';

export const multerOptions = {
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB default
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|pdf|doc|docx)$/)) {
      cb(null, true);
    } else {
      cb(
        new HttpException(
          `Type de fichier non supporté (${extname(file.originalname)})`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },
  storage: diskStorage({
    destination: (req: any, file: any, cb: any) => {
      const uploadPath = process.env.UPLOAD_DEST || './uploads';
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
};
