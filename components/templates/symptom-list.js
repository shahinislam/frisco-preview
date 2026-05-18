import React, { useState } from 'react';
import { FaStethoscope, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';

export default function SymptomList({ symptomSidebar }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <div className="bg-white rounded-3 shadow-sm overflow-hidden">
            <div className="bg-light px-4 py-3 border-bottom">
                <h5 className="mb-0 fw-bold text-dark d-flex align-items-center">
                    <FaStethoscope className="text-danger me-2" size={18} />
                    Emergency Room Symptoms
                </h5>
            </div>
            <div className="p-3">
                <div className="d-flex flex-column gap-2">
                    {symptomSidebar?.map((symptom, index) => (
                        <Link
                            href={symptom.url}
                            key={index}
                            className="text-decoration-none"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div
                                className="d-flex align-items-center justify-content-between px-3 py-2 rounded-2"
                                style={{
                                    transition: 'all 0.3s ease',
                                    backgroundColor: hoveredIndex === index ? '#fff5f5' : 'transparent',
                                    borderLeft: hoveredIndex === index ? '3px solid #dc3545' : '3px solid transparent',
                                    transform: hoveredIndex === index ? 'translateX(4px)' : 'translateX(0)'
                                }}
                            >
                                <span className="text-dark fw-normal" style={{ fontSize: '0.95rem' }}>
                                    {symptom.title}
                                </span>
                                <FaChevronRight
                                    className="text-danger"
                                    size={12}
                                    style={{
                                        transition: 'transform 0.3s ease',
                                        transform: hoveredIndex === index ? 'translateX(3px)' : 'translateX(0)'
                                    }}
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
