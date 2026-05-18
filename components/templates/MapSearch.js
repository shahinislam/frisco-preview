import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Form,
  InputGroup,
  ListGroup,
} from "react-bootstrap";
import {
  GoogleMap,
  useLoadScript,
  MarkerF,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { FaLocationArrow } from "react-icons/fa";
import Link from "next/link";
import useSWR from "swr";
import http from "../utils/http";
import laravelURL from "../utils/laravel-url";
import Image from "next/image";

const fetcher = async (url) => {
  const res = await http.get(url);
  const data = await res.data;
  return data;
};

const containerStyle = {
  width: "100%",
  height: "450px",
};

const libraries = ["places", "marker"];

export default function Map() {
  // ✅ NEW: Delay map load by 1 second
  const [shouldLoadMap, setShouldLoadMap] = useState(false);

  const [locations, setLocations] = useState();
  const [closeLocation, setCloseLocation] = useState();
  const [filterMap, setFilterMap] = useState([]);
  const [focus] = useState({ lat: 31.0, lng: -100.0 });
  const [userLocation, setUserLocation] = useState();
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [searchBox, setSearchBox] = useState(null);
  const originRef = useRef();
  const [cardData, setCardData] = useState();
  const [show, setShow] = useState(false);

  const { data, error } = useSWR("/admin/locations", fetcher);

  // ✅ NEW: Auto-load map after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoadMap(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const { isLoaded } = useLoadScript({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_API_KEY,
    libraries,
  });

  useEffect(() => {
    if (data) {
      const dataList = data.filter(
        (location) => location.name !== "Greater Texas Division"
      );
      setLocations(dataList);
      setFilterMap(dataList);
    }
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function (position) {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, [data]);

  const hoverMarker = (location) => {
    setCardData(location);
    setShow(true);
  };

  const unhoverMarker = () => {
    setShow(false);
  };

  const deg2Rad = (deg) => {
    return (deg * Math.PI) / 180;
  };

  const pythagorasEquirectangular = (lat1, lon1, lat2, lon2) => {
    lat1 = deg2Rad(lat1);
    lat2 = deg2Rad(lat2);
    lon1 = deg2Rad(lon1);
    lon2 = deg2Rad(lon2);
    const R = 6371;
    const x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
    const y = lat2 - lat1;
    const d = Math.sqrt(x * x + y * y) * R;
    return d;
  };

  const closestEmergencyRoom = async (latitude, longitude) => {
    let mindif = 99999;
    let closest;
    if (originRef.current.value === "") {
      latitude = userLocation.lat;
      longitude = userLocation.lng;
    }

    for (let index = 0; index < locations.length; ++index) {
      const dif = pythagorasEquirectangular(
        latitude,
        longitude,
        locations[index].latitude,
        locations[index].longitude
      );
      if (dif < mindif) {
        closest = index;
        mindif = dif;
      }
    }
    setCloseLocation(locations[closest]);

    const directionService = new window.google.maps.DirectionsService();

    const results = await directionService.route({
      origin: originRef.current.value ? originRef.current.value : userLocation,
      destination: {
        lat: locations[closest].latitude,
        lng: locations[closest].longitude,
      },
      travelMode: window.google.maps.TravelMode.DRIVING,
    });

    setDirectionsResponse(results);
    setDistance(results.routes[0].legs[0].distance.text);
    setDuration(results.routes[0].legs[0].duration.text);
  };

  const onLoad = (autocomplete) => {
    setSearchBox(autocomplete);
  };

  const onPlacesChanged = () => {
    if (searchBox.getPlace()) {
      let latitude = searchBox.getPlace().geometry.location.lat();
      let longitude = searchBox.getPlace().geometry.location.lng();
      closestEmergencyRoom(latitude, longitude);
    }
  };

  if (error) return <div>Failed to load</div>;
  
  if (!data) {
    return (
      <section>
        <Form.Label>Enter your postal code, city and / or state</Form.Label>
        <InputGroup className="mb-3" size="lg">
          <Form.Control
            type="text"
            className="shadow-none"
            placeholder="Loading map..."
            disabled
          />
          <Button id="button-addon2" disabled>
            <FaLocationArrow />
          </Button>
        </InputGroup>

        <div
          className="position-relative bg-light d-flex align-items-center justify-content-center"
          style={{
            height: "450px",
            borderRadius: "8px",
            border: "2px dashed #dee2e6"
          }}
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
            <div className="fw-bold text-dark">Find Your Closest Emergency Room</div>
          </div>
        </div>
      </section>
    );
  }

  // ✅ NEW: Show loading placeholder during 1-second delay
  if (!shouldLoadMap) {
    return (
      <>
        <section>
          <Form.Label>Enter your postal code, city and / or state</Form.Label>
          <InputGroup className="mb-3" size="lg">
            <Form.Control
              type="text"
              className="shadow-none"
              placeholder="Loading map..."
              disabled
            />
            <Button id="button-addon2" disabled>
              <FaLocationArrow />
            </Button>
          </InputGroup>

          <div
            className="position-relative bg-light d-flex align-items-center justify-content-center"
            style={{
              height: "450px",
              borderRadius: "8px",
              border: "2px dashed #dee2e6"
            }}
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
              <div className="fw-bold text-dark">Find Your Closest Emergency Room</div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // ✅ Rest stays exactly the same
  return (
    <>
      <section>
        {isLoaded ? (
          <div>
            <Form.Label>Enter your postal code, city and / or state</Form.Label>
            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlacesChanged}>
              <InputGroup className="mb-3" size="lg">
                <Form.Control
                  type="text"
                  className="shadow-none"
                  placeholder="Search..."
                  aria-label="Search..."
                  aria-describedby="basic-addon2"
                  ref={originRef}
                />
                <Button id="button-addon2">
                  <FaLocationArrow />
                </Button>
              </InputGroup>
            </Autocomplete>

            <GoogleMap
              mapContainerStyle={containerStyle}
              center={focus}
              zoom={6}
            >
              {directionsResponse && (
                <DirectionsRenderer directions={directionsResponse} />
              )}
              {userLocation && (
                <MarkerF label="You are here!" position={userLocation} />
              )}

              <MarkerF>
                {show && (
                  <Card style={{ width: "18rem" }}>
                    {cardData.img && (
                      <Image
                        src={laravelURL + "/storage/" + cardData.img}
                        alt={cardData.name}
                        width={288}
                        height={160}
                        sizes="288px"
                        quality={70}
                        className="object-fit-cover"
                      />
                    )}
                    <Card.Body>
                      <Card.Title>
                        {cardData.name}{" "}
                        {cardData.status === 2 ? (
                          <span className="text-danger">(coming soon)</span>
                        ) : (
                          ""
                        )}
                      </Card.Title>
                      <Card.Text>
                        <ListGroup as="ol" variant="flush">
                          <ListGroup.Item as="li">
                            <div className="ms-2 me-auto">
                              <div className="fw-bold f-xs text-info">
                                Address
                              </div>
                              <small>{cardData.address}</small>
                            </div>
                          </ListGroup.Item>
                          <ListGroup.Item as="li">
                            <div className="ms-2 me-auto">
                              <div className="fw-bold text-info">Phone</div>
                              <small>{cardData.tel}</small>
                            </div>
                          </ListGroup.Item>
                        </ListGroup>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                )}
              </MarkerF>

              {filterMap?.map((location, index) => (
                <MarkerF
                  onMouseOver={() => hoverMarker(location)}
                  onMouseOut={unhoverMarker}
                  key={index}
                  position={{ lat: location.latitude, lng: location.longitude }}
                  icon={{
                    url: "/assets/signaturecare-mini.webp", // ✅ Changed to .webp
                    scaledSize: new google.maps.Size(25, 25),
                  }}
                />
              ))}
            </GoogleMap>
          </div>
        ) : (
          <div>
            <Form.Label>Enter your postal code, city and / or state</Form.Label>
            <InputGroup className="mb-3" size="lg">
              <Form.Control
                type="text"
                className="shadow-none"
                placeholder="Loading map..."
                disabled
              />
              <Button id="button-addon2" disabled>
                <FaLocationArrow />
              </Button>
            </InputGroup>

            <div
              className="position-relative bg-light d-flex align-items-center justify-content-center"
              style={{
                height: "450px",
                borderRadius: "8px",
                border: "2px dashed #dee2e6"
              }}
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
                <div className="fw-bold text-dark">Find Your Closest Emergency Room</div>
              </div>
            </div>
          </div>
        )}
      </section>
      <br />
      <section>
        {closeLocation && (
          <div>
            <h4 className="mt-3">Directions to the Closest Emergency Room</h4>
            <ul className="list-group list-group-numbered">
              <li className="list-group-item d-flex justify-content-between align-items-start">
                <div className="ms-2 me-auto">
                  <div className="fw-bold">Location Name: </div>
                  <span className="">{closeLocation.name}</span>
                </div>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-start">
                <div className="ms-2 me-auto">
                  <div className="fw-bold">Address:</div>
                  <span className="">{closeLocation.address}</span>
                </div>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-start">
                <div className="ms-2 me-auto">
                  <div className="fw-bold">Phone:</div>
                  <Link
                    href={"tel:" + closeLocation.tel}
                    className="text-danger"
                  >
                    <span>{closeLocation.tel}</span>
                  </Link>
                </div>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-start">
                <div className="ms-2 me-auto">
                  <div className="fw-bold">URL:</div>
                  <Link href={"/" + closeLocation.slug} className="text-danger">
                    Go to location page
                  </Link>
                </div>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-start">
                <div className="ms-2 me-auto">
                  <div className="fw-bold">Distance:</div>
                  <span className="">{distance}</span>
                </div>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-start">
                <div className="ms-2 me-auto">
                  <div className="fw-bold">Time:</div>
                  <span className="">{duration}</span>
                </div>
              </li>
            </ul>
          </div>
        )}
      </section>
    </>
  );
}