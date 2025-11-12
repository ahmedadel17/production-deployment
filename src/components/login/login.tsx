"use client"
import { Formik, FormikHelpers } from 'formik';
import React, { useEffect } from 'react'
import axios from 'axios';
import { useRouter } from 'next/navigation';
import CountryPhoneInput from '../phone/countryphoneInput';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/app/hooks/useAuth';
import postRequest from '../../../helpers/post';
import * as countriesData from 'country-codes-flags-phone-codes';
function Login() {
    interface PhoneFormValues {
        phone: string;
        countryCode: string;
    }
    const t = useTranslations();
    const router = useRouter();
    const {token} = useAuth()
    const locale = useLocale();
    useEffect(() => {
      if(token){
        router.push('/')
      }
    }, [])
  return (
  
<>


        {/* <!-- Logo/Header --> */}
      
        
        {/* <!-- Phone Number Step --> */}
        <div id="phone-step" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <Formik<PhoneFormValues>
      initialValues={{ phone: '', countryCode: 'SA' }}
      validate={(values: PhoneFormValues) => {
        const errors: Partial<Record<keyof PhoneFormValues, string>> = {};
        
        if (!values.phone) {
          errors.phone = t('Phone number is required');
        } else {
          // Check if phone contains only digits
          if (!/^\d+$/.test(values.phone)) {
            errors.phone = t('Phone number must contain only digits');
          } else if (values.phone.length < 7) {
            errors.phone = t('Phone number must be at least 7 digits');
          } else if (values.phone.length > 11) {
            errors.phone = t('Phone number must not exceed 11 digits');
          }
        }
        
        return errors;
      }}
      onSubmit={async (values: PhoneFormValues, { setSubmitting, setFieldError }: FormikHelpers<PhoneFormValues>) => {
        try {
            // Clean the phone number by removing country code and leading zeros
            let cleanedPhone = values.phone;
            
            // Get country data from the countries list
            const countries = (await import('country-codes-flags-phone-codes')).countries;
            const country = countries.find(c => c.code === values.countryCode);
            const phoneCode = country?.dialCode || '+966';
            
            // Remove country code if phone starts with it
            const countryCode = phoneCode.replace('+', '');
            if (cleanedPhone.startsWith(countryCode)) {
              cleanedPhone = cleanedPhone.substring(countryCode.length);
            }
            
            // Remove leading zero if present
            if (cleanedPhone.startsWith('0')) {
              cleanedPhone = cleanedPhone.substring(1);
            }
            
            const phoneData = { phone: `${phoneCode}${cleanedPhone}` };
            
            const response = await postRequest(`/auth/send-otp`, phoneData, {}, null, locale);
            if(response.data.data.registered){
               router.push(`/auth/otp?phone=${cleanedPhone}&country=${values.countryCode}`);
            }
            else{
                // console.log('User not registered, redirecting to registration');
                router.push(`/auth/Register?phone=${cleanedPhone}&country=${values.countryCode}`);
            }
        
          } catch (error) {
            console.error('Login error:', error);
            if (axios.isAxiosError(error)) {
              console.error("Axios error:", error.response?.data || error.message);
              setFieldError('phone', 'Login failed. Please check your phone number and try again.');
            } else {
              console.error("Unexpected error:", error);
              setFieldError('phone', 'An unexpected error occurred. Please try again.');
            }
          } finally {
            setSubmitting(false);
          }
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        /* and other goodies */
      }) => (
        <form id="phone-form" className="space-y-6" onSubmit={handleSubmit}>
        <CountryPhoneInput
          value={values.phone}
          onChange={(phoneValue, countryCode) => {
            handleChange({
              target: {
                name: 'phone',
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
          error={errors.phone}
          touched={touched.phone}
          disabled={isSubmitting}
          label={t("Phone Number")}
          required
          initialCountryCode="SA"
        />

        <div>
            <button
                type="submit"
                id="phone-submit"
                disabled={isSubmitting}
                className={`te-btn te-btn-primary w-full flex justify-center items-center ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>{t("Checking")}...</span>
                  </>
                ) : (
                  <span>{t("Continue")}</span>
                )}
            </button>
        </div>
    </form>
      )}
    </Formik>
    </div>

</>

    



     

   
  )
}

export default Login
