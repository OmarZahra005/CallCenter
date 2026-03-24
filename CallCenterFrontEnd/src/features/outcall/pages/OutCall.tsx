import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  PhoneOff,
  PhoneCall,
  PhoneOutgoing,
  Mic,
  MicOff,
  Clock,
  User,
  Hash,
  CheckCircle,
  XCircle,
  Loader2,
  Volume2,
  AlertCircle,
  UserCircle,
  Search,
  Users,
  ChevronDown,
  Check,
  Circle,
  HelpCircle,
  Pause,
} from 'lucide-react';
import { useCallCenter } from '../../../context/CallCenterContext';
import { useAuthStore } from '../../../store/authStore';
import apiClient from '../../../api/client';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { LiveIndicator, StatusDot } from '../../../components/ui/LiveIndicator';
import { LiveClock } from '../../../components/ui/Timer';
import { cn } from '../../../utils/cn';
import {
  pageVariants,
  pageTransition,
  staggerContainer,
  staggerItem,
  fadeInScale,
  dropdownVariants,
  staggerContainerFast,
  menuItemVariants,
  tabContent,
  expandVariants,
  pulseGlow,
} from '../../../utils/animations';

// Customer interface for autocomplete
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
}

type DialMode = 'customer' | 'manual';

// Simplified status flow - no agent-ringing step
type CallStatus = 'idle' | 'connecting' | 'ringing' | 'connected' | 'completed' | 'failed';

