export const dynamic = 'force-dynamic'; // Ensure dynamic server-side rendering

interface Product {
  id: number;
  name: string;
  // Add other product fields
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category_slug: string }
}) {
  if (!searchParams.category_slug) {
    return <div>Please select a category</div>;
  }

  // Fetch products for this category
  let products: Product[] = [];
  try {
    const res = await fetch(
      `https://new.4youad.com/api/products?category=${encodeURIComponent(searchParams.category_slug)}`
    );
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    products = data.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return <div>Error loading products</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        Products for {decodeURIComponent(searchParams.category_slug)}
      </h1>
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold">{product.name}</h2>
              {/* Render other product details */}
            </div>
          ))}
        </div>
      ) : (
        <div>No products found in this category</div>
      )}
    </div>
  );
}