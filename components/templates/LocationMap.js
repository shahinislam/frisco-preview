import { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";

const libraries = ["places", "marker"];

export default function LocationMap({ location, height = "400px" }) {
  const containerStyle = { width: "100%", height };
  const [shouldLoad, setShouldLoad] = useState(false);
  const [map, setMap] = useState(null);

  const markerRef = useRef(null);

  const { isLoaded, loadError } = useLoadScript({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_API_KEY,
    libraries,
  });

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  useEffect(() => {
    if (!map || !window.google?.maps?.marker?.AdvancedMarkerElement) return;

    if (markerRef.current) {
      markerRef.current.map = null;
    }

    markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
      map,
      position: {
        lat: parseFloat(location.latitude),
        lng: parseFloat(location.longitude),
      },
    });

    map.panTo({
      lat: parseFloat(location.latitude),
      lng: parseFloat(location.longitude),
    });

    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, [map, location.latitude, location.longitude]);

  // Load after 2 seconds or on scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 2000);

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShouldLoad(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Placeholder before loading
  if (!shouldLoad) {
    return (
      <div
        className="position-relative bg-light d-flex align-items-center justify-content-center"
        style={{
          height,
          borderRadius: "8px",
          cursor: "pointer",
          border: "2px dashed #dee2e6",
        }}
        onClick={() => setShouldLoad(true)}
      >
        <div className="text-center">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="#dc3545"
            style={{ marginBottom: "12px" }}
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <div>
            <div className="fw-bold text-dark mb-1">{location.name}</div>
            <small className="text-muted d-block mb-2">{location.address}</small>
            <button
              className="btn btn-danger btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                setShouldLoad(true);
              }}
            >
              📍 Load Interactive Map
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loadError) {
    return (
      <div
        className="d-flex justify-content-center align-items-center bg-light"
        style={{ height, borderRadius: "8px" }}
      >
        <p className="text-danger">Error loading map</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="d-flex justify-content-center align-items-center bg-light"
        style={{ height, borderRadius: "8px" }}
      >
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading map...</span>
        </div>
      </div>
    );
  }

  // Loaded map
  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{
        lat: parseFloat(location.latitude),
        lng: parseFloat(location.longitude),
      }}
      zoom={17}
      onLoad={onMapLoad}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        mapId: "ercare24-location-map",
      }}
    />
  );
}