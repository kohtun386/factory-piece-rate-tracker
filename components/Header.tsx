
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
        Digital Piece-Rate Tracker
      </h1>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
        Factory Management System - Version 1.0
      </p>
    </header>
  );
};

export default Header;
