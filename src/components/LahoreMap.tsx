import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { lahoreAreas, getAreaName, roadNetwork } from '@/lib/bloodData';
import { useBlood } from '@/context/BloodContext';

interface LahoreMapProps {
  highlightedRoute?: string[];
  selectedArea?: string;
  onAreaSelect?: (areaId: string) => void;
}

export function LahoreMap({ highlightedRoute, selectedArea, onAreaSelect }: LahoreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLinesRef = useRef<L.Polyline[]>([]);
  const { donors } = useBlood();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Lahore
    const map = L.map(mapRef.current, {
      center: [31.5204, 74.3287],
      zoom: 12,
      zoomControl: true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when donors change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add area markers
    lahoreAreas.forEach(area => {
      const areaDonors = donors.filter(d => d.area === area.id);
      const availableDonors = areaDonors.filter(d => d.isAvailable);
      
      const isSelected = selectedArea === area.id;
      const hasAvailable = availableDonors.length > 0;

      // Create custom icon
      const iconHtml = `
        <div class="custom-marker ${hasAvailable ? 'marker-available' : 'marker-unavailable'}" 
             style="${isSelected ? 'transform: scale(1.3); box-shadow: 0 0 20px rgba(0,0,0,0.4);' : ''}">
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

    // Draw road network
    routeLinesRef.current.forEach(line => line.remove());
    routeLinesRef.current = [];

    Object.entries(roadNetwork).forEach(([from, connections]) => {
      const fromArea = lahoreAreas.find(a => a.id === from);
      if (!fromArea) return;

      Object.keys(connections).forEach(to => {
        const toArea = lahoreAreas.find(a => a.id === to);
        if (!toArea) return;

        const isPartOfRoute = highlightedRoute && 
          highlightedRoute.includes(getAreaName(from)) && 
          highlightedRoute.includes(getAreaName(to));

        const line = L.polyline(
          [[fromArea.lat, fromArea.lng], [toArea.lat, toArea.lng]],
          {
            color: isPartOfRoute ? '#b91c1c' : '#94a3b8',
            weight: isPartOfRoute ? 4 : 2,
            opacity: isPartOfRoute ? 1 : 0.4,
            dashArray: isPartOfRoute ? undefined : '5, 5',
          }
        ).addTo(map);

        if (isPartOfRoute) {
          line.setStyle({ className: 'route-path' });
        }

        routeLinesRef.current.push(line);
      });
    });
  }, [donors, selectedArea, highlightedRoute, onAreaSelect]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-border shadow-lg"
    />
  );
}
