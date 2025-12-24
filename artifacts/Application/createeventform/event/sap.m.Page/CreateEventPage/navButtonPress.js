if(AppState.get('appName') == 'organizerapp'){
    AppCache.Load("organizerapp");
   } else{
    AppCache.Load("eventcrud");
   }