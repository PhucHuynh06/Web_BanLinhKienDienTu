// Import các thành phần và thư viện cần thiết
import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { withSwal } from "react-sweetalert2";
import Spinner from "@/components/Spinner";
import { prettyDate } from "@/lib/date";

// Component chính cho trang quản trị viên
function AdminsPage({ swal }) {
  // State cho email và danh sách admin
  const [email, setEmail] = useState('');
  const [adminEmails, setAdminEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Hàm thêm admin
  function addAdmin(ev) {
    ev.preventDefault();
    axios.post('/api/admins', { email }).then(res => {
      console.log(res.data);
      swal.fire({
        title: 'Đã thêm admin!',
        icon: 'success',
      });
      setEmail('');
      loadAdmins();
    }).catch(err => {
      swal.fire({
        title: 'Error!',
        text: err.response.data.message,
        icon: 'error',
      });
    });
  }

  // Hàm xoá admin
  function deleteAdmin(_id, email) {
    swal.fire({
      title: 'Bạn có chắc?',
      text: `Bạn có muốn xoá admin này ${email}?`,
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, Delete!',
      confirmButtonColor: '#d55',
      reverseButtons: true,
    }).then(async result => {
      if (result.isConfirmed) {
        axios.delete('/api/admins?_id=' + _id).then(() => {
          swal.fire({
            title: 'Đã xoá admin!',
            icon: 'success',
          });
          loadAdmins();
        });
      }
    });
  }

  // Hàm tải danh sách admin
  function loadAdmins() {
    setIsLoading(true);
    axios.get('/api/admins').then(res => {
      setAdminEmails(res.data);
      setIsLoading(false);
    });
  }

  // Effect để tải danh sách admin khi component được render
  useEffect(() => {
    loadAdmins();
  }, []);

  // Render component
  return (
    <Layout>
      <h1>Quản trị viên</h1>
      <h2>Thêm một quản trị viên</h2>
      <form onSubmit={addAdmin}>
        <div className="flex gap-2">
          <input
            type="text"
            className="mb-0"
            value={email}
            onChange={ev => setEmail(ev.target.value)}
            placeholder="google email" />
          <button
            type="submit"
            className="btn-primary py-1 whitespace-nowrap">
            Thêm
          </button>
        </div>
      </form>

      <h2>Danh sách quản trị viên</h2>
      <table className="basic">
        <thead>
          <tr>
            <th className="text-left">Admin google email</th>
            <th></th>
            <th></th>
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
          {adminEmails.length > 0 && adminEmails.map(adminEmail => (
            <tr key={adminEmail._id}>
              <td>{adminEmail.email}</td>
              <td>
                {adminEmail.createdAt && prettyDate(adminEmail.createdAt)}
              </td>
              <td>
                <button
                  onClick={() => deleteAdmin(adminEmail._id, adminEmail.email)} className="btn-red">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

// Kết hợp component với SweetAlert để sử dụng popup thông báo
export default withSwal(({ swal }) => (
  <AdminsPage swal={swal} />
));
