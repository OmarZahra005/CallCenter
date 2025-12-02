import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import { Button, Badge, Card, CardContent, CardHeader } from '../../../components/ui';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

const KnowledgeBase = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['knowledge-articles'],
    queryFn: async () => {
      const response = await apiClient.get('/knowledge-base');
      return response.data;
    },
  });

  const articles = Array.isArray(articlesData) ? articlesData : (articlesData?.data || articlesData?.items || []);

  const categories = ['all', 'General', 'Technical', 'Billing', 'Account', 'Troubleshooting'];

  const filteredArticles = articles.filter((article: Article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.knowledgeBase')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Search and manage knowledge base articles
          </p>
        </div>
        <Button>
          <svg className="w-4 h-4 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Article
        </Button>
      </div>

      {/* Search and filters */}
      <Card variant="bordered">
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full ps-10 pe-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredArticles.length === 0 ? (
        <Card variant="bordered">
          <CardContent className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No articles found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article: Article) => (
            <Card key={article.id} variant="bordered" className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="info" size="sm">{article.category}</Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {article.viewCount} views
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                  {article.content}
                </p>
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
