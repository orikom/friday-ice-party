"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MapPin, Phone, Globe, Instagram, Linkedin, Star } from "lucide-react";
import Link from "next/link";

interface Business {
  id: string;
  name: string;
  description: string | null;
  category: string;
  imageUrl: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  isRecommended: boolean;
  owner: {
    id: string;
    name: string | null;
  };
}

export default function BusinessPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async (category: string = "all", query: string = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "all") {
        params.set("category", category);
      }
      if (query) {
        params.set("query", query);
      }
      const response = await fetch(`/api/business?${params.toString()}`);
      const data = await response.json();
      setBusinesses(data.businesses || []);
    } catch (error) {
      console.error("Failed to fetch businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBusinesses(selectedCategory, searchQuery);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchBusinesses(category, searchQuery);
  };

  // Get unique categories
  const categories = Array.from(
    new Set(businesses.map((b) => b.category))
  ).sort();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">אזור עסקים</h1>
        <p className="text-gray-600">
          גלה עסקים ובעלי מקצוע מתוך הקהילה
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="חפש לפי שם או מקצוע..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
              <Button type="submit">חפש</Button>
              {searchQuery && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    fetchBusinesses(selectedCategory, "");
                  }}
                >
                  נקה
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange("all")}
              >
                הכל
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">טוען עסקים...</p>
        </div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">לא נמצאו עסקים.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <Card key={business.id} className="relative">
              {business.isRecommended && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    מומלץ
                  </Badge>
                </div>
              )}
              {business.imageUrl && (
                <div className="relative h-48 w-full">
                  <Image
                    src={business.imageUrl}
                    alt={business.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{business.name}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary">{business.category}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {business.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {business.description}
                  </p>
                )}
                <div className="space-y-2 text-sm">
                  {business.city && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {business.city}
                      {business.address && `, ${business.address}`}
                    </div>
                  )}
                  {business.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a
                        href={`tel:${business.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {business.phone}
                      </a>
                    </div>
                  )}
                  {business.email && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">✉</span>
                      <a
                        href={`mailto:${business.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {business.email}
                      </a>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    {business.website && (
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                    {business.instagramUrl && (
                      <a
                        href={business.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                    {business.linkedinUrl && (
                      <a
                        href={business.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

