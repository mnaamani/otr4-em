var otr = require("../lib/otr-module");

if(otr.init) otr.init();

console.log("libotr version:",otr.version());

var alice = new otr.UserState();

alice.generateKey("alice.keys","alice@telechat.org","telechat",function(err){
    if(err){
        console.error("error generating key:",err);
    }else{
        console.log("Key Generation Complete.");
    }
});

alice.readKeysSync("alice.keys");

console.log( alice.fingerprint("alice@telechat.org","telechat"));

console.log(alice.accounts());

console.log("generating instance tag...");
alice.generateInstag("alice.instags","alice@telechat.org","telechat");
console.log("new tag=", alice.findInstag("alice@telechat.org","telechat"));

console.log("creating a context");
var ctx = new otr.ConnContext(alice,"alice@telechat.org","telechat","bob");
console.log( ctx.obj() );

console.log("freeing userstate");
alice.free();
console.log("done!");
