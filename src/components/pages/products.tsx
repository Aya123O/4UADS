import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function ProductsPage() {
  const router = useRouter();
  const { category_slug } = router.query;
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (category_slug) {
      fetch(`https://new.4youad.com/api/products?category_slug=${category_slug}`)
        .then(res => res.json())
        .then(data => setProducts(data.data));
    }
  }, [category_slug]);

  return (
    <div>
      <h1>Products for {category_slug}</h1>
      <pre>{JSON.stringify(products, null, 2)}</pre>
    </div>
  );
}