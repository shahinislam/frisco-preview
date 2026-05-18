import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import laravelURL from "../utils/laravel-url";
import { FaMapMarkerAlt, FaPhoneAlt, FaDirections, FaCalendarAlt, FaBriefcase } from "react-icons/fa";
import { trackBookAppointment, trackGetDirections } from "../utils/gtm";

export default function LocationPreview({
  locations,
  appointment,
  activeJobs,
  city,
  chargemaster,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (city === "Houston") {
    var houstonLocations = locations.filter((location) =>
      location.city.includes("Houston")
    );
    locations = houstonLocations;
  }

  if (!activeJobs) {
    locations = locations.filter(
      (location) => location.name !== "Greater Texas Division"
    );
  }

  return (
    <>
      <div className="row g-4">
        {locations?.map((location, index) => (
          <div className="col-md-4 d-flex align-items-stretch" key={index}>
            <div
              className="card border-0 shadow-sm w-100 overflow-hidden"
              style={{
                transition: 'all 0.3s ease',
                transform: hoveredIndex === index ? 'translateY(-5px)' : 'translateY(0)',
                boxShadow: hoveredIndex === index ? '0 8px 24px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.08)'
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {appointment && (
                <div style={{ position: 'relative', width: '100%', aspectRatio: '5/2', overflow: 'hidden' }} className="img-skeleton">
                  <Image
                    fill
                    src={laravelURL + "/storage/" + location.media?.path}
                    alt={location.media?.alt_text || "SignatureCare ER location"}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)'
                    }}
                    {...(index === 0
                      ? { priority: true, fetchpriority: "high" }
                      : { loading: "lazy" }
                    )}
                  />
                  {location.status === 2 && (
                    <div
                      className="position-absolute top-0 end-0 bg-danger text-white px-3 py-1"
                      style={{
                        borderBottomLeftRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      COMING SOON
                    </div>
                  )}
                </div>
              )}

              <div className="card-body p-4">
                <h5 className="card-title fw-bold text-dark mb-3 d-flex align-items-center">
                  <FaMapMarkerAlt className="text-danger me-2" size={18} />
                  {location.name}, {location.state}
                  {!appointment && location.status === 2 && (
                    <span className="badge bg-danger ms-2" style={{ fontSize: '10px' }}>COMING SOON</span>
                  )}
                </h5>

                {activeJobs && activeJobs[location.id] && activeJobs[location.id].length > 0 && (
                  <div className="mb-3">
                    <h6 className="text-danger fw-bold mb-2 d-flex align-items-center">
                      <FaBriefcase className="me-2" size={14} />
                      Available Positions
                    </h6>
                    <ul className="list-unstyled ms-4">
                      {activeJobs[location.id].map((job, jobIndex) => (
                        <li key={jobIndex} className="mb-1">
                          <small className="text-dark fw-semibold">• {job.position}</small>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <address className="mb-3" style={{ fontSize: '14px', lineHeight: '1.8' }}>
                  <div className="mb-2">
                    <strong className="text-dark">{location.street}</strong>
                    <br />
                    {location.city}, {location.zip}
                  </div>
                  <div className="d-flex align-items-center">
                    <FaPhoneAlt className="text-danger me-2" size={12} />
                    <Link
                      href={"tel:" + location.tel}
                      className="text-danger fw-bold text-decoration-none"
                      style={{ transition: 'all 0.3s ease' }}
                      rel="noreferrer"
                    >
                      {location.tel}
                    </Link>
                  </div>
                </address>

                <div className="d-flex flex-column gap-2">
                  {location?.google && (
                    <Link
                      href={location.google}
                      className="btn btn-danger d-flex align-items-center justify-content-center"
                      target={"_blank"}
                      rel="noreferrer"
                      style={{
                        transition: 'all 0.3s ease',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                      onClick={() => trackGetDirections(location.name)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #c82333 0%, #a71d2a 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '';
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      <FaDirections className="me-2" size={14} />
                      Get Directions
                    </Link>
                  )}

                  {appointment && (
                    <Link
                      href={location.acuity_url || "#"}
                      target={location.acuity_url ? "_blank" : undefined}
                      rel={location.acuity_url ? "noreferrer" : undefined}
                      className="btn btn-dark d-flex align-items-center justify-content-center"
                      style={{
                        transition: 'all 0.3s ease',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '';
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.boxShadow = '';
                      }}
                      onClick={(e) => {
                        if (!location.acuity_url) e.preventDefault();
                        trackBookAppointment(location.name);
                      }}
                    >
                      <FaCalendarAlt className="me-2" size={14} />
                      Book Appointment
                    </Link>
                  )}

                  {chargemaster && (
                    <Link
                      href={chargemaster}
                      className="btn btn-dark d-flex align-items-center justify-content-center"
                      rel="noreferrer"
                      style={{
                        transition: 'all 0.3s ease',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '';
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      Chargemaster List
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
