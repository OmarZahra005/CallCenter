import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../../store/toastStore';
import { cn } from '../../utils/cn';

const Toast = () => {
  const { toasts, removeToast } = useToastStore();

  const icons = {
    success: (
      <motion.svg
        className="w-5 h-5 text-green-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.1 }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </motion.svg>
    ),
    error: (
      <motion.svg
        className="w-5 h-5 text-red-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.1 }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </motion.svg>
    ),
    warning: (
      <motion.svg
        className="w-5 h-5 text-yellow-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.1 }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </motion.svg>
    ),
    info: (
      <motion.svg
        className="w-5 h-5 text-blue-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.1 }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </motion.svg>
    ),
  };

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  };

  return (
    <div className="fixed bottom-4 end-4 z-50 space-y-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[300px] backdrop-blur-sm',
              bgColors[toast.type]
            )}
          >
            {icons[toast.type]}
            <p className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{toast.message}</p>
            <motion.button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
