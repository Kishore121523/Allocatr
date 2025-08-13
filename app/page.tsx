// app/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';

import { PiggyBank } from 'lucide-react';

export default function LandingPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-xs">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="animate-pulse">
                <div className="p-4 bg-primary/20 rounded-2xl">
                  <PiggyBank className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Floating circles with subtle animation */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(74, 222, 128)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Animated circles */}
          <circle r="100" fill="url(#grad1)" className="animate-float-slow">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="100 100; 150 80; 100 100"
              dur="20s"
              repeatCount="indefinite"
            />
          </circle>
          
          <circle r="60" fill="url(#grad1)" className="animate-float-medium">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="400 300; 420 280; 400 300"
              dur="15s"
              repeatCount="indefinite"
            />
          </circle>
          
          <circle r="80" fill="url(#grad1)" className="animate-float-fast">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="300 500; 280 520; 300 500"
              dur="12s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>

        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="w-full max-w-xs relative">
        {/* Logo with animation */}
        <div className="text-center mb-5">
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Pulse ring animation */}
              <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping" />
              
              {/* Main logo container */}
              <div className="relative p-4 bg-primary rounded-2xl transform transition-transform hover:scale-105">
                <PiggyBank className="h-8 w-8 text-primary-foreground" />
              </div>

              {/* Orbiting dot */}
              <svg className="absolute -inset-4 w-24 h-24 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <circle r="2" fill="currentColor" className="text-primary/40">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 48 48"
                    to="360 48 48"
                    dur="8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cx"
                    values="48; 48"
                    dur="8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cy"
                    values="16; 16"
                    dur="8s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </div>
          </div>

          {/* Animated text */}
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-foreground tracking-tight animate-fade-in-up">
              Allocatr
            </h1>
            <p className="text-sm text-muted-foreground animate-fade-in-up animation-delay-100">
              Smart budgeting, simplified
            </p>
          </div>
        </div>

        {/* Sign In with subtle entrance animation */}
        <div className="space-y-3 animate-fade-in-up animation-delay-200">
          <Button
            onClick={signInWithGoogle}
            className="w-full h-12 rounded-xl font-medium cursor-pointer bg-primary hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 relative overflow-hidden group"
            size="lg"
          >
            {/* Button shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <svg
              className="h-5 w-5"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              />
            </svg>
            Sign in with Google
          </Button>
          
          <p className="text-center text-xs text-muted-foreground animate-fade-in-up animation-delay-300">
            Your information stays private—always.
          </p>
        </div>
      </div>

      {/* Add CSS animations to your global CSS */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
          opacity: 0;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }

        .animate-float-slow {
          animation: float-slow 20s infinite ease-in-out;
        }

        .animate-float-medium {
          animation: float-slow 15s infinite ease-in-out;
        }

        .animate-float-fast {
          animation: float-slow 12s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}