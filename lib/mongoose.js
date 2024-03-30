// Import thư viện mongoose
import mongoose from "mongoose";

// Hàm kết nối đến cơ sở dữ liệu MongoDB
export function mongooseConnect() {
  // Kiểm tra trạng thái kết nối hiện tại của mongoose
  if (mongoose.connection.readyState === 1) {
    // Nếu đã kết nối, trả về Promise của kết nối hiện tại
    return mongoose.connection.asPromise();
  } else {
    // Nếu chưa kết nối, lấy URI từ biến môi trường và kết nối đến MongoDB
    const uri = process.env.MONGODB_URI;
    return mongoose.connect(uri);
  }
}
