// Loader.tsx
import React from 'react';
import '../App.css'; // CSS for styling the loader

const Loader: React.FC = () => (
  <div className='flex items-center justify-center bg-opacity-10'>
  <div className="mt-20">
    <div className="loader-circle">
      <div className="circle"></div>
      <div className="circle"></div>
      <div className="circle"></div>
    </div>
  </div>
  </div>
);

export default Loader;
