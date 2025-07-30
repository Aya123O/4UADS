export default function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const categorySlug = searchParams.category_slug;

  return (
    <div>
      <h1>Products for category: {categorySlug}</h1>
      {/* You'll add API fetching here later */}
    </div>
  );
}