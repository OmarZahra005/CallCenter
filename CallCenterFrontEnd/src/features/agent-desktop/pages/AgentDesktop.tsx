import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ConversationItem } from '../../../components/ui';
import { useAgentDesktop, type ConversationInfo } from '../hooks/useAgentDesktop';
import TransferDialog from '../components/TransferDialog';
import { CallControlStrip } from '../components/CallControlStrip';
import { QuickTicketForm } from '../components/QuickTicketForm';
import { ACWPanel, type ACWFormData } from '../components/ACWPanel';
import { RecordingCard } from '../components/RecordingCard';
import { ConversationTimeline } from '../components/ConversationTimeline';
import { LinkedTicketsList } from '../components/LinkedTicketsList';
import { Customer360Card } from '../components/Customer360Card';
import { NotesPanel } from '../components/NotesPanel';
import { AiSuggestionsPanel } from '../components/AiSuggestionsPanel';
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
    handleAnswer,
    handleReject,
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

  // Lookup customer when Twilio call becomes active
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

  // Call notes state (kept in parent for persistence across components)
  const [callNotes, setCallNotes] = useState('');

  // Transfer dialog state
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);

  // Get display name
  const agentName = currentAgent?.name || 'Agent';

  // Determine effective conversation ID
  const effectiveConversationId = activeConversationId || lastConversationId;

  // Create ticket handler (wires to hook)
  const handleCreateTicket = async (data: {
    subject: string;
    description: string;
    priority: string;
    category: string;
  }) => {
    const conversationIdToLink = activeConversationId || lastConversationId;
    await createTicket({
      ...data,
      customerId: effectiveCustomerId || currentCustomer?.id,
      conversationId: conversationIdToLink || undefined,
    });
    alert(t('agentDesktop.ticketCreated'));
  };

  // Handler to open recording in QA module
  const handleOpenRecordingInQA = (recordingId: string) => {
    window.open(`/qa?recordingId=${recordingId}`, '_blank');
  };

  // Determine call state for control strip
  const effectiveCallState = twilioIsOnHold ? 'onhold' as const : callState;

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-6.5rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">{t('agentDesktop.loadingAgentDesktop')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Incoming Call Banner */}
      <IncomingCallBanner />

      {/* TOP: Call Control Strip */}
      <CallControlStrip
        agentName={agentName}
        agentState={agentState}
        onChangeAgentState={handleChangeAgentState}
        callState={effectiveCallState}
        callerNumber={twilioActiveCall?.fromNumber || currentCall?.callerNumber}
        callerName={currentCustomer?.name || currentCall?.callerName}
        callStartTime={twilioCallStartTime || undefined}
        isMuted={twilioIsMuted}
        isOnHold={twilioIsOnHold}
        onAnswer={handleAnswer}
        onReject={handleReject}
        onMute={twilioToggleMute}
        onHold={() => twilioToggleHold()}
        onResume={() => twilioToggleHold()}
        onTransfer={() => setIsTransferDialogOpen(true)}
        onHangup={twilioHangup}
      />

      {/* THREE-PANEL BODY */}
      <div className="flex-1 flex gap-3 min-h-0 mt-3">

        {/* LEFT PANEL: Tickets & Notes */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-3 overflow-y-auto">
          <QuickTicketForm
            onCreateTicket={handleCreateTicket}
            isCreating={isCreatingTicket}
            callNotes={callNotes}
            onCallNotesChange={setCallNotes}
          />

          {effectiveConversationId && (
            <>
              <NotesPanel
                conversationId={effectiveConversationId}
                isCollapsible={true}
                defaultExpanded={true}
              />
              <AiSuggestionsPanel
                conversationId={effectiveConversationId}
                isCollapsible={true}
                defaultExpanded={!!twilioActiveCall}
              />
              <LinkedTicketsList
                conversationId={effectiveConversationId}
                customerId={effectiveCustomerId || null}
                isCollapsible={true}
                defaultExpanded={true}
                onViewTicket={(ticketId) => window.open(`/tickets/${ticketId}`, '_blank')}
              />
            </>
          )}
        </div>

        {/* CENTER PANEL: Customer 360 */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-w-0">
          {/* Customer 360 View - Always visible */}
          <Customer360Card
            customerId={effectiveCustomerId}
            customer={currentCustomer}
            callerNumber={twilioActiveCall?.fromNumber || currentCall?.callerNumber}
            isLoading={customerLoading}
            isCollapsible={false}
            defaultExpanded={true}
            recentInteractions={customerInteractions.map(interaction => ({
              id: interaction.id,
              type: interaction.type as 'Call' | 'Ticket' | 'Email' | 'Chat',
              summary: interaction.summary,
              date: interaction.date,
              status: interaction.status,
            }))}
            onViewCustomer={(id) => window.open(`/customers/${id}`, '_blank')}
          />

          {/* ACW Panel - After Call Work */}
          {isACWActive && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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
              <div className="lg:col-span-1">
                <RecordingCard
                  isVisible={isACWActive}
                  callSid={lastCallSid || undefined}
                  callId={lastCallId || undefined}
                  onOpenInQA={handleOpenRecordingInQA}
                />
              </div>
            </div>
          )}

          {/* Conversation Timeline */}
          {effectiveConversationId && (
            <ConversationTimeline
              conversationId={effectiveConversationId}
              isCollapsible={true}
              defaultExpanded={true}
            />
          )}
        </div>

        {/* RIGHT PANEL: Conversations */}
        <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
            <h2 className="font-semibold text-sm text-gray-900 dark:text-white">
              {t('agentDesktop.conversations')}
            </h2>
            {isConnected && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                {t('agentDesktop.live')}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
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

      </div>

      {/* Transfer Dialog */}
      <TransferDialog
        isOpen={isTransferDialogOpen}
        onClose={() => setIsTransferDialogOpen(false)}
        onTransfer={handleTransfer}
        currentAgentId={currentAgent?.id}
      />
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
