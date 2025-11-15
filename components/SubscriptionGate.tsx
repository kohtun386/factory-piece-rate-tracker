import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UpgradePage from './UpgradePage';

interface SubscriptionGateProps {
  children: ReactNode;
}

const asDate = (ts: any): Date | null => {
  if (!ts) return null;
  if (ts instanceof Date) return ts;
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (typeof ts.seconds === 'number') return new Date(ts.seconds * 1000);
  try {
    const d = new Date(ts);
    if (!isNaN(d.getTime())) return d;
  } catch (_) {}
  return null;
};

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ children }) => {
  const { clientData, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
      </div>
    );
  }

  if (!clientData) {
    return <UpgradePage />;
  }

  const subscriptionStatus = (clientData.subscriptionStatus || '').toLowerCase();

  // Support both `trialEndDate` and `trialEndsAt` naming used in codebase/history
  const rawTrial = (clientData as any).trialEndDate || (clientData as any).trialEndsAt || (clientData as any).trialEndsAt;
  const trialDate = asDate(rawTrial);

  const isTrialActive = subscriptionStatus === 'trial' && trialDate && trialDate > new Date();
  const isSubActive = subscriptionStatus === 'active';
  const isOk = isTrialActive || isSubActive;

  if (isOk) return <>{children}</>;

  return <UpgradePage />;
};

export default SubscriptionGate;
