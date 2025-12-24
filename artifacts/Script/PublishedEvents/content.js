try {
    // Verify that the registrationentity exists before attempting to use it.
    if (!entities.registrationentity) {
        throw new Error("The entity 'registrationentity' is not defined. Please ensure the table exists and is correctly configured.");
    }

    // Fetch all events with status 'Published'
    const publishedEvents = await entities.event.find({
        where: {
            status: 'approved' // Corrected from 'approved' to 'Published'
        },
        order: {
            eventdate: 'ASC' // Order by event date ascending
        }
    });

    // Asynchronously process each event to get the registration count
    const eventsWithUpdatedCapacity = await Promise.all(publishedEvents.map(async (event) => {
        // This assumes the 'event' entity has a primary key 'id'.
        const registrationCount = await entities.registrationentity.count({
            where: {
                eventid: event.id // Assuming the foreign key in 'registrationentity' is named 'event'
            }
        });

        console.log(event.id);

        // Overwrite the 'capacity' field with the number of registrations
        return {
            ...event,
            capacity: registrationCount
        };
    }));

    // Return the modified list of events
    result.data = eventsWithUpdatedCapacity;
    console.log(result.data);
    
    complete();

} catch (error) {
    log.error('Error fetching published events and registrations:', error);
    
    result.data = {
        error: 'Failed to fetch published events and registrations',
        message: error.message
    };
    result.statusCode = 500;
    
    fail(error.message);
}