import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X } from "lucide-react";
import { type Game } from "@shared/schema";

interface GameManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  game?: Game | null;
  mode: "add" | "edit";
}

export function GameManagementModal({
  isOpen,
  onClose,
  game,
  mode,
}: GameManagementModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    homeTeam: "",
    awayTeam: "",
    venue: "",
    date: "",
    status: "upcoming",
  });

  const [gameImage, setGameImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (mode === "edit" && game) {
      setFormData({
        homeTeam: game.homeTeam || "",
        awayTeam: game.awayTeam || "",
        venue: game.venue || "",
        date: game.date
          ? new Date(
              new Date(game.date).getTime() -
                new Date(game.date).getTimezoneOffset() * 60000
            )
              .toISOString()
              .slice(0, 16)
          : "",
        status: game.status || "upcoming",
      });
      setImagePreview(game.image || "");
      setGameImage(null);
    } else if (mode === "add") {
      setFormData({
        homeTeam: "",
        awayTeam: "",
        venue: "",
        date: "",
        status: "upcoming",
      });
      setImagePreview("");
      setGameImage(null);
    }
  }, [game, mode]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGameImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setGameImage(null);
    setImagePreview("");
  };

  const createGameMutation = useMutation({
    mutationFn: async (gameData: any) => {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameData),
      });
      if (!res.ok) throw new Error("Failed to create game");
      return res.json();
    },
    onSuccess: async (createdGame) => {
  queryClient.setQueryData(["/api/games"], (old: Game[] = []) => [
    ...old,
    createdGame,
  ]);

  queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });


  if (createdGame.tickets?.length > 0) {
    queryClient.setQueryData(["tickets", createdGame.id], createdGame.tickets);
  } else {
    await queryClient.prefetchQuery({
      queryKey: ["tickets", createdGame.id],
      queryFn: () =>
        fetch(`/api/tickets/game/${createdGame.id}`).then((res) => res.json()),
    });
  }


  toast({
    title: "Game Added Successfully!",
    description: `${formData.homeTeam} vs ${formData.awayTeam} has been added.`,
  });

      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add game. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateGameMutation = useMutation({
    mutationFn: (gameData: any) =>
      fetch(`/api/games/${game?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameData),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to update game");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });

      toast({
        title: "Game Updated Successfully!",
        description: `${formData.homeTeam} vs ${formData.awayTeam} has been updated.`,
      });

      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update game. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  let imageUrl = "";

  if (gameImage) {
    const form = new FormData();
    form.append("file", gameImage);

    const res = await fetch("/api/upload-cloudinary", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      toast({
        title: "Image upload failed",
        description: "Unable to upload image to Cloudinary.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const result = await res.json();
    imageUrl = result.url;
  }

  const gameData = {
    ...formData,
    image: imageUrl || game?.image || "",
  };

  if (mode === "add") {
    createGameMutation.mutate(gameData, {
      onSettled: () => setIsSubmitting(false),
    });
  } else {
    updateGameMutation.mutate(gameData, {
      onSettled: () => setIsSubmitting(false),
    });
  }
};


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Game" : "Edit Game"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Home and Away Team */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Home Team</Label>
              <Input
                value={formData.homeTeam}
                onChange={(e) => handleInputChange("homeTeam", e.target.value)}
                placeholder="Enter home team"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>Away Team</Label>
              <Input
                value={formData.awayTeam}
                onChange={(e) => handleInputChange("awayTeam", e.target.value)}
                placeholder="Enter away team"
                className="mt-1"
                required
              />
            </div>
          </div>

          {/* Venue */}
          <div>
            <Label>Venue</Label>
            <Input
              value={formData.venue}
              onChange={(e) => handleInputChange("venue", e.target.value)}
              placeholder="Enter venue"
              className="mt-1"
              required
            />
          </div>

          {/* Date and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label>Game Image</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Game preview"
                    className="w-48 h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 p-0"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="text-sm text-gray-500">Upload image</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 seatwell-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
  ? "Saving..."
  : mode === "add"
  ? "Add Game"
  : "Update Game"}

            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
