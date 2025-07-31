import { useState } from "react";
import Image, { ImageProps } from "next/image"

interface ProfileImageProps extends Omit<ImageProps, "src" | "alt"> {
    src: string;
    alt: string;
}

export default function ProfileImage({ src, alt, ...props}: ProfileImageProps) {
    const [imgSrc, setImgSrc] = useState(src)

    return (
        <Image 
            src={imgSrc} 
            alt={alt} 
            onError={() => setImgSrc("/placeholder-user.jpg")}
            {...props}
        />
    )
}