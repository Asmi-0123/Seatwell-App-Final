import { ReactNode, useState, useEffect } from "react";

interface BackgroundWrapperProps {
  children: ReactNode;
  className?: string;
  useHomepageBackground?: boolean;
  imageUrl?: string;
}

export function BackgroundWrapper({
  children,
  className = "",
  useHomepageBackground = false,
  imageUrl,
}: BackgroundWrapperProps) {
  const fallbackImage = "/images/homepage-background.png";
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    const primary = imageUrl || fallbackImage;

    img.src = primary;

    img.onload = () => {
      setBackgroundUrl(primary);
      setIsImageLoaded(true);
    };

    img.onerror = () => {
      setBackgroundUrl(null);
      setIsImageLoaded(false);
    };
  }, [imageUrl]);

  const backgroundStyle = backgroundUrl
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundColor: "#000",
        transition: "opacity 1s ease-in-out",
        opacity: isImageLoaded ? 1 : 0,
      }
    : {
        backgroundColor: "#000",
        transition: "opacity 0.3s ease-in-out",
        opacity: 1,
      };

  return (
    <div className={`min-h-screen ${className}`} style={backgroundStyle}>
      {children}
    </div>
  );
}
