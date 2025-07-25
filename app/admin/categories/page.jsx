'use client';

import { useState, useEffect } from 'react';

export default function CategoriesWithSubcategories() {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState('');

  // Form state for adding category
  const [newCategory, setNewCategory] = useState('');
  const [loadingAddCategory, setLoadingAddCategory] = useState(false);
  const [messageCategory, setMessageCategory] = useState('');

  // Form state for adding subcategory
  const [newSubcategory, setNewSubcategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [loadingAddSubcategory, setLoadingAddSubcategory] = useState(false);
  const [messageSubcategory, setMessageSubcategory] = useState('');

  // Fetch categories + subcategories
  const fetchCategories = () => {
    setLoadingCategories(true);
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoadingCategories(false);
      })
      .catch(() => {
        setErrorCategories('Failed to load categories');
        setLoadingCategories(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setLoadingAddCategory(true);
    setMessageCategory('');

    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategory }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessageCategory('Category added successfully');
      setNewCategory('');
      fetchCategories();  // refresh list
    } else {
      setMessageCategory(data.error || 'Error adding category');
    }

    setLoadingAddCategory(false);
  };

  // Add new subcategory
  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      setMessageSubcategory('Please select a category first');
      return;
    }

    setLoadingAddSubcategory(true);
    setMessageSubcategory('');

    const res = await fetch('/api/subcategories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId: selectedCategoryId, name: newSubcategory }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessageSubcategory('Subcategory added successfully');
      setNewSubcategory('');
      fetchCategories(); // refresh list
    } else {
      setMessageSubcategory(data.error || 'Error adding subcategory');
    }

    setLoadingAddSubcategory(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Manage Categories & Subcategories</h1>

      {/* Show loading or error */}
      {loadingCategories && <p>Loading categories...</p>}
      {errorCategories && <p className="text-red-600">{errorCategories}</p>}

      {/* Categories List */}
      {categories.map(cat => (
        <div key={cat.id} className="mb-6 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold">{cat.name}</h2>
          {cat.subcategories && cat.subcategories.length > 0 ? (
            <ul className="list-disc ml-6 mt-2">
              {cat.subcategories.map(sub => (
                <li key={sub.id}>{sub.name}</li>
              ))}
            </ul>
          ) : (
            <p className="ml-6 italic text-gray-600">No subcategories</p>
          )}
        </div>
      ))}

      {/* Add Category Form */}
      <form onSubmit={handleAddCategory} className="mb-8 space-y-2">
        <h3 className="text-lg font-semibold">Add New Category</h3>
        <input
          type="text"
          placeholder="Category name"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          required
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          disabled={loadingAddCategory}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loadingAddCategory ? 'Adding...' : 'Add Category'}
        </button>
        {messageCategory && <p>{messageCategory}</p>}
      </form>

      {/* Add Subcategory Form */}
      <form onSubmit={handleAddSubcategory} className="space-y-2">
        <h3 className="text-lg font-semibold">Add New Subcategory</h3>
        <select
          value={selectedCategoryId}
          onChange={e => setSelectedCategoryId(e.target.value)}
          required
          className="border p-2 rounded w-full"
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Subcategory name"
          value={newSubcategory}
          onChange={e => setNewSubcategory(e.target.value)}
          required
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          disabled={loadingAddSubcategory}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {loadingAddSubcategory ? 'Adding...' : 'Add Subcategory'}
        </button>
        {messageSubcategory && <p>{messageSubcategory}</p>}
      </form>
    </div>
  );
}
