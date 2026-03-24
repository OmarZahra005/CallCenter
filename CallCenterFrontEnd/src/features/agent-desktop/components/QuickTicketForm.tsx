import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Button } from '../../../components/ui';
import { SLATimer } from '../../../components/ui';

interface QuickTicketFormProps {
  onCreateTicket: (data: {
    subject: string;
    description: string;
    priority: string;
    category: string;
  }) => Promise<void>;
  isCreating: boolean;
  callNotes: string;
  onCallNotesChange: (notes: string) => void;
}

export const QuickTicketForm = ({
  onCreateTicket,
  isCreating,
  callNotes,
  onCallNotesChange,
}: QuickTicketFormProps) => {
  const { t } = useTranslation();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('General');

  const handleSubmit = async () => {
    if (!subject.trim()) return;
    try {
      await onCreateTicket({ subject, description, priority, category });
      setSubject('');
      setDescription('');
      setPriority('Medium');
      setCategory('General');
    } catch {
      // Error handled by parent
    }
  };

  return (
    <Card variant="bordered" className="overflow-hidden flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
          {t('agentDesktop.quickTicket')}
        </h3>
        <SLATimer deadline={new Date(Date.now() + 10 * 60 * 1000)} />
      </div>
      <CardContent className="p-3">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('agentDesktop.subject')}
            </label>
            <input
              type="text"
              placeholder={t('agentDesktop.enterTicketSubject')}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('agentDesktop.description')}
            </label>
            <textarea
              rows={3}
              placeholder={t('agentDesktop.describeIssue')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('agentDesktop.priority')}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Low">{t('priority.low')}</option>
                <option value="Medium">{t('priority.medium')}</option>
                <option value="High">{t('priority.high')}</option>
                <option value="Critical">{t('priority.critical')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('agentDesktop.category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            size="sm"
            onClick={handleSubmit}
            disabled={isCreating || !subject.trim()}
          >
            {isCreating ? t('agentDesktop.creating') : t('agentDesktop.createTicket')}
          </Button>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('agentDesktop.callNotes')}
          </label>
          <textarea
            rows={3}
            placeholder={t('agentDesktop.addCallNotes')}
            value={callNotes}
            onChange={(e) => onCallNotesChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
};
