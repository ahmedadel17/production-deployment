import React from 'react';
import DeleteButton from '@/components/DeleteButton';
import { useTranslations } from 'next-intl';
interface Address {
  id: number;
  label: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  street: string;
  contact_phone: string;
  notes: string;
  is_default?: boolean;
}

interface AddressRadioButtonProps {
  address: Address;
  name: string;
  value: string;
  className?: string;
  labelClassName?: string;
  radioClassName?: string;
  contentClassName?: string;
  onDelete?: (addressId: number) => void;
  showDeleteButton?: boolean;
  onChange?: (value: string) => void;
  checked?: boolean;
}

const   AddressRadioButton: React.FC<AddressRadioButtonProps> = ({
  address,
  name,
  value,
  className = "",
  labelClassName = "flex items-start p-4 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer",
  radioClassName = "text-primary-600 mt-1",
  contentClassName = "ml-3 flex-1",
  onDelete,
  showDeleteButton = false,
  onChange,
  checked = false
}) => {
  const t = useTranslations();
  return (
    <label 
      key={address.id} 
      className={`${labelClassName} ${className}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => {
          if (onChange) {
            onChange(e.target.value);
          }
        }}
        className={radioClassName}
      />
       <div className={contentClassName}>
         <div className="flex items-center justify-between">
           <div className="flex items-center">
             <h4 className="text-sm font-medium text-gray-900 dark:text-white">
               {address.label}
             </h4>
             {address.is_default && (
               <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {t("Default")}
             </span>
             )}
           </div>
           {showDeleteButton && onDelete && (
             <div 
               className="ml-2" 
               onClick={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
               }}
               onMouseDown={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
               }}
             >
               <DeleteButton 
                 onDelete={() => onDelete?.(address.id)}
                 size="sm"
                 variant="icon"
               />
             </div>
           )}
         </div>
         <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
         <p>{address.address}</p>
          <p>{address.street}, {address.contact_phone}</p>
          <p>{address.notes}</p>
        </div>
       </div>
    </label>
  );
};

export default AddressRadioButton;
