import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  TicketIcon, 
  Users, 
  ArrowUpDown, 
  TrendingUp, 
  RefreshCw,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { TicketListingModal } from "@/components/ticket-listing-modal";
import { AdminLoginModal } from "@/components/admin-login-modal";
import { GameManagementModal } from "@/components/game-management-modal";
import { BackgroundConfig } from "@/components/background-config";
import { BackgroundWrapper } from "@/components/background-wrapper";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminContentEditor from "./admin-content";

export default function Admin() {
  const [lastUpdated] = useState(new Date());
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [gameModalMode, setGameModalMode] = useState<"add" | "edit">("add");
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(true);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 25;

  const queryClient = useQueryClient();

  const deleteGameMutation = useMutation({
    mutationFn: (gameId: number) => 
      fetch(`/api/games/${gameId}`, { method: 'DELETE' }).then(res => {
        if (!res.ok) throw new Error('Failed to delete game');
        return res;
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({
        title: "Game Deleted",
        description: "The game has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete game. Please try again.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    const adminAuth = sessionStorage.getItem("adminAuthenticated");
    if (adminAuth === "true") {
      setIsAuthenticated(true);
      setLoginModalOpen(false);
    }
  }, []);

  const handleAdminLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem("adminAuthenticated", "true");
  };

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ["/api/tickets/all"],
  });

  const { data: games = [] } = useQuery({
    queryKey: ["/api/games"],
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });


  const activeListings = tickets.filter((ticket: any) => ticket.status === "available").length;
  const totalTransactions = transactions.length;
  const totalRevenue = transactions.reduce((sum: number, t: any) => sum + t.amount, 0);

  const getGameName = (gameId: number) => {
    const game = games.find((g: any) => g.id === gameId);
    return game ? `${game.homeTeam} vs ${game.awayTeam}` : "Unknown Game";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      available: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800", 
      sold: "bg-blue-100 text-blue-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    
    return (
      <Badge className={variants[status] || variants.cancelled}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (!isAuthenticated) {
    return (
      <BackgroundWrapper className="flex items-center justify-center">
        <AdminLoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onSuccess={handleAdminLogin}
        />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Access Required</h1>
          <p className="text-gray-600">Please login to access the admin panel.</p>
        </div>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Admin Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Manage tickets, users, and platform activity</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString('en-GB', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          <Button variant="outline" size="sm" onClick={() => {
            toast({ title: "Data refreshed!" });
            window.location.reload();
          }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <TicketIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeListings}</div>
            <p className="text-xs text-green-600 font-medium">
              +12% vs last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-green-600 font-medium">
              +8% vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-green-600 font-medium">
              +24% this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-green-600 font-medium">
              +18% vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Card>
        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid w-full grid-cols-5 gap-2">
            <TabsTrigger value="tickets">Ticket Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="games">Game Schedule</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="content">Website Content</TabsTrigger>
          </TabsList>

          {/* Ticket Management Tab */}
          <TabsContent value="tickets" className="space-y-4">
  <div className="flex justify-between items-center">
    <h2 className="text-xl font-bold text-gray-800">Ticket Listings</h2>
    <div className="flex space-x-2">
      <Button variant="outline" size="sm" onClick={() => toast({ title: "Filter functionality (mock)" })}>
        <Filter className="mr-2 h-4 w-4" />
        Filter
      </Button>
      <Button variant="outline" size="sm" onClick={() => setTicketModalOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Ticket
      </Button>
      <Button variant="outline" size="sm" onClick={() => toast({ title: "Export functionality (mock)" })}>
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
    </div>
  </div>

  {ticketsLoading ? (
    <div className="text-center py-8">Loading tickets...</div>
  ) : (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket ID</TableHead>
            <TableHead>Game</TableHead>
            <TableHead>Seat</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets
            .slice((currentPage - 1) * ticketsPerPage, currentPage * ticketsPerPage)
            .map((ticket: any) => (
              <TableRow key={ticket.id}>
                <TableCell>#{ticket.id.toString().padStart(3, "0")}</TableCell>
                <TableCell>{getGameName(ticket.gameId)}</TableCell>
                <TableCell>{ticket.seatNumber}</TableCell>
                <TableCell>{formatPrice(ticket.price)}</TableCell>
                <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => toast({ title: "Viewing ticket details..." })}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toast({ title: "Edit functionality (mock)" })}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toast({ title: "Ticket removed (mock)", variant: "destructive" })}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>


      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {Math.ceil(tickets.length / ticketsPerPage)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === Math.ceil(tickets.length / ticketsPerPage)}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </>
  )}
</TabsContent>


          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">User Management</h2>
              <Button className="seatwell-primary" onClick={() => toast({ title: "Add user functionality (mock)" })}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any, index: number) => (
                  <TableRow key={user.id}>
                    <TableCell>#{user.id.toString().padStart(3, '0')}</TableCell>
                    <TableCell>{user.username.replace('.', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={
                        user.type === "admin" ? "bg-purple-100 text-purple-800" :
                        user.type === "seller" ? "bg-blue-100 text-blue-800" :
                        "bg-green-100 text-green-800"
                      }>
                        {user.type === "seller" ? "Season Holder" : user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString('en-GB')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => toast({ title: "Viewing user profile..." })}>View</Button>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => toast({ title: "User suspended (mock)", variant: "destructive" })}>Suspend</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Game Schedule Tab */}
          <TabsContent value="games" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Game Schedule</h2>
              <Button className="seatwell-primary" onClick={() => {
                setGameModalMode("add");
                setSelectedGame(null);
                setGameModalOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Game
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game: any) => (
                <Card key={game.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {game.homeTeam} vs {game.awayTeam}
                      </CardTitle>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatDateTime(game.date)}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">{game.venue}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Tickets: {tickets.filter((t: any) => t.gameId === game.id && t.status === "available").length} listed
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => {
                          setGameModalMode("edit");
                          setSelectedGame(game);
                          setGameModalOpen(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-800" 
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${game.homeTeam} vs ${game.awayTeam}?`)) {
                              deleteGameMutation.mutate(game.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
              <Button variant="outline" onClick={() => toast({ title: "Export data functionality (mock)" })}>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction: any) => {
                  const ticket = tickets.find((t: any) => t.id === transaction.ticketId);
                  const gameName = ticket ? getGameName(ticket.gameId) : "Unknown Game";
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>#{transaction.id.toString().padStart(3, '0')}</TableCell>
                      <TableCell>{gameName}</TableCell>
                      <TableCell>{formatPrice(transaction.amount)}</TableCell>
                      <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TabsContent>

          

          {/* Website Content Tab */}
          <TabsContent value="content" className="space-y-4">
  <AdminContentEditor />
</TabsContent>

        </Tabs>
      </Card>

      {/* Ticket Listing Modal */}
      <TicketListingModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
      />

      {/* Game Management Modal */}
      <GameManagementModal
        isOpen={gameModalOpen}
        onClose={() => setGameModalOpen(false)}
        game={selectedGame}
        mode={gameModalMode}
      />
      </div>
    </BackgroundWrapper>
  );
}
