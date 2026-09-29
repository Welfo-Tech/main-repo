export const CONTACT = {
  phone: "+91 95578 70167",
  phoneRaw: "+919557870167",
  email: "welfofiber86@gmail.com",
  addressLines: ["Forest Road Industrial Area", "Dhalwala, Rishikesh", "Uttarakhand 249201"],
  mapsUrl: "https://maps.google.com/?q=Forest+Road+Industrial+Area+Dhalwala+Rishikesh",
  whatsappUrl: "https://wa.me/919557870167",
  addressOneLine: "Forest Road Industrial Area, Dhalwala, Rishikesh, Uttarakhand, India",
  mapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13803.568663916893!2d78.287043!3d30.125899!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39093d8f2eb1900d%3A0x12ef47db96fa32!2swelfo%20fiber%20optics!5e0!3m2!1sen!2sus!4v1762754726882!5m2!1sen!2sus",
};

export const SOCIALS = [
  { name: "Facebook", url: "https://www.facebook.com/welfoendovision" },
  { name: "Instagram", url: "https://www.instagram.com/welfo_endovision" },
  { name: "X", url: "https://x.com/WelfoEndovison" },
  { name: "YouTube", url: "https://www.youtube.com/@WelfoEndovison" },
] as const;

/** Drop an mp4 into apps/blog/public/video/ and set this to enable the hero video. */
export const HERO_VIDEO: string | null = null;
export const HERO_POSTER = "/img/Precision-Engineered.jpg";

export const SPECIALTIES = [
  "Gastroenterology",
  "ENT",
  "Urology",
  "Laparoscopy",
  "Arthroscopy",
  "Veterinary",
];

export const STATS = [
  { value: "1000+", label: "Products Sold" },
  { value: "900+", label: "Installations" },
  { value: "800+", label: "Endoscopy Centres" },
];

export const SPECIALTY_CARDS = [
  { name: "Gastroenterology", image: "/img/Gastroenterology.jpg" },
  { name: "ENT", image: "/img/ENT.jpg" },
  { name: "Urology", image: "/img/Urology.jpeg" },
  { name: "Laparoscopy", image: "/img/Laparoscopic.jpg" },
  { name: "Pulmonology", image: "/img/pulmonology.jpg" },
  { name: "Veterinary", image: "/img/Veterinary.jpg" },
];

export const WHY_CHOOSE = [
  { title: "Made In India", icon: "/img/service-img-8.png" },
  { title: "Extend Equipment Lifespan", icon: "/img/love.png" },
  { title: "Minimize Downtime", icon: "/img/downtime.png" },
  { title: "Expert Support", icon: "/img/consulting-service.png" },
  { title: "Reduce Disruptions", icon: "/img/Reduce-Disruptions.png" },
  { title: "Affordable Solutions", icon: "/img/collaboration.png" },
  { title: "Trusted Quality & Value", icon: "/img/trust.png" },
];

export const TECHNOLOGY = [
  { title: "Sharper Images", icon: "/img/spectral-imaging.svg" },
  { title: "Ease of Handling", icon: "/img/Ease-Handling.svg" },
  { title: "Great After-Sales Service", icon: "/img/After-Sales-service.svg" },
];

export const GALLERY = [
  "/img/ng1.jpeg", "/img/ng2.jpeg", "/img/ng3.jpeg", "/img/ng4.jpeg",
  "/img/ng5.jpeg", "/img/ng6.jpeg", "/img/ng7.jpeg", "/img/ng8.jpeg",
];

export const CAPABILITIES = [
  {
    title: "Rigid endoscope repair",
    body: "Rod lens replacement, image relay correction and full optical realignment for cystoscopes, laparoscopes, sinuscopes and arthroscopes.",
  },
  {
    title: "Fiber bundle restoration",
    body: "Broken and darkened light guide bundles rebuilt to restore full illumination output, rather than replacing the whole instrument.",
  },
  {
    title: "Seal and sterilisation integrity",
    body: "Leak testing and waterproof seal replacement so instruments survive repeated autoclave and ETO cycles.",
  },
  {
    title: "Camera and light source service",
    body: "Camera cable faults, coupler repair, LED driver replacement and full imaging chain diagnostics.",
  },
];

export const VALUE_PROPS = [
  { title: "Made in India", body: "Manufactured and repaired at our own facility in Rishikesh. No overseas turnaround." },
  { title: "Extend equipment life", body: "A repaired scope costs a fraction of a replacement and often outlasts the original component." },
  { title: "Minimise downtime", body: "Assessment within 48 hours of intake so your theatre schedule is not left guessing." },
  { title: "Expert support", body: "Optical engineers who work on these instruments daily, not a general electronics desk." },
  { title: "Transparent quotes", body: "A written quote before any work begins. Nothing proceeds without your approval." },
  { title: "Full service history", body: "Every repair is logged against the instrument serial number and available on request." },
];

export const PROCESS = [
  { step: "01", title: "You verify the serial number", body: "Enter the serial from your instrument. We check it against our records so the request lands against its existing service history." },
  { step: "02", title: "We acknowledge and collect", body: "Our team contacts you to confirm the fault and arrange pickup or dispatch instructions." },
  { step: "03", title: "Assessment and quote", body: "The instrument is assessed at our workshop. You receive a written quote before any work starts." },
  { step: "04", title: "Repair and quality check", body: "On approval, the repair proceeds and passes optical and leak testing before it leaves." },
  { step: "05", title: "Return and records", body: "The instrument is dispatched back with a service report filed against its serial number." },
];

export const PRODUCT_LINES = [
  { name: "Cystoscope", detail: "Rigid, multiple angles" },
  { name: "Laparoscope", detail: "HD, 4K and 4K ICG-NIR" },
  { name: "Sinuscope", detail: "ENT rigid optics" },
  { name: "Arthroscope", detail: "Joint visualisation" },
  { name: "Camera systems", detail: "Full imaging chain" },
  { name: "Light guides", detail: "Fiber optic cables and connectors" },
];
