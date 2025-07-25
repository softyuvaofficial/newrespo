// app/api/subcategories/[id]/route.js
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const { data: subcategory, error } = await supabase
      .from('subcategories')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(subcategory);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
