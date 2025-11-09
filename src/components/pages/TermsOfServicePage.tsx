import React from 'react'
import { FileText, Scale, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
          <Scale className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Terms of Service
        </h1>
        <p className="text-gray-600">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="space-y-8">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle>Agreement to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              These Terms of Service ("Terms") govern your access to and use of the Damus website and services. By accessing or using our website, you agree to be bound by these Terms.
            </p>
            <p className="text-gray-700">
              If you do not agree to these Terms, please do not use our services. We reserve the right to modify these Terms at any time, and such modifications shall be effective immediately upon posting.
            </p>
          </CardContent>
        </Card>

        {/* Use of Service */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Use of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Eligibility</h3>
              <p className="text-gray-700">
                You must be at least 18 years old to use our services. By using our website, you represent and warrant that you are at least 18 years of age and have the legal capacity to enter into these Terms.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Account Registration</h3>
              <p className="text-gray-700">
                To access certain features of our website, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Account Security</h3>
              <p className="text-gray-700">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Products and Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Products and Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Product Information</h3>
              <p className="text-gray-700">
                We strive to provide accurate product descriptions, images, and pricing information. However, we do not warrant that product descriptions or other content on our website is accurate, complete, reliable, current, or error-free.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Pricing</h3>
              <p className="text-gray-700">
                All prices are displayed in AED (United Arab Emirates Dirham) and are subject to change without notice. We reserve the right to modify prices at any time, but such changes will not affect orders that have already been confirmed.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Availability</h3>
              <p className="text-gray-700">
                Product availability is subject to change. We reserve the right to limit the quantity of items purchased per person, per household, or per order. We may refuse or cancel any order at our sole discretion.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Orders and Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Orders and Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Order Acceptance</h3>
              <p className="text-gray-700">
                Your order is an offer to purchase products from us. We reserve the right to accept or reject your order for any reason, including product availability, errors in pricing or product information, or fraud prevention.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Payment Terms</h3>
              <p className="text-gray-700">
                Payment must be received before we ship your order. We accept various payment methods as displayed on our checkout page. By providing payment information, you represent that you are authorized to use the payment method.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Order Cancellation</h3>
              <p className="text-gray-700">
                You may cancel your order before it has been shipped. Once an order has been shipped, it cannot be cancelled, but you may return it in accordance with our return policy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Shipping and Delivery */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping and Delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              We ship to addresses within the United Arab Emirates and select international locations. Shipping costs and delivery times vary based on your location and the shipping method selected.
            </p>
            <p className="text-gray-700">
              Risk of loss and title for products purchased from us pass to you upon delivery of the products to the carrier. We are not responsible for any delays caused by the shipping carrier.
            </p>
          </CardContent>
        </Card>

        {/* Returns and Refunds */}
        <Card>
          <CardHeader>
            <CardTitle>Returns and Refunds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Our return policy is detailed on our Returns page. Generally, you may return items within 30 days of delivery, provided they are in their original condition with tags attached.
            </p>
            <p className="text-gray-700">
              Refunds will be processed to your original payment method within 5-7 business days after we receive and inspect your return.
            </p>
          </CardContent>
        </Card>

        {/* Prohibited Uses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Prohibited Uses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              You agree not to use our website:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To upload or transmit viruses or any other type of malicious code</li>
              <li>To collect or track the personal information of others</li>
              <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
            </ul>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle>Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              The website and its original content, features, and functionality are owned by Damus and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-gray-700">
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our website without our prior written consent.
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card>
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              To the fullest extent permitted by applicable law, in no event shall Damus, its directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of our services.
            </p>
            <p className="text-gray-700">
              Our total liability to you for all claims arising from or related to the use of our services shall not exceed the amount you paid to us in the twelve (12) months prior to the action giving rise to liability.
            </p>
          </CardContent>
        </Card>

        {/* Indemnification */}
        <Card>
          <CardHeader>
            <CardTitle>Indemnification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              You agree to defend, indemnify, and hold harmless Damus and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including without limitation, reasonable attorney's fees and costs, arising out of or in any way connected with your access to or use of our services or your violation of these Terms.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card>
          <CardHeader>
            <CardTitle>Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Dubai, United Arab Emirates.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p className="text-gray-700 mt-4">
              By continuing to access or use our services after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> <a href="mailto:mukunzidamus@gmail.com" className="text-black underline">mukunzidamus@gmail.com</a></p>
              <p><strong>Phone:</strong> <a href="tel:+971588415993" className="text-black underline">+971 58 841 5993</a></p>
              <p><strong>Address:</strong> Dubai, United Arab Emirates</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



