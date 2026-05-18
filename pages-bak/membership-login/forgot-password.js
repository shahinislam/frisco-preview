import React, { useRef } from 'react';
import { Button, Card, Form, Alert, FloatingLabel, Col, Spinner } from 'react-bootstrap';
import { useState } from "react";
import http from '../../components/utils/http';
import Head from 'next/head';
import mainURL from '../../components/utils/main-url';
import ReCAPTCHA from 'react-google-recaptcha';
import { getLayoutData } from "../../components/utils/getLayoutData";

export default function ForgotPassword() {
    const [alert, setAlert] = useState(false);
    const [inputs, setInputs] = useState({});
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [validated, setValidated] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
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

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return false;
        }

        // console.log(inputs)

        setIsClicked(true);
        setErrorMessage('');
        setAlert(false);

        http.post("/forgot-password", inputs)
            .then((res) => {
                setStatusMessage(res.data.status);
                setErrorMessage(res.data.email);
                setAlert(true);
                setIsClicked(false);
            }).catch((error) => {
                setIsClicked(false);
                setAlert(true)
            });
    };

    return (
        <>
            <Head>
                <title>Password Reset for SignatureCare ER Doctors&#039; Portal</title>
                <meta name="description" content="Login page for members of SignatureCare Emergency Center Physicians Portal. Please input your username and password to log into the portal." />
                <link rel="canonical" href={mainURL + "/membership-login/forgot-password"} />
                <meta name="robots" content="noindex, follow" />
                <meta property="og:title" content="Password Reset for SignatureCare ER Doctors&#039; Portal" />
                <meta property="og:url" content={mainURL + "/membership-login/forgot-password"} />
            </Head>

            <section className='bg-dark text-white'>
                <div className='container text-center'>
                    <h3 className='py-2'>Forgot Password</h3>
                </div>
            </section>
            <br />

            <section className='d-flex align-items-center justify-content-center'>
                <Card text='dark' className='w-auto border-0'>
                    <Card.Body>
                        {alert &&
                            <Alert variant="danger" onClick={() => setAlert(false)} dismissible>
                                <b>{errorMessage || statusMessage}</b>
                            </Alert>
                        }

                        <Form noValidate validated={validated} onSubmit={handleSubmit}>
                            <Form.Group as={Col} sm className='mb-3' controlId="Email">
                                <FloatingLabel
                                    controlId="Email"
                                    label="Email..."
                                >
                                    <Form.Control
                                        name="email" value={inputs.email || ''} onChange={handleInput}
                                        type="email"
                                        placeholder="Enter Email"
                                        isInvalid={errorMessage ? true : false}
                                        required
                                    />
                                    {/* <Form.Control.Feedback>Looks good!</Form.Control.Feedback> */}
                                    {/* <Form.Control.Feedback type="invalid">{errorMessage ? errorMessage : 'This field is required!'}</Form.Control.Feedback> */}
                                </FloatingLabel>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formConfirm">
                                <ReCAPTCHA size="normal"
                                    ref={recaptchaRef}
                                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                                    onChange={recaptHandle}
                                />
                            </Form.Group>

                            {!isClicked &&
                                <Form.Group as={Col}>
                                    <div className='d-grid gap-2'>
                                        <Button disabled={disabled} variant="success" type="submit" className='btn-lg rounded-pill'>
                                            Send Password Reset Link
                                        </Button>
                                    </div>
                                </Form.Group>
                            }
                            {isClicked &&
                                <Form.Group as={Col}>
                                    <div className='d-grid gap-2'>
                                        <Button variant="success" size='lg' type="submit" className='rounded-pill' disabled>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                            <span> Send Password Reset Link...</span>
                                        </Button>
                                    </div>
                                </Form.Group>
                            }
                        </Form>
                    </Card.Body>
                </Card>
            </section>
            <br />
            <br />
            <br />
        </>
    )
}

export async function getServerSideProps(context) {
    try {
        // Fetch layout data
        const layoutData = await getLayoutData();

        return {
            props: {
                layoutData,
            },
        };
    } catch (error) {
        console.error('Error fetching layout data:', error);
        
        return {
            props: {
                layoutData: {},
            },
        };
    }
}