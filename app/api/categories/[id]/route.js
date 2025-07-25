// app/api/categories/[id]/route.js
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const { data: category, error } = await supabase
      .from('categories')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(category);
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
    
    // First delete all subcategories under this category
    await supabase
      .from('subcategories')
      .delete()
      .eq('category_id', id);

    // Then delete the category
    const { error } = await supabase
      .from('categories')
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
