export function DesktopFilters({
  parentCategory,
  setParentCategory,
  model,
  setModel,
  yearFrom,
  setYearFrom,
  yearTo,
  setYearTo,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  handleFilterChange,
  data,
}: {
  parentCategory: any;
  setParentCategory: any;
  model: any;
  setModel: any;
  yearFrom: any;
  setYearFrom: any;
  yearTo: any;
  setYearTo: any;
  priceMin: any;
  setPriceMin: any;
  priceMax: any;
  setPriceMax: any;
  handleFilterChange: any;
  data: any;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-4">فئات</h2>
        <ul className="space-y-2">
          {data?.allCategories.map((category: any) => (
            <li
              key={category.id}
              className={`flex justify-between items-center hover:bg-gray-100 p-2 rounded transition-colors cursor-pointer ${
                parentCategory?.slug === category.slug ? "bg-gray-200" : ""
              }`}
              onClick={() => {
                setParentCategory(category)
                handleFilterChange()
              }}
            >
              <span className="text-sm text-gray-500">({category.number_of_products})</span>
              <span>{category.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-4">الفلاتر</h2>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            handleFilterChange()
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">الموديل</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="ابحث عن موديل"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">السنة</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={yearFrom || ""}
                onChange={(e) => setYearFrom(Number(e.target.value))}
                placeholder="من"
                className="w-1/2 p-2 border rounded"
              />
              <input
                type="number"
                value={yearTo || ""}
                onChange={(e) => setYearTo(Number(e.target.value))}
                placeholder="إلى"
                className="w-1/2 p-2 border rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">السعر</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={priceMin || ""}
                onChange={(e) => setPriceMin(Number(e.target.value))}
                placeholder="الحد الأدنى"
                className="w-1/2 p-2 border rounded"
              />
              <input
                type="number"
                value={priceMax || ""}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                placeholder="الحد الأقصى"
                className="w-1/2 p-2 border rounded"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
          >
            تطبيق الفلاتر
          </button>
        </form>
      </div>
    </div>
  )
}

export default DesktopFilters;