"use client";

import React, { useState } from 'react';
import CreateNewAddressForm from './CreateNewAddressForm';
import ChooseExistingAddressForm from './ChooseExistingAddressForm';
import { useTranslations } from 'next-intl';

const TestAddressRefresh: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const t = useTranslations();
  const handleAddressCreated = () => {
    // console.log('Address created, refreshing existing addresses...');
    setRefreshKey(prev => prev + 1);
  };

  const handleAddressDeleted = () => {
    // console.log('Address deleted, refreshing existing addresses...');
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold">{t('Test Address Refresh')}</h2>
      
      <div className="bg-blue-50 p-4 rounded">
        <h3 className="font-semibold mb-2">{t('Create New Address')}</h3>
        <CreateNewAddressForm onAddressCreated={handleAddressCreated} />
      </div>

      <div className="bg-green-50 p-4 rounded">
        <h3 className="font-semibold mb-2">{t('Existing Addresses')} (Refresh Key: {refreshKey})</h3>
        <ChooseExistingAddressForm
          key={refreshKey}
          onAddressDeleted={handleAddressDeleted}
        />
      </div>
    </div>
  );
};

export default TestAddressRefresh;
