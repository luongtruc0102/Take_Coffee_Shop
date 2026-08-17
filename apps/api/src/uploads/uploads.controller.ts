import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('uploads')
export class UploadsController {
  @Roles('ADMIN')
  @Post('products')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/products',

        filename: (
          _request,
          file,
          callback,
        ) => {
          const extension =
            extname(file.originalname);

          const filename =
            `${Date.now()}-${Math.round(
              Math.random() * 1e9,
            )}${extension}`;

          callback(null, filename);
        },
      }),

      limits: {
        fileSize: 5 * 1024 * 1024,
      },

      fileFilter: (
        _request,
        file,
        callback,
      ) => {
        if (
          !file.mimetype.startsWith(
            'image/',
          )
        ) {
          return callback(
            new Error(
              'Chỉ được tải lên file hình ảnh',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  uploadProductImage(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return {
      imageUrl:
        `http://localhost:4000/uploads/products/${file.filename}`,
    };
  }
}