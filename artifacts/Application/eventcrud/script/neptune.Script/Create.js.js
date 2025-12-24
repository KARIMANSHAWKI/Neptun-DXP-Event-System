
function handleCreateEvent(){
    let data = {};
    data.title = inSimpleFormtitleCreate.getValue();
    data.description = inSimpleFormdescriptionCreate.getValue();
    data.eventdate = inSimpleFormeventdateCreate.getValue();
    data.location = inSimpleFormlocationCreate.getValue();
    data.capacity = inSimpleFormcapacityCreate.getValue();
    data.status = inSimpleFormstatusCreate.getValue();

    data.createdByPerson = JSON.stringify(AppCache.userInfo);

    var options = {
        data : data
    };

    apiRestAPICreateEvent(options)
    
}

