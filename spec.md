# Ladakh Connect — Version 6 Semifinals Finalized

## Current State
The app is a multi-role dashboard (Creator/Member/Community/Public) for promoting Ladakh destinations and businesses. It has four nav tabs: Explore, Dashboard, Vault, Profile. The Explore view shows destination cards with icon+color design but **no real images**. The app opens directly into the dashboard with no public landing page or login flow.

## Requested Changes (Diff)

### Add
- **Public landing/login screen**: Full-screen hero shown before entering the app. Shows app name "Ladakh Connect", a hero background image, tagline, and Login / Sign Up buttons. On Login, a simple role-selection modal appears (Public, Member, Community, Creator) for demo purposes. T&C acceptance checkbox before proceeding.
- **Real images on every location card**: Each destination card in Explore gets a full-width hero image at the top (like a travel app card). Use `object-cover` img element in the top portion of each card.
- **Get Directions button**: Each location card gets a "Get Directions" button that opens Google Maps with the location coordinates in a new tab.
- **Free/App-provided location categories**: New section in Explore titled "Essential Locations" with three free categories:
  - Monasteries (Hemis, Thiksey, Diskit, Lamayuru, Spituk, Shey) — free, app-promoted
  - Emergency & Healthcare (SNM Hospital Leh, Sonam Norboo Memorial Hospital, PHC Diskit) — free, app-promoted
  - Schools & Education (Jawahar Navodaya Vidyalaya, Government Degree College Leh, NIT Srinagar Campus) — free, app-promoted
- **Category filter tabs** in Explore: All, Monasteries, Nature, Heritage, Business Spotlights
- **Enhanced scroll-triggered animations**: Cards animate in as they enter viewport (use Intersection Observer or motion/react whileInView). Add subtle parallax shimmer on card images on hover. Stagger delays on card entry.
- **Version badge** in header or footer: show "v6 — Semifinals Finalized"

### Modify
- Destination cards: Change layout from icon-only top to image-header + icon overlay (image shows real location photo, icon badge overlaps at bottom-left of image)
- Card hover state: Slight scale-up (1.02) on hover with smooth shadow glow
- Explore page header: Update subtitle to reflect expanded content
- Dialog (location detail): Add image at top of the modal
- Login/app entry: App wraps in an auth state — if not logged in, show landing page; if logged in, show the main app
- App title: Change from "Luminous Ladakh" to "Ladakh Connect" throughout

### Remove
- Nothing removed

## Implementation Plan

1. **App entry state**: Add `appState: 'landing' | 'app'` and `userRole` to App root state. Landing page shown when appState === 'landing'. On login/enter, set appState to 'app'.

2. **LandingPage component**: Full-screen dark hero with Ladakh background image (Unsplash), animated text entrance, "Enter as Guest" and "Login" and "Sign Up" buttons. Login triggers a dialog with role selector + T&C checkbox. On proceed, sets role and enters app.

3. **Image data**: Add `image` field (Unsplash URL) to every `Destination` object and to each new Essential Location entry. Use format: `https://images.unsplash.com/photo-{ID}?auto=format&fit=crop&w=800&q=80`. Include `onError` fallback to a gradient CSS.

4. **Image URLs (Unsplash IDs to use)**:
   - Pangong Lake: 1589392953296-5ebf0dbef491
   - Nubra Valley: 1506905925346-21bda4d32df4
   - Leh Palace: 1554629947-334ff61d85dc
   - Khardung La Pass: 1518709268805-4e9042af9f23
   - Hemis Monastery: 1588170613789-8e1893abd4e7
   - Magnetic Hill: 1553279591-066b56ab0b31
   - Thiksey Monastery: 1491555103944-7c647fd857e6
   - Diskit Monastery: 1580504539231-95bac4b4c1bc
   - Lamayuru Monastery: 1548438294-822ad82b11ac
   - Spituk Monastery: 1591710668263-f62da4f3f7e1
   - Shey Monastery/Palace: 1558618666-fcd25c85cd64
   - SNM Hospital: 1519494026892-80bbd2d6fd0d
   - Sonam Norboo Hospital: 1551884170-aaed0e5e5d60
   - PHC Diskit: 1559757148-28b3ea7f42ed
   - Jawahar Navodaya: 1523050854058-8df90110c9f1
   - Govt Degree College: 1541339907198-e08756dedf3f
   - NIT Campus: 1562774053-701939374585-efa47fa6a531
   - Shanti Stupa: 1607439655007-67a9ed92b8f4
   - Hall of Fame: 1544735716-392a2e7b94bc
   - Leh Market/Bazaar: 1543269865-cbf427effbad

5. **Card layout update**: Each card has a 180px height image container at top with `overflow-hidden rounded-t-xl`. Below that, the existing card content. On hover, image has `scale-105 transition-transform duration-500`.

6. **Google Maps links**: Each location has `mapQuery` field (e.g. "Pangong Lake, Ladakh, India"). "Get Directions" button opens `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`.

7. **Essential Locations section**: Separate grid below the main destinations grid in ExploreView. Shows badge "Free — Provided by App" with a teal color. Three sub-sections: Monasteries, Emergency, Schools. Same card format with images.

8. **Category filter**: Horizontal scrollable pill buttons at top of Explore. Filter state controls which destinations show.

9. **Animations**: Use `motion.div` with `whileInView={{ opacity: 1, y: 0 }}` + `initial={{ opacity: 0, y: 30 }}` on all cards. Add `viewport={{ once: true, margin: '-50px' }}`. Image shimmer on hover using CSS `brightness-110` transition.

10. **Version badge**: Small badge in the header near the logo: `v6 — Finals` in muted style.

11. **App title updates**: Replace all instances of "Luminous Ladakh" with "Ladakh Connect".
