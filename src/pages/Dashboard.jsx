import React from 'react'

// importing styles
import '../styles/dashboard.css'
import ProductListCard from '../components/ProductListCard'

// importing the datas
import ItemsData from '../utils/ItemsData'

function Dashboard() {

  const { DepartmentsList, Products } = ItemsData;

  return (
    <div className='AppRightContainer DashboardContainer'>
      <h1>Dashboard</h1>
      {/* write the code to print the ProductCard for 10 times */}
      {/* <div className='ProductListContainer'>
        {
          Products.map((product, index) => (
            <ProductListCard key={index} product={product} />
          ))
        }
      </div> */}
      <p>Right now it is empty</p>
    </div>
  )
}

export default Dashboard