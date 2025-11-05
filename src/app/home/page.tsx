"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Camera, TrendingUp, Users, Image as ImageIcon, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Photo {
  id: string;
  name: string;
  price: number;
  event_id: string;
  preview_url: string;
  created_at: string;
  sold: boolean;
  height: number;
  event: {
    id: string;
    name: string;
    photographer_id: string;
  };
  photographer: {
    id: string;
    full_name: string;
  };
}

interface Event {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  created_at: string;
  photographer_id: string;
  photo_count?: number;
}

const mockPhotos: Photo[] = [
  {
    id: "1",
    name: "IMG_001_John_Jane.jpg",
    price: 50000,
    event_id: "1",
    preview_url: "https://picsum.photos/seed/wedding1/400/500",
    created_at: "2025-01-10",
    sold: false,
    height: 500,
    event: { id: "1", name: "Wedding John & Jane", photographer_id: "admin" },
    photographer: { id: "admin", full_name: "Admin Photographer" },
  },
  {
    id: "2",
    name: "IMG_002_John_Jane.jpg",
    price: 50000,
    event_id: "1",
    preview_url: "https://picsum.photos/seed/wedding2/400/300",
    created_at: "2025-01-10",
    sold: false,
    height: 300,
    event: { id: "1", name: "Wedding John & Jane", photographer_id: "admin" },
    photographer: { id: "admin", full_name: "Admin Photographer" },
  },
  {
    id: "3",
    name: "IMG_003_Corporate.jpg",
    price: 75000,
    event_id: "2",
    preview_url: "https://picsum.photos/seed/corporate1/400/600",
    created_at: "2025-01-12",
    sold: false,
    height: 600,
    event: { id: "2", name: "Corporate Annual Meeting 2024", photographer_id: "admin" },
    photographer: { id: "admin", full_name: "Admin Photographer" },
  },
  {
    id: "4",
    name: "IMG_004_Corporate.jpg",
    price: 75000,
    event_id: "2",
    preview_url: "https://picsum.photos/seed/corporate2/400/400",
    created_at: "2025-01-12",
    sold: false,
    height: 400,
    event: { id: "2", name: "Corporate Annual Meeting 2024", photographer_id: "admin" },
    photographer: { id: "admin", full_name: "Admin Photographer" },
  },
  {
    id: "5",
    name: "IMG_005_Birthday.jpg",
    price: 35000,
    event_id: "3",
    preview_url: "https://picsum.photos/seed/birthday1/400/350",
    created_at: "2025-01-14",
    sold: false,
    height: 350,
    event: { id: "3", name: "Birthday Party - Sarah", photographer_id: "admin" },
    photographer: { id: "admin", full_name: "Admin Photographer" },
  },
  {
    id: "6",
    name: "IMG_006_Birthday.jpg",
    price: 35000,
    event_id: "3",
    preview_url: "https://picsum.photos/seed/birthday2/400/550",
    created_at: "2025-01-14",
    sold: false,
    height: 550,
    event: { id: "3", name: "Birthday Party - Sarah", photographer_id: "admin" },
    photographer: { id: "admin", full_name: "Admin Photographer" },
  },
  {
    id: "7",
    name: "IMG_007_Concert.jpg",
    price: 60000,
    event_id: "1",
    preview_url: "https://picsum.photos/seed/concert1/400/450",
    created_at: "2025-01-16",
    sold: false,
    height: 450,
    event: { id: "1", name: "Wedding John & Jane", photographer_id: "admin" },
    photographer: { id: "admin", full_name: "Admin Photographer" },
  },
  {
    id: "8",
    name: "IMG_008_Graduation.jpg",
    price: 45000,
    event_id: "2",
    preview_url: "https://picsum.photos/seed/graduation1/400/520",
    created_at: "2025-01-18",
    sold: false,
    height: 520,
    event: { id: "2", name: "Corporate Annual Meeting 2024", photographer_id: "admin" },
    photographer: { id: "admin", full_name: "Admin Photographer" },
  },
  {
    id: "9",
    name: "IMG_009_Portrait.jpg",
    price: 55000,
    event_id: "3",
    preview_url: "https://picsum.photos/seed/portrait1/400/340",
    created_at: "2025-01-20",
    sold: false,
    height: 340,
    event: { id: "3", name: "Birthday Party - Sarah", photographer_id: "admin" },
    photographer: { id: "admin", full_name: "Admin Photographer" },
  },
  {
    id: "10",
    name: "IMG_010_Landscape.jpg",
    price: 40000,
    event_id: "1",
    preview_url: "https://picsum.photos/seed/nature1/400/280",
    created_at: "2025-01-22",
    sold: false,
    height: 280,
    event: { id: "1", name: "Wedding John & Jane", photographer_id: "admin" },
    photographer: { id: "admin", full_name: "Admin Photographer" },
  },
  {
    id: "11",
    name: "IMG_011_Food.jpg",
    price: 40000,
    event_id: "2",
    preview_url: "https://picsum.photos/seed/food1/400/560",
    created_at: "2025-01-22",
    sold: false,
    height: 560,
    event: { id: "2", name: "Corporate Annual Meeting 2024", photographer_id: "admin" },
    photographer: { id: "admin", full_name: "Admin Photographer" },
  },
  {
    id: "12",
    name: "IMG_012_Fashion.jpg",
    price: 65000,
    event_id: "3",
    preview_url: "https://picsum.photos/seed/fashion1/400/620",
    created_at: "2025-01-24",
    sold: false,
    height: 620,
    event: { id: "3", name: "Birthday Party - Sarah", photographer_id: "admin" },
    photographer: { id: "admin", full_name: "Admin Photographer" },
  },
];

