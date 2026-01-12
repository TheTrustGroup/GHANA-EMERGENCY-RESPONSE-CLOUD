/**
 * Terms of Service Page
 * Legal terms and conditions for the platform
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
            Terms of Service
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using the Ghana Emergency Response Platform, you accept and agree
              to be bound by the terms and provision of this agreement. If you do not agree to
              abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Use License</h2>
            <p className="text-muted-foreground mb-2">
              Permission is granted to temporarily use the Ghana Emergency Response Platform for
              personal, non-commercial transitory viewing only. This is the grant of a license,
              not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the platform</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. User Responsibilities</h2>
            <p className="text-muted-foreground mb-2">
              Users of the platform are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Providing accurate and truthful information</li>
              <li>Maintaining the security of their account credentials</li>
              <li>Reporting only genuine emergencies</li>
              <li>Complying with all applicable laws and regulations</li>
              <li>Respecting the privacy and rights of other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Emergency Services</h2>
            <p className="text-muted-foreground">
              The Ghana Emergency Response Platform is designed to facilitate emergency response
              services. Users acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
              <li>Response times may vary based on location and circumstances</li>
              <li>The platform does not guarantee immediate response to all incidents</li>
              <li>In life-threatening emergencies, users should contact emergency services directly</li>
              <li>False reports may result in account suspension and legal action</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Account Security</h2>
            <p className="text-muted-foreground">
              Users are responsible for maintaining the confidentiality of their account
              information and password. You agree to notify us immediately of any unauthorized
              use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Prohibited Activities</h2>
            <p className="text-muted-foreground mb-2">
              Users are prohibited from:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Submitting false or misleading emergency reports</li>
              <li>Impersonating emergency response personnel</li>
              <li>Interfering with the platform&apos;s operation or security</li>
              <li>Harassing or threatening other users</li>
              <li>Violating any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              The Ghana Emergency Response Platform and its operators shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages resulting
              from your use or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Modifications</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Users will be notified of
              significant changes. Continued use of the platform after changes constitutes
              acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@emergency.gov.gh" className="text-blue-600 hover:underline">
                legal@emergency.gov.gh
              </a>
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

