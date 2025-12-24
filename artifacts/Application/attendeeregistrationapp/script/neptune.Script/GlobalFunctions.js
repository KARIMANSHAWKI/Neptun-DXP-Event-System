var appModel;

// Initializes the application
function initializeApp() {
    // Initialize the JSON model
    appModel = new sap.ui.model.json.JSONModel({
        dashboard: {
            approvedEvents: 0,
            myRegistrations: 3 // Mock data
        },
        selectedEvent: {},
        allEvents: [], // To store the master list of events
        myRegistrationsData: []
    });
    if (typeof App !== 'undefined') {
        App.setModel(appModel, "appModel");
    }

    // Bind dashboard tiles
    bindDashboardTiles();

    // Load initial data for the dashboard
    loadDashboardData();
}

// Bind dashboard tile values to the model
function bindDashboardTiles() {
    if (typeof approvedEventsCount !== 'undefined') {
        approvedEventsCount.bindProperty("value", "appModel>/dashboard/approvedEvents");
    }
    if (typeof myRegistrationsCount !== 'undefined') {
        myRegistrationsCount.bindProperty("value", "appModel>/dashboard/myRegistrations");
    }
}

// Load data for the main dashboard tiles
function loadDashboardData() {
    sap.ui.core.BusyIndicator.show(0);
    apiRestAPIListEvent()
        .success(function(data) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const approvedEvents = data.filter((event =>
                event.status === 'approved' && new Date(event.eventdate) >= today
            ));
            appModel.setProperty("/dashboard/approvedEvents", approvedEvents.length);
            sap.ui.core.BusyIndicator.hide();
        })
        .error(function(err) {
            sap.m.MessageBox.error("Failed to load dashboard data.");
            sap.ui.core.BusyIndicator.hide();
        });

    apiRestAPIGetEventAttendees({
        parameters: {
            where: JSON.stringify({
                attendeeid: AppCache.userInfo.id
            })
        }
    }).success(function(data) {
        appModel.setProperty("/dashboard/myRegistrations", data.length);
    })
}

// Navigate to the Approved Events list page
function navigateToEventsList() {
    if (typeof App !== 'undefined' && typeof eventsListPage !== 'undefined') {
        setupEventListPage(); // Ensure filter bar is created
        loadAndDisplayEvents();
        App.to(eventsListPage);
    }
}

/**
 * Creates and adds a filter bar to the event list page if it doesn't exist.
 */
function setupEventListPage() {
    if (sap.ui.getCore().byId("eventFilterBar")) {
        return; // Already created
    }

    const oFilterBar = new sap.m.Toolbar({
        id: "eventFilterBar",
        content: [
            new sap.m.SearchField({
                id: "eventSearchField",
                placeholder: "Search by title, location...",
                width: "auto",
                liveChange: applyEventFilters
            }),
           
            new sap.m.DateRangeSelection({
                id: "dateFilterRange",
                width: "250px",
                placeholder: "Filter by date range",
                change: applyEventFilters
            })
        ]
    });

    // Insert the filter bar before the FlexBox
    const pageContent = eventsListPage.getContent();
    const flexBoxIndex = pageContent.indexOf(eventsFlexBox);
    if (flexBoxIndex !== -1) {
        eventsListPage.insertContent(oFilterBar, flexBoxIndex);
    }
}


// Fetches event data, populates filters, and triggers the initial display.
function loadAndDisplayEvents() {
    sap.ui.core.BusyIndicator.show(0);

    apiRestAPIListEvent()
        .success(function(data) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const upcomingApprovedEvents = data.filter(event =>
                event.status === 'approved' && new Date(event.eventdate) >= today
            );

            appModel.setProperty("/allEvents", upcomingApprovedEvents);

            // Populate location filter
            const locationFilter = sap.ui.getCore().byId("locationFilterSelect");
            if (locationFilter) {
                locationFilter.destroyItems();
                locationFilter.addItem(new sap.ui.core.Item({ key: "", text: "All Locations" }));
                const uniqueLocations = [...new Set(upcomingApprovedEvents.map(item => item.location))];
                uniqueLocations.forEach(location => {
                    if (location) { // Ensure location is not null or empty
                        locationFilter.addItem(new sap.ui.core.Item({ key: location, text: location }));
                    }
                });
            }

            applyEventFilters(); // Apply filters to render the initial list
            sap.ui.core.BusyIndicator.hide();
        })
        .error(function(err) {
            sap.ui.core.BusyIndicator.hide();
            sap.m.MessageBox.error("Failed to load events. Please try again later.");
            console.error("API Error:", err);
        });
}

