let fieldCatalog = [];
 

fieldCatalog.push({ name: "attendeeemail", label: "attendeeEmail", type: "email"});

fieldCatalog.push({ name: "attendeename", label: "attendeename", type: "text" });

fieldCatalog.push({ name: "eventid", label: "Eveent Id", type: "uuid" });

fieldCatalog.push({ name: "registrationdate", label: "registrationdate", type: "date" });

fieldCatalog.push({ name: "status", label: "Status", type: "text" });

fieldCatalog.push({ name: "ticketnumber", label: "ticketnumber", type: "text" });


result.data = fieldCatalog;

complete();