import Link from 'next/link'
import React from 'react'
import { trackBookAppointment } from './gtm'

export default function SkipTheWait({ url }) {
    return (
        <span className='text-white text-center mb-2' style={{ display: 'inline-block', fontFamily: 'Verdana', backgroundColor: '#AB0575', lineHeight: '80%', width: '330px', height: '73px', borderRadius: '10px' }}>
            <span className='h5' style={{ display: 'block', letterSpacing: '1px' }}><b>Skip</b><i>the</i><b>Wait</b></span>
            <small>
                <Link href={url ?? '/emergency-room-appointment'} className='rounded-pill p-1 text-xs link-light'
                    style={{ backgroundColor: 'hsl(0,100%,50%)', letterSpacing: '2px' }}
                    onClick={() => trackBookAppointment('skip-the-wait')}>
                    <b>Book an Appointment Today</b>
                </Link>
            </small>
        </span>
    )
}
