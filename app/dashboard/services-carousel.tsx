"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

const services = [
    {
        title: "AGENCIAMIENTO DE ADUANAS",
        image: "/agenciamiento_aduanas.jpg",
    },
    {
        title: "ASESORAMIENTO LEGAL",
        image: "/asesoramiento_legal.jpg",
    },
    {
        title: "SEGURO DE CARGA",
        image: "/seguro_carga.jpg",
    },
    {
        title: "TRANSPORTE INTERNACIONAL AÉREO",
        image: "/transporte_aereo.jpg",
    },
    {
        title: "TRANSPORTE INTERNACIONAL MARÍTIMO",
        image: "/transporte_maritimo.jpg",
    },
    {
        title: "TRANSPORTE NACIONAL",
        image: "/transporte_terrestre.jpg",
    },
]

export function ServicesCarousel() {
    // We double the array to create the infinite loop effect
    const carouselItems = [...services, ...services]

    return (
        <div className="w-full space-y-4">
            <h2 className="text-xl font-bold px-1">Nuestros Servicios</h2>

            {/* Container for the carousel */}
            <div className="w-full relative overflow-hidden bg-background rounded-xl">
                {/* 
            The visible area shows 3 cards.
            animation-duration depends on content width. 
            We use a CSS animation defined in global css or inline style.
        */}
                <div
                    className="flex w-max animate-infinite-scroll hover:pause"
                    style={{
                        // Inline style for the keyframes if not present in global CSS
                        animation: 'scroll 40s linear infinite',
                    }}
                >
                    {/* Inline Style for keyframes since we can't edit globals.css easily without risk or it might be complex */}
                    <style jsx>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .hover\\:pause:hover {
                    animation-play-state: paused !important;
                }
            `}</style>

                    {carouselItems.map((service, index) => (
                        <div
                            key={`${service.title}-${index}`}
                            className="relative w-[350px] md:w-[500px] h-[350px] shrink-0 mx-3 rounded-xl overflow-hidden shadow-md group cursor-pointer"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 w-full h-full">
                                <Image
                                    src={service.image}
                                    alt={service.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                {/* Overlay gradient for text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            </div>

                            {/* Text Content - Bottom Left */}
                            <div className="absolute bottom-0 left-0 p-4 w-full">
                                <h3 className="text-white font-bold text-lg md:text-xl leading-tight drop-shadow-md">
                                    {service.title}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
