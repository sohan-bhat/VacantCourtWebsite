import React, { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Form from '@radix-ui/react-form';
import toast from 'react-hot-toast';
import CircularProgress from '@mui/material/CircularProgress';
import { signUpWithEmail, loginWithEmail, signInWithGoogle } from '../../services/authService';
import '../../styles/auth/AuthPage.css';
import { useAuth } from './AuthContext';
import { FcGoogle } from 'react-icons/fc'
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const AuthPage: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const { currentUser, isLoading: authIsLoading } = useAuth();

    useEffect(() => {
        if (!authIsLoading && currentUser) {
            navigate('/');
        }
    }, [currentUser, authIsLoading, navigate]);

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFormError(null);
        setIsLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setFormError(null);
        try {
            await signInWithGoogle();
            toast.success('Successfully signed in with Google!');
            navigate('/');
        } catch (error: any) {
            setIsLoading(false);
        }
    };

    const handleAuthError = (error: any) => {
        setIsLoading(false);
        console.error("Auth Error:", error);
        let message = "An unexpected error occurred. Please try again.";
        if (error.code) {
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    message = 'Invalid email or password.';
                    break;
                case 'auth/email-already-in-use':
                    message = 'This email is already registered. Please login or use a different email.';
                    break;
                case 'auth/weak-password':
                    message = 'Password is too weak. It should be at least 6 characters long.';
                    break;
                case 'auth/invalid-email':
                    message = 'Please enter a valid email address.';
                    break;
                case 'auth/invalid-credential':
                    message = 'Email and password do not match.';
                    break;
                default:
                    message = error.message || message;
            }
        } else if (error && typeof error.message === 'string') {
            message = error.message
        }
        setFormError(message);
        toast.error(message);
    };


    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setFormError(null);

        if (!email || !password) {
            setFormError("Email and password are required.");
            toast.error("Email and password are required.");
            return;
        }
        if (!isLoginView && !confirmPassword) {
            setFormError("Please confirm your password.");
            toast.error("Please confirm your password.");
            return;
        }
        if (!isLoginView && password !== confirmPassword) {
            setFormError("Passwords do not match.");
            toast.error("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        if (!isLoginView) {
            try {
                await signUpWithEmail(email, password);
                toast.success('Account created successfully! Welcome!');
                navigate('/');
            } catch (error) {
                handleAuthError(error);
            }
        } else {
            try {
                await loginWithEmail(email, password);
                toast.success('Logged in successfully! Welcome back!');
                navigate('/');
            } catch (error) {
                handleAuthError(error);
            }
        }
    };

    return (
        (authIsLoading === true ? <CircularProgress /> :
            <div className="auth-page-container">
                <div className="auth-form-wrapper">
                    <Link to="/" className="auth-back-link" aria-label="Back to Dashboard">
                        <IconButton component="span" sx={{ color: '#555', '&:hover': { color: '#1e3a8a'} }}>
                            <ArrowBackIcon />
                        </IconButton>
                    </Link>

                    <h2>{isLoginView ? 'Login' : 'Sign Up'}</h2>

                    <IconButton
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="google-signin-button auth-button-social"
                        disabled={isLoading}
                        sx={{
                            border: '1px solid rgba(0, 0, 0, 0.23)',
                            borderRadius: '0.75rem',
                        }}
                    >

                        <FcGoogle size={30} />
                    </IconButton>

                    <div className="auth-divider">
                        <span>OR</span>
                    </div>

                    <Form.Root onSubmit={handleSubmit} className="auth-form">
                        {formError && <div className="form-error-message">{formError}</div>}

                        <Form.Field name="email" className="form-field">
                            <div className="form-label-container">
                                <Form.Label className="form-label">Email</Form.Label>
                            </div>
                            <Form.Control asChild>
                                <input
                                    className="form-input"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    autoComplete='off'
                                />
                            </Form.Control>
                            <Form.Message className="form-message" match="valueMissing">
                                Please enter your email
                            </Form.Message>
                            <Form.Message className="form-message" match="typeMismatch">
                                Please provide a valid email
                            </Form.Message>
                        </Form.Field>

                        <Form.Field name="password" className="form-field">
                            <div className="form-label-container">
                                <Form.Label className="form-label">Password</Form.Label>
                            </div>
                            <Form.Control asChild>
                                <input
                                    className="form-input"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    autoComplete='off'
                                />
                            </Form.Control>
                            <Form.Message className="form-message" match="valueMissing">
                                Please enter your password
                            </Form.Message>
                        </Form.Field>

                        {!isLoginView && (
                            <Form.Field name="confirmPassword" className="form-field">
                                <div className="form-label-container">
                                    <Form.Label className="form-label">Confirm Password</Form.Label>
                                </div>
                                <Form.Control asChild>
                                    <input
                                        className="form-input"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        autoComplete='off'
                                    />
                                </Form.Control>
                                <Form.Message className="form-message" match="valueMissing">
                                    Please confirm your password
                                </Form.Message>
                            </Form.Field>
                        )}

                        <Form.Submit asChild>
                            <button className="auth-submit-button" disabled={isLoading}>
                                {isLoading ? 'Processing...' : (isLoginView ? 'Login' : 'Sign Up')}
                            </button>
                        </Form.Submit>
                    </Form.Root>

                    <p className="auth-toggle-prompt">
                        {isLoginView ? "Don't have an account?" : 'Already have an account?'}
                        <button onClick={toggleView} className="auth-toggle-button" disabled={isLoading}>
                            {isLoginView ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        )
    );
};

export default AuthPage;