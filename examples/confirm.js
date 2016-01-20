var reply = require('./../');

reply.confirm('To you ready to confirm?', function(err, yes){

  if (!err && yes) {
    console.log("Confirmation sequence initiated");
    
    reply.confirm('Would you like to confirm your confirmation sequence?', function(err, yes){

        if (!err && yes) {
            console.log("confirmation sequence confirmed");
            reply.confirm('Would you like to confirm your confirmation of the confirmation sequence?', function(err, yes){
                      if (!err && yes) {
                              console.log(" Ok ok you're confirmed.");
                         } else{
                               console.log("All Confirmations cancelled");
                        }
             });  
              
        } else{
            console.log("All Confirmations cancelled");
        }
        
    });
    
  }else{
    console.log("confirmation cancelled.");
  }
});

