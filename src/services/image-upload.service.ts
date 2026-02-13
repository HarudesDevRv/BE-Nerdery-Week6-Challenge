import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { FileUpload } from "graphql-upload/processRequest.mjs";
import path from "path";

const client = new S3Client({
  region: process.env.AWS_REGION,
});

export class ImageUploadService {
  static async uploadImage(file: Promise<FileUpload>, uploadKey: string) {
    const { createReadStream, filename, mimetype, encoding } = await file;
    if (mimetype.substring(0, mimetype.indexOf("/")) != "image")
      throw new Error("The file should be an image");
    const extension = path.extname(filename);
    const stream = createReadStream();
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: uploadKey + extension,
      Body: stream,
      encoding,
    };

    const upload = new Upload({
      client: client,
      params: uploadParams,
    });

    return await upload.done();
  }
}
