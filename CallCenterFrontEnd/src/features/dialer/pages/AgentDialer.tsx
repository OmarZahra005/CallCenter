import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button, Card, Badge, Select } from '../../../components/ui';
import apiClient from '../../../api/client';
import {
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  FastForward,
  PhoneOff,
  Calendar,
} from 'lucide-react';

interface DialerSession {
  campaignId: string;
  campaignName: string;
  dialingMode: number;
  campaignStatus: number;
  isAgentActive: boolean;
  currentRecord?: DialerRecord;
  currentAttempt?: DialerAttempt;
  pendingRecords: number;
  agentCallsToday: number;
  agentConnectsToday: number;
}

interface DialerRecord {
  id: string;
  phoneNumber: string;
  phoneNumber2?: string;
  phoneNumber3?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email?: string;
  company?: string;
  status: number;
  attemptCount: number;
  lastDisposition?: string;
  notes?: string;
  priority: number;
}

interface DialerAttempt {
  id: string;
  phoneNumberDialed: string;
  attemptNumber: number;
  startedAtUtc: string;
}

interface Campaign {
  id: string;
  name: string;
  status: number;
  dialingMode: number;
}

const dialingModes = ['Preview', 'Progressive', 'Power', 'Predictive'];
const dispositionCodes = [
  { value: 'SALE', label: 'Sale' },
  { value: 'CALLBACK', label: 'Callback Requested' },
  { value: 'NOT_INTERESTED', label: 'Not Interested' },
  { value: 'WRONG_NUMBER', label: 'Wrong Number' },
  { value: 'DO_NOT_CALL', label: 'Do Not Call' },
  { value: 'NO_ANSWER', label: 'No Answer' },
  { value: 'BUSY', label: 'Busy' },
  { value: 'VOICEMAIL', label: 'Voicemail' },
  { value: 'OTHER', label: 'Other' },
];

