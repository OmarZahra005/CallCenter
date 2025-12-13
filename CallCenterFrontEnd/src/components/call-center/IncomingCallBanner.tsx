import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, User, Ticket, PhoneCall, Crown, Star, UserCircle } from 'lucide-react';
import { useCallCenter } from '../../context/CallCenterContext';
import { apiClient } from '../../api/client';

interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  totalCalls?: number;
  totalTickets?: number;
}

// Normalize phone number for lookup (Saudi Arabia format)
const normalizePhone = (phone: string): string => {
  let normalized = phone.replace(/[\s\-\(\)]/g, '');
  if (normalized.startsWith('+966')) {
    normalized = '0' + normalized.substring(4);
  } else if (normalized.startsWith('966') && normalized.length >= 12) {
    normalized = '0' + normalized.substring(3);
  }
  return normalized;
};

// Get customer type badge styling
const getCustomerTypeBadge = (type: string) => {
  const lowerType = type?.toLowerCase() || 'standard';
  switch (lowerType) {
    case 'vip':
      return {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-300 dark:border-amber-700',
        icon: Crown,
      };
    case 'premium':
      return {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-300 dark:border-purple-700',
        icon: Star,
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-700 dark:text-gray-300',
        border: 'border-gray-300 dark:border-gray-600',
        icon: UserCircle,
      };
  }
};

export const IncomingCallBanner: React.FC = () => {
  const { incomingRingingCall, acceptIncoming, rejectIncoming, isAnswering } = useCallCenter();
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);

  // Fetch customer data when incoming call arrives
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!incomingRingingCall?.fromNumber) {
        setCustomer(null);
        return;
      }

      setIsLoadingCustomer(true);
      try {
        const normalizedPhone = normalizePhone(incomingRingingCall.fromNumber);
        const response = await apiClient.get(`/customers/phone/${normalizedPhone}`);

        // Fetch additional stats
        const customerData = response.data;

        // Try to get ticket count
        let ticketCount = 0;
        try {
          const ticketsResponse = await apiClient.get(`/tickets?customerId=${customerData.id}&pageSize=1`);
          ticketCount = ticketsResponse.data.totalCount || 0;
        } catch {
          // Ignore ticket fetch errors
        }

        setCustomer({
          ...customerData,
          totalCalls: customerData.totalCalls || 0,
          totalTickets: ticketCount,
        });
      } catch (error) {
        console.log('Customer not found for phone:', incomingRingingCall.fromNumber);
        setCustomer(null);
      } finally {
        setIsLoadingCustomer(false);
      }
    };

    fetchCustomer();
  }, [incomingRingingCall?.fromNumber]);

  // Clear customer when call ends
  useEffect(() => {
    if (!incomingRingingCall) {
      setCustomer(null);
    }
  }, [incomingRingingCall]);

  const customerBadge = customer ? getCustomerTypeBadge(customer.type) : null;
  const BadgeIcon = customerBadge?.icon || UserCircle;

  return (
    <AnimatePresence>
      {incomingRingingCall && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          {/* Glowing border effect */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(34, 197, 94, 0.4)',
                '0 0 0 8px rgba(34, 197, 94, 0)',
                '0 0 0 0 rgba(34, 197, 94, 0)',
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="rounded-2xl"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-green-500 dark:border-green-400 shadow-2xl overflow-hidden">
              {/* Header with animation */}
              <motion.div
                animate={{
                  backgroundColor: ['rgba(34, 197, 94, 0.1)', 'rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.1)'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="px-4 py-3 border-b border-green-200 dark:border-green-900 flex items-center gap-3"
              >
                <motion.div
                  animate={{ rotate: [0, -15, 15, -15, 0] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                  className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <Phone className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                    Incoming Call
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ringing...
                  </p>
                </div>
              </motion.div>

              {/* Caller Information */}
              <div className="p-4 space-y-4">
                {/* Customer Name & Type */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      {customer ? (
                        <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <User className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      {isLoadingCustomer ? (
                        <div className="animate-pulse">
                          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      ) : customer ? (
                        <>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {customer.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {incomingRingingCall.fromNumber}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            Unknown Caller
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {incomingRingingCall.fromNumber}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Customer Type Badge */}
                  {customer && customerBadge && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 border ${customerBadge.bg} ${customerBadge.text} ${customerBadge.border}`}
                    >
                      <BadgeIcon className="w-4 h-4" />
                      <span className="text-sm font-medium capitalize">{customer.type}</span>
                    </motion.div>
                  )}
                </div>

                {/* Stats Row */}
                {customer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <PhoneCall className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">Previous Calls</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {customer.totalCalls || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <Ticket className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">Open Tickets</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {customer.totalTickets || 0}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={acceptIncoming}
                    disabled={isAnswering}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 transition-colors"
                  >
                    {isAnswering ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Answering...</span>
                      </>
                    ) : (
                      <>
                        <Phone className="w-5 h-5" />
                        <span>Answer</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={rejectIncoming}
                    disabled={isAnswering}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-colors"
                  >
                    <PhoneOff className="w-5 h-5" />
                    <span>Reject</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IncomingCallBanner;
