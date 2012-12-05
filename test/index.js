var async = require("async");
var libotr = require('../lib/otr-module');

console.log("== loaded libotr version:",libotr.version());

var TEST_PASSED=false;
var verbose =false;
var MAKE_NEW_KEYS = true;

process.argv.forEach(function(arg){
    if(arg=="--verbose") verbose = true;
});

if(verbose){
    libotr.debugOn();
}

var keys_dir = "";

var alice = new libotr.User({name:'alice',keys:keys_dir+'/alice.keys',fingerprints:keys_dir+'/alice.fp',instags:keys_dir+'/alice.instags'});
if(MAKE_NEW_KEYS){
alice.generateKey("alice@telechat.org","telechat",function(err){
    if(err){
        console.error("error generating key:",err);
    }else{
        console.log("Key Generation Complete.");
    }
});
}
var BOB = alice.ConnContext("alice@telechat.org","telechat","BOB");
var otrchan_a = new libotr.OTRChannel(alice, BOB,{policy:libotr.POLICY("ALWAYS"),secret:'s3cr37'});

var bob = new libotr.User({name:'bob',keys:keys_dir+'/bob.keys',fingerprints:keys_dir+'/bob.fp',instags:keys_dir+'/bob.instags'});
if(MAKE_NEW_KEYS){
bob.generateKey("bob@telechat.org","telechat",function(err){
    if(err){
        console.error("error generating key:",err);
    }else{
        console.log("Key Generation Complete.");
    }
});
}
var ALICE = bob.ConnContext("bob@telechat.org","telechat","ALICE");
var otrchan_b = new libotr.OTRChannel(bob, ALICE,{policy:libotr.POLICY("ALWAYS"),secret:'s3cr37'});

var NET_QUEUE_A = async.queue(handle_messages,1);
var NET_QUEUE_B = async.queue(handle_messages,1);

function handle_messages(O,callback){
    O.channel.recv(O.msg);
    callback();
    if(verbose) dumpConnContext(O.channel,O.channel.user.name);
}

//console.log(otrchan_a);
//console.log(otrchan_b);

//simulate a network connection between two parties
otrchan_a.on("inject_message",function(msg){
    if(verbose) console.log("ALICE:",msg);
    NET_QUEUE_A.push({channel:otrchan_b,msg:msg});
//    otrchan_b.recv(msg);
});
otrchan_b.on("inject_message",function(msg){
    if(verbose)console.log("BOB:",msg);
    NET_QUEUE_B.push({channel:otrchan_a,msg:msg});
//    otrchan_a.recv(msg);
});

//output incoming messages to console
otrchan_a.on("message",function(msg){
    if(this.isEncrypted()) {
        console.log('encrypted: Bob->Alice: ', msg);
    }else{
        //policy is set to ALWAYS so we should not get any unencrypted messages!
        console.log('not-encrypted!!!: Bob->Alice: ',msg);
    }
});

//output incoming messages to console
otrchan_b.on("message",function(msg){    
    if(this.isEncrypted()) {
        console.log('encrypted: Alice->Bob: ', msg);
    }else{
        //policy is set to ALWAYS so we should not get any unencrypted messages!
        console.log('not-encrypted!!!: Alice->Bob: ',msg);
    }
});


//will get fired because we are manually closing otrchan_b
otrchan_b.on("shutdown",function(){
    console.log("Bob's channel shutting down.");
    exit_test("");

});

//because otrchan_b was closed otrchan_a get a remote_disconnect event.
otrchan_a.on("remote_disconnected",function(){
    console.log("Bob disconnected");
    exit_test("");
});

otrchan_a.on("gone_secure",function(){
    if(!this.isAuthenticated()){
            console.log("Alice initiating SMP authentication to verify keys...");
            otrchan_a.start_smp();
    }
});

otrchan_b.on("smp_request",function(){
        console.log("Bob responding to SMP request.");
        otrchan_b.respond_smp('s3cr37');
});


otrchan_a.send("Hello Bob!");
//otrchan_a.connect();

var loop = setInterval(function(){
    console.log("_");
    if(otrchan_a.isEncrypted() && !otrchan_a.tryingSMP){
        otrchan_a.tryingSMP = true;
        console.log("starting SMP");
        otrchan_a.start_smp();
        return;
    }
    if(otrchan_a.isEncrypted() && otrchan_a.isAuthenticated()){
        console.log("Finger print verification successful");
//        dumpConnContext(otrchan_a,"Alice's ConnContext:");
//        dumpConnContext(otrchan_b,"Bob's ConnContext:");   
        TEST_PASSED=true;        
        if(loop) clearInterval(loop);        
        otrchan_b.close();
    }
},500);

function exit_test(msg){
//    dumpConnContext(otrchan_a,"Alice's ConnContext:");
//    dumpConnContext(otrchan_b,"Bob's ConnContext:");
    console.log(msg);
    if(TEST_PASSED){ console.log("== TEST PASSED ==\n"); } else { console.log("== TEST FAILED ==\n"); }
    process.exit();
}

function dumpConnContext(chan,msg){
    console.log(msg,"\n",chan.context.obj());
}
