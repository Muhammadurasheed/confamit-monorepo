import { useEffect } from 'react';
import { PhoneInput as ReactPhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  className?: string;
  disabled?: boolean;
}

export const PhoneInput = ({ value, onChange, className, disabled }: PhoneInputProps) => {
  return (
    <div className={cn("phone-input-wrapper", className)}>
      <ReactPhoneInput
        defaultCountry="ng"
        value={value}
        onChange={onChange}
        disabled={disabled}
        inputClassName="phone-input"
        countrySelectorStyleProps={{
          buttonClassName: "phone-input-country-selector"
        }}
      />
    </div>
  );
};
