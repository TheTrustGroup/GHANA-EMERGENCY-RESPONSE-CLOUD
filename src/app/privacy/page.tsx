/**
 * Privacy Policy Page
 * Privacy policy and data protection information
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-blue-900">
            Privacy Policy
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground">
              The Ghana Emergency Response Platform (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed
              to protecting your privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                <p className="text-muted-foreground mb-2">We collect information that you provide directly to us:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Account credentials (password, stored securely)</li>
                  <li>Location data (when reporting emergencies)</li>
                  <li>Emergency incident reports and related information</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Automatically Collected Information</h3>
                <p className="text-muted-foreground mb-2">We automatically collect certain information:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Device information and IP address</li>
                  <li>Browser type and version</li>
                  <li>Usage data and platform interactions</li>
                  <li>Location data (with your permission)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-2">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Provide and maintain the emergency response platform</li>
              <li>Process and respond to emergency reports</li>
              <li>Coordinate emergency response services</li>
              <li>Send important notifications and updates</li>
              <li>Improve platform functionality and user experience</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Information Sharing and Disclosure</h2>
            <p className="text-muted-foreground mb-2">
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>
                <strong>Emergency Response Agencies:</strong> Information necessary for emergency
                response coordination
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to protect rights
                and safety
              </li>
              <li>
                <strong>Service Providers:</strong> Trusted third parties who assist in platform
                operations (under strict confidentiality agreements)
              </li>
              <li>
                <strong>With Your Consent:</strong> When you explicitly authorize sharing
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational security measures to protect
              your personal information against unauthorized access, alteration, disclosure, or
              destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Location Data</h2>
            <p className="text-muted-foreground">
              Location data is critical for emergency response. We collect location information
              only when you report an emergency or enable location services. This data is used
              solely for emergency response purposes and is shared only with authorized emergency
              response agencies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Your Rights</h2>
            <p className="text-muted-foreground mb-2">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your account and data</li>
              <li>Object to processing of your information</li>
              <li>Request data portability</li>
              <li>Withdraw consent where applicable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your personal information for as long as necessary to fulfill the purposes
              outlined in this policy, unless a longer retention period is required or permitted
              by law. Emergency incident data may be retained for longer periods for legal and
              safety purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground">
              Our platform is not intended for users under the age of 18. We do not knowingly
              collect personal information from children. If you believe we have collected
              information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new policy on this page and updating the &quot;Last updated&quot;
              date. You are advised to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">11. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy or our data practices, please
              contact us at:{' '}
              <a href="mailto:privacy@emergency.gov.gh" className="text-blue-600 hover:underline">
                privacy@emergency.gov.gh
              </a>
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

