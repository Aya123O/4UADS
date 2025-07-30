import Link from "next/link"

export function AdCard({ item, formatDate }: { item: any, formatDate: (date: string) => string }) {
  return (
    <div className="bg-white border p-4 rounded-lg flex flex-col shadow-md hover:shadow-lg transition-shadow">
      <div className="mb-4">
        {item.images && item.images.length > 0 ? (
          <img
            src={`https://dashboard.4youad.com/storage/${item.images[0]}`}
            alt={item.name}
            className="rounded-lg object-cover w-full h-48"
          />
        ) : (
          <img
            src="https://via.placeholder.com/300x200?text=No+Image"
            alt="No Image"
            className="rounded-lg object-cover w-full h-48"
          />
        )}
      </div>
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold mb-2">{item.name}</h3>
          <p className="text-2xl font-bold text-yellow-500 mb-4">{item.price.toLocaleString()} ج.م</p>
          <p className="text-sm text-gray-600 mb-4">
            {item.address} · {formatDate(item.created_at)}
          </p>
        </div>
        <div className="flex justify-end">
          <Link href={`/ad/${item.slug}`}>
            <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
              تفاصيل
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

