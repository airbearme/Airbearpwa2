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
import RickshawWheel from "@/components/rickshaw-wheel";
import LoadingSpinner from "@/components/loading-spinner";
import { spots } from "@/lib/spots";
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

interface Rickshaw {
  id: string;
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

  const { data: spotsData, isLoading: spotsLoading } = useQuery<Spot[]>({
    queryKey: ["/api/spots"],
  });

  const { data: rickshaws, isLoading: rickshawsLoading } = useQuery<Rickshaw[]>({
    queryKey: ["/api/rickshaws/available"],
  });

  const bookRideMutation = useMutation({
    mutationFn: async (rideData: any) => {
      const response = await apiRequest("POST", "/api/rides", rideData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Ride Booked!",
        description: "Your rickshaw is on the way. You'll receive updates shortly.",
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
        // Wait for Leaflet to load
        setTimeout(initMap, 100);
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
    if (!mapInstanceRef.current || !spotsData || !rickshaws) return;

    const map = mapInstanceRef.current;
    
    // Clear existing markers
    map.eachLayer((layer: any) => {
      if (layer instanceof window.L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add spot markers
    spotsData.forEach((spot: Spot) => {
      const availableRickshaws = rickshaws.filter(r => r.currentSpotId === spot.id);
      const hasRickshaws = availableRickshaws.length > 0;
      
      // Create custom icon based on availability
      const iconHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-10 h-10 border-3 border-${hasRickshaws ? 'lime-500' : 'gray-400'} rounded-full 
                      ${hasRickshaws ? 'animate-pulse-glow' : ''} bg-white shadow-lg
                      flex items-center justify-center">
            <div class="w-6 h-6 border-2 border-${hasRickshaws ? 'lime-500' : 'gray-400'} rounded-full relative
                        ${hasRickshaws ? 'animate-spin' : ''}">
              <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                          w-3 h-0.5 bg-${hasRickshaws ? 'lime-500' : 'gray-400'}"></div>
              <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90
                          w-3 h-0.5 bg-${hasRickshaws ? 'lime-500' : 'gray-400'}"></div>
            </div>
          </div>
          ${availableRickshaws.length > 0 ? `
            <div class="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full 
                        flex items-center justify-center text-xs font-bold">
              ${availableRickshaws.length}
            </div>
          ` : ''}
        </div>
      `;

      const customIcon = window.L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = window.L.marker(
        [parseFloat(spot.latitude), parseFloat(spot.longitude)], 
        { icon: customIcon }
      ).addTo(map);

      // Add popup
      const popupContent = `
        <div class="p-3 min-w-[200px]">
          <h3 class="font-semibold text-lg mb-2">${spot.name}</h3>
          <div class="space-y-2">
            <div class="flex items-center text-sm">
              <span class="w-3 h-3 rounded-full ${hasRickshaws ? 'bg-green-500' : 'bg-gray-400'} mr-2"></span>
              ${hasRickshaws ? `${availableRickshaws.length} available` : 'No rickshaws'}
            </div>
            ${hasRickshaws ? `
              <button onclick="window.selectSpotForRide('${spot.id}')" 
                      class="w-full mt-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-lime-500 
                             text-white rounded-lg hover:from-emerald-600 hover:to-lime-600 
                             transition-all font-medium">
                Book Ride from Here
              </button>
            ` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
    });

    // Global function for booking
    (window as any).selectSpotForRide = (spotId: string) => {
      const spot = spotsData.find(s => s.id === spotId);
      if (spot) {
        setSelectedSpot(spot);
        setShowBookingDialog(true);
      }
    };

  }, [spotsData, rickshaws, mapReady]);

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

  if (spotsLoading || rickshawsLoading) {
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
                  <span>{rickshaws?.filter(r => r.isAvailable).length || 0} Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                  <span>{rickshaws?.filter(r => !r.isAvailable && !r.isCharging).length || 0} En Route</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>{rickshaws?.filter(r => r.isCharging).length || 0} Charging</span>
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
              <RickshawWheel size="sm" />
              <span>Available Rickshaw</span>
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
            const availableRickshaws = rickshaws?.filter(r => r.currentSpotId === spot.id) || [];
            const avgBattery = availableRickshaws.length > 0 
              ? Math.round(availableRickshaws.reduce((sum, r) => sum + r.batteryLevel, 0) / availableRickshaws.length)
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
                    if (availableRickshaws.length > 0) {
                      setShowBookingDialog(true);
                    }
                  }}
                  data-testid={`card-spot-${spot.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="truncate">{spot.name}</span>
                      <RickshawWheel 
                        size="sm" 
                        animated={availableRickshaws.length > 0}
                        className={availableRickshaws.length > 0 ? "text-primary" : "text-muted-foreground"}
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Available</span>
                      <Badge 
                        variant={availableRickshaws.length > 0 ? "default" : "secondary"}
                        className={availableRickshaws.length > 0 ? "bg-green-500" : ""}
                      >
                        {availableRickshaws.length} rickshaw{availableRickshaws.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    {availableRickshaws.length > 0 && (
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
                      disabled={availableRickshaws.length === 0}
                      data-testid={`button-book-from-${spot.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {availableRickshaws.length > 0 ? "Book Ride" : "No Rickshaws"}
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
                <RickshawWheel size="sm" className="mr-2" />
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
                    <RickshawWheel size="sm" className="mr-2" />
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
