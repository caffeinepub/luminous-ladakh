import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { loadRoadStatus, saveRoadStatus } from "../data/roadStatusData";
import type { RoadStatus } from "../types";
import type { Account, LocationReview, Post, Review } from "../types";
import { CommunityPolls } from "./CommunityPolls";
import { EmergencySOS } from "./EmergencySOS";
import { RoadStatusWidget } from "./RoadStatusWidget";
import { WeatherWidget } from "./WeatherWidget";

interface Location {
  id: string;
  name: string;
  category: string;
  overview: string;
  details: string;
  address: string;
  photos: string[];
  mapsUrl: string;
  season?: string;
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
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Thikse_Monastery_.jpg/1280px-Thikse_Monastery_.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Thikse_Monastery%2C_Ladakh%2C_India_-_2.jpg/1280px-Thikse_Monastery%2C_Ladakh%2C_India_-_2.jpg",
      "/assets/generated/prayer-flags-ladakh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Thiksey+Monastery+Ladakh",
    season: "May–Oct",
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
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Diskit_Gompa_2.jpg/1280px-Diskit_Gompa_2.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Maitreya_Buddha_-_Nubra.jpg/800px-Maitreya_Buddha_-_Nubra.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Monk_at_Diskit_Gompa.jpg/800px-Monk_at_Diskit_Gompa.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Diskit+Monastery+Nubra",
    season: "May–Sep",
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
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Lamayuru_Monastery%2C_Ladakh%2C_India.jpg/1280px-Lamayuru_Monastery%2C_Ladakh%2C_India.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Lamayuru_monastery_2009.jpg/1280px-Lamayuru_monastery_2009.jpg",
      "/assets/generated/prayer-flags-ladakh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Lamayuru+Monastery+Ladakh",
    season: "May–Oct",
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
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Spituk.jpg/1280px-Spituk.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/b/be/Spituk_Monastery-2008.jpg",
      "/assets/generated/prayer-flags-ladakh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Spituk+Monastery+Ladakh",
    season: "Year Round",
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
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Shey_Palace%2C_Ladakh_01.jpg/1280px-Shey_Palace%2C_Ladakh_01.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Shey_Palace%2C_Ladakh_02.jpg/1280px-Shey_Palace%2C_Ladakh_02.jpg",
      "/assets/generated/prayer-flags-ladakh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Shey+Monastery+Ladakh",
    season: "Apr–Oct",
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
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Alchi.jpg/1280px-Alchi.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Alchi_Monastery_%26_Village.jpg/1280px-Alchi_Monastery_%26_Village.jpg",
      "/assets/generated/prayer-flags-ladakh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Alchi+Monastery+Ladakh",
    season: "Apr–Oct",
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
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Namgyal_Tsemo_Monastery%2C_Leh_01.jpg/1280px-Namgyal_Tsemo_Monastery%2C_Leh_01.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Tsemo_Gompa_-_2.jpg/1280px-Tsemo_Gompa_-_2.jpg",
      "/assets/generated/prayer-flags-ladakh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Namgyal+Tsemo+Leh",
    season: "Year Round",
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
    season: "Year Round",
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
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Leh_mosque_and_palace.jpg/1280px-Leh_mosque_and_palace.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Leh-old-town-jama-masjid_1934.jpg/1280px-Leh-old-town-jama-masjid_1934.jpg",
      "/assets/generated/prayer-flags-ladakh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Leh+Jama+Masjid",
    season: "Year Round",
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
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Pangong_tso.jpg/1280px-Pangong_tso.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Pangong_Tso_lake_in_Ladakh_India.jpg/1280px-Pangong_Tso_lake_in_Ladakh_India.jpg",
      "/assets/generated/pangong-lake-sunset.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Pangong+Lake+Ladakh",
    season: "May–Sep",
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
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Nubra_Valley_2.jpg/1280px-Nubra_Valley_2.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Sand_dunes_of_Nubra_Valley%2C_Ladakh.jpg/1280px-Sand_dunes_of_Nubra_Valley%2C_Ladakh.jpg",
      "/assets/generated/nubra-bactrian-camels.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Nubra+Valley+Ladakh",
    season: "May–Sep",
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
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/13-10-08_217_CONFLUENCE_OF_INDUS_RIVER_N.jpg/1280px-13-10-08_217_CONFLUENCE_OF_INDUS_RIVER_N.jpg",
      "/assets/generated/nubra-valley.dim_800x500.jpg",
      "/assets/generated/prayer-flags-ladakh.dim_800x500.jpg",
    ],
    mapsUrl: "https://maps.google.com/?q=Hemis+National+Park+Ladakh",
    season: "Jun–Sep",
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
    season: "Year Round",
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
    season: "Year Round",
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
    season: "Year Round",
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
    season: "Year Round",
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
    season: "Year Round",
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
    season: "Year Round",
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
    season: "Year Round",
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
    season: "Year Round",
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
    season: "Year Round",
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
    season: "Year Round",
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
const LOCATION_PHOTOS_KEY = "lc_location_photos";
const PENDING_PHOTOS_KEY = "lc_pending_photos";
const DELETED_REVIEWS_KEY = "lc_deleted_location_reviews";

