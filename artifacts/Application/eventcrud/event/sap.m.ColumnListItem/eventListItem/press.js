const context = oEvent.oSource.getBindingContext();

// Get entire model
const data = context.getObject();

modelSimpleForm.setData(data);

App.to(EventDetails);