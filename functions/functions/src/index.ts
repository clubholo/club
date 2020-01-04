import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { DataSnapshot } from 'firebase-functions/lib/providers/database';
import { ClientResponse } from 'http';
admin.initializeApp();

const APP_NAME = "SingleNetværket";

// Tested: Yes
export const sendContactMail = functions.https.onRequest(async (request, response) => {

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    const mailOptions = {
        from: `${request.body.name} <noreply@firebase.com>`,
        to: 'info@singlen.dk',
        subject: request.body.subject,
        text: `Sendt fra: ${request.body.from}
        --------------------------------------
        ${request.body.mailText}` 
    };

    sendEmail(mailOptions, request, response);

});

// Tested: Yes
export const sendWelcomeEmail = functions.auth.user().onCreate((user) => {
    // [END onCreateTrigger]
      // [START eventAttributes]
    const email = user.email; // The email of the user.
    const displayName = user.displayName; // The display name of the user.
    const mailContent = `Tak for din oprettelse ${displayName || ''}! Tak for din oprettelse, du har nu adgang til sitet ${APP_NAME}. `
    const mailContent2 = `Tak for din oprettelse ${displayName || ''}! Husk at bekræfte din email for at få adgang. Vi har sendt en mail med et link.`

      // [END eventAttributes]
      const mailOptions = {
        from: `${APP_NAME} <noreply@firebase.com>`,
        to: email,
        subject: `Welcome to ${APP_NAME}`,
        text: `${user.emailVerified ? mailContent : mailContent2}`
    };
    
    sendEmail(mailOptions);

    return "done";

});

// Tested: Yes
export const sendGoodbyeEmail = functions.auth.user().onDelete((user) => {
   
    const email = user.email; // The email of the user.
    const displayName = user.displayName; // The display name of the user.

    const mailContent = `${user.emailVerified ? "Tak for denne gang.... ${displayName || ''} vi har nu slettet din profil fra ${APP_NAME}." : "Der er gået 24 timer uden at du har bekræftet din email. Derfor er dine oplysninger blevet slettet."}`;

    const mailOptions = {
        from: `${APP_NAME} <noreply@firebase.com>`,
        to: email,
        subject: `Welcome to ${APP_NAME}`,
        text: mailContent 
    };

    sendEmail(mailOptions);

    return "done";

});

// Tested: Yes
export const sendNewsletter = functions.https.onRequest(async (request, response) => {

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
   
    let obj = JSON.parse(request.body);
    
    admin.auth().listUsers().then( function(listUsersResult) {
        listUsersResult.users.forEach( function (userRecord) {
            const mailOptions = {
                from: `${obj.username}`,
                to: 'info@singlen.dk',
                subject: obj.subject,
                text: obj.mailMsg
            };


            sendEmail(mailOptions, request, response);
            
        });
    }).catch( function(error) {
        console.log(error);
    });

    response.status(200).send("All mails has been sent");
});

// Tested: Yes
export const pingTest = functions.https.onRequest(async (request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    response.status(200).send('Hello from firebase');
});

