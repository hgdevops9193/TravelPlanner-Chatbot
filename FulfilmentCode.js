const express = require('express')
const bodyParser = require('body-parser')

const {
    dialogflow,
    Permission,
    MediaObject,
    Image,
    Suggestions,
    LinkOutSuggestion,
} = require('actions-on-google')


// Create an app instance
const app = dialogflow(
    {
        debug: true
    }
)

app.intent('Flight.booking', (conv, params) => {
    const date = params.date;
    const date1 = params.date1;
    const geo_city = params.geocity;
    const geo_city1 = params.geocity1;
    const cabin = params.FlightClass;
    if (date1 === "today") {
        conv.ask("No flights are available for today.Quick suggestions:- change date, change destination, start over");
    }
    else {
        conv.ask(`Booking ${cabin} class flight from ${geo_city} to ${geo_city1} for ${date} confirmed. Do you want to select seat as well?`)
    }
});



app.intent('request_permission', (conv, params) => {
    conv.data.requestedPermission = 'DEVICE_PRECISE_LOCATION';
    return conv.ask(new Permission({
        context: 'Is you current location is origin of flight? If yes',
        permissions: conv.data.requestedPermission,
    }));

});

app.intent('user_info', (conv, params, permissionGranted) => {
    if (permissionGranted) {
        const {
            requestedPermission
        } = conv.data;
        if (requestedPermission === 'DEVICE_PRECISE_LOCATION') {

            const city = conv.device.location.city;
            //const city1 = 

            if (city) {
                conv.ask(`You are at ${city}`);
                conv.followup('flight_booking', {
                    geocity: city,
                    geocity1: params.dest
                })
            } else {
                // Note: Currently, precise locaton only returns lat/lng coordinates on phones and lat/lng coordinates
                // and a geocoded address on voice-activated speakers.
                // Coarse location only works on voice-activated speakers.
                conv.ask('Sorry, I could not figure out where you are.');
                conv.followup('flight_booking', {})
            }

        }
    } else {
        conv.ask('Sorry, permission denied.');
        conv.followup('flight_booking', {})
    }
});

app.intent('Media Response', (conv) => {
    if (!conv.surface.capabilities
        .has('actions.capability.MEDIA_RESPONSE_AUDIO')) {
        conv.ask('Sorry, this device does not support audio playback.');
        conv.ask('Which response would you like to see next?');
        return;
    }
    conv.ask('Please complete payment by clicking here');
    conv.ask(new LinkOutSuggestion({
        name: 'Payment Link',
        url: 'https://paytm.com/',
    }));
    conv.ask(new MediaObject({
        name: 'Payment Gateway',
        url: 'https://raw.githubusercontent.com/anars/blank-audio/master/15-seconds-of-silence.mp3',
        description: 'Payment Gateway',
        icon: new Image({
            url: 'https://cdn.dribbble.com/users/447957/screenshots/6899626/payment-animation.gif',
        }),
    }));
    conv.ask(new Suggestions(['Cancel Payment']));
});

app.intent('Media Status', (conv) => {
    const mediaStatus = conv.arguments.get('MEDIA_STATUS');
    let response1 = 'Unknown media status received.';
    if (mediaStatus && mediaStatus.status === 'FINISHED') {
        var id = Math.floor((Math.random() * 100000) + 10000);
        response1 = `Thanks for the payment! Your ticket have been booked and your booking ID is ${id}.`;
        response2 = `Do you want to book hotel room also?`
    }
    conv.ask(response1);
    conv.ask(response2);
});

app.intent('Flight.booking - BookSeat', (conv) => {
    if (!conv.screen) {
        conv.ask('Chips can be demonstrated on screen devices.');
        conv.ask('Which response would you like to see next?');
        return;
    }
    conv.followup('Media_Response', {})
});

app.intent('Flight.booking - NoBookSeat', (conv) => {
    if (!conv.screen) {
        conv.ask('Chips can be demonstrated on screen devices.');
        conv.ask('Which response would you like to see next?');
        return;
    }
    conv.followup('Media_Response', {})
});

app.intent('Flight.booking - BookSeat - NoBookHotel', (conv) => {
    if (!conv.screen) {
        conv.ask('Chips can be demonstrated on screen devices.');
        conv.ask('Which response would you like to see next?');
        return;
    }
    conv.ask('Thanks for booking with us. Have a nice trip:)')
    conv.ask(new MediaObject({
        name: 'Want to book hotel',
        url: 'https://raw.githubusercontent.com/anars/blank-audio/master/15-seconds-of-silence.mp3',
        description: 'Want to book hotel',
        icon: new Image({
            url: 'https://cdn.dribbble.com/users/447957/screenshots/6899626/payment-animation.gif',
        }),
    }));
    conv.ask(new Suggestions(['Book a hotel']));
});

app.intent('Flight.booking - NoBookSeat - NoBookHotel', (conv) => {
    if (!conv.screen) {
        conv.ask('Chips can be demonstrated on screen devices.');
        conv.ask('Which response would you like to see next?');
        return;
    }
    conv.ask('Thanks for booking with us. Have a nice trip:)')
    conv.ask(new MediaObject({
        name: 'Want to book hotel',
        url: 'https://raw.githubusercontent.com/anars/blank-audio/master/15-seconds-of-silence.mp3',
        description: 'Want to book hotel',
        icon: new Image({
            url: 'https://cdn.dribbble.com/users/447957/screenshots/6899626/payment-animation.gif',
        }),
    }));
    conv.ask(new Suggestions(['Book a hotel']));
});

app.intent('Thankyou', (conv) => {
    conv.ask('Thanks for booking with us.');
});

app.intent('Default Fallback Intent', conv => {
    conv.ask(`I didn't understand. Can you tell me something else?`)
})

const expressApp = express().use(bodyParser.json())

expressApp.post('/fulfillment', app)

expressApp.listen(3000)

