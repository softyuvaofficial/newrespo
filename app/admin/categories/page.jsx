import CategoriesClient from '@/components/CategoriesClient';

export const revalidate = 0; // no caching to keep data fresh

export default function AdminCategoriesPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold mb-8">Admin Categories</h1>
      <CategoriesClient />
    </main>
  );
}
