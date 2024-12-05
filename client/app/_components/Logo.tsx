import favicon from '@/public/logo.png';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large' | 'largest';
}

const Logo = ({ className = "", showIcon = true, size = 'medium' }: LogoProps) => {
  const sizeClasses = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-4xl',
    largest: 'text-6xl',
  };

  const iconSizes = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    largest: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showIcon && (
        <Image
          src={favicon.src}
          alt="LeetMock.AI Logo"
          width={24}
          height={24}
          className={`${iconSizes[size]}`}
        />
      )}
      <div className={`font-bold ${sizeClasses[size]}`}>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
          LeetMock
        </span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-400">
          .AI
        </span>
      </div>
    </div>
  );
};

export default Logo;