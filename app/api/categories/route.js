import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  const { data, error } = await supabase
    .from('categories')
    .select('*, subcategories(*)')
    .order('created_at', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request) {
  const body = await request.json();

  const { name, icon, status = true } = body;

  const { data, error } = await supabase.from('categories').insert([
    { name, icon, status },
  ]);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data[0]), { status: 201 });
}
