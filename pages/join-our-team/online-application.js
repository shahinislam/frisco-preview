import React, { useRef, useState } from 'react'
import { Form, Row, Col, Button, Spinner, FloatingLabel } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from '../../components/utils/http';
import Country from '../../components/utils/country';
import Link from 'next/link';
import LocationList from '../../components/templates/location-list';
import { useRouter } from 'next/router';
import Head from 'next/head';
import mainURL from '../../components/utils/main-url';
import ReCAPTCHA from 'react-google-recaptcha'
import { getLayoutData } from "../../components/utils/getLayoutData";

export default function OnlineApplication({ locationList, jobList, locationSidebar }) {
    const router = useRouter();
    const [inputs, setInputs] = useState({});
    const [validated, setValidated] = useState(false);
    const [files, setFiles] = useState({});
    const [isClicked, setIsClicked] = useState(false);
    const [errors, setErrors] = useState({
        resume: null,
        cover: null,
        education: null,
        location: null,
        job_post: null
    });
    const [disabled, setDisabled] = useState(true);
    const recaptchaRef = useRef(null);

    if (router.isFallback) {
        return <h1>Loading...</h1>
    }

    const handleInput = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setInputs(values => ({ ...values, [name]: value }));
    }

    const handleFiles = (event) => {
        const name = event.target.name;
        const value = event.target.files[0];
        setFiles(values => ({ ...values, [name]: value }));
    }

    const recaptHandle = () => {
        setDisabled(false);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return false;
        }

        if (!inputs.location && !inputs.job_post) {
            // If neither field is filled out, set error messages accordingly
            setErrors({
                location: 'Please select a location',
                job_post: 'Please select a job position'
            });
            return;
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
        formData.append('street', inputs.street);
        formData.append('address', inputs.address);
        formData.append('city', inputs.city);
        formData.append('state', inputs.state);
        formData.append('zip', inputs.zip);
        formData.append('country', inputs.country);
        formData.append('location', inputs.location);
        formData.append('job_post', inputs.job_post);
        formData.append('body', inputs.body);
        formData.append('resume', files.resume || '');
        formData.append('cover', files.cover || '');
        formData.append('education', files.education || '');

        // for (var pair of formData.entries()) {
        //     console.log(pair[0] + ', ' + pair[1]);
        // }

        http.post('/mail/online-application', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }).then(res => {
            // console.log(res.data)
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
            setFiles({});
            setErrors({});
            form.reset();
            setIsClicked(false);
            setDisabled(true);
            setValidated(false);
            recaptchaRef.current.reset();
        }).catch(error => {
            // console.log(error?.response?.data)
            setErrors(error?.response?.data)
            setValidated(false);
            setIsClicked(false);
        })
    };

    return (
        <>
            <Head>
                <title>Medical Careers &amp; Jobs - SignatureCare Emergency Center, Houston TX</title>
                <meta name="description" content="Apply for medical careers and jobs at SignatureCare Emergency Center's 24-hour emergency rooms. We are looking for medical professionals like you" />
                <link rel="canonical" href={mainURL + "/join-our-team/online-application/"} />
                <meta property="og:title" content="Online Application" />
                <meta property="og:url" content={mainURL + "/join-our-team/online-application/"} />
                <meta property="article:modified_time" content="2022-06-07T15:58:53+00:00" />
                <meta property="og:image" content="/assets/top-places-18-lrg.jpg" />
                <meta property="og:image:width" content={600} /><meta property="og:image:height" content={429} />
                <meta property="og:image:type" content="image/jpeg" /><meta name="twitter:label1" content="Est. reading time" />
                <meta name="twitter:data1" content="1 minute" />
            </Head>

            <ToastContainer />

            <div className='bg-dark text-white'>
                <div className='container text-center'>
                    <h3 className='py-2'>Online Application</h3>
                </div>
            </div>
            <br />

            <div className='container mb-5'>
                <div className='row'>
                    <div className='col-md-9'>
                        <h5>Apply for Open Emergency Room (ER) Positions</h5>
                        <div>Please complete the form below to apply for any open position.</div>
                        <br />
                        <Form noValidate validated={validated} onSubmit={handleSubmit}>
                            <Row>
                                <Form.Group as={Col} md="6" controlId="fname" className='mb-3'>
                                    <FloatingLabel
                                        controlId="floatingInput"
                                        label="First Name"
                                    >
                                        <Form.Control
                                            name="fname" value={inputs.fname || ''} onChange={handleInput}
                                            required
                                            type="text"
                                            placeholder="First name"
                                        />
                                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                        <Form.Control.Feedback type="invalid">This field is required</Form.Control.Feedback>
                                    </FloatingLabel>
                                </Form.Group>
                                <Form.Group as={Col} md="6" controlId="lname" className='mb-3'>
                                    <FloatingLabel
                                        controlId="floatingInput"
                                        label="Last Name"
                                    >
                                        <Form.Control
                                            name="lname" value={inputs.lname || ''} onChange={handleInput}
                                            required
                                            type="text"
                                            placeholder="Last name"
                                        />
                                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                        <Form.Control.Feedback type="invalid">This field is required</Form.Control.Feedback>
                                    </FloatingLabel>
                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group as={Col} md="6" controlId="Email" className='mb-3'>
                                    <FloatingLabel
                                        controlId="floatingInput"
                                        label="Email"
                                    >
                                        <Form.Control
                                            name="email" value={inputs.email || ''} onChange={handleInput}
                                            required
                                            type="email"
                                            placeholder="Email"
                                        />
                                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                        <Form.Control.Feedback type="invalid">This field is required</Form.Control.Feedback>
                                    </FloatingLabel>
                                </Form.Group>
                                <Form.Group as={Col} md="6" controlId="Phone Number" className='mb-3'>
                                    <FloatingLabel
                                        controlId="floatingInput"
                                        label="Phone Number"
                                    >
                                        <Form.Control
                                            name="phone" value={inputs.phone || ''} onChange={handleInput}
                                            required
                                            type="text"
                                            placeholder="Phone"
                                        />
                                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                        <Form.Control.Feedback type="invalid">This field is required</Form.Control.Feedback>
                                    </FloatingLabel>
                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group as={Col} md="6" controlId="Street Address" className='mb-3'>
                                    <FloatingLabel
                                        controlId="floatingInput"
                                        label="Street Address"
                                    >
                                        <Form.Control
                                            name="street" value={inputs.street || ''} onChange={handleInput}
                                            required
                                            type="text"
                                            placeholder="Street Address"
                                        />
                                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                        <Form.Control.Feedback type="invalid">This field is required</Form.Control.Feedback>
                                    </FloatingLabel>
                                </Form.Group>
                                <Form.Group as={Col} md="6" controlId="Address Line 2" className='mb-3'>
                                    <FloatingLabel
                                        controlId="floatingInput"
                                        label="Address Line 2"
                                    >
                                        <Form.Control
                                            name="address" value={inputs.address || ''} onChange={handleInput}
                                            type="text"
                                            placeholder="Address Line 2"
                                        />
                                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                        <Form.Control.Feedback type="invalid">This field is required</Form.Control.Feedback>
                                    </FloatingLabel>
                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group as={Col} md="6" controlId="City" className='mb-3'>
                                    <FloatingLabel
                                        controlId="floatingInput"
                                        label="City"
                                    >
                                        <Form.Control
                                            name="city" value={inputs.city || ''} onChange={handleInput}
                                            required
                                            type="text"
                                            placeholder="City"
                                        />
                                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                        <Form.Control.Feedback type="invalid">This field is required</Form.Control.Feedback>
                                    </FloatingLabel>
                                </Form.Group>
                                <Form.Group as={Col} md="6" controlId="State / Province / Region" className='mb-3'>
                                    <FloatingLabel
                                        controlId="floatingInput"
                                        label="State / Province / Region"
                                    >
                                        <Form.Control
                                            name="state" value={inputs.state || ''} onChange={handleInput}
                                            required
                                            type="text"
                                            placeholder="State / Province / Region"
                                        />
                                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                        <Form.Control.Feedback type="invalid">This field is required</Form.Control.Feedback>
                                    </FloatingLabel>
                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group as={Col} md="6" controlId="Zip" className='mb-3'>
                                    <FloatingLabel
                                        controlId="floatingInput"
                                        label="Zip"
                                    >
                                        <Form.Control
                                            name="zip" value={inputs.zip || ''} onChange={handleInput}
                                            required
                                            type="text"
                                            placeholder="Zip"
                                        />
                                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                        <Form.Control.Feedback type="invalid">This field is required</Form.Control.Feedback>
                                    </FloatingLabel>
                                </Form.Group>
                                <Form.Group as={Col} md="6" controlId="Country" className='mb-3'>
                                    <FloatingLabel
                                        controlId="floatingSelectGrid"
                                        label="Country"
                                    >
                                        <Form.Select aria-label="Floating label select example" name="country" onChange={handleInput} value={inputs.country || 'United States'}>
                                            <option>Select Country</option>
                                            {
                                                Country.map((country, index) => (
                                                    <option value={country.name} key={index}>{country.name}</option>
                                                ))
                                            }
                                        </Form.Select>
                                    </FloatingLabel>
                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group as={Col} sm controlId="formFile" className='mb-3'>
                                    <Form.Label>Upload Your Resume ( PDF only)</Form.Label>
                                    <Form.Control type="file" name="resume" onChange={handleFiles} isInvalid={errors.resume ? true : false} placeholder="Resume" required />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.resume}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group as={Col} sm controlId="formFile" className='mb-3'>
                                    <Form.Label>Optional Cover Letter ( PDF Only)</Form.Label>
                                    <Form.Control type="file" name="cover" onChange={handleFiles} isInvalid={errors.cover ? true : false} placeholder="Cover" />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.cover}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group as={Col} sm controlId="formFile" className='mb-3'>
                                    <Form.Label>Optional Education (PDF only)</Form.Label>
                                    <Form.Control type="file" name="education" onChange={handleFiles} isInvalid={errors.education ? true : false} placeholder="Education" />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.education}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Row>

                            <Row>
                                <Form.Group as={Col} md="6" controlId="Location" className='mb-3'>
                                    <FloatingLabel
                                        controlId="floatingSelectGrid"
                                        label="Select the Location You Are Applying For"
                                    >
                                        <Form.Select aria-label="Floating label select example" name="location" onChange={handleInput} isInvalid={errors.location ? true : false} value={inputs.location || ''}>
                                            <option value=''>Select Location...</option>
                                            {
                                                locationList?.map((location, index) => (
                                                    <option value={location.location} key={index}>{location.location}</option>
                                                ))
                                            }
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.location}
                                        </Form.Control.Feedback>
                                    </FloatingLabel>
                                </Form.Group>
                                <Form.Group as={Col} md="6" controlId="Position" className='mb-3'>
                                    <FloatingLabel
                                        controlId="floatingSelectGrid"
                                        label="Select the Position You Are Applying For"
                                    >
                                        <Form.Select aria-label="Floating label select example" name="job_post" onChange={handleInput} isInvalid={errors.job_post ? true : false} value={inputs.job_post || ''}>
                                            <option value=''>Select Position...</option>
                                            {
                                                jobList?.map((job, index) => (
                                                    <option value={job.position} key={index}>{job.position}</option>
                                                ))
                                            }
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.job_post}
                                        </Form.Control.Feedback>
                                    </FloatingLabel>
                                </Form.Group>
                            </Row>

                            <Row>
                                <Form.Group as={Col} md="12" controlId="exampleForm.ControlTextarea1" className='mb-3'>
                                    <FloatingLabel controlId="floatingTextarea2" label="Leave a comment here...">
                                        <Form.Control
                                            as="textarea"
                                            placeholder="Leave a comment here"
                                            name='body'
                                            value={inputs.body || ''}
                                            onChange={handleInput}
                                            style={{ height: '150px' }}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">This field is required</Form.Control.Feedback>
                                    </FloatingLabel>
                                </Form.Group>
                            </Row>

                            <Form.Control type="hidden" name="favorite_color" value="" />

                            <Form.Group className="mb-3" controlId="formConfirm">
                                <ReCAPTCHA size="normal"
                                    ref={recaptchaRef}
                                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                                    onChange={recaptHandle}
                                />
                            </Form.Group>

                            <div className="d-grid gap-2">
                                {!isClicked &&
                                    <Button disabled={disabled} type="submit" variant="danger" size="lg" className='btn btn-block'>SEND YOUR APPLICATION TO US</Button>
                                }

                                {isClicked &&
                                    <Button type="submit" variant="danger" size="lg" className='btn btn-block' disabled>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                        <span> Sending...</span>
                                    </Button>
                                }
                            </div>
                        </Form>
                        <br />
                        <div>Thank you for submitting your application. One of our managers will review the information you submitted and reach out to you If we are interested in moving forward.</div>
                        <Link href='/' className='text-danger'>SignatureCare Emergency Center.</Link>
                    </div>
                    <div className='col-md-3'>
                        <LocationList locationSidebar={locationSidebar} />
                    </div>
                </div>
            </div>
        </>
    )
}

export const getStaticProps = async () => {
  try {
    const [jobLocationRes, sidebarRes, layoutData] = await Promise.all([
      http.get('/admin/job-location-list'),
      http.get('/admin/navigations/location-sidebar'),
      getLayoutData()
    ]);

    const jobLocationList = jobLocationRes.data || {};
    const locationSidebar = sidebarRes.data || {};

    return {
      props: {
        locationList: JSON.parse(jobLocationList.first || '[]'),
        jobList: JSON.parse(jobLocationList.second || '[]'),
        locationSidebar: JSON.parse(locationSidebar.menus || '[]'),
        layoutData
      },
      revalidate: 10,
    };
  } catch (err) {
    console.error('Error fetching job location data:', err.message);
    return { notFound: true };
  }
};
