'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { supabase } from '@/utils/supabaseClient';

export default function AdminCategories() {
  const { admin, loading, signOut } = useAdminAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, description, icon, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching categories:', error.message);
    } else {
      setCategories(data);
    }
    setLoadingData(false);
  };

  useEffect(() => {
    if (!admin && !loading) {
      router.push('/admin/login');
    } else {
      fetchCategories();
    }
  }, [admin, loading]);

  // ✅ Realtime subscription for insert/update/delete
  useEffect(() => {
    const channel = supabase
      .channel('realtime:categories')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
        },
        (payload) => {
          console.log('Realtime category change:', payload);
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!admin || loading || loadingData) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => router.push('/admin/categories/create')}>+ Add Category</Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-gray-500">No categories found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {category.name}
                  <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                    {category.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{category.description}</p>
                {category.icon && (
                  <img src={category.icon} alt="icon" className="h-8 w-8 mt-2" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
