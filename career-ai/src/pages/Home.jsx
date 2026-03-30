import React from 'react';
import Hero from '../components/Hero';
import Animation from '../components/Animation';

const Home = () => {
  return (
    <main className="relative z-10 w-full min-h-[calc(100vh-6rem)] pt-0 pb-24 flex flex-col items-center justify-start container mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full max-w-7xl mx-auto">
        <Hero />
        <Animation />
      </div>
    </main>
  );
};

export default Home;
