import { Link } from 'react-router-dom';
import React from 'react';
//import HeroBanner from '../assests/L&BC.png';

export const LandingPage = () => {
    /*const heroBannerStyle = {
        backgroundImage: `url(${HeroBanner})`,
    };*/

    return (
        <div className="h-full">
            <div className="w-full h-3/6 flex content-center bg-contain" >
                <div className="flex content-center items-center contrast-200">
                    <Link to="/ideas">
                        <h1 className="p-10 decoration-12 text-sky-50 font-extrabold underline decoration-pink-500 text-5xl drop-shadow-xl bg-gray-50/5">
                            A Place to Learn and Be Curious With Your Ideas
                        </h1>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
