// Import các thành phần và thư viện cần thiết
import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";

// Component cho trang quản lý đơn hàng
export default function OrdersPage() {
  // State để lưu danh sách đơn hàng và trạng thái loading
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Effect để tải danh sách đơn hàng khi component được render
  useEffect(() => {
    setIsLoading(true);
    axios.get('/api/orders').then(response => {
      setOrders(response.data);
      setIsLoading(false);
    });
  }, []);

  // Render component
  return (
    <Layout>
      <h1>Đơn Hàng</h1>
      <table className="basic">
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Thanh Toán</th>
            <th>Người Nhận</th>
            <th>Sản Phẩm</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={2}>
                <div className="py-4">
                  <Spinner fullWidth={true} />
                </div>
              </td>
            </tr>
          )}
          {orders.length > 0 && orders.map(order => (
            <tr key={order._id}>
              <td>{(new Date(order.createdAt)).toLocaleString()}</td>
              <td className={order.paid ? 'text-green-600' : 'text-red-600'}>
                {order.paid ? 'YES' : 'NO'}
              </td>
              <td>
                {order.name} {order.email}<br />
                {order.city} {order.postalCode} {order.country}<br />
                {order.streetAddress}
              </td>
              <td>
                {order.line_items.map((l, index) => (
                  <div key={index}>
                    {l.price_data?.product_data.name} x
                    {l.quantity}<br />
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
