'use client';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { apiService } from '../../services/api';

interface LinkedInFollowProps {
  userName?: string;
  onComplete: () => void;
}

export const LinkedInFollow = ({ userName, onComplete }: LinkedInFollowProps) => {
  const [followedCompany, setFollowedCompany] = useState(false);
  const [followedFounder, setFollowedFounder] = useState(false);
  const { data: session } = useSession();

  const handleFollowCompany = async () => {
    window.open('https://www.linkedin.com/company/engagehub/posts/?feedView=all', '_blank');
    setFollowedCompany(true);
    
    // Track the follow action
    if (session?.djangoAccessToken) {
      try {
        await apiService.trackLinkedInFollow('company', session.djangoAccessToken);
      } catch (error) {
        // Failed to track company follow
      }
    }
  };

  const handleFollowFounder = async () => {
    window.open('https://www.linkedin.com/in/sebastienfrancois2021/', '_blank');
    setFollowedFounder(true);
    
    // Track the follow action
    if (session?.djangoAccessToken) {
      try {
        await apiService.trackLinkedInFollow('founder', session.djangoAccessToken);
      } catch (error) {
        // Failed to track founder follow
      }
    }
  };

  return (
    <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <h2 className="text-2xl font-bold">Stay Connected with EngageHub</h2>
        </div>
        <p className="text-blue-100">
          Follow us on LinkedIn to stay updated with opportunities, student spotlights, and industry insights
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {/* EngageHub Company Card */}
          <div className="border-2 border-stone-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border-2 border-stone-200">
                <img 
                  src="/images/engagehub-logo.jpg" 
                  alt="EngageHub Logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLDivElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                  <span className="text-white font-bold text-xl">EH</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-stone-900">EngageHub</h3>
                <p className="text-sm text-stone-600">Company</p>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-xs text-stone-500">LinkedIn</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-stone-600 mb-4">
              Get the latest updates on student success stories, new programs, and partnership opportunities.
            </p>
            
            <button
              onClick={handleFollowCompany}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                followedCompany 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {followedCompany ? (
                <div className="flex items-center justify-center space-x-2">
                  <span>Followed!</span>
                </div>
              ) : (
                'Follow EngageHub'
              )}
            </button>
          </div>

          {/* Founder Card */}
          <div className="border-2 border-stone-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-stone-200">
                <img 
                  src="/images/ceo-profile.jpg" 
                  alt="Sebastien François - EngageHub CEO" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLDivElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center" style={{display: 'none'}}>
                  <span className="text-white font-bold text-lg">SF</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-stone-900">Sebastien François</h3>
                <p className="text-sm text-stone-600">Founder & CEO</p>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-xs text-stone-500">LinkedIn</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-stone-600 mb-4">
              Follow for leadership insights, industry trends, and behind-the-scenes content from EngageHub's founder.
            </p>
            
            <button
              onClick={handleFollowFounder}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                followedFounder 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {followedFounder ? (
                <div className="flex items-center justify-center space-x-2">
                  <span>Followed!</span>
                </div>
              ) : (
                'Follow Sebastien'
              )}
            </button>
          </div>
        </div>

        {/* Benefits section */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">Why follow us?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <span>Early access to new programs and opportunities</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <span>Student success stories and career inspiration</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <span>Industry insights and networking tips</span>
            </li>
          </ul>
        </div>

        {/* Progress indicator */}
        <div className="bg-stone-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-stone-900">Follow Progress</h4>
            <span className="text-sm text-stone-600">
              {followedCompany && followedFounder ? '2/2 Complete' : `${(followedCompany ? 1 : 0) + (followedFounder ? 1 : 0)}/2 Complete`}
            </span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-2">
            <div 
              className="bg-violet-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((followedCompany ? 1 : 0) + (followedFounder ? 1 : 0)) * 50}%` }}
            ></div>
          </div>
          {!(followedCompany && followedFounder) && (
            <p className="text-sm text-stone-600 mt-2">
              Please follow both EngageHub and Sebastien on LinkedIn to continue
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={async () => {
              // Mark onboarding as complete
              if (session?.djangoAccessToken) {
                try {
                  await apiService.completeOnboarding(session.djangoAccessToken);
                } catch (error) {
                  // Failed to mark onboarding as complete
                }
              }
              onComplete();
            }}
            disabled={!followedCompany || !followedFounder}
            className={`flex-1 font-medium py-3 px-6 rounded-lg transition-colors ${
              followedCompany && followedFounder
                ? 'bg-violet-600 hover:bg-violet-700 text-white cursor-pointer'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }`}
          >
            {followedCompany && followedFounder ? 'Continue to Dashboard' : 'Complete LinkedIn Follows to Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};