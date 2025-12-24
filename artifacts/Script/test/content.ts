const emailOptions = {
                to: "nour@hotmail.com",
                subject: "mail test",
                templateId: "faf93bd2-6094-41bf-846d-01f0649ab402", // The name of your email template
                templateData: {
                    organizer_name:"nour",
                    event_title: "workshop",
                    event_eventdate: "10-10-2026",
                    event_capacity: "10"
                }
            };

            // Send the email using the template
            let x = sendEmail(emailOptions);
            // log.info(`Notification email sent successfully for event ID ${event.id} to ${organizer?.email}.`);
