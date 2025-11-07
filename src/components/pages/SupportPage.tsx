import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HelpCircle, MessageSquare, Book, Mail, Phone, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useLiveChat } from '../../context/LiveChatContext'

export function SupportPage() {
  const navigate = useNavigate()
  const { openChat } = useLiveChat()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const faqCategories = [
    {
      title: 'Orders & Shipping',
      faqs: [
        {
          id: 1,
          question: 'How can I track my order?',
          answer: 'Once your order ships, you\'ll receive a tracking number via email. You can use this number to track your package in real-time through our tracking system on the website.'
        },
        {
          id: 2,
          question: 'What shipping methods are available?',
          answer: 'We offer Standard Shipping (3-7 business days, free on orders over AED 50), Express Shipping (1-3 business days, AED 9.99), and Overnight Shipping (next business day, AED 19.99).'
        },
        {
          id: 3,
          question: 'How long does it take to process my order?',
          answer: 'All orders are processed within 1-2 business days. Orders placed before 2 PM GST are processed the same day, while orders placed after 2 PM are processed the next business day.'
        }
      ]
    },
    {
      title: 'Returns & Refunds',
      faqs: [
        {
          id: 4,
          question: 'What is your return policy?',
          answer: 'You have 30 days from the date of delivery to return any item for a full refund or exchange. Items must be in original, unworn condition with tags attached and in original packaging.'
        },
        {
          id: 5,
          question: 'How do I initiate a return?',
          answer: 'Log into your account and navigate to "My Orders". Select the item you wish to return and click "Return Item". You\'ll receive a prepaid return shipping label via email.'
        },
        {
          id: 6,
          question: 'How long does it take to receive a refund?',
          answer: 'Refunds are processed to your original payment method within 5-7 business days after we receive your return. The time it takes for the refund to appear in your account depends on your bank or credit card company.'
        }
      ]
    },
    {
      title: 'Account & Payment',
      faqs: [
        {
          id: 7,
          question: 'How do I create an account?',
          answer: 'Click on "Sign Up" in the top right corner of the website. Fill in your details including name, email, and password. You\'ll receive a confirmation email to verify your account.'
        },
        {
          id: 8,
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. All payments are processed securely through our payment gateway.'
        },
        {
          id: 9,
          question: 'Is my payment information secure?',
          answer: 'Yes, we use industry-standard SSL encryption to protect your payment information. We never store your full credit card details on our servers.'
        }
      ]
    },
    {
      title: 'Products & Sizing',
      faqs: [
        {
          id: 10,
          question: 'How do I know what size to order?',
          answer: 'Each product page includes a size guide with detailed measurements. We recommend measuring yourself and comparing with our size chart to ensure the best fit.'
        },
        {
          id: 11,
          question: 'Do you offer international shipping?',
          answer: 'We currently offer international shipping to select countries. Shipping costs and delivery times vary by destination. Check our Shipping Info page for more details.'
        },
        {
          id: 12,
          question: 'What if an item is out of stock?',
          answer: 'If an item is out of stock, you can sign up for email notifications to be alerted when it becomes available again. We restock popular items regularly.'
        }
      ]
    }
  ]

  const allFaqs = faqCategories.flatMap(category => category.faqs)

  const filteredFaqs = searchQuery
    ? allFaqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allFaqs

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Support Center
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions or get in touch with our support team
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-6 text-lg"
          />
        </div>
      </div>

      {/* Quick Help Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-4">
              Chat with our support team in real-time
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                openChat()
              }}
            >
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">Email Support</h3>
            <p className="text-sm text-gray-600 mb-4">
              Send us an email and we'll respond within 24 hours
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/contact')}>
              Send Email
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">Phone Support</h3>
            <p className="text-sm text-gray-600 mb-4">
              Call us Mon-Fri, 9AM-6PM GST
            </p>
            <Button variant="outline" className="w-full">
              +971 58 841 5993
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Sections */}
      {searchQuery ? (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredFaqs.length > 0 ? (
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <div key={faq.id} className="border rounded-lg overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    >
                      <div className="flex items-center">
                        <HelpCircle className="h-4 w-4 mr-3 text-gray-500" />
                        <span className="font-medium">{faq.question}</span>
                      </div>
                      <span className="text-gray-500 text-lg">
                        {expandedFaq === faq.id ? '−' : '+'}
                      </span>
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="px-4 pb-4 text-sm text-gray-600 bg-gray-50 border-t">
                        <p className="pt-2">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">
                No results found. Try different keywords or contact our support team.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.faqs.map((faq) => (
                    <div key={faq.id} className="border rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      >
                        <div className="flex items-center">
                          <HelpCircle className="h-4 w-4 mr-3 text-gray-500" />
                          <span className="font-medium">{faq.question}</span>
                        </div>
                        <span className="text-gray-500 text-lg">
                          {expandedFaq === faq.id ? '−' : '+'}
                        </span>
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="px-4 pb-4 text-sm text-gray-600 bg-gray-50 border-t">
                          <p className="pt-2">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Still Need Help */}
      <Card className="mt-8 sm:mt-12 bg-gray-50">
        <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">
            Still Need Help?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto px-2">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-md sm:max-w-none mx-auto">
            <Button
              variant="outline"
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto sm:min-w-[140px] text-sm sm:text-base py-2.5 sm:py-2"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Us
            </Button>
            <Button 
              className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto sm:min-w-[140px] text-sm sm:text-base py-2.5 sm:py-2"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

