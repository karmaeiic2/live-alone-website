import type { ReactionPalette } from "./reaction-diffusion";

type InterludePhoto = {
  src: string;
  alt: string;
  position: string;
  palette: ReactionPalette;
};

// Colors follow the lighting in Kate's photographs. Even the shadow color
// stays light enough to keep the brush lettering readable against the page.
export const interludePhotos: InterludePhoto[] = [
  {
    src: "/images/live-alone-silhouette-live.jpg",
    alt: "A Live Alone guitarist silhouetted against pale violet stage light, with the drummer behind him",
    position: "50% 25%",
    palette: { primary: [179, 166, 188], secondary: [222, 206, 222], shadow: [143, 139, 159] },
  },
  {
    src: "/images/live-alone-green-live.jpg",
    alt: "Live Alone performing in a small room under green and yellow lights",
    position: "42% 45%",
    palette: { primary: [158, 180, 76], secondary: [221, 227, 127], shadow: [138, 156, 66] },
  },
  {
    src: "/images/live-alone-motion-purple.jpg",
    alt: "A guitarist and microphone surrounded by violet and pink trails of stage light",
    position: "50% 22%",
    palette: { primary: [173, 143, 194], secondary: [219, 188, 230], shadow: [145, 118, 166] },
  },
  {
    src: "/images/live-alone-motion-cyan.jpg",
    alt: "A Live Alone guitarist in cyan light, with curved blue and green motion trails",
    position: "54% 52%",
    palette: { primary: [107, 171, 186], secondary: [165, 216, 223], shadow: [91, 145, 163] },
  },
  {
    src: "/images/live-alone-bw-live.jpg",
    alt: "Black-and-white photograph of a Live Alone guitarist singing into a microphone",
    position: "50% 28%",
    palette: { primary: [187, 190, 190], secondary: [231, 232, 226], shadow: [146, 153, 159] },
  },
];
