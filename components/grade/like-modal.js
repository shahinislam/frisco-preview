import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookSquare, FaStar } from 'react-icons/fa';
import GoogleModal from './google-modal';
import FacebookModal from './facebook-modal';
import ContactModal from './contact-modal';

export default function LikeModal({ likeModalShow, close, google, facebook }) {
    const [showGoogle, setShowGoogle] = useState(false);
    const [showFacebook, setShowFacebook] = useState(false);
    const [contactModalShow, setContactModalShow] = useState(false);

    return (
        <>
            <GoogleModal showGoogle={showGoogle} close={() => setShowGoogle(false)} googleReview={google} />
            <FacebookModal showFacebook={showFacebook} close={() => setShowFacebook(false)} facebookReview={facebook} />
            <ContactModal contactModalShow={contactModalShow} close={() => setContactModalShow(false)} />

            <Modal show={likeModalShow} onHide={close} centered size="md">
                <Modal.Header closeButton className="border-0 pb-1 pb-sm-2">
                    <div className="w-100 text-center">
                        <div className="mb-2 mb-sm-3">
                            <FaStar className="text-warning" size={32} />
                        </div>
                        <h4 className="fw-bold text-dark mb-1 mb-sm-2" style={{ fontSize: '20px' }}>Thank You!</h4>
                        <p className="text-muted mb-0 small d-none d-sm-block">We&apos;d love to hear about your experience. Please share your review on one of these platforms:</p>
                        <p className="text-muted mb-0" style={{ fontSize: '13px' }}>Please share your review:</p>
                    </div>
                </Modal.Header>
                <Modal.Body className="px-3 px-sm-4 py-3 py-sm-4">
                    <div className="d-flex flex-column gap-2 gap-sm-3">
                        {/* Google Review Button */}
                        <button
                            className="btn btn-lg p-0 border-0"
                            onClick={() => setShowGoogle(true)}
                            style={{ transition: 'all 0.3s ease' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.querySelector('.review-card').style.transform = 'translateY(-3px)';
                                e.currentTarget.querySelector('.review-card').style.boxShadow = '0 6px 16px rgba(66, 133, 244, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.querySelector('.review-card').style.transform = 'translateY(0)';
                                e.currentTarget.querySelector('.review-card').style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            <div
                                className="review-card d-flex align-items-center p-2 p-sm-3 rounded text-start"
                                style={{
                                    backgroundColor: '#fff',
                                    border: '2px solid #e9ecef',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <div className="me-2 me-sm-3">
                                    <FcGoogle className="d-none d-sm-block" size={48} />
                                    <FcGoogle className="d-block d-sm-none" size={36} />
                                </div>
                                <div className="flex-grow-1">
                                    <div className="text-muted" style={{ fontSize: '11px' }}>CLICK HERE TO LEAVE A</div>
                                    <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>GOOGLE REVIEW</div>
                                </div>
                            </div>
                        </button>

                        {/* Facebook Review Button */}
                        <button
                            className="btn btn-lg p-0 border-0"
                            onClick={() => setShowFacebook(true)}
                            style={{ transition: 'all 0.3s ease' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.querySelector('.review-card').style.transform = 'translateY(-3px)';
                                e.currentTarget.querySelector('.review-card').style.boxShadow = '0 6px 16px rgba(24, 119, 242, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.querySelector('.review-card').style.transform = 'translateY(0)';
                                e.currentTarget.querySelector('.review-card').style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            <div
                                className="review-card d-flex align-items-center p-2 p-sm-3 rounded text-start"
                                style={{
                                    backgroundColor: '#fff',
                                    border: '2px solid #e9ecef',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <div className="me-2 me-sm-3">
                                    <FaFacebookSquare className="d-none d-sm-block" size={48} color="#1877f2" />
                                    <FaFacebookSquare className="d-block d-sm-none" size={36} color="#1877f2" />
                                </div>
                                <div className="flex-grow-1">
                                    <div className="text-muted" style={{ fontSize: '11px' }}>LEAVE A REVIEW ON</div>
                                    <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>FACEBOOK</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}