export const OutCall = () => {
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Customer selection state
  const [dialMode, setDialMode] = useState<DialMode>('customer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    activeCall,
    twilioReady,
    isMuted,
    isOnHold,
    hangupCurrent,
    toggleMute,
    toggleHold,
    setAgentIdentity,
    pendingOutboundCall,
    isConnectingOutbound,
    initiateDirectOutbound,
    error: contextError,
  } = useCallCenter();

  const { user } = useAuthStore();

  // Determine if call is active (for layout changes)
  const isCallActive = callStatus !== 'idle' && callStatus !== 'completed' && callStatus !== 'failed';

  // Fetch customers for autocomplete
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: customersData, isLoading: isLoadingCustomers } = useQuery<any>({
    queryKey: ['customers-for-outcall'],
    queryFn: async () => {
      const response = await apiClient.get('/customers');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Normalize customers data (API may return array or object with data/items property)
  const customers: Customer[] = useMemo(() => {
    if (!customersData) return [];
    if (Array.isArray(customersData)) return customersData;
    // Handle paginated response formats
    if (customersData.data && Array.isArray(customersData.data)) return customersData.data;
    if (customersData.items && Array.isArray(customersData.items)) return customersData.items;
    return [];
  }, [customersData]);

  // Filter customers based on search query
  const filteredCustomers = useMemo(() => {
    if (customers.length === 0) return [];
    if (!searchQuery.trim()) return customers.slice(0, 10); // Show first 10 when no search

    const query = searchQuery.toLowerCase();
    return customers
      .filter(
        (customer) =>
          customer.name?.toLowerCase().includes(query) ||
          customer.phone?.includes(query) ||
          customer.email?.toLowerCase().includes(query) ||
          (customer.company && customer.company.toLowerCase().includes(query))
      )
      .slice(0, 10); // Limit to 10 results
  }, [customers, searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize Twilio on mount with user's email
  useEffect(() => {
    if (user?.email && !twilioReady) {
      console.log('Initializing Twilio with identity:', user.email);
      setAgentIdentity(user.email);
    }
  }, [setAgentIdentity, twilioReady, user?.email]);

  // Update call status based on context state
  useEffect(() => {
    if (activeCall) {
      setCallStatus('connected');
    } else if (isConnectingOutbound) {
      setCallStatus('connecting');
    } else if (pendingOutboundCall && !isConnectingOutbound) {
      // Browser connected, customer being dialed
      setCallStatus('ringing');
    } else if (callStatus === 'connected' || callStatus === 'ringing') {
      // Call ended
      setCallStatus('completed');
    }
  }, [activeCall, isConnectingOutbound, pendingOutboundCall, callStatus]);

  // Timer for call duration
  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (callStatus === 'idle') {
        setCallDuration(0);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callStatus]);

  const handleCall = async () => {
    // Determine the phone number and customer info based on dial mode
    const targetNumber = dialMode === 'customer' ? selectedCustomer?.phone : phoneNumber;
    const customerId = dialMode === 'customer' ? selectedCustomer?.id : undefined;
    const customerName = dialMode === 'customer' ? selectedCustomer?.name : undefined;

    if (!targetNumber?.trim()) {
      setLocalError(dialMode === 'customer' ? t('outcall.errorSelectCustomer') : t('outcall.errorEnterPhone'));
      return;
    }
    if (!twilioReady) {
      setLocalError(t('outcall.errorVoiceNotReady'));
      return;
    }
    if (!user?.email) {
      setLocalError(t('outcall.errorNotAuthenticated'));
      return;
    }

    setLocalError(null);
    setCallDuration(0);

    console.log('Initiating direct outbound call to:', targetNumber, 'Customer:', customerName);

    // Use the new direct outbound flow - no accept step needed
    await initiateDirectOutbound(targetNumber, customerId, customerName);
  };

  const handleHangup = () => {
    hangupCurrent();
    setCallStatus('completed');
  };

  const handleNewCall = () => {
    setCallStatus('idle');
    setCallDuration(0);
    setPhoneNumber('');
    setSelectedCustomer(null);
    setSearchQuery('');
    setLocalError(null);
  };

  // Handle customer selection
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchQuery(customer.name);
    setIsDropdownOpen(false);
    setLocalError(null);
  };

  // Format phone for display
  const formatPhoneForDisplay = (phone: string) => {
    if (phone.startsWith('+966')) {
      return phone.replace('+966', '0');
    }
    return phone;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadgeVariant = (): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
    switch (callStatus) {
      case 'idle': return 'default';
      case 'connecting': return 'warning';
      case 'ringing': return 'info';
      case 'connected': return 'success';
      case 'completed': return 'info';
      case 'failed': return 'danger';
      default: return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (callStatus) {
      case 'idle':
        return <Phone className="w-5 h-5" />;
      case 'connecting':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'ringing':
        return <PhoneOutgoing className="w-5 h-5 animate-pulse" />;
      case 'connected':
        return <PhoneCall className="w-5 h-5" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'failed':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Phone className="w-5 h-5" />;
    }
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'idle':
        return t('outcall.statusReady');
      case 'connecting':
        return t('outcall.statusConnecting');
      case 'ringing':
        return t('outcall.statusRinging');
      case 'connected':
        return t('outcall.statusConnected');
      case 'completed':
        return t('outcall.statusCompleted');
      case 'failed':
        return t('outcall.statusFailed');
      default:
        return t('outcall.statusUnknown');
    }
  };

  // Combine local and context errors
  const displayError = localError || contextError;

  // Determine if call button should be disabled
  const hasValidTarget = dialMode === 'customer' ? !!selectedCustomer : !!phoneNumber.trim();
  const isCallDisabled = !twilioReady || isConnectingOutbound || !user?.email || !!activeCall || !hasValidTarget;

  return (
    <motion.div
      className={cn(
        'p-4 sm:p-6 mx-auto transition-all duration-500',
        isCallActive ? 'max-w-5xl' : 'max-w-3xl'
      )}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {/* Page Header */}
      <motion.div className="mb-6" variants={staggerItem}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {t('outcall.title')}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
              {t('outcall.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LiveClock variant="compact" />
            {/* Twilio Status */}
            <motion.div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium cursor-default',
                twilioReady
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
              )}
              variants={fadeInScale}
              title={twilioReady
                ? t('outcall.voiceReadyTooltip')
                : t('outcall.voiceConnectingTooltip')
              }
            >
              <span className={cn(
                'w-2 h-2 rounded-full',
                twilioReady ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'
              )} />
              {twilioReady ? t('outcall.voiceReady') : t('outcall.connecting')}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid - dynamic columns based on call state */}
      <motion.div
        className={cn(
          'grid gap-6 transition-all duration-500',
          isCallActive ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        )}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Hero Card - Dial Customer */}
        <motion.div variants={staggerItem}>
          <Card variant="glass" hover="lift" className="overflow-visible">
            <CardHeader className="border-b-0 pb-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <CardTitle>{t('outcall.dialCustomer')}</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Agent Info Strip */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-700/30">
                <div className="relative">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <StatusDot
                    status={twilioReady ? 'online' : 'away'}
                    size="xs"
                    pulse={twilioReady}
                    className="absolute -bottom-0.5 -end-0.5 ring-2 ring-white dark:ring-gray-800 rounded-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{user?.name || t('outcall.agent')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || t('outcall.notLoggedIn')}</p>
                </div>
              </div>

              {/* Dial Mode Toggle - Animated Segmented Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('outcall.callTarget')}
                </label>
                <div className="relative flex rounded-xl bg-gray-100 dark:bg-gray-700/50 p-1">
                  {/* Sliding indicator */}
                  <motion.div
                    className="absolute top-1 bottom-1 rounded-lg bg-white dark:bg-gray-600 shadow-sm"
                    layout
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{
                      width: 'calc(50% - 4px)',
                      insetInlineStart: dialMode === 'customer' ? '4px' : 'calc(50% + 0px)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setDialMode('customer');
                      setLocalError(null);
                    }}
                    disabled={callStatus !== 'idle' && callStatus !== 'completed' && callStatus !== 'failed'}
                    className={cn(
                      'relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors duration-200',
                      dialMode === 'customer'
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    <Users className="w-4 h-4" />
                    {t('outcall.selectCustomer')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDialMode('manual');
                      setLocalError(null);
                    }}
                    disabled={callStatus !== 'idle' && callStatus !== 'completed' && callStatus !== 'failed'}
                    className={cn(
                      'relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors duration-200',
                      dialMode === 'manual'
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    <Phone className="w-4 h-4" />
                    {t('outcall.manualNumber')}
                  </button>
                </div>
              </div>

              {/* Dial Mode Content - Animated switching */}
              <AnimatePresence mode="wait">
                {dialMode === 'customer' ? (
                  <motion.div
                    key="customer-mode"
                    variants={tabContent}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    ref={dropdownRef}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('outcall.searchCustomer')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setSelectedCustomer(null);
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        placeholder={t('outcall.searchPlaceholder')}
                        className="w-full px-4 py-3 ps-10 pe-10 border border-gray-200 dark:border-gray-600 rounded-xl
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                                 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
                                 transition-all duration-200 placeholder:text-gray-400"
                        disabled={callStatus !== 'idle' && callStatus !== 'completed' && callStatus !== 'failed'}
                      />
                      <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <motion.div
                        className="absolute end-3 top-1/2 -translate-y-1/2"
                        animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </motion.div>

                      {/* Animated Dropdown */}
                      <AnimatePresence>
                        {isDropdownOpen && (callStatus === 'idle' || callStatus === 'completed' || callStatus === 'failed') && (
                          <motion.div
                            className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-auto"
                            variants={dropdownVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                          >
                            {isLoadingCustomers ? (
                              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                <Loader2 className="w-5 h-5 animate-spin inline-block me-2" />
                                {t('outcall.loadingCustomers')}
                              </div>
                            ) : filteredCustomers.length === 0 ? (
                              <div className="p-6 text-center">
                                <Users className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('outcall.noCustomersFound')}</p>
                              </div>
                            ) : (
                              <motion.div
                                variants={staggerContainerFast}
                                initial="initial"
                                animate="animate"
                              >
                                {filteredCustomers.map((customer) => (
                                  <motion.button
                                    key={customer.id}
                                    type="button"
                                    variants={menuItemVariants}
                                    onClick={() => handleSelectCustomer(customer)}
                                    className={cn(
                                      'w-full px-4 py-3 text-start flex items-center gap-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0 transition-colors duration-150',
                                      'hover:bg-primary-50/50 dark:hover:bg-primary-900/10',
                                      selectedCustomer?.id === customer.id && 'bg-primary-50 dark:bg-primary-900/20'
                                    )}
                                  >
                                    <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                                      <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{customer.name}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400" dir="ltr">
                                        {formatPhoneForDisplay(customer.phone)}
                                        {customer.company && ` • ${customer.company}`}
                                      </p>
                                    </div>
                                  </motion.button>
                                ))}
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Selected Customer Chip */}
                    <AnimatePresence>
                      {selectedCustomer && (
                        <motion.div
                          className="mt-3 flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/15 border border-primary-200/60 dark:border-primary-800/40 rounded-xl"
                          variants={fadeInScale}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                        >
                          <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{selectedCustomer.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400" dir="ltr">
                              {formatPhoneForDisplay(selectedCustomer.phone)}
                              {selectedCustomer.company && ` • ${selectedCustomer.company}`}
                            </p>
                          </div>
                          <motion.button
                            type="button"
                            aria-label={t('outcall.removeCustomer')}
                            onClick={() => {
                              setSelectedCustomer(null);
                              setSearchQuery('');
                            }}
                            className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <XCircle className="w-5 h-5" />
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div
                    key="manual-mode"
                    variants={tabContent}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('outcall.phoneNumber')}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder={t('outcall.phonePlaceholder')}
                        dir="ltr"
                        className="w-full px-4 py-3 ps-10 text-lg border border-gray-200 dark:border-gray-600 rounded-xl
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                                 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
                                 transition-all duration-200 placeholder:text-gray-400 font-mono"
                        disabled={callStatus !== 'idle' && callStatus !== 'completed' && callStatus !== 'failed'}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && callStatus === 'idle' && !isCallDisabled) {
                            handleCall();
                          }
                        }}
                      />
                      <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {displayError && (
                  <motion.div
                    className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-red-700 dark:text-red-400">{displayError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Call/Hangup Button */}
              <div className="flex gap-3">
                <AnimatePresence mode="wait">
                  {callStatus === 'idle' || callStatus === 'completed' || callStatus === 'failed' ? (
                    <motion.div
                      key="call-btn"
                      className="flex-1"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        variant="success"
                        size="xl"
                        onClick={handleCall}
                        disabled={isCallDisabled}
                        isLoading={isConnectingOutbound}
                        leftIcon={!isConnectingOutbound ? <PhoneOutgoing className="w-5 h-5" /> : undefined}
                        className="w-full"
                      >
                        {isConnectingOutbound ? t('outcall.connecting') : t('outcall.call')}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="hangup-btn"
                      className="flex-1 rounded-2xl"
                      variants={pulseGlow}
                      initial="initial"
                      animate="animate"
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Button
                        variant="danger"
                        size="xl"
                        onClick={handleHangup}
                        leftIcon={<PhoneOff className="w-5 h-5" />}
                        className="w-full"
                      >
                        {t('outcall.hangUp')}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {(callStatus === 'completed' || callStatus === 'failed') && (
                    <motion.div
                      variants={fadeInScale}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <Button
                        variant="secondary"
                        size="xl"
                        onClick={handleNewCall}
                        leftIcon={<Phone className="w-5 h-5" />}
                      >
                        {t('outcall.newCall')}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* In-Call Controls (when connected) */}
              <AnimatePresence>
                {callStatus === 'connected' && (
                  <motion.div
                    className="flex gap-3 overflow-hidden"
                    variants={expandVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <Button
                      variant={isMuted ? 'danger' : 'ghost'}
                      size="lg"
                      onClick={toggleMute}
                      leftIcon={isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      title={isMuted ? t('outcall.unmuteTooltip') : t('outcall.muteTooltip')}
                      className={cn(
                        'flex-1',
                        !isMuted && 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      )}
                    >
                      {isMuted ? t('outcall.unmute') : t('outcall.mute')}
                    </Button>
                    <Button
                      variant={isOnHold ? 'warning' : 'ghost'}
                      size="lg"
                      onClick={toggleHold}
                      leftIcon={isOnHold ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      title={isOnHold ? t('outcall.resumeTooltip') : t('outcall.holdTooltip')}
                      className={cn(
                        'flex-1',
                        !isOnHold && 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      )}
                    >
                      {isOnHold ? t('outcall.resume') : t('outcall.hold')}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call Details Panel - slides in when call starts */}
        <AnimatePresence>
          {(isCallActive || callStatus === 'completed' || callStatus === 'failed') && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <Card variant="elevated" className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <PhoneCall className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <CardTitle>{t('outcall.callDetails')}</CardTitle>
                    </div>
                    {/* Status Badge */}
                    <div aria-live="polite" aria-atomic="true">
                    <AnimatePresence mode="wait">
                      <Badge
                        key={callStatus}
                        variant={getStatusBadgeVariant()}
                        size="lg"
                        dot
                        pulse={callStatus === 'connected' || callStatus === 'ringing'}
                        glow={callStatus === 'connected'}
                        icon={getStatusIcon()}
                      >
                        {getStatusText()}
                      </Badge>
                    </AnimatePresence>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* Duration - Hero display */}
                  <div className="text-center py-4" role="status" aria-live="polite" aria-label={`Call duration: ${formatDuration(callDuration)}`}>
                    <div className="flex items-center justify-center gap-3 mb-1">
                      {callStatus === 'connected' && (
                        <LiveIndicator variant="live" label={t('outcall.live')} />
                      )}
                      {callStatus === 'connecting' && (
                        <LiveIndicator variant="connecting" />
                      )}
                    </div>
                    <motion.span
                      className="text-5xl font-mono font-bold text-gray-900 dark:text-white tracking-widest"
                      key={callDuration}
                      initial={{ opacity: 0.7, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      {formatDuration(callDuration)}
                    </motion.span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      <Clock className="w-3.5 h-3.5 inline-block me-1 -mt-0.5" />
                      {t('outcall.callDuration')}
                    </p>
                  </div>

                  {/* Call Info - clean divide list */}
                  <motion.div
                    className="divide-y divide-gray-100 dark:divide-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden"
                    variants={staggerContainerFast}
                    initial="initial"
                    animate="animate"
                  >
                    {/* Customer Number */}
                    <motion.div
                      className="flex items-center justify-between px-4 py-3.5 bg-white dark:bg-gray-800/50"
                      variants={staggerItem}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
                          <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('outcall.number')}</span>
                      </div>
                      <span className="text-base font-semibold text-gray-900 dark:text-white font-mono" dir="ltr">
                        {pendingOutboundCall?.customerNumber
                          ? formatPhoneForDisplay(pendingOutboundCall.customerNumber)
                          : selectedCustomer?.phone
                            ? formatPhoneForDisplay(selectedCustomer.phone)
                            : phoneNumber || '—'}
                      </span>
                    </motion.div>

                    {/* Customer Name (if available) */}
                    {(pendingOutboundCall?.customerName || selectedCustomer?.name) && (
                      <motion.div
                        className="flex items-center justify-between px-4 py-3.5 bg-white dark:bg-gray-800/50"
                        variants={staggerItem}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{t('outcall.customer')}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {pendingOutboundCall?.customerName || selectedCustomer?.name}
                        </span>
                      </motion.div>
                    )}

                    {/* Agent */}
                    <motion.div
                      className="flex items-center justify-between px-4 py-3.5 bg-white dark:bg-gray-800/50"
                      variants={staggerItem}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
                          <UserCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('outcall.agent')}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user?.name || '—'}
                      </span>
                    </motion.div>

                    {/* Call ID */}
                    {pendingOutboundCall?.callId && (
                      <motion.div
                        className="flex items-center justify-between px-4 py-3.5 bg-white dark:bg-gray-800/50"
                        variants={staggerItem}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
                            <Hash className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{t('outcall.callId')}</span>
                        </div>
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                          {pendingOutboundCall.callId}
                        </span>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Call Progress Stepper */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{t('outcall.callProgress')}</h3>
                      <div className="relative ms-1">
                        {(() => {
                          const steps: { label: string; status: CallStatus }[] = [
                            { label: t('outcall.stepBrowserConnected'), status: 'connecting' },
                            { label: t('outcall.stepDialingCustomer'), status: 'ringing' },
                            { label: t('outcall.stepCustomerAnswered'), status: 'connected' },
                          ];

                          // Add terminal step
                          if (callStatus === 'completed') {
                            steps.push({ label: `${t('outcall.stepCallEnded')} (${formatDuration(callDuration)})`, status: 'completed' });
                          } else if (callStatus === 'failed') {
                            steps.push({ label: t('outcall.stepCallFailed'), status: 'failed' });
                          }

                          const statusOrder: Record<string, number> = {
                            connecting: 0, ringing: 1, connected: 2, completed: 3, failed: 3,
                          };
                          const currentIndex = statusOrder[callStatus] ?? 0;

                          return steps.map((step, index) => {
                            const isCompleted = index < currentIndex;
                            const isActive = index === currentIndex;
                            const isFuture = index > currentIndex;
                            const isFailed = step.status === 'failed' && isActive;
                            const isLast = index === steps.length - 1;

                            return (
                              <motion.div
                                key={step.status}
                                className="relative flex items-start gap-3 pb-5 last:pb-0"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                              >
                                {/* Connecting line */}
                                {!isLast && (
                                  <div className="absolute start-[11px] top-[24px] bottom-0 w-[2px]">
                                    <motion.div
                                      className={cn(
                                        'w-full h-full rounded-full',
                                        isCompleted
                                          ? 'bg-primary-400 dark:bg-primary-500'
                                          : isActive && !isFailed
                                            ? 'bg-primary-200 dark:bg-primary-800'
                                            : 'bg-gray-200 dark:bg-gray-700'
                                      )}
                                      initial={{ scaleY: 0 }}
                                      animate={{ scaleY: 1 }}
                                      transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                                      style={{ transformOrigin: 'top' }}
                                    />
                                  </div>
                                )}

                                {/* Step circle */}
                                <div className="relative z-10 flex-shrink-0">
                                  {isCompleted ? (
                                    <motion.div
                                      className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: 'spring', stiffness: 400, damping: 15, delay: index * 0.1 }}
                                    >
                                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                    </motion.div>
                                  ) : isActive && !isFailed ? (
                                    <motion.div
                                      className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 border-2 border-primary-500 flex items-center justify-center"
                                      animate={{ boxShadow: ['0 0 0 0 rgba(0,117,74,0.3)', '0 0 0 6px rgba(0,117,74,0)', '0 0 0 0 rgba(0,117,74,0)'] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    >
                                      <Loader2 className="w-3 h-3 text-primary-600 dark:text-primary-400 animate-spin" />
                                    </motion.div>
                                  ) : isFailed ? (
                                    <motion.div
                                      className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: [0, 1.2, 1] }}
                                      transition={{ duration: 0.4 }}
                                    >
                                      <XCircle className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                    </motion.div>
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                      <Circle className="w-2.5 h-2.5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                  )}
                                </div>

                                {/* Step label */}
                                <span className={cn(
                                  'text-sm pt-0.5',
                                  isCompleted && 'text-primary-700 dark:text-primary-400 font-medium',
                                  isActive && !isFailed && 'text-primary-600 dark:text-primary-400 font-medium',
                                  isFailed && 'text-red-600 dark:text-red-400 font-medium',
                                  isFuture && 'text-gray-400 dark:text-gray-500',
                                  step.status === 'completed' && isActive && 'text-blue-600 dark:text-blue-400 font-medium',
                                )}>
                                  {step.label}
                                </span>
                              </motion.div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Collapsible Guide */}
      <AnimatePresence>
        {!isCallActive && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card variant="flat" className="overflow-hidden">
              <button
                type="button"
                onClick={() => setIsGuideOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-start group"
                aria-expanded={isGuideOpen}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('outcall.guideTitle')}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isGuideOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isGuideOpen && (
                  <motion.div
                    variants={expandVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1">
                      <div className="relative ms-4">
                        {[
                          { num: 1, text: t('outcall.guideStep1') },
                          { num: 2, text: t('outcall.guideStep2') },
                          { num: 3, text: t('outcall.guideStep3') },
                          { num: 4, text: t('outcall.guideStep4') },
                        ].map((step, index) => (
                          <motion.div
                            key={step.num}
                            className="relative flex items-start gap-3 pb-4 last:pb-0"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.08 }}
                          >
                            {/* Dotted connecting line */}
                            {index < 3 && (
                              <div className="absolute start-[11px] top-[28px] bottom-0 w-[2px] border-s-2 border-dotted border-primary-200 dark:border-primary-800" />
                            )}
                            {/* Step number */}
                            <div className="relative z-10 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-primary-700 dark:text-primary-400">{step.num}</span>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 pt-0.5">{step.text}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OutCall;
