import { type Game } from "@shared/schema";
import { formatDate, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface GameCardProps {
  game: Game;
  ticketCount?: number;
  ticketStatus?: "available" | "few-left" | "sold-out" | "none";
  onClick?: () => void;
  showStatus?: boolean;
  className?: string;
}

export function GameCard({
  game,
  ticketCount = 0,
  ticketStatus = "none",
  onClick,
  showStatus = true,
  className = "",
}: GameCardProps) {
  const getStatusBadge = () => {
    switch (ticketStatus) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Tickets Available</Badge>;
      case "few-left":
        return <Badge className="bg-yellow-100 text-yellow-800">Few Left</Badge>;
      case "sold-out":
        return <Badge className="bg-red-100 text-red-800">Sold Out</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-600">No Tickets Yet</Badge>;
    }
  };

  const getTeamColors = (homeTeam: string) => {
    const colors: Record<string, string> = {
      "HC Davos": "bg-blue-600",
      "SC Bern": "bg-red-600",
      "Fribourg-Gottéron": "bg-gray-600",
      "ZSC Lions": "bg-green-600",
      "HC Ambri-Piotta": "bg-purple-600",
    };
    return colors[homeTeam] || "bg-blue-600";
  };

  const isClickable = ticketStatus === "available" || ticketStatus === "few-left";

  return (
    <div
  className={`min-h-[290px] bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow ${
    isClickable ? "cursor-pointer" : "opacity-75 cursor-not-allowed"
  } ${className}`}

      onClick={isClickable ? onClick : undefined}
    >
      <div className="p-4">
        {/* Image or fallback */}
        {game.image ? (
          <img
            src={game.image}
            alt={`${game.homeTeam} vs ${game.awayTeam}`}
            className="w-28 h-28 rounded-full object-cover mx-auto mb-4"
          />
        ) : (
          <div
            className={`w-28 h-28 ${getTeamColors(game.homeTeam)} rounded-full mx-auto mb-4 flex items-center justify-center`}
          >
            <div className="text-white text-center text-sm font-semibold leading-tight">
              {game.homeTeam.split(" ").map((word, idx) => (
                <div key={`home-${idx}`}>{word}</div>
              ))}
              <div className="text-xs opacity-75 my-0.5">vs</div>
              {game.awayTeam.split(" ").map((word, idx) => (
                <div key={`away-${idx}`}>{word}</div>
              ))}
            </div>
          </div>
        )}

        {/* Team Names */}
        <div className="text-center font-semibold text-gray-800 text-sm mb-1">
          {game.homeTeam} <span className="text-gray-500">vs</span> {game.awayTeam}
        </div>

        {/* Game Info */}
        <div className="text-center text-sm text-gray-700">
          <div className="text-gray-600">{formatDate(game.date)}</div>
          <div className="text-xs text-gray-500">{formatTime(game.date)}</div>
          <div className="text-xs text-gray-500">{game.venue}</div>

          {/* Status Badge */}
          {showStatus && (
            <div className="mt-2">
              {getStatusBadge()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
