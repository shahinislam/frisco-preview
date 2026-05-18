import { useRouter } from 'next/router';
import React, { useRef, useState } from 'react'
import { Form, Row, Col, Button, Spinner, Card, InputGroup } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from '../utils/http';
import ReCAPTCHA from 'react-google-recaptcha';
import { trackContactFormSubmit } from '../utils/gtm';
import { FaUser, FaPhone, FaEnvelope, FaCommentDots } from 'react-icons/fa';

export default function ContactForm(props) {
    const router = useRouter();
    const [inputs, setInputs] = useState({});
    const [validated, setValidated] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const location = props.location;
    const [disabled, setDisabled] = useState(true);
    const recaptchaRef = useRef(null);

    const handleInput = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({ ...values, [name]: value }));
    }

    const recaptHandle = () => {
        setDisabled(false);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return false;
        }

        const colorData = new FormData(event.target);

        if (colorData.get("favorite_color") !== "") {
            // Form submission is spam
            return;
        }

        setIsClicked(true);

        const formData = new FormData();
        formData.append('fname', inputs.fname);
        formData.append('lname', inputs.lname);
        formData.append('phone', inputs.phone);
        formData.append('email', inputs.email);
        formData.append('body', inputs.body);

        if (location !== undefined) {
            formData.append('review', location);
        }

        http.post('/mail/contact-us', formData).then(res => {
            trackContactFormSubmit();
            toast.success(res.data, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            setInputs({});

            recaptchaRef.current.reset();
            setIsClicked(false);
            setDisabled(true);
            setValidated(false);
            if (location !== undefined) {
                router.push('/review-thanks');
            }
        }).catch(error => {
            setIsClicked(false);
        })
    };

    return (
        <>
            <style jsx>{`
                .form-control:focus {
                    border-color: #dc3545 !important;
                    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
                    transition: all 0.3s ease;
                }
                .form-control:hover:not(:focus) {
                    border-color: #dee2e6;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }
                .input-group-text {
                    transition: all 0.3s ease;
                }
                .form-control:focus + .input-group-text,
                .input-group:focus-within .input-group-text {
                    background-color: #fff5f5;
                    border-color: #dc3545;
                }
            `}</style>
            <ToastContainer />

            <Card className="border-0 shadow-lg rounded-4" style={{ background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)' }}>
                <Card.Body className="p-4 p-md-5">
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Label className="fw-semibold">First Name</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <FaUser className="text-danger" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        name="fname"
                                        value={inputs.fname || ''}
                                        onChange={handleInput}
                                        required
                                        type="text"
                                        placeholder="Enter first name"
                                        className="border-start-0"
                                        size="lg"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        First name is required
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Col>
                            <Col md={6}>
                                <Form.Label className="fw-semibold">Last Name</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <FaUser className="text-danger" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        name="lname"
                                        value={inputs.lname || ''}
                                        onChange={handleInput}
                                        required
                                        type="text"
                                        placeholder="Enter last name"
                                        className="border-start-0"
                                        size="lg"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Last name is required
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Col>
                        </Row>

                        <Row className="g-3 mt-2">
                            <Col md={6}>
                                <Form.Label className="fw-semibold">Phone Number</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <FaPhone className="text-danger" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        name="phone"
                                        value={inputs.phone || ''}
                                        onChange={handleInput}
                                        required
                                        type="text"
                                        placeholder="(555) 123-4567"
                                        className="border-start-0"
                                        size="lg"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Phone number is required
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Col>
                            <Col md={6}>
                                <Form.Label className="fw-semibold">Email Address</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <FaEnvelope className="text-danger" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        name="email"
                                        value={inputs.email || ''}
                                        onChange={handleInput}
                                        required
                                        type="email"
                                        placeholder="your@email.com"
                                        className="border-start-0"
                                        size="lg"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Valid email is required
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Col>
                        </Row>

                        <Row className="mt-3">
                            <Col>
                                <Form.Label className="fw-semibold">
                                    Message <span className="text-danger">*</span>
                                </Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light border-end-0 align-items-start pt-3">
                                        <FaCommentDots className="text-danger" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        name="body"
                                        value={inputs.body || ''}
                                        onChange={handleInput}
                                        as="textarea"
                                        rows={5}
                                        required
                                        placeholder="Tell us how we can help you..."
                                        className="border-start-0"
                                        size="lg"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please tell us why you&apos;re contacting us
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Col>
                        </Row>

                        <Form.Control type="hidden" name="favorite_color" value="" />

                        <div className="mt-4 d-flex justify-content-center">
                            <ReCAPTCHA
                                size="normal"
                                ref={recaptchaRef}
                                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                                onChange={recaptHandle}
                            />
                        </div>

                        <div className="d-grid mt-4">
                            {!isClicked ? (
                                <Button
                                    disabled={disabled}
                                    type="submit"
                                    variant="danger"
                                    size="lg"
                                    className="fw-bold py-3"
                                >
                                    Send Message
                                </Button>
                            ) : (
                                <Button type="submit" variant="danger" size="lg" className="fw-bold py-3" disabled>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Sending...
                                </Button>
                            )}
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </>
    )
}
