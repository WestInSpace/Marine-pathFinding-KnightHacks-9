// src/configs/wildlifeConfig.js
import manateeIcon from '../assets/wildlife/manatee.png';
import alligatorIcon from '../assets/wildlife/alligator.png';
import crocodileIcon from '../assets/wildlife/crocodile.png';
import dolphinIcon from '../assets/wildlife/dolphin.png';
import sharkIcon from '../assets/wildlife/shark.png';
import turtleIcon from '../assets/wildlife/turtle.png';
import whaleIcon from '../assets/wildlife/whale.png';

// Icons only appear at this zoom level or closer, so the state-wide view stays uncluttered
export const WILDLIFE_MIN_ZOOM = 10;

// One entry per animal. To add one: drop a small transparent png in assets/wildlife and add it here.
//   size:  [width, height] on the map, in pixels
//   video: sample video of the animal in Florida, linked from spots that have no video of their own
export const WILDLIFE_SPECIES = {
    manatee: { label: 'Florida manatee', icon: manateeIcon, size: [32, 26], note: 'Protected. Slow down and watch for animals at the surface.', video: 'https://www.youtube.com/watch?v=jcp7Mo8LkLU' },
    alligator: { label: 'American alligator', icon: alligatorIcon, size: [34, 24], note: 'Protected. Keep your distance and never feed.', video: 'https://www.youtube.com/watch?v=BphgliFqIQM' },
    crocodile: { label: 'American crocodile', icon: crocodileIcon, size: [34, 22], note: 'Federally threatened. Keep your distance and never feed.', video: 'https://www.youtube.com/watch?v=Q5HYyjIfEdw' },
    dolphin: { label: 'Bottlenose dolphin', icon: dolphinIcon, size: [28, 30], note: 'Federally protected. Stay at least 50 yards away and never feed.', video: 'https://www.youtube.com/watch?v=jhzDGVMI4KM' },
    shark: { label: 'Protected shark', icon: sharkIcon, size: [30, 30], note: 'Harvest prohibited in Florida waters. Release immediately if hooked.', video: 'https://www.youtube.com/watch?v=O-MuL5uTsDc' },
    turtle: { label: 'Sea turtle', icon: turtleIcon, size: [32, 19], note: 'Protected. Watch for turtles surfacing near nesting beaches, March to October.', video: 'https://www.youtube.com/watch?v=SAAkTdEwbx8' },
    whale: { label: 'North Atlantic right whale', icon: whaleIcon, size: [32, 26], note: 'Endangered. Calving season is November to April: stay 500 yards away.', video: 'https://www.youtube.com/watch?v=-aTjSkVnNWs' },
};

