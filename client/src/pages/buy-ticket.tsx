import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GameCard } from "@/components/game-card";
import { EnhancedSeatSelection } from "@/components/enhanced-seat-selection";
import { EnhancedPurchaseModal } from "@/components/enhanced-purchase-modal";
import { BackgroundWrapper } from "@/components/background-wrapper";
import { type Game } from "@shared/schema";

export default function BuyTicket() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [seatSelectionOpen, setSeatSelectionOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [purchasedSeats, setPurchasedSeats] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [pendingPurchase, setPendingPurchase] = useState<string[] | null>(null);
  const [pendingTotal, setPendingTotal] = useState(0);

  const queryClient = useQueryClient();

  const { data: games = [], isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ["/api/tickets"],
  });

  
  const getTicketStatus = (gameId: number) => {
    const gameTickets = tickets.filter((ticket: any) => 
      ticket.gameId === gameId && ticket.status === "available"
    );
    if (gameTickets.length === 0) return "none";
    if (gameTickets.length <= 100) return "few-left";
    return "available";
  };

  
  const sortedGames = games.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleGameClick = (game: Game) => {
    const ticketStatus = getTicketStatus(game.id);
    if (ticketStatus === "available" || ticketStatus === "few-left") {
      setSelectedGame(game);
      setSeatSelectionOpen(true);
    }
  };

  const handlePurchase = (seats: string[], price: number) => {
    setPurchasedSeats(seats);
    setTotalPrice(price);
    setSeatSelectionOpen(false);
    setPurchaseModalOpen(true);
  };

  const closePurchaseModal = () => {
    setPurchaseModalOpen(false);
    setSelectedGame(null);
    setPurchasedSeats([]);
    setTotalPrice(0);
  };

  return (
    <BackgroundWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Find your Ticket here!
        </h1>
      </div>

      {}
      <div className="mb-16">
        <h2 className="text-6xl font-bold text-white text-center mb-12">
          GAMES
        </h2>
        
        {isLoading ? (
          <div className="text-center">Loading games...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {sortedGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                ticketStatus={getTicketStatus(game.id)}
                onClick={() => handleGameClick(game)}
              />
            ))}
          </div>
        )}
      </div>

      {}
      <EnhancedSeatSelection
        isOpen={seatSelectionOpen}
        onClose={() => setSeatSelectionOpen(false)}
        game={selectedGame}
        onAction={async (seatIds: string[]) => {
          setPendingPurchase(seatIds);
          
          let total = 0;
          if (selectedGame) {
            const ticketRes = await fetch(`/api/tickets/game/${selectedGame.id}`);
            const tickets = await ticketRes.json();
            for (const seatId of seatIds) {
              const ticket = tickets.find((t: any) => t.seatNumber === seatId && t.status === "available");
              if (ticket) total += ticket.price;
            }
          }
          setPendingTotal(total);
          setSeatSelectionOpen(false);
          setPurchaseModalOpen(true);
        }}
        mode="buyer"
      />

      {}
      <EnhancedPurchaseModal
        isOpen={purchaseModalOpen}
        onClose={closePurchaseModal}
        game={selectedGame}
        seatNumbers={pendingPurchase || []}
        totalPrice={pendingTotal}
        onConfirm={async () => {
          
          if (!selectedGame || !pendingPurchase) return;
          for (const seatId of pendingPurchase) {
            const ticketRes = await fetch(`/api/tickets/game/${selectedGame.id}`);
            const tickets = await ticketRes.json();
            const ticket = tickets.find((t: any) => t.seatNumber === seatId && t.status === "available");
            if (ticket) {
              await fetch(`/api/tickets/${ticket.id}/purchase`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
              });
            }
          }
          queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
        }}
      />
      </div>
    </BackgroundWrapper>
  );
}