/**
 * Filters the events based on the current values in the filter bar and renders them.
 */
function applyEventFilters() {
    const allEvents = appModel.getProperty("/allEvents") || [];
    let filteredEvents = allEvents;

    const searchField = sap.ui.getCore().byId("eventSearchField");
    const locationFilter = sap.ui.getCore().byId("locationFilterSelect");
    const dateFilter = sap.ui.getCore().byId("dateFilterRange");

    // 1. Filter by Search Term
    const searchTerm = searchField ? searchField.getValue().toLowerCase() : "";
    if (searchTerm) {
        filteredEvents = filteredEvents.filter(event =>
            event.title.toLowerCase().includes(searchTerm) ||
            event.location.toLowerCase().includes(searchTerm)
        );
    }

    // 2. Filter by Location
    const selectedLocation = locationFilter ? locationFilter.getSelectedKey() : "";
    if (selectedLocation) {
        filteredEvents = filteredEvents.filter(event => event.location === selectedLocation);
    }

    // 3. Filter by Date Range
    if (dateFilter && dateFilter.getDateValue() && dateFilter.getSecondDateValue()) {
        const fromDate = dateFilter.getDateValue();
        const toDate = dateFilter.getSecondDateValue();
        // Set time to include full days in the range
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);

        filteredEvents = filteredEvents.filter(event => {
            const eventDate = new Date(event.eventdate);
            return eventDate >= fromDate && eventDate <= toDate;
        });
    }

    renderEventTiles(filteredEvents);
}

/**
 * Renders the provided list of events as tiles in the eventsFlexBox.
 * @param {Array} eventsToRender The array of event objects to display.
 */
function renderEventTiles(eventsToRender) {
    if (typeof eventsFlexBox === 'undefined') return;

    eventsFlexBox.destroyItems();

    if (eventsToRender.length === 0) {
        eventsFlexBox.addItem(new sap.m.Text({ text: "No events match the current filters." }));
        return;
    }

    eventsToRender.forEach(function(event) {
        apiRestAPIGetEventAttendees({
            parameters: {
                where: JSON.stringify({ eventid: event.id, status: 'Confirmed' })
            }
        }).success(function(attendees) {
            const registeredCount = attendees.length;

            const oTile = new sap.m.GenericTile({
                header: event.title,
                subheader: event.location,
                press: onEventTilePress,
                tileContent: [
                    new sap.m.TileContent({
                        footer: "Date: " + new Date(event.eventdate).toLocaleDateString(),
                        content: new sap.m.NumericContent({
                            icon: "sap-icon://group",
                            value: registeredCount,
                            scale: "/ " + event.capacity
                        })
                    })
                ]
            });
            oTile.data("eventData", event);
            eventsFlexBox.addItem(oTile);
        });
    });
}


// Handles the press event on a dynamically created event tile.
function onEventTilePress(oEvent) {
    const oTile = oEvent.getSource();
    const eventData = oTile.data("eventData");

    if (eventData) {
        appModel.setProperty("/selectedEvent", eventData);

        // Populate the detail page controls
        if (typeof eventDetailsTitle !== 'undefined') eventDetailsTitle.setText(eventData.title);
        if (typeof descriptionText !== 'undefined') descriptionText.setText(eventData.description);
        if (typeof dateText !== 'undefined') dateText.setText(new Date(eventData.eventdate).toLocaleDateString());
        if (typeof locationText !== 'undefined') locationText.setText(eventData.location);

        // Asynchronously fetch attendee count to display full capacity details and control registration status
        if (typeof capacityText !== 'undefined' && typeof statusObject !== 'undefined' && typeof registerButton !== 'undefined') {
            apiRestAPIGetEventAttendees({
                parameters: { where: JSON.stringify({ eventid: eventData.id , status: 'Confirmed'}) }
            }).success(function(attendees) {
                const registeredCount = attendees.length;
                capacityText.setText(registeredCount + " / " + eventData.capacity);

                // Check if the event is full
                if (registeredCount >= eventData.capacity) {
                    // Event is full
                    statusObject.setText("Registration Closed");
                    statusObject.setState("Error");
                    registerButton.setVisible(false);
                } else {
                    // Event is open
                    statusObject.setText("Open for Registration");
                    statusObject.setState("Success");
                    registerButton.setVisible(true);
                }

            }).error(function() {
                capacityText.setText("? / " + eventData.capacity); // Handle error case
                statusObject.setText("Status Unknown");
                statusObject.setState("Warning");
                registerButton.setVisible(false); // Hide button if status can't be determined
            });
        }

        if (typeof App !== 'undefined' && typeof eventDetailPage !== 'undefined') {
            App.to(eventDetailPage);
        }
    } else {
        sap.m.MessageBox.error("Could not retrieve event details.");
    }
}

