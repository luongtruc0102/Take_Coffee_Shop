"use client";

import { latLngBounds, type LatLngTuple } from "leaflet";
import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";

type Coordinate = {
  latitude: number;
  longitude: number;
};

type DeliveryRouteMapProps = {
  storeCoordinates: Coordinate;
  customerCoordinates: Coordinate | null;
  routeCoordinates: Coordinate[];
  customerLabel?: string;
  onLocationSelect?: (coordinate: Coordinate) => void;
};

function MapViewport({ positions }: { positions: LatLngTuple[] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 1) {
      map.setView(positions[0], 15, {
        animate: true,
      });
      return;
    }

    map.fitBounds(latLngBounds(positions), {
      animate: true,
      maxZoom: 16,
      padding: [36, 36],
    });
  }, [map, positions]);

  return null;
}

function MapLocationPicker({
  onLocationSelect,
}: {
  onLocationSelect: (coordinate: Coordinate) => void;
}) {
  useMapEvents({
    click(event) {
      onLocationSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

export default function DeliveryRouteMap({
  storeCoordinates,
  customerCoordinates,
  routeCoordinates,
  customerLabel = "Điểm giao hàng",
  onLocationSelect,
}: DeliveryRouteMapProps) {
  const storePosition = useMemo<LatLngTuple>(
    () => [storeCoordinates.latitude, storeCoordinates.longitude],
    [storeCoordinates.latitude, storeCoordinates.longitude],
  );

  const customerPosition = useMemo<LatLngTuple | null>(
    () =>
      customerCoordinates
        ? [customerCoordinates.latitude, customerCoordinates.longitude]
        : null,
    [customerCoordinates],
  );

  const routePositions = useMemo<LatLngTuple[]>(
    () =>
      routeCoordinates.map((coordinate) => [
        coordinate.latitude,
        coordinate.longitude,
      ]),
    [routeCoordinates],
  );

  const viewportPositions = useMemo<LatLngTuple[]>(() => {
    if (routePositions.length > 1) {
      return routePositions;
    }

    if (customerPosition) {
      return [storePosition, customerPosition];
    }

    return [storePosition];
  }, [customerPosition, routePositions, storePosition]);

  return (
    // Cô lập z-index của các pane Leaflet để chúng không nổi lên trên header fixed.
    <div className="relative isolate z-0 h-72 w-full">
      <MapContainer
        center={storePosition}
        zoom={15}
        zoomControl={false}
        scrollWheelZoom
        className={`h-full w-full ${onLocationSelect ? "cursor-crosshair" : ""}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routePositions.length > 1 && (
          <>
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: "#FFFFFF",
                opacity: 0.9,
                weight: 9,
              }}
            />
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: "#C9894B",
                opacity: 1,
                weight: 5,
              }}
            />
          </>
        )}

        <CircleMarker
          center={storePosition}
          radius={9}
          bubblingMouseEvents={false}
          pathOptions={{
            color: "#FFFFFF",
            fillColor: "#4A2C20",
            fillOpacity: 1,
            weight: 3,
          }}
        >
          <Tooltip direction="top" offset={[0, -10]}>
            Kippora Coffee & Tea
          </Tooltip>
        </CircleMarker>

        {customerPosition && (
          <CircleMarker
            center={customerPosition}
            radius={9}
            bubblingMouseEvents={false}
            pathOptions={{
              color: "#FFFFFF",
              fillColor: "#C9894B",
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              {customerLabel}
            </Tooltip>
          </CircleMarker>
        )}

        <ZoomControl position="bottomright" />
        <MapViewport positions={viewportPositions} />
        {onLocationSelect && (
          <MapLocationPicker onLocationSelect={onLocationSelect} />
        )}
      </MapContainer>

      <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-xl bg-white/95 px-3 py-2 text-xs text-[#5E5650] shadow-md backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#4A2C20]" />
          Cửa hàng
        </div>
        {customerCoordinates && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#C9894B]" />
            {customerLabel}
          </div>
        )}
      </div>

      {onLocationSelect && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-[500] max-w-[calc(100%-5rem)] rounded-lg bg-[#4A2C20]/90 px-3 py-2 text-xs font-medium text-white shadow-md">
          Chạm vào bản đồ để chọn vị trí chính xác
        </div>
      )}
    </div>
  );
}
