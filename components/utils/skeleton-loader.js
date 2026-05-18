import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'

export default function SkeletonLoader() {
    return (
        <>
            <div className="mb-2 w-100">
                <Skeleton count={1} height={50} />
            </div>

            <div className='container'>
                <div className='row'>
                    <div className='col-8'>
                        <div className="loading-header mb-2 w-100">
                            <Skeleton height={200} />
                        </div>
                        <div className="loading-content">
                            <div className="mb-2 w-100">
                                <Skeleton count={3} />
                            </div>
                            <div className="mb-2 w-100">
                                <Skeleton count={3} />
                            </div>
                            <div className="mb-2 w-100">
                                <Skeleton count={3} />
                            </div>
                        </div>
                    </div>
                    <div className='col-4'>
                        <Skeleton count={12} height={25} />
                    </div>
                </div>
                <div className='row'>
                    <div className="mb-2 col-md">
                        <Skeleton count={1} height={130} />
                    </div>
                    <div className="mb-2 col-md">
                        <Skeleton count={1} height={130} />
                    </div>
                    <div className="mb-2 col-md">
                        <Skeleton count={1} height={130} />
                    </div>
                </div>
            </div>
            <div className="mb-2 w-100">
                <Skeleton count={1} height={50} />
            </div>
        </>
    )
}