export interface PendingPhoto {
  id: string;
  locationId: string;
  locationName: string;
  submittedBy: string;
  submittedAt: string;
  dataUrl: string;
}

function loadLocationPhotos(): Record<string, string[]> {
  try {
    const saved = localStorage.getItem(LOCATION_PHOTOS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveLocationPhotos(photos: Record<string, string[]>) {
  try {
    localStorage.setItem(LOCATION_PHOTOS_KEY, JSON.stringify(photos));
  } catch {}
}

function loadPendingPhotos(): PendingPhoto[] {
  try {
    const saved = localStorage.getItem(PENDING_PHOTOS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function savePendingPhotos(photos: PendingPhoto[]) {
  try {
    localStorage.setItem(PENDING_PHOTOS_KEY, JSON.stringify(photos));
  } catch {}
}

function loadDeletedReviews(): string[] {
  try {
    const saved = localStorage.getItem(DELETED_REVIEWS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveDeletedReviews(ids: string[]) {
  try {
    localStorage.setItem(DELETED_REVIEWS_KEY, JSON.stringify(ids));
  } catch {}
}

// ---- BOOKMARKS ----
function loadBookmarks(userId: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(`lc_bookmarks_${userId}`) || "[]");
  } catch {
    return [];
  }
}
function saveBookmarks(userId: string, ids: string[]) {
  try {
    localStorage.setItem(`lc_bookmarks_${userId}`, JSON.stringify(ids));
  } catch {}
}

// ---- CHECKINS ----
function loadCheckins(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem("lc_checkins") || "{}");
  } catch {
    return {};
  }
}
function saveCheckins(data: Record<string, string[]>) {
  try {
    localStorage.setItem("lc_checkins", JSON.stringify(data));
  } catch {}
}

// ---- BUSINESS ANALYTICS ----
function loadBizViews(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem("lc_biz_views") || "{}");
  } catch {
    return {};
  }
}
function saveBizViews(data: Record<string, number>) {
  try {
    localStorage.setItem("lc_biz_views", JSON.stringify(data));
  } catch {}
}
function loadBizDirTaps(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem("lc_biz_dir_taps") || "{}");
  } catch {
    return {};
  }
}
function saveBizDirTaps(data: Record<string, number>) {
  try {
    localStorage.setItem("lc_biz_dir_taps", JSON.stringify(data));
  } catch {}
}

// ---- SEASON ----
type SeasonStatus = "open" | "soon" | "closed";
const MONTH_MAP: Record<string, number> = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};
function getSeasonStatus(season?: string): SeasonStatus {
  if (!season || season === "Year Round") return "open";
  const m = new Date().getMonth() + 1;
  const match = season.match(/(\w{3})[\u2013-](\w{3})/u);
  if (!match) return "open";
  const start = MONTH_MAP[match[1]] || 1;
  const end = MONTH_MAP[match[2]] || 12;
  const inRange =
    start <= end ? m >= start && m <= end : m >= start || m <= end;
  const soonPrev = start <= end ? m === start - 1 || m === end + 1 : false;
  if (inRange) return "open";
  if (soonPrev) return "soon";
  return "closed";
}
function SeasonBadge({ season }: { season?: string }) {
  if (!season) return null;
  const status = getSeasonStatus(season);
  const colors = {
    open: "bg-green-500/90 text-white",
    soon: "bg-amber-500/90 text-black",
    closed: "bg-red-600/90 text-white",
  };
  const labels = { open: "Open", soon: "Opening Soon", closed: "Closed" };
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[status]}`}
    >
      {season} · {labels[status]}
    </span>
  );
}

// ---- VERIFIED REVIEW ----
function isInLadakh(lat: number, lon: number): boolean {
  return lat >= 33 && lat <= 36 && lon >= 75 && lon <= 80;
}
async function checkLadakhVerification(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(isInLadakh(pos.coords.latitude, pos.coords.longitude)),
      () => resolve(false),
      { timeout: 5000 },
    );
  });
}

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

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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
  title,
}: { onClose: () => void; children: React.ReactNode; title?: string }) {
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
        {/* Back button row */}
        <div className="flex items-center justify-between px-4 pb-1">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-white/70 hover:text-white py-2 px-1 text-sm transition-colors"
            aria-label="Go back"
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>
          {title && (
            <span className="text-xs text-zinc-500 font-medium">{title}</span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
            aria-label="Close"
          >
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function useOverlayHistory(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ overlay: true }, "");
      const handlePop = () => onClose();
      window.addEventListener("popstate", handlePop);
      return () => window.removeEventListener("popstate", handlePop);
    }
  }, [isOpen, onClose]);
}

function CreatorPhotoGallery({
  photos,
  name,
  onPhotosChange,
}: {
  photos: string[];
  name: string;
  onPhotosChange: (photos: string[]) => void;
}) {
  const [active, setActive] = useState(0);
  const addInputRef = useRef<HTMLInputElement>(null);

  function deletePhoto(idx: number) {
    const next = photos.filter((_, i) => i !== idx);
    onPhotosChange(next);
    if (active >= next.length) setActive(Math.max(0, next.length - 1));
  }

  function handleAddPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const next = [...photos, dataUrl];
      onPhotosChange(next);
      setActive(next.length - 1);
      toast.success("Photo added!");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="mb-4">
      <div className="relative h-48 rounded-xl overflow-hidden">
        {photos.length > 0 ? (
          <>
            <img
              src={photos[active]}
              alt={`${name} view ${active + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/assets/generated/thiksey-monastery.dim_800x500.jpg";
              }}
            />
            {/* Delete button on active photo */}
            <button
              type="button"
              onClick={() => deletePhoto(active)}
              className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-500 text-white text-xs px-2 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors"
            >
              🗑️ Delete
            </button>
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
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
            No photos yet
          </div>
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 mt-2">
          {photos.map((p, i) => (
            <button
              key={`thumb-${String(i)}`}
              type="button"
              onClick={() => setActive(i)}
              className={`relative flex-1 h-16 rounded-lg overflow-hidden border-2 transition-all ${
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
      {/* Add photo button */}
      <button
        type="button"
        onClick={() => addInputRef.current?.click()}
        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-amber-500/50 hover:border-amber-500 text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors"
      >
        ➕ Add Photo
      </button>
      <input
        ref={addInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAddPhoto}
      />
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
  locationPhotosMap,
  onLocationPhotosChange,
  isPopular,
}: {
  location: Location;
  locationReviews: LocationReview[];
  currentUserId: string;
  currentUsername: string;
  onAddLocationReview?: (r: Omit<LocationReview, "id" | "timestamp">) => void;
  isCreator?: boolean;
  onEditLocation?: (id: string, changes: Partial<Location>) => void;
  locationPhotosMap: Record<string, string[]>;
  onLocationPhotosChange: (locationId: string, photos: string[]) => void;
  isPopular?: boolean;
}) {
  const [sheet, setSheet] = useState<"" | "details" | "reviews" | "edit">("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [editName, setEditName] = useState(location.name);
  const [editOverview, setEditOverview] = useState(location.overview);
  const [editDetails, setEditDetails] = useState(location.details);
  const [editAddress, setEditAddress] = useState(location.address);
  const [editMaps, setEditMaps] = useState(location.mapsUrl);
  const [editSeason, setEditSeason] = useState(location.season || "");
  const [deletedReviewIds, setDeletedReviewIds] = useState<string[]>(() =>
    loadDeletedReviews(),
  );
  const [bookmarked, setBookmarked] = useState(() =>
    loadBookmarks(currentUserId).includes(location.id),
  );
  const [checkins, setCheckins] = useState(loadCheckins);
  const contributeInputRef = useRef<HTMLInputElement>(null);

  const myCheckins = checkins[location.id] || [];
  const checkinCount = myCheckins.length;
  const hasCheckedIn = myCheckins.includes(currentUserId);

  function toggleBookmark(e: React.MouseEvent) {
    e.stopPropagation();
    const current = loadBookmarks(currentUserId);
    let next: string[];
    if (bookmarked) {
      next = current.filter((id) => id !== location.id);
      toast.success("Removed from saved");
    } else {
      next = [...current, location.id];
      toast.success("Saved!");
    }
    saveBookmarks(currentUserId, next);
    setBookmarked(!bookmarked);
    window.dispatchEvent(new Event("lc_bookmarks_changed"));
  }

  function doCheckIn() {
    if (hasCheckedIn) {
      toast.info("Already checked in!");
      return;
    }
    const next = { ...checkins, [location.id]: [...myCheckins, currentUserId] };
    setCheckins(next);
    saveCheckins(next);
    toast.success("Checked in! 🏔️");
  }

  // Resolve photos: localStorage override first, then location default
  const resolvedPhotos = locationPhotosMap[location.id] ?? location.photos;

  const closeSheet = () => setSheet("");
  useOverlayHistory(sheet !== "", closeSheet);

  const rawReviews = locationReviews.filter(
    (r) => r.locationId === location.id,
  );
  const myReviews = rawReviews.filter((r) => !deletedReviewIds.includes(r.id));
  const avgRating = myReviews.length
    ? myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length
    : 0;

  async function submitReview() {
    if (!newComment.trim()) return;
    let verified = false;
    try {
      verified = await checkLadakhVerification();
    } catch {}
    onAddLocationReview?.({
      locationId: location.id,
      reviewerUserId: currentUserId,
      reviewerUsername: currentUsername,
      rating: newRating,
      comment: newComment.trim(),
    });
    setNewComment("");
    setNewRating(5);
    toast.success(
      verified ? "Review submitted! ✓ Verified Visit" : "Review submitted!",
    );
  }

  function deleteReview(reviewId: string) {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;
    const next = [...deletedReviewIds, reviewId];
    setDeletedReviewIds(next);
    saveDeletedReviews(next);
    toast.success("Review deleted.");
  }

  function saveEdit() {
    const changes: Partial<Location> = {
      name: editName,
      overview: editOverview,
      details: editDetails,
      address: editAddress,
      mapsUrl: editMaps,
      season: editSeason || undefined,
    };
    onEditLocation?.(location.id, changes);
    setSheet("");
    toast.success("Location updated!");
  }

  function handleContributePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const pending = loadPendingPhotos();
      const newEntry: PendingPhoto = {
        id: generateId(),
        locationId: location.id,
        locationName: location.name,
        submittedBy: currentUsername,
        submittedAt: new Date().toISOString(),
        dataUrl,
      };
      savePendingPhotos([...pending, newEntry]);
      toast.success("Photo submitted for approval!");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  const canContribute = !!currentUserId && !isCreator;

  return (
    <>
      <div className="rounded-2xl overflow-hidden bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600 transition-all duration-300 hover:scale-[1.01]">
        <div className="relative h-44 overflow-hidden">
          <img
            src={resolvedPhotos[0] || location.photos[0]}
            alt={location.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/assets/generated/thiksey-monastery.dim_800x500.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3 flex flex-col gap-1 items-start">
            <span className="text-xs bg-amber-500/90 text-black px-2 py-0.5 rounded-full font-semibold">
              {location.category}
            </span>
            {location.season && <SeasonBadge season={location.season} />}
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
          {!isCreator && (
            <button
              type="button"
              onClick={toggleBookmark}
              className={`absolute top-2 left-2 p-1.5 rounded-full transition-all ${bookmarked ? "bg-amber-500 text-black" : "bg-black/60 text-white hover:bg-black/80"}`}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
              data-ocid="explore.bookmark.toggle"
            >
              <span className="material-symbols-outlined text-sm">
                {bookmarked ? "bookmark" : "bookmark_border"}
              </span>
            </button>
          )}
          {checkinCount > 0 && (
            <div className="absolute bottom-10 right-2 bg-black/70 px-1.5 py-0.5 rounded-full text-xs text-green-400 font-semibold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-xs">
                check_circle
              </span>
              {checkinCount}
            </div>
          )}
          {resolvedPhotos.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded-full text-xs text-white">
              📷 {resolvedPhotos.length}
            </div>
          )}
          {isPopular && (
            <div className="absolute top-2 right-10 bg-orange-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              🔥 Popular
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
        <Overlay onClose={closeSheet} title={location.name}>
          <div className="p-6">
            {isCreator ? (
              <CreatorPhotoGallery
                photos={resolvedPhotos}
                name={location.name}
                onPhotosChange={(photos) =>
                  onLocationPhotosChange(location.id, photos)
                }
              />
            ) : (
              <PhotoGallery photos={resolvedPhotos} name={location.name} />
            )}
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

            {/* Check In */}
            <div className="mt-4 flex items-center justify-between bg-zinc-800/40 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-400 text-base">
                  check_circle
                </span>
                <div>
                  <p className="text-xs font-semibold text-zinc-300">
                    Visitor Check-ins
                  </p>
                  <p className="text-xs text-zinc-500">
                    {checkinCount} {checkinCount === 1 ? "person" : "people"}{" "}
                    visited
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={doCheckIn}
                disabled={hasCheckedIn}
                data-ocid="explore.checkin.button"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${hasCheckedIn ? "bg-green-500/20 text-green-400 cursor-default" : "bg-green-600 hover:bg-green-500 text-white"}`}
              >
                {hasCheckedIn ? "✓ Checked In" : "Check In"}
              </button>
            </div>

            {/* User photo contribution */}
            {canContribute && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => contributeInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
                >
                  📷 Contribute a Photo
                </button>
                <p className="text-xs text-zinc-600 text-center mt-1">
                  Photos are reviewed by the creator before appearing
                </p>
                <input
                  ref={contributeInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleContributePhoto}
                />
              </div>
            )}

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
        <Overlay onClose={closeSheet} title="Reviews">
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
            {onAddLocationReview && !isCreator && (
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
              <div
                key={r.id}
                className="relative border-b border-zinc-800 pb-3 mb-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-sm font-semibold text-white">
                      @{r.reviewerUsername}
                    </span>
                    {(r as any).verified && (
                      <span className="ml-2 text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded-full font-semibold">
                        ✓ Verified Visit
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={r.rating} />
                    {isCreator && (
                      <button
                        type="button"
                        onClick={() => deleteReview(r.id)}
                        className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-0.5 rounded transition-colors font-semibold"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-zinc-300">{r.comment}</p>
              </div>
            ))}
          </div>
        </Overlay>
      )}

      {sheet === "edit" && isCreator && (
        <Overlay onClose={closeSheet} title="Edit Location">
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
              <div>
                <label
                  className="text-xs text-zinc-400 font-semibold mb-1 block"
                  htmlFor="edit-season"
                >
                  Season (e.g. "May–Oct", "Year Round")
                </label>
                <input
                  id="edit-season"
                  className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  value={editSeason}
                  placeholder="May–Oct"
                  onChange={(e) => setEditSeason(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={closeSheet}
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
  const [bookmarked, setBookmarked] = useState(() =>
    loadBookmarks(currentUserId).includes(`biz_${account.id}`),
  );

  const closeSheet = () => setSheet("");
  useOverlayHistory(sheet !== "", closeSheet);

  function toggleBookmark(e: React.MouseEvent) {
    e.stopPropagation();
    const key = `biz_${account.id}`;
    const current = loadBookmarks(currentUserId);
    let next: string[];
    if (bookmarked) {
      next = current.filter((id) => id !== key);
      toast.success("Removed from saved");
    } else {
      next = [...current, key];
      toast.success("Saved!");
    }
    saveBookmarks(currentUserId, next);
    setBookmarked(!bookmarked);
    window.dispatchEvent(new Event("lc_bookmarks_changed"));
  }

  function trackView() {
    const views = loadBizViews();
    views[account.id] = (views[account.id] || 0) + 1;
    saveBizViews(views);
  }

  function trackDirections() {
    const taps = loadBizDirTaps();
    taps[account.id] = (taps[account.id] || 0) + 1;
    saveBizDirTaps(taps);
  }

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
          <button
            type="button"
            onClick={toggleBookmark}
            className={`absolute top-8 left-2 mt-1 p-1.5 rounded-full transition-all ${bookmarked ? "bg-amber-500 text-black" : "bg-black/60 text-white hover:bg-black/80"}`}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
            data-ocid="explore.biz_bookmark.toggle"
          >
            <span className="material-symbols-outlined text-sm">
              {bookmarked ? "bookmark" : "bookmark_border"}
            </span>
          </button>
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
                onClick={trackDirections}
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
              onClick={() => {
                setSheet("details");
                trackView();
              }}
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
        <Overlay onClose={closeSheet} title={bizName}>
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
        <Overlay onClose={closeSheet} title="Reviews">
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
  const [locationPhotosMap, setLocationPhotosMap] =
    useState<Record<string, string[]>>(loadLocationPhotos);
  const [roadStatuses, setRoadStatuses] =
    useState<RoadStatus[]>(loadRoadStatus);

  const currentAccount = accounts.find((a) => a.id === currentUserId);
  const currentUsername = currentAccount?.username || "user";

  useEffect(() => {
    setLocations(loadLocations());
    setLocationPhotosMap(loadLocationPhotos());
  }, []);

  function handleEditLocation(id: string, changes: Partial<Location>) {
    saveLocationOverride(id, changes);
    setLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, ...changes } : loc)),
    );
  }

  function handleLocationPhotosChange(locationId: string, photos: string[]) {
    const next = { ...locationPhotosMap, [locationId]: photos };
    setLocationPhotosMap(next);
    saveLocationPhotos(next);
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

  // Calculate popular locations (top 5 by checkins)
  const allCheckins = loadCheckins();
  const popularIds = Object.entries(allCheckins)
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, 5)
    .map(([id]) => id);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-1">Explore Ladakh</h2>
        <p className="text-zinc-500 text-sm">
          Discover monasteries, places, and local businesses
        </p>
      </div>

      <WeatherWidget />
      <RoadStatusWidget
        roads={roadStatuses}
        canEdit={isCreator || currentUserRole === "community"}
        onUpdateStatus={(id, status, note) => {
          const updated = roadStatuses.map((r) =>
            r.id === id
              ? { ...r, status, note, updatedAt: new Date().toISOString() }
              : r,
          );
          setRoadStatuses(updated);
          saveRoadStatus(updated);
        }}
      />
      <EmergencySOS />

      <CommunityPolls currentUserId={currentUserId} />

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
                isPopular={popularIds.includes(loc.id)}
                locationPhotosMap={locationPhotosMap}
                onLocationPhotosChange={handleLocationPhotosChange}
              />
            ))}
          </div>
        </div>
      )}

      {filteredBusinesses.length > 0 && (
        <div className="mb-6">
          {activeCategory === "All" && (
            <h3 className="text-sm font-bold text-zinc-400 mb-3">
              🏪 Member Businesses
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
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-4xl text-zinc-700 block mb-2">
            explore_off
          </span>
          <p className="text-zinc-500 text-sm">
            No places found in this category yet.
          </p>
        </div>
      )}
    </div>
  );
}
