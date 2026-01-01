// Copyright (c) 2026. All rights reserved.
// This file is part of the project.

import React, { useState, ChangeEvent, FormEvent } from 'react';
import PropTypes, { InferProps } from 'prop-types';

/**
 * LoginFormProps - Type definitions for LoginForm component props
 */
type LoginFormProps = {
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
};

/**
 * LoginForm - A controlled form component for user authentication
 *
 * @component
 * @example
 * const handleLogin = (email: string, password: string) => {
 *   console.log('Logging in with:', email);
 * };
 * return <LoginForm onSubmit={handleLogin} />;
 *
 * @param {LoginFormProps} props - Component props
 * @param {function} props.onSubmit - Callback fired when form is submitted
 * @param {boolean} [props.isLoading=false] - Loading state indicator
 * @returns {React.ReactElement} The rendered login form
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
}: LoginFormProps): React.ReactElement => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setEmail(event.target.value);
    setError('');
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setPassword(event.target.value);
    setError('');
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      onSubmit(email, password);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          disabled={isLoading}
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          disabled={isLoading}
          placeholder="Enter your password"
          required
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
};

/**
 * PropTypes validation for LoginForm component
 * Validates component prop types at runtime
 */
LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

/**
 * Default props for LoginForm
 */
LoginForm.defaultProps = {
  isLoading: false,
};
