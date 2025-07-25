'use client';

import { useEffect, useState } from 'react';
import CategoriesClient from '@/components/CategoriesClient';

export default function CategoriesPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Categories</h1>
      <CategoriesClient />
    </div>
  );
}
