const mongoose = require('mongoose');
const axios = require('axios');
const Event = require('./models/Event');
require('dotenv').config();

const TICKET_CATEGORIES = [
  { name: 'Silver', price: 999, totalSeats: 1500, bookedSeats: [] },
  { name: 'Gold', price: 2499, totalSeats: 1000, bookedSeats: [] },
  { name: 'Premium', price: 4999, totalSeats: 500, bookedSeats: [] }
];

async function fetchWikiData(title) {
  try {
    const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
    return {
      description: res.data.extract,
      image: res.data.thumbnail ? res.data.thumbnail.source : 'https://images.unsplash.com/photo-1540039155732-68c3cb447ebd'
    };
  } catch (err) {
    return {
      description: 'Join us for this exciting live event!',
      image: 'https://images.unsplash.com/photo-1540039155732-68c3cb447ebd'
    };
  }
}

async function importEvents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected.');

    await Event.deleteMany({});
    console.log('Cleared old events.');

    const eventsToAdd = [];

    // IPL Sports Events
    const iplMatches = [
      { name: 'CSK vs MI - IPL 2026', artists: [{ name: 'Chennai Super Kings' }, { name: 'Mumbai Indians' }], venue: 'M. A. Chidambaram Stadium', posterUrl: 'https://images.livemint.com/img/2023/05/06/600x338/CSK_vs_MI_1683344606709_1683344606869.jpg' },
      { name: 'RCB vs KKR - IPL 2026', artists: [{ name: 'Royal Challengers Bangalore' }, { name: 'Kolkata Knight Riders' }], venue: 'M. Chinnaswamy Stadium', posterUrl: 'https://images.livemint.com/img/2024/03/29/1140x641/RCB_vs_KKR_1711681216597_1711681223946.jpg' },
      { name: 'SRH vs RR - IPL 2026', artists: [{ name: 'Sunrisers Hyderabad' }, { name: 'Rajasthan Royals' }], venue: 'Rajiv Gandhi International Stadium', posterUrl: 'https://images.livemint.com/img/2023/04/02/600x338/SRH_vs_RR_1680415309601_1680415309765.jpg' }
    ];

    for (let i = 0; i < iplMatches.length; i++) {
      const match = iplMatches[i];
      const wikiData = await fetchWikiData('Indian_Premier_League');
      const date = new Date();
      date.setDate(date.getDate() + (i + 1) * 3);
      
      eventsToAdd.push({
        name: match.name,
        eventType: 'Sports',
        artists: match.artists,
        description: wikiData.description || 'Action-packed IPL T20 Cricket match!',
        date,
        venue: { name: match.venue, address: match.venue, city: match.venue.split(' ')[0] },
        posterUrl: match.posterUrl || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e',
        ticketCategories: TICKET_CATEGORIES,
        isActive: true
      });
    }

    // Concert Events
    const concerts = [
      { name: 'Coldplay AHFOD Tour', artist: 'Coldplay', venue: 'Wembley Stadium', posterUrl: 'https://media.architecturaldigest.com/content/dam/ad/public/2024/09/coldplay-india.jpg' },
      { name: 'Ed Sheeran Mathematics Tour', artist: 'Ed Sheeran', venue: 'O2 Arena', posterUrl: 'https://i.scdn.co/image/ab6761610000e5eb4257121b672728929bbcc205' },
      { name: 'Arijit Singh Live', artist: 'Arijit Singh', venue: 'DY Patil Stadium', posterUrl: 'https://assets.telegraphindia.com/telegraph/2024/02/1707926207_arijit-singh.jpg' }
    ];

    for (let i = 0; i < concerts.length; i++) {
      const concert = concerts[i];
      const wikiData = await fetchWikiData(concert.artist.replace(' ', '_'));
      const date = new Date();
      date.setDate(date.getDate() + (i + 2) * 5);
      
      eventsToAdd.push({
        name: concert.name,
        eventType: 'Concert',
        artists: [{ name: concert.artist }],
        description: wikiData.description || 'A spectacular live concert experience you will never forget.',
        date,
        venue: { name: concert.venue, address: concert.venue, city: concert.venue.split(' ')[0] },
        posterUrl: concert.posterUrl || wikiData.image || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
        ticketCategories: TICKET_CATEGORIES,
        isActive: true
      });
    }

    const inserted = await Event.insertMany(eventsToAdd);
    console.log(`Successfully added ${inserted.length} real-world events.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error importing events:', error);
    process.exit(1);
  }
}

importEvents();