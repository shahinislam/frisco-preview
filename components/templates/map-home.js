import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Card } from "react-bootstrap";
import {
  GoogleMap,
  MarkerF,
  InfoWindowF,
  useLoadScript,
} from "@react-google-maps/api";
import laravelURL from "../utils/laravel-url";
import Link from "next/link";
import Image from "next/image";
import { trackGetDirections } from "../utils/gtm";

const containerStyle = {
  maxWidth: "100%",
  height: "600px",
  paddingTop: "0",
};

const libraries = ["places", "marker"];

// ✅ Separate component - Google Maps only loads when this mounts
function LoadedMap({ locations = [], mapHeight }) {
  const { isLoaded, loadError } = useLoadScript({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_API_KEY,
    libraries,
  });

  const [filterMap, setFilterMap] = useState([]);
  const [cardData, setCardData] = useState(null);
  const [show, setShow] = useState(false);
  const [map, setMap] = useState(null);
  const [initialBounds, setInitialBounds] = useState(null);

  const filteredLocations = useMemo(() => {
    return (
      locations?.filter(
        (location) => location.name !== "Greater Texas Division"
      ) || []
    );
  }, [locations]);

  useEffect(() => {
    if (filteredLocations.length > 0) {
      setFilterMap(filteredLocations);
    }
  }, [filteredLocations]);

  useEffect(() => {
    if (map && filterMap.length > 0 && isLoaded) {
      const bounds = new window.google.maps.LatLngBounds();

      filterMap.forEach((location) => {
        if (location.latitude && location.longitude) {
          bounds.extend(
            new window.google.maps.LatLng(
              location.latitude,
              location.longitude
            )
          );
        }
      });

      setInitialBounds(bounds);

      const bottomPadding = window.innerWidth < 768 ? 0 : 100;

      map.fitBounds(bounds, {
        bottom: bottomPadding,
        left: 0,
        right: 0,
        top: 0,
      });
    }
  }, [filterMap, isLoaded, map]);

  const onMapLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const hoverMarker = useCallback((location) => {
    setCardData(location);
    setShow(true);
  }, []);

  const unhoverMarker = useCallback(() => {
    setShow(false);
    if (map && initialBounds) {
      map.fitBounds(initialBounds, { bottom: 100, left: 0, right: 0, top: 0 });
    }
  }, [map, initialBounds]);

  const mapOptions = useMemo(
    () => ({
      streetViewControl: false,
      zoomControlOptions: {
        position: isLoaded ? window.google?.maps?.ControlPosition?.LEFT_TOP ?? 5 : 5,
      },
    }),
    [isLoaded]
  );

  if (loadError) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: mapHeight }}
      >
        <p className="text-danger">Error loading maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: mapHeight, backgroundColor: "#e8eaed" }}
        aria-label="Map loading area"
      >
        <div className="text-center text-muted">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9aa0a6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <div className="mt-2 small fw-semibold" style={{ color: "#70757a" }}>
            Loading map...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div aria-label="Interactive emergency room locations map">
      <GoogleMap
        mapContainerStyle={{ ...containerStyle, height: mapHeight }}
        onLoad={onMapLoad}
        onClick={unhoverMarker}
        options={mapOptions}
      >
        {filterMap?.map((location, index) => (
          <MarkerF
            onMouseOver={() => hoverMarker(location)}
            onClick={() => hoverMarker(location)}
            key={location.id || index}
            position={{
              lat: parseFloat(location.latitude),
              lng: parseFloat(location.longitude),
            }}
            icon={{
              url: "/assets/signaturecare-mini.webp",
              scaledSize: isLoaded ? new google.maps.Size(25, 25) : undefined,
            }}
          >
            {show && cardData && cardData.name === location.name && (
              <InfoWindowF
                position={{
                  lat: parseFloat(cardData.latitude),
                  lng: parseFloat(cardData.longitude),
                }}
                onCloseClick={unhoverMarker}
                options={{
                  maxWidth: 300,
                  pixelOffset: new google.maps.Size(0, -10),
                }}
              >
                <div>
                  {/* Large Screen */}
                  <Card
                    className="overflow-hidden d-none d-lg-block border-0"
                    style={{ width: "280px" }}
                  >
                    {cardData.img && (
                      <Image
                        src={laravelURL + "/storage/" + cardData.media?.path}
                        alt={cardData.media?.alt_text || cardData.name}
                        width={280}
                        height={160}
                        sizes="280px"
                        quality={70}
                        className="object-fit-cover"
                      />
                    )}
                    <Card.Body className="p-3">
                      <Card.Title className="fs-6 fw-bold mb-2">
                        {cardData.name}
                        {cardData.status === 2 && (
                          <span className="badge bg-danger ms-2">
                            coming soon
                          </span>
                        )}
                      </Card.Title>

                      <div className="d-grid gap-2 mb-3">
                        <Link
                          href={cardData.google || "#"}
                          className="btn btn-danger btn-sm fw-bold"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackGetDirections(cardData.name)}
                        >
                          📍 Get Directions
                        </Link>
                      </div>

                      <div className="mb-2">
                        <div className="text-muted small fw-bold mb-1">
                          ADDRESS
                        </div>
                        <div className="small fw-semibold">
                          {cardData.address}
                        </div>
                      </div>

                      <div>
                        <div className="text-muted small fw-bold mb-1">
                          PHONE
                        </div>
                        <Link
                          href={"tel:" + cardData.tel}
                          className="text-danger text-decoration-none fw-bold small"
                        >
                          📞 {cardData.tel}
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Small Screen */}
                  <Card
                    className="overflow-hidden border-0 d-lg-none"
                    style={{ width: "260px" }}
                  >
                    {cardData.img && (
                      <Image
                        src={laravelURL + "/storage/" + cardData.img}
                        alt={cardData.name}
                        width={260}
                        height={140}
                        sizes="260px"
                        quality={70}
                        className="object-fit-cover"
                      />
                    )}
                    <Card.Body className="p-2">
                      <Card.Title className="fs-6 fw-bold mb-2">
                        {cardData.name}
                        {cardData.status === 2 && (
                          <span className="badge bg-danger ms-1 small">
                            coming soon
                          </span>
                        )}
                      </Card.Title>

                      <div className="d-grid gap-1">
                        <Link
                          href={cardData.google || "#"}
                          className="btn btn-danger btn-sm fw-bold"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackGetDirections(cardData.name)}
                        >
                          📍 Directions
                        </Link>

                        <div className="small fw-semibold text-muted">
                          {cardData.address}
                        </div>

                        <Link
                          href={"tel:" + cardData.tel}
                          className="btn btn-outline-danger btn-sm fw-bold"
                        >
                          📞 {cardData.tel}
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </InfoWindowF>
            )}
          </MarkerF>
        ))}
      </GoogleMap>
    </div>
  );
}

