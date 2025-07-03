import { useState } from "react";
import { EnhancedSeatSelection } from "@/components/enhanced-seat-selection";
import { useLocation } from "wouter";
import { type Game } from "@shared/schema";

interface SellerSeatSelectionProps {
  game: Game;
  sellerId: number;
  onComplete: () => void;
}

export function SellerSeatSelection({ game, sellerId, onComplete }: SellerSeatSelectionProps) {
  const [modalOpen, setModalOpen] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [price, setPrice] = useState(6000);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();


  const handleListTickets = async (seatIds: string[]) => {
    setLoading(true);
    try {
      await Promise.all(
        seatIds.map((seatNumber) =>
          axios.post("/api/tickets", {
            gameId: game.id,
            sellerId,
            seatNumber,
            price,
            status: "available",
          })
        )
      );
      setModalOpen(false);
      onComplete();
      setLocation("/sell/confirm");
    } catch (err) {
      alert("Failed to list tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <EnhancedSeatSelection
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      game={game}

      onPurchase={(ticketIds) => {
        handleListTickets(ticketIds as unknown as string[]);
      }}
    />
  );
}
