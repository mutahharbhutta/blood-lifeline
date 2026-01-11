import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { lahoreAreas, getAreaName, roadNetwork, getArea } from '@/lib/bloodData';
import { useBlood } from '@/context/BloodContext';
import { Donor } from '@/lib/bloodData';

interface AnimatedRouteMapProps {
  highlightedRoute?: string[];
  selectedArea?: string;
  onAreaSelect?: (areaId: string) => void;
  animateRoute?: boolean;
  matchedDonor?: Donor;
  hospitalArea?: string;
}

export function AnimatedRouteMap({ 
  highlightedRoute, 
  selectedArea, 
  onAreaSelect,
  animateRoute = true,
  matchedDonor,
  hospitalArea
}: AnimatedRouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLinesRef = useRef<L.Polyline[]>([]);
  const animatedLinesRef = useRef<L.Polyline[]>([]);
  const animationRef = useRef<number | null>(null);
  const { donors } = useBlood();
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [31.5204, 74.3287],
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Animate route when highlightedRoute changes
  useEffect(() => {
    if (!highlightedRoute || highlightedRoute.length < 2 || !animateRoute) {
      setCurrentRouteIndex(0);
      return;
    }

    setCurrentRouteIndex(0);
    
    const animateNextSegment = (index: number) => {
      if (index >= highlightedRoute.length - 1) {
        // Animation complete, show full route
        setCurrentRouteIndex(highlightedRoute.length);
        return;
      }

      setCurrentRouteIndex(index + 1);
      
      animationRef.current = window.setTimeout(() => {
        animateNextSegment(index + 1);
      }, 600) as unknown as number;
    };

    // Start animation after a short delay
    const startTimer = setTimeout(() => {
      animateNextSegment(0);
    }, 300);

    return () => {
      clearTimeout(startTimer);
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [highlightedRoute, animateRoute]);

  // Update markers and routes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    routeLinesRef.current.forEach(line => line.remove());
    routeLinesRef.current = [];
    animatedLinesRef.current.forEach(line => line.remove());
    animatedLinesRef.current = [];

    // Add area markers
    lahoreAreas.forEach(area => {
      const areaDonors = donors.filter(d => d.area === area.id);
      const availableDonors = areaDonors.filter(d => d.isAvailable);
      
      const isSelected = selectedArea === area.id;
      const hasAvailable = availableDonors.length > 0;
      const isInRoute = highlightedRoute?.includes(area.name);

      const iconHtml = `
        <div class="custom-marker ${hasAvailable ? 'marker-available' : 'marker-unavailable'} ${isInRoute ? 'marker-in-route' : ''}" 
             style="${isSelected ? 'transform: scale(1.3); box-shadow: 0 0 20px rgba(0,0,0,0.4);' : ''}
                    ${isInRoute ? 'animation: pulse 1s ease-in-out infinite;' : ''}">
          ${availableDonors.length}
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        className: 'custom-marker-container',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([area.lat, area.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 150px;">
            <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${area.name}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 4px;">Total Donors: ${areaDonors.length}</p>
            <p style="font-size: 12px; color: ${hasAvailable ? '#16a34a' : '#dc2626'};">
              Available: ${availableDonors.length}
            </p>
          </div>
        `);

      if (onAreaSelect) {
        marker.on('click', () => onAreaSelect(area.id));
      }

      markersRef.current.push(marker);
    });

    // Draw road network (background)
    Object.entries(roadNetwork).forEach(([from, connections]) => {
      const fromArea = lahoreAreas.find(a => a.id === from);
      if (!fromArea) return;

      Object.keys(connections).forEach(to => {
        const toArea = lahoreAreas.find(a => a.id === to);
        if (!toArea) return;

        const line = L.polyline(
          [[fromArea.lat, fromArea.lng], [toArea.lat, toArea.lng]],
          {
            color: '#94a3b8',
            weight: 1.5,
            opacity: 0.3,
            dashArray: '5, 5',
          }
        ).addTo(map);

        routeLinesRef.current.push(line);
      });
    });

    // Draw animated route
    if (highlightedRoute && highlightedRoute.length >= 2 && animateRoute) {
      const routeAreaIds = highlightedRoute.map(name => 
        lahoreAreas.find(a => a.name === name)?.id
      ).filter(Boolean);

      for (let i = 0; i < Math.min(currentRouteIndex, routeAreaIds.length - 1); i++) {
        const fromArea = getArea(routeAreaIds[i]!);
        const toArea = getArea(routeAreaIds[i + 1]!);
        
        if (fromArea && toArea) {
          // Animated segment
          const animatedLine = L.polyline(
            [[fromArea.lat, fromArea.lng], [toArea.lat, toArea.lng]],
            {
              color: '#b91c1c',
              weight: 5,
              opacity: 1,
              className: 'animated-route-segment',
            }
          ).addTo(map);

          animatedLinesRef.current.push(animatedLine);

          // Add a pulsing circle at the destination
          if (i === currentRouteIndex - 1) {
            const pulsingIcon = L.divIcon({
              html: `<div class="route-pulse-marker"></div>`,
              className: 'route-pulse-container',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            });

            const pulseMarker = L.marker([toArea.lat, toArea.lng], { icon: pulsingIcon }).addTo(map);
            markersRef.current.push(pulseMarker);
          }
        }
      }
    } else if (highlightedRoute && !animateRoute) {
      // Static route display
      const routeAreaIds = highlightedRoute.map(name => 
        lahoreAreas.find(a => a.name === name)?.id
      ).filter(Boolean);

      for (let i = 0; i < routeAreaIds.length - 1; i++) {
        const fromArea = getArea(routeAreaIds[i]!);
        const toArea = getArea(routeAreaIds[i + 1]!);
        
        if (fromArea && toArea) {
          const line = L.polyline(
            [[fromArea.lat, fromArea.lng], [toArea.lat, toArea.lng]],
            {
              color: '#b91c1c',
              weight: 5,
              opacity: 1,
            }
          ).addTo(map);

          animatedLinesRef.current.push(line);
        }
      }
    }

    // Add special markers for hospital and matched donor
    if (matchedDonor && hospitalArea) {
      const hospitalAreaData = lahoreAreas.find(a => a.id === hospitalArea);
      const donorAreaData = lahoreAreas.find(a => a.id === matchedDonor.area);

      if (hospitalAreaData) {
        const hospitalIcon = L.divIcon({
          html: `
            <div class="hospital-marker">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 21h18"></path>
                <path d="M5 21V7l8-4v18"></path>
                <path d="M19 21V11l-6-4"></path>
                <path d="M9 9v.01"></path>
                <path d="M9 12v.01"></path>
                <path d="M9 15v.01"></path>
                <path d="M9 18v.01"></path>
              </svg>
            </div>
          `,
          className: 'hospital-marker-container',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const hospitalMarker = L.marker([hospitalAreaData.lat, hospitalAreaData.lng], { icon: hospitalIcon })
          .addTo(map)
          .bindPopup(`<strong>Hospital Location</strong><br/>${getAreaName(hospitalArea)}`);
        markersRef.current.push(hospitalMarker);
      }

      if (donorAreaData) {
        const donorIcon = L.divIcon({
          html: `
            <div class="donor-marker">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
              </svg>
            </div>
          `,
          className: 'donor-marker-container',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const donorMarker = L.marker([donorAreaData.lat, donorAreaData.lng], { icon: donorIcon })
          .addTo(map)
          .bindPopup(`<strong>Matched Donor: ${matchedDonor.name}</strong><br/>Blood Type: ${matchedDonor.bloodType}<br/>${getAreaName(matchedDonor.area)}`);
        markersRef.current.push(donorMarker);
      }
    }
  }, [donors, selectedArea, highlightedRoute, onAreaSelect, currentRouteIndex, animateRoute, matchedDonor, hospitalArea]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-border shadow-lg"
      />
      
      {/* Route Animation Legend */}
      {highlightedRoute && highlightedRoute.length >= 2 && animateRoute && (
        <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 border border-border shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <span className="text-muted-foreground">
              {currentRouteIndex < highlightedRoute.length 
                ? `Calculating route... (${currentRouteIndex}/${highlightedRoute.length - 1} segments)`
                : 'Route complete!'
              }
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {highlightedRoute.slice(0, currentRouteIndex + 1).join(' → ')}
          </div>
        </div>
      )}
    </div>
  );
}