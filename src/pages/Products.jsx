import React from 'react'

// importing components
import ProductListCard from '../components/ProductListCard';

// Importing styles
import '../styles/product.css'

// Importing Data
import ItemsData from '../utils/ItemsData'

function Products() {

    const { Products } = ItemsData;

  return (
    <div className='AppRightContainer ProductsContainer'>
      <h1>Products</h1>
      <div className='ProductListContainer'>
        {
          Products.map((product, index) => (
            <ProductListCard key={index} product={product} />
          ))
        }
      </div>
    </div>
  )
}

export default Products