/**
 * Calls a server-side script via a REST API to send an email.
 * @param {string} to - Recipient's email address.
 * @param {string} subject - Email subject.
 * @param {string|null} cc - CC recipients.
 * @param {string} from - Sender's email address.
 * @param {string} template - ID of the email template.
 * @param {object} data - Data object for the email template.
 */
function sendEmail(to, subject, cc, from, template, data) {
    const payload = {
        to: to,
        subject: subject,
        cc: cc,
        from: from,
        template: template,
        data: data
    };

    // Use the dedicated REST API to send the email
    apiRestAPISubmitRegister({
        data: payload
    }).success(function(response) {
        console.log("Email sent successfully via RestAPISubmitRegister:", response);
    }).error(function(err) {
        console.error("Failed to send email via RestAPISubmitRegister:", err);
    });
}

// Handles the registration button press on the detail page
function handleRegister() {
    // 1. Get data from inputs and model
    const selectedEvent = appModel.getProperty("/selectedEvent");
    const email = inSimpleFormEmailCreate.getValue();
    const name = inSimpleFormNameCreate.getValue();

    // 2. Basic validation
    if (!name || !email) {
        sap.m.MessageToast.show("Please fill in both name and email.");
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        sap.m.MessageToast.show("Please enter a valid email address.");
        return;
    }

    // 3. Show busy indicator
    sap.ui.core.BusyIndicator.show(0);

    // 4. Prepare registration data payload
    const ticketNumber = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newRegistration = {
        attendeeid: AppCache.userInfo.id,
        eventid: selectedEvent.id,
        attendeename: name,
        attendeeemail: email,
        registrationdate: new Date(),
        status: 'Confirmed',
        ticketnumber: ticketNumber,
    };

    // 5. Call the registration API
    apiRestAPIRegisterAttendee({
        data: newRegistration
    }).success(function(data) {
        // On success, send a confirmation email
        apiRestAPISubmitRegister({
            data: {
                attendeename: name,
                attendeeemail: email,
                ticketnumber: ticketNumber,
                event_name: selectedEvent.title,
                event_date: selectedEvent.eventdate,
            }
        })

        sap.ui.core.BusyIndicator.hide();

        // Show success message to the user
        sap.m.MessageBox.show(
            "You have successfully registered for '" + selectedEvent.title + "'. A confirmation email has been sent to " + email + ".", {
                icon: sap.m.MessageBox.Icon.SUCCESS,
                title: "Registration Confirmed",
                actions: [sap.m.MessageBox.Action.OK],
                onClose: function(oAction) {
                    if (oAction === sap.m.MessageBox.Action.OK) {
                        // Clear form and navigate back
                        inSimpleFormNameCreate.setValue("");
                        inSimpleFormEmailCreate.setValue("");
                        navigateBackToDashboard();
                    }
                }
            }
        );

    }).error(function(err) {
        // On failure, hide busy indicator and show an error message
        sap.ui.core.BusyIndicator.hide();
        sap.m.MessageBox.error("Registration failed. Please try again later.");
        console.error("Registration API Error:", err);
    });
}

// Navigation functions
function navigateBackToDashboard() {
    if (typeof App !== 'undefined' && typeof mainDashboardPage !== 'undefined') {
        App.to(mainDashboardPage);
    }
}

function navigateBackToEventsList() {
    if (typeof App !== 'undefined' && typeof eventsListPage !== 'undefined') {
        App.to(eventsListPage);
    }
}


/**
 * Navigates to the My Registrations page and triggers loading of registration data.
 */
function navigateToMyRegistrations() {
    loadAndDisplayMyRegistrations();
    if (typeof App !== 'undefined' && typeof MyRegistrations !== 'undefined') {
        App.to(MyRegistrations);
    }
}

/**
 * Fetches and displays the current user's event registrations as dynamic cards.
 */
