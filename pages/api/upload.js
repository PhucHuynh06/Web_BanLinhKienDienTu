// Import các thư viện và đối tượng cần thiết
import multiparty from 'multiparty';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
import mime from 'mime-types';
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";

// Định nghĩa tên bucket S3
const bucketName = 'webthuongmaidientu';

// Xử lý request đến endpoint
export default async function handle(req, res) {
  // Kết nối đến cơ sở dữ liệu MongoDB
  await mongooseConnect();

  // Kiểm tra quyền admin trong request
  await isAdminRequest(req, res);

  // Parse dữ liệu từ request sử dụng thư viện multiparty
  const form = new multiparty.Form();
  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });

  // Khởi tạo client S3 với thông tin cấu hình
  const client = new S3Client({
    region: 'ap-southeast-2',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });

  // Tạo danh sách chứa các link tới các file đã upload lên S3
  const links = [];
  for (const file of files.file) {
    // Xây dựng tên file mới để tránh trùng lặp
    const ext = file.originalFilename.split('.').pop();
    const newFilename = Date.now() + '.' + ext;

    // Gửi file lên S3 sử dụng PutObjectCommand
    await client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: newFilename,
      Body: fs.readFileSync(file.path),
      ACL: 'public-read',
      ContentType: mime.lookup(file.path),
    }));

    // Tạo link và thêm vào danh sách
    const link = `https://${bucketName}.s3.amazonaws.com/${newFilename}`;
    links.push(link);
  }

  // Trả về danh sách các link tới các file đã upload
  return res.json({ links });
}

// Cấu hình API không sử dụng bodyParser để tránh việc xử lý trùng lặp
export const config = {
  api: { bodyParser: false },
};
