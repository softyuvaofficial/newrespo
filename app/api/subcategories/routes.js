import { supabase } from '@/utils/supabaseClient';

// POST: add new subcategory
export async function POST(request) {
  const body = await request.json();
  const { categoryId, name } = body;

  if (!categoryId || !name) {
    return new Response(JSON.stringify({ error: 'categoryId and name are required' }), { status: 400 });
  }

  const { error } = await supabase
    .from('subcategories')
    .insert([{ category_id: categoryId, name }]);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: 'Subcategory added' }), { status: 200 });
}
