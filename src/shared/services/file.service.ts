import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath);

      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
    } catch (error) {
      this.logger.error(`Failed to delete file: ${filePath}`, error);
    }
    return false;
  }

  getFilePath(filename: string, destination = './uploads'): string {
    return path.join(destination, filename);
  }
}
