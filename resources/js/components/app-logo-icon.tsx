import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: {width?: number; height?: number} & SVGAttributes<SVGElement>) {
    return (
        <img style={{width: props.width, height: props.height, backgroundColor: 'transparent'}}
        src="/Logo.png" alt="Inviag.com" />
    );
}
