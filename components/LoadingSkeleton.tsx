import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export const LoadingSkeleton = ({ className = '', count = 1 }: LoadingSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className={`rounded-lg bg-gray-800/50 ${className}`}
          initial={{ opacity: 0.5 }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.2,
            },
          }}
        />
      ))}
    </>
  );
};
