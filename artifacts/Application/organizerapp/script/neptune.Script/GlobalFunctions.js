// Prevent button from submitting the form
Button.attachPress(function(oEvent) {
    // Prevent default form submission behavior
    oEvent.preventDefault();
    
    // Add your custom button logic here
    // For example:
    try {
        // Your button action code
        sap.m.MessageToast.show("Button clicked - form submission prevented");
        
        // If you need to perform custom actions, add them here
        
    } catch (error) {
        sap.m.MessageToast.show("Error: " + error.message);
    }
});

// Alternative approach - disable form submission on the button element
Button.addEventDelegate({
    onAfterRendering: function() {
        var buttonDomRef = Button.getDomRef();
        if (buttonDomRef) {
            buttonDomRef.setAttribute("type", "button");
        }
    }
});