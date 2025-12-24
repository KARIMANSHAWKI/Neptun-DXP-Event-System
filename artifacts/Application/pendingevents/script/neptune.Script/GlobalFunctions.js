var appModel;

function initializeApp() {
    appModel = new sap.ui.model.json.JSONModel({});
    if (typeof app !== 'undefined') {
        app.setModel(appModel, "appModel");
    }
    loadPendingEvents();
}

function loadPendingEvents() {
    sap.ui.core.BusyIndicator.show(0);
    
    apiRestAPIListing()
        .success(function(data) {
            const pendingEvents = data.filter(function(event) {
                return event.status === 'pending';
            });
            appModel.setProperty("/pendingEvents", pendingEvents);
            
            if (typeof eventsTable !== 'undefined') {
                var eventTemplate = new sap.m.ColumnListItem({
                    type: "Navigation",
                    cells: [
                        new sap.m.Text({ text: "{appModel>title}" }),
                        new sap.m.Text({ text: "{appModel>eventdate}" }),
                        new sap.m.Text({ text: "{appModel>location}" }),
                        new sap.m.Text({ text: "{appModel>status}" })
                    ]
                });

                eventsTable.bindItems({
                    path: "appModel>/pendingEvents",
                    template: eventTemplate
                });
            }
            sap.ui.core.BusyIndicator.hide();
        })
        .error(function(error) {
            sap.m.MessageBox.error("Failed to load events.");
            sap.ui.core.BusyIndicator.hide();
        });
}

function handleEventPress(oEvent) {
    const context = oEvent.getParameter("listItem").getBindingContext("appModel");
    if (context) {
        const selectedEvent = JSON.parse(JSON.stringify(context.getObject()));
        appModel.setProperty("/selectedEvent", selectedEvent);

        if (typeof eventNameInput !== 'undefined') {
            eventNameInput.setValue(selectedEvent.title);
        }
        if (typeof eventDatePicker !== 'undefined' && selectedEvent.eventdate) {
            eventDatePicker.setDateValue(new Date(selectedEvent.eventdate));
        }
        if (typeof eventLocationInput !== 'undefined') {
            eventLocationInput.setValue(selectedEvent.location);
        }
        if (typeof eventDescriptionTextArea !== 'undefined') {
            eventDescriptionTextArea.setValue(selectedEvent.description);
        }
        if (typeof eventStatusInput !== 'undefined') {
            eventStatusInput.setValue(selectedEvent.status);
        }

        if (typeof app !== 'undefined' && typeof eventDetailsPage !== 'undefined') {
            app.to(eventDetailsPage);
        }
    }
}

function updateEventStatus(newStatus) {
    console.log(newStatus)
    const currentEvent = appModel.getProperty("/selectedEvent");
    if (!currentEvent || !currentEvent.id) {
        sap.m.MessageBox.error("No event selected or event is missing an ID.");
        return;
    }

currentEvent.status = newStatus;
currentEvent.notifyOrganizerPending = true;

    sap.ui.core.BusyIndicator.show(0);
    
    apiRestAPIUpdateEvent({
        data: currentEvent
    })
    .success(function(data) {
        console.log(data)
        sap.m.MessageToast.show("Event status updated successfully.");
        if (typeof app !== 'undefined' && typeof eventsListPage !== 'undefined') {
            app.to(eventsListPage);
        }
        loadPendingEvents();
        sap.ui.core.BusyIndicator.hide();
    })
    .error(function(error) {
        sap.m.MessageBox.error("Failed to update event status.");
        sap.ui.core.BusyIndicator.hide();
    });
}

initializeApp();