'use client'
import React, { useState, useEffect } from 'react';
import ChooseExistingAddressForm from './ChooseExistingAddressForm';
import CreateNewAddressForm from './CreateNewAddressForm';
import { useTranslations } from 'next-intl';
type AddressFormType = 'existing' | 'new';

const ShippingAddressManager: React.FC = () => {
  const [formType, setFormType] = useState<AddressFormType>('existing');
  const [refreshKey, setRefreshKey] = useState(0);
  const t = useTranslations();
  const handleAddressCreated = () => {
    // Trigger refresh of existing addresses by updating the key
    setRefreshKey(prev => prev + 1);
    // Switch to existing addresses view after creating a new one
    setFormType('existing');
  };

  const handleAddressSelected = (addressId: string) => {}
  const handleAddressDeleted = () => {
    // Trigger refresh when address is deleted
    setRefreshKey(prev => prev + 1);
  }

  return (
    <div className="space-y-6">
      {/* Form Type Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('Shipping Address')}</h2>
        
        <div className="flex space-x-4 rtl:space-x-reverse mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="address_form_type"
              value="existing"
              checked={formType === 'existing'}
              onChange={(e) => setFormType(e.target.value as AddressFormType)}
              className="text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('Use Existing Address')}
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="address_form_type"
              value="new"
              checked={formType === 'new'}
              onChange={(e) => setFormType(e.target.value as AddressFormType)}
              className="text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('Add New Address')}
            </span>
          </label>
        </div>
           {/* Form Components */}
      {formType === 'existing' && (
        <ChooseExistingAddressForm
          key={refreshKey}
          onAddressSelected={handleAddressSelected}
          onAddressDeleted={handleAddressDeleted}
        />
      )}

      {formType === 'new' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('Create New Address')}</h2>
          <CreateNewAddressForm onAddressCreated={handleAddressCreated} />
        </div>
      )}
      </div>

   

    
    </div>
  );
};

export default ShippingAddressManager;
