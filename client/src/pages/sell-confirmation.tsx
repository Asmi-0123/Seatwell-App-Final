import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Info } from "lucide-react";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { type Game } from "@shared/schema";
import { content } from "@/config/content";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";




export default function SellConfirmation() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast(); 
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    iban: "",
    accountHolder: "",
    bic: "",
  });
  const [siteContent, setSiteContent] = useState<any>({});

  useEffect(() => {
    const game = localStorage.getItem("sellSelectedGame");
    const seats = localStorage.getItem("sellSelectedSeats");
    if (game && seats) {
      setSelectedGame(JSON.parse(game));
      setSelectedSeats(JSON.parse(seats));
    } else {
      setLocation("/sell/games");
    }
  }, [setLocation]);

  useEffect(() => {
    fetch("/api/content")
      .then(res => res.json())
      .then(data => {
        const map: Record<string, string> = {};
        data.forEach((item: any) => { map[item.key] = item.value; });
        setSiteContent(map);
      });
  }, []);

  const getDefaultPrice = (section: string) => {
    switch (section) {
      case "101": case "105": return 9500;
      case "102": case "104": return 9000;
      case "103": return 8500;
      case "201": case "205": return 7500;
      case "202": case "204": return 7000;
      case "203": return 6500;
      default: return 6000;
    }
  };

  const handleConfirm = async () => {
  const seller = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("sellerUser") || "null") : null;

  if (!seller || !selectedGame) {
    alert("Please log in as a seller to list tickets.");
    return;
  }

  setIsSubmitting(true); 

  toast({
    title: "Processing your ticket release...",
    description: "Please wait while your tickets are being listed.",
    duration: 1500,
  });

  try {
    await Promise.all(selectedSeats.map(async (seatNumber) => {
      const section = seatNumber.split('-')[0];
      const payload = {
        gameId: Number(selectedGame.id),
        sellerId: Number(seller.id),
        seatNumber,
        price: getDefaultPrice(section),
        status: "available",
      };
      await axios.post("/api/tickets", payload);
    }));

    setSuccessModalOpen(true);
    localStorage.removeItem("sellSelectedGame");
    localStorage.removeItem("sellSelectedSeats");
    queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
  } catch (err) {
    alert("Failed to list tickets. Please try again.");
  } finally {
    setIsSubmitting(false); 
  }
};



  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    setLocation("/");
  };

  const handleInputChange = (field: string, value: string) => {
    setBankInfo(prev => ({ ...prev, [field]: value }));
  };

  if (!selectedGame) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Confirm Your Ticket Release
        </h1>
        <p className="text-gray-600">
          Review your selections and provide payment information for your payout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Selected Game Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Selected Game</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-800">
                  {selectedGame.homeTeam} vs {selectedGame.awayTeam}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDateTime(selectedGame.date)} • {selectedGame.venue}
                </div>
              </div>
              {/* Removed misleading single price display here */}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Expected Payout:</span>
              <span className="text-xl font-bold text-green-600">
                {formatPrice(selectedSeats.reduce((sum, seat) => sum + getDefaultPrice(seat.split("-")[0]), 0))}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              *{siteContent.resale_info_text || content.sellTicket.expectedPayoutText}
            </p>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Information</h2>
          
          {/* Bank Information Explanation */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">{content.sellTicket.bankInfoExplanation.title}</h3>
            <p className="text-blue-800 text-sm">{content.sellTicket.bankInfoExplanation.text}</p>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bank-name">Bank Name</Label>
              <Input
                id="bank-name"
                value={bankInfo.bankName}
                onChange={(e) => handleInputChange("bankName", e.target.value)}
                placeholder="UBS Switzerland AG"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                value={bankInfo.iban}
                onChange={(e) => handleInputChange("iban", e.target.value)}
                placeholder="CH93 0076 2011 6238 5295 7"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="account-holder">Account Holder Name</Label>
              <Input
                id="account-holder"
                value={bankInfo.accountHolder}
                onChange={(e) => handleInputChange("accountHolder", e.target.value)}
                placeholder="Max Mustermann"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bic">BIC/SWIFT (Optional)</Label>
              <Input
                id="bic"
                value={bankInfo.bic}
                onChange={(e) => handleInputChange("bic", e.target.value)}
                placeholder="UBSWCHZH80A"
                className="mt-1"
              />
            </div>
          </div>
          
          {/* Data Security Statement */}
          <div className="mt-6 p-3 bg-green-50 rounded-lg">
            <p className="text-green-800 text-sm font-medium">
              🔒 {content.sellTicket.dataSecurityStatement}
            </p>
          </div>
        </div>
      </div>

      {/* Selected Seats Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Selected Seats</h2>
        <div className="space-y-2">
          {selectedSeats.map((seat, idx) => (
            <div key={seat} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-mono">{seat}</span>
              <span className="text-gray-700">{formatPrice(getDefaultPrice(seat.split("-")[0]))}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-4 border-t pt-4">
          <span className="font-semibold">Total:</span>
          <span className="text-lg font-bold text-green-600">
            {formatPrice(selectedSeats.reduce((sum, seat) => {
              const section = seat.split("-")[0];
              return sum + getDefaultPrice(section);
            }, 0))}
          </span>
        </div>
      </div>

      {/* Confirmation Actions */}
      <div className="mt-8 text-center">
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> By confirming, your tickets will be listed on the Seatwell platform. 
            You'll retain ownership until they're purchased. We'll notify you immediately when a sale occurs 
            and transfer payment within 3-5 business days after the game.
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/sell/games")}
            className="px-6 py-3"
          >
            Back to Selection
          </Button>
          <Button 
  onClick={handleConfirm}
  disabled={isSubmitting}
  className="seatwell-primary px-8 py-3"
>
  {isSubmitting ? "Confirming..." : "Confirm Release"}
</Button>

        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="max-w-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-600 h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Tickets Successfully Listed!
            </h2>
            <p className="text-gray-600 mb-6">
              Your tickets are now available for purchase on the Seatwell platform. 
              You'll receive notifications as soon as they're sold.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold mb-2">What happens next:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Check className="text-blue-600 mr-2 h-4 w-4" />
                  <span>Instant notifications when tickets are purchased</span>
                </div>
                <div className="flex items-center">
                  <Check className="text-blue-600 mr-2 h-4 w-4" />
                  <span>Payout within 3-5 days after each game</span>
                </div>
                <div className="flex items-center">
                  <Check className="text-blue-600 mr-2 h-4 w-4" />
                  <span>Email confirmations for all transactions</span>
                </div>
              </div>
            </div>
            
            <Button onClick={handleSuccessClose} className="seatwell-primary">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
