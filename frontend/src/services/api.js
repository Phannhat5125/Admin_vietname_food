// DEPRECATED: Use imports from '../api' instead of this file.
export { FoodAPI, mapFromBackend } from '../api/food';

// Centralized API service for backend food endpoints
// Adjust BASE_URL if backend runs on different host/port
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const resp = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options,
  });
  if (!resp.ok) {
    let errText;
    try { errText = await resp.text(); } catch { errText = resp.statusText; }
    throw new Error(`Request failed ${resp.status} ${errText}`);
  }
  // Some DELETE may return message only
  const contentType = resp.headers.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    return await resp.json();
  }
  return null;
}

export const FoodAPI = {
  list: () => request('/monan'),
  get: (id) => request(`/monan/${id}`),
  create: (data) => request('/monan', { method: 'POST', body: JSON.stringify(mapToBackend(data)) }),
  update: (id, data) => request(`/monan/${id}`, { method: 'PUT', body: JSON.stringify(mapToBackend(data)) }),
  delete: (id) => request(`/monan/${id}`, { method: 'DELETE' }),
};

// Map frontend form structure to backend expected fields
function mapToBackend(data) {
  return {
    ten_mon: data.name,
    vung_mien: data.region,
    tinh_thanh: data.province,
    nguyen_lieu: Array.isArray(data.ingredients) ? data.ingredients.join(', ') : data.ingredients,
    calo: data.calories,
  };
}

// Map backend row to frontend card model
export function mapFromBackend(row) {
  return {
    id: row.id,
    name: row.ten_mon,
    region: row.vung_mien,
    province: row.tinh_thanh,
    // Backend stores nguyen_lieu as a string (assuming comma separated). If already separated keep as is.
    ingredients: typeof row.nguyen_lieu === 'string' ? row.nguyen_lieu.split(',').map(s => s.trim()).filter(Boolean) : [],
    calories: row.calo,
    // No image/description fields in backend yet -> placeholder
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
    description: '',
  };
}

export default FoodAPI;
