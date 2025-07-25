import { supabase } from '@/utils/supabaseClient';

export async function POST(request) {
  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid name' }), { status: 400 });
  }

  const { error } = await supabase.from('categories').insert([{ name }]);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: 'Category added' }), { status: 200 });
}
