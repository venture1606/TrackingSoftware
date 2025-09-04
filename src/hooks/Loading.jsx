// LoadingBalls.jsx
import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/loading.json'; // Adjust the path as needed

import '../styles/hooks.css';

const Loading = () => {
  return (
    <div className='LoadingContainer'>
      <Lottie
        style={{ width: 50, height: 50 }}
        animationData={animationData}
        loop={true}
        autoplay={true}
      />
      <span>
        Loading... <br/><b>Please wait</b>
      </span>
    </div>
  );
};

export default Loading;
