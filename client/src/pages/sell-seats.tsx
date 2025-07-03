import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SellerSeatSelection } from "@/components/seller-seat-selection";
import { type Game } from "@shared/schema";

export default function SellSeats() {
  const [location, setLocation] = useLocation();
  const params = (location as any).params || {};
  const gameId = params.gameId ? Number(params.gameId) : null;
  const [seller, setSeller] = useState<any>(null);

  const { data: games = [] } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  useEffect(() => {
    const stored = localStorage.getItem("sellerUser");
    if (stored) setSeller(JSON.parse(stored));
    else setLocation("/sell");
  }, [setLocation]);

  const game = games.find((g) => g.id === gameId);
  if (!game || !seller) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Select Your Seat(s) to List for {game.homeTeam} vs {game.awayTeam}
      </h1>
      <SellerSeatSelection
        game={game}
        sellerId={seller.id}
        onComplete={() => setLocation("/sell/confirm")}
      />
    </div>
  );
}