function loadAndDisplayMyRegistrations() {
    if (typeof MyRegistrationsFlexBox === 'undefined') {
        sap.m.MessageBox.error("The registrations container was not found.");
        return;
    }

    sap.ui.core.BusyIndicator.show(0);
    MyRegistrationsFlexBox.destroyItems(); // Clear previous content

    // First, fetch all events to get their details
    apiRestAPIListEvent().success(function(eventsData) {
        const eventsMap = new Map(eventsData.map(event => [event.id, event]));

        // Second, fetch registrations for the current user
        const options = {
            parameters: {
                where: JSON.stringify({ attendeeid: AppCache.userInfo.id })
            }
        };

        apiRestAPIGetEventAttendees(options).success(function(registrations) {
            if (registrations.length === 0) {
                MyRegistrationsFlexBox.addItem(new sap.m.Text({ text: "You have no registrations." }));
                sap.ui.core.BusyIndicator.hide();
                return;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            registrations.forEach(function(reg) {
                const event = eventsMap.get(reg.eventid);
                if (!event) return; // Skip if event details are missing

                const isUpcoming = new Date(event.eventdate) >= today;
                const isConfirmed = reg.status === 'Confirmed';

                const oCard = new sap.m.Panel({
                    width: "auto",
                    class: "sapUiResponsiveMargin"
                });

                const oForm = new sap.ui.layout.form.SimpleForm({
                    layout: "ResponsiveGridLayout",
                    content: [
                        new sap.m.Label({ text: "Location" }),
                        new sap.m.Text({ text: event.location }),
                        new sap.m.Label({ text: "Date" }),
                        new sap.m.Text({ text: new Date(event.eventdate).toLocaleDateString() }),
                        new sap.m.Label({ text: "Status" }),
                        new sap.m.ObjectStatus({
                            text: reg.status,
                            state: isConfirmed ? "Success" : "Error"
                        })
                    ]
                });

                oCard.addContent(oForm);

                const oHeaderToolbar = new sap.m.Toolbar({
                     content: [new sap.m.Title({ text: event.title }), new sap.m.ToolbarSpacer()]
                });

                if (isConfirmed && isUpcoming) {
                    const oCancelButton = new sap.m.Button({
                        text: "Cancel",
                        type: "Reject",
                        icon: "sap-icon://sys-cancel",
                        press: handleCancelRegistration
                    });
                    oCancelButton.data("registrationData", reg); // Attach data to button
                    oHeaderToolbar.addContent(oCancelButton);
                }
                
                oCard.setHeaderToolbar(oHeaderToolbar);
                MyRegistrationsFlexBox.addItem(oCard);
            });

            sap.ui.core.BusyIndicator.hide();

        }).error(function(err) {
            sap.ui.core.BusyIndicator.hide();
            sap.m.MessageBox.error("Failed to load your registrations.");
        });

    }).error(function(err) {
        sap.ui.core.BusyIndicator.hide();
        sap.m.MessageBox.error("Failed to load event data.");
    });
}

/**
 * Handles the press event of the 'Cancel' button on a registration card.
 * @param {sap.ui.base.Event} oEvent The press event
 */
function handleCancelRegistration(oEvent) {
    const oButton = oEvent.getSource();
    const registrationData = oButton.data("registrationData");

    if (!registrationData || !registrationData.id) {
        sap.m.MessageBox.error("Could not find registration details to cancel.");
        return;
    }

    sap.m.MessageBox.confirm("Are you sure you want to cancel your registration?", {
        title: "Confirm Cancellation",
        onClose: function(oAction) {
            if (oAction === sap.m.MessageBox.Action.OK) {
                sap.ui.core.BusyIndicator.show(0);

                const options = {
                    data: {
                        status: 'Cancelled'
                    },
                    parameters: {
                        where: JSON.stringify({
                            id: registrationData.id
                        })
                    }
                };

                apiRestAPICancelRegistration(options)
                    .success(function(data) {
                        sap.m.MessageToast.show("Registration cancelled successfully.");
                        loadAndDisplayMyRegistrations(); // Refresh the list to show the new status
                        sap.ui.core.BusyIndicator.hide();
                    })
                    .error(function(err) {
                        sap.m.MessageBox.error("Failed to cancel registration. Please try again later.");
                        console.error("Cancellation API Error:", err);
                        sap.ui.core.BusyIndicator.hide();
                    });
            }
        }
    });
}
// Initialize the application
initializeApp();