export function AgentDialer() {
  const { t } = useTranslation();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [isOnCall, setIsOnCall] = useState(false);
  const [disposition, setDisposition] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch available campaigns
  const { data: campaigns } = useQuery({
    queryKey: ['dialer-campaigns-running'],
    queryFn: async () => {
      const response = await apiClient.get('/dialer/campaigns', {
        params: { pageNumber: 1, pageSize: 50, status: 2 } // Running campaigns only
      });
      return response.data.items as Campaign[];
    }
  });

  // Fetch session when campaign is selected
  const { data: session, refetch: refetchSession } = useQuery({
    queryKey: ['dialer-session', selectedCampaignId],
    queryFn: async () => {
      if (!selectedCampaignId) return null;
      const response = await apiClient.get(`/dialer/session/${selectedCampaignId}`);
      return response.data as DialerSession;
    },
    enabled: !!selectedCampaignId,
    refetchInterval: isOnCall ? 5000 : false, // Refresh while on call
  });

  // Login to campaign
  const loginMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      return apiClient.post(`/dialer/session/${campaignId}/login`);
    },
    onSuccess: () => {
      refetchSession();
    }
  });

  // Logout from campaign
  const logoutMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      return apiClient.post(`/dialer/session/${campaignId}/logout`);
    },
    onSuccess: () => {
      refetchSession();
      setSelectedCampaignId('');
    }
  });

  // Get next record
  const nextRecordMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      return apiClient.post(`/dialer/session/${campaignId}/next-record`);
    },
    onSuccess: () => {
      refetchSession();
    }
  });

  // Dial record
  const dialMutation = useMutation({
    mutationFn: async ({ recordId, phoneNumber }: { recordId: string; phoneNumber?: string }) => {
      return apiClient.post('/dialer/session/dial', {
        recordId,
        phoneNumberToUse: phoneNumber
      });
    },
    onSuccess: () => {
      setIsOnCall(true);
      refetchSession();
    }
  });

  // Skip record
  const skipMutation = useMutation({
    mutationFn: async ({ recordId, reason }: { recordId: string; reason?: string }) => {
      return apiClient.post('/dialer/session/skip', { recordId, reason });
    },
    onSuccess: () => {
      refetchSession();
    }
  });

  // Complete attempt
  const completeMutation = useMutation({
    mutationFn: async ({ attemptId, outcome, dispositionCode, notes }: { attemptId: string; outcome: number; dispositionCode?: string; notes?: string }) => {
      return apiClient.post(`/dialer/attempts/${attemptId}/complete`, {
        outcome,
        dispositionCode,
        dispositionNotes: notes,
        isConversion: dispositionCode === 'SALE'
      });
    },
    onSuccess: () => {
      setIsOnCall(false);
      setDisposition('');
      setNotes('');
      refetchSession();
    }
  });

  const handleLogin = () => {
    if (selectedCampaignId) {
      loginMutation.mutate(selectedCampaignId);
    }
  };

  const handleLogout = () => {
    if (selectedCampaignId) {
      logoutMutation.mutate(selectedCampaignId);
    }
  };

  const handleGetNext = () => {
    if (selectedCampaignId) {
      nextRecordMutation.mutate(selectedCampaignId);
    }
  };

  const handleDial = (phoneNumber?: string) => {
    if (session?.currentRecord) {
      dialMutation.mutate({
        recordId: session.currentRecord.id,
        phoneNumber
      });
    }
  };

  const handleSkip = () => {
    if (session?.currentRecord) {
      skipMutation.mutate({
        recordId: session.currentRecord.id,
        reason: 'Agent skipped'
      });
    }
  };

  const handleComplete = (outcome: number) => {
    if (session?.currentAttempt) {
      completeMutation.mutate({
        attemptId: session.currentAttempt.id,
        outcome,
        dispositionCode: disposition,
        notes
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('dialer.agentDialer', 'Agent Dialer')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('dialer.agentDialerDescription', 'Outbound calling workspace')}
          </p>
        </div>
      </div>

      {/* Campaign Selection */}
      {!session?.isAgentActive && (
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">{t('dialer.selectCampaign', 'Select Campaign')}</h2>
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <Select
                label={t('dialer.campaign', 'Campaign')}
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                options={[
                  { value: '', label: t('dialer.selectCampaignOption', 'Select a campaign...') },
                  ...(campaigns?.map(c => ({ value: c.id, label: `${c.name} (${dialingModes[c.dialingMode]})` })) || [])
                ]}
              />
            </div>
            <Button
              onClick={handleLogin}
              disabled={!selectedCampaignId || loginMutation.isPending}
            >
              <Phone className="h-5 w-5 mr-2" />
              {t('dialer.joinCampaign', 'Join Campaign')}
            </Button>
          </div>
        </Card>
      )}

      {/* Active Session */}
      {session?.isAgentActive && (
        <>
          {/* Session Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('dialer.campaign', 'Campaign')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{session.campaignName}</p>
                  <Badge variant="info" className="mt-1">{dialingModes[session.dialingMode]}</Badge>
                </div>
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  {t('dialer.logout', 'Logout')}
                </Button>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">{t('dialer.pending', 'Pending')}</p>
                  <p className="text-xl font-bold">{session.pendingRecords}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">{t('dialer.callsToday', 'Calls Today')}</p>
                  <p className="text-xl font-bold">{session.agentCallsToday}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">{t('dialer.connects', 'Connects')}</p>
                  <p className="text-xl font-bold">{session.agentConnectsToday}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Current Record */}
          <Card className="p-6">
            {session.currentRecord ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {session.currentRecord.fullName || t('dialer.unknownContact', 'Unknown Contact')}
                    </h3>
                    {session.currentRecord.company && (
                      <p className="text-gray-500">{session.currentRecord.company}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge variant={session.currentRecord.attemptCount > 0 ? 'warning' : 'success'}>
                      {t('dialer.attempt', 'Attempt')} #{session.currentRecord.attemptCount + 1}
                    </Badge>
                    {session.currentRecord.priority > 0 && (
                      <Badge variant="danger" className="ml-2">Priority: {session.currentRecord.priority}</Badge>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('dialer.primaryPhone', 'Primary Phone')}</p>
                    <p className="font-medium text-lg">{session.currentRecord.phoneNumber}</p>
                  </div>
                  {session.currentRecord.phoneNumber2 && (
                    <div>
                      <p className="text-sm text-gray-500">{t('dialer.alternatePhone', 'Alternate')}</p>
                      <p className="font-medium">{session.currentRecord.phoneNumber2}</p>
                    </div>
                  )}
                  {session.currentRecord.email && (
                    <div>
                      <p className="text-sm text-gray-500">{t('dialer.email', 'Email')}</p>
                      <p className="font-medium">{session.currentRecord.email}</p>
                    </div>
                  )}
                </div>

                {/* Previous Notes */}
                {session.currentRecord.notes && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {t('dialer.previousNotes', 'Previous Notes')}:
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300">{session.currentRecord.notes}</p>
                  </div>
                )}

                {/* Call Controls */}
                {!isOnCall ? (
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => handleDial()} className="flex-1">
                      <Phone className="h-5 w-5 mr-2" />
                      {t('dialer.dial', 'Dial')} {session.currentRecord.phoneNumber}
                    </Button>
                    {session.currentRecord.phoneNumber2 && (
                      <Button variant="secondary" onClick={() => handleDial(session.currentRecord!.phoneNumber2)}>
                        <Phone className="h-5 w-5 mr-2" />
                        {t('dialer.dialAlt', 'Dial Alt')}
                      </Button>
                    )}
                    <Button variant="ghost" onClick={handleSkip}>
                      <FastForward className="h-5 w-5 mr-2" />
                      {t('dialer.skip', 'Skip')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="animate-pulse flex items-center space-x-2">
                        <Phone className="h-6 w-6 text-green-600" />
                        <span className="text-green-700 dark:text-green-300 font-medium">
                          {t('dialer.callInProgress', 'Call in progress...')}
                        </span>
                      </div>
                    </div>

                    {/* Disposition Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label={t('dialer.disposition', 'Disposition')}
                        value={disposition}
                        onChange={(e) => setDisposition(e.target.value)}
                        options={[
                          { value: '', label: t('dialer.selectDisposition', 'Select disposition...') },
                          ...dispositionCodes.map(d => ({ value: d.value, label: d.label }))
                        ]}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('dialer.notes', 'Notes')}
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2"
                          rows={2}
                          placeholder={t('dialer.notesPlaceholder', 'Add call notes...')}
                        />
                      </div>
                    </div>

                    {/* End Call Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="primary"
                        onClick={() => handleComplete(7)} // Completed
                        disabled={!disposition}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        {t('dialer.completeCall', 'Complete Call')}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleComplete(3)} // NoAnswer
                      >
                        <XCircle className="h-5 w-5 mr-2" />
                        {t('dialer.noAnswer', 'No Answer')}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleComplete(4)} // Busy
                      >
                        <PhoneOff className="h-5 w-5 mr-2" />
                        {t('dialer.busy', 'Busy')}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleComplete(6)} // Voicemail
                      >
                        <Calendar className="h-5 w-5 mr-2" />
                        {t('dialer.voicemail', 'Voicemail')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Phone className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  {t('dialer.noCurrentRecord', 'No current record')}
                </h3>
                <p className="mt-2 text-gray-500">
                  {t('dialer.getNextRecord', 'Click the button below to get the next record')}
                </p>
                <Button
                  onClick={handleGetNext}
                  disabled={nextRecordMutation.isPending}
                  className="mt-4"
                >
                  <RefreshCw className={`h-5 w-5 mr-2 ${nextRecordMutation.isPending ? 'animate-spin' : ''}`} />
                  {t('dialer.getNext', 'Get Next Record')}
                </Button>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
