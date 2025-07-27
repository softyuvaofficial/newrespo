'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AdminSidebar from '@/components/AdminSidebar';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Plus, Edit, Trash2, FolderTree, Tag } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';

export default function AdminCategories() {
  const { admin, loading, signOut } = useAdminAuth();
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState(null);

  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newSubcategory, setNewSubcategory] = useState({
    name: '',
    description: '',
    category_id: '',
  });

  useEffect(() => {
    if (!loading && !admin) {
      router.push('/admin-login');
      return;
    }

    if (admin) {
      fetchCategories();
      fetchSubcategories();
    }
  }, [admin, loading]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setCategories(data);
  };

  const fetchSubcategories = async () => {
    const { data, error } = await supabase.from('subcategories').select('*');
    if (error) setError(error.message);
    else setSubcategories(data);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin-login');
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      setError('Category name is required');
      return;
    }
    const { data, error } = await supabase
      .from('categories')
      .insert([newCategory])
      .select()
      .single();
    if (error) setError(error.message);
    else {
      setCategories([data, ...categories]);
      setNewCategory({ name: '', description: '' });
      setIsAddingCategory(false);
      setError(null);
    }
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategory.category_id) {
      setError('Please select a parent category');
      return;
    }
    if (!newSubcategory.name.trim()) {
      setError('Subcategory name is required');
      return;
    }
    const { data, error } = await supabase
      .from('subcategories')
      .insert([newSubcategory])
      .select()
      .single();
    if (error) setError(error.message);
    else {
      setSubcategories([data, ...subcategories]);
      setNewSubcategory({ name: '', description: '', category_id: '' });
      setIsAddingSubcategory(false);
      setError(null);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({ name: category.name, description: category.description });
    setError(null);
  };

  const handleUpdateCategory = async () => {
    if (!newCategory.name.trim()) {
      setError('Category name is required');
      return;
    }
    const { data, error } = await supabase
      .from('categories')
      .update({ name: newCategory.name, description: newCategory.description })
      .eq('id', editingCategory.id)
      .select()
      .single();
    if (error) setError(error.message);
    else {
      setCategories(
        categories.map((cat) =>
          cat.id === editingCategory.id ? data : cat
        )
      );
      setEditingCategory(null);
      setNewCategory({ name: '', description: '' });
      setError(null);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (
      confirm(
        'Are you sure you want to delete this category? This will also delete all subcategories.'
      )
    ) {
      // Delete subcategories linked to this category first
      const { error: subErr } = await supabase
        .from('subcategories')
        .delete()
        .eq('category_id', categoryId);

      if (subErr) {
        setError(subErr.message);
        return;
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        setError(error.message);
      } else {
        setCategories(categories.filter((cat) => cat.id !== categoryId));
        setSubcategories(subcategories.filter((sub) => sub.category_id !== categoryId));
        setError(null);
      }
    }
  };

  const handleDeleteSubcategory = async (subcategoryId) => {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', subcategoryId);

      if (error) {
        setError(error.message);
      } else {
        setSubcategories(subcategories.filter((sub) => sub.id !== subcategoryId));
        setError(null);
      }
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar onSignOut={handleSignOut} />

      <div className="flex-1 lg:ml-0">
        {error && (
          <Alert variant="destructive" className="mx-6 mt-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
              <p className="text-gray-600">Manage test categories and subcategories</p>
            </div>
            <div className="flex space-x-3">
              <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="categoryName">Category Name</Label>
                      <Input
                        id="categoryName"
                        value={newCategory.name}
                        onChange={(e) =>
                          setNewCategory({ ...newCategory, name: e.target.value })
                        }
                        placeholder="Enter category name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoryDescription">Description</Label>
                      <Input
                        id="categoryDescription"
                        value={newCategory.description}
                        onChange={(e) =>
                          setNewCategory({ ...newCategory, description: e.target.value })
                        }
                        placeholder="Enter category description"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddCategory}>Add Category</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddingSubcategory} onOpenChange={setIsAddingSubcategory}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Tag className="h-4 w-4 mr-2" />
                    Add Subcategory
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Subcategory</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="parentCategory">Parent Category</Label>
                      <select
                        id="parentCategory"
                        value={newSubcategory.category_id}
                        onChange={(e) =>
                          setNewSubcategory({ ...newSubcategory, category_id: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select parent category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="subcategoryName">Subcategory Name</Label>
                      <Input
                        id="subcategoryName"
                        value={newSubcategory.name}
                        onChange={(e) =>
                          setNewSubcategory({ ...newSubcategory, name: e.target.value })
                        }
                        placeholder="Enter subcategory name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subcategoryDescription">Description</Label>
                      <Input
                        id="subcategoryDescription"
                        value={newSubcategory.description}
                        onChange={(e) =>
                          setNewSubcategory({ ...newSubcategory, description: e.target.value })
                        }
                        placeholder="Enter subcategory description"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddingSubcategory(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddSubcategory}>Add Subcategory</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderTree className="h-5 w-5 mr-2" />
                  Categories ({categories.length})
                </CardTitle>
                <CardDescription>Main test categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline">
                            {
                              subcategories.filter(
                                (sub) => sub.category_id === category.id
                              ).length
                            }{' '}
                            subcategories
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Created: {new Date(category.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subcategories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Subcategories ({subcategories.length})
                </CardTitle>
                <CardDescription>Subcategories under main categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subcategories.map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{subcategory.name}</h3>
                        <p className="text-sm text-gray-600">{subcategory.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge className="bg-blue-100 text-blue-800">
                            {getCategoryName(subcategory.category_id)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSubcategory(subcategory.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Category Dialog */}
          <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editCategoryName">Category Name</Label>
                  <Input
                    id="editCategoryName"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <Label htmlFor="editCategoryDescription">Description</Label>
                  <Input
                    id="editCategoryDescription"
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, description: e.target.value })
                    }
                    placeholder="Enter category description"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingCategory(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateCategory}>Update Category</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

useEffect(() => {
  const channel = supabase
    .channel('public:categories')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'categories' },
      (payload) => {
        console.log('Change received!', payload);
        fetchCategories(); // re-fetch after any change
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

