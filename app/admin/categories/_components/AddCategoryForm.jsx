'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AddCategoryForm() {
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: categoryName }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage('Category added successfully!');
      setCategoryName('');
    } else {
      setMessage(data.error || 'Something went wrong.');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        placeholder="Enter category name"
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Category'}
      </Button>
      {message && <div className="text-sm mt-2">{message}</div>}
    </form>
  );
}
