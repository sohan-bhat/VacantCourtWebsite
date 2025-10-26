# VacantCourt 🎾

Ever spent way too long trying to find an open tennis court? Yeah, me too. That's why I built **VacantCourt** – a straightforward app to help you quickly find available courts nearby, check their status in real-time, and get all the details you need before you head out.

**My goal: Less searching, more playing!**

**➡️ Live Demo:** [https://vacantcourt.netlify.app](https://vacantcourt.netlify.app)

---

## ✨ Check It Out!

A picture is worth a thousand words, right? Here's a peek at VacantCourt in action:

1.  **Dashboard - List & Map Views:**
    *   _List View - Clean and Filterable:_
        <picture>![dashboard](https://github.com/sohan-bhat/VacantCourtWebsite/blob/main/public/assets/dashboard.png)</picture>
    *   _Map View - Courts at a Glance:_
        <picture>![mapview](https://github.com/sohan-bhat/VacantCourtWebsite/blob/main/public/assets/mapview.png)</picture>
2.  **Court Details - All The Info You Need:**
    *   _Desktop - Full Overview:_
        <picture>![courtdetails](https://github.com/sohan-bhat/VacantCourtWebsite/blob/main/public/assets/courtdetails.png)</picture>
    *   _Mobile - Tabbed for Clarity:_
        <img src="https://github.com/sohan-bhat/VacantCourtWebsite/blob/main/public/assets/mobile.png" alt="mobileview" width="30%"/>
3.  **Adding & Editing Courts - Super Simple:**
    <picture>![addcourt](https://github.com/sohan-bhat/VacantCourtWebsite/blob/main/public/assets/addcourt.png)</picture>
---

## 🚀 Core Features

*   **Find Courts Your Way:** Browse a list or see everything on an interactive map.
*   **Smart Search & Filter:** Quickly narrow down options by name, location, or court type.
*   **Know What's Nearby (Geolocation):** Toggle on proximity sorting to see what's closest. The map will even zoom in for you!
*   **Live Court Status (Thanks, Firebase!):** See if individual courts are Available, In-Use, or under Maintenance in real-time. No more guessing!
*   **All The Deets:** Get rich information for each complex – photos, about sections, address, hours, amenities, and direct links to Google Maps for directions.
*   **At-a-Glance Map Markers:** Custom Leaflet icons show you if a complex has open courts or if everything's booked up (look for the strikethrough!).
*   **Easy Court Management:** Add new courts or edit existing ones with simple forms and Google Places Autocomplete for addresses.
*   **Clean & Responsive:** Built with Material-UI, so it looks good and works smoothly on any device.

---
## This project was part of a Hackathon!

That's right! This projected was submitted for the "Youth Coders Hack 2025" for the goal of social good!
You can find more about the hackathon on the Devpost: https://youth-coders-hack.devpost.com/
---
---
## 🤝 Want to Chip In? (Contributing)

Hey, if you've got ideas or spot a bug, contributions are awesome!

1.  **Fork it.** (Click the "Fork" button at the top right of this page).
2.  **Create your feature branch:**
    ```bash
    git checkout -b feature/YourCoolIdea
    ```
3.  **Make your changes & commit them:**
    ```bash
    git commit -m 'Added YourCoolIdea'
    ```
4.  **Push to your branch:**
    ```bash
    git push origin feature/YourCoolIdea
    ```
5.  **Open a Pull Request** here on GitHub.
---

## 🛠️ Tech Stack

This project was a fun dive into some great technologies:

*   **Frontend:** React (Vite), TypeScript, React Router v6, Material-UI (MUI), Leaflet.js & React-Leaflet, React Toastify, CSS.
*   **Backend & Database:** Firebase (Firestore for the real-time database).
*   **APIs:** Google Maps JavaScript API (Places Autocomplete), Browser Geolocation API.

---

## 🏁 Getting Started Locally

Want to run this on your own machine? Here’s the quick guide:

### What You'll Need:

*   Node.js (v16+ is a good bet)
*   npm or yarn
*   A Firebase project (free tier is fine for this)

### Firebase Setup:

1.  Head to the [Firebase Console](https://console.firebase.google.com/), create a new project (or use one you have).
2.  Enable **Firestore Database**. Start in **test mode** for easy dev.
3.  In Project Settings (⚙️), find "Your apps," add a Web app (`</>`), and copy the `firebaseConfig` object.
4.  For address autocomplete, you'll need a **Google Maps API Key** from the [Google Cloud Console](https://console.cloud.google.com/). Enable **Maps JavaScript API** & **Places API**, then create and *restrict* your API key.

### Installation:

1.  **Clone:**
    ```bash
    git clone https://github.com/sohan-bhat/VacantCourtWebsite.git
    cd VacantCourtWebsite
    ```
2.  **Install Packages:**
    ```bash
    npm install
    # OR
    yarn install
    ```
3.  **Environment Variables (Your Secrets!):**
    *   Create a `.env.local` file in the project root.
    *   Add your keys (see `.env.example` for the structure):
        ```env
        # .env.local (Keep this private!)
        VITE_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
        # ... (all your other Firebase config keys) ...
        VITE_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"
        ```
    *   **Important:** `.env.local` should be in your `.gitignore`.

### Run It:

```bash
npm run dev
# OR
yarn dev
