export interface SpecTable {
  caption?: string;
  columns: string[];
  images?: { src: string; label: string }[];
  rows: string[][];
}

export interface Product {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  heroImage: string;
  intro: string[];
  sections?: { heading: string; body?: string[]; bullets?: string[] }[];
  specs: SpecTable[];
}

export const PRODUCTS: Product[] = [
  {
    slug: "cystoscope",
    name: "Cystoscope",
    category: "Urology",
    tagline: "Rigid cystoscopes for bladder and urethral examination",
    heroImage: "/img/Cystoscope.jpg",
    intro: [
      "Cystoscopy is a diagnostic procedure that allows the doctor to examine the inner lining of the bladder and urethra. The procedure uses a thin, optical instrument known as a cystoscope. The scope has a tiny lens and light attached to one end, an eyepiece at another, and is inserted in the urethra and into the bladder.",
      "Before the procedure of Cystoscopy, local anaesthetic jelly or general anaesthesia is given to numb the urethra. Doctors recommend Cystoscopy to diagnose and treat urinary tract conditions, including blood in urine, frequent urinary tract infections, difficulty in passing urine, problems with control of urine, taking biopsies from the inner lining and removing bladder stones, DJ stents, etc.",
    ],
    sections: [
      {
        heading: "Types of Cystoscopy",
        body: [
          "There are two types of cystoscopies; the choice depends on the purpose of the diagnosis or treatment.",
        ],
        bullets: [
          "Rigid Cystoscopy: uses cystoscopes made of metals that do not bend. This type is used when the doctor needs to pass instruments through the tube to collect samples or remove tumours from the bladder, or for transurethral prostate surgeries.",
          "Flexible Cystoscopy: uses special bendable scopes made of fibre optics to examine the bladder and urethra.",
        ],
      },
    ],
    specs: [
      {
        columns: ["Direction of view", "Model", "Diameter", "Length", "Field of view", "Price"],
        images: [{ src: "/img/Cystoscope-0deg.jpg", label: "Cystoscope" }],
        rows: [
          ["0°", "P401WH / P291WH", "4mm / 2.9mm", "302mm / 302mm", "68° / 80°", "₹ 75,000"],
          ["12°", "P401WH / P291WH", "4mm / 2.9mm", "302mm / 302mm", "68° / 80°", "₹ 75,000"],
          ["30°", "P403WH / P293WH / P403WH-CH", "4mm / 2.9mm / 4mm", "302mm / 302mm / 302mm", "68° / 80° / 68° (not for resectoscopy)", "₹ 75,000"],
          ["70°", "P407WH", "4mm", "302mm", "70°", "₹ 75,000"],
        ],
      },
    ],
  },
  {
    slug: "sinuscope",
    name: "Sinuscope",
    category: "ENT",
    tagline: "Rigid ENT optics for sinus and nasal visualisation",
    heroImage: "/img/Sinuscope.jpg",
    intro: [
      "Welfo Endovision sinuscopes are rigid ENT endoscopes built for nasal and sinus examination, delivering wide field of view and consistent optical transmission across repeated sterilisation cycles.",
    ],
    specs: [
      {
        columns: ["Direction of view", "Model", "Diameter", "Length", "Field of view", "Price"],
        images: [
          { src: "/img/Sinuscope-0deg.jpg", label: "0°" },
          { src: "/img/Sinuscope-30deg.jpg", label: "30°" },
          { src: "/img/Sinuscope-70deg.jpg", label: "70°" },
        ],
        rows: [
          ["0°", "B400WH / B290WH", "4mm / 3mm", "175mm / 175mm", "70° / 80°", "₹ 25,000"],
          ["30°", "B403WH / B293WH", "4mm / 3mm", "175mm / 175mm", "70° / 80°", "₹ 25,000"],
          ["70°", "B407WH", "4mm", "175mm", "70°", "₹ 25,000"],
        ],
      },
    ],
  },
  {
    slug: "laparoscope-hd",
    name: "Laparoscope HD",
    category: "Laparoscopy",
    tagline: "HD rigid laparoscopes for minimally invasive surgery",
    heroImage: "/img/endoscopy1.jpg",
    intro: [
      "Measuring an endoscope's image quality requires several metrics to characterise clarity, distortion and optical transmission. The most objective metric for resolution is the modulation transfer function (MTF). The higher the measurement, the more contrast or clarity between features in the image.",
      "Welfo Endovision laparoscopes have equally excellent performance in distortion and optical transmission indicators, delivering bright and transparent surgical images to surgeons.",
    ],
    specs: [
      {
        columns: ["Direction of view", "Model", "Diameter", "Length", "Field of view", "Price"],
        images: [{ src: "/img/endoscopy2.jpg", label: "Laparoscope HD" }],
        rows: [
          ["0°", "F500WH", "5mm", "305mm", "68°", "₹ 75,000"],
          ["30°", "F100WUH", "10mm", "327mm", "73°", "₹ 75,000"],
        ],
      },
    ],
  },
  {
    slug: "laparoscope-4k",
    name: "Laparoscope 4K",
    category: "Laparoscopy",
    tagline: "4K rigid laparoscopes for high-definition visualisation",
    heroImage: "/img/Laparoscope-4k.jpg",
    intro: [
      "The Welfo Endovision 4K laparoscope range is engineered for superior brightness, sharp contrast and optimised clarity in minimally invasive procedures.",
    ],
    specs: [
      {
        columns: ["Direction of view", "Model", "Diameter", "Length", "Field of view", "Price"],
        images: [{ src: "/img/Laparoscope-4k-30deg.jpg", label: "Laparoscope 4K" }],
        rows: [
          ["0°", "F100WUH", "10mm", "327mm", "73°", "₹ 1,45,000"],
          ["30°", "F100WUH", "10mm", "327mm", "73°", "₹ 1,45,000"],
        ],
      },
    ],
  },
  {
    slug: "laparoscope-4ko",
    name: "Laparoscope 4KO",
    category: "Laparoscopy",
    tagline: "4KO optical configuration for demanding surgical imaging",
    heroImage: "/img/endoscopy3.jpg",
    intro: [
      "The 4KO configuration extends the Welfo Endovision laparoscope range with an optical build tuned for demanding surgical imaging conditions.",
    ],
    specs: [
      {
        columns: ["Direction of view", "Model", "Diameter", "Length", "Field of view", "Price"],
        images: [{ src: "/img/Laparoscope-4k-30deg.jpg", label: "Laparoscope 4KO" }],
        rows: [
          ["0°", "F100WUH", "10mm", "327mm", "73°", "₹ 1,45,000"],
          ["30°", "F100WUH", "10mm", "327mm", "73°", "₹ 1,45,000"],
        ],
      },
    ],
  },
  {
    slug: "laparoscope-4k-icg-nir",
    name: "Laparoscope 4K (ICG / NIR)",
    category: "Laparoscopy",
    tagline: "Fluorescence-capable 4K laparoscope for ICG and near-infrared imaging",
    heroImage: "/img/Laparoscope-4k.jpg",
    intro: [
      "The ICG / NIR configuration supports indocyanine green fluorescence and near-infrared imaging alongside standard 4K white-light visualisation.",
    ],
    specs: [
      {
        columns: ["Direction of view", "Model", "Diameter", "Length", "Field of view", "Price"],
        images: [{ src: "/img/Laparoscope-4k-30deg.jpg", label: "Laparoscope 4K ICG / NIR" }],
        rows: [
          ["0°", "F100WUH", "10mm", "327mm", "73°", "₹ 1,45,000"],
          ["30°", "F100WUH", "10mm", "327mm", "73°", "₹ 1,45,000"],
        ],
      },
    ],
  },
  {
    slug: "arthroscope",
    name: "Arthroscope",
    category: "Arthroscopy",
    tagline: "HD arthroscopes for joint visualisation",
    heroImage: "/img/arthroscope1.png",
    intro: [
      "Welfo Endovision HD arthroscopes are built for joint visualisation, with a wide field of view and a slim 2.9mm profile suited to small-joint work.",
    ],
    specs: [
      {
        columns: ["Description", "Length", "Field of view", "Model", "Price"],
        images: [
          { src: "/img/arthroscope1.png", label: "Arthroscope" },
          { src: "/img/arthroscope2.png", label: "Arthroscope" },
        ],
        rows: [
          ["HD Arthroscope 2.9mm 0°", "175 mm", "80°", "G290WH", "₹ 45,000"],
          ["HD Arthroscope 2.9mm 30°", "175 mm", "80°", "G293WH", "₹ 45,000"],
        ],
      },
    ],
  },
  {
    slug: "surgical-camera-system",
    name: "Surgical Camera System (GM-6160)",
    category: "Imaging",
    tagline: "Full HD CMOS surgical camera system with recording",
    heroImage: "/img/Surgical-Camera-System.png",
    intro: [
      "The Welfo EndoVision Surgical Camera System GM-6160 is an advanced high-definition imaging solution designed to support precision and clarity in modern minimally invasive surgeries. Built with CMOS imaging technology, it delivers Full HD visualisation, enabling surgeons to perform procedures with improved accuracy and confidence.",
      "Developed as a reliable Indian medical technology solution, the system offers high performance, easy connectivity, and seamless integration with endoscopy equipment used in operating rooms, clinics, and surgical centres.",
    ],
    sections: [
      {
        heading: "High-definition surgical visualisation",
        body: [
          "The GM-6160 features a 1/2 CMOS sensor with Full HD resolution (1920 × 1080 at 60 FPS), ensuring clear and detailed images during surgical procedures. Progressive scan eliminates motion artifacts, providing smooth and stable visuals throughout the operation.",
          "With 1100 TV lines of horizontal resolution, the system enhances tissue visibility and anatomical detail, which is critical in procedures such as:",
        ],
        bullets: ["Laparoscopy", "Arthroscopy", "ENT endoscopy", "Urology procedures", "Gynaecology surgeries"],
      },
      {
        heading: "Advanced imaging performance",
        body: ["Engineered to provide excellent image quality even under challenging surgical lighting conditions."],
        bullets: [
          "High signal-to-noise ratio (>40 dB) for clearer images",
          "Adjustable brightness control for optimised illumination",
          "Manual and automatic white balance settings",
          "Minimum illumination of ≤ 0.1 Lux for low-light environments",
          "Focusing range from 2 mm to 200 mm",
        ],
      },
      {
        heading: "Video recording and storage",
        body: ["Supports video and photo recording, allowing procedures to be documented for medical records, training or education."],
        bullets: [
          "Recording format: MP4",
          "Recording resolution: 1080P at 60 FPS",
          "Recording bitrate: 18 Mbps",
          "USB flash drive support: up to 1 TB",
          "HDD support: up to 2 TB",
        ],
      },
    ],
    specs: [
      {
        caption: "Technical specification",
        columns: ["Specification", "Details"],
        rows: [
          ["Model", "GM-6160"],
          ["Brand", "Welfo EndoVision"],
          ["Sensor", "1/2 CMOS"],
          ["Resolution", "1920 (H) × 1080 (V), 60 FPS"],
          ["Scan mode", "Progressive scan"],
          ["Horizontal resolution", "1100 TVL (1080P)"],
          ["Signal-to-noise ratio", "> 40 dB"],
          ["Minimum illumination", "≤ 0.1 Lux"],
          ["Focusing range", "2 mm – 200 mm"],
          ["Recording format", "MP4, 1080P 60 FPS, 18 Mbps"],
          ["Storage", "USB up to 1 TB, HDD up to 2 TB"],
        ],
      },
    ],
  },
  {
    slug: "connectors",
    name: "Connectors",
    category: "Accessories",
    tagline: "Light guide connectors and adaptors",
    heroImage: "/img/Connectors.jpg",
    intro: [
      "Welfo Endovision supplies light guide cables and connector adaptors compatible with common endoscopic light sources, manufactured and serviced in Rishikesh.",
    ],
    specs: [],
  },
];

export function productBySlug(slug: string): Product | undefined {
  return PRODUCTS.find(p => p.slug === slug);
}