// Tested: Yes
export const afterEventHostMail = functions.https.onRequest(async (request, response) => {

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    const users = []; // uids
    const keys = []; // event ids
    admin.database().ref("/events").once('value').then(snapshots => {
        snapshots.forEach( snapshot => {
            let dateToTime = dateFormatter(snapshot.val().dateStart);
            let threeDays = 72*60*60*100;
            let oneDay = 23*60*60*100;
            if (dateToTime + threeDays < Date.now() 
                && snapshot.val().isResolved === undefined) {
                    users.push(snapshot.val().host);
                    keys.push(snapshot.key);
                    console.log("Lists: " + users, keys);
                    console.log("DateToTime: " + dateToTime);
                    console.log("Date check: " +  dateToTime+threeDays + " < " + Date.now() + " = " + (dateToTime+threeDays < Date.now()) );
                }

            return false;
        });

        

        admin.database().ref('/users').once('value').then(snapshots => {
            snapshots.forEach(snapshot => {
                if ( users.indexOf(snapshot.key) > -1) {
                    console.log("uid: " + users[users.indexOf(snapshot.key)]);
                    console.log("Event id: " +  keys[users.indexOf(snapshot.key)]);
                    let date =  Date.parse(snapshot.val().subscribed_until);
                    const additionalDays = 24*60*60*100 * 1; // times days *1 days
                    admin.database().ref('/users/'+snapshot.key).update({subscribed_until: new Date(date + additionalDays).toString()});
                    
                    getAverageScoreFromEvent(keys[users.indexOf(snapshot.key)]).then(avgScore => {
                        console.log("Then function scope: " + avgScore);
                        getNumberOfEvents(users[users.indexOf(snapshot.key)]).then(numEvents => {
                            getUserScore(users[users.indexOf(snapshot.key)]).then(userScore => {
                                const mailOptions = {
                                    from: `${APP_NAME} <clubholodatabase@gmail.com>`,
                                    to: 'info@singlen.dk', //snapshot.val().email
                                    subject: `Tak for afholdelse af eventet`,
                                    text: `Kære ${snapshot.val().username},
                                    Vi sætter stor pris på at du bidrager til netværket med dine events. Vi håber at du selv havde
                                    en god oplevelse, og kan fortælle, at dine deltagere satte stor pris på det! ${avgScore === -1 ? `Vi har desværre ikke modtaget nok tilbagemeldinger fra deltagerne til at
                                    kunne give dig en anonymiseret tilbagemelding, men derfor skal du alligevel ikke snydes for
                                    en lille anerkendelse af eventet, så vi har tilføjet en gratis dag til dit medlemsskab.` : `Deltagerne har
                                    vurderet dit arrangement på en skala fra 1-5 med en gennemsnitlig vurdering på ${avgScore}. 
                                    Det er super flot, vi håber du snart har lyst til at gentage succesen og afholde endnu et
                                    arrangement. I mellemtiden vil vi gerne giver dig en lille anerkendelse af eventet ved at tilføje
                                    en gratis dag til dit medlemsskab.`}.
                    
                                    Du har nu holdt ${numEvents} event(s), og disse har tilsammen en rating på ${userScore}.
                                    Vi glæder os til at se nye events fra dig!
                                    Kærlig hilsen
                                    Henrik & Diana.
                                    `,
                                }
            
                                sendEmail(mailOptions);
                                admin.database().ref('/events/'+keys[users.indexOf(snapshot.key)]).update({isResolved: true});

                            });
                        });
                    });
                }
                return false;
            });
        });
    });
    response.status(300).send("Async operation in progress");
});

// Tested: Yes
export const afterEventAttendeeMail = functions.https.onRequest(async (request, response) => {

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    const emails = [];
    const keys = [];
    admin.database().ref("/events").once('value').then(snaphots => {
        snaphots.forEach( snapshot => {
            let dateToTime = dateFormatter(snapshot.val().dateStart);
            let add = 24*60*60*100;
            let upperLimit = 23*60*60*100;
        
            if (dateToTime + add < Date.now() && snapshot.val().isResolved === undefined) {
                    Object.keys(snapshot.val().participants).map(function (key) {
                        console.log(snapshot.val().participants[key]);
                        admin.database().ref('/users').orderByChild('username').equalTo(snapshot.val().participants[key].username).once('value').then(snapshots => {
                             snapshots.forEach(snapshot => {
                                emails.push(snapshot.val().email);
                                return true;
                             });
                             console.log("Arr of emails: " + emails);
                             emails.forEach(email => {

                            const mailContent = `<html><body>Tak for deltagelse i event ${snapshot.val().name}. 
                            Husk at bedømme/rate: <a href='https://singlen.dk/rate-event?${snapshot.key}' .</body></html>`;
                    
                            // setup e-mail data with unicode symbols
                            var mailOptions = {
                                from: `${APP_NAME} <donotreply@singlen.dk>`,
                                to: email, //to: email
                                subject: "Tak for deltagelse i event",
                                html: mailContent,
                                //html: "<b>Hello world ✔</b>" // html body
                            }
                    
                            sendEmail(mailOptions, request, response);
                    
                        });
                    }); 
                });
            }
            return false;
        });
    });

    response.status(200).send("Sending emails to attendees");

});

// Tested: No
export const eventDeletedNotification = functions.database.ref('/events/{eventId}').onDelete( (snapshot) => {
    Object.keys(snapshot.val().participants).forEach(p => {
        admin.database().ref('/users').once('value').then(snapshots => {
            snapshots.forEach(snapshot => {
                console.log(snapshot);
                if (snapshot.val().username = snapshot.val().participants[p].username) {
                    
                    const mailContent = snapshot.val().deleted;

                    // setup e-mail data with unicode symbols
                    var mailOptions = {
                        from: `${APP_NAME} <donotreply@singlen.dk>`,
                        to: "info@singlen.dk", //to: snapshot.val().email
                        subject: "",
                        text: mailContent,
                        //html: "<b>Hello world ✔</b>" // html body
                    }

                    sendEmail(mailOptions);

                    }
                return false;
            });
        });
    });
});

