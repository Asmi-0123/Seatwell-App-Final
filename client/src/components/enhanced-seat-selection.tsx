import { useEffect, useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { Game, Ticket } from "@shared/schema";

interface EnhancedSeatSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game | null;
  onAction: (payload: any[]) => void; 
  mode: 'buyer' | 'seller';
}

interface Seat {
  id: string;
  price: number;
  available: boolean;
  ticketId?: number; 
  section: string;
}

export function EnhancedSeatSelection({
  isOpen,
  onClose,
  game,
  onAction,
  mode,
}: EnhancedSeatSelectionProps) {
  const [realTickets, setRealTickets] = useState<Ticket[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (game) {
      axios
        .get<Ticket[]>(`/api/tickets/game/${game.id}`)
        .then((res) => {
          setRealTickets(res.data);
          setSeats(generateArenaLayout(res.data));
        })
        .catch((err) => {
          console.error("Failed to fetch tickets:", err);
        });
    }
  }, [game]);

  const generateArenaLayout = (tickets: Ticket[]): Seat[] => {
    const layout: Seat[] = [];
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
    const allSections = [
      { name: "101", rows: 15, seatsPerRow: 20 },
      { name: "102", rows: 15, seatsPerRow: 18 },
      { name: "103", rows: 15, seatsPerRow: 16 },
      { name: "104", rows: 15, seatsPerRow: 18 },
      { name: "105", rows: 15, seatsPerRow: 20 },
      { name: "201", rows: 12, seatsPerRow: 16 },
      { name: "202", rows: 12, seatsPerRow: 14 },
      { name: "203", rows: 12, seatsPerRow: 12 },
      { name: "204", rows: 12, seatsPerRow: 14 },
      { name: "205", rows: 12, seatsPerRow: 16 },
    ];
    allSections.forEach((section) => {
      for (let row = 1; row <= section.rows; row++) {
        for (let seat = 1; seat <= section.seatsPerRow; seat++) {
          const seatId = `${section.name}-${row}-${seat}`;
          const ticket = tickets.find((t) => t.seatNumber === seatId);
          let available = false;
          let price = getDefaultPrice(section.name);
          let ticketId: number | undefined = undefined;
          if (ticket) {
            price = ticket.price;
          }
          if (mode === 'buyer') {
            if (ticket && ticket.status === 'available') {
              available = true;
              ticketId = ticket.id;
            }
          } else {
            if (!ticket || ticket.status !== 'available') {
              available = true;
            }
          }
          layout.push({
            id: seatId,
            price,
            available,
            ticketId,
            section: section.name,
          });
        }
      }
    });
    return layout;
  };

  const toggleSeat = (seatId: string) => {
    const newSet = new Set(selected);
    if (newSet.has(seatId)) {
      newSet.delete(seatId);
    } else {
      newSet.add(seatId);
    }
    setSelected(newSet);
  };


  const getTotalPrice = () => {
    return Array.from(selected).reduce((sum, seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      return sum + (seat?.price ?? 0);
    }, 0);
  };

  const renderSection = (sectionName: string) => {
    const sectionSeats = seats.filter((s) => s.section === sectionName);
    const rows = [...new Set(sectionSeats.map((s) => s.id.split("-")[1]))];

    return (
      <div key={sectionName} className="mb-6">
        <h3 className="text-sm font-semibold text-center mb-2">Section {sectionName}</h3>
        <div className="border rounded-lg p-4 bg-gray-50 overflow-x-auto">
          {rows.map((rowNumber) => {
            const rowSeats = sectionSeats.filter((s) =>
              s.id.includes(`-${rowNumber}-`)
            );
            return (
              <div key={`${sectionName}-${rowNumber}`} className="flex justify-center items-center mb-2 gap-1">
                <span className="text-xs text-gray-500 w-8 text-right mr-2">{rowNumber}</span>
                <div className="flex gap-1 flex-wrap">
                  {rowSeats.map((seat) => (
                    <button
                      key={seat.id}
                      className={`w-8 h-8 text-sm font-medium rounded-md border transition-colors
                        ${selected.has(seat.id)
                          ? "bg-blue-500 text-white border-blue-700"
                          : seat.available
                          ? "bg-green-300 hover:bg-green-400 text-green-800 border-green-600"
                          : "bg-red-300 text-red-800 cursor-not-allowed border-red-600"
                        }`}
                      onClick={() => toggleSeat(seat.id)}
                      title={seat.available ? `${seat.id} – ${formatPrice(seat.price)}` : "Unavailable"}
                      disabled={!seat.available}
                    >
                      {seat.id.split("-")[2]}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!game) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Your Seats – Vaudoise Arena</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="bg-green-600 text-white py-3 px-6 rounded-lg inline-block font-semibold">
              ICE RINK
            </div>
            <p className="text-sm text-gray-600 mt-2">{game.homeTeam} vs {game.awayTeam}</p>
          </div>

          {/* Arena Layout */}
          <div>
            <h2 className="text-lg font-bold text-center mb-4">Upper Bowl</h2>
            <div className="grid grid-cols-5 gap-4">
              {["201", "202", "203", "204", "205"].map(renderSection)}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-center mb-4">Lower Bowl (Premium)</h2>
            <div className="grid grid-cols-5 gap-4">
              {["101", "102", "103", "104", "105"].map(renderSection)}
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-8 text-sm mt-6 pt-4 border-t">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-300 rounded-sm mr-2" />
              <span>Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-300 rounded-sm mr-2" />
              <span>Unavailable</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2" />
              <span>Selected</span>
            </div>
          </div>

          {/* Summary */}
          {selected.size > 0 && (
            <div className="bg-gray-50 p-5 mt-4 rounded-md border">
              <h4 className="font-semibold mb-2">Selected Seats ({selected.size})</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {Array.from(selected).map((seatId) => {
                  const seat = seats.find((s) => s.id === seatId);
                  return (
                    <Badge key={seatId} variant="secondary">
                      {seat?.id} – {formatPrice(seat?.price ?? 0)}
                    </Badge>
                  );
                })}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold">
                  Total: {formatPrice(getTotalPrice())}
                </div>
                <Button className="seatwell-primary" onClick={() => {
                  onAction(Array.from(selected));
                  setSelected(new Set());
                }}>
                  {mode === 'buyer' ? `Purchase ${selected.size} Ticket${selected.size > 1 ? "s" : ""}` : `Select ${selected.size} Seat${selected.size > 1 ? "s" : ""}`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
