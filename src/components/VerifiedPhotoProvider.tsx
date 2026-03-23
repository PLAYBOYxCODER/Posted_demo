"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type VerifiedPhotoModel = {
  id: string;
  img: string; // Base64 dataURL
  alt: string; // Product name or category
  text: string; // Caption/Review Text
  name: string; // Customer Name
};

type VerifiedPhotoContextType = {
  photos: VerifiedPhotoModel[];
  addPhoto: (photo: VerifiedPhotoModel) => void;
  deletePhoto: (id: string) => void;
};

const VerifiedPhotoContext = createContext<VerifiedPhotoContextType | undefined>(undefined);

const initialMockPhotos: VerifiedPhotoModel[] = [
  {
    id: "VP-1",
    img: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800', 
    alt: 'Living Room Frame',
    text: 'Absolutely stunning quality. The frame is premium and the print is extremely vivid.',
    name: 'Rahul S.'
  },
  {
    id: "VP-2",
    img: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=800', 
    alt: 'Bedroom Frame',
    text: 'Delivery was super fast to Bangalore! The poster looks completely perfect.',
    name: 'Priya M.'
  },
  {
    id: "VP-3",
    img: 'https://images.unsplash.com/photo-1595514535311-6db48ebce267?auto=format&fit=crop&q=80&w=800', 
    alt: 'Gaming Setup',
    text: 'The 300 GSM matte finish blew my mind. Worth every single rupee.',
    name: 'Vikram R.'
  },
  {
    id: "VP-4",
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', 
    alt: 'Studio Space',
    text: '10/10 highly recommend. The retro posters totally transformed my blank wall.',
    name: 'Ananya K.'
  }
];

export function VerifiedPhotoProvider({ children }: { children: React.ReactNode }) {
  const [photos, setPhotos] = useState<VerifiedPhotoModel[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("poster_verified_photos");
    if (stored) {
      try {
        setPhotos(JSON.parse(stored));
      } catch (e) {
        setPhotos(initialMockPhotos);
      }
    } else {
      setPhotos(initialMockPhotos);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("poster_verified_photos", JSON.stringify(photos));
    }
  }, [photos, isLoaded]);

  const addPhoto = (photo: VerifiedPhotoModel) => {
    setPhotos(prev => [photo, ...prev]);
  };

  const deletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  if (!isLoaded) {
    return (
      <VerifiedPhotoContext.Provider value={{ photos: [], addPhoto, deletePhoto }}>
        {children}
      </VerifiedPhotoContext.Provider>
    );
  }

  return (
    <VerifiedPhotoContext.Provider value={{ photos, addPhoto, deletePhoto }}>
      {children}
    </VerifiedPhotoContext.Provider>
  );
}

export function useVerifiedPhotos() {
  const context = useContext(VerifiedPhotoContext);
  if (!context) throw new Error("useVerifiedPhotos must be used within VerifiedPhotoProvider");
  return context;
}
