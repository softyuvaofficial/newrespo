'use client';

import { useEffect, useState } from 'react';

export default function CategoriesClient() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch('/api/categories');
    const data = await res.json();
    if (res.ok) setCategories(data);
    else setMessage(data.error || 'Failed to load categories');
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add new category
  const handleAdd = async () => {
    if (!newCategory.name.trim()) {
      setMessage('Category name is required');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategory),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Category added successfully');
      setNewCategory({ name: '', description: '' });
      fetchCategories();
    } else {
      setMessage(data.error || 'Failed to add category');
    }
    setLoading(false);
  };

  // Update category
  const handleUpdate = async () => {
    if (!editingCategory.name.trim()) {
      setMessage('Category name is required');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingCategory),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Category updated successfully');
      setEditingCategory(null);
      fetchCategories();
    } else {
      setMessage(data.error || 'Failed to update category');
    }
    setLoading(false);
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    setLoading(true);
    const res = await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Category deleted');
      fetchCategories();
    } else {
      setMessage(data.error || 'Failed to delete category');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Manage Categories</h2>

      {message && <p className="mb-4 text-red-600">{message}</p>}

      {/* Add New Category */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Add New Category</h3>
        <input
          type="text"
          placeholder="Name"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newCategory.description}
          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
          className="border p-2 mr-2 rounded"
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>

      {/* Categories List */}
      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <ul>
          {categories.length === 0 && <li>No categories found.</li>}
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="mb-3 p-3 border rounded flex justify-between items-center"
            >
              {editingCategory?.id === cat.id ? (
                <>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, name: e.target.value })
                    }
                    className="border p-1 rounded mr-2"
                  />
                  <input
                    type="text"
                    value={editingCategory.description || ''}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, description: e.target.value })
                    }
                    className="border p-1 rounded mr-2"
                  />
                  <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <strong>{cat.name}</strong> <br />
                    <small className="text-gray-600">{cat.description}</small>
                  </div>
                  <div>
                    <button
                      onClick={() => setEditingCategory(cat)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
