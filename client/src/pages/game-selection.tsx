import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { EnhancedSeatSelection } from "@/components/enhanced-seat-selection";
import { type Game } from "@shared/schema";

export default function GameSelection() {
  const [, setLocation] = useLocation();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [seatSelectionOpen, setSeatSelectionOpen] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const { data: games = [], isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const sortedGames = games.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handleSell = (game: Game) => {
    setSelectedGame(game);
    setSeatSelectionOpen(true);
  };

  const handleSeatSelection = (seatIds: string[]) => {
    setSelectedSeats(seatIds);
    setSeatSelectionOpen(false);
    localStorage.setItem("sellSelectedGame", JSON.stringify(selectedGame));
    localStorage.setItem("sellSelectedSeats", JSON.stringify(seatIds));
    setLocation("/sell/confirm");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Choose the game you cannot attend
        </h1>
        <div className="text-sm text-gray-600 space-y-1">
          <div>1. Select the game you cannot attend</div>
          <div>2. Select your seat(s) to list</div>
          <div>3. Confirm and list your ticket(s)</div>
        </div>
      </div>
      {isLoading ? (
        <div className="text-center">Loading games...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {sortedGames.map((game) => (
            <div
              key={game.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="p-8 flex items-center justify-between">
                <div className="flex items-center flex-grow">
                  {game.image ? (
                    <img
                      src={game.image}
                      alt={`${game.homeTeam} vs ${game.awayTeam}`}
                      className="w-24 h-24 object-cover rounded-lg mr-6 border"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-blue-600 rounded-lg text-white font-bold text-sm flex flex-col items-center justify-center mr-6 px-2 text-center">
                      {game.homeTeam}
                      <span className="text-white/80 text-xs">vs</span>
                      {game.awayTeam}
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-500">Date</div>
                    <div className="font-semibold text-gray-800">
                      {new Date(game.date).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {game.homeTeam} vs {game.awayTeam}
                    </div>
                    <div className="text-sm text-gray-500">
                      Location: {game.venue}
                    </div>
                  </div>
                </div>
                <div>
                  <Button
                    onClick={() => handleSell(game)}
                    className="px-6 py-3 text-base rounded-lg font-medium transition-colors flex items-center bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <span>Sell for this game</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <EnhancedSeatSelection
        isOpen={seatSelectionOpen}
        onClose={() => setSeatSelectionOpen(false)}
        game={selectedGame}
        onAction={handleSeatSelection}
        mode="seller"
      />
    </div>
  );
}
