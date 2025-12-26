import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';
import { useCallCenter } from '../../../context/CallCenterContext';
import { useAuthStore } from '../../../store/authStore';
import apiClient from '../../../api/client';

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
      setLocalError(dialMode === 'customer' ? 'Please select a customer' : 'Please enter a phone number');
      return;
    }
    if (!twilioReady) {
      setLocalError('Voice system is not ready. Please wait...');
      return;
    }
    if (!user?.email) {
      setLocalError('User not authenticated');
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

  const formatPhoneDisplay = (phone: string) => {
    if (phone.startsWith('+966')) {
      return phone.replace('+966', '0');
    }
    return phone;
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case 'idle':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'ringing':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'connected':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-600';
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
        return 'Ready to Call';
      case 'connecting':
        return 'Connecting...';
      case 'ringing':
        return 'Ringing Customer...';
      case 'connected':
        return 'Call Connected';
      case 'completed':
        return 'Call Completed';
      case 'failed':
        return 'Call Failed';
      default:
        return 'Unknown';
    }
  };

  // Combine local and context errors
  const displayError = localError || contextError;

  // Determine if call button should be disabled
  const hasValidTarget = dialMode === 'customer' ? !!selectedCustomer : !!phoneNumber.trim();
  const isCallDisabled = !twilioReady || isConnectingOutbound || !user?.email || !!activeCall || !hasValidTarget;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Outbound Call</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Make outbound calls to customers directly from the system
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dial Pad / Call Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary-500" />
            Dial Customer
          </h2>

          {/* Agent Info */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{user?.name || 'Agent'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || 'Not logged in'}</p>
              </div>
            </div>
          </div>

          {/* Twilio Status */}
          <div className="mb-4 flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${twilioReady ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {twilioReady ? 'Voice System Ready' : 'Connecting to Voice System...'}
            </span>
          </div>

          {/* Dial Mode Toggle */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Call Target
            </label>
            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
              <button
                type="button"
                onClick={() => {
                  setDialMode('customer');
                  setLocalError(null);
                }}
                disabled={callStatus !== 'idle' && callStatus !== 'completed' && callStatus !== 'failed'}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors
                          ${dialMode === 'customer'
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Users className="w-4 h-4" />
                Select Customer
              </button>
              <button
                type="button"
                onClick={() => {
                  setDialMode('manual');
                  setLocalError(null);
                }}
                disabled={callStatus !== 'idle' && callStatus !== 'completed' && callStatus !== 'failed'}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors
                          ${dialMode === 'manual'
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Phone className="w-4 h-4" />
                Manual Number
              </button>
            </div>
          </div>

          {/* Customer Search (when in customer mode) */}
          {dialMode === 'customer' && (
            <div className="mb-4" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Customer
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
                  placeholder="Search by name, phone, or email..."
                  className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                           disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  disabled={callStatus !== 'idle' && callStatus !== 'completed' && callStatus !== 'failed'}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />

                {/* Dropdown */}
                {isDropdownOpen && (callStatus === 'idle' || callStatus === 'completed' || callStatus === 'failed') && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {isLoadingCustomers ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                        Loading customers...
                      </div>
                    ) : filteredCustomers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No customers found
                      </div>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => handleSelectCustomer(customer)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-0
                                    ${selectedCustomer?.id === customer.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                        >
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{customer.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400" dir="ltr">
                              {formatPhoneForDisplay(customer.phone)}
                              {customer.company && ` • ${customer.company}`}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selected Customer Display */}
              {selectedCustomer && (
                <div className="mt-2 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400" dir="ltr">
                        {formatPhoneForDisplay(selectedCustomer.phone)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(null);
                        setSearchQuery('');
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual Phone Number Input (when in manual mode) */}
          {dialMode === 'manual' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number (e.g., 0512345678)"
                  className="w-full px-4 py-3 pl-10 text-lg border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                           disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  disabled={callStatus !== 'idle' && callStatus !== 'completed' && callStatus !== 'failed'}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && callStatus === 'idle' && !isCallDisabled) {
                      handleCall();
                    }
                  }}
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          )}

          {/* Error Message */}
          {displayError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700 dark:text-red-400">{displayError}</span>
            </div>
          )}

          {/* Call/Hangup Button */}
          <div className="flex gap-3">
            {callStatus === 'idle' || callStatus === 'completed' || callStatus === 'failed' ? (
              <button
                onClick={handleCall}
                disabled={isCallDisabled}
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed
                         text-white font-semibold rounded-lg transition-colors
                         flex items-center justify-center gap-2"
              >
                {isConnectingOutbound ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <PhoneOutgoing className="w-5 h-5" />
                )}
                {isConnectingOutbound ? 'Connecting...' : 'Call'}
              </button>
            ) : (
              <button
                onClick={handleHangup}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700
                         text-white font-semibold rounded-lg transition-colors
                         flex items-center justify-center gap-2"
              >
                <PhoneOff className="w-5 h-5" />
                Hang Up
              </button>
            )}

            {(callStatus === 'completed' || callStatus === 'failed') && (
              <button
                onClick={handleNewCall}
                className="py-3 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
                         text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-colors"
              >
                New Call
              </button>
            )}
          </div>

          {/* Call Controls (when connected) */}
          {callStatus === 'connected' && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={toggleMute}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
                          ${isMuted
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
              <button
                onClick={toggleHold}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
                          ${isOnHold
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
              >
                <Volume2 className="w-4 h-4" />
                {isOnHold ? 'Resume' : 'Hold'}
              </button>
            </div>
          )}
        </div>

        {/* Call Details Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-primary-500" />
            Call Details
          </h2>

          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6 ${getStatusColor()}`}>
            {getStatusIcon()}
            {getStatusText()}
          </div>

          {/* Call Info */}
          <div className="space-y-4">
            {/* Duration */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
              </div>
              <span className="text-2xl font-mono font-semibold text-gray-900 dark:text-white">
                {formatDuration(callDuration)}
              </span>
            </div>

            {/* Customer Number */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Customer Number</span>
              </div>
              <span className="text-lg font-medium text-gray-900 dark:text-white" dir="ltr">
                {pendingOutboundCall?.customerNumber
                  ? formatPhoneDisplay(pendingOutboundCall.customerNumber)
                  : selectedCustomer?.phone
                    ? formatPhoneForDisplay(selectedCustomer.phone)
                    : phoneNumber || '—'}
              </span>
            </div>

            {/* Customer Name (if available) */}
            {(pendingOutboundCall?.customerName || selectedCustomer?.name) && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Customer Name</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {pendingOutboundCall?.customerName || selectedCustomer?.name}
                </span>
              </div>
            )}

            {/* Agent */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <UserCircle className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Agent</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || '—'}
              </span>
            </div>

            {/* Call ID */}
            {pendingOutboundCall?.callId && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Call ID</span>
                </div>
                <span className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                  {pendingOutboundCall.callId}
                </span>
              </div>
            )}
          </div>

          {/* Call Status Timeline */}
          {callStatus !== 'idle' && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Call Progress</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  {callStatus === 'connecting' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>Connecting...</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${['ringing', 'connected', 'completed'].includes(callStatus) ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                  {callStatus === 'ringing' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>Dialing Customer</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${['connected', 'completed'].includes(callStatus) ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                  <CheckCircle className="w-4 h-4" />
                  <span>Customer Answered</span>
                </div>
                {callStatus === 'completed' && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Call Ended ({formatDuration(callDuration)})</span>
                  </div>
                )}
                {callStatus === 'failed' && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <XCircle className="w-4 h-4" />
                    <span>Call Failed</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">How Outbound Calls Work</h3>
        <ol className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
          <li>Choose how to dial: <strong>Select Customer</strong> (search existing customers) or <strong>Manual Number</strong></li>
          <li>Click "Call" - your browser connects automatically with no accept step needed</li>
          <li>The customer's phone will ring</li>
          <li>When the customer answers, you'll be connected</li>
        </ol>
      </div>
    </div>
  );
};

export default OutCall;
