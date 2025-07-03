import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { type Game } from "@shared/schema";

interface SeatSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game | null;
  onPurchase: (seatNumber: string) => void;
}

interface Seat {
  id: string;
  available: boolean;
  price: number;
}

export function SeatSelectionModal({ isOpen, onClose, game, onPurchase }: SeatSelectionModalProps) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);


  const generateSeats = () => {
    const sections = ["A", "B", "C"];
    const seats = [];
    
    sections.forEach(section => {
      for (let i = 1; i <= 20; i++) {
        seats.push({
          id: `${section}${i}`,
          available: Math.random() > 0.3, 
          price: section === "A" ? 8500 : section === "B" ? 7500 : 6500
        });
      }
    });
    
    return seats;
  };

  const [seats] = useState(generateSeats());

  const handleSeatClick = (seatId: string, available: boolean) => {
    if (available) {
      setSelectedSeat(seatId);
    }
  };

  const handlePurchase = () => {
    if (selectedSeat) {
      onPurchase(selectedSeat);
      setSelectedSeat(null);
    }
  };

  const handleClose = () => {
    setSelectedSeat(null);
    onClose();
  };

  if (!game) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Your Seat</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {}
          <div className="bg-gray-100 rounded-lg p-8">
            <div className="text-center mb-4">
              <div className="bg-green-600 text-white py-2 px-4 rounded-lg inline-block font-semibold">
                ICE RINK
              </div>
            </div>
            
            {}
            <div className="mb-4 space-y-4">
              {["A", "B", "C"].map(section => (
                <div key={section}>
                  <div className="text-center text-sm font-semibold text-gray-600 mb-2">
                    Section {section} {section === "A" ? "(Premium)" : section === "B" ? "(Standard)" : "(Economy)"}
                  </div>
                  <div className="grid grid-cols-10 gap-1 justify-center mb-2">
                    {seats.filter(seat => seat.id.startsWith(section)).slice(0, 20).map((seat) => (
                      <div
                        key={seat.id}
                        className={`w-6 h-6 rounded cursor-pointer transition-colors text-xs flex items-center justify-center ${
                          selectedSeat === seat.id
                            ? "bg-blue-500 text-white"
                            : seat.available
                            ? "bg-green-300 hover:bg-green-400 text-green-800"
                            : "bg-red-300 cursor-not-allowed text-red-800"
                        }`}
                        onClick={() => handleSeatClick(seat.id, seat.available)}
                        title={seat.available ? `Seat ${seat.id} - ${formatPrice(seat.price)}` : "Taken"}
                      >
                        {seat.id.slice(-1)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {}
            <div className="flex justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-300 rounded mr-2"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-300 rounded mr-2"></div>
                <span>Taken</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span>Selected</span>
              </div>
            </div>
          </div>
          
          {}
          {selectedSeat && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Selected Seat:</h3>
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Seat {selectedSeat}</span>
                  <span className="text-gray-600 ml-2">
                    {game.homeTeam} vs {game.awayTeam}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(seats.find(s => s.id === selectedSeat)?.price || 8500)}
                  </div>
                  <div className="text-sm text-gray-500">incl. fees</div>
                </div>
              </div>
            </div>
          )}
          
          {}
          <div className="flex justify-end">
            <Button
              onClick={handlePurchase}
              disabled={!selectedSeat}
              className="seatwell-primary"
            >
              Purchase Ticket
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