// Places the animals are commonly seen. Add an entry here to add an icon.
//   id:       unique identifier
//   species:  a key of WILDLIFE_SPECIES
//   name:     place name shown in the popup
//   position: [lat, lon]
//   video:    link to a video of the animal at this place (optional, falls back to the species video)
// Positions are approximate and hand-picked from well-known sites, not a survey dataset.
// Every manatee spot lies within 1.5 km of an FWC State Manatee Protection Zone.
export const WILDLIFE_SPOTS = [
    { id: 'manatee-little-river', species: 'manatee', name: 'Little River, Biscayne Bay', position: [25.8480, -80.1720], video: 'https://www.youtube.com/watch?v=llb8cORBUoY' },
    { id: 'manatee-miami-river', species: 'manatee', name: 'Miami River', position: [25.7700, -80.1870], video: 'https://www.youtube.com/watch?v=UlqHSFnvHUQ' },
    { id: 'manatee-riviera-beach', species: 'manatee', name: 'Manatee Lagoon, Riviera Beach', position: [26.7640, -80.0520], video: 'https://www.youtube.com/watch?v=1vYyhpjkrA4' },
    { id: 'manatee-banana-river', species: 'manatee', name: 'Banana River', position: [28.4100, -80.6600], video: 'https://www.youtube.com/watch?v=db6jF4XKLtY' },
    { id: 'manatee-blue-spring', species: 'manatee', name: 'Blue Spring, St. Johns River', position: [28.9436, -81.3398], video: 'https://www.youtube.com/watch?v=BwON-wG7Puc' },
    { id: 'manatee-kings-bay', species: 'manatee', name: 'Kings Bay, Crystal River', position: [28.8886, -82.5990], video: 'https://www.youtube.com/watch?v=hAGrsX53Nyc' },
    { id: 'manatee-apollo-beach', species: 'manatee', name: 'Apollo Beach, Tampa Bay', position: [27.7936, -82.4030], video: 'https://www.youtube.com/watch?v=k2XspIDa778' },
    { id: 'manatee-orange-river', species: 'manatee', name: 'Orange River, Fort Myers', position: [26.6930, -81.7775], video: 'https://www.youtube.com/watch?v=_iC-DbmDCQc' },

    { id: 'alligator-tamiami-canal', species: 'alligator', name: 'Tamiami Canal, Everglades', position: [25.7610, -80.6000] },
    { id: 'alligator-okeechobee', species: 'alligator', name: 'Lake Okeechobee', position: [26.9500, -80.8300], video: 'https://www.youtube.com/watch?v=LvKWrmrtBYI' },
    { id: 'alligator-kissimmee', species: 'alligator', name: 'Lake Kissimmee', position: [27.9000, -81.2700] },
    { id: 'alligator-jesup', species: 'alligator', name: 'Lake Jesup', position: [28.7200, -81.2200], video: 'https://www.youtube.com/watch?v=kzM-1pHQIuU' },
    { id: 'alligator-myakka', species: 'alligator', name: 'Upper Myakka Lake', position: [27.2750, -82.2850], video: 'https://www.youtube.com/watch?v=Wqlgs91g_TM' },

    { id: 'crocodile-lake-surprise', species: 'crocodile', name: 'Lake Surprise, Key Largo', position: [25.1810, -80.3840], video: 'https://www.youtube.com/watch?v=_rJXotE4-cI' },
    { id: 'crocodile-crocodile-lake', species: 'crocodile', name: 'Crocodile Lake National Wildlife Refuge', position: [25.2500, -80.3200] },
    { id: 'crocodile-turkey-point', species: 'crocodile', name: 'Turkey Point cooling canals', position: [25.4100, -80.3400], video: 'https://www.youtube.com/watch?v=EPeT3LMU_BQ' },
    { id: 'crocodile-flamingo', species: 'crocodile', name: 'Flamingo, Everglades National Park', position: [25.1420, -80.9230], video: 'https://www.youtube.com/watch?v=9-NV1OD9e0U' },

    { id: 'dolphin-biscayne-bay', species: 'dolphin', name: 'Biscayne Bay', position: [25.6000, -80.2200], video: 'https://www.youtube.com/watch?v=kpOELAJDOaQ' },
    { id: 'dolphin-key-west', species: 'dolphin', name: 'Northwest Channel, Key West', position: [24.6000, -81.8700] },
    { id: 'dolphin-sarasota-bay', species: 'dolphin', name: 'Sarasota Bay', position: [27.3700, -82.5900], video: 'https://www.youtube.com/watch?v=9owuGGARlAc' },
    { id: 'dolphin-tampa-bay', species: 'dolphin', name: 'Tampa Bay', position: [27.7000, -82.6000], video: 'https://www.youtube.com/watch?v=WK2ZaavqppM' },
    { id: 'dolphin-indian-river', species: 'dolphin', name: 'Indian River Lagoon, Sebastian', position: [27.8200, -80.4500], video: 'https://www.youtube.com/watch?v=pnQ0esKy23o' },
    { id: 'dolphin-mosquito-lagoon', species: 'dolphin', name: 'Mosquito Lagoon', position: [28.8500, -80.8000], video: 'https://www.youtube.com/watch?v=wDRMwlp0Pf0' },
    { id: 'dolphin-st-andrew-bay', species: 'dolphin', name: 'St. Andrew Bay, Panama City', position: [30.1400, -85.7000], video: 'https://www.youtube.com/watch?v=PQJYBtkxg8s' },

    { id: 'shark-jupiter', species: 'shark', name: 'Lemon shark winter aggregation, off Jupiter', position: [26.9400, -80.0300], video: 'https://www.youtube.com/watch?v=O-MuL5uTsDc' },
    { id: 'shark-canaveral', species: 'shark', name: 'Juvenile lemon sharks, Cape Canaveral shoals', position: [28.4000, -80.5500], video: 'https://www.youtube.com/watch?v=chRsgh1h_RM' },
    { id: 'shark-boca-grande', species: 'shark', name: 'Great hammerheads, Boca Grande Pass', position: [26.7150, -82.2600], video: 'https://www.youtube.com/watch?v=47oUKf_cYC4' },

    { id: 'turtle-juno-beach', species: 'turtle', name: 'Juno Beach nesting area', position: [26.8800, -80.0450], video: 'https://www.youtube.com/watch?v=QtLR9-GokIM' },
    { id: 'turtle-archie-carr', species: 'turtle', name: 'Archie Carr National Wildlife Refuge', position: [28.0200, -80.5300], video: 'https://www.youtube.com/watch?v=YKUE7zTAPfQ' },
    { id: 'turtle-canaveral-seashore', species: 'turtle', name: 'Canaveral National Seashore', position: [28.6600, -80.6200], video: 'https://www.youtube.com/watch?v=BSZvGvNUWFY' },
    { id: 'turtle-casey-key', species: 'turtle', name: 'Casey Key nesting area', position: [27.1500, -82.4900], video: 'https://www.youtube.com/watch?v=gbltzTIVyls' },
    { id: 'turtle-st-joseph', species: 'turtle', name: 'St. Joseph Peninsula', position: [29.7500, -85.4000], video: 'https://www.youtube.com/watch?v=kfYtM8lIMMM' },
    { id: 'turtle-dry-tortugas', species: 'turtle', name: 'Dry Tortugas', position: [24.6300, -82.8700], video: 'https://www.youtube.com/watch?v=TeG9Pt16BxU' },

    { id: 'whale-jacksonville', species: 'whale', name: 'Calving grounds off Jacksonville', position: [30.4000, -81.2500], video: 'https://www.youtube.com/watch?v=ku4VqUiuvMQ' },
    { id: 'whale-st-augustine', species: 'whale', name: 'Calving grounds off St. Augustine', position: [29.9000, -81.1500], video: 'https://www.youtube.com/watch?v=-NqxwGaZVjU' },
];
