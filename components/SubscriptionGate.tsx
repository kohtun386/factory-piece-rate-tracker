import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PaywallExpiredPage from './PaywallExpiredPage';

interface SubscriptionGateProps {
  children: ReactNode;
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ children }) => {
  const { clientData } = useAuth();

  if (!clientData) {
    // Should not happen if gate is used correctly, but good for safety
    return <PaywallExpiredPage clientName="Guest" />;
  }

  const { subscriptionStatus, trialEndDate } = clientData;

  if (subscriptionStatus === 'PAID') {
    return <>{children}</>;
  }

  if (subscriptionStatus === 'TRIAL') {
    if (trialEndDate && trialEndDate.toDate() > new Date()) {
      return <>{children}</>; // Trial is active
    }
  }
  
  // All other cases (TRIAL expired, invalid status) fall through to the paywall.
  return <PaywallExpiredPage clientName={clientData.clientName} />;
};

export default SubscriptionGate;
