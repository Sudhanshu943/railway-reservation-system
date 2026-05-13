export interface TrainClass {
  code: string;
  price: string;
  availability: string;
  bookable: boolean;
}

export interface Train {
  id: number;
  name: string;
  number: string;
  runsOn: string;
  departure: string;
  departureStation: string;
  arrival: string;
  arrivalStation: string;
  duration: string;
  status: "available" | "limited" | "soldout";
  classes: TrainClass[];
}

export const trainsData: Train[] = [
  {
    id: 1,
    name: "RAJDHANI EXPRESS",
    number: "#12951",
    runsOn: "M T W T F S S",
    departure: "16:30",
    departureStation: "New Delhi (NDLS)",
    arrival: "08:05+1",
    arrivalStation: "Mumbai Central (MMCT)",
    duration: "15h 35m",
    status: "available",
    classes: [
      { code: "1AC", price: "₹4,890", availability: "Available-12", bookable: true },
      { code: "2AC", price: "₹2,850", availability: "Available-45", bookable: true },
      { code: "3AC", price: "₹2,100", availability: "WL-12/WL-5", bookable: false },
    ],
  },
  {
    id: 2,
    name: "PASCHIM EXPRESS",
    number: "#12926",
    runsOn: "M W F S",
    departure: "11:00",
    departureStation: "New Delhi (NDLS)",
    arrival: "10:10+1",
    arrivalStation: "Mumbai Central (MMCT)",
    duration: "23h 10m",
    status: "limited",
    classes: [
      { code: "2AC", price: "₹2,450", availability: "Available-2", bookable: true },
      { code: "3AC", price: "₹1,750", availability: "Available-120", bookable: true },
      { code: "SL", price: "₹650", availability: "Available-450", bookable: true },
    ],
  },
  {
    id: 3,
    name: "PUNJAB MAIL",
    number: "#12138",
    runsOn: "Daily",
    departure: "05:15",
    departureStation: "New Delhi (NDLS)",
    arrival: "07:45+1",
    arrivalStation: "Mumbai CST (CSMT)",
    duration: "26h 30m",
    status: "soldout",
    classes: [
      { code: "2AC", price: "₹2,350", availability: "NOT AVAILABLE", bookable: false },
      { code: "SL", price: "₹580", availability: "NOT AVAILABLE", bookable: false },
    ],
  },
  {
    id: 4,
    name: "SHATABDI EXPRESS",
    number: "#12001",
    runsOn: "M T W T F",
    departure: "06:00",
    departureStation: "New Delhi (NDLS)",
    arrival: "16:15",
    arrivalStation: "Mumbai Central (MMCT)",
    duration: "10h 15m",
    status: "available",
    classes: [
      { code: "AC Chair", price: "₹1,200", availability: "Available-87", bookable: true },
      { code: "Executive", price: "₹2,100", availability: "Available-23", bookable: true },
    ],
  },
  {
    id: 5,
    name: "MAHARAJA EXPRESS",
    number: "#12959",
    runsOn: "T T S S",
    departure: "19:45",
    departureStation: "New Delhi (NDLS)",
    arrival: "15:30+1",
    arrivalStation: "Mumbai Central (MMCT)",
    duration: "19h 45m",
    status: "available",
    classes: [
      { code: "1AC", price: "₹5,200", availability: "Available-8", bookable: true },
      { code: "2AC", price: "₹3,100", availability: "Available-34", bookable: true },
      { code: "3AC", price: "₹2,300", availability: "Available-156", bookable: true },
      { code: "SL", price: "₹900", availability: "Available-512", bookable: true },
    ],
  },
  {
    id: 6,
    name: "GOLDEN TEMPLE MAIL",
    number: "#12903",
    runsOn: "M W F S",
    departure: "22:10",
    departureStation: "New Delhi (NDLS)",
    arrival: "16:40+1",
    arrivalStation: "Mumbai Central (MMCT)",
    duration: "18h 30m",
    status: "limited",
    classes: [
      { code: "2AC", price: "₹2,600", availability: "Available-1", bookable: true },
      { code: "3AC", price: "₹1,900", availability: "WL-8/WL-2", bookable: false },
      { code: "SL", price: "₹700", availability: "Available-289", bookable: true },
    ],
  },
  {
    id: 7,
    name: "FRONTIER MAIL",
    number: "#12137",
    runsOn: "Daily",
    departure: "08:00",
    departureStation: "New Delhi (NDLS)",
    arrival: "04:40+1",
    arrivalStation: "Mumbai CST (CSMT)",
    duration: "20h 40m",
    status: "available",
    classes: [
      { code: "1AC", price: "₹4,500", availability: "Available-5", bookable: true },
      { code: "2AC", price: "₹2,700", availability: "Available-28", bookable: true },
      { code: "3AC", price: "₹1,950", availability: "Available-98", bookable: true },
    ],
  },
  {
    id: 8,
    name: "INDORE EXPRESS",
    number: "#12415",
    runsOn: "T T S S",
    departure: "14:25",
    departureStation: "New Delhi (NDLS)",
    arrival: "11:45+1",
    arrivalStation: "Indore (INDB)",
    duration: "21h 20m",
    status: "available",
    classes: [
      { code: "2AC", price: "₹1,850", availability: "Available-67", bookable: true },
      { code: "3AC", price: "₹1,350", availability: "Available-145", bookable: true },
      { code: "SL", price: "₹480", availability: "Available-389", bookable: true },
    ],
  },
];
