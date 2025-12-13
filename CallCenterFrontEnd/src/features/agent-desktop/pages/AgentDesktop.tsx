import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Button } from '../../../components/ui';
import { SLATimer, ConversationItem } from '../../../components/ui';
import { useAgentDesktop, type ConversationInfo } from '../hooks/useAgentDesktop';
import TransferDialog from '../components/TransferDialog';
import { AgentControlBar } from '../components/AgentControlBar';
import { CallInfoPanel } from '../components/CallInfoPanel';
import { ACWPanel, type ACWFormData } from '../components/ACWPanel';
import { RecordingCard } from '../components/RecordingCard';
import { ConversationTimeline } from '../components/ConversationTimeline';
import { LinkedTicketsList } from '../components/LinkedTicketsList';
import { Customer360Card } from '../components/Customer360Card';
import { NotesPanel } from '../components/NotesPanel';
import { IncomingCallBanner } from '../../../components/call-center';
import { CallCenterProvider, useCallCenter } from '../../../context/CallCenterContext';
import { useAuthStore } from '../../../store/authStore';

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

  // Use the custom hook for all data and handlers (moved up before Twilio lookup)
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
    // ACW related
    isACWActive,
    lastCallId,
    lastCallSid,
    lastCallDuration,
    lastCustomerName,
    lastConversationId,
    handleACWComplete,
    handleACWSkip,
    // Timeline related
    activeConversationId,
    // Effective IDs (current or last for ACW)
    effectiveCustomerId,
    // Functions to set customer from Twilio
    setCustomerIdFromTwilio,
    lookupCustomerByPhone,
  } = useAgentDesktop();

  // Lookup customer when Twilio call becomes active - use hook's function
  useEffect(() => {
    const lookupCustomer = async () => {
      if (twilioActiveCall && twilioActiveCall.fromNumber) {
        const customerId = await lookupCustomerByPhone(twilioActiveCall.fromNumber);
        if (customerId) {
          setCustomerIdFromTwilio(customerId);
        }
      }
    };

    lookupCustomer();
  }, [twilioActiveCall, lookupCustomerByPhone, setCustomerIdFromTwilio]);

  // Ticket form state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketPriority, setTicketPriority] = useState('Medium');
  const [ticketCategory, setTicketCategory] = useState('General');
  const [callNotes, setCallNotes] = useState('');

  // Transfer dialog state
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);

  // Get display name and info
  const agentName = currentAgent?.name || 'Agent';

  const handleCreateTicket = async () => {
    if (!ticketSubject.trim()) return;

    try {
      // Include conversationId to link ticket to current conversation
      const conversationIdToLink = activeConversationId || lastConversationId;
      await createTicket({
        subject: ticketSubject,
        description: ticketDescription,
        priority: ticketPriority,
        category: ticketCategory,
        customerId: effectiveCustomerId || currentCustomer?.id,
        conversationId: conversationIdToLink || undefined,
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

  // Handler to open recording in QA module
  const handleOpenRecordingInQA = (recordingId: string) => {
    // Navigate to QA module with recording ID
    window.open(`/qa?recordingId=${recordingId}`, '_blank');
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
              callerName: currentCustomer?.name,
              customerId: effectiveCustomerId || undefined,
              direction: twilioActiveCall.direction as 'Inbound' | 'Outbound' | 'Transfer',
              queueName: undefined,
              waitTimeSeconds: undefined,
              startTime: new Date(twilioActiveCall.startedAtUtc),
            }}
            customer={currentCustomer}
            callState={twilioIsOnHold ? 'onhold' : 'active'}
            callStartTime={twilioCallStartTime}
            isMuted={twilioIsMuted}
            isOnHold={twilioIsOnHold}
            onMute={twilioToggleMute}
            onHold={() => twilioToggleHold()}
            onResume={() => twilioToggleHold()}
            onTransfer={() => setIsTransferDialogOpen(true)}
            onHangup={twilioHangup}
            recentInteractions={customerInteractions.slice(0, 5).map(interaction => ({
              id: interaction.id,
              type: interaction.type as 'Call' | 'Ticket' | 'Email' | 'Chat',
              summary: interaction.summary,
              date: interaction.date,
              status: interaction.status,
            }))}
            linkedTickets={customerInteractions
              .filter(i => i.type === 'Ticket')
              .slice(0, 3)
              .map(ticket => ({
                id: ticket.id,
                subject: ticket.summary,
                status: ticket.status || 'Open',
                priority: 'Medium',
                createdAt: ticket.date,
              }))}
          />
        )}

        {/* ACW Panel - After Call Work */}
        {isACWActive && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* ACW Form - Takes 2/3 of the space */}
              <div className="lg:col-span-2">
                <ACWPanel
                  isVisible={isACWActive}
                  callId={lastCallId || undefined}
                  customerName={lastCustomerName || undefined}
                  callDuration={lastCallDuration}
                  acwTimeoutSeconds={30}
                  onComplete={(data: ACWFormData) => handleACWComplete(data)}
                  onSkip={handleACWSkip}
                />
              </div>

              {/* Recording Card - Takes 1/3 of the space */}
              <div className="lg:col-span-1">
                <RecordingCard
                  isVisible={isACWActive}
                  callSid={lastCallSid || undefined}
                  callId={lastCallId || undefined}
                  onOpenInQA={handleOpenRecordingInQA}
                />
              </div>
            </div>

            {/* Timeline, Linked Tickets and Notes for completed call during ACW */}
            {lastConversationId && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <ConversationTimeline
                  conversationId={lastConversationId}
                  isCollapsible={true}
                  defaultExpanded={true}
                />
                <LinkedTicketsList
                  conversationId={lastConversationId}
                  customerId={effectiveCustomerId || null}
                  isCollapsible={true}
                  defaultExpanded={true}
                  onViewTicket={(ticketId) => window.open(`/tickets/${ticketId}`, '_blank')}
                />
                <NotesPanel
                  conversationId={lastConversationId}
                  isCollapsible={true}
                  defaultExpanded={true}
                />
              </div>
            )}
          </div>
        )}

        {/* Timeline, Linked Tickets and Notes for active call (when not in ACW) */}
        {!isACWActive && activeConversationId && twilioActiveCall && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ConversationTimeline
              conversationId={activeConversationId}
              isCollapsible={true}
              defaultExpanded={false}
            />
            <LinkedTicketsList
              conversationId={activeConversationId}
              customerId={effectiveCustomerId || null}
              isCollapsible={true}
              defaultExpanded={true}
              onViewTicket={(ticketId) => window.open(`/tickets/${ticketId}`, '_blank')}
            />
            <NotesPanel
              conversationId={activeConversationId}
              isCollapsible={true}
              defaultExpanded={false}
            />
          </div>
        )}

        {/* Content Panels */}
        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
          {/* Customer 360 View */}
          <Customer360Card
            customerId={effectiveCustomerId}
            customer={currentCustomer}
            callerNumber={twilioActiveCall?.fromNumber || currentCall?.callerNumber}
            isLoading={customerLoading}
            recentInteractions={customerInteractions.map(interaction => ({
              id: interaction.id,
              type: interaction.type as 'Call' | 'Ticket' | 'Email' | 'Chat',
              summary: interaction.summary,
              date: interaction.date,
              status: interaction.status,
            }))}
            onViewCustomer={(id) => window.open(`/customers/${id}`, '_blank')}
          />

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
