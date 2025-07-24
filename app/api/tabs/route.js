import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  const { data, error } = await supabase
    .from('tabs')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, type } = body;

    if (!name || !type) {
      return new Response(JSON.stringify({ error: 'Name and type are required' }), { status: 400 });
    }

    const { data, error } = await supabase
      .from('tabs')
      .insert([{ name, description, type }])
      .select();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data[0]), { status: 201 });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, name, description, type } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400 });
    }

    const updates = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (type) updates.type = type;

    const { data, error } = await supabase
      .from('tabs')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    if (!data.length) {
      return new Response(JSON.stringify({ error: 'Tab not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(data[0]), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID query param is required' }), { status: 400 });
    }

    const { data, error } = await supabase.from('tabs').delete().eq('id', id).select();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    if (!data.length) {
      return new Response(JSON.stringify({ error: 'Tab not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Tab deleted successfully' }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Error deleting tab' }), { status: 500 });
  }
}
