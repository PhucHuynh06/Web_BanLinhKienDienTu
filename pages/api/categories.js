// Import các model và hàm cần thiết
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

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
    // Trả về danh sách tất cả các danh mục với thông tin của danh mục cha
    res.json(await Category.find().populate('parent'));
  }

  if (method === 'POST') {
    // Tạo mới một danh mục
    const { name, parentCategory, properties } = req.body;
    const categoryDoc = await Category.create({
      name,
      parent: parentCategory || undefined,
      properties,
    });
    res.json(categoryDoc);
  }

  if (method === 'PUT') {
    // Cập nhật thông tin của một danh mục đã tồn tại
    const { name, parentCategory, properties, _id } = req.body;
    const categoryDoc = await Category.updateOne({ _id }, {
      name,
      parent: parentCategory || undefined,
      properties,
    });
    res.json(categoryDoc);
  }

  if (method === 'DELETE') {
    const { _id } = req.query;

    // Kiểm tra xem có sản phẩm thuộc danh mục này hay không
    const productsInCategory = await Product.find({ category: _id });

    if (productsInCategory.length > 0) {
      // Trả về thông báo lỗi nếu có sản phẩm thuộc danh mục
      return res.status(400).json({ error: 'Có sản phẩm liên quan tới danh mục, Hãy xoá sản phẩm trước' });
    }

    // Nếu không có sản phẩm nào thuộc danh mục, thực hiện xoá danh mục
    await Category.deleteOne({ _id });
    res.json('ok');
  }
}
