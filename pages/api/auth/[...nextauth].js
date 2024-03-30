// Import các thư viện và đối tượng cần thiết
import NextAuth, { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import { mongooseConnect } from '@/lib/mongoose';

// Hàm kiểm tra xem một địa chỉ email có phải là của admin hay không
async function isAdminEmail(email) {
  // Kết nối đến cơ sở dữ liệu MongoDB
  mongooseConnect();
  // Tìm kiếm admin dựa trên email và trả về kết quả kiểm tra
  return !!(await Admin.findOne({ email }));
}

// Cấu hình tùy chọn cho NextAuth
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    // Callback kiểm tra quyền admin khi tạo phiên đăng nhập
    session: async ({ session, token, user }) => {
      // Nếu địa chỉ email thuộc admin, giữ nguyên session, ngược lại trả về false
      if (await isAdminEmail(session?.user?.email)) {
        return session;
      } else {
        return false;
      }
    },
  },
};

// Xuất đối tượng NextAuth với cấu hình đã được định nghĩa
export default NextAuth(authOptions);

// Hàm kiểm tra quyền admin trong request và trả về kết quả
export async function isAdminRequest(req, res) {
  // Lấy thông tin phiên đăng nhập từ request và cấu hình NextAuth
  const session = await getServerSession(req, res, authOptions);
  // Nếu không phải là admin, trả về mã lỗi 401 và kết thúc response
  if (!(await isAdminEmail(session?.user?.email))) {
    res.status(401);
    res.end();
    throw 'not an admin';
  }
}
