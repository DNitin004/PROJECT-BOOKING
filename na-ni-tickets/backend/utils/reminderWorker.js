const Booking = require('../models/Booking')
const User = require('../models/User')
const emailService = require('./emailService')

async function checkAndSendReminders(){
  try{
    const now = new Date()
    const tenMin = new Date(now.getTime() + 10 * 60 * 1000)

    const bookings = await Booking.find({
      status: 'Confirmed',
      reminderSent: { $ne: true },
      'selectedItems.date': { $lte: tenMin, $gte: now }
    }).populate('userId')

    if(!bookings.length) return

    for(const b of bookings){
      try{
        const user = b.userId
        if(!user || !user.email) continue

        if(typeof emailService.sendReminderEmail === 'function'){
          await emailService.sendReminderEmail(user.email, b)
        }else if(typeof emailService.sendBookingConfirmation === 'function'){
          // fallback: reuse booking confirmation template with a reminder flag
          await emailService.sendBookingConfirmation(user.email, b, { reminder: true })
        }else{
          console.log('No email sender available to send reminder for', b._id)
        }

        b.reminderSent = true
        await b.save()
        console.log(`Reminder sent for booking ${b._id} to ${user.email}`)
      }catch(err){
        console.error('Error sending reminder for booking', b._id, err.message)
      }
    }
  }catch(err){
    console.error('Reminder worker failed', err.message)
  }
}

function startReminderWorker(){
  console.log('Starting reminder worker (checks every 60s)')
  // run immediately then every 60s
  checkAndSendReminders()
  return setInterval(checkAndSendReminders, 60 * 1000)
}

module.exports = { startReminderWorker }
