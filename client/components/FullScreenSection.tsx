import React, { ReactNode } from 'react';

interface FullScreenSectionProps {
  children: ReactNode;
}

export const FullScreenSection: React.FC<FullScreenSectionProps> = ({ children }) => {
  return (
    <section className="h-screen w-full flex items-center justify-center snap-start">
      {children}
    </section>
  );
};