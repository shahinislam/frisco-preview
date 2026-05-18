import React from 'react';
import Modal from 'react-bootstrap/Modal';
import ContactForm from '../templates/contact-form';

export default function ContactModal(props) {

    return (
        <>
            <Modal show={props.contactModalShow} onHide={props.close} size='lg'>
                <Modal.Header closeButton>
                    <small className='text-primary'>We strive for 100% customer satisfaction. If we fell short, please tell us so that our medical director can contact you directly.</small>
                </Modal.Header>
                <Modal.Body>
                    <ContactForm contactType={'Thumbs Up Review'} />
                </Modal.Body>
            </Modal>
        </>
    );
}
