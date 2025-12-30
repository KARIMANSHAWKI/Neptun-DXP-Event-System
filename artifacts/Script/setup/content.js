try {
    // A selection script must return a field catalog.
    // This is an array of objects defining the columns for an adaptive component.
    const fieldCatalog = [
        {
            name: "title",
            label: "Title",
            type: "text"
        },
        {
            name: "attendees",
            label: "Attendees",
            type: "text"
        },
       
    ];

    // Set the field catalog as the response data
    result.data = fieldCatalog;
    
    complete();

} catch (error) {
    log.error("Error creating field catalog:", error);
    fail(error.message);
}