// Tested: Yes
export const eventReminderShort = functions.https.onRequest(async (request, response) => {

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");


    admin.database().ref('/events').once('value').then(snapshots => {
        snapshots.forEach(snapshot => {
            if (snapshot.val().shortReminderSent === undefined) {

                const today = Date.now();
                let dateStr: string = snapshot.val().dateStart;

                const tillEvent = Date.parse(snapshot.val().dateStart);
                const reminderDay = 48*60*60*100*10;

                let difference = tillEvent - today;

                if (tillEvent - today < reminderDay) {

                    admin.database().ref('/users').once('value').then(userSnapshots => {
                        console.log("Event match found: " + snapshot.val().name);
                        userSnapshots.forEach(userSnapshot => {
                            for(let i = 0; i < snapshot.val().participants.length; i++) {
                                if (userSnapshot.val().username === snapshot.val().participants[i].username) {
                                    console.log ("Event: " + snapshot.val().name + ", participants: " + snapshot.val().participants[i].username);
                                    console.log(snapshot.val().participants[i]);
                                    // setup e-mail data with unicode symbols
                                    var mailOptions = {
                                        from: `${APP_NAME} <donotreply@singlen.dk>`,
                                        to: userSnapshot.val().email, //to: userSnapshot.val().email,
                                        subject: "Påmindelse",
                                        text: `Hej ${userSnapshot.val().username}
                                            Der er nu mindre end 2 dage til eventet: ${snapshot.val().name}, som du deltager i.`
                                        //html: "<b>Hello world ✔</b>" // html body
                                    }
                                    sendEmail(mailOptions, request, response);
                                }
                            }
                            return false;
                        });
                        admin.database().ref('/events/'+snapshot.key).update({shortReminderSent: true});
                    });
                }
            }
            return false;
        });
    });

    response.status(200).send("Reminders have been sent");
});

// Tested: No
export const eventReminderLong = functions.https.onRequest(async (request, response) => {

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");


    admin.database().ref('/events').once('value').then(snapshots => {
        snapshots.forEach(snapshot => {
            if (snapshot.val().longReminderSet === undefined) {

                const today = Date.now();
                let dateStr: string = snapshot.val().dateStart;

                const tillEvent = Date.parse(snapshot.val().dateStart);
                const reminderDay = 168*60*60*100*10;

                let difference = tillEvent - today;

                if (tillEvent - today < reminderDay) {

                    admin.database().ref('/users').once('value').then(userSnapshots => {
                        userSnapshots.forEach(userSnapshot => {
                            for(let i = 0; i < snapshot.val().participants.length; i++) {
                                if (userSnapshot.val().username === snapshot.val().participants[i].username) {
                                    console.log ("Event: " + snapshot.val().name + ", participants: " + snapshot.val().participants[i].username);
                                    console.log(snapshot.val().participants[i]);
                                    // setup e-mail data with unicode symbols
                                    var mailOptions = {
                                        from: `${APP_NAME} <donotreply@singlen.dk>`,
                                        to: userSnapshot.val().email,
                                        subject: "Påmindelse",
                                        text: `Hej ${userSnapshot.val().username},
                                        Der er nu mindre end en uge til eventet: ${snapshot.val().name}, som du deltager i.`
                                        //html: "<b>Hello world ✔</b>" // html body
                                    }
                                    sendEmail(mailOptions, request, response);
                                }
                            }
                            return false;
                        });
                        admin.database().ref('/events/'+snapshot.key).update({longReminderSet: true});
                    });
                }
            }
            return false;
        });
    });

    response.status(200).send("Reminders have been sent");

});

// Tested: No
export const findAndChooseMonthlyJumper = functions.https.onRequest(async (request, response) => {

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    admin.database().ref('/users').once('value').then(snapshots => {
        let winner: admin.database.DataSnapshot;
        let userMail = winner.val().email;
        let highestFound = -1;
        snapshots.forEach(snapshot => {
            if (snapshot.val().numberOfEventsHosted > highestFound) {
                highestFound = snapshot.val().numberOfEventsHosted;
                winner = snapshot;
            }
            return false;
        });

        let date =  Date.parse(winner.val().subscribed_until);
        const additionalDays = 24*60*60*100 * 3; // times days *3 days
        admin.database().ref('/users/'+winner).update({subscribed_until: new Date(date + additionalDays).toString() });

        const mailContent = `Vi har valgt dig fordi du har været vært til de bedste events i denne måned. 
        Du bærer fanen højst og det ønsker vi at kvitterer med 3 dages gratis medlemsskab. Du skal ikke gøre noget. Dagene er blevet tilføjet din bruger. `;

        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: `${APP_NAME} <donotreply@singlen.dk>`,
            to: "info@singlen.dk",
            subject: "Tillykke! Du er blevet valgt som månedens hopper.",
            text: mailContent,
            //html: "<b>Hello world ✔</b>" // html body
        }

        sendEmail(mailOptions, request, response);

        /* Consider implementing emails to all the other users, 
        notifying them of the winner and encourage them to attend his/her events */


    });
});

