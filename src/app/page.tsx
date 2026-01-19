'use client';

/**
 * Homepage / Landing Page
 * Public-facing landing page for the Ghana Emergency Response Platform
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { trackPageView } from '@/lib/analytics/track';
import { trackPageLoad } from '@/lib/monitoring/performance';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, MapPin, Users, Clock, AlertTriangle, BarChart3, AlertCircle } from 'lucide-react';

export default function Home() {
  useEffect(() => {
    trackPageView('home');
    trackPageLoad();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background */}
      <section className="relative flex min-h-screen items-center">
        {/* Background - Solid blue as shown in image */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900" />

        {/* Optional subtle pattern overlay */}
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03)_0%,transparent_50%)]" />

        {/* Content */}
        <div className="relative z-20 flex h-full items-center justify-center px-4 sm:px-6">
          <div className="w-full max-w-4xl text-center text-white">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs sm:text-sm backdrop-blur-sm">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Powered by the Government of Ghana</span>
            </div>

            {/* Main Heading - Better line breaks */}
            <h1 className="mb-8 text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">Ghana</span>
              <span className="block">Emergency</span>
              <span className="block">Response</span>
              <span className="block">Platform</span>
            </h1>

            {/* Description - Better spacing */}
            <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-blue-50 sm:text-xl md:text-2xl">
              <span className="block sm:inline">Rapid response.</span>{' '}
              <span className="block sm:inline">Coordinated action.</span>{' '}
              <span className="block sm:inline">Lives saved.</span>
              <br className="hidden sm:block" />
              <span className="mt-2 block text-base sm:text-lg md:text-xl">
                Connecting citizens, responders, and agencies in real-time.
              </span>
            </p>

            {/* CTA Buttons - Better spacing */}
            <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button 
                size="lg" 
                asChild 
                className="bg-red-600 px-8 py-6 text-base font-semibold text-white shadow-lg hover:bg-red-700 sm:px-10 sm:py-7 sm:text-lg"
              >
                <Link href="/report">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Report Emergency
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-2 border-white/30 bg-white/10 px-8 py-6 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 sm:px-10 sm:py-7 sm:text-lg"
              >
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>

            {/* Stats - Better spacing and alignment */}
            <div className="mx-auto mt-auto grid max-w-2xl grid-cols-3 gap-6 border-t border-white/20 pt-8 sm:gap-8">
              <div className="flex flex-col items-center">
                <div className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl">24/7</div>
                <div className="text-xs text-blue-200 sm:text-sm">Available</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl">&lt;5 min</div>
                <div className="text-xs text-blue-200 sm:text-sm">Response Time</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl">100+</div>
                <div className="text-xs text-blue-200 sm:text-sm">Agencies</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Only show on desktop */}
        <div className="absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 animate-bounce md:block">
          <div className="h-12 w-8 rounded-full border-2 border-white/50 p-2">
            <div className="h-3 w-3 rounded-full bg-white/50" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900 sm:text-4xl">Key Features</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <AlertTriangle className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Rapid Incident Reporting</CardTitle>
                <CardDescription>
                  Report emergencies instantly with location, photos, and details. Get immediate
                  response coordination.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Real-Time Location Tracking</CardTitle>
                <CardDescription>
                  Track responders in real-time. Optimize dispatch routes and provide accurate ETAs
                  to citizens.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Multi-Agency Coordination</CardTitle>
                <CardDescription>
                  Coordinate between police, fire, ambulance, and NADMO for comprehensive emergency
                  response.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Fast Response Times</CardTitle>
                <CardDescription>
                  Intelligent dispatch algorithms ensure the nearest available responders are
                  assigned quickly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Government-grade security with encrypted communications and secure data storage.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Comprehensive analytics for response time optimization and resource planning.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900 sm:text-4xl">How It Works</h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Report Incident</h3>
              <p className="text-slate-600">
                Citizens report emergencies with location, photos, and details
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Dispatch Response</h3>
              <p className="text-slate-600">
                Agencies coordinate and deploy responders to the scene
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Track Progress</h3>
              <p className="text-slate-600">
                Real-time updates and tracking until incident resolution
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 px-4 py-16 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">Ready to Get Started?</h2>
          <p className="mx-auto max-w-2xl text-lg text-blue-100 sm:text-xl">
            Join the Ghana Emergency Response Platform today and help make our communities safer.
          </p>
          <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild className="px-8 py-6 text-lg">
              <Link href="/auth/register">Create Account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white px-8 py-6 text-lg text-white hover:bg-white hover:text-blue-900"
            >
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 px-4 py-8 text-gray-300">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="mb-4 font-semibold text-white">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/auth/signin" className="hover:text-white">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="hover:text-white">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-white">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-white">Emergency Contacts</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="tel:191" className="hover:text-white">
                    Police: 191
                  </a>
                </li>
                <li>
                  <a href="tel:192" className="hover:text-white">
                    Fire Service: 192
                  </a>
                </li>
                <li>
                  <a href="tel:193" className="hover:text-white">
                    Ambulance: 193
                  </a>
                </li>
                <li>
                  <a href="tel:194" className="hover:text-white">
                    NADMO: 194
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>
              &copy; {new Date().getFullYear()} Ghana Emergency Response Platform. All rights
              reserved.
            </p>
            <p className="mt-2 text-gray-500">Government-grade Emergency Response System</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
