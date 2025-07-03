import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game-card";
import { useQuery } from "@tanstack/react-query";
import { type Game } from "@shared/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

export default function Home() {
  const { data: games = [], isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ["/api/tickets"],
  });

  const [siteContent, setSiteContent] = useState<any>({});

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        const map: Record<string, string> = {};
        data.forEach((item: any) => {
          map[item.key] = item.value;
        });
        setSiteContent(map);
      });
  }, []);

  const getTicketStatus = (gameId: number) => {
    const gameTickets = tickets.filter(
      (ticket: any) => ticket.gameId === gameId && ticket.status === "available"
    );

    if (gameTickets.length === 0) return "none";
    if (gameTickets.length <= 100) return "few-left";
    return "available";
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/images/homepage-background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">

        {/* Hero Section */}
        <div className="text-center mb-16 animate-slide-up-fade">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Seatwell: Get Your Seat and Game on!
          </h1>
          <p className="text-xl text-white/90 mb-4">
            Do you want to attend a game but it is sold out? We got you covered!
          </p>
          <p className="text-lg text-white/80 mb-8">
            Resell or buy tickets here
          </p>
          <p className="text-white/90 max-w-2xl mx-auto mb-12">
            We believe in sharing value. Our platform ensures that every empty seat becomes an opportunity for someone to feel good, fans smiling to buyer.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/buy">
              <Button
                size="lg"
                className="bg-gray-800 text-white px-8 py-4 text-lg hover:bg-gray-900"
              >
                Buy a Ticket
              </Button>
            </Link>
            <Link href="/sell">
              <Button
                size="lg"
                variant="outline"
                className="seatwell-secondary px-8 py-4 text-lg"
              >
                Sell a Ticket
              </Button>
            </Link>
          </div>
        </div>

        {/* Games Section */}
        <div className="mb-16 animate-slide-up-fade">
          <h2 className="text-5xl font-bold text-white/50 text-center mb-12">
            GAMES ON THE HORIZON
          </h2>

          {isLoading ? (
            <div className="text-center text-white">Loading games...</div>
          ) : (
            <>
              {games.length > 0 && (
                <div className="flex justify-center mb-8 animate-slide-up-fade">
                  <div className="w-64">
                    <Link href="/buy">
                      <GameCard
                        game={games[0]}
                        ticketStatus={getTicketStatus(games[0].id)}
                        className="transform hover:scale-105 transition-transform"
                      />
                    </Link>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {games.slice(1).map((game) => (
                  <Link key={game.id} href="/buy">
                    <GameCard
                      game={game}
                      ticketStatus={getTicketStatus(game.id)}
                      className="animate-slide-up-fade"
                    />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* About Us */}
        <div className="mb-16 animate-slide-up-fade">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              {siteContent.about_title || "About Us"}
            </h2>
            <div
              className="text-white/90 text-lg leading-relaxed text-center font-sans [&>*]:mb-4"
              dangerouslySetInnerHTML={{
                __html:
                  siteContent.about_description ||
                  "<p>Seatwell is a Swiss startup revolutionizing the sports ticket marketplace...</p>",
              }}
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16 animate-slide-up-fade">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {(siteContent.faq ? JSON.parse(siteContent.faq) : []).map(
                    (item: any, index: number) => (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border-white/20"
                      >
                        <AccordionTrigger className="text-white hover:text-white/80 text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-white/90">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    )
                  )}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
