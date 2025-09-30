'use client';
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { AuthPage } from "@/components/Auth/AuthPage";
import { apiService, User } from "@/services/api";

// Demo account credentials
const DEMO_CREDENTIALS = {
  username: 'Yuehan_Z',
  password: 'yuehantest'
};

function HomeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);
  const [isDemoLoggingIn, setIsDemoLoggingIn] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      // Check for demo mode OR stable mode - both auto-login with demo credentials
      const isDemoMode = searchParams.get('demo') === 'true';
      const isStableMode = searchParams.get('stable') === 'true';
      const isAutoLoginMode = isDemoMode || isStableMode;
      
      if (isAutoLoginMode && status !== "loading") {
        const modeLabel = isStableMode ? 'Stable' : 'Demo';
        const redirectParam = isStableMode ? 'stable=true' : 'demo=true';
        
        // If already authenticated, just redirect to dashboard
        if (status === "authenticated" && session?.user) {
          if (!isStableMode) {
            console.log(`🎯 ${modeLabel} mode - already authenticated, redirecting to dashboard`);
          }
          router.push(`/dashboard?${redirectParam}`);
          return;
        }
        
        // If not authenticated, auto-login with demo credentials
        if (status === "unauthenticated" && !isDemoLoggingIn) {
          // Silent mode for stable, visible for demo
          if (!isStableMode) {
            console.log(`🎯 ${modeLabel} mode detected - auto-logging in with demo account`);
          }
          setIsDemoLoggingIn(true);
          
          try {
            const result = await signIn('credentials', {
              username: DEMO_CREDENTIALS.username,
              password: DEMO_CREDENTIALS.password,
              redirect: false,
            });

            if (result?.error) {
              // Demo mode: fall back to stable mode on auth failure
              if (isDemoMode) {
                console.warn('⚠️  Demo authentication failed - falling back to stable mode');
                router.push('/dashboard?stable=true');
                return;
              }
              
              if (!isStableMode) {
                console.error(`❌ ${modeLabel} auto-login failed:`, result.error);
              }
              setIsDemoLoggingIn(false);
              // Fall through to show normal auth page with error
              return;
            }
            
            if (!isStableMode) {
              console.log(`✅ ${modeLabel} auto-login successful - redirecting to dashboard`);
            }
            // The session will update and trigger another useEffect run
            // which will handle the redirect
          } catch (error) {
            // Demo mode: fall back to stable mode on any error
            if (isDemoMode) {
              console.warn('⚠️  Demo authentication error - falling back to stable mode');
              router.push('/dashboard?stable=true');
              return;
            }
            
            if (!isStableMode) {
              console.error(`❌ ${modeLabel} auto-login error:`, error);
            }
            setIsDemoLoggingIn(false);
          }
          return;
        }
        
        return;
      }
      
      // If user is logged in, check their onboarding status
      if (status === "authenticated" && session?.user && !isCheckingOnboarding) {
        setIsCheckingOnboarding(true);
        
        try {
          // Check if this is a fresh registration first
          const isFreshRegistration = typeof window !== 'undefined' && 
            localStorage.getItem('freshRegistration') === 'true';
          
          if (isFreshRegistration) {
            // Clear the flag and redirect to onboarding
            if (typeof window !== 'undefined') {
              localStorage.removeItem('freshRegistration');
            }
            router.push("/onboarding");
            return;
          }
          
          // Get user profile to check onboarding status
          if (session?.djangoAccessToken) {
            const response = await apiService.getProfile(session.djangoAccessToken);
            
            // Check for network errors first
            if (response.isNetworkError) {
              console.log('Backend unreachable, assuming onboarding complete for authenticated user');
              router.push("/dashboard");
              return;
            }
            
            if (response.data) {
              if (!response.data.onboarding_completed) {
                // Onboarding not completed - redirect to onboarding
                router.push("/onboarding");
              } else {
                // Onboarding completed - redirect to dashboard
                router.push("/dashboard");
              }
            } else {
              // If we can't get profile data but have djangoAccessToken, assume onboarding complete
              // This handles cases where backend is down but user is authenticated
              router.push("/dashboard");
            }
          } else {
            // Fallback: Check if this is a new user (account created within last 5 minutes)
            const userCreatedAt = new Date(session.user.created_at || '');
            const now = new Date();
            const timeDifference = now.getTime() - userCreatedAt.getTime();
            const fiveMinutesInMs = 5 * 60 * 1000;
            
            if (timeDifference < fiveMinutesInMs) {
              // New user - redirect to onboarding
              router.push("/onboarding");
            } else {
              // Existing user - redirect to dashboard (assume onboarding complete)
              router.push("/dashboard");
            }
          }
        } catch (error) {
          console.error('Error checking user status:', error);
          
          // For any error when checking user status, assume existing user and redirect to dashboard
          // This handles network errors, backend downtime, etc.
          router.push("/dashboard");
        } finally {
          setIsCheckingOnboarding(false);
        }
      }
    };

    checkUserStatus();
  }, [session, status, router, isCheckingOnboarding, searchParams, isDemoLoggingIn]);

  if (status === "loading" || isCheckingOnboarding || isDemoLoggingIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-center">
          <div className="text-xl text-stone-600 mb-4">
            {status === "loading" ? "Loading..." : "Checking account status..."}
          </div>
        </div>
      </div>
    );
  }

  // If authenticated, will redirect appropriately (handled in useEffect)
  if (status === "authenticated" && session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-xl text-stone-600">Redirecting...</div>
      </div>
    );
  }

  // Show auth page for unauthenticated users
  return <AuthPage />;
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-xl text-stone-600">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
