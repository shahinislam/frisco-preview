import Link from 'next/link';
import React from 'react';
import { Modal } from 'react-bootstrap';
import { FaUserCircle, FaStar, FaPaperPlane } from 'react-icons/fa';

export default function GoogleModal(props) {

    const steps = [
        {
            icon: <FaUserCircle size={32} />,
            title: "Sign Up or Log In",
            description: "Access your Google account or create one to get started"
        },
        {
            icon: <FaStar size={32} />,
            title: "Leave Your Rating",
            description: "Choose your star rating and write your detailed feedback"
        },
        {
            icon: <FaPaperPlane size={32} />,
            title: "Click Post",
            description: "Submit your review to share it with others"
        }
    ];

    return (
        <>
            <Modal show={props.showGoogle} onHide={props.close} centered>
                <Modal.Header closeButton className="border-0 pb-1">
                    <div className="w-100 text-center">
                        <h5 className="fw-bold text-dark mb-0">Review Us on Google</h5>
                    </div>
                </Modal.Header>
                <Modal.Body className="px-3 py-2">
                    <div className="d-flex flex-column gap-2">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="d-flex align-items-center p-2 rounded"
                                style={{
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e9ecef',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fff5f5';
                                    e.currentTarget.style.borderColor = '#dc3545';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    e.currentTarget.style.borderColor = '#e9ecef';
                                }}
                            >
                                <div
                                    className="d-flex align-items-center justify-content-center flex-shrink-0 text-white fw-bold me-2"
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
                                        fontSize: '14px'
                                    }}
                                >
                                    {index + 1}
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center">
                                        <div className="text-primary me-2" style={{ fontSize: '16px' }}>{step.icon}</div>
                                        <div className="fw-semibold" style={{ fontSize: '13px' }}>{step.title}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-2 p-2 rounded" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107' }}>
                        <small className="text-dark" style={{ fontSize: '10px' }}>
                            <strong>Note:</strong> Not affiliated with Google.
                        </small>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0 pb-2 px-3">
                    <Link
                        href={props.googleReview}
                        className='btn w-100 py-2 fw-bold'
                        target='_blank'
                        rel="noreferrer"
                        style={{
                            background: 'linear-gradient(135deg, #4285f4 0%, #34a853 50%, #fbbc05 75%, #ea4335 100%)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '6px',
                            fontSize: '13px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(66, 133, 244, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        Review Us On Google
                    </Link>
                </Modal.Footer>
            </Modal>
        </>
    );
}
