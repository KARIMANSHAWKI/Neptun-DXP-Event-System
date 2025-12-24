// Assuming 'reg' and 'event' variables are available in the script's context.
 
 // Fetch events needing notification
   const events = await entities.event.find({
        where: {
            notifyOrganizerPending: true
        }
    });


  for (var i = 0; i < events.length; i++) {
    try {
    var event = events[i];
    var organizer =  JSON.parse(event.createdByPerson);

    if(organizer){

// const html = "<html><body>Hello</body></html>";
sendEmail(
    organizer.email,
     "Event Status",
    null,
    'kariman@g.com',
   "faf93bd2-6094-41bf-846d-01f0649ab402",
    {
        organizer_name: organizer.name,
        status: event.status,
        event_name: event.title,
        event_date: event.eventdate,
        event_capacity: event.capacity,
        company_name: "Neptune Events"
    }
);



            // Update the event to prevent sending the notification again
            event.notifyOrganizerPending = false;
            await entities.event.save(event);

    
    log.info("Notification email sent successfully.");
    }
   
    
    complete();

} catch (e) {
    log.error("Failed to send notification email:", e);
    fail(e.message || e);
}
  }
   