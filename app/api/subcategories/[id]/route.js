import { supabase } from '@/utils/supabaseClient';

export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json();
  const { name, category_id, status } = body;

  const { data, error } = await supabase
    .from('subcategories')
    .update({ name, category_id, status })
    .eq('id', id)
    .select();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data[0]), { status: 200 });
}

export async function DELETE(request, { params }) {
  const { id } = params;

  const { error } = await supabase.from('subcategories').delete().eq('id', id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: 'Subcategory deleted' }), {
    status: 200,
  });
}
