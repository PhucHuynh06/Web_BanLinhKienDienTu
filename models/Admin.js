// Import các hàm và đối tượng từ thư viện mongoose
import { model, models, Schema } from "mongoose";

// Định nghĩa schema cho collection "Admin" trong cơ sở dữ liệu MongoDB
const adminSchema = new Schema({
  email: { type: String, required: true, unique: true },
}, { timestamps: true });

// Xuất model "Admin" (nếu đã tồn tại) hoặc tạo mới nếu chưa tồn tại
export const Admin = models?.Admin || model('Admin', adminSchema);