// ✅ Main component - loads map when scrolled into view
export default function MapHome({ locations = [] }) {
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const [mapHeight, setMapHeight] = useState(containerStyle.height);
  const containerRef = React.useRef(null);

  useEffect(() => {
    if (window.innerWidth < 768) setMapHeight("400px");
  }, []);

  // Auto-load map: on mobile wait for user interaction, on desktop use IntersectionObserver
  useEffect(() => {
    if (shouldLoadMap || !containerRef.current) return;

    // On mobile, defer map loading until user interacts (scroll/tap/click)
    // This prevents Google Maps from becoming the LCP element
    if (window.innerWidth < 768) {
      const handleInteraction = () => {
        setShouldLoadMap(true);
        cleanup();
      };
      const cleanup = () => {
        ["scroll", "touchstart", "click"].forEach((e) =>
          window.removeEventListener(e, handleInteraction)
        );
      };
      ["scroll", "touchstart", "click"].forEach((e) =>
        window.addEventListener(e, handleInteraction, { once: true, passive: true })
      );
      return cleanup;
    }

    // Desktop: load when scrolled into view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [shouldLoadMap]);

  if (!shouldLoadMap) {
    return (
      <div
        ref={containerRef}
        className="d-flex justify-content-center align-items-center"
        style={{
          height: mapHeight,
          backgroundColor: "#e8eaed",
        }}
        aria-label="Map loading area"
      >
        <div className="text-center text-muted">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9aa0a6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <div className="mt-2 small fw-semibold" style={{ color: "#70757a" }}>
            Tap to load map
          </div>
        </div>
      </div>
    );
  }

  return <LoadedMap locations={locations} mapHeight={mapHeight} />;
}