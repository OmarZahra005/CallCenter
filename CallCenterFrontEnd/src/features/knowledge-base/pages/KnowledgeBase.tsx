import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Book, FileText, Video, HelpCircle, ChevronRight, Star, Clock, Eye, Plus } from 'lucide-react';
import { Badge, Button, Modal, Input } from '../../../components/ui';
import { staggerContainer, staggerItem, fadeUp } from '../../../utils/animations';
import apiClient from '../../../api/client';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  subcategory?: string;
  tags?: string;
  language: string;
  viewCount: number;
  helpfulYes: number;
  helpfulNo: number;
  isPublished: boolean;
  publishedAtUtc?: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
}

interface Category {
  id: string;
  name: string;
  icon: typeof Book;
  count: number;
  color: string;
}

const KnowledgeBase = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    category: 'How-to Guides',
    subcategory: '',
    tags: '',
    language: 'en',
  });

  // Fetch articles from backend
  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles', selectedCategory],
    queryFn: async () => {
      const params: Record<string, string> = { pageNumber: '1', pageSize: '50' };
      if (selectedCategory) {
        const categoryMap: Record<string, string> = {
          '1': 'Getting Started',
          '2': 'Troubleshooting',
          '3': 'How-to Guides',
          '4': 'Video Tutorials',
        };
        params.category = categoryMap[selectedCategory] || '';
      }
      const response = await apiClient.get('/articles/published', { params });
      return response.data;
    }
  });

  // Search articles
  const { data: searchResults } = useQuery({
    queryKey: ['articles-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return null;
      const response = await apiClient.get('/articles/search', {
        params: { query: searchQuery }
      });
      return response.data;
    },
    enabled: searchQuery.length >= 2,
  });

  // Create article mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newArticle) => {
      return apiClient.post('/articles', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setIsCreateModalOpen(false);
      setNewArticle({
        title: '',
        content: '',
        category: 'How-to Guides',
        subcategory: '',
        tags: '',
        language: 'en',
      });
    }
  });

  // Increment view count
  const viewMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.post(`/articles/${id}/view`);
    }
  });

  // Mark as helpful
  const helpfulMutation = useMutation({
    mutationFn: async ({ id, helpful }: { id: string; helpful: boolean }) => {
      return apiClient.post(`/articles/${id}/feedback`, null, {
        params: { helpful }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    }
  });

  const articles: Article[] = searchQuery.length >= 2 && searchResults
    ? searchResults
    : (articlesData?.items || articlesData || []);

  // Calculate category counts from articles
  const getCategoryCount = (categoryName: string) => {
    if (!articlesData?.items && !Array.isArray(articlesData)) return 0;
    const allArticles = articlesData?.items || articlesData || [];
    return allArticles.filter((a: Article) => a.category === categoryName).length;
  };

  const categories: Category[] = [
    { id: '1', name: 'Getting Started', icon: Book, count: getCategoryCount('Getting Started'), color: 'from-blue-500 to-blue-600' },
    { id: '2', name: 'Troubleshooting', icon: HelpCircle, count: getCategoryCount('Troubleshooting'), color: 'from-red-500 to-red-600' },
    { id: '3', name: 'How-to Guides', icon: FileText, count: getCategoryCount('How-to Guides'), color: 'from-green-500 to-green-600' },
    { id: '4', name: 'Video Tutorials', icon: Video, count: getCategoryCount('Video Tutorials'), color: 'from-purple-500 to-purple-600' },
  ];

  // Get popular articles (sorted by view count)
  const popularArticles = [...articles]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  // Get recent articles (sorted by update date)
  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.updatedAtUtc || b.createdAtUtc).getTime() - new Date(a.updatedAtUtc || a.createdAtUtc).getTime())
    .slice(0, 3);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setIsViewModalOpen(true);
    viewMutation.mutate(article.id);
  };

  const calculateRating = (article: Article) => {
    const total = article.helpfulYes + article.helpfulNo;
    if (total === 0) return 0;
    return ((article.helpfulYes / total) * 5).toFixed(1);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header with gradient */}
      <motion.div variants={fadeUp} className="gradient-header rounded-xl p-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Knowledge Base</h1>
        <p className="text-white/80 mb-6">Find answers to common questions and learn how to use our platform</p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, guides, tutorials..."
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>

        {/* Admin Button */}
        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Article
          </Button>
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div variants={staggerItem}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                className={`gradient-border p-4 text-start hover:shadow-lg transition-shadow ${
                  selectedCategory === category.id ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{category.count} articles</p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Popular Articles */}
          <motion.div variants={staggerItem} className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {searchQuery ? `Search Results (${articles.length})` : 'Popular Articles'}
            </h2>
            <div className="space-y-3">
              {(searchQuery ? articles : popularArticles).length > 0 ? (
                (searchQuery ? articles : popularArticles).map((article) => (
                  <motion.div
                    key={article.id}
                    whileHover={{ x: 4 }}
                    className="glass-card p-4 cursor-pointer"
                    onClick={() => handleArticleClick(article)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {article.content.substring(0, 150)}...
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="default" size="sm">{article.category}</Badge>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Eye className="w-3 h-3" />
                            {article.viewCount}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-yellow-500">
                            <Star className="w-3 h-3 fill-current" />
                            {calculateRating(article)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No articles found matching your search.' : 'No articles available.'}
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Articles */}
          <motion.div variants={staggerItem}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recently Updated</h2>
            <div className="space-y-3">
              {recentArticles.map((article) => (
                <motion.div
                  key={article.id}
                  whileHover={{ x: 4 }}
                  className="glass-card p-4 cursor-pointer"
                  onClick={() => handleArticleClick(article)}
                >
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatDate(article.updatedAtUtc || article.createdAtUtc)}
                    </span>
                  </div>
                </motion.div>
              ))}
              {recentArticles.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No recent articles.
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h2>
              <div className="glass-card p-4 space-y-2">
                <a href="#" className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  <FileText className="w-4 h-4" />
                  Release Notes
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  <Video className="w-4 h-4" />
                  Video Library
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  <HelpCircle className="w-4 h-4" />
                  Contact Support
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Article Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Article"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={newArticle.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewArticle({ ...newArticle, title: e.target.value })}
            placeholder="Enter article title"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content
            </label>
            <textarea
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 min-h-[200px]"
              value={newArticle.content}
              onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
              placeholder="Write your article content..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={newArticle.category}
                onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
              >
                <option value="Getting Started">Getting Started</option>
                <option value="Troubleshooting">Troubleshooting</option>
                <option value="How-to Guides">How-to Guides</option>
                <option value="Video Tutorials">Video Tutorials</option>
              </select>
            </div>
            <Input
              label="Tags"
              value={newArticle.tags}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewArticle({ ...newArticle, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(newArticle)}
              disabled={!newArticle.title || !newArticle.content || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Article'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Article Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={selectedArticle?.title || 'Article'}
      >
        {selectedArticle && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="default">{selectedArticle.category}</Badge>
              {selectedArticle.tags && selectedArticle.tags.split(',').map((tag, i) => (
                <Badge key={i} variant="info" size="sm">{tag.trim()}</Badge>
              ))}
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{selectedArticle.content}</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {selectedArticle.viewCount} views
                </span>
                <span>
                  Updated: {formatDate(selectedArticle.updatedAtUtc || selectedArticle.createdAtUtc)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Was this helpful?</span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => helpfulMutation.mutate({ id: selectedArticle.id, helpful: true })}
                >
                  Yes ({selectedArticle.helpfulYes})
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => helpfulMutation.mutate({ id: selectedArticle.id, helpful: false })}
                >
                  No ({selectedArticle.helpfulNo})
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default KnowledgeBase;
