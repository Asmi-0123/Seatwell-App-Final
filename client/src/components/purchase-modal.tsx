import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Download, Mail } from "lucide-react";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { type Game } from "@shared/schema";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game | null;
  seatNumber: string;
  price: number;
}

export function PurchaseModal({ isOpen, onClose, game, seatNumber, price }: PurchaseModalProps) {
  if (!game) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-green-600 text-2xl h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Purchase Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Your ticket has been purchased successfully. You will receive a confirmation email shortly.
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
                <span>Seat:</span>
                <span>{seatNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-semibold">{formatPrice(price)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Download Ticket
            </Button>
            <Button variant="outline" className="flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              Email Ticket
            </Button>
            <Button onClick={onClose} className="seatwell-primary">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
