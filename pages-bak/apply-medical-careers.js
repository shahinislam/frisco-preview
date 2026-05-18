import React, { useRef, useState } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  Spinner,
  FloatingLabel,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import http from "../components/utils/http";
import Country from "../components/utils/country";
import Link from "next/link";
import LocationList from "../components/templates/location-list";
import { useRouter } from "next/router";
import Head from "next/head";
import mainURL from "../components/utils/main-url";
import ReCAPTCHA from "react-google-recaptcha";
import { getLayoutData } from "../components/utils/getLayoutData";

export default function ApplyMedicalCareers({
  locations,
  locationSidebar,
  jobPost,
}) {
  const router = useRouter();
  const [inputs, setInputs] = useState({});
  const [validated, setValidated] = useState(false);
  const [files, setFiles] = useState({});
  const [isClicked, setIsClicked] = useState(false);
  const [resumeError, setResumeError] = useState();
  const [coverError, setCoverError] = useState();
  const [educationError, setEducationError] = useState();
  const [disabled, setDisabled] = useState(true);
  const recaptchaRef = useRef(null);

  const handleInput = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleFiles = (event) => {
    const name = event.target.name;
    const value = event.target.files[0];
    setFiles((values) => ({ ...values, [name]: value }));
  };

  const recaptHandle = () => {
    setDisabled(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return false;
    }

    setIsClicked(true);

    const formData = new FormData();

    formData.append("fname", inputs.fname);
    formData.append("lname", inputs.lname);
    formData.append("phone", inputs.phone);
    formData.append("email", inputs.email);
    formData.append("street", inputs.street);
    formData.append("address", inputs.address);
    formData.append("city", inputs.city);
    formData.append("state", inputs.state);
    formData.append("zip", inputs.zip);
    formData.append("country", inputs.country);
    formData.append("location_id", inputs.location_id);
    formData.append("job_post_id", inputs.job_post_id);
    formData.append("message", inputs.message);
    formData.append("resume", files.resume);
    formData.append("cover", files.cover);
    formData.append("education", files.education);

    http
      .post("/mail/online-application", formData)
      .then((res) => {
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
        setIsClicked(false);
        setDisabled(true);
        setValidated(false);
        recaptchaRef.current.reset();
      })
      .catch((error) => {
        setIsClicked(false);
      });
  };

  return (
    <>
      <Head>
        <title>
          Apply for Medical Careers - SignatureCare Emergency Center
        </title>
        <meta
          name="description"
          content="Apply for medical careers with SignatureCare Emergency Center, one of the fastest growing 24-hour emergency center operators in Texas"
        />
        <link rel="canonical" href={mainURL + "/apply-medical-careers"} />
        <meta
          property="og:title"
          content="Apply for Medical Careers - SignatureCare Emergency Center"
        />
        <meta property="og:url" content={mainURL + "/apply-medical-careers"} />
      </Head>

      <ToastContainer />

      <div className="bg-dark text-white">
        <div className="container text-center">
          <h1 className="py-2">Apply for Medical Careers</h1>
        </div>
      </div>
      <br />

      <div className="container mb-5">
        <div className="row">
          <div className="col-md-9">
            <h2>Apply for Open Emergency Room (ER) Positions</h2>
            <div>
              Please complete the form below to apply for any open position.
            </div>
            <br />
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Row>
                <Form.Group as={Col} md="6" controlId="fname" className="mb-3">
                  <FloatingLabel controlId="floatingInput" label="First Name">
                    <Form.Control
                      name="fname"
                      value={inputs.fname || ""}
                      onChange={handleInput}
                      required
                      type="text"
                      placeholder="First name"
                    />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      This field is required
                    </Form.Control.Feedback>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group as={Col} md="6" controlId="lname" className="mb-3">
                  <FloatingLabel controlId="floatingInput" label="Last Name">
                    <Form.Control
                      name="lname"
                      value={inputs.lname || ""}
                      onChange={handleInput}
                      required
                      type="text"
                      placeholder="Last name"
                    />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      This field is required
                    </Form.Control.Feedback>
                  </FloatingLabel>
                </Form.Group>
              </Row>
              <Row>
                <Form.Group as={Col} md="6" controlId="Email" className="mb-3">
                  <FloatingLabel controlId="floatingInput" label="Email">
                    <Form.Control
                      name="email"
                      value={inputs.email || ""}
                      onChange={handleInput}
                      required
                      type="email"
                      placeholder="Email"
                    />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      This field is required
                    </Form.Control.Feedback>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group
                  as={Col}
                  md="6"
                  controlId="Phone Number"
                  className="mb-3"
                >
                  <FloatingLabel controlId="floatingInput" label="Phone Number">
                    <Form.Control
                      name="phone"
                      value={inputs.phone || ""}
                      onChange={handleInput}
                      required
                      type="text"
                      placeholder="Phone"
                    />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      This field is required
                    </Form.Control.Feedback>
                  </FloatingLabel>
                </Form.Group>
              </Row>
              <Row>
                <Form.Group
                  as={Col}
                  md="6"
                  controlId="Street Address"
                  className="mb-3"
                >
                  <FloatingLabel
                    controlId="floatingInput"
                    label="Street Address"
                  >
                    <Form.Control
                      name="street"
                      value={inputs.street || ""}
                      onChange={handleInput}
                      required
                      type="text"
                      placeholder="Street Address"
                    />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      This field is required
                    </Form.Control.Feedback>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group
                  as={Col}
                  md="6"
                  controlId="Address Line 2"
                  className="mb-3"
                >
                  <FloatingLabel
                    controlId="floatingInput"
                    label="Address Line 2"
                  >
                    <Form.Control
                      name="address"
                      value={inputs.address || ""}
                      onChange={handleInput}
                      required
                      type="text"
                      placeholder="Address Line 2"
                    />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      This field is required
                    </Form.Control.Feedback>
                  </FloatingLabel>
                </Form.Group>
              </Row>
              <Row>
                <Form.Group as={Col} md="6" controlId="City" className="mb-3">
                  <FloatingLabel controlId="floatingInput" label="City">
                    <Form.Control
                      name="city"
                      value={inputs.city || ""}
                      onChange={handleInput}
                      required
                      type="text"
                      placeholder="City"
                    />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      This field is required
                    </Form.Control.Feedback>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group
                  as={Col}
                  md="6"
                  controlId="State / Province / Region"
                  className="mb-3"
                >
                  <FloatingLabel
                    controlId="floatingInput"
                    label="State / Province / Region"
                  >
                    <Form.Control
                      name="state"
                      value={inputs.state || ""}
                      onChange={handleInput}
                      required
                      type="text"
                      placeholder="State / Province / Region"
                    />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      This field is required
                    </Form.Control.Feedback>
                  </FloatingLabel>
                </Form.Group>
              </Row>
              <Row>
                <Form.Group as={Col} md="6" controlId="Zip" className="mb-3">
                  <FloatingLabel controlId="floatingInput" label="Zip">
                    <Form.Control
                      name="zip"
                      value={inputs.zip || ""}
                      onChange={handleInput}
                      required
                      type="text"
                      placeholder="Zip"
                    />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      This field is required
                    </Form.Control.Feedback>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group
                  as={Col}
                  md="6"
                  controlId="Country"
                  className="mb-3"
                >
                  <FloatingLabel controlId="floatingSelectGrid" label="Country">
                    <Form.Select
                      aria-label="Floating label select example"
                      name="country"
                      onChange={handleInput}
                      value={inputs.country || "United States"}
                    >
                      <option>Select Country</option>
                      {Country.map((country, index) => (
                        <option value={country.name} key={index}>
                          {country.name}
                        </option>
                      ))}
                    </Form.Select>
                  </FloatingLabel>
                </Form.Group>
              </Row>
              <Row>
                <Form.Group as={Col} sm controlId="formFile" className="mb-3">
                  <Form.Label>Upload Your Resume ( PDF only)</Form.Label>
                  <Form.Control
                    type="file"
                    name="resume"
                    onChange={handleFiles}
                    isInvalid={resumeError ? true : false}
                    placeholder="Resume"
                  />
                  <Form.Control.Feedback type="invalid">
                    {resumeError}
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              <Row>
                <Form.Group as={Col} sm controlId="formFile" className="mb-3">
                  <Form.Label>Optional Cover Letter ( PDF Only)</Form.Label>
                  <Form.Control
                    type="file"
                    name="cover"
                    onChange={handleFiles}
                    isInvalid={coverError ? true : false}
                    placeholder="Cover"
                  />
                  <Form.Control.Feedback type="invalid">
                    {coverError}
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              <Row>
                <Form.Group as={Col} sm controlId="formFile" className="mb-3">
                  <Form.Label>Optional Education (PDF only)</Form.Label>
                  <Form.Control
                    type="file"
                    name="education"
                    onChange={handleFiles}
                    isInvalid={educationError ? true : false}
                    placeholder="Education"
                  />
                  <Form.Control.Feedback type="invalid">
                    {educationError}
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>

              <Row>
                <Form.Group
                  as={Col}
                  md="6"
                  controlId="Location"
                  className="mb-3"
                >
                  <FloatingLabel
                    controlId="floatingSelectGrid"
                    label="Select the Location You Are Applying For"
                  >
                    <Form.Select
                      aria-label="Floating label select example"
                      name="location_id"
                      onChange={handleInput}
                      value={inputs.location_id || ""}
                    >
                      <option>Select Location</option>
                      {locations.map((location, index) => (
                        <option value={location.id} key={index}>
                          {!location.name.includes(location.city)
                            ? location.city + "-"
                            : ""}
                          {location.name}
                        </option>
                      ))}
                    </Form.Select>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group
                  as={Col}
                  md="6"
                  controlId="Position"
                  className="mb-3"
                >
                  <FloatingLabel
                    controlId="floatingSelectGrid"
                    label="Select the Position You Are Applying For"
                  >
                    <Form.Select
                      aria-label="Floating label select example"
                      name="job_post_id"
                      onChange={handleInput}
                      value={inputs.job_post_id || ""}
                    >
                      <option>Select Position</option>
                      {jobPost.map((job, index) => (
                        <option value={job.id} key={index}>
                          {job.title}
                        </option>
                      ))}
                    </Form.Select>
                  </FloatingLabel>
                </Form.Group>
              </Row>

              <Row>
                <Form.Group
                  as={Col}
                  md="12"
                  controlId="exampleForm.ControlTextarea1"
                  className="mb-3"
                >
                  <FloatingLabel
                    controlId="floatingTextarea2"
                    label="Please tell us why you would like to work for SignatureCare Emergency Center"
                  >
                    <Form.Control
                      as="textarea"
                      placeholder="Leave a comment here"
                      name="message"
                      value={inputs.message || ""}
                      onChange={handleInput}
                      style={{ height: "150px" }}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      This field is required
                    </Form.Control.Feedback>
                  </FloatingLabel>
                </Form.Group>
              </Row>

              <Form.Group className="mb-3" controlId="formConfirm">
                <ReCAPTCHA
                  key="recaptcha" // Add this line
                  size="normal"
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                  onChange={recaptHandle}
                />
              </Form.Group>

              <div className="d-grid gap-2">
                {!isClicked && (
                  <Button
                    disabled={disabled}
                    type="submit"
                    variant="danger"
                    size="lg"
                    className="btn btn-block"
                  >
                    Submit
                  </Button>
                )}

                {isClicked && (
                  <Button
                    type="submit"
                    variant="danger"
                    size="lg"
                    className="btn btn-block"
                    disabled
                  >
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span> Sending...</span>
                  </Button>
                )}
              </div>
            </Form>
            <br />
            <div>
              Thank you for submitting your application. One of our managers
              will review the information you submitted and reach out to you If
              we are interested in moving forward.
            </div>
            <Link href="/" className="text-danger">
              SignatureCare Emergency Center.
            </Link>
          </div>
          <div className="col-md-3">
            <LocationList locationSidebar={locationSidebar} />
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async () => {
  try {
    // Fetch all data in parallel
    const [locationsRes, jobPostsRes, locationListRes, layoutData] =
      await Promise.all([
        http.get("/admin/locations"),
        http.get("/admin/job-posts"),
        http.get("/admin/navigations/location-sidebar"),
        getLayoutData(),
      ]);

    const locations = locationsRes.data || [];
    const jobPost = jobPostsRes.data || [];
    const locationSidebar = JSON.parse(locationListRes.data?.menus || "[]");

    return {
      props: {
        locations,
        jobPost,
        locationSidebar,
        layoutData,
      },
      // No revalidate for SSR
    };
  } catch (err) {
    console.error("Error fetching props:", err.message);
    return { notFound: true };
  }
};
