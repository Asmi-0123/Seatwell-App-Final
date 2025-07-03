import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Download, Mail, CreditCard, MapPin, User } from "lucide-react";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { type Game } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface EnhancedPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game | null;
  seatNumbers: string[];
  totalPrice: number;
  onConfirm?: () => Promise<void>;
}

export function EnhancedPurchaseModal({
  isOpen,
  onClose,
  game,
  seatNumbers,
  totalPrice,
  onConfirm,
}: EnhancedPurchaseModalProps) {
  const [step, setStep] = useState<"checkout" | "success">("checkout");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Switzerland",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePurchase = async () => {
  setIsProcessing(true);

  toast({
    title: "Processing your purchase...",
    description: "Please wait while we confirm your payment.",
    duration: 1500,
  });

  try {
    if (onConfirm) {
      await onConfirm();
    }
    setStep("success");
  } catch (error: any) {
    console.error("Purchase failed:", error);

  } finally {
    setIsProcessing(false);
  }
};



  const handleClose = () => {
    setStep("checkout");
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      postalCode: "",
      country: "Switzerland",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardName: "",
    });
    onClose();
  };

  if (!game) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        {step === "checkout" ? (
          <>
            <DialogHeader>
              <DialogTitle>Complete Your Purchase</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Game:</span>
                    <span>{game.homeTeam} vs {game.awayTeam}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{formatDateTime(game.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Venue:</span>
                    <span>{game.venue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seats:</span>
                    <span>{seatNumbers.join(", ")}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-green-600">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="John"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Doe"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john.doe@email.com"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Address Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Rue du Lac 15"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Lausanne"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        placeholder="1000"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Switzerland">Switzerland</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="Austria">Austria</SelectItem>
                          <SelectItem value="Italy">Italy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      value={formData.cardName}
                      onChange={(e) => handleInputChange("cardName", e.target.value)}
                      placeholder="John Doe"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                        placeholder="MM/YY"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange("cvv", e.target.value)}
                        placeholder="123"
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button
  onClick={handlePurchase}
  disabled={isProcessing}
  className="flex-1 seatwell-primary"
>
  {isProcessing ? "Processing..." : `Complete Purchase - ${formatPrice(totalPrice)}`}
</Button>

              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-600 text-2xl h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Purchase Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Your tickets have been purchased successfully. You will receive a confirmation email shortly.
              </p>
              
              {/* Ticket Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold mb-2">Ticket Details:</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Game:</span>
                    <span>{game.homeTeam} vs {game.awayTeam}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{formatDateTime(game.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Venue:</span>
                    <span>{game.venue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seats:</span>
                    <span>{seatNumbers.join(", ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Paid:</span>
                    <span className="font-semibold">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" className="flex items-center">
                  <Download className="mr-2 h-4 w-4" />
                  Download Tickets
                </Button>
                <Button variant="outline" className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Tickets
                </Button>
                <Button onClick={handleClose} className="seatwell-primary">
                  Close
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}