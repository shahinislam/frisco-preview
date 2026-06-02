import React, { useContext, useEffect, useState } from "react";
import http from "../../components/utils/http";
import {
  Form,
  Row,
  Col,
  Button,
  FloatingLabel,
  Spinner,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import Head from "next/head";
import laravelURL from "../../components/utils/laravel-url";
import Image from "next/image";
import Link from "next/link";
import PortalLayout, {
  PortalContext,
} from "../../components/doctors/portal-layout";
import mainURL from "../../components/utils/main-url";
import PortalList from "../../components/doctors/portal-list";
import { SessionProvider, getSession, useSession } from "next-auth/react";
import { getLayoutData } from "../../components/utils/getLayoutData";

export default function PortalPages({ portalDetail }) {
  const router = useRouter();
  const portals = useContext(PortalContext);
  const { portalSlug } = router.query;
  const [inputs, setInputs] = useState({});
  const [date, setDate] = useState();
  const [validated, setValidated] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [questionnaire, setQuestionnaire] = useState([]);
  const [portal, setPortal] = useState(portalDetail || {});
  const [ticked, setTicked] = useState([]);
  const [thanks, setThanks] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setTicked([]);
    setThanks(false);
    let dates = new Date();
    setDate(
      dates.getFullYear() + "-" + (dates.getMonth() + 1) + "-" + dates.getDate()
    );

    if (portalDetail) {
      setPortal(portalDetail);
      // Check if questionnaire exists and is valid JSON
      if (portalDetail.questionnaire) {
        try {
          setQuestionnaire(JSON.parse(portalDetail.questionnaire));
        } catch (error) {
          console.error("Error parsing questionnaire:", error);
          setQuestionnaire([]);
        }
      }
    }
  }, [router, portalDetail]);

  const handleInput = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleTickAnswer = (index, idx) => {
    let doctorTick = !questionnaire[index].answers[idx].tick;
    questionnaire[index].answers[idx].tick = doctorTick;
    setQuestionnaire([...questionnaire]);
    if (doctorTick) {
      if (ticked[index]) {
        ticked[index] =
          ticked[index] + ", " + questionnaire[index].answers[idx].answer;
      } else {
        ticked[index] = questionnaire[index].answers[idx].answer;
      }
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return false;
    }

    const colorData = new FormData(event.target);
    if (colorData.get("favorite_color") !== "") {
      return; // Spam submission
    }

    setIsClicked(true);
    let dates = new Date(date);

    const formData = new FormData();
    formData.append("fname", inputs.fname);
    formData.append("lname", inputs.lname);
    formData.append(
      "date",
      dates.getFullYear() + "-" + (dates.getMonth() + 1) + "-" + dates.getDate()
    );
    formData.append("ticked", JSON.stringify(ticked));
    formData.append("subject", portal.title);

    http
      .post("/mail/physicians-portal", formData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + session?.user?.doctor_token,
        },
      })
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
        setThanks(true);
      })
      .catch((error) => {
        console.error("Submit error:", error);
        toast.error("Failed to submit questionnaire");
        setIsClicked(false);
      });
  };

  return (
    <>
      <Head>
        <title>{portal.title || "Portal"}</title>
        <link rel="canonical" href={mainURL + "/doctors/" + portalSlug} />
        <meta property="og:title" content={portal.title || "Portal"} />
        <meta property="og:url" content={mainURL + "/doctors/" + portalSlug} />
        {portal.media && (
          <meta
            property="og:image"
            content={laravelURL + "/storage/" + portal.media?.path}
          />
        )}
      </Head>

      <ToastContainer />

      <h4>
        <b>{portal.title}</b>
      </h4>
      <center>
        <hr className="curve" />
      </center>
      <div className="row">
        <div className="col-md-9">
          <section>
            <div className="ck-content">
              <div
                dangerouslySetInnerHTML={{ __html: portal.description || "" }}
              />
            </div>
          </section>
          <br />
          <section className={questionnaire.length > 0 ? "" : "d-none"}>
            {questionnaire && !thanks ? (
              <div className="mb-4">
                <h5 className="text-danger">
                  <i>
                    Please complete the following questionnaire{" "}
                    <u>
                      <b>AFTER</b>
                    </u>{" "}
                    watching the video.
                  </i>
                </h5>
                <div className="border border-bottom border-danger border-1"></div>
                <br />
                <h4>
                  <b>{portal.title} Questionnaire</b>
                </h4>
                {questionnaire.map((question, index) => (
                  <div key={index}>
                    <div>
                      <b>
                        Question #{index + 1}{" "}
                        <span className="text-danger">*</span>
                      </b>
                    </div>
                    <p>{question.question}</p>
                    <ul className="list-unstyled">
                      {question.answers?.map((ans, idx) => (
                        <li key={idx}>
                          <Form.Check
                            value={ans.tick}
                            onChange={(e) => handleTickAnswer(index, idx)}
                            label={ans.answer}
                            checked={ans.tick}
                            id={"tick." + index + "." + idx}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <br />
                <h4>Please provide the following information</h4>
                <hr />
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Row>
                    <Form.Group as={Col} md="6" controlId="fname">
                      <FloatingLabel
                        controlId="floatingInput"
                        label="First Name"
                        className="mb-3"
                      >
                        <Form.Control
                          name="fname"
                          value={inputs.fname || ""}
                          onChange={handleInput}
                          required
                          type="text"
                          placeholder="First name"
                        />
                        <Form.Control.Feedback>
                          Looks good!
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                          This field is required
                        </Form.Control.Feedback>
                      </FloatingLabel>
                    </Form.Group>
                    <Form.Group as={Col} md="6" controlId="lname">
                      <FloatingLabel
                        controlId="floatingInput"
                        label="Last Name"
                        className="mb-3"
                      >
                        <Form.Control
                          name="lname"
                          value={inputs.lname || ""}
                          onChange={handleInput}
                          required
                          type="text"
                          placeholder="Last name"
                        />
                        <Form.Control.Feedback>
                          Looks good!
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                          This field is required
                        </Form.Control.Feedback>
                      </FloatingLabel>
                    </Form.Group>
                  </Row>

                  <Row>
                    <Form.Group as={Col} md controlId="date">
                      <FloatingLabel
                        controlId="floatingInput"
                        label="Today's Date"
                        className="mb-3"
                      >
                        <Form.Control
                          name="date"
                          value={date || ""}
                          onChange={(e) => setDate(e.target.value)}
                          required
                          type="date"
                          placeholder="Date"
                        />
                        <Form.Control.Feedback>
                          Looks good!
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                          This field is required
                        </Form.Control.Feedback>
                      </FloatingLabel>
                    </Form.Group>
                  </Row>

                  <Form.Control type="hidden" name="favorite_color" value="" />

                  {!isClicked && (
                    <Button
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
                      <span> Submitting...</span>
                    </Button>
                  )}
                </Form>
              </div>
            ) : (
              <div>
                <p>Thank you!</p>
                <p>
                  Thank you for completing this questionnaire. This is to
                  confirm that we have received your answers.
                </p>
                <p>
                  If you have any questions, please reach out to us at{" "}
                  <Link
                    href="mailto:webmaster@ercare24.com"
                    className="text-danger"
                  >
                    webmaster@ercare24.com
                  </Link>
                </p>
                <p>
                  SignatureCare Emergency Center Doctors Portal.{" "}
                  <Link
                    href="https://ercare24.com/doctors/"
                    className="text-danger"
                  >
                    www.ercare24.com
                  </Link>
                </p>
                <hr className="w-50" />
                <p>
                  <strong>
                    <u>
                      <span style={{ color: "blue" }}>ANSWER KEY:</span>
                    </u>
                  </strong>
                </p>
                {questionnaire.map((question, index) => (
                  <div key={index}>
                    <ul className="list-unstyled">
                      {question.answers?.map(
                        (ans, idx) =>
                          ans.correct && (
                            <li key={idx}>
                              {index + 1}) {ans.answer}
                            </li>
                          )
                      )}
                    </ul>
                  </div>
                ))}
                <hr className="w-50" />
              </div>
            )}
          </section>
        </div>
        <div className="col-md-3">
          <PortalList allPortals={portals} portalSlug={portalSlug} />
          <br />
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }} className="img-skeleton">
            <Image
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              src="/assets/doctor.jpg?v=2"
              alt="doctor"
            />
          </div>
        </div>
      </div>
      <br />
      <br />
      <br />
    </>
  );
}

export const getServerSideProps = async (context) => {
    try {
        const { portalSlug } = context.params;
        const session = await getSession(context);
        const token = session?.user?.doctor_token;
        
        // console.log('Session:', session);
        // console.log('Token:', token);
        // console.log('Portal Slug:', portalSlug);
        
        // Check authentication
        if (!session || !token || token === 'pending') {
            return {
                redirect: {
                    destination: '/membership-login?callbackUrl=/doctors/' + portalSlug,
                    permanent: false,
                }
            }
        }

        // Fetch data in parallel
        const [layoutData, portalRes] = await Promise.all([
            getLayoutData(),
            http.get('/admin/physicians-portal/' + portalSlug, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            })
        ]);

        const portalDetail = portalRes.data;

        return {
            props: {
                portalDetail,
                layoutData,
                session, // ✅ Pass session to page
            },
        }
    } catch (error) {
        // console.error('Error in getServerSideProps:', error);
        
        return {
            redirect: {
                destination: '/membership-login',
                permanent: false,
            }
        }
    }
}

// ✅ Remove SessionProvider wrapper
PortalPages.getLayout = function getLayout(page) {
    return <PortalLayout>{page}</PortalLayout>
}