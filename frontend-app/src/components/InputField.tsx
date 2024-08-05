import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';


interface InputFieldProps {
    label: string;
    name: string;
    type: string;
    placeholder?: string;
    required?: boolean;
    touched?: boolean;
    error?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }


const InputField: React.FC<InputFieldProps> = ({ label, name, type, placeholder, required, touched, error, onChange: handleOnChange }) => {
  return (
    <div>
    <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Field
      type={type}
      name={name}
      id={name}
      placeholder={placeholder}
      onChange={handleOnChange}
      className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-[#ffb366] focus:border-[#ffb366] block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-[#ffb366] dark:focus:border-[#ffb366]"

    />
    {touched && error && <div className="text-red-500 text-sm mt-1">{error}</div>}
  </div>
  );
};

export default InputField;