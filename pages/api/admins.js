// Import các thư viện và đối tượng cần thiết
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import { Admin } from "@/models/Admin";

// Xử lý request tới endpoint
export default async function handle(req, res) {
  // Kết nối đến cơ sở dữ liệu MongoDB
  await mongooseConnect();
  
  // Kiểm tra quyền admin trong request
  await isAdminRequest(req, res);

  // Xử lý request theo phương thức của nó
  if (req.method === 'POST') {
    const { email } = req.body;
    // Kiểm tra xem admin có tồn tại hay không, nếu tồn tại trả về mã lỗi 400
    if (await Admin.findOne({ email })) {
      res.status(400).json({ message: 'admin already exists!' });
    } else {
      // Tạo mới admin và trả về thông tin admin được tạo
      res.json(await Admin.create({ email }));
    }
  }

  if (req.method === 'DELETE') {
    const { _id } = req.query;
    // Xóa admin dựa trên _id
    await Admin.findByIdAndDelete(_id);
    // Trả về true khi xóa thành công
    res.json(true);
  }

  if (req.method === 'GET') {
    // Trả về danh sách tất cả admin
    res.json(await Admin.find());
  }
}
