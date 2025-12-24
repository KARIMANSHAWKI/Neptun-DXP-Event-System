let fieldCatalog = [];

 fieldCatalog.push({ name: "id", label: "id", type: "int"});

fieldCatalog.push({ name: "capacity", label: "Capacity", type: "int"});

fieldCatalog.push({ name: "description", label: "Description", type: "text" });

fieldCatalog.push({ name: "evendDate", label: "Eveent Date", type: "date" });

fieldCatalog.push({ name: "location", label: "Location", type: "text" });

fieldCatalog.push({ name: "status", label: "Status", type: "text" });

fieldCatalog.push({ name: "title", label: "Title", type: "text" });


result.data = fieldCatalog;

complete();