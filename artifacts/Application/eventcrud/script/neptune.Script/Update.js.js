function handleUpdateEvent(){
    let data = {};

    data.id = modelSimpleForm.getData().id;

    data.eventid =  SimpleForm.id;
    data.title = inSimpleFormtitle.getValue();

    data.description = inSimpleFormdescription.getValue();
    data.eventdate = inSimpleFormeventdate.getValue();
    data.location = inSimpleFormlocation.getValue();
    data.capacity = inSimpleFormcapacity.getValue();
    data.status = modelSimpleForm.getData().status;
    
    var options = {
        data : data
    };

    apiRestAPIUpdateEvent(options)
}

