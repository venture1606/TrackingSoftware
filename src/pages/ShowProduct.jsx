import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useDisclosure } from '@chakra-ui/react'

import Product from '../services/Product'
import Loading from '../hooks/Loading'
import Graph from '../hooks/Graph'
import FormDialog from '../hooks/FormDialog'
import Confirmation from '../hooks/Confirmation'

import ProductImage from '../assets/ProductImage.jpg'
import { Icon } from '@iconify/react/dist/iconify.js'

function ShowProduct() {
    const { id } = useParams()
    const navigate = useNavigate()

    const { isOpen, onOpen, onClose } = useDisclosure()
    const { loading, handleGetSingleProduct, handleDeleteProduct, handleAddGraphData } = Product()

    const product = useSelector((state) => state.product.singleProduct)

    useEffect(() => {
        handleGetSingleProduct(id)
    }, [id])

    const handleConfirmDelete = () => {
        handleDeleteProduct(id)
        onClose()
        navigate(-1)
    }

    const graphData = product?.graph || []

  // Assume all graph series have the same length
  const length = graphData[0]?.data?.length || 0
  const formattedData = Array.from({ length }, (_, i) => {
    const obj = { index: i + 1 } // X-axis key
    graphData.forEach((series) => {
      obj[series.name] = series.data[i]
    })
    return obj
  })

  // Series info (for Graph legends/colors)
  const formattedSeries = graphData.map((series) => ({
    name: series.name,
    color: "teal.solid", // you can map colors dynamically
  }))

  let graphFormArray = product.graph || []

  if (loading) return <Loading />

  return (
    <div className=' AppRightContainer ShowProductContainer'>
        
        <div className='ShowProductHeader'>
            <h1>{product?.name}</h1>
            <button onClick={onOpen}>
                Delete 
                <Icon icon={'fluent:delete-28-regular'}/>
            </button>
        </div>

        <Confirmation
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirmDelete}
        />

        <div className='ShowProductDetailsContainer'>
            <div className='ShowProductLeftContainer'>
                <img 
                    src={ProductImage} 
                    alt={product?.name + " Image"} 
                    className='ShowProductImage'
                />
                <Graph
                    data={formattedData}
                    series={formattedSeries}
                    xKey="index"
                    yKey={graphData.map((g) => g.name)} // multiple Y series
                    xLabel="Data Point"
                    yLabel="Pressure Drop"
                />
                <FormDialog 
                    IndicationText={'Edit or Add graph data'}
                    graphFormArray={graphFormArray}
                    handleSubmit={(data) => handleAddGraphData({ newData: data, id: product.id })}
                />
                <p>{product?.description}</p>
            </div>
            <div className='ShowProductRightContainer'>
                <h2>Technical Specification</h2>
                <div className='ShowProductRightContent'>
                    <p>Part No: {product?.partNo}</p> <hr/>
                    <p>Series: {product?.series}</p> <hr/>
                    <p>Port Size: {product?.portSize}</p> <hr/>
                    <p>Body Size: {product?.bodySize}</p> <hr/>
                    <p>Material: {product?.material}</p> <hr/>
                    <p>Standard: {product?.standard}</p> <hr/>
                    <p>Operating Pressure: {product?.operatingPressure}</p> <hr/>
                    <p>Pressure Drop: {product?.pressureDrop}</p> <hr/>
                    <p>Rated Flow: {product?.ratedFlow}</p> <hr/>
                    <p>Sealing Material: {product?.sealingMaterial}</p><hr/>
                    <p>Suggested Flow: {product?.suggestedFlow}</p><hr/>
                    <p>Temperature: {product?.temperature}</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ShowProduct