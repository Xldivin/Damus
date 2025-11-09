import React from 'react'
import { Shield, Lock, Eye, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Privacy Policy
        </h1>
        <p className="text-gray-600">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="space-y-8">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              At Rovin, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <p className="text-gray-700">
              By using our website, you consent to the data practices described in this policy. If you do not agree with the practices described in this policy, please do not use our services.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Personal Information</h3>
              <p className="text-gray-700 mb-2">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Register for an account</li>
                <li>Place an order</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact us for customer support</li>
                <li>Participate in surveys or promotions</li>
              </ul>
              <p className="text-gray-700 mt-3">
                This information may include your name, email address, phone number, shipping address, billing information, and payment details.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Automatically Collected Information</h3>
              <p className="text-gray-700">
                When you visit our website, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card>
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>To process and fulfill your orders</li>
              <li>To communicate with you about your orders, products, services, and promotional offers</li>
              <li>To improve and personalize your shopping experience</li>
              <li>To send you marketing communications (with your consent)</li>
              <li>To detect and prevent fraud and abuse</li>
              <li>To comply with legal obligations</li>
              <li>To analyze website usage and trends</li>
            </ul>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Information Sharing and Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-1">Service Providers</h3>
                <p className="text-gray-700">
                  We may share your information with third-party service providers who perform services on our behalf, such as payment processing, shipping, and data analysis.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Legal Requirements</h3>
                <p className="text-gray-700">
                  We may disclose your information if required to do so by law or in response to valid requests by public authorities.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Business Transfers</h3>
                <p className="text-gray-700">
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
            <p className="text-gray-700">
              We use SSL encryption to protect sensitive information transmitted online and maintain secure servers for storing your data.
            </p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>The right to access your personal information</li>
              <li>The right to correct inaccurate information</li>
              <li>The right to request deletion of your information</li>
              <li>The right to object to processing of your information</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise these rights, please contact us at <a href="mailto:mukunzidamus@gmail.com" className="text-black underline">mukunzidamus@gmail.com</a>
            </p>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>Cookies and Tracking Technologies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
            <p className="text-gray-700">
              However, if you do not accept cookies, you may not be able to use some portions of our website.
            </p>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Our services are not intended for children under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please contact us:
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



