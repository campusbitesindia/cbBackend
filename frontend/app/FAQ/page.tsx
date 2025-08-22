'use client';

import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon, QuestionMarkCircleIcon, ChatBubbleLeftRightIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'general' | 'ordering' | 'payment' | 'support';
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "What is Campus Bites?",
    answer: "Campus Bites is a food ordering platform developed by SMARTDESH TECHNOLOGIES LLP, designed to make it easy for students to order meals from campus canteens/food outlets through our website and mobile app.",
    category: 'general'
  },
  {
    id: 2,
    question: "Where is Campus Bites available?",
    answer: "Currently, Campus Bites is available on selected campuses. We are expanding to more institutions soon.",
    category: 'general'
  },
  {
    id: 3,
    question: "Do I need an account to place an order?",
    answer: "Yes, you need to register with your name, mobile number, and email to use the app.",
    category: 'general'
  },
  {
    id: 4,
    question: "Can I use my college email ID to sign up?",
    answer: "Yes, you can use your college email ID, but a personal email ID works as well.",
    category: 'general'
  },
  {
    id: 5,
    question: "How do I place an order?",
    answer: "Simply log in, choose your canteen, select items, add them to your cart, and proceed to payment.",
    category: 'ordering'
  },
  {
    id: 6,
    question: "Can I track my order?",
    answer: "Yes, you can track your order status live through the app.",
    category: 'ordering'
  },
  {
    id: 7,
    question: "Who prepares the food?",
    answer: "All food is prepared by the respective campus canteens and food vendors listed on the platform. We are not involved in food preparation.",
    category: 'ordering'
  },
  {
    id: 8,
    question: "What payment methods are accepted?",
    answer: "We support UPI, debit/credit cards, net banking, and approved payment wallets, in line with RBI guidelines.",
    category: 'payment'
  },
  {
    id: 9,
    question: "Is Cash on Delivery (COD) available?",
    answer: "COD availability may depend on the canteen. If available, you'll see the option during checkout.",
    category: 'payment'
  },
  {
    id: 10,
    question: "How do refunds work?",
    answer: "If your order is cancelled or undelivered, refunds are processed within 5–7 business days back to your original payment method.",
    category: 'payment'
  },
  {
    id: 11,
    question: "What if I face an issue with my order?",
    answer: "You can reach our support team through the app's Help section or contact us via email/phone provided in the app.",
    category: 'support'
  },
  {
    id: 12,
    question: "Can I suggest a new canteen or vendor for Campus Bites?",
    answer: "Absolutely! We welcome feedback and suggestions. Please reach out via our support channels.",
    category: 'support'
  }
];

const categories = {
  general: { 
    name: 'General', 
    color: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200',
    icon: QuestionMarkCircleIcon,
    bgGradient: 'from-blue-500 to-blue-600'
  },
  ordering: { 
    name: 'Ordering', 
    color: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-200',
    icon: ChatBubbleLeftRightIcon,
    bgGradient: 'from-emerald-500 to-emerald-600'
  },
  payment: { 
    name: 'Payment', 
    color: 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border-purple-200',
    icon: PlusCircleIcon,
    bgGradient: 'from-purple-500 to-purple-600'
  },
  support: { 
    name: 'Support', 
    color: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border-amber-200',
    icon: ChatBubbleLeftRightIcon,
    bgGradient: 'from-amber-500 to-amber-600'
  }
};

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = faqData.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">


      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-900"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 sm:px-4 mb-4 sm:mb-6">
              <QuestionMarkCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <span className="text-white text-xs sm:text-sm font-medium">Help Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 tracking-tight">
              Frequently Asked
              <span className="block bg-gradient-to-r from-yellow-300 to-red-300 bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed px-4">
              Everything you need to know about Campus Bites. Find quick answers to common questions and get the help you need.
            </p>
          </div>
        </div>
       
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        {/* Search and Filter Section */}
        <div className="mb-12 sm:mb-16">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6 sm:mb-10">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search your question..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg border-0 rounded-xl sm:rounded-2xl bg-card shadow-lg ring-1 ring-border placeholder-muted-foreground focus:ring-2 focus:ring-red-500 focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`group relative px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                selectedCategory === 'all' 
                  ? 'bg-gradient-to-r from-red-500 to-red-500 text-white shadow-lg shadow-red-500/25' 
                  : 'bg-card text-foreground hover:bg-muted shadow-md border border-border'
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <QuestionMarkCircleIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>All Questions</span>
              </div>
            </button>
            {Object.entries(categories).map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`group relative px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    selectedCategory === key 
                      ? `bg-gradient-to-r ${category.bgGradient} text-white shadow-lg` 
                      : 'bg-card text-foreground hover:bg-muted shadow-md border border-border'
                  }`}
                >
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{category.name}</span>
                    <span className="sm:hidden">{category.name.substring(0, 3)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="grid gap-4 sm:gap-6 max-w-4xl mx-auto">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item, index) => {
              const category = categories[item.category];
              const IconComponent = category.icon;
              return (
                <div
                  key={item.id}
                  className="group bg-card dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-4 py-4 sm:px-8 sm:py-6 text-left flex items-center justify-between hover:bg-muted/50 transition-all duration-200"
                  >
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                      <div className={`flex-shrink-0 p-2 rounded-lg sm:rounded-xl border ${category.color}`}>
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                          <span className={`px-2 py-1 sm:px-3 rounded-full text-xs font-medium border ${category.color}`}>
                            {category.name}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-lg font-semibold text-foreground leading-relaxed group-hover:text-red-600 transition-colors pr-2">
                          {item.question}
                        </h3>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2 sm:ml-4">
                      <div className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                        openItems.includes(item.id) 
                          ? 'bg-red-100 text-red-600 rotate-180 dark:bg-red-900/30' 
                          : 'text-muted-foreground group-hover:bg-muted'
                      }`}>
                        <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200" />
                      </div>
                    </div>
                  </button>
                  
                  <div className={`transition-all duration-300 ease-in-out ${
                    openItems.includes(item.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}>
                    <div className="px-4 pb-4 sm:px-8 sm:pb-6">
                      <div className="border-t border-border pt-4 sm:pt-6 pl-8 sm:pl-12">
                        <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 sm:py-20">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <MagnifyingGlassIcon className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground max-w-md mx-auto px-4">
                We couldn't find any FAQs matching your search. Try different keywords or browse all categories.
              </p>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-16 sm:mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-500 rounded-2xl sm:rounded-3xl transform rotate-1"></div>
          <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                Still have questions?
              </h2>
              <p className="text-gray-300 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed px-4">
                Our dedicated support team is here to help you 24/7. Get personalized assistance for any questions not covered in our FAQ.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a href="mailto:support@campusbites.in">
                <button className="group bg-white text-gray-900 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm sm:text-base">Contact Support</span>
                </button>
                </a>
                  
                
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}