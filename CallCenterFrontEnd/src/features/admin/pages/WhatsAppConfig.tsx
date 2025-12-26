import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Plus,
  Search,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Webhook,
  Shield,
  Clock,
  Send,
  MoreVertical,
} from 'lucide-react';
import { Button, Badge, Card, CardContent, Modal, Input, Textarea } from '../../../components/ui';
import apiClient from '../../../api/client';

interface WhatsAppAccount {
  id: string;
  businessName: string;
  businessId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  qualityRating: 'GREEN' | 'YELLOW' | 'RED';
  messagingLimit: string;
  status: 'connected' | 'disconnected' | 'pending';
  verifiedName?: string;
  webhookUrl: string;
  webhookVerifyToken: string;
  accessToken: string;
  createdAt: string;
  lastSyncAt?: string;
}

interface MessageTemplate {
  id: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  components: {
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    text?: string;
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    buttons?: { type: string; text: string; url?: string; phoneNumber?: string }[];
  }[];
  createdAt: string;
  lastUsedAt?: string;
  usageCount: number;
}


interface AccountFormData {
  businessName: string;
  businessId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  accessToken: string;
  webhookVerifyToken: string;
}

interface TemplateFormData {
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  headerText?: string;
  bodyText: string;
  footerText?: string;
}

