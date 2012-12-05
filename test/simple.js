var otr = require("otr");

if(otr.init) otr.init();

console.log("libotr version:",otr.version());

var alice = new otr.UserState();
alice.readKeysSync("alice.keys");
console.log( alice.fingerprint("alice@telechat.org","telechat"));
alice.readFingerprintsSync("alice.fp");
alice.writeFingerprintsSync("alice.fp");
console.log(alice.accounts());

alice.generateKey("alice.keys","maggie@telechat.org","telechat",function(err){
    if(err){
        console.error("error generating key:",err);
    }else{
        console.log("Key Generation Complete.");
        console.log(alice.accounts());
    }
});

console.log("creating new context");
var ctx = new otr.ConnContext(alice,"alice@telechat.org","telechat","bob");

console.log("printing out the context");
console.log(ctx.obj());

