'use client'
import React, { useRef } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import FormikInput from '@/components/phone/formikInput';
import * as Yup from 'yup';
import MapComponent from './map';
import TextArea from '@/components/phone/textarea';
import CountryPhoneInput from '@/components/phone/countryphoneInput';
import FormikCountrySearchSelect from '@/components/phone/formikCountrySearchSelect';
import axios from 'axios';
import { useAuth } from '@/app/hooks/useAuth';
import FormikCitySearchSelect from '../../phone/formikCitySearchSelect';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
interface CreateAddressData {
  name: string;
  address: string;
  contact_phone: string;
  countryCode: string;
  country: string;
  house: string;
  street: string;
  notes: string;
  lat: string;
  lng: string;
  city_id: string;
  country_id: string;
}

interface CreateNewAddressFormProps {
  onAddressCreated?: (addressData: CreateAddressData) => void;
  mode?: 'create' | 'edit';
  addressId?: number;
  initialValuesOverride?: Partial<CreateAddressData>;
}

const CreateNewAddressForm: React.FC<CreateNewAddressFormProps> = ({ onAddressCreated, mode = 'create', addressId, initialValuesOverride }) => {
  const { token } = useAuth()
  const searchInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations();
  const initialValues: CreateAddressData = {
    name: '',
    address: '',
    contact_phone: '',
    countryCode: 'SA',
    country: 'SA',
    house: '',
    street: '',
    notes: '',
    lat: '',
    lng: '',
    city_id: '',
    country_id: '',
  }
  const mergedInitialValues: CreateAddressData = {
    ...initialValues,
    ...(initialValuesOverride as CreateAddressData | undefined),
  };

  const validationSchema = Yup.object({
    name: Yup.string().notRequired().nullable().min(2, (t('Name must be at least 2 characters'))),
    contact_phone: Yup.string().notRequired().nullable().matches(/^[0-9]*$/, (t('Phone number must contain only digits'))).min(7, (t('Phone number must be at least 7 digits'))).max(15, (t('Phone number must not exceed 15 digits'))),
    country: Yup.string().required(t('Country is required')),
    address: Yup.string().required(t('Address is required')),
    lat: Yup.string().required(t('Latitude is required')),
    lng: Yup.string().required(t('Longitude is required')),
    city_id: Yup.string().required(t('City ID is required')),
    country_id: Yup.string().required(t('Country ID is required')),
    street: Yup.string().notRequired().nullable(),
    house: Yup.string().notRequired().nullable(),
    notes: Yup.string().notRequired().nullable().max(500, (t('Notes must not exceed 500 characters'))),
  });

  const onSubmit = async(values: CreateAddressData, { resetForm, setFieldTouched, }: FormikHelpers<CreateAddressData>) => {
    // Check if location is selected
    if (!values.lat || !values.lng) {
      toast.error(t('Please select a location on the map'));
      setFieldTouched('lat', true);
      setFieldTouched('lng', true);
      return;
    }
    
    if (!values.city_id || !values.country_id) {
      toast.error(t('Please select country and city'));
      return;
    }

    const endpoint = mode === 'edit' && addressId
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/customer/update-address/${addressId}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/customer/create-address`;

    const response = await axios.post(endpoint, values, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if(response.data.status){
      toast.success(response.data.message);
      resetForm();
      // Trigger refresh of existing addresses
      onAddressCreated?.(values);
    } else {
      toast.error(response.data.message);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800  border-gray-200 dark:border-gray-700 p-1">

        <Formik
          initialValues={mergedInitialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
        >
          {({ values, setFieldValue, handleChange, handleBlur, errors, touched, isSubmitting }) => {
            // Debug: Log validation errors
            // console.log('Form errors:', errors);
            // console.log('Form touched:', touched);
            
            return (
            <Form>
              <div className="space-y-4">
                {/* Location Search Input */}
             

                <MapComponent
                  searchInputRef={searchInputRef}
                  onLocationSelect={(lat: number, lng: number, address?: string) => {
                    setFieldValue('lat', String(lat));
                    setFieldValue('lng', String(lng));
                    if (address) {  
                      setFieldValue('address', address);
                    }
                  }}
                />
                   <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    {t('Search Location')}
                  </label>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('Search for a location')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                {/* Map Location Validation Display */}
                <div className="space-y-2">
                  {(errors.lat || errors.lng) && (touched.lat || touched.lng) && (
                    <div className="text-red-600 text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                          {t('Please select a location on the map')}
                    </div>
                  )}
                  {values.lat && values.lng && !errors.lat && !errors.lng && (
                    <div className="text-green-600 text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {t('Location selected successfully')}
                    </div>
                  )}
                </div>

                <FormikInput
                  name="name"
                  label={`${t('Name')} (${t('optional')})` as string}
                  placeholder={t('Enter your name')}
                />

                <FormikCountrySearchSelect
                  name="country_id"
                  label={t("Country")}
                  placeholder={t('Select your country')}
                  required
                />
                
                <FormikCitySearchSelect
                  name="city_id"
                  label={t("City")}
                  placeholder={t('Select your city')}
                  required
                />    
                <CountryPhoneInput
                  value={values.contact_phone}
                  onChange={(phoneValue, countryCode) => {
                    handleChange({
                      target: {
                        name: 'contact_phone',
                        value: phoneValue
                      }
                    } as React.ChangeEvent<HTMLInputElement>);
                    handleChange({
                      target: {
                        name: 'countryCode',
                        value: countryCode
                      }
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                  onBlur={handleBlur}
                  error={errors.contact_phone}
                  touched={touched.contact_phone}
                  disabled={isSubmitting}
                  label={t('Phone Number (optional)')}
                  initialCountryCode="SA"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormikInput
                    name="address"
                    label={t('Address')}
                    placeholder={t('Enter your address')}
                    required
                  />
                  <FormikInput
                    name="street"
                    label={`${t('Street Address')} (${t('optional')})` as string}
                    placeholder={`${t('Enter your street address')} (${t('optional')})`}
                  />
                  <FormikInput
                    name="house"
                    label={`${t('Apartment')} (${t('optional')})` as string}
                    placeholder={`${t('Enter your apartment')} (${t('optional')})`}
                  />
                </div>
                
                <TextArea
                  name="notes"
                  label={`${t('Notes')} (${t('optional')})` as string}
                  placeholder={`${t('Add any delivery notes')} (${t('optional')})`}
                  rows={4}
                />

                {/* Hidden lat/lng fields */}
                <input type="hidden" name="lat" value={values.lat} />
                <input type="hidden" name="lng" value={values.lng} />

                <button type="submit" className="te-btn te-btn-primary w-full" disabled={isSubmitting}>
                  {isSubmitting ?   t('Saving') : (mode === 'edit' ? t('Update Address') : t('Save Address'))}
                </button>
              </div>
            </Form>
            );
          }}
        </Formik>
      </div>
  );
};

export default CreateNewAddressForm;
