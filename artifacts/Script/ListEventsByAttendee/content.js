try {
    // Use QueryBuilder to get events and count their attendees in a single, efficient query.
    const eventsData = await entities.event.createQueryBuilder("event")
        .select("event.title", "title") // Select the event title for the chart label
        .addSelect("COUNT(registration.attendeeid)", "attendees") // Count registrations and alias the count as 'attendees'
        .leftJoin("registrationentity", "registration", "registration.eventid = event.id") // Join with registration table to count attendees
        .groupBy("event.id") // Group by event to get a count per event
        .orderBy("attendees", "DESC") // Order by the number of attendees
        .getRawMany(); // Execute the query to get the raw data

        console.log(eventsData);

    // Parse the attendee count from string to integer for proper use in charts
    const chartData = eventsData.map(item => ({
        title: item.title,
        attendees: parseInt(item.attendees, 10) || 0
    }));

    // Set the formatted data as the response
    result.data = chartData;
    
    // Complete the script execution successfully
    complete();

} catch (error) {
    // Log any errors that occur
    log.error("Error fetching event data for charts:", error);
    
    // Prepare an error response
    result.data = {
        error: "Failed to fetch event data.",
        message: error.message
    };
    result.statusCode = 500;
    
    // Fail the script execution
    fail(error.message);
}