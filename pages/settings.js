// Import các thành phần và thư viện cần thiết
import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { withSwal } from "react-sweetalert2";

// Component cho trang quản lý cài đặt
function SettingsPage({ swal }) {
  // State để lưu danh sách sản phẩm, ID sản phẩm nổi bật, chi phí vận chuyển, và trạng thái loading
  const [products, setProducts] = useState([]);
  const [featuredProductId, setFeaturedProductId] = useState("");
  const [shippingFee, setShippingFee] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Effect để tải danh sách sản phẩm và cài đặt khi component được render
  useEffect(() => {
    setIsLoading(true);
    fetchAll().then(() => {
      setIsLoading(false);
    });
  }, []);

  // Hàm để tải danh sách sản phẩm và cài đặt
  async function fetchAll() {
    await axios.get("/api/products").then((res) => {
      setProducts(res.data);
    });
    await axios.get("/api/settings?name=featuredProductId").then((res) => {
      if (res.data && "value" in res.data) {
        setFeaturedProductId(res.data.value);
      }
    });
    await axios.get("/api/settings?name=shippingFee").then((res) => {
      if (res.data !== null && "value" in res.data) {
        setShippingFee(res.data.value);
      }
    });
  }

  // Hàm để lưu các cài đặt đã thay đổi
  async function saveSettings() {
    setIsLoading(true);
    await axios.put("/api/settings", {
      name: "featuredProductId",
      value: featuredProductId,
    });
    await axios.put("/api/settings", {
      name: "shippingFee",
      value: shippingFee,
    });
    setIsLoading(false);
    await swal.fire({
      title: "Đã lưu lại !",
      icon: "success",
    });
  }

  // Render component
  return (
    <Layout>
      <h1>Settings</h1>
      {isLoading && <Spinner />}
      {!isLoading && (
        <>
          <label>Sản Phẩm nổi bật</label>
          <select
            value={featuredProductId}
            onChange={(ev) => setFeaturedProductId(ev.target.value)}
          >
            {products.length > 0 &&
              products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.title}
                </option>
              ))}
          </select>
          <label>Chi phí vận chuyển (usd)</label>
          <input
            type="number"
            value={shippingFee}
            onChange={(ev) => setShippingFee(ev.target.value)}
          />
          <div>
            <button onClick={saveSettings} className="btn-primary">
              Lưu lại
            </button>
          </div>
        </>
      )}
    </Layout>
  );
}

// Kết hợp component với HOC để sử dụng SweetAlert
export default withSwal(({ swal }) => <SettingsPage swal={swal} />);
