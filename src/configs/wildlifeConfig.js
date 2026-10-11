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
//   size: [width, height] on the map, in pixels
export const WILDLIFE_SPECIES = {
    manatee: { label: 'Florida manatee', icon: manateeIcon, size: [32, 26], note: 'Protected. Slow down and watch for animals at the surface.' },
    alligator: { label: 'American alligator', icon: alligatorIcon, size: [34, 24], note: 'Protected. Keep your distance and never feed.' },
    crocodile: { label: 'American crocodile', icon: crocodileIcon, size: [34, 22], note: 'Federally threatened. Keep your distance and never feed.' },
    dolphin: { label: 'Bottlenose dolphin', icon: dolphinIcon, size: [28, 30], note: 'Federally protected. Stay at least 50 yards away and never feed.' },
    shark: { label: 'Protected shark', icon: sharkIcon, size: [30, 30], note: 'Harvest prohibited in Florida waters. Release immediately if hooked.' },
    turtle: { label: 'Sea turtle', icon: turtleIcon, size: [32, 19], note: 'Protected. Watch for turtles surfacing near nesting beaches, March to October.' },
    whale: { label: 'North Atlantic right whale', icon: whaleIcon, size: [32, 26], note: 'Endangered. Calving season is November to April: stay 500 yards away.' },
};

// Places the animals are commonly seen. Add an entry here to add an icon.
//   id:       unique identifier
//   species:  a key of WILDLIFE_SPECIES
//   name:     place name shown in the popup
//   position: [lat, lon]
// Positions are approximate and hand-picked from well-known sites, not a survey dataset.
// Every manatee spot lies within 1.5 km of an FWC State Manatee Protection Zone.
export const WILDLIFE_SPOTS = [
    { id: 'manatee-little-river', species: 'manatee', name: 'Little River, Biscayne Bay', position: [25.8480, -80.1720] },
    { id: 'manatee-miami-river', species: 'manatee', name: 'Miami River', position: [25.7700, -80.1870] },
    { id: 'manatee-riviera-beach', species: 'manatee', name: 'Manatee Lagoon, Riviera Beach', position: [26.7640, -80.0520] },
    { id: 'manatee-banana-river', species: 'manatee', name: 'Banana River', position: [28.4100, -80.6600] },
    { id: 'manatee-blue-spring', species: 'manatee', name: 'Blue Spring, St. Johns River', position: [28.9436, -81.3398] },
    { id: 'manatee-kings-bay', species: 'manatee', name: 'Kings Bay, Crystal River', position: [28.8886, -82.5990] },
    { id: 'manatee-apollo-beach', species: 'manatee', name: 'Apollo Beach, Tampa Bay', position: [27.7936, -82.4030] },
    { id: 'manatee-orange-river', species: 'manatee', name: 'Orange River, Fort Myers', position: [26.6930, -81.7775] },

    { id: 'alligator-tamiami-canal', species: 'alligator', name: 'Tamiami Canal, Everglades', position: [25.7610, -80.6000] },
    { id: 'alligator-okeechobee', species: 'alligator', name: 'Lake Okeechobee', position: [26.9500, -80.8300] },
    { id: 'alligator-kissimmee', species: 'alligator', name: 'Lake Kissimmee', position: [27.9000, -81.2700] },
    { id: 'alligator-jesup', species: 'alligator', name: 'Lake Jesup', position: [28.7200, -81.2200] },
    { id: 'alligator-myakka', species: 'alligator', name: 'Upper Myakka Lake', position: [27.2750, -82.2850] },

    { id: 'crocodile-lake-surprise', species: 'crocodile', name: 'Lake Surprise, Key Largo', position: [25.1810, -80.3840] },
    { id: 'crocodile-crocodile-lake', species: 'crocodile', name: 'Crocodile Lake National Wildlife Refuge', position: [25.2500, -80.3200] },
    { id: 'crocodile-turkey-point', species: 'crocodile', name: 'Turkey Point cooling canals', position: [25.4100, -80.3400] },
    { id: 'crocodile-flamingo', species: 'crocodile', name: 'Flamingo, Everglades National Park', position: [25.1420, -80.9230] },

    { id: 'dolphin-biscayne-bay', species: 'dolphin', name: 'Biscayne Bay', position: [25.6000, -80.2200] },
    { id: 'dolphin-key-west', species: 'dolphin', name: 'Northwest Channel, Key West', position: [24.6000, -81.8700] },
    { id: 'dolphin-sarasota-bay', species: 'dolphin', name: 'Sarasota Bay', position: [27.3700, -82.5900] },
    { id: 'dolphin-tampa-bay', species: 'dolphin', name: 'Tampa Bay', position: [27.7000, -82.6000] },
    { id: 'dolphin-indian-river', species: 'dolphin', name: 'Indian River Lagoon, Sebastian', position: [27.8200, -80.4500] },
    { id: 'dolphin-mosquito-lagoon', species: 'dolphin', name: 'Mosquito Lagoon', position: [28.8500, -80.8000] },
    { id: 'dolphin-st-andrew-bay', species: 'dolphin', name: 'St. Andrew Bay, Panama City', position: [30.1400, -85.7000] },

    { id: 'shark-jupiter', species: 'shark', name: 'Lemon shark winter aggregation, off Jupiter', position: [26.9400, -80.0300] },
    { id: 'shark-canaveral', species: 'shark', name: 'Juvenile lemon sharks, Cape Canaveral shoals', position: [28.4000, -80.5500] },
    { id: 'shark-boca-grande', species: 'shark', name: 'Great hammerheads, Boca Grande Pass', position: [26.7150, -82.2600] },

    { id: 'turtle-juno-beach', species: 'turtle', name: 'Juno Beach nesting area', position: [26.8800, -80.0450] },
    { id: 'turtle-archie-carr', species: 'turtle', name: 'Archie Carr National Wildlife Refuge', position: [28.0200, -80.5300] },
    { id: 'turtle-canaveral-seashore', species: 'turtle', name: 'Canaveral National Seashore', position: [28.6600, -80.6200] },
    { id: 'turtle-casey-key', species: 'turtle', name: 'Casey Key nesting area', position: [27.1500, -82.4900] },
    { id: 'turtle-st-joseph', species: 'turtle', name: 'St. Joseph Peninsula', position: [29.7500, -85.4000] },
    { id: 'turtle-dry-tortugas', species: 'turtle', name: 'Dry Tortugas', position: [24.6300, -82.8700] },

    { id: 'whale-jacksonville', species: 'whale', name: 'Calving grounds off Jacksonville', position: [30.4000, -81.2500] },
    { id: 'whale-st-augustine', species: 'whale', name: 'Calving grounds off St. Augustine', position: [29.9000, -81.1500] },
];
