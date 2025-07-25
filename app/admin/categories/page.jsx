'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AdminSidebar from '@/components/AdminSidebar';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Plus, Edit, Trash2, FolderTree, Tag } from 'lucide-react';

import { supabase } from '@/utils/supabaseClient'; // Import supabase client

export default function AdminCategories() {
  const { admin, loading, signOut } = useAdminAuth();
  const router = useRouter();

  // States
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);

  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newSubcategory, setNewSubcategory] = useState({ name: '', description: '', categoryId: '' });

  // Fetch categories & subcategories from Supabase
  const fetchCategoriesAndSubs = async () => {
    try {
      const { data: categoriesData, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (catErr) throw catErr;

      const { data: subcategoriesData, error: subErr } = await supabase
        .from('subcategories')
        .select('*')
        .order('id', { ascending: true });

      if (subErr) throw subErr;

      setCategories(categoriesData || []);
      setSubcategories(subcategoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    if (!loading && !admin) {
      router.push('/admin-login');
      return;
    }
    if (admin) {
      fetchCategoriesAndSubs();
    }
  }, [admin, loading, router]);

  // Sign out handler
  const handleSignOut = async () => {
    await signOut();
    router.push('/admin-login');
  };

  // Add Category
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return alert('Category name is required');

    const { error } = await supabase.from('categories').insert([{
      name: newCategory.name,
      description: newCategory.description,
      created_at: new Date().toISOString()
    }]);

    if (error) {
      alert('Failed to add category: ' + error.message);
    } else {
      setIsAddingCategory(false);
      setNewCategory({ name: '', description: '' });
      fetchCategoriesAndSubs();
    }
  };

  // Add Subcategory
  const handleAddSubcategory = async () => {
    if (!newSubcategory.name.trim() || !newSubcategory.categoryId) {
      return alert('Subcategory name and parent category are required');
    }

    const { error } = await supabase.from('subcategories').insert([{
      name: newSubcategory.name,
      description: newSubcategory.description,
      category_id: newSubcategory.categoryId
    }]);

    if (error) {
      alert('Failed to add subcategory: ' + error.message);
    } else {
      setIsAddingSubcategory(false);
      setNewSubcategory({ name: '', description: '', categoryId: '' });
      fetchCategoriesAndSubs();
    }
  };

  // Edit Category
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({ name: category.name, description: category.description });
  };

  // Update Category
  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategory.name.trim()) return;

    const { error } = await supabase
      .from('categories')
      .update({
        name: newCategory.name,
        description: newCategory.description
      })
      .eq('id', editingCategory.id);

    if (error) {
      alert('Failed to update category: ' + error.message);
    } else {
      setEditingCategory(null);
      setNewCategory({ name: '', description: '' });
      fetchCategoriesAndSubs();
    }
  };

  // Delete Category (and its subcategories)
  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Delete category and all its subcategories?')) return;

    // Delete subcategories first
    const { error: delSubErr } = await supabase
      .from('subcategories')
      .delete()
      .eq('category_id', categoryId);

    if (delSubErr) {
      alert('Failed to delete subcategories: ' + delSubErr.message);
      return;
    }

    // Delete category
    const { error: delCatErr } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (delCatErr) {
      alert('Failed to delete category: ' + delCatErr.message);
    } else {
      fetchCategoriesAndSubs();
    }
  };

  // Delete Subcategory
  const handleDeleteSubcategory = async (subcategoryId) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;

    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', subcategoryId);

    if (error) {
      alert('Failed to delete subcategory: ' + error.message);
    } else {
      fetchCategoriesAndSubs();
    }
  };

  // Get category name by ID helper
  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
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

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar onSignOut={handleSignOut} />

      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
              <p className="text-gray-600">Manage test categories and subcategories</p>
            </div>
            <div className="flex space-x-3">
              {/* Add Category */}
              <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                    <DialogDescription>Create a new test category</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="categoryName">Category Name</Label>
                      <Input
                        id="categoryName"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        placeholder="Enter category name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoryDescription">Description</Label>
                      <Input
                        id="categoryDescription"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        placeholder="Enter category description"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddingCategory(false)}>Cancel</Button>
                      <Button onClick={handleAddCategory}>Add Category</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Add Subcategory */}
              <Dialog open={isAddingSubcategory} onOpenChange={setIsAddingSubcategory}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Tag className="h-4 w-4 mr-2" /> Add Subcategory
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Subcategory</DialogTitle>
                    <DialogDescription>Create a new subcategory under a parent category</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="parentCategory">Parent Category</Label>
                      <select
                        id="parentCategory"
                        value={newSubcategory.categoryId}
                        onChange={(e) => setNewSubcategory({ ...newSubcategory, categoryId: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select parent category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="subcategoryName">Subcategory Name</Label>
                      <Input
                        id="subcategoryName"
                        value={newSubcategory.name}
                        onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
                        placeholder="Enter subcategory name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subcategoryDescription">Description</Label>
                      <Input
                        id="subcategoryDescription"
                        value={newSubcategory.description}
                        onChange={(e) => setNewSubcategory({ ...newSubcategory, description: e.target.value })}
                        placeholder="Enter subcategory description"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddingSubcategory(false)}>Cancel</Button>
                      <Button onClick={handleAddSubcategory}>Add Subcategory</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Lists */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderTree className="h-5 w-5 mr-2" /> Categories ({categories.length})
                </CardTitle>
                <CardDescription>Main test categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline">
                            {subcategories.filter((sub) => sub.category_id === category.id).length} subcategories
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Created: {new Date(category.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
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
                  <Tag className="h-5 w-5 mr-2" /> Subcategories ({subcategories.length})
                </CardTitle>
                <CardDescription>Subcategories under main categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subcategories.map((subcategory) => (
                    <div key={subcategory.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{subcategory.name}</h3>
                        <p className="text-sm text-gray-600">{subcategory.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge className="bg-blue-100 text-blue-800">{getCategoryName(subcategory.category_id)}</Badge>
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
        </div>

        {/* Edit Category Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Update category information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editCategoryName">Category Name</Label>
                <Input
                  id="editCategoryName"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <Label htmlFor="editCategoryDescription">Description</Label>
                <Input
                  id="editCategoryDescription"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
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
  );
}
