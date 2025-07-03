import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ClubLoginModal } from "@/components/club-login-modal";
import { BackgroundWrapper } from "@/components/background-wrapper";

export default function SellTicket() {
  const [, setLocation] = useLocation();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleLoginSuccess = (user: any) => {
    setLocation("/sell/games");
  };

  return (
    <BackgroundWrapper>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Sell your Ticket here!
        </h1>
        <p className="text-lg text-white mb-4">
          Do you have a seasonal hockey ticket and you cannot attend a specific game?
        </p>
        <p className="text-white mb-8">
          Sell your ticket for the date you cannot attend <span className="underline">below</span>
        </p>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">How it works:</h2>
            
            <div className="space-y-6">

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Log in with your club's account
                  </h3>
                  <p className="text-gray-600 text-sm mb-1">
                    Access your club's season ticket by securely logging in through the Seatwell platform using your club's credentials.
                  </p>
                  <p className="text-red-500 text-sm">(OAuth-style authentication)</p>
                </div>
              </div>

 
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Select the game(s) you cannot attend
                  </h3>
                  <p className="text-gray-600 text-sm">
                    View your upcoming games and simply check the ones you'd like to release your seat for.
                  </p>
                </div>
              </div>

 
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Confirm your release</h3>
                  <p className="text-gray-600 text-sm">
                    Review your selections. By confirming, your ticket will be listed on the platform — but you still retain ownership until someone claims or buys it.
                  </p>
                </div>
              </div>


              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Stay notified</h3>
                  <p className="text-gray-600 text-sm">
                    You'll receive a notification as soon as your seat is claimed. At that point, your ticket will be transferred securely to the new fan, and you'll receive a confirmation.
                  </p>
                </div>
              </div>


              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">
                  5
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Receive your payout</h3>
                  <p className="text-gray-600 text-sm">
                    Once the game is played, your share of the revenue (e.g. xx% of the ticket price) will be credited to your account or preferred payment method.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Login Button */}
          <div className="ml-8">
            <Button 
              onClick={() => setLoginModalOpen(true)}
              className="bg-gray-800 text-white hover:bg-gray-900"
            >
              Login through club
            </Button>
          </div>
        </div>
      </div>

      {/* Club Login Modal */}
      <ClubLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
      </div>
    </BackgroundWrapper>
  );
}
