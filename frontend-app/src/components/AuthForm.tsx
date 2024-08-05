import React from 'react';
import { selectCurrentToken, selectCurrentUser } from '../features/auth/authSlice';
import { Formik, Form} from 'formik';
import InputField from '../components/InputField';
import { Navigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

interface AuthFormProps {
  initialValues: any;
  validationSchema: any;
  onSubmit: (values: any) => void;
  fields: {
    label: string;
    name: string;
    type: string;
    placeholder: string;
    required?: boolean;
  }[];
  submitLabel: string;
  errMsg: string;
  errRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({
  initialValues,
  validationSchema,
  onSubmit,
  fields,
  submitLabel,
  errMsg,
  errRef,
  isLoading,
}) => {

  const location = useLocation();
  
  const isRegisterPage = location.pathname === '/register';

  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);

  const isAuthenticated = user && token;

  //check if user is authenticated and redirect to home page
  if (isAuthenticated) {
    return <Navigate to="/home" />;
  }


  
  return isLoading ? (
    <div className="flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-t-2 border-gray-900 rounded-full animate-spin"></div>
    </div>
  ) : (
    <div>
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                {submitLabel}
              </h1>
              {errMsg && <div ref={errRef} tabIndex={-1} className="text-red-500 text-sm mt-1">{errMsg}</div>}
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
              >
                {({ isSubmitting, errors, touched, setFieldValue, setFieldError }) => (
                  <Form className="space-y-4 md:space-y-6">
                    {fields.map((field) => {
                      const error = errors[field.name];
                      return (
                        <InputField
                          key={field.name}
                          label={field.label}
                          name={field.name}
                          type={field.type}
                          placeholder={field.placeholder}
                          required={field.required}
                          touched={touched[field.name] as boolean | undefined}
                          error={typeof error === 'string' ? error : undefined}
                          onChange={(e) => setFieldValue(field.name, e.target.value)}
                        />
                      );
                    }
                    )}
                    <button
                      type="submit"
                      className="w-full text-white bg-[#FF5100] hover:bg-[#d82b00] focus:ring-4 focus:outline-none  font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-[#FF5100] dark:hover:bg-[#d82b00] dark:focus:ring-[#d82b00]"
                      disabled={isSubmitting}
                    >
                      {submitLabel}
                    </button>
                    {isRegisterPage ? (
                      <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-500">
                          Login here
                        </Link>
                      </p>
                    ) : (
                      <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-blue-600 hover:underline dark:text-blue-500">
                          Register here
                        </Link>
                      </p>
                    )}
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuthForm;
