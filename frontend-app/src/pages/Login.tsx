// src/pages/Login.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../features/auth/authSlice';
import { useLoginMutation } from '../features/auth/authApiSlice'
import { Formik, Form, } from 'formik';
import * as Yup from 'yup';
import InputField from '../components/InputField';




interface LoginFormValues {
  email: string;
  password: string;
}

const initialValues: LoginFormValues = {
  email: '',
  password: '',
};



const validationSchema = Yup.object({
  email: Yup.string().required('Email is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});


// const InputField: React.FC<InputFieldProps> = ({ label, name, type, placeholder, required, touched, error, onChange: handleOnChange }) => (
//   <div>
//     <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
//       {label} {required && <span className="text-red-500">*</span>}
//     </label>
//     <Field
//       type={type}
//       name={name}
//       id={name}
//       placeholder={placeholder}
//       onChange={handleOnChange}
//       className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"

//     />
//     {touched && error && <div className="text-red-500 text-sm mt-1">{error}</div>}
//   </div>
// );


const handleLogin = (values: LoginFormValues) => {
  console.log('Login form values:', values);
  // Add your login logic here
};


const Login: React.FC = () => {

  const userRef = useRef<HTMLInputElement | null>(null);
  const errRef = useRef<HTMLDivElement | null>(null);
  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const navigate = useNavigate();

  const [login, { isLoading, isError, error }] = useLoginMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (userRef.current) {
      userRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setErrMsg('');
  }, [user, pwd]);

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      const userData = await login({ user, pwd }).unwrap();
      console.log('Login successful:', userData);
      dispatch(setCredentials({ ...userData, user }));
      setUser('');
      setPwd('');

      // Handle successful login (e.g., redirect to dashboard)
      navigate('/welcome');
    } catch (err: any) {
      if (!err?.status) {
        setErrMsg('No response from server. Please try again later.');
      } else if (err.status === 400) {
        setErrMsg('Invalid credentials. Please try again.');
      } else if (err.status === 401) {
        setErrMsg('Unauthorized. Please try again.');
      } else {
        setErrMsg('Login failed. Please try again.');
      }

      console.error('Failed to login:', err);
      errRef.current?.focus();

      // Handle login failure (e.g., show error message)
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void, setFieldError: (field: string, message: string | undefined) => void) => {
    const { name, value } = e.target;
    //set field state with formik
    setFieldValue(name, value);
    console.log('name:', name, 'value:', value);
    setUser(e.target.value)
  };

  // const handlePwdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setPwd(e.target.value);
  // }

  // cool loading with tailwindcss
  const content = isLoading ? (
    <div className="flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-t-2 border-gray-900 rounded-full animate-spin"></div>
    </div>
  ) : (
    <div>
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 sm:py-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Sign in to your account
              </h1>
              {errMsg && <div ref={errRef} tabIndex={-1} className="text-red-500 text-sm mt-1">{errMsg}</div>}

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched, setFieldValue, setFieldError}) => (
                  <Form className="space-y-4 md:space-y-6">
                    <InputField
                      label="Your email"
                      name="email"
                      type="test"
                      placeholder="name@company.com"
                      required
                      touched={touched.email}
                      error={errors.email}
                      onChange={(e) => handleInputChange(e, setFieldValue, setFieldError)}
                    />
                    <InputField
                      label="Password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      touched={touched.password}
                      error={errors.password}
                      onChange={(e) => handleInputChange(e, setFieldValue, setFieldError)}
                    />
                    <button
                      type="submit"
                      className="w-full dark:text-white bg-blue-500 bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                      disabled={isSubmitting}
                    >
                      Sign in
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  return content;
};

export default Login;