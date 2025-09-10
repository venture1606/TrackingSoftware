import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDisclosure, Button } from '@chakra-ui/react';

import Product from '../services/Product';
import Loading from '../hooks/Loading';
import Graph from '../hooks/Graph';
import FormDialog from '../hooks/FormDialog';
import Confirmation from '../hooks/Confirmation';

import ProductImage from '../assets/ProductImage.jpg';
import { Icon } from '@iconify/react/dist/iconify.js';

function ShowProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const product = useSelector((state) => state.product.singleProduct);

  const initialGraphData = useMemo(() => product || {}, [product]);

  // Delete confirmation modal
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  // Graph form modal
  const {
    isOpen: isGraphOpen,
    onOpen: onGraphOpen,
    onClose: onGraphClose,
  } = useDisclosure();

  const { loading, handleGetSingleProduct, handleDeleteProduct, handleAddGraphData } = Product();


  useEffect(() => {
    handleGetSingleProduct(id);
  }, [id]);

  const handleConfirmDelete = () => {
    handleDeleteProduct(id);
    onDeleteClose();
    navigate(-1);
  };

  const graphData = product?.graph || [];

  // Format graph data for Graph component
  const length = graphData[0]?.data?.length || 0;
  const formattedData = Array.from({ length }, (_, i) => {
    const obj = { index: i + 1 };
    graphData.forEach((series) => {
      obj[series.name] = series.data[i];
    });
    return obj;
  });

  const formattedSeries = graphData.map((series) => ({
    name: series.name,
    color: 'teal.solid',
  }));

  let graphFormArray = product.graph || [];

  if (loading) return <Loading />;

  return (
    <div className='AppRightContainer ShowProductContainer'>
      {/* Header */}
      <div className='ShowProductHeader'>
        <h1>{product?.name}</h1>
        <Button onClick={onDeleteOpen} colorScheme='red' leftIcon={<Icon icon='fluent:delete-28-regular' />}>
          Delete
        </Button>
      </div>

      {/* Delete Confirmation */}
      <Confirmation
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleConfirmDelete}
      />

      <div className='ShowProductDetailsContainer'>
        {/* Left Section */}
        <div className='ShowProductLeftContainer'>
          <img
            src={ProductImage}
            alt={`${product?.name} Image`}
            className='ShowProductImage'
          />

          {/* Graph */}
          <Graph
            data={formattedData}
            series={formattedSeries}
            xKey='index'
            yKey={graphData.map((g) => g.name)}
            xLabel='Data Point'
            yLabel='Pressure Drop'
          />

          {/* Graph Form Button */}
          <Button mt={4} onClick={onGraphOpen} colorScheme='teal'>
            Edit / Add Graph Data
          </Button>

          {/* Graph Form Modal */}
          <FormDialog
            IndicationText='Edit or Add Graph Data'
            graphFormArray={graphFormArray}
            initialData={initialGraphData}
            handleSubmit={(data) => handleAddGraphData({ newData: data })}
            isOpen={isGraphOpen}
            onClose={onGraphClose}
            mode='edit-graph'
          />

          <p>{product?.description}</p>
        </div>

        {/* Right Section */}
        <div className='ShowProductRightContainer'>
          <h2>Technical Specification</h2>
          <div className='ShowProductRightContent'>
            <p>Part No: {product?.partNo}</p> <hr />
            <p>Series: {product?.series}</p> <hr />
            <p>Port Size: {product?.portSize}</p> <hr />
            <p>Body Size: {product?.bodySize}</p> <hr />
            <p>Material: {product?.material}</p> <hr />
            <p>Standard: {product?.standard}</p> <hr />
            <p>Operating Pressure: {product?.operatingPressure}</p> <hr />
            <p>Pressure Drop: {product?.pressureDrop}</p> <hr />
            <p>Rated Flow: {product?.ratedFlow}</p> <hr />
            <p>Sealing Material: {product?.sealingMaterial}</p> <hr />
            <p>Suggested Flow: {product?.suggestedFlow}</p> <hr />
            <p>Temperature: {product?.temperature}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowProduct;
