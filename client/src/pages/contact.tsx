import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Mail, Phone, MapPin, User } from "lucide-react";
import { Link } from "wouter";
import { BackgroundWrapper } from "@/components/background-wrapper";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  useEffect(() => {
    fetch("/api/content")
      .then(res => res.json())
      .then(data => {
        const map: Record<string, string> = {};
        data.forEach((item: any) => {
          map[item.key] = item.value;
        });
        setSiteContent(map);
        setIsLoadingContent(false);
      });
  }, []);

  const contactMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
    },
    onSuccess: () => {
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
      });
      setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <BackgroundWrapper>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-white mb-4">Get in touch with the Seatwell team</p>
          <p className="text-white">
            Have questions about buying or selling tickets? Need support with your account? We're here to help you make the most of your sports experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your name"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => handleInputChange("subject", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                    <SelectItem value="Technical Support">Technical Support</SelectItem>
                    <SelectItem value="Partnership">Partnership</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Your message here..."
                  required
                  className="mt-1"
                />
              </div>
              <Button
                type="submit"
                className="w-full seatwell-primary"
                disabled={contactMutation.isPending}
              >
                {contactMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in touch</h2>

            {!isLoadingContent && (
              <div className="space-y-6">
                {siteContent.contact_email && (
                  <div className="flex items-start">
                    <Mail className="text-blue-600 text-xl mr-4 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Email</h3>
                      <p className="text-gray-600">{siteContent.contact_email}</p>
                    </div>
                  </div>
                )}

                {siteContent.contact_phone && (
                  <div className="flex items-start">
                    <Phone className="text-blue-600 text-xl mr-4 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Phone</h3>
                      <p className="text-gray-600">{siteContent.contact_phone}</p>
                      <p className="text-sm text-gray-500">(WhatsApp/Signal)</p>
                    </div>
                  </div>
                )}

                {siteContent.contact_location && (
                  <div className="flex items-start">
                    <MapPin className="text-blue-600 text-xl mr-4 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Location</h3>
                      <p className="text-gray-600">{siteContent.contact_location}</p>
                    </div>
                  </div>
                )}

                {siteContent.contact_person && (
                  <div className="flex items-start">
                    <User className="text-blue-600 text-xl mr-4 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Contact Person</h3>
                      <p className="text-gray-600">{siteContent.contact_person}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Links */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/buy">
                  <Button variant="ghost" className="w-full justify-start text-blue-600 hover:bg-blue-50">
                    Browse Available Tickets
                  </Button>
                </Link>
                <Link href="/sell">
                  <Button variant="ghost" className="w-full justify-start text-blue-600 hover:bg-blue-50">
                    List Your Tickets
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
}
