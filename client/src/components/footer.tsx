import { Link } from "wouter";
import { Twitter, Facebook, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black/90 backdrop-blur-sm border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="mb-4">
            <Link href="/">
              <button className="text-2xl font-bold text-white hover:text-blue-400 transition-colors">
                Seatwell
              </button>
            </Link>
          </div>
          <p className="text-gray-300 text-sm">
            Making every empty seat an opportunity. Connecting sports fans across Switzerland.
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-400">
              © 2025 Seatwell. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
