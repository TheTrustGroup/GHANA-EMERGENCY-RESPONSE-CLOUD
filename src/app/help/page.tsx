'use client';

/**
 * Help & Documentation Page
 * Centralized help system with FAQs and guides
 */

import { useState } from 'react';
import { Search, HelpCircle, Book, Video, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  roles?: UserRole[];
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'How do I report an emergency?',
    answer:
      'Click the "Report Emergency" button on your dashboard, select the emergency type, confirm your location, add photos if available, and submit. Your report will be sent to dispatchers immediately.',
    category: 'Citizen',
    roles: [UserRole.CITIZEN],
  },
  {
    id: '2',
    question: 'How long does it take for help to arrive?',
    answer:
      'Response times vary by location and emergency type. On average, emergency services aim to arrive within 8-15 minutes in urban areas. Critical emergencies are prioritized.',
    category: 'Citizen',
    roles: [UserRole.CITIZEN],
  },
  {
    id: '3',
    question: 'Can I track my emergency report?',
    answer:
      'Yes! Go to "My Reports" on your dashboard to see the status of all your reports. You\'ll receive real-time updates when responders are dispatched, en route, and when they arrive.',
    category: 'Citizen',
    roles: [UserRole.CITIZEN],
  },
  {
    id: '4',
    question: 'How do I assign an incident to an agency?',
    answer:
      'On the dispatch dashboard, click on an incident marker on the map, review the details, then click "Assign Agency". Select the appropriate agency and responder, then confirm the assignment.',
    category: 'Dispatcher',
    roles: [UserRole.DISPATCHER],
  },
  {
    id: '5',
    question: 'How do I accept a dispatch assignment?',
    answer:
      'When you receive a dispatch notification, go to your responder dashboard and click "Accept Assignment". You can then update your status as you proceed: En Route, Arrived, and Completed.',
    category: 'Responder',
    roles: [UserRole.RESPONDER],
  },
  {
    id: '6',
    question: 'How do I update my location?',
    answer:
      'Your location is automatically tracked when you accept an assignment. Make sure location permissions are enabled in your browser. You can also manually update your location from the responder dashboard.',
    category: 'Responder',
    roles: [UserRole.RESPONDER],
  },
  {
    id: '7',
    question: 'What should I do if I can\'t access my dashboard?',
    answer:
      'First, try clearing your browser cache and cookies. If the problem persists, contact your system administrator. Make sure you\'re using a supported browser (Chrome, Firefox, Safari, or Edge).',
    category: 'General',
  },
  {
    id: '8',
    question: 'How do I change my password?',
    answer:
      'Go to Settings from your dashboard menu, then click on "Security" or "Account Settings". You can change your password there. Make sure to use a strong password with at least 8 characters.',
    category: 'General',
  },
];

const categories = ['All', 'Citizen', 'Dispatcher', 'Responder', 'General'];

export default function HelpPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const userRole = session?.user?.role;

  // Filter FAQs based on role and search
  const filteredFAQs = faqs.filter((faq) => {
    // Category filter
    if (selectedCategory !== 'All' && faq.category !== selectedCategory) {
      return false;
    }

    // Role filter - show if no roles specified or user role matches
    if (faq.roles && userRole && !faq.roles.includes(userRole)) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <HelpCircle className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">
          Find answers to common questions and learn how to use the platform
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="rounded-full"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* FAQs */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <HelpCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No help articles found. Try a different search.</p>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {filteredFAQs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {faq.category}
                    </Badge>
                    <span className="font-medium">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Book className="h-5 w-5" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Read detailed guides and documentation
            </p>
            <Button variant="outline" size="sm" className="w-full">
              View Docs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="h-5 w-5" />
              Video Tutorials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Watch step-by-step video tutorials
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Watch Videos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Get help from our support team
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Contact Us
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
