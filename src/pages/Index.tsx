import { useState, useEffect } from 'react';
import ApiKeyPrompt from '@/components/ApiKeyPrompt';
import Discover from '@/pages/Discover';

const Index = () => {
  const [hasKey, setHasKey] = useState(!!localStorage.getItem('tmdb_api_key'));

  if (!hasKey) {
    return (
      <ApiKeyPrompt
        onSubmit={(key) => {
          localStorage.setItem('tmdb_api_key', key);
          setHasKey(true);
        }}
      />
    );
  }

  return <Discover />;
};

export default Index;
