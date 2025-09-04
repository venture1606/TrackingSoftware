import React, { useState } from 'react';

// Importing Api
import Auth from '../services/Auth';

// Importing the styles.
import '../styles/login.css';
import Loading from '../hooks/Loading';

function Login() {
  const [isCreateAccount, setIsCreateAccount] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const { handleRegister, handleLogin, handleForgotPassword, loading } = Auth();

  // Form state
  const [form, setForm] = useState({ email: '', password: '', name: '', employeeId: '', role: '', access: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    handleLogin(form);
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    handleRegister(form);
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    handleForgotPassword(form);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className='LoginContainer'>
      {!isCreateAccount && !isForgotPassword && (
        <form className='LoginForm' onSubmit={handleLoginSubmit}>
          <h2>Login</h2>
          <input
            type='email'
            name='email'
            placeholder='Email'
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type='password'
            name='password'
            placeholder='Password'
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type='submit'>Login</button>
          <div className='LoginLinks'>
            <span onClick={() => setIsForgotPassword(true)}>Forgot Password?</span>
            <span onClick={() => setIsCreateAccount(true)}>Create Account</span>
          </div>
        </form>
      )}

      {isCreateAccount && (
        <form className='CreateAccountForm' onSubmit={handleCreateAccount}>
          <h2>Create Account</h2>
          <input
            type='text'
            name='name'
            placeholder='Name'
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type='email'
            name='email'
            placeholder='Email'
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type='password'
            name='password'
            placeholder='Password'
            value={form.password}
            onChange={handleChange}
            required
          />
          <input 
            type='text'
            name='employeeId'
            placeholder='Employee ID'
            value={form.employeeId}
            onChange={handleChange}
            required
          />
          <input
            type='text'
            name='role'
            placeholder='Role'
            value={form.role}
            onChange={handleChange}
            required
          />
          <select>
            <option value='design and development'>Design and Development</option>
            <option value='quality'>Quality</option>
            <option value='production'>Production</option>
            <option value='sales'>Sales</option>
            <option value='purchase'>Purchase & Store</option>
            <option value='maintainance'>Maintainance</option>
          </select>
          <button type='submit'>Sign Up</button>
          <div className='LoginLinks'>
            <span onClick={() => setIsCreateAccount(false)}>Back to Login</span>
          </div>
        </form>
      )}

      {isForgotPassword && (
        <form className='ForgotPasswordForm' onSubmit={handleForgotPasswordSubmit}>
          <h2>Forgot Password</h2>
          <input
            type='email'
            name='email'
            placeholder='Enter your email'
            value={form.email}
            onChange={handleChange}
            required
          />
          <button type='submit'>Reset Password</button>
          <div className='LoginLinks'>
            <span onClick={() => setIsForgotPassword(false)}>Back to Login</span>
          </div>
        </form>
      )}
    </div>
  );
}

export default Login;