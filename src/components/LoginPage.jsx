import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';

    function LoginPage() {
      const [username, setUsername] = useState('');
      const [password, setPassword] = useState('');
      const [isAdminLogin, setIsAdminLogin] = useState(false);
      const [error, setError] = useState('');
      const navigate = useNavigate();

      const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, isAdminLogin }),
          });

          if (!response.ok) {
            const message = await response.text()
            throw new Error(message || 'Login failed');
          }

          const data = await response.json();

          if (data.isAdmin) {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } catch (err) {
          setError(err.message);
        }
      };

      return (
        <div className="container">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={isAdminLogin}
                  onChange={() => setIsAdminLogin(!isAdminLogin)}
                />
                Admin Login
              </label>
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="btn">
              Login
            </button>
          </form>
        </div>
      );
    }

    export default LoginPage;
