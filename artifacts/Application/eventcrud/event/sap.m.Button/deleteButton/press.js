// Get the binding context from the clicked button's event
const context = oEvent.getSource().getBindingContext();
const eventToDelete = context.getObject();
const eventId = eventToDelete ? eventToDelete.id : null; // Safely access eventId


console.log('Event ID to delete:', eventId); // Check the value of eventId

if (!eventId) {
    sap.m.MessageBox.error("Event ID is undefined. Unable to delete event.");
    return;
}

sap.m.MessageBox.confirm("Are you sure you want to delete this event?", {
    title: "Confirm Deletion",
    onClose: function(oAction) {
        if (oAction === sap.m.MessageBox.Action.OK) {
            sap.ui.core.BusyIndicator.show(0);
            
 
            
             var options = {
                parameters: {
                    where: JSON.stringify({
                        id: eventId   
                    })
                }
            };

             apiRestAPIDeleteEvent(options)
            .success(function(data) {
                console.log(data);
                sap.m.MessageToast.show("Event deleted successfully.");
                loadEvents(); // Refresh events
                sap.ui.core.BusyIndicator.hide();
            })
            .error(function(err) {
                console.error('Delete error:', err);
                sap.m.MessageBox.error("Failed to delete event: " + (err.message || "Unknown error"));
                sap.ui.core.BusyIndicator.hide();
            });
        
        }
    }
});