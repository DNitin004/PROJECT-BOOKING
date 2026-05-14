require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Movie = require('./models/Movie');

const cities = [
  'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra',
  'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan', 'Vasai', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad',
  'Amritsar', 'Navi Mumbai', 'Allahabad', 'Howrah', 'Ranchi', 'Gwalior', 'Jabalpur', 'Coimbatore', 'Vijayawada',
  'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli', 'Bareilly', 'Mysore',
  'Tiruchirappalli', 'Jalandhar', 'Bhubaneswar', 'Salem', 'Aligarh', 'Thiruvananthapuram', 'Bhiwandi', 'Saharanpur',
  'Gorakhpur', 'Bikaner', 'Amravati', 'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack', 'Firozabad', 'Kochi', 'Bhavnagar',
  'Dehradun', 'Durgapur', 'Asansol', 'Nanded', 'Kolhapur', 'Ajmer', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni',
  'Siliguri', 'Jhansi', 'Ulhasnagar', 'Nellore', 'Jammu', 'Sangli', 'Belagavi', 'Mangalore', 'Ambattur', 'Tirunelveli',
  'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur', 'Maheshtala', 'Davanagere', 'Kozhikode', 'Akola', 'Kurnool', 'Rajpur Sonarpur',
  'Bokaro', 'South Dumdum', 'Bellary', 'Patiala', 'Gopalpur', 'Agartala', 'Bhagalpur', 'Muzaffarnagar', 'Bhatpara',
  'Panihati', 'Latur', 'Dhule', 'Rohtak', 'Korba', 'Bhilwara', 'Brahmapur', 'Muzaffarpur', 'Ahmednagar', 'Mathura',
  'Kollam', 'Avadi', 'Kadapa', 'Rajahmundry', 'Bilaspur', 'Kamarhati', 'Shahjahanpur', 'Bijapur', 'Rampur', 'Shivamogga',
  'Chandrapur', 'Junagadh', 'Thrissur', 'Alwar', 'Bardhaman', 'Kulti', 'Nizamabad', 'Parbhani', 'Tumkur', 'Khammam',
  'Ozhukarai', 'Bihar Sharif', 'Panipat', 'Darbhanga', 'Bally', 'Aizawl', 'Dewas', 'Ichalkaranji', 'Karnal', 'Bathinda',
  'Jalna', 'Eluru', 'Barasat', 'Kirari Suleman Nagar', 'Purnia', 'Satna', 'Mau', 'Sonipat', 'Farrukhabad', 'Sagar',
  'Rourkela', 'Durg', 'Imphal', 'Ratlam', 'Hapur', 'Anantapur', 'Arrah', 'Karimnagar', 'Etawah', 'Ambernath',
  'North Dumdum', 'Bharatpur', 'Begusarai', 'New Delhi', 'Gandhidham', 'Baranagar', 'Tiruvottiyur', 'Puducherry', 'Sikar',
  'Thoothukudi', 'Rewa', 'Mirzapur', 'Raichur', 'Pali', 'Ramagundam', 'Silchar', 'Haridwar', 'Vijayanagaram', 'Tenali',
  'Nagercoil', 'Sri Ganganagar', 'Karawal Nagar', 'Mango', 'Thanjavur', 'Bulandshahr', 'Uluberia', 'Katni', 'Sambhal',
  'Singrauli', 'Nadiad', 'Secunderabad', 'Naihati', 'Yamunanagar', 'Bidhannagar', 'Pallavaram', 'Bidar', 'Munger',
  'Panchkula', 'Burhanpur', 'Raurkela Industrial Township', 'Kharagpur', 'Dindigul', 'Gandhinagar', 'Hospet',
  'Nangloi Jat', 'Malda', 'Ongole', 'Deoghar', 'Chhapra', 'Haldia', 'Khandwa', 'Nandyal', 'Morena', 'Amroha', 'Anand',
  'Bhind', 'Bhalswa Jahangir Pur', 'Madhyamgram', 'Bhiwani', 'Berhampore', 'Ambala', 'Morbi', 'Fatehpur', 'Raebareli',
  'Khora', 'Ghaziabad', 'Chittoor', 'Bhusawal', 'Orai', 'Bahraich', 'Phusro', 'Vellore', 'Mehsana', 'Raiganj', 'Sirsa',
  'Danapur', 'Serampore', 'Sultan Pur Majra', 'Guna', 'Jaunpur', 'Panvel', 'Shivpuri', 'Surendranagar Dudhrej', 'Unnao',
  'Chinsurah', 'Alappuzha', 'Kottayam', 'Machilipatnam', 'Shimla', 'Adoni', 'Udupi', 'Katihar', 'Proddatur', 'Mahbubnagar',
  'Saharsa', 'Dibrugarh', 'Jorhat', 'Hazaribagh', 'Hindupur', 'Nagaon', 'Sasaram', 'Hajipur', 'Giridih', 'Bhimavaram',
  'Kumbakonam', 'Bongaigaon', 'Dehri', 'Madanapalle', 'Guntakal', 'Srikakulam', 'Dharmavaram', 'Gudivada', 'Narasaraopet',
  'Suryapet', 'Miryalaguda', 'Tadipatri', 'Kavali', 'Tadepalligudem', 'Amaravati', 'Bapatla', 'Chilakaluripet', 'Palakkad'
];

