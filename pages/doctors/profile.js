import React, { useEffect, useRef } from 'react'
import { Form, Dropdown, DropdownButton } from 'react-bootstrap';
import { useState } from "react";
import { useRouter } from 'next/router';
import Head from 'next/head';
import http from '../../components/utils/http';
import { signOut, useSession } from 'next-auth/react';
import laravelURL from '../../components/utils/laravel-url';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import { getLayoutData } from '../../components/utils/getLayoutData';

export default function DoctorProfile() {
    const router = useRouter();
    const [alert, setAlert] = useState(false);
    const [inputs, setInputs] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const [emailError, setEmailError] = useState('');
    const [image, setImage] = useState();
    const [preview, setPreview] = useState();
    const [imageError, setImageError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [validated, setValidated] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [passwordCheck, setPasswordCheck] = useState(false);
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.back();
        }
        http.get("/user/me", {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + session?.user?.doctor_token
            }
        }).then((res) => {
            setInputs(res.data)
        }).catch((error) => {
            if (error) {
                setErrorMessage(error.response.data.message)
            } else {
                setErrorMessage("Could not complete the register")
            }
            setIsClicked(false);
            setAlert(true)
        });
    }, [session, status, router]);

    const handleInput = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({ ...values, [name]: value }));
    }

    const handleImage = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            setImage(undefined);
            setPreview(undefined);
            return
        }

        const objectUrl = URL.createObjectURL(event.target.files[0]);
        setPreview(objectUrl);
        setImage(event.target.files[0]);
        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl)
    }

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        event.preventDefault();

        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            if (inputs.password !== inputs.password_confirmation) {
                setPasswordCheck(true);
            }
            return false;
        }

        let count = 0;
        inputs.old_password ? count++ : '';
        inputs.password ? count++ : '';
        inputs.password_confirmation ? count++ : '';

        // console.log(count);

        if (count === 1 || count === 2 || (inputs.password !== inputs.password_confirmation)) {
            setPasswordCheck(true);
            return false;
        }

        setIsClicked(true);

        const formData = new FormData();

        formData.append('name', inputs.name);
        formData.append('email', inputs.email);
        formData.append('username', inputs.username);
        formData.append('address', inputs.address);
        formData.append('old_password', inputs.old_password ? inputs.old_password : '');
        formData.append('password', inputs.password ? inputs.password : '');
        formData.append('image', image || '');

        // for (var pair of formData.entries()) {
        //     console.log(pair[0] + ', ' + pair[1]);
        // }

        http.post("/user/update", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + session?.user?.doctor_token
            }
        }).then((res) => {
            setIsClicked(false);
            toast.info('Profile updated successfully!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }).catch((error) => {
            setPasswordError(error?.response?.data?.error)
            if (error) {
                setErrorMessage(error?.response?.data?.error)
            } else {
                setErrorMessage("Could not complete the register")
            }
            setIsClicked(false);
            setAlert(true)
        });
    };

    return (
        <>
            <ToastContainer />

            <Head>
                <title>SignatureCare ER Physicians Profile</title>
                <meta name="description" content="Register page for members of SignatureCare Emergency Center Physicians Portal. Please input your username and password to log into the portal." />
            </Head>

            <section className='bg-dark text-white'>
                <div className='container text-center'>
                    <h3 className='py-2'>My Profile</h3>
                </div>
            </section>

            <br />

            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <div className="container rounded bg-white mt-3">
                    {status === "authenticated" &&
                        <DropdownButton id="dropdown-basic-button" variant='light' className='d-flex justify-content-end' title={session?.user?.name}>
                            <Dropdown.Item href="/doctors/profile">
                                <span type="button" className='float-right'>My Profile</span>
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item href="#">
                                <span type="button" onClick={() => signOut()} className='float-right'>Sign out</span>
                            </Dropdown.Item>
                        </DropdownButton>
                    }
                    <div className="row">
                        <div className="col-md-3 border-end">
                            <div className="d-flex flex-column align-items-center text-center p-3 py-5">
                                {preview ?
                                    <div className='btn-container position-relative mt-5' style={{ width: '150px', height: '150px' }}>
                                        <Image className="rounded-circle" fill style={{ objectFit: 'cover' }} src={preview} alt='Profile Image' />
                                    </div>
                                    :
                                    <div>
                                        {inputs.image &&
                                            <div className='btn-container position-relative mt-5' style={{ width: '150px', height: '150px' }}>
                                                <Image className="rounded-circle" fill style={{ objectFit: 'cover' }} src={laravelURL + '/storage/' + inputs.image} alt='Profile Image' />
                                            </div>
                                        }
                                    </div>
                                }
                                <span className="font-weight-bold fs-5 mt-2">{inputs.name}</span>
                                <span className="text-black-50">{inputs.email}</span>
                                <span></span>
                            </div>
                        </div>
                        <div className="col-md-5 border-end">
                            <div className="p-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="text-right">Profile Settings</h4>
                                </div>
                                <div className="row">
                                    <div className="col-md-12 mb-2">
                                        <label className="labels">Name</label>
                                        <Form.Control type="text" name="name" value={inputs.name || ''} onChange={handleInput} placeholder="first name" />
                                    </div>
                                    <div className="col-md-12 mb-2">
                                        <label className="labels">Email</label>
                                        <Form.Control type="text" name="email" value={inputs.email || ''} onChange={handleInput} isInvalid={emailError ? true : false} placeholder="enter email address" disabled />
                                    </div>
                                    <div className="col-md-12 mb-2">
                                        <label className="labels">Username</label>
                                        <Form.Control type="text" name="username" value={inputs.username || ''} onChange={handleInput} placeholder="enter username" disabled />
                                    </div>
                                    <div className="col-md-12 mb-2">
                                        <label className="labels">Address</label>
                                        <Form.Control as="textarea" name="address" value={inputs.address || ''} onChange={handleInput} placeholder="enter address" />
                                    </div>
                                    <div className="col-md-12 mb-2">
                                        <label className="labels">Profile Photo</label>
                                        <Form.Control type="file" name="image" onChange={handleImage} isInvalid={imageError ? true : false} />
                                        <Form.Control.Feedback type="invalid">
                                            {imageError}
                                        </Form.Control.Feedback>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Form>

            <br />
            <br />
            <br />
        </>
    )
}

export async function getServerSideProps(context) {
    const layoutData = await getLayoutData();
    
    return {
        props: {
            layoutData,
        },
    };
}