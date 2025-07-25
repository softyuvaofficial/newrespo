'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/utils/supabaseClient';
import { Pencil, Trash2 } from 'lucide-react';

export default function CategoriesClient() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', icon: '', status: true });
  const [editingId, setEditingId] = useState(null);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*, subcategories(*)')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      await supabase.from('categories').update(formData).eq('id', editingId);
      setEditingId(null);
    } else {
      await supabase.from('categories').insert([{ ...formData }]);
    }

    setFormData({ name: '', icon: '', status: true });
    fetchCategories();
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, icon: category.icon, status: category.status });
  };

  const handleDelete = async (id) => {
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
        <Input
          placeholder="Category name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Input
          placeholder="Icon (e.g. 📚)"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
        />
        <Button type="submit">{editingId ? 'Update' : 'Add'}</Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="border rounded-lg p-4 shadow-sm bg-white flex flex-col gap-2"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cat.icon}</span>
                <h2 className="font-semibold">{cat.name}</h2>
              </div>
              <div className="flex gap-2">
                <Pencil
                  className="cursor-pointer text-blue-600"
                  size={18}
                  onClick={() => handleEdit(cat)}
                />
                <Trash2
                  className="cursor-pointer text-red-500"
                  size={18}
                  onClick={() => handleDelete(cat.id)}
                />
              </div>
            </div>
            <p className="text-xs text-gray-600">
              Status: {cat.status ? 'Active' : 'Inactive'}
            </p>
            {cat.subcategories?.length > 0 && (
              <ul className="text-sm text-gray-700 pl-4 list-disc">
                {cat.subcategories.map((sub) => (
                  <li key={sub.id}>{sub.name}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
