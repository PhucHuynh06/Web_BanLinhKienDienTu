// Import các hàm và model cần thiết
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import { Setting } from "@/models/Setting";

// Xử lý request đến endpoint
export default async function handle(req, res) {
  // Kết nối đến cơ sở dữ liệu MongoDB
  await mongooseConnect();

  // Kiểm tra quyền admin trong request
  await isAdminRequest(req, res);

  // Xử lý request theo phương thức của nó
  if (req.method === 'PUT') {
    // Cập nhật hoặc tạo mới một thiết lập
    const { name, value } = req.body;
    const settingDoc = await Setting.findOne({ name });

    if (settingDoc) {
      // Nếu thiết lập đã tồn tại, cập nhật giá trị và lưu lại
      settingDoc.value = value;
      await settingDoc.save();
      res.json(settingDoc);
    } else {
      // Nếu thiết lập chưa tồn tại, tạo mới và trả về thông tin mới tạo
      res.json(await Setting.create({ name, value }));
    }
  }

  if (req.method === 'GET') {
    // Lấy thông tin của thiết lập dựa trên tên
    const { name } = req.query;
    res.json(await Setting.findOne({ name }));
  }
}
