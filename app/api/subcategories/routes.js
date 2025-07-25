import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  const { data, error } = await supabase
    .from('subcategories')
    .select('*, category:categories(name)')
    .order('created_at', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request) {
  const body = await request.json();
  const { name, category_id, status = true } = body;

  const { data, error } = await supabase
    .from('subcategories')
    .insert([{ name, category_id, status }])
    .select();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data[0]), { status: 201 });
}
