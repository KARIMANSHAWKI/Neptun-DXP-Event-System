// Declare startParams as a global variable at the top of GlobalFunctions
const AppState = (function () {
  let state = {};

  return {
    set(key, value) {
      state[key] = value;
    },
    get(key) {
      return state[key];
    }
  };
})();


let startParams = {};

// Fix: Wrap the shell attachment in attachInit to prevent timing errors
sap.ui.getCore().attachInit(function() {
    // Ensure sap.n.Shell is available before attaching the event
    if (sap.n && sap.n.Shell) {
        sap.n.Shell.attachBeforeDisplay(function(params)  {
            // Store the params in the global variable
            startParams = params;
            
            // startParams contains data passed to the app
            if (startParams) {
                AppState.set('appName', startParams.appName);
                // Access passed parameters
                console.log('App started with params:', startParams);  
            }
        });
    }
});

function handleCreateEvent(){
    const title = inSimpleFormtitleCreate.getValue();
    const description = inSimpleFormdescriptionCreate.getValue();
    const eventDate = inSimpleFormeventdateCreate.getDateValue();
    const location = inSimpleFormlocationCreate.getValue();
    const capacity = inSimpleFormcapacityCreate.getValue();

    // Validation logic
    if (!title) {
        sap.m.MessageToast.show("Event Title is required.");
        return;
    }
    if (!description) {
        sap.m.MessageToast.show("Event Description is required.");
        return;
    }
    if (!eventDate) {
        sap.m.MessageToast.show("Event Date is required.");
        return;
    }
    if (eventDate <= new Date()) {
        sap.m.MessageToast.show("Event Date must be in the future.");
        return;
    }
    if (!location) {
        sap.m.MessageToast.show("Location is required.");
        return;
    }
    if (!capacity) {
        sap.m.MessageToast.show("Capacity is required.");
        return;
    }

    const capacityInt = parseInt(capacity, 10);
    if (isNaN(capacityInt) || capacityInt <= 0) {
        sap.m.MessageToast.show("Capacity must be a positive number.");
        return;
    }

    // If validation passes, prepare and send data
    let data = {
        title: title,
        slug: createSlug(title),
        description: description,
        eventdate: eventDate.toISOString(),
        location: location,
        capacity: capacityInt,
        createdByPerson: JSON.stringify(AppCache.userInfo),
        status: 'pending'
    };

    var options = {
        data : data,
        success: function(response) {
            sap.m.MessageToast.show("Event created successfully!");
            startEventApproveWorkflow(response);
            handleNavigation();
        },
        error: function(err) {
            sap.m.MessageBox.error("Failed to create event.");
            console.error(err);
        }
    };

    apiRestAPICreateEvent(options);
}

function handleNavigation(){
   
   if(AppState.get('appName') == 'organizerapp'){
    AppCache.Load("submitsuccessevent");
   } else{
    AppCache.Load("eventcrud");
   }
}


function startEventApproveWorkflow (data){
  console.log(AppCache.userInfo);
  var wfData = {
  id: "f348dcf5-de6b-4e53-8f3f-1cc7dcc4c999",
  objectKey: data.slug,
  objectType: "Event",
  // organizerEmail: organizerEmail,
  approverComment: ""
};

$.ajax({
  type: "POST",
  contentType: "application/json",
  url: "/api/functions/WorkflowInbox/Start",
  data: JSON.stringify(wfData),
  success: function(data) {
    sap.m.MessageToast.show("Workflow started!");
  },
  error: function() {
    sap.m.MessageToast.show("Workflow start failed.");
  }
});
}

function createSlug(title) {
    return title
        .toLowerCase() // Convert to lowercase
        .trim() // Remove leading and trailing spaces
        .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word characters with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}