export const deleteInvalidAccounts = functions.https.onRequest(async (request, response) => {
    const oneDay = 24*60*60*100
    admin.auth().listUsers().then( function(listUsersResult) {
        listUsersResult.users.forEach( function(userRecord) {
            if (Date.parse(userRecord.metadata.creationTime) + oneDay > Date.now()) {
                admin.auth().deleteUser(userRecord.uid);
            }
        });
    });
});

/* Undeployed functions */

export const newEventCreated = functions.database.ref('/events').onCreate( (snapshot) => {
    admin.database().ref('/users').once('value').then(snapshots => {
        snapshots.forEach( userSnapshot => {
            if (userSnapshot.val().notifications === "Ved hvert nyt event") {
                const mailContent = `<p>Der er lige oprettet et nyt event: ${snapshot.val().name}, som du måske har interesse i at deltage i!
                                    Du kan klikke <a href='https://singlen.dk/viewEvent?${snapshot.key}'>her</a> for at gå til eventet<p>`;

                // setup e-mail data with unicode symbols
                var mailOptions = {
                    from: `${APP_NAME} <donotreply@singlen.dk>`,
                    to: "fgs@einrot.com", //to: userSnapshot.val().email;
                    subject: "Nyt event på SingleNetværket",
                    html: mailContent,
                    //html: "<b>Hello world ✔</b>" // html body
                }

                sendEmail(mailOptions);
            }
            return true;
        });
    });
});

export const dailyUpdate = functions.https.onRequest(async (request, response) => {
    admin.database().ref('/users').once('value').then(snapshots => {
        snapshots.forEach( userSnapshot => {
            if (userSnapshot.val().notifications === "Dagligt") {
                const mailContent = `Her er en oversigt over de events, som er blevet oprettet på SingleNetværket de sidste 24 timer:
                `;

                // setup e-mail data with unicode symbols
                var mailOptions = {
                    from: `${APP_NAME} <donotreply@singlen.dk>`,
                    to: "fgs@einrot.com", //to: userSnapshot.val().email;
                    subject: "Nyt event på SingleNetværket",
                    html: mailContent,
                    //html: "<b>Hello world ✔</b>" // html body
                }

                sendEmail(mailOptions);
            }
            return true;
        });
    });
});

function sendEmail(mailOptions: {}, request=undefined, response=undefined) {
    /* Nodemailer */
    var nodemailer = require("nodemailer");
    // create reusable transport method (opens pool of SMTP connections)
    var smtpTransport = nodemailer.createTransport(
        "smtps://clubholodatabase%40gmail.com:"+encodeURIComponent('sn1337DK') + "@smtp.gmail.com:465"
        );

    smtpTransport.sendMail(mailOptions).then( (res) => {
        if (response) {
            response.status(200).send("Message was sent");
            return res;
        } else {
            return "Success!";
        }
    }).catch( (error) => {
        if (response) {
            response.status(442).send("An error has occured on the server side");
            return error;
        } else {
            return "Failed" + error;
        }
    });
}

function dateFormatter(date: string) {
    let str = date.split(' ', 4);
    // idx 1 2 3
    let d = str[1]+ "/" + str[2] + "-" + str[3];
    return Date.parse(d);
}

async function getAverageScoreFromEvent(eKey: string) {
    let score = -1;
    let count = 0;
    let goBwah = await Promise.resolve(
        admin.database().ref("/ratings").orderByChild('fk_event').equalTo(eKey).once('value').then(snapshots => {
            snapshots.forEach(snapshot => {
                if (snapshot.val().score) {
                    score += snapshot.val().score;
                    count++;
                } 
                return true;
            });
        }));
    console.log("Inside function scope: " +  score);
    return score;
}

async function getNumberOfEvents(uid: string) {
    let count = 0;
    let goBwah = await Promise.resolve(
        admin.database().ref('/events').orderByChild('host').equalTo(uid).once('value').then(snapshots => {
            snapshots.forEach(snapshot => {
                count++;
                return true;
            });
        }));
    return count;
}

async function getUserScore(uid: string) {
    let score = 0;
    let count = 0;
    let goBwah = await Promise.resolve(
        admin.database().ref("/ratings").orderByChild('fk_host').equalTo(uid).once('value').then(snapshots => {
            snapshots.forEach(snapshot => {
                score += snapshot.val().score;
                count++;
                return true;
            });
        }));
    score = score / count;
    return score;;
}