const generateShows = (movieType) => {
    let shows = [];
    const times = ['09:00 AM', '12:30 PM', '04:00 PM', '07:30 PM', '10:30 PM'];
    
    // Each city gets 2 screens with 5 shows each = 10 shows per city
    cities.forEach(city => {
        let screens = ['PVR', 'INOX', 'Cinepolis', 'Carnival Cinemas'];
        let theater1 = screens[Math.floor(Math.random() * screens.length)] + ` ${city}`;
        let theater2 = screens[Math.floor(Math.random() * screens.length)] + ` ${city} Central`;

        times.forEach((t, i) => {
            if (i % 2 === 0) {
               shows.push({ time: t, theater: theater1, city: city, price: 150 + Math.floor(Math.random()*150), totalSeats: 120, bookedSeats: [] });
            } else {
               shows.push({ time: t, theater: theater2, city: city, price: 180 + Math.floor(Math.random()*100), totalSeats: 150, bookedSeats: [] });
            }
        });
    });
    return shows;
};

const run = async () => {
    await connectDB();
    try {
        console.log("Clearing old movies...");
        await Movie.deleteMany({});
        
        console.log("Generating 2600+ Pan-India shows across 250+ cities...");
        
        const moviesToInsert = [
            {
                name: 'Kalki 2898 AD',
                genre: ['Sci-Fi', 'Action'],
                description: 'A modern-day avatar of Vishnu descends to Earth to protect it from evil.',
                language: 'Telugu (Pan-India)',
                rating: 8.8,
                posterUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Kalki_2898_AD_poster.jpg',
                releaseDate: new Date('2024-05-09'),
                duration: 165,
                shows: generateShows(),
                isActive: true
            },
            {
                name: 'Pushpa 2: The Rule',
                genre: ['Action', 'Thriller'],
                description: 'The clash between Pushpa Raj and Bhanwar Singh Shekhawat continues.',
                language: 'Telugu (Pan-India)',
                rating: 9.1,
                posterUrl: 'https://upload.wikimedia.org/wikipedia/en/1/11/Pushpa_2-_The_Rule.jpg',
                releaseDate: new Date('2024-08-15'),
                duration: 180,
                shows: generateShows(),
                isActive: true
            },
            {
                name: 'Fighter',
                genre: ['Action', 'Thriller'],
                description: 'Top IAF aviators come together in the face of imminent danger.',
                language: 'Hindi',
                rating: 7.9,
                posterUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4a/Fighter_2024_film_poster.jpg',
                releaseDate: new Date('2024-01-25'),
                duration: 166,
                shows: generateShows(),
                isActive: true
            },
            {
                name: 'Devara',
                genre: ['Action', 'Drama'],
                description: 'An epic action saga set against coastal lands.',
                language: 'Telugu (Pan-India)',
                rating: 8.5,
                posterUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6a/Devara_Part_1.jpg',
                releaseDate: new Date('2024-04-05'),
                duration: 175,
                shows: generateShows(),
                isActive: true
            },
            {
                name: 'Singham Again',
                genre: ['Action', 'Crime'],
                description: 'Bajirao Singham returns to battle terrorism.',
                language: 'Hindi',
                rating: 8.2,
                posterUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1d/Singham_Again_poster.jpg',
                releaseDate: new Date('2024-08-15'),
                duration: 160,
                shows: generateShows(),
                isActive: true
            },
            {
                name: 'Kanguva',
                genre: ['Action', 'Drama'],
                description: 'A warrior\'s journey spanning centuries.',
                language: 'Tamil (Pan-India)',
                rating: 8.7,
                posterUrl: 'https://upload.wikimedia.org/wikipedia/en/3/36/Kanguva_poster.jpg',
                releaseDate: new Date('2024-04-11'),
                duration: 170,
                shows: generateShows(),
                isActive: true
            }
        ];
        
        await Movie.insertMany(moviesToInsert);
        console.log(`Inserted ${moviesToInsert.length} movies with pan-India shows successfully!`);
        process.exit();
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
};

run();
