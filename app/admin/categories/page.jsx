export const dynamic = 'force-dynamic';

import { supabase } from '@/utils/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AddCategoryForm from './_components/AddCategoryForm';

export default async function AdminCategoriesPage() {
  const { data: categories, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: subcategories, error: subcategoryError } = await supabase
    .from('subcategories')
    .select('*');

  if (categoryError || subcategoryError) {
    return (
      <div className="p-4 text-red-600">
        Error loading data: {categoryError?.message || subcategoryError?.message}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <AddCategoryForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories && categories.length > 0 ? (
            categories.map((cat) => (
              <div key={cat.id} className="border-b pb-2">
                <strong>{cat.name}</strong>
              </div>
            ))
          ) : (
            <div>No categories found</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subcategories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {subcategories && subcategories.length > 0 ? (
            subcategories.map((sub) => (
              <div key={sub.id} className="border-b pb-2">
                <strong>{sub.name}</strong> (Category ID: {sub.category_id})
              </div>
            ))
          ) : (
            <div>No subcategories found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
