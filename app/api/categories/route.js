import { supabase } from '@/utils/supabaseClient';

// GET: categories with nested subcategories
export async function GET() {
  const { data, error } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      subcategories (
        id,
        name
      )
    `)
    .order('name', { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify(data), { status: 200 });
}

// POST: add new category
export async function POST(request) {
  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid category name' }), { status: 400 });
  }

  const { error } = await supabase.from('categories').insert([{ name }]);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: 'Category added' }), { status: 200 });
}
