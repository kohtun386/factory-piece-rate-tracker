import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { ProductionEntry } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { getPaginatedCollection } from '../lib/firebase';

const ITEMS_PER_PAGE = 50;

export interface ProductionDataHandle {
  refetch: () => Promise<void>;
}

interface ProductionDataProps {
  refreshCounter?: number;
}

const ProductionDataComponent = forwardRef<ProductionDataHandle, ProductionDataProps>(({ refreshCounter = 0 }, ref) => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [entries, setEntries] = useState<ProductionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const { items, lastVisible: cursor } = await getPaginatedCollection<ProductionEntry>(
        'productionEntries',
        ITEMS_PER_PAGE,
        'date'
      );
      setEntries(items);
      setLastVisible(cursor);
      setHasMore(cursor !== null);
      console.log(`Fetched ${items.length} production entries`);
    } catch (error) {
      console.error('Error fetching production data:', error);
      addToast('Failed to load production data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Expose refetch function via ref
  useImperativeHandle(ref, () => ({
    refetch: fetchInitialData,
  }), [addToast]);

  // Fetch initial data on mount
  useEffect(() => {
    fetchInitialData();
  }, [refreshCounter]);

  // Load more entries
  const handleLoadMore = async () => {
    if (!lastVisible || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const { items: moreItems, lastVisible: cursor } = await getPaginatedCollection<ProductionEntry>(
        'productionEntries',
        ITEMS_PER_PAGE,
        'date',
        lastVisible
      );

  setEntries((prev: ProductionEntry[]) => [...prev, ...moreItems]);
      setLastVisible(cursor);
      setHasMore(cursor !== null);
      console.log(`Loaded ${moreItems.length} more production entries`);
    } catch (error) {
      console.error('Error loading more data:', error);
      addToast('Failed to load more entries', 'error');
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loggingIn') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">{t('date')}</th>
              <th scope="col" className="px-6 py-3">{t('shift')}</th>
              <th scope="col" className="px-6 py-3">{t('workerName')}</th>
              <th scope="col" className="px-6 py-3">{t('taskName')}</th>
              <th scope="col" className="px-6 py-3 text-right">{t('completedQty')}</th>
              <th scope="col" className="px-6 py-3 text-right">{t('defectQty')}</th>
              <th scope="col" className="px-6 py-3 text-right">{t('pieceRateKs')}</th>
              <th scope="col" className="px-6 py-3 text-right">{t('basePayKs')}</th>
              <th scope="col" className="px-6 py-3 text-right">{t('deductionAmountKs')}</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {t('noDataForPeriod') || 'No production entries found'}
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {entry.date}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        entry.shift === 'Day' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
                    }`}>
                        {t(entry.shift.toLowerCase())}
                    </span>
                  </td>
                  <td className="px-6 py-4">{entry.workerName}</td>
                  <td className="px-6 py-4">{entry.taskName}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-800 dark:text-gray-200">
                    {entry.completedQuantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-800 dark:text-gray-200">
                    {entry.defectQuantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400">
                    {entry.pieceRate.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-green-600 dark:text-green-400">
                    {entry.basePay.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-red-600 dark:text-red-400">
                    {entry.deductionAmount.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-6 mb-4 noprint">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-semibold text-sm transition-colors"
          >
            {isLoadingMore ? (
              <span className="flex items-center gap-2">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                {t('loggingIn') || 'Loading...'}
              </span>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}

      {/* Data Summary */}
      {entries.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center noprint">
          <p>Showing {entries.length} entries {hasMore && '(more available)'}</p>
        </div>
      )}
    </div>
  );
});

ProductionDataComponent.displayName = 'ProductionData';
export default ProductionDataComponent;
