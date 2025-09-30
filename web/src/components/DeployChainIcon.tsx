import { motion } from 'framer-motion';

const DeployChainIcon = () => {
  return (
    <motion.div
      className="flex items-center justify-center w-16 h-16 mb-8"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
      >
        <motion.path
          d="M32 8L48 16L48 32L32 40L16 32L16 16L32 8Z"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.2"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.path
          d="M32 16L40 20L40 28L32 32L24 28L24 20L32 16Z"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.4"
          animate={{ scale: [1, 0.9, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
        <motion.circle
          cx="32"
          cy="24"
          r="4"
          fill="currentColor"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.path
          d="M32 40L32 56"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ pathLength: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.path
          d="M16 32L8 40"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ pathLength: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
        <motion.path
          d="M48 32L56 40"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ pathLength: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 2 }}
        />
      </svg>
    </motion.div>
  );
};

export default DeployChainIcon;