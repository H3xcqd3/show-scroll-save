import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const PublicProfilePage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <p>Redirecting...</p>
      </div>
    </>
  );
};

export default PublicProfilePage;
