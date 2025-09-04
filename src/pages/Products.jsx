import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"

// importing components
import ProductListCard from "../components/ProductListCard"
import Loading from "../hooks/Loading"
import FormDialog from "../hooks/FormDialog"

// importing API's
import Product from "../services/Product"

// Importing styles
import "../styles/product.css"

function Products() {
  const Products = useSelector((state) => state.product.products)
  const { handleGetAllProducts, handleCreateProduct, loading } = Product()

  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    handleGetAllProducts()
  }, [])

  // ✅ Schema-based form config
  let FormArray = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    { key: "partNo", label: "Part No" },
    { key: "series", label: "Series" },
    { key: "image", label: "Image" },
    { key: "portSize", label: "Port Size" },
    { key: "bodySize", label: "Body Size" },
    { key: "material", label: "Material" },
    { key: "standard", label: "Standard" },
    { key: "operatingPressure", label: "Operating Pressure" },
    { key: "pressureDrop", label: "Pressure Drop" },
    { key: "ratedFlow", label: "Rated Flow" },
    { key: "sealingMaterial", label: "Sealing Material" },
    { key: "suggestedFlow", label: "Suggested Flow" },
    { key: "temperature", label: "Temperature" },
  ]

  let SelectArray = [
    {
      key: "status",
      label: "Status",
      options: [
        "Waiting for order",
        "Order confirm",
        "Under progress",
        "Supplied to customer",
      ],
    },
  ]

  // ✅ handle product creation
  const handleFormSubmit = (data) => {
    handleCreateProduct(data)
    setIsFormOpen(false) // close modal after save
  }

  return (
    <div className="AppRightContainer ProductsContainer">
      <h1>Products</h1>

      {/* Button to open modal */}
      <button
        className="AddProductButton"
        onClick={() => setIsFormOpen(true)}
      >
        + Add New Product
      </button>

      {/* FormDialog Modal */}
      {isFormOpen && (
        <FormDialog
          IndicationText="Add New Product"
          FormArray={FormArray}
          SelectArray={SelectArray}
          handleSubmit={handleFormSubmit}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      <div className="ProductListContainer">
        {loading ? (
          <Loading />
        ) : (
          Products.map((product, index) => (
            <ProductListCard key={index} product={product} />
          ))
        )}
      </div>
    </div>
  )
}

export default Products
