import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Account, LocationReview, Post, Review } from "../types";

interface Location {
  id: string;
  name: string;
  category: string;
  overview: string;
  details: string;
  address: string;
  photos: string[];
  mapsUrl: string;
}

const DEFAULT_LOCATIONS: Location[] = [
  {
    id: "m1",
    name: "Thiksey Monastery",
    category: "Monasteries",
    overview:
      "Iconic 12-story monastery near Leh resembling the Potala Palace in Lhasa. Features a massive Maitreya Buddha statue and stunning Indus Valley views.",
    details:
      "Founded in the 15th century, Thiksey is 19 km east of Leh at 3,600m altitude. The Chamchun (Maitreya) Buddha statue is 15m tall and spans 2 floors. Morning puja begins at 6:00 AM — visitors are welcome. Entry fee: ₹50. Best time: May–September. Photography allowed inside with permit.",
    address: "Thiksey Village, Leh–Manali Highway, 19 km from Leh city center.",
    photos: [
      "/assets/generated/thiksey-monastery.dim_800x500.jpg",
      "/assets/generated/monastery-interior.dim_800x500.jpg",
      "/assets/generated/prayer-flags-ladakh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Thiksey+Monastery+Ladakh",
  },
  {
    id: "m2",
    name: "Diskit Monastery",
    category: "Monasteries",
    overview:
      "Oldest and largest monastery in Nubra Valley, home to a giant 32-meter Maitreya Buddha statue overlooking the Shyok River.",
    details:
      "Diskit Gompa was built in the 14th century by Changzem Tserab Zangpo. The 32-meter Maitreya Buddha statue was inaugurated by the Dalai Lama in 2010. The monastery is perched on a rocky hill 3 km from Diskit village. Entry: ₹50. Note: ILP (Inner Line Permit) required to reach Nubra Valley — obtain from DC office Leh.",
    address:
      "Diskit Village, Nubra Valley, 120 km north of Leh via Khardung La pass.",
    photos: [
      "/assets/generated/diskit-monastery.dim_800x500.jpg",
      "/assets/generated/monastery-interior.dim_800x500.jpg",
      "/assets/generated/nubra-bactrian-camels.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Diskit+Monastery+Nubra",
  },
  {
    id: "m3",
    name: "Lamayuru Monastery",
    category: "Monasteries",
    overview:
      "One of Ladakh's oldest monasteries, perched dramatically on an eroded moonland plateau. Known for the annual Yuru Kabgyat festival.",
    details:
      "Lamayuru (Yungdrung) is believed to be Ladakh's oldest monastery, founded in the 10th century. The surrounding 'moonland' landscape is formed from ancient lake sediment erosion. The Yuru Kabgyat festival (June/July) features Cham mask dances. Entry: ₹30. Location: Leh–Srinagar Highway, 125 km west of Leh.",
    address:
      "Lamayuru Village, NH1 (Leh–Srinagar Highway), 125 km west of Leh.",
    photos: [
      "/assets/generated/lamayuru-monastery.dim_800x500.jpg",
      "/assets/generated/monastery-interior.dim_800x500.jpg",
      "/assets/generated/prayer-flags-ladakh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Lamayuru+Monastery+Ladakh",
  },
  {
    id: "m4",
    name: "Spituk Monastery",
    category: "Monasteries",
    overview:
      "A vibrant Gelugpa monastery on a hilltop near Leh airport, offering panoramic views of the Indus River valley.",
    details:
      "Spituk Gompa is 8 km from Leh, situated near Spituk village. The Kali shrine on the topmost tier is opened only during the Spituk Gustor festival (January). Three halls contain ancient thangkas, masks, and a large statue of Kali. Entry: ₹50. Open: 7:00 AM – 6:00 PM. Photography restricted inside.",
    address:
      "Spituk Village, 8 km south-west of Leh city, near Leh–Manali Highway.",
    photos: [
      "/assets/generated/spituk-monastery.dim_800x500.jpg",
      "/assets/generated/monastery-interior.dim_800x500.jpg",
      "/assets/generated/prayer-flags-ladakh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Spituk+Monastery+Ladakh",
  },
  {
    id: "m5",
    name: "Shey Monastery & Palace",
    category: "Monasteries",
    overview:
      "Former summer capital of Ladakh kings, housing the largest indoor copper Buddha statue. The adjacent Shey Palace ruins offer panoramic views.",
    details:
      "Shey was the ancient royal capital of Ladakh. The main gompa houses a 7.5-meter copper-gilded Shakyamuni Buddha — the largest indoor statue in Ladakh. Palace ruins date to the 17th century. Located 15 km east of Leh on the Leh–Manali Highway. Entry: ₹30. Open: 8:00 AM – 1:00 PM & 2:00 PM – 6:00 PM.",
    address: "Shey Village, Leh–Manali Highway, 15 km east of Leh city center.",
    photos: [
      "/assets/generated/shey-monastery.dim_800x500.jpg",
      "/assets/generated/monastery-interior.dim_800x500.jpg",
      "/assets/generated/leh-palace.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Shey+Monastery+Ladakh",
  },
  {
    id: "m6",
    name: "Alchi Monastery",
    category: "Monasteries",
    overview:
      "An extraordinary 11th-century monastery with rare Kashmiri-style Buddhist murals and intricate wood carvings, unlike any other in Ladakh.",
    details:
      "Alchi Chos-'khor is Ladakh's most prized heritage site, 70 km west of Leh. Built by Lotsawa Rinchen Zangpo around 1000 CE. The Sumtsek temple has three floors of giant bodhisattva statues painted with miniature scenes. Entry: ₹50. Open: 8:00 AM – 1:00 PM & 2:00 PM – 6:00 PM. No photography inside.",
    address:
      "Alchi Village, 70 km west of Leh via Srinagar Highway, turn at Saspool.",
    photos: [
      "/assets/generated/hemis-monastery.dim_800x500.jpg",
      "/assets/generated/monastery-interior.dim_800x500.jpg",
      "/assets/generated/prayer-flags-ladakh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Alchi+Monastery+Ladakh",
  },
  {
    id: "t1",
    name: "Namgyal Tsemo Temple",
    category: "Temples",
    overview:
      "A hilltop Buddhist temple above Leh Palace with a striking red tower and golden 3-story Maitreya statue, offering 360° panoramic views of Leh.",
    details:
      "Namgyal Tsemo ('peak of victory') is reached by a steep 20-minute trek from Leh Palace or a road from Changspa. The temple houses a 3-story golden Maitreya (Chamba) Buddha. The red watch-tower structure above is the gonkhang (protector shrine), open only in January. Sunrise visits offer the best photography. Entry: ₹30.",
    address:
      "Namgyal Tsemo Hill, above Old Leh town. Trailhead behind Leh Palace.",
    photos: [
      "/assets/generated/shanti-stupa.dim_800x500.jpg",
      "/assets/generated/monastery-interior.dim_800x500.jpg",
      "/assets/generated/prayer-flags-ladakh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Namgyal+Tsemo+Leh",
  },
  {
    id: "t2",
    name: "Stok Guru Lhakhang",
    category: "Temples",
    overview:
      "Ancient temple at the foot of Stok Palace, known for vivid Tantric murals and peaceful meditation chambers.",
    details:
      "Stok Guru Lhakhang is adjacent to Stok Palace, 15 km south of Leh across the Indus River. The temple is dedicated to Guru Padmasambhava. Features vibrant Tantric murals, ancient thangkas, and a meditation cave used by past lamas. The Stok Kangri trekking base camp is nearby. Entry: combined with Stok Palace (₹100).",
    address:
      "Stok Village, 15 km south of Leh across Indus River. Cross Stok bridge from Choglamsar.",
    photos: [
      "/assets/generated/leh-palace.dim_800x500.jpg",
      "/assets/generated/monastery-interior.dim_800x500.jpg",
      "/assets/generated/prayer-flags-ladakh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Stok+Palace+Ladakh",
  },
  {
    id: "t3",
    name: "Leh Jama Masjid",
    category: "Temples",
    overview:
      "One of Ladakh's largest and oldest mosques, built in the 17th century. A symbol of interfaith harmony in Leh's vibrant main bazaar.",
    details:
      "Leh Jama Masjid was built during the reign of Deldan Namgyal in the 17th century. The mosque features tall wooden pillars, green-painted wooden balcony, and a central prayer hall for 500 worshippers. Located in the heart of the Leh main bazaar (Moti Market). Visitors are welcome outside prayer times. Friday prayers at 1:15 PM are the largest. Respectful dress required.",
    address:
      "Main Bazaar Road (Moti Market), central Leh town. 5 minutes walk from Leh Palace.",
    photos: [
      "/assets/generated/leh-jama-masjid.dim_800x500.jpg",
      "/assets/generated/leh-jama-masjid.dim_800x500.jpg",
      "/assets/generated/prayer-flags-ladakh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Leh+Jama+Masjid",
  },
  {
    id: "p1",
    name: "Pangong Lake",
    category: "Parks",
    overview:
      "The world-famous high-altitude saltwater lake at 4,350m, straddling India and China. Crystal-clear turquoise-blue waters change color through the day.",
    details:
      "Pangong Tso is 134 km long — one-third in India, two-thirds in China. The lake's colors shift from turquoise to deep blue. The Indian side ends at Spangmik village. Overnight camping is allowed. Nearest town: Durbuk. Distance from Leh: 160 km via Chang La pass (5,360m). ILP (Inner Line Permit) required — get at Leh DC office. Best time: May–September.",
    address:
      "Pangong Tso, Chang La Highway, 160 km east of Leh. Via Chang La Pass (5,360m altitude).",
    photos: [
      "/assets/generated/pangong-lake.dim_800x500.jpg",
      "/assets/generated/pangong-lake-sunset.dim_800x500.jpg",
      "/assets/generated/nubra-valley.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Pangong+Lake+Ladakh",
  },
  {
    id: "p2",
    name: "Nubra Valley",
    category: "Parks",
    overview:
      "A stunning high-altitude cold desert with double-humped Bactrian camels, golden sand dunes, lush orchards, and ancient monasteries.",
    details:
      "Nubra Valley lies 120 km north of Leh via Khardung La (5,359m, one of the world's highest motorable roads). The valley is divided by the Shyok and Nubra rivers. Hunder village has sand dunes with Bactrian camel safaris. Diskit is the main town. ILP required. Best time: May–September. Accommodation available in camps and guesthouses.",
    address:
      "Nubra Valley, 120 km north of Leh via Khardung La Pass (5,359m). Main village: Diskit.",
    photos: [
      "/assets/generated/nubra-valley.dim_800x500.jpg",
      "/assets/generated/nubra-bactrian-camels.dim_800x500.jpg",
      "/assets/generated/diskit-monastery.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Nubra+Valley+Ladakh",
  },
  {
    id: "p3",
    name: "Hemis National Park",
    category: "Parks",
    overview:
      "India's largest national park by area, home to the elusive snow leopard, Tibetan wolf, and over 200 bird species in pristine Himalayan wilderness.",
    details:
      "Hemis National Park covers 4,400 sq km in south-east Ladakh. Best known for snow leopard sightings (winter: Jan–March is peak). Also home to blue sheep (bharal), Tibetan wolf, red fox, and Eurasian lynx. Entry fee: ₹25 (Indian), ₹100 (foreign). Permit required at Hemis village checkpoint. Guided treks available. Headquarters at Hemis village, 45 km from Leh.",
    address:
      "Hemis Village, 45 km south-east of Leh via Karu on Leh–Manali Highway.",
    photos: [
      "/assets/generated/nubra-valley.dim_800x500.jpg",
      "/assets/generated/pangong-lake-sunset.dim_800x500.jpg",
      "/assets/generated/prayer-flags-ladakh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Hemis+National+Park+Ladakh",
  },
  {
    id: "h1",
    name: "SNM Hospital Leh",
    category: "Hospitals",
    overview:
      "The main government district hospital in Leh, providing general medicine, surgery, maternity, and 24/7 emergency services for Ladakh.",
    details:
      "Sonam Norboo Memorial (SNM) Hospital is the primary healthcare facility for Leh district. Services: emergency, surgery, maternity, pediatrics, orthopedics, radiology. Open 24/7. Emergency helpline: 01982-252012. OPD: 9:00 AM – 2:00 PM. Specialist outreach camps regularly held. Blood bank available on campus.",
    address:
      "Fort Road, Leh town center, Ladakh. Near Leh Palace road junction.",
    photos: [
      "/assets/generated/snm-hospital-leh.dim_800x500.jpg",
      "/assets/generated/leh-hospital.dim_800x500.jpg",
      "/assets/generated/navodaya-school-leh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=SNM+Hospital+Leh",
  },
  {
    id: "h2",
    name: "SDRRF Hospital",
    category: "Hospitals",
    overview:
      "Emergency trauma and high-altitude medical care for civilians in Leh. Equipped for altitude sickness treatment.",
    details:
      "SDRRF (Sonam Dawa Rimpoche Regional Referral Facility) handles trauma, high-altitude pulmonary edema (HAPE), and acute mountain sickness (AMS). Emergency: call 01982-252360. Open 24/7. Oxygen therapy available. Important for trekkers and tourists — come immediately if experiencing severe headache, breathlessness, or confusion at altitude.",
    address:
      "Leh town, near Main Bazaar. Refer to SNM Hospital for exact SDRRF block location.",
    photos: [
      "/assets/generated/leh-hospital.dim_800x500.jpg",
      "/assets/generated/snm-hospital-leh.dim_800x500.jpg",
      "/assets/generated/navodaya-school-leh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=SDRRF+Hospital+Leh",
  },
  {
    id: "h3",
    name: "Kargil District Hospital",
    category: "Hospitals",
    overview:
      "Primary government hospital for Kargil district providing general medicine, surgical, and maternity services.",
    details:
      "Kargil District Hospital is the main public health facility for Kargil district. Services: general OPD, surgery, maternity, emergency. Open 24/7 for emergencies. OPD: 10:00 AM – 2:00 PM. Emergency: 01985-232029. Located in Kargil town, 204 km west of Leh on NH1 (Srinagar–Leh Highway).",
    address:
      "Kargil Town, NH1 (Srinagar–Leh Highway), 204 km west of Leh city.",
    photos: [
      "/assets/generated/leh-hospital.dim_800x500.jpg",
      "/assets/generated/snm-hospital-leh.dim_800x500.jpg",
      "/assets/generated/leh-police.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Kargil+District+Hospital",
  },
  {
    id: "s1",
    name: "Jawahar Navodaya Vidyalaya",
    category: "Schools",
    overview:
      "A prestigious residential central government school offering quality CBSE education (Classes 6–12) with free boarding for rural Ladakhi students.",
    details:
      "JNV Leh is a fully residential government school under Navodaya Vidyalaya Samiti, providing free education including boarding and meals. Admission via JNVST entrance exam (Class 6). Subjects include Hindi, English, Math, Science, Social Studies and vocational skills. Classes 6–12. Admissions open November–January each year. School is 5 km from Leh city.",
    address: "Leh Chanthang Road, 5 km from Leh city. Near Choglamsar village.",
    photos: [
      "/assets/generated/navodaya-school-leh.dim_800x500.jpg",
      "/assets/generated/druk-white-lotus-school.dim_800x500.jpg",
      "/assets/generated/prayer-flags-ladakh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Jawahar+Navodaya+Vidyalaya+Leh",
  },
  {
    id: "s2",
    name: "Druk White Lotus School",
    category: "Schools",
    overview:
      "Award-winning eco-friendly school combining modern CBSE curriculum with traditional Ladakhi culture, language, and values.",
    details:
      "Druk White Lotus School won the RIBA Stirling Prize nomination and RICS Award for sustainable architecture. The school integrates traditional Ladakhi arts, Tibetan language, and Buddhist philosophy into the standard CBSE curriculum. Solar-powered, earthquake-resistant buildings. Located in Shey village, 15 km from Leh. Admissions open for Ladakhi children prioritized.",
    address:
      "Shey Village, 15 km east of Leh on Leh–Manali Highway, near Shey Palace.",
    photos: [
      "/assets/generated/druk-white-lotus-school.dim_800x500.jpg",
      "/assets/generated/navodaya-school-leh.dim_800x500.jpg",
      "/assets/generated/prayer-flags-ladakh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Druk+White+Lotus+School+Ladakh",
  },
  {
    id: "e1",
    name: "Leh Police Station",
    category: "Emergency",
    overview:
      "Main district police headquarters for Leh. Contact for emergencies, FIR registration, tourist assistance, and public safety.",
    details:
      "Leh Police Station is the primary law enforcement office for Leh district. Services: FIR registration, lost document complaints, tourist safety, emergency response. Police helpline: 100. Station number: 01982-252018. Open 24/7. For tourist emergencies, Tourist Police Cell is available during day hours. ILP (Inner Line Permit) queries can also be directed here.",
    address:
      "Police Station Road, Leh town. Near DC Office and Main Bazaar, central Leh.",
    photos: [
      "/assets/generated/leh-police.dim_800x500.jpg",
      "/assets/generated/leh-hospital.dim_800x500.jpg",
      "/assets/generated/navodaya-school-leh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Leh+Police+Station",
  },
  {
    id: "e2",
    name: "Kargil Police Station",
    category: "Emergency",
    overview:
      "District police headquarters for Kargil. Contact for law enforcement and emergency assistance. Open 24/7.",
    details:
      "Kargil Police Station handles all law enforcement for Kargil district including Zanskar sub-division. Services: FIR registration, emergency response, border area movement permits. Police helpline: 100. Station number: 01985-232033. Located in Kargil town, 204 km from Leh on Srinagar–Leh Highway. Open 24/7.",
    address:
      "Kargil Town, near DC Office, NH1 Srinagar–Leh Highway. 204 km west of Leh.",
    photos: [
      "/assets/generated/leh-police.dim_800x500.jpg",
      "/assets/generated/leh-hospital.dim_800x500.jpg",
      "/assets/generated/navodaya-school-leh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Kargil+Police+Station",
  },
  {
    id: "b1",
    name: "State Bank of India – Leh",
    category: "Banks/ATMs",
    overview:
      "Main SBI branch in Leh with full banking services including foreign exchange, 24/7 ATM, business accounts, and remittance.",
    details:
      "SBI Leh Branch (Branch Code: 01234) offers full retail and corporate banking. Foreign exchange counter: open Mon–Sat 10:00 AM – 3:00 PM. 24-hour ATM available outside branch. NEFT/RTGS and UPI transfers available. For emergencies: SBI helpline 1800-425-3800 (toll-free). Bring valid ID for all transactions.",
    address:
      "Main Bazaar, Fort Road, Leh town center. Near Leh Palace intersection.",
    photos: [
      "/assets/generated/ladakh-bank-sbi.dim_800x500.jpg",
      "/assets/generated/leh-hospital.dim_800x500.jpg",
      "/assets/generated/navodaya-school-leh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=SBI+Bank+Leh",
  },
  {
    id: "b2",
    name: "J&K Bank – Leh",
    category: "Banks/ATMs",
    overview:
      "Jammu & Kashmir Bank flagship Leh branch. Full ATM, loans, current/savings accounts, and local banking services.",
    details:
      "J&K Bank Leh Branch is one of the longest-serving banks in Ladakh. Services include savings and current accounts, personal loans, ATM, mobile banking (mPay), and domestic transfers. Open Mon–Sat 10:00 AM – 4:00 PM. ATM: 24 hours. Helpline: 1800-180-7087. The bank also handles government salary accounts for Ladakh government employees.",
    address: "Main Bazaar Road, Leh town. Adjacent to Leh Police Station area.",
    photos: [
      "/assets/generated/ladakh-bank-sbi.dim_800x500.jpg",
      "/assets/generated/leh-hospital.dim_800x500.jpg",
      "/assets/generated/leh-police.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=JK+Bank+Leh",
  },
  {
    id: "b3",
    name: "Punjab National Bank – Kargil",
    category: "Banks/ATMs",
    overview:
      "PNB branch serving Kargil district with full retail banking, 24/7 ATM facility, and government scheme services.",
    details:
      "PNB Kargil Branch serves the Kargil district banking needs. Services: savings/current accounts, ATM, loans, PM Jan Dhan and government benefit schemes, UPI/mobile banking. Open Mon–Sat 10:00 AM – 4:00 PM. ATM: 24/7. PNB Helpline: 1800-180-2222. Located on main Kargil market road, 204 km west of Leh.",
    address:
      "Main Market, Kargil Town, NH1 Srinagar–Leh Highway. 204 km west of Leh.",
    photos: [
      "/assets/generated/ladakh-bank-sbi.dim_800x500.jpg",
      "/assets/generated/leh-hospital.dim_800x500.jpg",
      "/assets/generated/leh-police.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=PNB+Bank+Kargil",
  },
];

const LOCATION_CATEGORIES = [
  "All",
  "Monasteries",
  "Temples",
  "Parks",
  "Schools",
  "Hospitals",
  "Emergency",
  "Banks/ATMs",
];
const BUSINESS_CATEGORIES = ["Hotels", "Food", "Shopping", "Services"];
const ALL_CATEGORIES = [...LOCATION_CATEGORIES, ...BUSINESS_CATEGORIES];

const STORAGE_KEY = "lc_customLocations";

function loadLocations(): Location[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_LOCATIONS;
    const overrides: Record<string, Partial<Location>> = JSON.parse(saved);
    return DEFAULT_LOCATIONS.map((loc) =>
      overrides[loc.id] ? { ...loc, ...overrides[loc.id] } : loc,
    );
  } catch {
    return DEFAULT_LOCATIONS;
  }
}

function saveLocationOverride(id: string, changes: Partial<Location>) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const overrides: Record<string, Partial<Location>> = saved
      ? JSON.parse(saved)
      : {};
    overrides[id] = { ...(overrides[id] || {}), ...changes };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {}
}

interface Props {
  accounts: Account[];
  posts: Post[];
  reviews: Review[];
  currentUserId: string;
  currentUserRole: string;
  locationReviews?: LocationReview[];
  onAddReview: (r: Omit<Review, "id" | "timestamp">) => void;
  onAddLocationReview?: (r: Omit<LocationReview, "id" | "timestamp">) => void;
  isCreator?: boolean;
  onApprovePost?: (id: string) => void;
  onRejectPost?: (id: string) => void;
}

function StarRating({
  rating,
  onChange,
}: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          className={`text-lg transition-transform hover:scale-110 ${
            s <= rating ? "text-amber-400" : "text-zinc-700"
          } ${onChange ? "cursor-pointer" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function Overlay({
  onClose,
  children,
}: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      aria-label="Close"
    >
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative w-full max-w-lg mx-auto bg-zinc-900 rounded-t-3xl border-t border-zinc-700 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mt-4 mb-2" />
        {children}
      </div>
    </div>
  );
}

function PhotoGallery({ photos, name }: { photos: string[]; name: string }) {
  const [active, setActive] = useState(0);
  return (
    <div className="mb-4">
      <div className="relative h-48 rounded-xl overflow-hidden">
        <img
          src={photos[active]}
          alt={`${name} view ${active + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "/assets/generated/thiksey-monastery.dim_800x500.jpg";
          }}
        />
        <div className="absolute bottom-2 right-2 flex gap-1">
          {photos.map((_, i) => (
            <button
              key={`dot-${String(i)}`}
              type="button"
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === active ? "bg-amber-400 w-4" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 mt-2">
          {photos.map((p, i) => (
            <button
              key={`thumb-${String(i)}`}
              type="button"
              onClick={() => setActive(i)}
              className={`flex-1 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === active
                  ? "border-amber-400"
                  : "border-transparent opacity-60 hover:opacity-90"
              }`}
            >
              <img
                src={p}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/assets/generated/thiksey-monastery.dim_800x500.jpg";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LocationCard({
  location,
  locationReviews,
  currentUserId,
  currentUsername,
  onAddLocationReview,
  isCreator,
  onEditLocation,
}: {
  location: Location;
  locationReviews: LocationReview[];
  currentUserId: string;
  currentUsername: string;
  onAddLocationReview?: (r: Omit<LocationReview, "id" | "timestamp">) => void;
  isCreator?: boolean;
  onEditLocation?: (id: string, changes: Partial<Location>) => void;
}) {
  const [sheet, setSheet] = useState<"" | "details" | "reviews" | "edit">("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [editName, setEditName] = useState(location.name);
  const [editOverview, setEditOverview] = useState(location.overview);
  const [editDetails, setEditDetails] = useState(location.details);
  const [editAddress, setEditAddress] = useState(location.address);
  const [editMaps, setEditMaps] = useState(location.mapsUrl);

  const myReviews = locationReviews.filter((r) => r.locationId === location.id);
  const avgRating = myReviews.length
    ? myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length
    : 0;

  function submitReview() {
    if (!newComment.trim()) return;
    onAddLocationReview?.({
      locationId: location.id,
      reviewerUserId: currentUserId,
      reviewerUsername: currentUsername,
      rating: newRating,
      comment: newComment.trim(),
    });
    setNewComment("");
    setNewRating(5);
    toast.success("Review submitted!");
  }

  function saveEdit() {
    const changes: Partial<Location> = {
      name: editName,
      overview: editOverview,
      details: editDetails,
      address: editAddress,
      mapsUrl: editMaps,
    };
    onEditLocation?.(location.id, changes);
    setSheet("");
    toast.success("Location updated!");
  }

  return (
    <>
      <div className="rounded-2xl overflow-hidden bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600 transition-all duration-300 hover:scale-[1.01]">
        <div className="relative h-44 overflow-hidden">
          <img
            src={location.photos[0]}
            alt={location.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/assets/generated/thiksey-monastery.dim_800x500.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3">
            <span className="text-xs bg-amber-500/90 text-black px-2 py-0.5 rounded-full font-semibold">
              {location.category}
            </span>
          </div>
          {avgRating > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-lg text-xs text-amber-400 font-bold">
              ★ {avgRating.toFixed(1)}
            </div>
          )}
          {isCreator && (
            <button
              type="button"
              onClick={() => setSheet("edit")}
              className="absolute top-2 left-2 bg-black/70 hover:bg-amber-500/80 px-2 py-1 rounded-lg text-xs text-white font-semibold transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">edit</span>
              Edit
            </button>
          )}
          {location.photos.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded-full text-xs text-white">
              📷 {location.photos.length}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-white text-base mb-1">
            {location.name}
          </h3>
          <p className="text-zinc-400 text-xs line-clamp-2 mb-3">
            {location.overview}
          </p>
          <div className="flex gap-2">
            <a
              href={location.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                directions
              </span>
              Directions
            </a>
            <button
              type="button"
              onClick={() => setSheet("details")}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">info</span>
              Details
            </button>
            <button
              type="button"
              onClick={() => setSheet("reviews")}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">star</span>
              Reviews
            </button>
          </div>
        </div>
      </div>

      {sheet === "details" && (
        <Overlay onClose={() => setSheet("")}>
          <div className="p-6">
            <PhotoGallery photos={location.photos} name={location.name} />
            <h2 className="text-xl font-bold text-white mb-1">
              {location.name}
            </h2>
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
              {location.category}
            </span>
            <p className="text-zinc-300 text-sm mt-3 leading-relaxed">
              {location.overview}
            </p>

            <div className="mt-4 bg-zinc-800/60 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-400 mb-2 uppercase tracking-wide">
                Key Information
              </p>
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                {location.details}
              </p>
            </div>

            <div className="mt-3 bg-zinc-800/40 rounded-xl p-3 flex gap-2 items-start">
              <span className="material-symbols-outlined text-amber-400 text-base mt-0.5">
                location_on
              </span>
              <div>
                <p className="text-xs font-semibold text-zinc-400 mb-0.5">
                  Address & How to Get There
                </p>
                <p className="text-zinc-300 text-sm">{location.address}</p>
              </div>
            </div>

            <a
              href={location.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                directions
              </span>
              Open in Google Maps
            </a>
          </div>
        </Overlay>
      )}

      {sheet === "reviews" && (
        <Overlay onClose={() => setSheet("")}>
          <div className="p-6">
            <h2 className="text-lg font-bold text-white mb-1">
              {location.name} Reviews
            </h2>
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-amber-400">
                  {avgRating.toFixed(1)}
                </span>
                <StarRating rating={Math.round(avgRating)} />
                <span className="text-zinc-500 text-xs">
                  ({myReviews.length} reviews)
                </span>
              </div>
            )}
            {onAddLocationReview && (
              <div className="bg-zinc-800 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-zinc-300 mb-2">
                  Leave a Review
                </p>
                <StarRating rating={newRating} onChange={setNewRating} />
                <textarea
                  className="mt-2 w-full bg-zinc-900 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
                  rows={2}
                  placeholder="Share your experience..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  type="button"
                  onClick={submitReview}
                  className="mt-2 w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors"
                >
                  Submit Review
                </button>
              </div>
            )}
            {myReviews.length === 0 && (
              <p className="text-zinc-500 text-sm text-center py-4">
                No reviews yet. Be the first!
              </p>
            )}
            {myReviews.map((r) => (
              <div key={r.id} className="border-b border-zinc-800 pb-3 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">
                    @{r.reviewerUsername}
                  </span>
                  <StarRating rating={r.rating} />
                </div>
                <p className="text-sm text-zinc-300">{r.comment}</p>
              </div>
            ))}
          </div>
        </Overlay>
      )}

      {sheet === "edit" && isCreator && (
        <Overlay onClose={() => setSheet("")}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-amber-400">
                edit_location
              </span>
              <h2 className="text-lg font-bold text-white">Edit Location</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label
                  className="text-xs text-zinc-400 font-semibold mb-1 block"
                  htmlFor="edit-name"
                >
                  Location Name
                </label>
                <input
                  id="edit-name"
                  className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="text-xs text-zinc-400 font-semibold mb-1 block"
                  htmlFor="edit-overview"
                >
                  Short Overview
                </label>
                <textarea
                  id="edit-overview"
                  className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
                  rows={2}
                  value={editOverview}
                  onChange={(e) => setEditOverview(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="text-xs text-zinc-400 font-semibold mb-1 block"
                  htmlFor="edit-details"
                >
                  Detailed Information
                </label>
                <textarea
                  id="edit-details"
                  className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
                  rows={4}
                  value={editDetails}
                  onChange={(e) => setEditDetails(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="text-xs text-zinc-400 font-semibold mb-1 block"
                  htmlFor="edit-address"
                >
                  Address & Directions
                </label>
                <textarea
                  id="edit-address"
                  className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="text-xs text-zinc-400 font-semibold mb-1 block"
                  htmlFor="edit-maps"
                >
                  Google Maps URL
                </label>
                <input
                  id="edit-maps"
                  className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  value={editMaps}
                  onChange={(e) => setEditMaps(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setSheet("")}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-sm hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
}

function BusinessCard({
  account,
  reviews,
  currentUserId,
  currentUserRole,
  onAddReview,
}: {
  account: Account;
  reviews: Review[];
  currentUserId: string;
  currentUserRole: string;
  onAddReview: (r: Omit<Review, "id" | "timestamp">) => void;
}) {
  const [sheet, setSheet] = useState<"" | "details" | "reviews">("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  const businesses = account.businesses || [];
  const firstBiz = businesses[0];
  if (!firstBiz && !account.businessName) return null;

  const bizName = firstBiz?.name || account.businessName || "";
  const bizDesc = firstBiz?.description || account.businessDescription || "";
  const bizCat = firstBiz?.category || account.businessCategory || "";
  const bizMaps = firstBiz?.mapsUrl || "";
  const bizPhotos = firstBiz?.photos || [];

  const myReviews = reviews.filter((r) => r.targetMemberId === account.id);
  const avgRating = myReviews.length
    ? myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length
    : 0;

  function submitReview() {
    if (!newComment.trim()) return;
    onAddReview({
      targetMemberId: account.id,
      targetMemberName: bizName,
      reviewerUserId: currentUserId,
      reviewerUsername: "you",
      rating: newRating,
      comment: newComment.trim(),
    });
    setNewComment("");
    setNewRating(5);
    toast.success("Review submitted!");
  }

  return (
    <>
      <div className="rounded-2xl overflow-hidden bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/30 transition-all duration-300 hover:scale-[1.01]">
        <div className="relative h-44 overflow-hidden bg-zinc-800">
          {bizPhotos.length > 0 ? (
            <img
              src={bizPhotos[0]}
              alt={bizName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-zinc-600">
                store
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3">
            <span className="text-xs bg-blue-500/90 text-white px-2 py-0.5 rounded-full font-semibold">
              {bizCat || "Business"}
            </span>
          </div>
          {avgRating > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-lg text-xs text-amber-400 font-bold">
              ★ {avgRating.toFixed(1)}
            </div>
          )}
          <div className="absolute top-2 left-2 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full text-xs text-amber-300">
            {account.membershipTier === "Premier" ? "⭐ Premier" : "Member"}
          </div>
          {bizPhotos.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded-full text-xs text-white">
              📷 {bizPhotos.length}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-white text-base mb-0.5">{bizName}</h3>
          <p className="text-zinc-500 text-xs mb-1">by @{account.username}</p>
          <p className="text-zinc-400 text-xs line-clamp-2 mb-3">{bizDesc}</p>
          <div className="flex gap-2">
            {bizMaps ? (
              <a
                href={bizMaps}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  directions
                </span>
                Directions
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="flex-1 py-2 rounded-lg bg-zinc-800/50 text-xs text-zinc-600"
              >
                No Map
              </button>
            )}
            <button
              type="button"
              onClick={() => setSheet("details")}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">info</span>
              Details
            </button>
            <button
              type="button"
              onClick={() => setSheet("reviews")}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">star</span>
              Reviews
            </button>
          </div>
        </div>
      </div>

      {sheet === "details" && (
        <Overlay onClose={() => setSheet("")}>
          <div className="p-6">
            {bizPhotos.length > 0 && (
              <PhotoGallery photos={bizPhotos} name={bizName} />
            )}
            <h2 className="text-xl font-bold text-white">{bizName}</h2>
            <p className="text-zinc-500 text-sm">
              by @{account.username} · {bizCat}
            </p>
            <p className="text-zinc-300 text-sm mt-3 leading-relaxed">
              {bizDesc}
            </p>
            {bizMaps && (
              <a
                href={bizMaps}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  directions
                </span>
                Get Directions
              </a>
            )}
          </div>
        </Overlay>
      )}

      {sheet === "reviews" && (
        <Overlay onClose={() => setSheet("")}>
          <div className="p-6">
            <h2 className="text-lg font-bold text-white mb-2">
              {bizName} Reviews
            </h2>
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-amber-400">
                  {avgRating.toFixed(1)}
                </span>
                <StarRating rating={Math.round(avgRating)} />
                <span className="text-zinc-500 text-xs">
                  ({myReviews.length})
                </span>
              </div>
            )}
            {currentUserRole === "user" && (
              <div className="bg-zinc-800 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-zinc-300 mb-2">
                  Write a Review
                </p>
                <StarRating rating={newRating} onChange={setNewRating} />
                <textarea
                  className="mt-2 w-full bg-zinc-900 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
                  rows={2}
                  placeholder="Share your experience..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  type="button"
                  onClick={submitReview}
                  className="mt-2 w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors"
                >
                  Submit
                </button>
              </div>
            )}
            {myReviews.length === 0 && (
              <p className="text-zinc-500 text-sm text-center py-4">
                No reviews yet.
              </p>
            )}
            {myReviews.map((r) => (
              <div key={r.id} className="border-b border-zinc-800 pb-3 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">
                    @{r.reviewerUsername}
                  </span>
                  <StarRating rating={r.rating} />
                </div>
                <p className="text-sm text-zinc-300">{r.comment}</p>
              </div>
            ))}
          </div>
        </Overlay>
      )}
    </>
  );
}

export function ExploreTab({
  accounts,
  posts,
  reviews,
  currentUserId,
  currentUserRole,
  locationReviews = [],
  onAddReview,
  onAddLocationReview,
  isCreator,
  onApprovePost,
  onRejectPost,
}: Props) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [locations, setLocations] = useState<Location[]>(loadLocations);
  const currentAccount = accounts.find((a) => a.id === currentUserId);
  const currentUsername = currentAccount?.username || "user";

  useEffect(() => {
    setLocations(loadLocations());
  }, []);

  function handleEditLocation(id: string, changes: Partial<Location>) {
    saveLocationOverride(id, changes);
    setLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, ...changes } : loc)),
    );
  }

  const memberBusinesses = accounts.filter(
    (a) =>
      a.role === "member" &&
      a.status !== "banned" &&
      a.status !== "suspended" &&
      ((a.businesses && a.businesses.length > 0) || a.businessName),
  );

  const isBusinessCategory = BUSINESS_CATEGORIES.includes(activeCategory);

  const filteredLocations = !isBusinessCategory
    ? locations.filter(
        (l) => activeCategory === "All" || l.category === activeCategory,
      )
    : [];

  const filteredBusinesses =
    activeCategory === "All"
      ? memberBusinesses
      : isBusinessCategory
        ? memberBusinesses.filter((a) => {
            const biz = (a.businesses || [])[0];
            const cat = biz?.category || a.businessCategory || "";
            return cat.toLowerCase() === activeCategory.toLowerCase();
          })
        : [];

  const pendingPosts = posts.filter((p) => p.status === "pending");

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-1">Explore Ladakh</h2>
        <p className="text-zinc-500 text-sm">
          Discover monasteries, places, and local businesses
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeCategory === cat
                ? "bg-amber-500 text-black"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isCreator && pendingPosts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">pending</span>
            Pending Posts ({pendingPosts.length})
          </h3>
          {pendingPosts.map((post) => (
            <div
              key={post.id}
              className="bg-zinc-900 border border-amber-500/30 rounded-xl p-4 mb-3"
            >
              <p className="font-semibold text-white text-sm">{post.title}</p>
              <p className="text-xs text-zinc-400 mb-3">{post.description}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onApprovePost?.(post.id)}
                  className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-semibold"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => onRejectPost?.(post.id)}
                  className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredLocations.length > 0 && (
        <div className="mb-6">
          {filteredBusinesses.length > 0 && (
            <h3 className="text-sm font-bold text-zinc-400 mb-3">
              📍 Locations
            </h3>
          )}
          <div className="grid grid-cols-1 gap-4">
            {filteredLocations.map((loc) => (
              <LocationCard
                key={loc.id}
                location={loc}
                locationReviews={locationReviews}
                currentUserId={currentUserId}
                currentUsername={currentUsername}
                onAddLocationReview={onAddLocationReview}
                isCreator={isCreator}
                onEditLocation={handleEditLocation}
              />
            ))}
          </div>
        </div>
      )}

      {filteredBusinesses.length > 0 && (
        <div className="mb-6">
          {activeCategory === "All" && (
            <h3 className="text-sm font-bold text-zinc-400 mb-3">
              🏪 Local Businesses
            </h3>
          )}
          <div className="grid grid-cols-1 gap-4">
            {filteredBusinesses.map((acc) => (
              <BusinessCard
                key={acc.id}
                account={acc}
                reviews={reviews}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onAddReview={onAddReview}
              />
            ))}
          </div>
        </div>
      )}

      {filteredLocations.length === 0 && filteredBusinesses.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <span className="material-symbols-outlined text-4xl block mb-2">
            search_off
          </span>
          <p className="text-sm">
            No results for &ldquo;{activeCategory}&rdquo;
          </p>
          {isBusinessCategory && (
            <p className="text-xs mt-1">
              Members can list businesses in this category
            </p>
          )}
        </div>
      )}

      {posts.filter((p) => p.status === "approved").length > 0 &&
        activeCategory === "All" && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-zinc-400 mb-3">
              🌿 Community Discovered
            </h3>
            {posts
              .filter((p) => p.status === "approved")
              .map((post) => (
                <div
                  key={post.id}
                  className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-4 mb-3"
                >
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h4 className="font-bold text-white text-sm">{post.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-zinc-600">
                      @{post.submitterUsername}
                    </span>
                    {post.googleMapsLink && (
                      <a
                        href={post.googleMapsLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-amber-400 hover:underline"
                      >
                        View on Maps
                      </a>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
    </div>
  );
}
