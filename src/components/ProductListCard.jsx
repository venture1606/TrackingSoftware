import React from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useNavigate } from 'react-router-dom'


// Importing Components
import FormDialog from '../hooks/FormDialog'

// importing styles
import '../styles/dashboard.css'

function ProductListCard({ product }) {

  const navigate = useNavigate()
  const handleEdit = () => {
    // Open the form dialog with the product details
  }

  return (
    <div className='ProductListCardContainer' onClick={() => navigate(`/products/${product._id}`)}>
        <div className='ProductListCardHeader'>
          <span id='product-name'>{product.name}</span>
          {/* <Icon icon="lucide:edit" className='IconButtonStyle ProductListEditIcon' /> */}
        </div>
        <div className='ProductListCardBody'>
            <span>Status: {product.status}</span>
            <span id='product-code'>{product.partNo}</span>
        </div>
    </div>
  )
}

export default ProductListCard