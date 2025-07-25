import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request) {
  const body = await request.json();
  const { name, description } = body;

  if (!name || typeof name !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid name' }), { status: 400 });
  }

  const { error } = await supabase.from('categories').insert([{ name, description }]);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ message: 'Category added' }), { status: 200 });
}

export async function PUT(request) {
  const body = await request.json();
  const { id, name, description } = body;

  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

  const { error } = await supabase.from('categories').update({ name, description }).eq('id', id);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ message: 'Category updated' }), { status: 200 });
}

export async function DELETE(request) {
  const body = await request.json();
  const { id } = body;

  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ message: 'Category deleted' }), { status: 200 });
}
