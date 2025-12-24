try {
    // A selection script must return a field catalog.
    // This is an array of objects defining the columns for an adaptive component.
    const fieldCatalog = [
        {
            name: "id",
            label: "ID",
            type: "text"
        },
        {
            name: "name",
            label: "Name",
            type: "text"
        },
        {
            name: "description",
            label: "Description",
            type: "text"
        },
        {
            name: "createdAt",
            label: "Created At",
            type: "date"
        }
    ];

    // Set the field catalog as the response data
    result.data = fieldCatalog;
    
    complete();

} catch (error) {
    log.error("Error creating field catalog:", error);
    fail(error.message);
}