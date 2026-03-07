import React, { useState, Suspense, lazy } from 'react';
import { Box, Flex, Spinner } from '@chakra-ui/react';

// import styles
import '../styles/admin.css';

// Lazy load the components for code splitting & performance optimization
const UserDetails = lazy(() => import('../components/admin/UserDetails'));
const ProcessDetails = lazy(() => import('../components/admin/ProcessDetails'));
const DepartmentDetails = lazy(() => import('../components/admin/DepartmentDetails'));
const ProductDetails = lazy(() => import('../components/admin/ProductDetails'));

function Admin() {
  const DetailsTabs = [
    { label: 'User List', component: <UserDetails /> },
    { label: 'Process List', component: <ProcessDetails /> },
    { label: 'Department List', component: <DepartmentDetails /> },
    { label: 'Product List', component: <ProductDetails /> }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const renderContent = () => {
    // If no tab is selected, return nothing
    if (activeIndex === null || activeIndex === undefined) return null;

    // Get the component mapped to the current tab
    const CurrentComponent = DetailsTabs[activeIndex].component;

    return (
      <Suspense 
        fallback={
          <Flex justify="center" align="center" h="50vh" w="100%">
            <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" />
          </Flex>
        }
      >
        <Box w="100%" animation="fadeIn 0.5s">
           {CurrentComponent}
        </Box>
      </Suspense>
    );
  };

  return (
    <div className='AppRightContainer AdminContainer'>
      <div className='APIDetailsButtonContainer'>
        {DetailsTabs.map((tab, index) => (
          <button
            key={index}
            className={`APIDetailsButton ${activeIndex === index ? 'APIDetailsButtonActive' : ''}`}
            onClick={() => setActiveIndex(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className='APIDetailsContainer'>
        {renderContent()}
      </div>
    </div>
  );
}

export default Admin;
