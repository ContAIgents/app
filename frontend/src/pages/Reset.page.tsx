import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function ResetPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear entire localStorage
    localStorage.clear();

    // Redirect to home page
    // timeout to allow the user to see the message
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 2000);
  }, [navigate]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      Resetting application state...
    </div>
  );
}
