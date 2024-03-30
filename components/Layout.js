// Import các hàm và component cần thiết từ thư viện NextAuth và React
import { useSession, signIn, signOut } from "next-auth/react";
import Nav from "@/components/Nav";
import { useState } from "react";
import Logo from "@/components/Logo";

// Component Layout nhận children làm tham số đầu vào
export default function Layout({ children }) {
  // State để kiểm soát hiển thị Nav trên thiết bị di động
  const [showNav, setShowNav] = useState(false);
  // Dùng hook useSession để lấy thông tin phiên đăng nhập của người dùng
  const { data: session } = useSession();

  // Nếu người dùng chưa đăng nhập, hiển thị nút đăng nhập với Google
  if (!session) {
    return (
      <div className="bg-bgGray w-screen h-screen flex items-center">
        <div className="text-center w-full">
          <button onClick={async () => { await signIn('google') }} className="bg-white p-2 px-4 rounded-lg">Đăng nhập với Google</button>
        </div>
      </div>
    );
  }

  // Nếu người dùng đã đăng nhập, hiển thị giao diện layout chính
  return (
    <div className="bg-bgGray min-h-screen ">
      <div className="block md:hidden flex items-center p-4">
        {/* Nút để mở Nav trên thiết bị di động */}
        <button onClick={() => setShowNav(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
          </svg>
        </button>
        {/* Hiển thị logo trên thiết bị di động */}
        <div className="flex grow justify-center mr-6">
          <Logo />
        </div>
      </div>
      {/* Hiển thị thanh điều hướng và nội dung chính */}
      <div className="flex">
        <Nav show={showNav} />
        <div className="flex-grow p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
