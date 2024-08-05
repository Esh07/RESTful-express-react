import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../features/auth/authApiSlice';
import * as Yup from 'yup';
import AuthForm from '../components/AuthForm';

const initialValues = {
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
};

const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    name: Yup.string().required('Name is required'),
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
});

const Register: React.FC = () => {
    const errRef = useRef<HTMLDivElement | null>(null);
    const [errMsg, setErrMsg] = useState('');
    const navigate = useNavigate();
    const [register, { isLoading }] = useRegisterMutation();

    const handleSubmit = async (values: { email: string; name: string; password: string; confirmPassword: string }) => {
        try {
            await register(values).unwrap();
            navigate('/login');
        } catch (err: any) {
            setErrMsg(
                !err?.status ? 'No response from server. Please try again later.' :
                    err.status === 400 ? err.data.message :
                        err.status === 401 ? err.data.message :
                            'Register failed. Please try again.'
            );
            errRef.current?.focus();
        }
    };

    const fields = [
        { label: 'Your email', name: 'email', type: 'email', placeholder: 'name@company.com', required: true },
        { label: 'Name', name: 'name', type: 'text', placeholder: 'Your name', required: true },
        { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••', required: true },
        { label: 'Confirm Password', name: 'confirmPassword', type: 'password', placeholder: '••••••••', required: true },
    ];

    return (
        <>
            <AuthForm
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                fields={fields}
                submitLabel="Register"
                errMsg={errMsg}
                errRef={errRef}
                isLoading={isLoading}
            />
        </>
    );
};

export default Register;
