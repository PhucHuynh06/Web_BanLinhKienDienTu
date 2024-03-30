// Import các thành phần và thư viện cần thiết
import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { withSwal } from 'react-sweetalert2';
import Spinner from "@/components/Spinner";

// Component cho trang quản lý danh mục
function Categories({ swal }) {
  // State cho thông tin danh mục và các trường thông tin
  const [editedCategory, setEditedCategory] = useState(null);
  const [name, setName] = useState('');
  const [parentCategory, setParentCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tempPropertyName, setTempPropertyName] = useState('');
  const [tempPropertyValues, setTempPropertyValues] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Effect để tải danh sách danh mục khi component được render
  useEffect(() => {
    fetchCategories();
  }, []);

  // Hàm để tải danh sách danh mục từ server
  function fetchCategories() {
    setIsLoading(true);
    axios.get('/api/categories').then(result => {
      setCategories(result.data);
      setIsLoading(false);
    });
  }

  // Hàm để lưu thông tin danh mục hoặc cập nhật thông tin danh mục
  async function saveCategory(ev) {
    ev.preventDefault();
    const data = {
      name,
      parentCategory,
      properties: properties.map(p => ({
        name: p.name,
        values: p.values.split(','),
      })),
    };
    if (editedCategory) {
      data._id = editedCategory._id;
      await axios.put('/api/categories', data);
      setEditedCategory(null);
    } else {
      await axios.post('/api/categories', data);
    }
    setName('');
    setParentCategory('');
    setProperties([]);
    fetchCategories();
  }

  // Hàm để chỉnh sửa thông tin danh mục
  function editCategory(category) {
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id);
    setProperties(
      category.properties.map(({ name, values }) => ({
        name,
        values: values.join(','),
      }))
    );
  }

  // Hàm để xoá danh mục
  function deleteCategory(category) {
    // Kiểm tra xem danh mục có danh mục con không
    const hasChildCategories = categories.some(c => c.parent?._id === category._id);
  
    if (hasChildCategories) {
      // Hiển thị cảnh báo nếu có danh mục con
      swal.fire({
        title: 'Warning',
        text: `Danh mục này có các danh mục con. Bạn phải xóa chúng trước khi xóa danh mục này`,
        icon: 'warning',
        confirmButtonText: 'OK',
      });
    } else {
      // Kiểm tra xem có sản phẩm nào liên quan đến danh mục không
      axios.get(`/api/products?category=${category._id}`).then(result => {
        const productsInCategory = result.data;
        if (productsInCategory.length > 0) {
          // Hiển thị cảnh báo nếu có sản phẩm liên quan
          swal.fire({
            title: 'Warning',
            text: `Có sản phẩm liên quan tới danh mục này, phải xoá các sản phẩm liên quan trước khi xoá danh mục này.`,
            icon: 'warning',
            confirmButtonText: 'OK',
          });
        } else {
          // Hiển thị xác nhận trước khi xoá danh mục
          swal.fire({
            title: 'Bạn chắc là muốn xoá ?',
            text: `Bạn có muốn xoá danh mục này ${category.name}?`,
            showCancelButton: true,
            cancelButtonText: 'Huỷ Bỏ',
            confirmButtonText: 'Có',
            confirmButtonColor: '#d55',
            reverseButtons: true,
          }).then(async result => {
            if (result.isConfirmed) {
              const { _id } = category;
              await axios.delete('/api/categories?_id=' + _id);
              fetchCategories();
            }
          });
        }
      });
    }
  }

  // Hàm để thêm thuộc tính mới cho danh mục
  function addProperty() {
    const newProperty = {
      name: tempPropertyName,
      values: tempPropertyValues,
    };

    setProperties(prev => {
      // Thêm đặc tính mới vào mảng properties và đặt lại các giá trị tạm thời
      return [...prev, newProperty];
    });

    setTempPropertyName('');
    setTempPropertyValues('');
  }

  // Hàm để xử lý khi tên thuộc tính thay đổi
  function handlePropertyNameChange(index, newName) {
    setProperties(prev => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  }

  // Hàm để xử lý khi giá trị thuộc tính thay đổi
  function handlePropertyValuesChange(index, newValues) {
    setProperties(prev => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  }

  // Hàm để xoá thuộc tính
  function removeProperty(indexToRemove) {
    setProperties(prev => {
      return prev.filter((p, pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  }

  // Render component
  return (
    <Layout>
      <h1>Danh Mục</h1>
      <label>
        {editedCategory
          ? `Cập nhật ${editedCategory.name}`
          : 'Tạo danh mục mới'}
      </label>
      <form onSubmit={saveCategory}>
        <div className="flex gap-1">
          <input
            type="text"
            placeholder={'Tên Danh Mục'}
            onChange={ev => setName(ev.target.value)}
            value={name} />
          <select
            onChange={ev => setParentCategory(ev.target.value)}
            value={parentCategory}>
            <option value="">Không có danh mục</option>
            {categories.length > 0 && categories.map(category => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block">Đặc tính</label>
          <button
            onClick={addProperty}
            type="button"
            className="btn-default text-sm mb-2">
            Thêm đặc tính mới
          </button>
          {properties.length > 0 && properties.map((property, index) => (
            <div key={index} className="flex gap-1 mb-2">
              <input type="text"
                value={property.name}
                className="mb-0"
                onChange={ev => handlePropertyNameChange(index, ev.target.value)}
                placeholder="Thêm đặc tính mới (ví dụ: màu sắc)" />
              <input type="text"
                className="mb-0"
                onChange={ev =>
                  handlePropertyValuesChange(
                    index,
                    ev.target.value
                  )}
                value={property.values}
                placeholder="Giá trị, cách nhau bằng dấu phẩy" />
              <button
                onClick={() => removeProperty(index)}
                type="button"
                className="btn-red">
                Loại bỏ
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {editedCategory && (
            <button
              type="button"
              onClick={() => {
                setEditedCategory(null);
                setName('');
                setParentCategory('');
                setProperties([]);
              }}
              className="btn-default">Cancel</button>
          )}
          <button type="submit"
            className="btn-primary py-1">
            Lưu Lại
          </button>
        </div>
      </form>
      {!editedCategory && (
        <table className="basic mt-4">
          <thead>
            <tr>
              <td>Tên Danh Mục</td>
              <td>Thuộc danh mục</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
          {isLoading && (
          <tr>
            <td colSpan={2}>
              <div className="py-4">
                <Spinner fullWidth={true}/>
              </div>
            </td>
          </tr>
          )}
            {categories.length > 0 && categories.map(category => (
              <tr key={category._id}>
                <td>{category.name}</td>
                <td>{category?.parent?.name}</td>
                <td>
                  <button
                    onClick={() => editCategory(category)}
                    className="btn-default mr-1"
                  >
                    Cập nhật
                  </button>
                  <button
                    onClick={() => deleteCategory(category)}
                    className="btn-red">Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

// Kết hợp component với SweetAlert để sử dụng popup thông báo
export default withSwal(({ swal }) => (
  <Categories swal={swal} />
));
