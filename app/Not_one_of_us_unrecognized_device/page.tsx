'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Home } from 'lucide-react';

export default function UnrecognizedDevicePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-red-400" />
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto" />
          </div>

          {/* Message */}
          <h1 className="text-4xl font-bold text-red-400 mb-6">
            Unrecognized Device
          </h1>
          
          <p className="text-xl text-neutral-300 mb-8 leading-relaxed">
            We've detected that you're accessing Otakumori from a device we don't recognize. 
            This is a security measure to protect your account and ensure a safe experience.
          </p>

          <div className="bg-gray-800/50 border border-red-500/30 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-red-300 mb-4">
              What This Means
            </h2>
            <ul className="text-neutral-300 text-left space-y-2">
              <li>• Your account security is our priority</li>
              <li>• This is a normal security check</li>
              <li>• You may need to verify your identity</li>
              <li>• Some features may be temporarily limited</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Link href="/">
              <Button size="lg" className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto">
                <Home className="h-5 w-5 mr-2" />
                Return to Home
              </Button>
            </Link>
            
            <p className="text-sm text-neutral-400">
              If you believe this is an error, please contact our support team.
            </p>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-sm text-neutral-500">
            <p>
              For security reasons, we may require additional verification for unrecognized devices. 
              This helps protect your account from unauthorized access.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
