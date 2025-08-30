import React from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'

// importing styles
import '../styles/dashboard.css'

function ProductListCard({ product }) {
  return (
    <div className='ProductListCardContainer'>
        <div className='ProductListCardHeader'>
          <span id='product-name'>{product.name}</span>
          <Icon icon="lucide:edit" className='IconButtonStyle ProductListEditIcon'/>
        </div>
        <div className='ProductListCardBody'>
            <span>Status: {product.status}</span>
            <span id='product-code'>{product.partNo}</span>
        </div>
    </div>
  )
}

export default ProductListCard