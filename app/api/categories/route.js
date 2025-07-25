import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request) {
  const body = await request.json();
  const { name, description } = body;

  if (!name || typeof name !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid category name' }), { status: 400 });
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, description }]);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data[0]), { status: 201 });
}

export async function PATCH(request) {
  const body = await request.json();
  const { id, name, description } = body;

  if (!id || !name) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }

  const { data, error } = await supabase
    .from('categories')
    .update({ name, description })
    .eq('id', id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data[0]), { status: 200 });
}

export async function DELETE(request) {
  const body = await request.json();
  const { id } = body;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
  }

  // Delete subcategories first for data integrity
  await supabase.from('subcategories').delete().eq('category_id', id);

  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: 'Category deleted' }), { status: 200 });
}
