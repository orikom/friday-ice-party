"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Play, Image as ImageIcon } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  videoUrl: string | null;
  category: string | null;
  event: {
    id: string;
    title: string;
    shortCode: string;
  } | null;
  uploadedBy: {
    id: string;
    name: string | null;
  };
  createdAt: string;
}

export default function GalleryPage() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    if (status === "authenticated") {
      fetchGallery();
    }
  }, [status, selectedCategory]);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.set("category", selectedCategory);
      }
      const response = await fetch(`/api/gallery?${params.toString()}`);
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = Array.from(
    new Set(items.map((item) => item.category).filter(Boolean))
  ).sort();

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">טוען...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">גלריה</h1>
          <p className="text-gray-600">תמונות וסרטונים מאירועי הקהילה</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">
              הגלריה זמינה לחברים רשומים בלבד
            </p>
            <Link href="/auth/signin">
              <Button>התחבר</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">גלריה</h1>
        <p className="text-gray-600">תמונות וסרטונים מאירועי הקהילה</p>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            הכל
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">טוען גלריה...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">אין פריטים בגלריה עדיין.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative h-64 w-full">
                {item.videoUrl ? (
                  <div className="relative h-full w-full bg-gray-200 flex items-center justify-center">
                    <video
                      src={item.videoUrl}
                      className="h-full w-full object-cover"
                      controls
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary">
                        <Play className="h-3 w-3 mr-1" />
                        סרטון
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <>
                    <Image
                      src={item.imageUrl}
                      alt={item.title || "Gallery item"}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        תמונה
                      </Badge>
                    </div>
                  </>
                )}
              </div>
              <CardHeader>
                {item.title && (
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                )}
                {item.category && (
                  <CardDescription>
                    <Badge variant="outline">{item.category}</Badge>
                  </CardDescription>
                )}
                {item.event && (
                  <CardDescription>
                    <Link
                      href={`/events/${item.event.shortCode}`}
                      className="text-blue-600 hover:underline"
                    >
                      מאירוע: {item.event.title}
                    </Link>
                  </CardDescription>
                )}
              </CardHeader>
              {item.description && (
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

