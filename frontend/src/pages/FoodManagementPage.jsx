import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Save, X } from 'lucide-react';
import { FoodAPI, mapFromBackend } from '../api';

const FoodManagementPage = () => {
  const [foods, setFoods] = useState([]); // start empty, load from backend
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    ingredients: '',
    image: '',
    calories: '',
    description: '',
    province: ''
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const regions = ['Miền Bắc', 'Miền Trung', 'Miền Nam'];
  
  const provinces = {
    'Miền Bắc': [
      'Hà Nội', 'Cao Bằng', 'Tuyên Quang', 'Lào Cai', 'Điện Biên',
      'Sơn La', 'Phú Thọ', 'Thái Nguyên', 'Bắc Ninh', 'Hưng Yên',
      'Quảng Ninh', 'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Hải Phòng', 'TP. Huế'
    ],
    'Miền Trung': [
      'Đà Nẵng', 'Quảng Trị', 'Quảng Ngãi', 'Gia Lai', 'Đắk Lắk',
      'Khánh Hòa', 'Lâm Đồng'
    ],
    'Miền Nam': [
      'TP. Hồ Chí Minh', 'Đồng Nai', 'Tây Ninh', 'Vĩnh Long', 'Đồng Tháp',
      'Cần Thơ', 'Cà Mau', 'An Giang'
    ]
  };

  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true); setError('');
      try {
        const data = await FoodAPI.list();
        const mapped = Array.isArray(data) ? data.map(mapFromBackend) : [];
        setFoods(mapped);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      region: '',
      ingredients: '',
      image: '',
      calories: '',
      description: '',
      province: ''
    });
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Vui lòng chọn file hình ảnh!');
      }
    }
  };

  const handleAdd = () => {
    setShowAddForm(true);
    setEditingFood(null);
    resetForm();
  };

  const handleEdit = (food) => {
    setEditingFood(food);
    setShowAddForm(true);
    setFormData({
      name: food.name,
      region: food.region,
      ingredients: food.ingredients.join(', '),
      image: food.image,
      calories: food.calories.toString(),
      description: food.description,
      province: food.province
    });
    setSelectedImage(null);
    setImagePreview(food.image);
  };

  const handleSave = async () => {
    const ingredientsArray = formData.ingredients.split(',').map(item => item.trim()).filter(item => item);
    
    // Sử dụng hình ảnh đã chọn hoặc hình ảnh hiện tại hoặc hình mặc định
    let imageUrl = formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop';
    if (selectedImage) {
      // Trong thực tế, bạn sẽ upload file lên server và nhận về URL
      // Hiện tại sử dụng DataURL để demo
      imageUrl = imagePreview;
    }
    
    const foodData = {
      name: formData.name,
      region: formData.region,
      ingredients: ingredientsArray,
      image: imageUrl,
      calories: parseInt(formData.calories || '0', 10),
      description: formData.description,
      province: formData.province
    };

    try {
      if (editingFood) {
        await FoodAPI.update(editingFood.id, foodData);
        setFoods(foods.map(f => f.id === editingFood.id ? { ...foodData, id: editingFood.id } : f));
      } else {
        const resp = await FoodAPI.create(foodData);
        const newId = resp?.id || Date.now();
        setFoods([...foods, { ...foodData, id: newId }]);
      }
      setShowAddForm(false);
      resetForm();
      setEditingFood(null);
    } catch (e) {
      alert('Lỗi lưu: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa món ăn này?')) return;
    try {
      await FoodAPI.delete(id);
      setFoods(foods.filter(f => f.id !== id));
    } catch (e) {
      alert('Lỗi xóa: ' + e.message);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    resetForm();
    setEditingFood(null);
    setIsEditModalOpen(false);
  };

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         food.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = filterRegion === '' || food.region === filterRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="food-management-page">
      <div className="page-header">
        <h1 className="page-title">Quản lý món ăn</h1>
        <p className="page-subtitle">Thêm, sửa, xóa thông tin món đặc sản</p>
        {loading && <p>Đang tải dữ liệu...</p>}
        {error && <p style={{color:'red'}}>Lỗi: {error}</p>}
      </div>

      {/* Search and Filter Bar */}
      <div className="controls-bar">
        <div className="search-controls">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="region-filter"
          >
            <option value="">Tất cả vùng miền</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
        
        <button 
          className="add-btn"
          onClick={handleAdd}
        >
          <Plus size={20} />
          Thêm món ăn
        </button>
      </div>

      {/* Food Grid */}
      <div className="food-grid">
        {filteredFoods.map(food => (
          <div key={food.id} className="food-card">
            <div className="food-image">
              <img src={food.image} alt={food.name} />
              <div className="food-actions">
                <button 
                  className="action-btn edit"
                  onClick={() => handleEdit(food)}
                  title="Chỉnh sửa"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => handleDelete(food.id)}
                  title="Xóa"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="food-info">
              <h3 className="food-name">{food.name}</h3>
              <span className="food-region">{food.region}</span>
              <p className="food-description">{food.description}</p>
              
              <div className="food-details">
                <div className="detail-item">
                  <span className="detail-label">Calories:</span>
                  <span className="detail-value">{food.calories} kcal</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tỉnh thành:</span>
                  <span className="detail-value">{food.province}</span>
                </div>
              </div>
              
              <div className="ingredients">
                <span className="ingredients-label">Nguyên liệu:</span>
                <div className="ingredients-tags">
                  {food.ingredients.slice(0, 3).map((ingredient, index) => (
                    <span key={index} className="ingredient-tag">{ingredient}</span>
                  ))}
                  {food.ingredients.length > 3 && (
                    <span className="ingredient-more">+{food.ingredients.length - 3}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingFood ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}</h2>
              <button className="close-btn" onClick={handleCancel}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Tên món ăn</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nhập tên món ăn"
                  />
                </div>
                
                <div className="form-group">
                  <label>Vùng miền</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value, province: ''})}
                  >
                    <option value="">Chọn vùng miền</option>
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Calories (kcal)</label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({...formData, calories: e.target.value})}
                    placeholder="0"
                  />
                </div>
                
                <div className="form-group">
                  <label>Tỉnh thành</label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({...formData, province: e.target.value})}
                  >
                    <option value="">Chọn tỉnh thành</option>
                    {formData.region && provinces[formData.region] && 
                      provinces[formData.region].map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))
                    }
                    {!formData.region && 
                      Object.values(provinces).flat().map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))
                    }
                  </select>
                </div>
                
                <div className="form-group full-width">
                  <label>Hình ảnh</label>
                  <div className="image-upload-section">
                    <input
                      type="file"
                      id="imageInput"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="image-select-btn"
                      onClick={() => document.getElementById('imageInput').click()}
                    >
                      {imagePreview ? 'Thay đổi hình ảnh' : 'Chọn hình ảnh'}
                    </button>
                    {imagePreview && (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                        <button
                          type="button"
                          className="image-remove-btn"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview('');
                            setFormData({...formData, image: ''});
                          }}
                        >
                          Xóa hình ảnh
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="form-group full-width">
                  <label>Nguyên liệu (cách nhau bằng dấu phẩy)</label>
                  <input
                    type="text"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                    placeholder="Bánh phở, Thịt bò, Hành tây..."
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Mô tả về món ăn..."
                    rows="3"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn secondary" onClick={handleCancel}>
                Hủy
              </button>
              <button className="btn primary" onClick={handleSave}>
                <Save size={16} />
                {editingFood ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodManagementPage;