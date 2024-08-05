import React, { useRef, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../features/auth/authSlice';
import { useLoginMutation } from '../features/auth/authApiSlice';
import * as Yup from 'yup';
import AuthForm from '../components/AuthForm';

const initialValues = {
  email: '',
  password: '',
};

const validationSchema = Yup.object({
  email: Yup.string().required('Email is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

const Login: React.FC = () => {
  const errRef = useRef<HTMLDivElement | null>(null);
  const [errMsg, setErrMsg] = useState('');
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      const userData = await login(values).unwrap();
      console.log('userData', userData);
      dispatch(setCredentials({ ...userData, user: values.email }));
      navigate('/welcome');
    } catch (err: any) {
      setErrMsg(
        !err?.status ? 'No response from server. Please try again later.' :
        err.status === 400 ? 'Invalid credentials. Please try again.' :
        err.status === 401 ? 'Unauthorized. Please try again.' :
        'Login failed. Please try again.'
      );
      errRef.current?.focus();
    }
  };

  const fields = [
    { label: 'Your email', name: 'email', type: 'email', placeholder: 'name@company.com', required: true },
    { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••', required: true },
  ];

  return (
    <AuthForm
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      fields={fields}
      submitLabel="Sign in"
      errMsg={errMsg}
      errRef={errRef}
      isLoading={isLoading}
    />
  );
};

export default Login;
