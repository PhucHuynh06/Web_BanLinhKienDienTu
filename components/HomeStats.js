// Import các hàm và component cần thiết từ thư viện React
import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { subHours } from "date-fns";

// Component HomeStats được xuất ra mặc định
export default function HomeStats() {
  // State để lưu trữ danh sách đơn hàng và trạng thái loading
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // useEffect được sử dụng để thực hiện các công việc sau khi component được render
  useEffect(() => {
    // Thiết lập trạng thái loading là true khi đang tải dữ liệu
    setIsLoading(true);

    // Gọi API để lấy danh sách đơn hàng và cập nhật state sau khi nhận được dữ liệu
    axios.get('/api/orders').then(res => {
      setOrders(res.data);
      setIsLoading(false);
    });
  }, []);

  // Hàm tính tổng giá trị đơn hàng
  function ordersTotal(orders) {
    let sum = 0;
    orders.forEach(order => {
      const { line_items } = order;
      line_items.forEach(li => {
        const lineSum = li.quantity * li.price_data.unit_amount / 100;
        sum += lineSum;
      });
    });
    console.log({ orders });
    return new Intl.NumberFormat('vi-VN').format(sum);
  }

  // Kiểm tra nếu đang trong quá trình tải dữ liệu, hiển thị Spinner
  if (isLoading) {
    return (
      <div className="my-4">
        <Spinner fullWidth={true} />
      </div>
    );
  }

  // Lọc đơn hàng theo khoảng thời gian: ngày, tuần, tháng
  const ordersToday = orders.filter(o => new Date(o.createdAt) > subHours(new Date, 24));
  const ordersWeek = orders.filter(o => new Date(o.createdAt) > subHours(new Date, 24 * 7));
  const ordersMonth = orders.filter(o => new Date(o.createdAt) > subHours(new Date, 24 * 30));

  // Hiển thị số liệu đơn hàng
  return (
    <div>
      <h2>Số liệu đơn hàng</h2>
      <div className="tiles-grid">
        {/* Phần thống kê theo ngày */}
        <div className="tile">
          <h3 className="tile-header">Ngày</h3>
          <div className="tile-number">{ordersToday.length}</div>
          <div className="tile-desc">{ordersToday.length} Đơn hàng trong ngày</div>
        </div>
        {/* Phần thống kê theo tuần */}
        <div className="tile">
          <h3 className="tile-header">Tuần</h3>
          <div className="tile-number">{ordersWeek.length}</div>
          <div className="tile-desc">{ordersWeek.length} Đơn hàng trong tuần</div>
        </div>
        {/* Phần thống kê theo tháng */}
        <div className="tile">
          <h3 className="tile-header">Tháng</h3>
          <div className="tile-number">{ordersMonth.length}</div>
          <div className="tile-desc">{ordersMonth.length} Đơn hàng trong tháng</div>
        </div>
      </div>

      {/* Phần thống kê doanh thu */}
      <h2>Doanh thu</h2>
      <div className="tiles-grid">
        {/* Phần thống kê theo ngày */}
        <div className="tile">
          <h3 className="tile-header">Ngày</h3>
          <div className="tile-number">$ {ordersTotal(ordersToday)}</div>
          <div className="tile-desc">{ordersToday.length} đơn hàng trong ngày</div>
        </div>
        {/* Phần thống kê theo tuần */}
        <div className="tile">
          <h3 className="tile-header">Tuần</h3>
          <div className="tile-number">$ {ordersTotal(ordersWeek)}</div>
          <div className="tile-desc">{ordersWeek.length} đơn hàng trong tuần</div>
        </div>
        {/* Phần thống kê theo tháng */}
        <div className="tile">
          <h3 className="tile-header">Tháng</h3>
          <div className="tile-number">$ {ordersTotal(ordersMonth)}</div>
          <div className="tile-desc">{ordersMonth.length} đơn hàng trong tháng</div>
        </div>
      </div>
    </div>
  );
}
