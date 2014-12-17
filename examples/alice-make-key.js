var otr = require("../lib/otr-module");
var fs = require("fs");

var print = console.error;

print("libotr version:",otr.version());

var user = new otr.User();

print("generating key...");

user.generateKey("alice","xmpp",function(err,key){
  if(err) {
    print("error generating key:",err);
  }else{
    //persist all the keys to file system
    user.writeKeysToFS('./alice.keys');

    //export an individual key to a json file
    fs.writeFileSync("./alice-xmpp-key.json",JSON.stringify(key.export()));

    print(user.keysToString());
    print("generated key fingerprint:",user.fingerprint("alice","xmpp"));
  }
});
