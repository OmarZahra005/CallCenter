import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Badge, Button, Avatar } from '../../../components/ui';
import { SLATimer, ConversationItem } from '../../../components/ui';
import { useAgentDesktop, type ConversationInfo } from '../hooks/useAgentDesktop';
import TransferDialog from '../components/TransferDialog';
import { AgentControlBar } from '../components/AgentControlBar';
import { CallInfoPanel } from '../components/CallInfoPanel';
import { IncomingCallBanner } from '../../../components/call-center';
import { CallCenterProvider, useCallCenter } from '../../../context/CallCenterContext';
import { useAuthStore } from '../../../store/authStore';
import apiClient from '../../../api/client';

const AgentDesktopContent = () => {
  const { t } = useTranslation();
  const {
    setAgentIdentity,
    twilioReady,
    activeCall: twilioActiveCall,
    callStartTime: twilioCallStartTime,
    isMuted: twilioIsMuted,
    isOnHold: twilioIsOnHold,
    toggleMute: twilioToggleMute,
    toggleHold: twilioToggleHold,
    hangupCurrent: twilioHangup,
  } = useCallCenter();
  const user = useAuthStore((state) => state.user);

  // Auto-initialize Twilio Device with current user's email
  useEffect(() => {
    if (user?.email && !twilioReady) {
      setAgentIdentity(user.email);
    }
  }, [user?.email, twilioReady, setAgentIdentity]);

  // Lookup customer when Twilio call becomes active
  useEffect(() => {
    const lookupCustomer = async () => {
      if (twilioActiveCall && twilioActiveCall.fromNumber) {
        try {
          // Try to find customer by phone number
          const normalizedPhone = twilioActiveCall.fromNumber.replace(/[\s\-\(\)]/g, '');
          const encodedPhone = encodeURIComponent(normalizedPhone);
          const response = await fetch(`/api/customers/phone/${encodedPhone}`);
          if (response.ok) {
            const customerData = await response.json();
            if (customerData?.id) {
              setCurrentCustomerId(customerData.id);
            }
          }
        } catch (error) {
          console.error('Error looking up customer:', error);
        }
      }
    };

    lookupCustomer();
  }, [twilioActiveCall]);

  // Clear customer when call ends
  useEffect(() => {
    if (!twilioActiveCall) {
      setCurrentCustomerId(null);
    }
  }, [twilioActiveCall]);

  // Customer lookup state
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);

  // Fetch customer data
  const { data: twilioCustomer, isLoading: twilioCustomerLoading } = useQuery({
    queryKey: ['customers', currentCustomerId],
    queryFn: async () => {
      if (!currentCustomerId) return null;
      const response = await apiClient.get(`/customers/${currentCustomerId}`);
      return response.data;
    },
    enabled: !!currentCustomerId,
  });

  // Ticket form state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketPriority, setTicketPriority] = useState('Medium');
  const [ticketCategory, setTicketCategory] = useState('General');
  const [callNotes, setCallNotes] = useState('');

  // Transfer dialog state
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);

  // Use the custom hook for all data and handlers
  const {
    callState,
    agentState,
    currentCall,
    currentAgent,
    currentCustomer,
    conversations,
    customerInteractions,
    isConnected,
    isLoading,
    customerLoading,
    handleTransfer,
    handleChangeAgentState,
    createTicket,
    isCreatingTicket,
  } = useAgentDesktop();

  // Get display name and info
  const agentName = currentAgent?.name || 'Agent';
  // Prioritize Twilio customer data over mock data
  const displayCustomer = twilioCustomer || currentCustomer;
  const customerName = displayCustomer?.name || twilioActiveCall?.fromNumber || currentCall?.callerName || 'Unknown Caller';
  const customerPhone = displayCustomer?.phone || twilioActiveCall?.fromNumber || currentCall?.callerNumber || '';
  const customerEmail = displayCustomer?.email || '';
  const customerType = displayCustomer?.type || 'Standard';

  const handleCreateTicket = async () => {
    if (!ticketSubject.trim()) return;

    try {
      await createTicket({
        subject: ticketSubject,
        description: ticketDescription,
        priority: ticketPriority,
        category: ticketCategory,
        customerId: currentCustomerId || currentCustomer?.id,
      });

      // Clear form on success
      setTicketSubject('');
      setTicketDescription('');
      setTicketPriority('Medium');
      setTicketCategory('General');
      alert(t('agentDesktop.ticketCreated'));
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert(t('agentDesktop.ticketFailed'));
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">{t('agentDesktop.loadingAgentDesktop')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Incoming Call Banner */}
      <IncomingCallBanner />

      <div className="flex-1 flex gap-4">
        {/* Left Sidebar - Conversation List */}
        <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">{t('agentDesktop.conversations')}</h2>
          {isConnected && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {t('agentDesktop.live')}
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {t('agentDesktop.noActiveConversations')}
            </div>
          ) : (
            conversations.map((conv: ConversationInfo) => (
              <ConversationItem
                key={conv.id}
                {...conv}
                onClick={() => {}}
              />
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Agent Control Bar - Always visible */}
        <AgentControlBar
          agentName={agentName}
          agentState={agentState}
          onChangeAgentState={handleChangeAgentState}
          isCallActive={callState === 'active' || callState === 'ringing'}
        />

        {/* Call Info Panel - Only when active call exists */}
        {twilioActiveCall && twilioCallStartTime && (
          <CallInfoPanel
            callInfo={{
              callId: twilioActiveCall.id,
              callerNumber: twilioActiveCall.fromNumber,
              callerName: twilioCustomer?.name,
              customerId: currentCustomerId || undefined,
              direction: twilioActiveCall.direction as 'Inbound' | 'Outbound' | 'Transfer',
              queueName: undefined,
              waitTimeSeconds: undefined,
              startTime: new Date(twilioActiveCall.startedAtUtc),
            }}
            customer={twilioCustomer}
            callState={twilioIsOnHold ? 'onhold' : 'active'}
            callStartTime={twilioCallStartTime}
            isMuted={twilioIsMuted}
            isOnHold={twilioIsOnHold}
            onMute={twilioToggleMute}
            onHold={() => twilioToggleHold()}
            onResume={() => twilioToggleHold()}
            onTransfer={() => setIsTransferDialogOpen(true)}
            onHangup={twilioHangup}
          />
        )}

        {/* Content Panels */}
        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
          {/* Customer 360 View */}
          <Card variant="bordered" className="overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('agentDesktop.customer360')}</h3>
            </div>
            <CardContent className="flex-1 overflow-y-auto">
              {(customerLoading || twilioCustomerLoading) ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : displayCustomer || twilioActiveCall || currentCall ? (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar name={customerName} size="xl" />
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{customerName}</h4>
                      <Badge variant={customerType === 'Premium' || customerType === 'VIP' ? 'success' : 'default'}>
                        {t(`customerType.${customerType.toLowerCase()}`)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {customerPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">{customerPhone}</span>
                      </div>
                    )}
                    {customerEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">{customerEmail}</span>
                      </div>
                    )}
                  </div>

                  {displayCustomer && (
                    <>
                      <div className="mt-6">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('agentDesktop.statistics')}</h5>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {customerInteractions.filter(i => i.type === 'Call').length}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('agentDesktop.totalCalls')}</p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {customerInteractions.filter(i => i.type === 'Ticket').length}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('nav.tickets')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('agentDesktop.recentInteractions')}</h5>
                        {customerInteractions.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-2">{t('agentDesktop.noInteractionsFound')}</p>
                        ) : (
                          <div className="space-y-2">
                            {customerInteractions.map((interaction) => (
                              <div key={interaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{interaction.type}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{interaction.summary}</p>
                                </div>
                                <div className="text-end">
                                  <span className="text-xs text-gray-400">{interaction.date}</span>
                                  {interaction.status && (
                                    <p className="text-xs text-gray-500">{interaction.status}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  <p>{t('agentDesktop.noCustomerData')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ticket / Notes Panel */}
          <Card variant="bordered" className="overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('agentDesktop.quickTicket')}</h3>
              <SLATimer deadline={new Date(Date.now() + 10 * 60 * 1000)} />
            </div>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('agentDesktop.subject')}</label>
                  <input
                    type="text"
                    placeholder={t('agentDesktop.enterTicketSubject')}
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('agentDesktop.description')}</label>
                  <textarea
                    rows={4}
                    placeholder={t('agentDesktop.describeIssue')}
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('agentDesktop.priority')}</label>
                    <select
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Low">{t('priority.low')}</option>
                      <option value="Medium">{t('priority.medium')}</option>
                      <option value="High">{t('priority.high')}</option>
                      <option value="Critical">{t('priority.critical')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('agentDesktop.category')}</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="General">{t('category.general')}</option>
                      <option value="Billing">{t('category.billing')}</option>
                      <option value="Technical">{t('category.technical')}</option>
                      <option value="Sales">{t('category.sales')}</option>
                    </select>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={handleCreateTicket}
                  disabled={isCreatingTicket || !ticketSubject.trim()}
                >
                  {isCreatingTicket ? t('agentDesktop.creating') : t('agentDesktop.createTicket')}
                </Button>
              </div>

              <div className="mt-6">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('agentDesktop.callNotes')}</h5>
                <textarea
                  rows={3}
                  placeholder={t('agentDesktop.addCallNotes')}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transfer Dialog */}
      <TransferDialog
        isOpen={isTransferDialogOpen}
        onClose={() => setIsTransferDialogOpen(false)}
        onTransfer={handleTransfer}
        currentAgentId={currentAgent?.id}
      />
    </div>
    </div>
  );
};

const AgentDesktop = () => {
  return (
    <CallCenterProvider>
      <AgentDesktopContent />
    </CallCenterProvider>
  );
};

export default AgentDesktop;
