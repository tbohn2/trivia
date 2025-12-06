import React from "react";

export type GoogleSlide = {
    pageProperties?: {
        pageBackgroundFill?: {
            stretchedPictureFill?: {
                contentUrl: string;
            };
        };
    };
    pageElements?: any[];
};

interface RenderSlideProps {
    slide: GoogleSlide;
    width?: number; // final rendered width in px
}

const EMU_PER_PIXEL = 9525; // 1px ≈ 9525 EMU

export default function RenderSlide({ slide, width = 800 }: RenderSlideProps) {
    const aspectRatio = 16 / 9;
    const height = width / aspectRatio;

    // --------- Extract all images ----------
    const images: Array<{
        url: string;
    }> = [];

    // 1. Background image
    const bg = slide?.pageProperties?.pageBackgroundFill?.stretchedPictureFill;
    if (bg?.contentUrl) {
        images.push({
            url: bg.contentUrl
        });
    }

    // 2. Images inside pageElements
    slide?.pageElements?.forEach((el: any, idx: number) => {
        const imgUri = el.image?.contentUrl;

        if (imgUri) {
            images.push({
                url: imgUri
            });
        }
    });

    return (
        <div className="w-full">
            {images.map((img, i) => (
                <img
                    key={i}
                    src={img.url}
                    className="w-full h-full object-cover"
                />
            ))}
        </div>
    );
}
