// Import các hàm và model cần thiết
import { Product } from "@/models/Product";
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";

// Xử lý request đến endpoint
export default async function handle(req, res) {
  // Lấy phương thức từ request
  const { method } = req;

  // Kết nối đến cơ sở dữ liệu MongoDB
  await mongooseConnect();

  // Kiểm tra quyền admin trong request
  await isAdminRequest(req, res);

  // Xử lý request theo phương thức của nó
  if (method === 'GET') {
    // Nếu có tham số id, trả về thông tin của sản phẩm có id tương ứng, ngược lại trả về danh sách tất cả sản phẩm
    if (req.query?.id) {
      res.json(await Product.findOne({ _id: req.query.id }));
    } else {
      res.json(await Product.find());
    }
  }

  if (method === 'POST') {
    // Tạo mới một sản phẩm
    const { title, description, price, images, category, properties } = req.body;
    const productDoc = await Product.create({
      title, description, price, images, category, properties,
    });
    res.json(productDoc);
  }

  if (method === 'PUT') {
    // Cập nhật thông tin của một sản phẩm đã tồn tại
    const { title, description, price, images, category, properties, _id } = req.body;
    await Product.updateOne({ _id }, { title, description, price, images, category, properties });
    res.json(true);
  }

  if (method === 'DELETE') {
    // Nếu có tham số id, xóa sản phẩm có id tương ứng
    if (req.query?.id) {
      await Product.deleteOne({ _id: req.query.id });
      res.json(true);
    }
  }
}
