const twilio = require('twilio');
const client = new twilio('', '');

async function sendMsg(){
    client.messages
  .create({
    body: 'Hello from Node.js + Twilio!',
    from: '+14473474950', // Your Twilio number
    to: '+919908835692'   // Destination number
  })
  .then(message => console.log(message.sid));

}


function callTwillio(){
    client.calls
  .create({
    url: 'http://demo.twilio.com/docs/voice.xml', // TwiML instructions
    to: '+919908835692',
    from: '+14473474950'
  })
  .then(call => console.log(call.sid));

}


sendMsg();

callTwillio();