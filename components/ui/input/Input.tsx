import React from 'react';
import type { RegisterOptions } from 'react-hook-form';
import { useFormContext, useWatch } from 'react-hook-form';
import RequiredAsterisk from '../requiredAsterisk';

interface Props {
  type?: string;
  placeholder: string;
  name: string;
  label?: string;
  icon?: React.ReactElement;
  iconPosition?: 'left' | 'right';
  rules?: RegisterOptions;
  classNames?: string;
  onChange?: (e: any) => void;
  minDate?: boolean | Date;
  maxDate?: string;
  readOnly?: boolean;
  allowAsterisk?: boolean;
  maxLength?: number;
  disabled?: boolean;
}

const Input: React.FC<Props> = ({
  type,
  placeholder,
  name,
  label,
  icon,
  iconPosition = null,
  rules = {},
  classNames = '',
  onChange,
  minDate,
  maxDate,
  readOnly,
  allowAsterisk = false,
  maxLength,
  disabled = false,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const value = useWatch({ name }) || '';
  const remainingChars = maxLength ? maxLength - value.length : null;

  const getFormattedDate = (d: any) => {
    const date = d ? new Date(d) : new Date();

    date.setHours(0, 0, 0, 0);
    const isoString = date.toISOString();
    const formattedDate = isoString.slice(0, 19);
    return formattedDate;
  };

  const minFormattedDate = minDate ? getFormattedDate(minDate === true ? new Date() : minDate) : undefined;
  const maxFormattedDate = maxDate ? getFormattedDate(maxDate) : undefined;

  return (
    <div className="w-[100%] ">
      <label htmlFor={name} className="block whitespace-nowrap text-sm font-medium leading-6 text-gray-900">
        {label}
        {allowAsterisk && (
          <span>
            <RequiredAsterisk />
          </span>
        )}
      </label>
      <div className="mt-2 relative">
        <input
          id={name}
          disabled={disabled}
          {...register(name, rules)}
          type={type}
          placeholder={placeholder}
          maxLength={maxLength}
          onKeyDown={(e) => {
            if (type === 'number' && (e.key === '-' || e.key === 'e' || e.key === 'E')) {
              e.preventDefault();
            }
          }}
          className={`bg-white block w-full py-[10px] px-4 rounded-[12px] border-2 border-grayLight-975 placeholder:text-gray-25 hover:border-primary/20 shadow-none focus:border-primary-200 focus:outline-none sm:text-sm sm:leading-6
            ${errors[name] ? '!border-error-500 !focus:border-error-500' : ''}
            ${iconPosition === 'left' ? 'pl-12' : ''}
            ${iconPosition === 'right' ? 'pr-12' : ''}
            ${classNames}
          `}
          // onChange={onChange}
          min={type == 'number' ? 1 : minDate ? minFormattedDate : undefined}
          max={maxDate ? maxFormattedDate : undefined}
          readOnly={readOnly}
        />

        {icon && <div className={`absolute inset-y-0 flex text-muted items-center ${iconPosition === 'left' ? 'left-3' : 'right-3'}`}>{icon}</div>}
      </div>

      {maxLength && (
        <div className="flex justify-end">
          <span className={`mt-1 text-xs font-medium ${remainingChars === 0 ? 'text-error-500' : 'text-gray-800'}`}>{remainingChars} Char</span>
        </div>
      )}
      {errors[name] && <span className="text-red-500 text-sm">{errors[name]?.message as string}</span>}
    </div>
  );
};

export default Input;