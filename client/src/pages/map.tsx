import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AirbearWheel from "@/components/airbear-wheel";
import LoadingSpinner from "@/components/loading-spinner";
import { supabase } from "@/lib/supabase";
import { 
  MapPin, 
  Navigation, 
  Battery, 
  Store, 
  Clock,
  Users,
  Zap,
  Plus,
  Minus
} from "lucide-react";

declare global {
  interface Window {
    L: any;
  }
}

interface Spot {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  isActive: boolean;
}

interface Airbear {
  id: string;
  latitude: string | null;
  longitude: string | null;
  currentSpotId: string;
  batteryLevel: number;
  isAvailable: boolean;
  isCharging: boolean;
}

export default function Map() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Spot | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [airbears, setAirbears] = useState<Airbear[]>([]);

  const { data: spotsData, isLoading: spotsLoading } = useQuery<Spot[]>({
    queryKey: ["/api/spots"],
  });

  const { isLoading: airbearsLoading } = useQuery<Airbear[]>({
    queryKey: ["/api/airbears/available"],
    onSuccess: (data) => {
      setAirbears(data);
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('airbears')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'airbears' }, (payload) => {
        setAirbears((prevAirbears) => {
          const newAirbear = payload.new as Airbear;
          const index = prevAirbears.findIndex((a) => a.id === newAirbear.id);
          if (index === -1) {
            return [...prevAirbears, newAirbear];
          } else {
            const newAirbears = [...prevAirbears];
            newAirbears[index] = newAirbear;
            return newAirbears;
          }
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const bookRideMutation = useMutation({
    mutationFn: async (rideData: any) => {
      const response = await apiRequest("POST", "/api/rides", rideData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Ride Booked!",
        description: "Your airbear is on the way. You'll receive updates shortly.",
      });
      setShowBookingDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/rides"] });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to book ride. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapReady) return;

    const initMap = () => {
      if (!window.L) {
        // Load Leaflet dynamically
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCSS);
        
        const leafletJS = document.createElement('script');
        leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        leafletJS.onload = () => setTimeout(initMap, 100);
        document.head.appendChild(leafletJS);
        return;
      }

      const map = window.L.map(mapRef.current, {
        center: [42.0987, -75.9179], // Binghamton coordinates
        zoom: 13,
        zoomControl: false,
      });

      // Add custom zoom controls
      const zoomControl = window.L.control.zoom({
        position: 'topright'
      });
      zoomControl.addTo(map);

      // Add tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [mapReady]);

  // Add markers to map
  useEffect(() => {
    if (!mapInstanceRef.current || !spotsData || !airbears) return;

    const map = mapInstanceRef.current;
    
    // Clear existing markers
    map.eachLayer((layer: any) => {
      if (layer instanceof window.L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add airbear markers
    airbears.forEach((airbear: Airbear) => {
      if (!airbear.latitude || !airbear.longitude) return;

      const iconHtml = `
        <div class="relative group cursor-pointer airbear-marker">
          <div class="w-16 h-16 border-4 border-emerald-500 rounded-full animate-pulse-glow shadow-xl shadow-emerald-500/60 bg-gradient-to-br from-white via-emerald-50 to-lime-100 flex items-center justify-center hover:scale-125 transition-all duration-500 group-hover:animate-airbear-bounce relative overflow-hidden">
            <div class="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 via-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 opacity-20 animate-spin-slow"></div>
            <div class="text-2xl animate-airbear-bounce group-hover:animate-spin relative z-10">
              🐻
            </div>
          </div>
        </div>
      `;

      const customIcon = window.L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = window.L.marker(
        [parseFloat(airbear.latitude), parseFloat(airbear.longitude)],
        { icon: customIcon }
      ).addTo(map);

      // Add popup
      const popupContent = `
        <div class="p-4 min-w-[250px] bg-white rounded-lg">
          <div class="flex items-center mb-3">
            <span class="text-2xl mr-2">🐻</span>
            <h3 class="font-bold text-lg text-emerald-700">Airbear #${airbear.id.substring(0, 5)}</h3>
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-between text-sm">
              <span class="flex items-center">
                <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
                Status
              </span>
              <span class="font-semibold text-emerald-600">
                ${airbear.isAvailable ? 'Available' : 'En Route'}
              </span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="flex items-center">
                <Battery className="h-4 w-4 text-green-500 mr-2" />
                Battery
              </span>
              <span class="font-semibold text-emerald-600">
                ${airbear.batteryLevel}%
              </span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
    });

  }, [spotsData, airbears, mapReady]);

  const handleBookRide = () => {
    if (!user || !selectedSpot || !selectedDestination) {
      toast({
        title: "Missing Information",
        description: "Please select both pickup and destination locations.",
        variant: "destructive",
      });
      return;
    }

    const rideData = {
      userId: user.id,
      pickupSpotId: selectedSpot.id,
      destinationSpotId: selectedDestination.id,
      fare: 15.00, // Base fare
    };

    bookRideMutation.mutate(rideData);
  };

  if (spotsLoading || airbearsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading map..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Find Your <span className="text-primary">Perfect Ride</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover all 16 AirBear spots across Binghamton with real-time availability
          </p>
        </motion.div>

        {/* Map Container */}
        <motion.div 
          className="bg-card rounded-2xl p-6 shadow-2xl glass-morphism mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="aspect-video rounded-xl overflow-hidden relative">
            <div 
              ref={mapRef} 
              className="w-full h-full"
              data-testid="map-container"
            />
            
            {/* Real-time Stats Overlay */}
            <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{airbears?.filter(r => r.isAvailable).length || 0} Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                  <span>{airbears?.filter(r => !r.isAvailable && !r.isCharging).length || 0} En Route</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>{airbears?.filter(r => r.isCharging).length || 0} Charging</span>
                </div>
              </div>
            </div>

            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <Button size="sm" variant="secondary" className="w-10 h-10 p-0" data-testid="button-zoom-in">
                <Plus className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary" className="w-10 h-10 p-0" data-testid="button-zoom-out">
                <Minus className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary" className="w-10 h-10 p-0" data-testid="button-center-map">
                <Navigation className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Map Legend */}
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <AirbearWheel size="sm" />
              <span>Available Airbear</span>
            </div>
            <div className="flex items-center space-x-2">
              <Store className="h-4 w-4 text-amber-500" />
              <span>Bodega Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-lime-500" />
              <span>Solar Charging</span>
            </div>
          </div>
        </motion.div>

        {/* Spots List */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {spotsData?.map((spot: Spot, index: number) => {
            const availableAirbears = airbears?.filter(r => r.currentSpotId === spot.id) || [];
            const avgBattery = availableAirbears.length > 0
              ? Math.round(availableAirbears.reduce((sum, r) => sum + r.batteryLevel, 0) / availableAirbears.length)
              : 0;
            
            return (
              <motion.div
                key={spot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="hover-lift glass-morphism cursor-pointer group"
                  onClick={() => {
                    setSelectedSpot(spot);
                    if (availableAirbears.length > 0) {
                      setShowBookingDialog(true);
                    }
                  }}
                  data-testid={`card-spot-${spot.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="truncate">{spot.name}</span>
                      <AirbearWheel
                        size="sm" 
                        animated={availableAirbears.length > 0}
                        className={availableAirbears.length > 0 ? "text-primary" : "text-muted-foreground"}
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Available</span>
                      <Badge 
                        variant={availableAirbears.length > 0 ? "default" : "secondary"}
                        className={availableAirbears.length > 0 ? "bg-green-500" : ""}
                      >
                        {availableAirbears.length} airbear{availableAirbears.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    {availableAirbears.length > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Avg Battery</span>
                          <div className="flex items-center space-x-2">
                            <Battery className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">{avgBattery}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Wait Time</span>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium">~2 min</span>
                          </div>
                        </div>
                      </>
                    )}
                    
                    <Button 
                      size="sm" 
                      className="w-full eco-gradient text-white"
                      disabled={availableAirbears.length === 0}
                      data-testid={`button-book-from-${spot.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {availableAirbears.length > 0 ? "Book Ride" : "No Airbears"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Booking Dialog */}
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogContent className="glass-morphism max-w-md" data-testid="dialog-book-ride">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <AirbearWheel size="sm" className="mr-2" />
                Book Your Ride
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Pickup Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Pickup Location</label>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-primary mr-2" />
                    <span>{selectedSpot?.name}</span>
                  </div>
                </div>
              </div>

              {/* Destination Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Destination</label>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {spotsData?.filter(s => s.id !== selectedSpot?.id).map((spot) => (
                    <div
                      key={spot.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedDestination?.id === spot.id 
                          ? "bg-primary/20 border border-primary" 
                          : "bg-muted/10 hover:bg-muted/20"
                      }`}
                      onClick={() => setSelectedDestination(spot)}
                      data-testid={`option-destination-${spot.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm">{spot.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ride Summary */}
              {selectedDestination && (
                <div className="p-4 bg-muted/10 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base Fare</span>
                    <span>$15.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Distance</span>
                    <span>~2.3 km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Est. Time</span>
                    <span>8-12 min</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total</span>
                    <span>$15.00</span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleBookRide}
                disabled={!selectedDestination || bookRideMutation.isPending}
                className="w-full eco-gradient text-white hover-lift"
                data-testid="button-confirm-booking"
              >
                {bookRideMutation.isPending ? (
                  <div className="flex items-center">
                    <AirbearWheel size="sm" className="mr-2" />
                    Booking...
                  </div>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
