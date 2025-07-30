"use client"

import { useState } from "react"
import { Sliders } from "lucide-react"

export function MobileFilters({
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
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white p-4 rounded-lg shadow"
      >
        <span>الفلاتر</span>
        <Sliders className="w-5 h-5" />
      </button>
      {isOpen && (
        <div className="mt-4 bg-white rounded-lg shadow-md p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-2">الفئات</h3>
              <ul className="space-y-2">
                {data?.allCategories.map((category: any) => (
                  <li
                    key={category.id}
                    className={`p-2 rounded cursor-pointer ${
                      parentCategory?.slug === category.slug ? "bg-gray-200" : ""
                    }`}
                    onClick={() => {
                      setParentCategory(category)
                      handleFilterChange()
                    }}
                  >
                    {category.name} ({category.number_of_products})
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <label className="block font-bold mb-2">الموديل</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="ابحث عن موديل"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">السنة</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={yearFrom || ""}
                  onChange={(e) => setYearFrom(Number(e.target.value))}
                  className="w-1/2 p-2 border rounded"
                  placeholder="من"
                />
                <input
                  type="number"
                  value={yearTo || ""}
                  onChange={(e) => setYearTo(Number(e.target.value))}
                  className="w-1/2 p-2 border rounded"
                  placeholder="إلى"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold mb-2">السعر</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={priceMin || ""}
                  onChange={(e) => setPriceMin(Number(e.target.value))}
                  className="w-1/2 p-2 border rounded"
                  placeholder="الحد الأدنى"
                />
                <input
                  type="number"
                  value={priceMax || ""}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-1/2 p-2 border rounded"
                  placeholder="الحد الأقصى"
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              handleFilterChange()
              setIsOpen(false)
            }}
            className="w-full bg-red-500 text-white py-2 px-4 rounded mt-4 hover:bg-red-600 transition-colors"
          >
            تطبيق الفلاتر
          </button>
        </div>
      )}
    </div>
  )
}

