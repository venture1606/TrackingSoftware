// LoadingBalls.jsx
import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/loading.json'; // Adjust the path as needed

const Loading = () => {
  return (
    <div style={{ width: 200, height: 300 }}>
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
      />
    </div>
  );
};

export default Loading;
