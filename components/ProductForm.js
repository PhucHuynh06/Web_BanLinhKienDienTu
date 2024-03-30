// Import các hàm và component cần thiết từ thư viện React
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { ReactSortable } from "react-sortablejs";

// Component ProductForm nhận các props để điền thông tin sản phẩm
export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: assignedCategory,
  properties: assignedProperties,
}) {
  // State để lưu trữ thông tin sản phẩm và trạng thái loading
  const [title, setTitle] = useState(existingTitle || "");
  const [description, setDescription] = useState(existingDescription || "");
  const [category, setCategory] = useState(assignedCategory || "");
  const [productProperties, setProductProperties] = useState(assignedProperties || {});
  const [price, setPrice] = useState(existingPrice || "");
  const [images, setImages] = useState(existingImages || []);
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const router = useRouter();

  // useEffect để lấy danh sách các danh mục khi component được render
  useEffect(() => {
    setCategoriesLoading(true);
    axios.get('/api/categories').then(result => {
      setCategories(result.data);
      setCategoriesLoading(false);
    });
  }, []);

  // Hàm lưu sản phẩm khi submit form
  async function saveProduct(ev) {
    ev.preventDefault();
    const data = {
      title, description, price, images, category,
      properties: productProperties
    };
    if (_id) {
      // Cập nhật sản phẩm nếu đã có _id
      await axios.put('/api/products', { ...data, _id });
    } else {
      // Tạo mới sản phẩm nếu chưa có _id
      await axios.post('/api/products', data);
    }
    setGoToProducts(true);
  }

  // Chuyển hướng đến trang danh sách sản phẩm khi saveProduct đã được gọi
  if (goToProducts) {
    router.push('/products');
  }

  // Hàm tải ảnh lên khi người dùng chọn file
  async function uploadImages(ev) {
    const files = ev.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append('file', file);
      }
      const res = await axios.post('/api/upload', data);
      setImages(oldImages => {
        return [...oldImages, ...res.data.links];
      });
      setIsUploading(false);
    }
  }

  // Hàm cập nhật thứ tự ảnh khi sắp xếp
  function updateImagesOrder(images) {
    setImages(images);
  }

  // Hàm cập nhật giá trị của thuộc tính sản phẩm
  function setProductProp(propName, value) {
    setProductProperties(prev => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  }

  // Tạo danh sách thuộc tính cần điền dựa trên danh mục đã chọn
  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);
    propertiesToFill.push(...catInfo.properties);
    while (catInfo?.parent?._id) {
      const parentCat = categories.find(({ _id }) => _id === catInfo?.parent?._id);
      propertiesToFill.push(...parentCat.properties);
      catInfo = parentCat;
    }
  }

  // Hiển thị form thông tin sản phẩm
  return (
    <form onSubmit={saveProduct}>
      <label>Tên Sản Phẩm</label>
      <input
        type="text"
        placeholder="product name"
        value={title}
        onChange={ev => setTitle(ev.target.value)}
      />
      <label>Phân Loại</label>
      <select value={category} onChange={ev => setCategory(ev.target.value)}>
        <option value="">Chọn Phân Loại</option>
        {categories.length > 0 && categories.map(c => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>
      {categoriesLoading && (
        <Spinner />
      )}
      {propertiesToFill.length > 0 && propertiesToFill.map(p => (
        <div key={p.name} className="">
          <label>{p.name && p.name[0].toUpperCase() + p.name.substring(1)}</label>
          <div>
            <select
              value={productProperties[p.name]}
              onChange={ev => setProductProp(p.name, ev.target.value)}
            >
              {p.values.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      ))}
      <label>Ảnh</label>
      <div className="mb-2 flex flex-wrap gap-1">
        <ReactSortable
          list={images}
          className="flex flex-wrap gap-1"
          setList={updateImagesOrder}
        >
          {!!images?.length && images.map(link => (
            <div key={link} className="h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200">
              <img src={link} alt="" className="rounded-lg" />
            </div>
          ))}
        </ReactSortable>
        {isUploading && (
          <div className="h-24 flex items-center">
            <Spinner />
          </div>
        )}
        <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <div>
            Thêm Hình Ảnh
          </div>
          <input type="file" onChange={uploadImages} className="hidden" />
        </label>
      </div>
      <label>Mô tả</label>
      <textarea
        placeholder="description"
        value={description}
        onChange={ev => setDescription(ev.target.value)}
      />
      <label>Giá (USD)</label>
      <input
        type="number" placeholder="price"
        value={price}
        onChange={ev => setPrice(ev.target.value)}
      />
      <button
        type="submit"
        className="btn-primary">
        Lưu Lại
      </button>
    </form>
  );
}
