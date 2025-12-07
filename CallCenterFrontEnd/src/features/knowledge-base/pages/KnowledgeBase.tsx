import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Book, FileText, Video, HelpCircle, ChevronRight, Star, Clock, Eye } from 'lucide-react';
import { Badge } from '../../../components/ui';
import { staggerContainer, staggerItem, fadeUp } from '../../../utils/animations';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  views: number;
  rating: number;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  icon: typeof Book;
  count: number;
  color: string;
}

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories: Category[] = [
    { id: '1', name: 'Getting Started', icon: Book, count: 12, color: 'from-blue-500 to-blue-600' },
    { id: '2', name: 'Troubleshooting', icon: HelpCircle, count: 24, color: 'from-red-500 to-red-600' },
    { id: '3', name: 'How-to Guides', icon: FileText, count: 18, color: 'from-green-500 to-green-600' },
    { id: '4', name: 'Video Tutorials', icon: Video, count: 8, color: 'from-purple-500 to-purple-600' },
  ];

  const popularArticles: Article[] = [
    { id: '1', title: 'How to handle escalated calls', excerpt: 'Learn the best practices for managing difficult customer interactions...', category: 'How-to Guides', views: 1234, rating: 4.8, updatedAt: '2024-01-15' },
    { id: '2', title: 'Setting up your softphone', excerpt: 'Complete guide to configuring your softphone settings...', category: 'Getting Started', views: 987, rating: 4.6, updatedAt: '2024-01-12' },
    { id: '3', title: 'Troubleshooting audio issues', excerpt: 'Common audio problems and their solutions...', category: 'Troubleshooting', views: 876, rating: 4.5, updatedAt: '2024-01-10' },
    { id: '4', title: 'Using the ticket system', excerpt: 'Step-by-step guide to creating and managing tickets...', category: 'How-to Guides', views: 765, rating: 4.7, updatedAt: '2024-01-08' },
  ];

  const recentArticles: Article[] = [
    { id: '5', title: 'New features in version 2.0', excerpt: 'Overview of the latest features and improvements...', category: 'Getting Started', views: 432, rating: 4.9, updatedAt: '2024-01-18' },
    { id: '6', title: 'Best practices for call wrap-up', excerpt: 'Optimize your after-call work with these tips...', category: 'How-to Guides', views: 321, rating: 4.4, updatedAt: '2024-01-17' },
  ];

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

        {/* AI Search Bar */}
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
                onClick={() => setSelectedCategory(category.id)}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Articles */}
        <motion.div variants={staggerItem} className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Popular Articles</h2>
          <div className="space-y-3">
            {popularArticles.map((article) => (
              <motion.div
                key={article.id}
                whileHover={{ x: 4 }}
                className="glass-card p-4 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="default" size="sm">{article.category}</Badge>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Eye className="w-3 h-3" />
                        {article.views}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-yellow-500">
                        <Star className="w-3 h-3 fill-current" />
                        {article.rating}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </motion.div>
            ))}
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
              >
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{article.updatedAt}</span>
                </div>
              </motion.div>
            ))}
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
    </motion.div>
  );
};

export default KnowledgeBase;
