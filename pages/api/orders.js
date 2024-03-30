// Import các hàm và model cần thiết
import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

// Xử lý request đến endpoint
export default async function handler(req, res) {
  // Kết nối đến cơ sở dữ liệu MongoDB
  await mongooseConnect();

  // Trả về danh sách tất cả các đơn hàng được sắp xếp theo thời gian tạo giảm dần
  res.json(await Order.find().sort({ createdAt: -1 }));
}