const mockEvents: Event[] = [
  { id: "1", name: "Wedding", description: "Wedding events", event_date: "2025-01-10", created_at: "2024-10-15", photographer_id: "admin", photo_count: 4 },
  { id: "2", name: "Corporate", description: "Corporate events", event_date: "2025-01-12", created_at: "2024-10-10", photographer_id: "admin", photo_count: 2 },
  { id: "3", name: "Birthday", description: "Birthday events", event_date: "2025-01-14", created_at: "2024-10-05", photographer_id: "admin", photo_count: 2 },
];

export default function HomePage() {
  const [photos] = useState<Photo[]>(mockPhotos);
  const [events] = useState<Event[]>(mockEvents);
  const [filterEvent, setFilterEvent] = useState<string>("all");
  const [isMounted, setIsMounted] = useState(false);
  const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const photosPerPage = 6;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter photos based on selected event
  const filteredPhotos = photos.filter((photo) => {
    if (filterEvent !== "all" && photo.event_id !== filterEvent) return false;
    return true;
  });

  // Load initial photos
  useEffect(() => {
    if (isMounted) {
      const initialPhotos = filteredPhotos.slice(0, photosPerPage);
      setDisplayedPhotos(initialPhotos);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEvent, isMounted]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (loading) return;
      
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Load more when user scrolls to 80% of page
      if (scrollTop + windowHeight >= documentHeight * 0.8) {
        loadMorePhotos();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, page, filterEvent]);

  const loadMorePhotos = () => {
    if (loading) return;
    
    const startIndex = page * photosPerPage;
    const endIndex = startIndex + photosPerPage;
    const newPhotos = filteredPhotos.slice(startIndex, endIndex);
    
    if (newPhotos.length === 0) return;
    
    setLoading(true);
    
    // Simulate loading delay like Pinterest
    setTimeout(() => {
      setDisplayedPhotos(prev => {
        // Deduplicate: filter out photos that already exist
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNewPhotos = newPhotos.filter(p => !existingIds.has(p.id));
        return [...prev, ...uniqueNewPhotos];
      });
      setPage(prev => prev + 1);
      setLoading(false);
    }, 500);
  };

  const filterEvents = [
    { id: "all", name: "All", count: photos.length },
    ...events.map(event => ({
      id: event.id,
      name: event.name,
      count: photos.filter(p => p.event_id === event.id).length,
    })),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 -z-10" />
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4">
              Discover Your Perfect
              <span className="block text-[#48CAE4] mt-1">Photo Moments</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600">
              Browse thousands of professional event photos
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        {isMounted && (
          <>
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {displayedPhotos.map((photo, index) => (
                <div 
                  key={`${photo.id}-${index}`}
                  className="break-inside-avoid mb-4 group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-lg bg-slate-100">
                    <img
                      src={photo.preview_url}
                      alt={photo.name}
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-[#48CAE4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-[#48CAE4] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-[#48CAE4] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Footer Section */}
      <footer className="bg-slate-900 text-slate-300 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* About Section */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-4">About Soraroid</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                Soraroid adalah platform marketplace foto profesional yang menghubungkan fotografer 
                dengan para pencari momen berharga mereka. Kami menyediakan solusi mudah untuk menjual 
                dan membeli foto berkualitas tinggi dari berbagai event seperti pernikahan, ulang tahun, 
                acara korporat, dan banyak lagi.
              </p>
              <p className="text-slate-400 leading-relaxed mb-4">
                Dengan sistem yang aman dan mudah digunakan, fotografer dapat mengunggah dan mengelola 
                koleksi foto mereka, sementara pembeli dapat dengan mudah menemukan dan membeli foto 
                mereka secara instant dengan harga yang terjangkau.
              </p>
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#48CAE4]/100" />
                  <span className="text-sm">Professional Quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#48CAE4]/100" />
                  <span className="text-sm">Instant Download</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#48CAE4]/100" />
                  <span className="text-sm">Secure Payment</span>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#48CAE4]/100 mt-1" />
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="text-white">soramula@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#48CAE4]/100 mt-1" />
                  <div>
                    <p className="text-sm text-slate-400">Phone</p>
                    <p className="text-white">+62 852-8722-9898</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#48CAE4]/100 mt-1" />
                  <div>
                    <p className="text-sm text-slate-400">Address</p>
                    <p className="text-white">Cimahi, Indonesia</p>
                  </div>
                </div>
                <Link
                  href="https://wa.me/6285287229898"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block pt-3"
                >
                  <Button className="bg-[#48CAE4] hover:bg-[#3AAFCE] text-white">
                    Chat via WhatsApp
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p className="text-slate-500 text-sm uppercase tracking-wide">
              2025 Soramula. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


