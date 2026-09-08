import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export default function Card({ children, className = '', hoverable = true }: CardProps) {
  return (
    <div
      className={`card-surface ${
        hoverable ? 'card-surface-hover' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}