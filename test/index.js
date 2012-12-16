if(typeof exports !== 'undefined'){
    var async = require("../lib/async");
    var OTR = require("../lib/otr-module");
}

var otr = OTR;

console.log("== loaded libotr version:",otr.version());

var debug = function(){};

var USE_VFS = false;
var TEST_PASSED=false;
var verbose =false;
var FORCE_SMP = false;
var SUCCESSFULL_SMP = false;

if(typeof process !== "undefined" ){
 process.argv.forEach(function(arg){
    if(arg=="--verbose") verbose = true;
    if(arg=="--vfs") USE_VFS=true;
    if(arg=="--force-smp") FORCE_SMP=true;
 });
}

if(verbose){
    otr.debugOn();
    debug = console.error;
}

if(USE_VFS){
    var VFS = otr.VFS("./default.vfs").load();
}

var keys_dir = ".";

var alice = new otr.User({name:'alice',keys:keys_dir+'/alice.keys',fingerprints:keys_dir+'/alice.fp',instags:keys_dir+'/alice.instags'});
if(!alice.state.fingerprint("alice@telechat.org","telechat")){
alice.generateKey("alice@telechat.org","telechat",function(err){
    if(err){
        console.error("error generating key:",err);
    }else{
        console.log("Key Generation Complete.");
    }
});
alice.generateInstag("alice@telechat.org","telechat",function(err,instag){
    console.log("generating instance tag: error=",err," tag=",instag);
});
}

var BOB = alice.ConnContext("alice@telechat.org","telechat","BOB");
var otrchan_a = new otr.OTRChannel(alice, BOB,{policy:otr.POLICY("ALWAYS"),secret:'s3cr37'});
var bob = new otr.User({name:'bob',keys:keys_dir+'/bob.keys',fingerprints:keys_dir+'/bob.fp',instags:keys_dir+'/bob.instags'});
if(!bob.state.fingerprint("bob@telechat.org","telechat")){
bob.generateKey("bob@telechat.org","telechat",function(err){
    if(err){
        console.error("error generating key:",err);
    }else{
        console.log("Key Generation Complete.");
    }
});
bob.generateInstag("bob@telechat.org","telechat",function(err,instag){
    console.log("generating instance tag: error=",err," tag=",instag);
});
}
var ALICE = bob.ConnContext("bob@telechat.org","telechat","ALICE");
var otrchan_b = new otr.OTRChannel(bob, ALICE,{policy:otr.POLICY("ALWAYS"),secret:'s3cr37'});

var NET_QUEUE_A = async.queue(handle_messages,1);
var NET_QUEUE_B = async.queue(handle_messages,1);

function handle_messages(O,callback){
    O.channel.recv(O.msg);
    callback();
}

console.log(otrchan_a);
console.log(otrchan_b);

//simulate a network connection between two parties
otrchan_a.on("inject_message",function(msg){    
    NET_QUEUE_A.push({channel:otrchan_b,msg:msg});
    debug("ALICE:",msg);
});
otrchan_b.on("inject_message",function(msg){
    NET_QUEUE_B.push({channel:otrchan_a,msg:msg});
    debug("BOB:",msg);
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

    if(!this.isAuthenticated() || FORCE_SMP ){
            console.log("Alice initiating SMP authentication to verify keys...");
            otrchan_a.start_smp();
    }

});

otrchan_b.on("smp_request",function(){
        console.log("Bob responding to SMP request.");
        otrchan_b.respond_smp('s3cr37');
});

otrchan_a.on("smp_complete",function(){
        otrchan_a.send("Hello Bob! - 2");
        SUCCESSFULL_SMP = true;
});
//otrchan_a.connect();
otrchan_a.send("Hello Bob! - 1");
//in libotr4 if policy is ALWAYS - initiall message doesn't seem to get resent or is the test
//failing because of timing/race condition due to handling alice and bob in same thread..?

var loop = setInterval(function(){
    console.log("_");
    if(FORCE_SMP && !SUCCESSFULL_SMP){
        return;
    }
    if(otrchan_a.isEncrypted() && otrchan_a.isAuthenticated() && otrchan_b.isEncrypted() && otrchan_b.isAuthenticated()){
        console.log("Finger print verification successful");
        dumpConnContext(otrchan_a,"Alice's ConnContext:");
        dumpConnContext(otrchan_b,"Bob's ConnContext:"); 
        TEST_PASSED=true;        
        if(loop) clearInterval(loop);        
        otrchan_b.close();
    }
},500);

function exit_test(msg){
    console.log(msg);
    if(TEST_PASSED){ console.log("== TEST PASSED ==\n"); } else { console.log("== TEST FAILED ==\n"); }
    if(VFS) VFS.save();
    process.exit();
}

function dumpConnContext(chan,msg){
    console.log(msg,"\n",chan.context.obj());
}

