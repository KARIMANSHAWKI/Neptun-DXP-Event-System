function loadEvents(status) {
    sap.ui.core.BusyIndicator.show(0);

    let apiCall;
    // Check if a specific status filter should be applied.
    // If the status is empty, null, or the specific text 'All Statuses', fetch all events.
    if (status && status !== 'All Statuses') {
        const options = {
            parameters: {
                where: JSON.stringify({
                    status: status
                })
            }
        };
        apiCall = apiRestAPIListing(options);
    } else {
        // Fetch all events if no specific status is selected.
        apiCall = apiRestAPIListing();
    }

    apiCall
        .success(function(data) {
            // FIX: Check if the model is initialized before using it.
            if (!window.appModel) {
                console.error("appModel was not initialized. Initializing now.");
                window.appModel = new sap.ui.model.json.JSONModel();
                App.setModel(window.appModel);
            }

            window.appModel.setProperty("/events", data);
            sap.m.MessageToast.show("Events loaded successfully.");
            sap.ui.core.BusyIndicator.hide();
        })
        .error(function(err) {
            sap.m.MessageBox.error("Failed to load events.");
            sap.ui.core.BusyIndicator.hide();
        });
}

function handleStatusFilterChange(oEvent) {
    const selectedStatus = oEvent.getParameter("selectedItem").getKey();
    loadEvents(selectedStatus);

}