var otr = require("../lib/otr-module");

if(otr.init) otr.init();

console.log("libotr version:",otr.version());

var alice = new otr.UserState();

alice.generateKey("alice.keys","alice@telechat.org","telechat",function(err){
    if(err){
        console.error("error generating key:",err);
    }else{
        console.log("Key Generation Complete.");
        console.log(alice.accounts());
    }
});

alice.readKeysSync("alice.keys");
console.log( alice.fingerprint("alice@telechat.org","telechat"));
console.log(alice.accounts());

var ctx = new otr.ConnContext(alice,"alice@telechat.org","telechat","bob");

console.log(ctx.obj());

