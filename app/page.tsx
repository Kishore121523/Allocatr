// app/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PiggyBank } from 'lucide-react';
import bgImage from '@/public/bg-image4.png';


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
    <div className="min-h-screen flex overflow-hidden bg-[#1a1a1a]">
      {/* Left Half - Login Section */}
      <div className="w-full sm:w-1/2 flex items-center justify-center p-8 bg-transparent">
        <div className="w-full max-w-sm">
          {/* Logo with animation */}
          <div className="text-center mb-6">
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
                Simplify your finances
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
            
            {/* Feature Pills */}
            <div className="flex justify-center gap-3 mt-2 animate-fade-in-up animation-delay-250 flex-nowrap">
              <span className="px-2 py-1 bg-accent/40 text-primary text-xs font-medium rounded-full border border-accent-foreground/20 whitespace-nowrap">
                AI Categorization
              </span>
              <span className="px-2 py-1 bg-accent/40 text-primary text-xs font-medium rounded-full border border-accent-foreground/20 whitespace-nowrap">
                Smart Insights
              </span>
              <span className="px-2 py-1 bg-accent/40 text-primary text-xs font-medium rounded-full border border-accent-foreground/20 whitespace-nowrap">
                Real-time Tracking
              </span>
            </div>
            
            <p className="text-center text-xs text-muted-foreground animate-fade-in-up animation-delay-300">
              Your information stays private - always.
            </p>
          </div>
        </div>
      </div>

      {/* Right Half - Background Image */}
      <div className="w-1/2 relative hidden sm:block bg-transparent">
        <Image 
          src={bgImage} 
          alt="Background" 
          fill 
          draggable={false}
          className="object-cover p-[3rem] rounded-[10%] rounded-bl-[25%] hover:scale-101 transition-all duration-500 cursor-" 
          style={{filter: 'drop-shadow(0px 10px 10px rgba(0,0, 0, 0.25))'}}
        />
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

        .animation-delay-250 {
          animation-delay: 0.25s;
          opacity: 0;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

