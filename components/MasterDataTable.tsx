
import React from 'react';
import { Worker } from '../types';

interface MasterDataTableProps {
  data: Worker[];
}

const MasterDataTable: React.FC<MasterDataTableProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">Worker ID</th>
            <th scope="col" className="px-6 py-3">Worker Name</th>
            <th scope="col" className="px-6 py-3">Job Position</th>
            <th scope="col" className="px-6 py-3">Product Type</th>
            <th scope="col" className="px-6 py-3 text-right">Piece Rate (Ks)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((worker, index) => (
            <tr key={worker.workerId} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {worker.workerId}
              </td>
              <td className="px-6 py-4">{worker.workerName}</td>
              <td className="px-6 py-4">{worker.jobPosition}</td>
              <td className="px-6 py-4">{worker.productType}</td>
              <td className="px-6 py-4 text-right font-semibold text-blue-600 dark:text-blue-400">
                {worker.pieceRateKs.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MasterDataTable;
