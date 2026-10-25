import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const VerificationBadge = ({ status, size = 'sm' }) => {
  const { t } = useLanguage();

  if (status === 'verified') {
    return (
      <span className="badge badge-verified" title="Bhoomi Land Records Verified">
        <CheckCircle2 size={size === 'sm' ? 12 : 14} />
        {t('verified_farmer')}
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span className="badge badge-pending" title="Government RTC Verification in Review">
        <Clock size={size === 'sm' ? 12 : 14} />
        {t('pending_verification')}
      </span>
    );
  }

  return (
    <span className="badge badge-unverified" title="Unverified Seller">
      <AlertCircle size={size === 'sm' ? 12 : 14} />
      {t('unverified_farmer')}
    </span>
  );
};

export default VerificationBadge;
