// app/api/subcategories/route.js
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category_id');

  try {
    let query = supabase
      .from('subcategories')
      .select('*');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data: subcategories, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(subcategories);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { data: subcategory, error } = await supabase
      .from('subcategories')
      .insert(body)
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
