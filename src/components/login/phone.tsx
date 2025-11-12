"use client";
import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import dynamic from "next/dynamic";
import "react-phone-input-2/lib/style.css";
import { useRouter } from "next/navigation";
import { useAuth } from "../../app/hooks/useAuth";
import { useTranslations } from "next-intl";
  
// Dynamically import the phone input to disable SSR on this component
const PhoneInput = dynamic(() => import("react-phone-input-2"), { ssr: false });

const PhoneForm = () => {
  const router = useRouter();
  const { sendOTP, isLoading, error, clearError } = useAuth();
  const t = useTranslations();
  return (
    <Formik
      initialValues={{ phone: "" }}
      validationSchema={Yup.object({
        phone: Yup.string().required("Phone number is required"),
      })}
      onSubmit={async (values, { setSubmitting, setStatus }) => {
        try {
          setStatus(undefined);
          clearError();
          
          const result = await sendOTP(values.phone);
          
          if (result.success) {
            if (!result.isRegistered) {
              router.push(`/auth/Register?phone=${result.phone}`);
            } else {
              router.push(`/auth/otp?phone=${result.phone}`);
            }
            setStatus({ success: true, data: result.data });
          } else {
            setStatus({ success: false, message: result.error });
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to send OTP";
          setStatus({ success: false, message });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, setFieldValue, errors, touched, isSubmitting, status }) => (
        <Form className="max-w-sm mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-5">
          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
             {t("Phone Number")} *
            </label>
            <PhoneInput
              country={"eg"}
              value={values.phone}
              onChange={(value: string) => setFieldValue("phone", value)}
              containerClass="w-full"
              inputClass="!w-full !h-11 !text-sm !pl-12 !border !border-gray-300 dark:!border-gray-600 !rounded-md focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-200 dark:!bg-gray-700 dark:!text-white"
              buttonClass="!border-gray-300 dark:!border-gray-600 !bg-gray-50 dark:!bg-gray-700 hover:!bg-gray-100 dark:hover:!bg-gray-600 !rounded-l-md"
              dropdownClass="!text-sm dark:!bg-gray-800 dark:!text-white"
            />
            {touched.phone && errors.phone && (
              <div className="text-red-500 text-sm mt-1">{errors.phone}</div>
            )}
          </div>

          {/* Show Redux auth error */}
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}
          
          {/* Show form status messages */}
          {status?.message && !error && (
            <div className="text-red-600 dark:text-red-400 text-sm">{status.message}</div>
          )}
          {status?.success && (
            <div className="text-green-600 dark:text-green-400 text-sm">OTP sent successfully</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-md font-medium"
          >
            {isSubmitting || isLoading ? "Sending..." : "Send OTP"}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default PhoneForm;