export const WhatsAppConfig = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'account' | 'templates' | 'webhook'>('account');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isTemplatePreviewOpen, setIsTemplatePreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [accountForm, setAccountForm] = useState<AccountFormData>({
    businessName: '',
    businessId: '',
    phoneNumberId: '',
    displayPhoneNumber: '',
    accessToken: '',
    webhookVerifyToken: '',
  });

  const [templateForm, setTemplateForm] = useState<TemplateFormData>({
    name: '',
    category: 'UTILITY',
    language: 'en',
    headerText: '',
    bodyText: '',
    footerText: '',
  });

  // Fetch WhatsApp account
  const { data: account, isLoading: accountLoading } = useQuery<WhatsAppAccount | null>({
    queryKey: ['whatsapp-account'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/whatsapp/account');
      return response.data;
    },
  });

  // Fetch message templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<MessageTemplate[]>({
    queryKey: ['whatsapp-templates'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/whatsapp/templates');
      return response.data.items || response.data || [];
    },
  });

  // Save account mutation
  const saveAccountMutation = useMutation({
    mutationFn: (data: AccountFormData) => apiClient.post('/admin/whatsapp/account', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-account'] });
      setIsAccountModalOpen(false);
    },
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (data: TemplateFormData) => apiClient.post('/admin/whatsapp/templates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
      setIsTemplateModalOpen(false);
      resetTemplateForm();
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/whatsapp/templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
    },
  });

  // Sync templates mutation
  const syncTemplatesMutation = useMutation({
    mutationFn: () => apiClient.post('/admin/whatsapp/templates/sync'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
    },
  });

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      category: 'UTILITY',
      language: 'en',
      headerText: '',
      bodyText: '',
      footerText: '',
    });
  };

  const handleOpenAccountEdit = () => {
    if (account) {
      setAccountForm({
        businessName: account.businessName,
        businessId: account.businessId,
        phoneNumberId: account.phoneNumberId,
        displayPhoneNumber: account.displayPhoneNumber,
        accessToken: account.accessToken,
        webhookVerifyToken: account.webhookVerifyToken,
      });
    }
    setIsAccountModalOpen(true);
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAccountMutation.mutate(accountForm);
  };

  const handleTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTemplateMutation.mutate(templateForm);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getQualityBadge = (rating: WhatsAppAccount['qualityRating']) => {
    const config = {
      GREEN: { variant: 'success' as const, text: 'High Quality' },
      YELLOW: { variant: 'warning' as const, text: 'Medium Quality' },
      RED: { variant: 'danger' as const, text: 'Low Quality' },
    };
    return <Badge variant={config[rating].variant}>{config[rating].text}</Badge>;
  };

  const getStatusBadge = (status: MessageTemplate['status']) => {
    const config = {
      APPROVED: { variant: 'success' as const, icon: CheckCircle, text: 'Approved' },
      PENDING: { variant: 'warning' as const, icon: Clock, text: 'Pending' },
      REJECTED: { variant: 'danger' as const, icon: XCircle, text: 'Rejected' },
    };
    const { variant, icon: Icon, text } = config[status];
    return (
      <Badge variant={variant} size="sm">
        <Icon className="w-3 h-3 mr-1" />
        {text}
      </Badge>
    );
  };

  const getCategoryBadge = (category: MessageTemplate['category']) => {
    const colors = {
      MARKETING: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      UTILITY: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      AUTHENTICATION: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[category]}`}>
        {category}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">WhatsApp Business</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure WhatsApp Business API integration
            </p>
          </div>
        </div>
        {account?.status === 'connected' && (
          <Badge variant="success" size="lg">
            <CheckCircle className="w-4 h-4 mr-1" />
            Connected
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'account'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Phone className="w-4 h-4 inline mr-2" />
            Account
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Message Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'webhook'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Webhook className="w-4 h-4 inline mr-2" />
            Webhook
          </button>
        </nav>
      </div>

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          {accountLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : !account ? (
            <Card variant="bordered">
              <CardContent className="py-12 text-center">
                <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No WhatsApp Account Connected
                </h3>
                <p className="text-gray-500 mb-4">
                  Connect your WhatsApp Business Account to start messaging customers
                </p>
                <Button onClick={() => setIsAccountModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Account Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="bordered">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {account.displayPhoneNumber}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card variant="bordered">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Send className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Messaging Limit</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {account.messagingLimit}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card variant="bordered">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Quality Rating</p>
                        {getQualityBadge(account.qualityRating)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Account Details */}
              <Card variant="bordered">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Account Details
                    </h3>
                    <Button variant="outline" size="sm" onClick={handleOpenAccountEdit}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-gray-500">Business Name</label>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {account.businessName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Verified Name</label>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        {account.verifiedName || '-'}
                        {account.verifiedName && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Business ID</label>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {account.businessId}
                        </code>
                        <button
                          onClick={() => copyToClipboard(account.businessId)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Phone Number ID</label>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {account.phoneNumberId}
                        </code>
                        <button
                          onClick={() => copyToClipboard(account.phoneNumberId)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm text-gray-500">Access Token</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded truncate">
                          {showAccessToken ? account.accessToken : '••••••••••••••••••••'}
                        </code>
                        <button
                          onClick={() => setShowAccessToken(!showAccessToken)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          {showAccessToken ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(account.accessToken)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Connected Since</label>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(account.createdAt)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Last Sync</label>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {account.lastSyncAt ? formatDate(account.lastSyncAt) : 'Never'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {/* Templates Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              >
                <option value="all">All Status</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => syncTemplatesMutation.mutate()}
                isLoading={syncTemplatesMutation.isPending}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Templates
              </Button>
              <Button onClick={() => setIsTemplateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>

          {/* Templates List */}
          {templatesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <Card variant="bordered">
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No message templates found</p>
                <Button className="mt-4" onClick={() => setIsTemplateModalOpen(true)}>
                  Create First Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card variant="bordered" className="h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {template.name}
                            </h3>
                            {getStatusBadge(template.status)}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {getCategoryBadge(template.category)}
                            <span className="text-xs text-gray-500">{template.language.toUpperCase()}</span>
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === template.id ? null : template.id)}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          <AnimatePresence>
                            {activeMenu === template.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
                              >
                                <button
                                  onClick={() => {
                                    setSelectedTemplate(template);
                                    setIsTemplatePreviewOpen(true);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Eye className="w-3 h-3" />
                                  Preview
                                </button>
                                <button
                                  onClick={() => {
                                    deleteTemplateMutation.mutate(template.id);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Template Preview */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                        {template.components.map((comp, idx) => (
                          <div key={idx} className="text-sm">
                            {comp.type === 'HEADER' && comp.text && (
                              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                                {comp.text}
                              </p>
                            )}
                            {comp.type === 'BODY' && (
                              <p className="text-gray-600 dark:text-gray-400">{comp.text}</p>
                            )}
                            {comp.type === 'FOOTER' && (
                              <p className="text-xs text-gray-400 mt-2">{comp.text}</p>
                            )}
                            {comp.type === 'BUTTONS' && comp.buttons && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {comp.buttons.map((btn, btnIdx) => (
                                  <span
                                    key={btnIdx}
                                    className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded"
                                  >
                                    {btn.text}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Template Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Used {template.usageCount.toLocaleString()} times</span>
                        {template.lastUsedAt && (
                          <span>Last used: {formatDate(template.lastUsedAt)}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Webhook Tab */}
      {activeTab === 'webhook' && account && (
        <div className="space-y-6">
          <Card variant="bordered">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Webhook Configuration
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Configure these settings in your Meta App Dashboard to receive incoming messages and status updates.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Callback URL
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                      {account.webhookUrl}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(account.webhookUrl)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Verify Token
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                      {account.webhookVerifyToken}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(account.webhookVerifyToken)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Required Webhook Fields
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      messages
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      message_deliveries
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      message_reads
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      messaging_postbacks
                    </li>
                  </ul>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Make sure to configure these settings in the{' '}
                    <a
                      href="https://developers.facebook.com/apps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline inline-flex items-center gap-1"
                    >
                      Meta App Dashboard
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Account Modal */}
      <Modal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        title={account ? 'Edit WhatsApp Account' : 'Connect WhatsApp Account'}
        size="lg"
      >
        <form onSubmit={handleAccountSubmit} className="space-y-4">
          <Input
            label="Business Name"
            value={accountForm.businessName}
            onChange={(e) => setAccountForm({ ...accountForm, businessName: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Business ID"
              value={accountForm.businessId}
              onChange={(e) => setAccountForm({ ...accountForm, businessId: e.target.value })}
              placeholder="123456789012345"
              required
            />
            <Input
              label="Phone Number ID"
              value={accountForm.phoneNumberId}
              onChange={(e) => setAccountForm({ ...accountForm, phoneNumberId: e.target.value })}
              placeholder="987654321098765"
              required
            />
          </div>
          <Input
            label="Display Phone Number"
            value={accountForm.displayPhoneNumber}
            onChange={(e) => setAccountForm({ ...accountForm, displayPhoneNumber: e.target.value })}
            placeholder="+1 (555) 123-4567"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Access Token
            </label>
            <Textarea
              value={accountForm.accessToken}
              onChange={(e) => setAccountForm({ ...accountForm, accessToken: e.target.value })}
              placeholder="EAAGm0PX4ZCpsBA..."
              rows={3}
              required
            />
          </div>
          <Input
            label="Webhook Verify Token"
            value={accountForm.webhookVerifyToken}
            onChange={(e) => setAccountForm({ ...accountForm, webhookVerifyToken: e.target.value })}
            placeholder="your_verify_token"
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setIsAccountModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saveAccountMutation.isPending}>
              {account ? 'Update Account' : 'Connect Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Template Modal */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => {
          setIsTemplateModalOpen(false);
          resetTemplateForm();
        }}
        title="Create Message Template"
        size="lg"
      >
        <form onSubmit={handleTemplateSubmit} className="space-y-4">
          <Input
            label="Template Name"
            value={templateForm.name}
            onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value.toLowerCase().replace(/\s/g, '_') })}
            placeholder="order_confirmation"
            helperText="Lowercase letters, numbers, and underscores only"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={templateForm.category}
                onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value as TemplateFormData['category'] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="UTILITY">Utility</option>
                <option value="MARKETING">Marketing</option>
                <option value="AUTHENTICATION">Authentication</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Language
              </label>
              <select
                value={templateForm.language}
                onChange={(e) => setTemplateForm({ ...templateForm, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
          <Input
            label="Header Text (optional)"
            value={templateForm.headerText}
            onChange={(e) => setTemplateForm({ ...templateForm, headerText: e.target.value })}
            placeholder="Order Confirmed!"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Body Text
            </label>
            <Textarea
              value={templateForm.bodyText}
              onChange={(e) => setTemplateForm({ ...templateForm, bodyText: e.target.value })}
              placeholder="Hi {{1}}, your order #{{2}} has been confirmed."
              rows={4}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {'{{1}}'}, {'{{2}}'}, etc. for dynamic variables
            </p>
          </div>
          <Input
            label="Footer Text (optional)"
            value={templateForm.footerText}
            onChange={(e) => setTemplateForm({ ...templateForm, footerText: e.target.value })}
            placeholder="Thank you for your business!"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsTemplateModalOpen(false);
                resetTemplateForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createTemplateMutation.isPending}>
              Submit for Approval
            </Button>
          </div>
        </form>
      </Modal>

      {/* Template Preview Modal */}
      <Modal
        isOpen={isTemplatePreviewOpen}
        onClose={() => {
          setIsTemplatePreviewOpen(false);
          setSelectedTemplate(null);
        }}
        title="Template Preview"
        size="md"
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">{selectedTemplate.name}</h3>
              {getStatusBadge(selectedTemplate.status)}
            </div>
            <div className="flex items-center gap-2">
              {getCategoryBadge(selectedTemplate.category)}
              <span className="text-sm text-gray-500">{selectedTemplate.language.toUpperCase()}</span>
            </div>

            {/* Phone mockup */}
            <div className="mx-auto max-w-xs">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-3xl p-4">
                <div className="bg-white dark:bg-gray-700 rounded-2xl p-4 shadow">
                  {selectedTemplate.components.map((comp, idx) => (
                    <div key={idx}>
                      {comp.type === 'HEADER' && comp.text && (
                        <p className="font-semibold text-gray-900 dark:text-white mb-2">
                          {comp.text}
                        </p>
                      )}
                      {comp.type === 'BODY' && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{comp.text}</p>
                      )}
                      {comp.type === 'FOOTER' && (
                        <p className="text-xs text-gray-400 mt-3">{comp.text}</p>
                      )}
                      {comp.type === 'BUTTONS' && comp.buttons && (
                        <div className="space-y-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          {comp.buttons.map((btn, btnIdx) => (
                            <button
                              key={btnIdx}
                              className="w-full py-2 text-sm text-blue-500 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            >
                              {btn.text}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>Created: {formatDate(selectedTemplate.createdAt)}</p>
              <p>Usage: {selectedTemplate.usageCount.toLocaleString()} messages sent</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WhatsAppConfig;
