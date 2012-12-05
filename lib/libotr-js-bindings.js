var libModule = require("./libotr3.js").getModule();//optimised and minified libotr,libgcrypt,libgpg-error
var NODE_ASYNC = require("./async");

var otrl_ = libModule.libotrl; //cwrap()'ed functions from libotr
var gcry_ = libModule.libgcrypt; //cwrap()'ed functions from libgcrypt
var jsapi_= libModule.jsapi;

var _malloc = libModule.malloc;
var _free = libModule.free;
var getValue = libModule.getValue;
var setValue = libModule.setValue;
var Pointer_stringify = libModule.Pointer_stringify;

libModule["ops_event"] = ops_event;
libModule["ConnContext"] = ConnContext;

var OPS_QUEUE;
var MAO = []; //OtrlMessageAppOps instances and their callback handlers

module.exports = {
  "init": (function() {
    jsapi_.initialise();
  }),
  "version":function(){
    return otrl_.version()+"-emscripten";
  },
  "UserState":OtrlUserState,
  "ConnContext":ConnContext,
  "MessageAppOps":OtrlMessageAppOps,
};

//OtrlPrivKey
function OtrlPrivKey(ptr){
    this._pointer = ptr;
};
OtrlPrivKey.prototype.next = function(){
    var ptr = jsapi_.privkey_get_next(this._pointer);
    if(ptr) return new OtrlPrivKey(ptr);
    return undefined;
};
OtrlPrivKey.prototype.accountname = function(){
    return jsapi_.privkey_get_accountname(this._pointer);
};
OtrlPrivKey.prototype.protocol = function(){
    return jsapi_.privkey_get_protocol(this._pointer);
};

//OtrlUserState
function OtrlUserState(){
    this._pointer = otrl_.userstate_create();
};
OtrlUserState.prototype.destroy = function(){
    otrl_.userstate_destroy(this._pointer);
};
OtrlUserState.prototype.privkey_root = function(){
    var ptr=jsapi_.userstate_get_privkey_root(this._pointer);
    if(ptr) return new OtrlPrivKey(ptr);
    return undefined;
};
OtrlUserState.prototype.accounts = function(){
    var p = this.privkey_root();
    var accounts = [];
    var accountname,protocol;
    var self = this;
    while(p){
        accountname = p.accountname();
        protocol = p.protocol();
        accounts.push({            
            "accountname":accountname,
            "protocol":protocol,
            "fingerprint":self.fingerprint(accountname,protocol)
        });
        p = p.next();
    }
    return accounts;
};
OtrlUserState.prototype.generateKey = function(filename,accountname,protocol,callback){    
    var self = this;
    //cant do this async in pure JS. in a browser we could use web workers..background iframe??
    //in titanium we can create multiple contexts...
    if(typeof filename == 'string' && typeof accountname=='string' && typeof protocol=='string' && typeof callback == 'function'){
      console.log("generating key... please wait.");
      var err = otrl_.privkey_generate(this._pointer,filename,accountname,protocol);
      try{
        callback.apply(self, [err ? gcry_.strerror(err) : null] );
        //callback(err?gcry._strerror(err):null);
      }catch(e){
        console.error("Fatal Exception -",e);
      }
    }else{
        throw("invalid arguments to generateKey()");
    }
};
OtrlUserState.prototype.fingerprint = function(accountname, protocol){
    if( typeof accountname =='string' && typeof protocol == 'string'){
        var fp = _malloc(45);
        var res = otrl_.privkey_fingerprint(this._pointer,fp,accountname,protocol);
        var human = (res? Pointer_stringify(fp):undefined);
        _free(fp);
        return human;
    }else{
        throw("invalid arguments to fingerprint()");
    }
};
OtrlUserState.prototype.readKeysSync = function(filename){
    //todo: can also take a string as file contents... url etc.. read it into
    //virtual file system and load into userstate...
    //or access real file system... ?
    if(typeof filename=='string'){
        var err = otrl_.privkey_read(this._pointer,filename);
        return (err?gcry_.strerror(err):null);
    }else{
        throw("invalid arguments to readKeysSync()");
    }
};
OtrlUserState.prototype.readFingerprintsSync = function(filename){
    if(typeof filename == 'string'){
        var err = otrl_.privkey_read_fingerprints(this._pointer,filename,0,0);
        return (err?gcry_.strerror(err):undefined);
    }else{
        throw("invalid arguments to readFingerprintsSync()");
    }
};
OtrlUserState.prototype.writeFingerprintsSync = function (filename){
    if(typeof filename == 'string'){    
        var err = otrl_.privkey_write_fingerprints(this._pointer,filename);
        return (err?gcry_.strerror(err):undefined);
    }else{
        throw("invalid arguments to writeFingerprintsSync()");
    }
};

OtrlUserState.prototype.readKeys = function(){
    throw("use 'readKeysSync()' not 'readKeys()'");
};
OtrlUserState.prototype.readFingerprints = function (){
    throw("use 'readFingerprintsSync()' not 'readFingerprints()'");
};
OtrlUserState.prototype.writeFingerprints = function (){
    throw("use 'writeFingerprintsSync' not 'writeFingerprints()'");
};

//ConnContext
function ConnContext(userstate,accountname,protocol,recipient){
    if( typeof userstate == 'object' &&
        typeof accountname == 'string' &&
        typeof protocol == 'string' &&
        typeof recipient == 'string' ){

        var addedp_addr = _malloc(4); //allocate(1, "i32", ALLOC_STACK);
        this._pointer = otrl_.context_find(userstate._pointer,recipient,accountname,protocol,1,addedp_addr,0,0);
        _free(addedp_addr);
    }else{
        if(arguments.length==1 && typeof arguments[0]=='number'){
            //assume arguments[0] == pointer to existing context;
            this._pointer = arguments[0];
        }else{
            throw("invalid arguments to ConnContext()");
        }
    }
};

ConnContext.prototype.protocol = function(){
    return jsapi_.conncontext_get_protocol(this._pointer);
};
ConnContext.prototype.username = function(){
    return jsapi_.conncontext_get_username(this._pointer);
};
ConnContext.prototype.accountname = function(){
    return jsapi_.conncontext_get_accountname(this._pointer);
};
ConnContext.prototype.msgstate = function(){
    return jsapi_.conncontext_get_msgstate(this._pointer);
};
ConnContext.prototype.protocol_version = function(){
    return jsapi_.conncontext_get_protocol_version(this._pointer);
};
ConnContext.prototype.smstate = function(){
    return jsapi_.conncontext_get_smstate(this._pointer);
};
ConnContext.prototype.fingerprint = function(){
    var fp = _malloc(45);
    jsapi_.conncontext_get_active_fingerprint(this._pointer,fp);
    var human =  Pointer_stringify(fp);
    _free(fp);
    return human;
};
ConnContext.prototype.trust = function(){
    return jsapi_.conncontext_get_trust(this._pointer);
};
ConnContext.prototype.obj = function(){
    return({
        'protocol':this.protocol(),
        'username':this.username(),
        'accountname':this.accountname(),
        'msgstate':this.msgstate(),
        'protocol_version':this.protocol_version(),
        'smstate':this.smstate(),
        'fingerprint':this.fingerprint(),
        'trust':this.trust()
    });
};

//OtrlMessageAppOps
function OtrlMessageAppOps( event_handler ){
    //keep track of all created instances
    //index into array will be passed around as opdata to tie
    //the event_handler to the relevant instance.
    if(!OPS_QUEUE) OPS_QUEUE = NODE_ASYNC.queue(ops_handle_event,1)

    var self = this;

    MAO.push({
        instance:self,
    });
    this._event_handler = event_handler;
    this._opsdata = _malloc(4);
    setValue(this._opsdata,MAO.length-1,"i32");
    this._pointer = jsapi_.messageappops_new();
};

function ops_handle_event(O,callback){
    var instance = O._;
    delete O._;
    instance._event_handler(O);
    callback();
}

OtrlMessageAppOps.prototype.messageSending = function(userstate,accountname,protocol,recipient,message){
    if(!(
        typeof userstate=='object' &&
        typeof accountname=='string' &&
        typeof protocol=='string' &&
        typeof recipient=='string' &&
        typeof message=='string'
    )){
        throw("invalid arguments to messageSending()");
    }
    var retvalue;
    var messagep_ptr = _malloc(4);//char**

    var err = otrl_.message_sending(userstate._pointer,this._pointer,this._opsdata,accountname,protocol,recipient,message,0,messagep_ptr,0,0);
    var messagep = getValue(messagep_ptr,"i32");

    if(err){
        retvalue = undefined;
    }else{
        retvalue = Pointer_stringify(messagep);
    }
    if(messagep != 0 ) otrl_.message_free(messagep);
    _free(messagep_ptr);
    return retvalue;
};
OtrlMessageAppOps.prototype.messageReceiving = function(userstate,accountname,protocol,sender,message){
    if(!(
        typeof userstate=='object' &&
        typeof accountname=='string' &&
        typeof protocol=='string' &&
        typeof sender=='string' &&
        typeof message=='string'
    )){
        throw("invalid arguments to messageReceiving()");
    }
    
    var newmessagep_ptr = _malloc(4); //char**
	var status = jsapi_.message_receiving(userstate._pointer,this._pointer,this._opsdata,accountname,protocol,sender,message,newmessagep_ptr);
	var newmessagep = getValue(newmessagep_ptr,"i32");//char*

    var retvalue;
    if(status==1) retvalue = null;
    if(status==0) {
        retvalue = (newmessagep==0) ? message : Pointer_stringify(newmessagep);
    }
    if(newmessagep!=0) otrl_.message_free(newmessagep);
    _free(newmessagep_ptr);
    //console.log("messageReceiving returning from", sender,"with value", retvalue,"status=",status);
    return retvalue;
};
OtrlMessageAppOps.prototype.fragmentAndSend = function(context,message){
    if(!(
        typeof context=='object' &&
        typeof message=='string'
    )){
        throw("invalid arguments to fragmentAndSend()");
    }
   var err =  otrl_.message_fragment_and_send(this._pointer,this._opsdata,context._pointer,message,0,0);//send all fragments
   return gcry_.strerror(err);
};
OtrlMessageAppOps.prototype.disconnect = function(userstate,accountname,protocol,recipient){
    if(!(
        typeof userstate=='object' &&
        typeof accountname=='string' &&
        typeof protocol=='string' &&
        typeof recipient=='string'
    )){
        throw("invalid arguments to disconnect()");
    }

    otrl_.message_disconnect(userstate._pointer,this._pointer,this._opsdata, accountname,protocol,recipient);  
};
OtrlMessageAppOps.prototype.initSMP = function(userstate,context,secret,question){
    if(!(
        typeof userstate=='object' &&
        typeof context=='object' &&
        typeof secret=='string'
    )){
        throw("invalid arguments to initSMP()");
    }

    if(jsapi_.can_start_smp(context._pointer)){
        if(question){
            otrl_.message_initiate_smp_q(userstate._pointer,this._pointer,this._opsdata,context._pointer,question,secret,secret.length);
        }else{
            otrl_.message_initiate_smp(userstate._pointer,this._pointer,this._opsdata,context._pointer,secret,secret.length);
        }
    }
};
OtrlMessageAppOps.prototype.respondSMP = function(userstate,context,secret){
    if(!(
        typeof userstate=='object' &&
        typeof context=='object' &&
        typeof secret=='string' 
    )){
        throw("invalid arguments to respondSMP()");
    }
    otrl_.message_respond_smp(userstate._pointer,this._pointer,this._opsdata,context._pointer,secret,secret.length);
};

function ops_event($opsdata, ev_obj, ev_name){
  var $index = getValue($opsdata,"i32");
  if(ev_name) ev_obj.EVENT = ev_name;

  if(ev_name=='is_logged_in' || ev_name=='policy' || ev_name=='max_message_size'){
    return MAO[$index].instance._event_handler(ev_obj);
  }else{
    //setTimeout(function(){
        //console.log("ops_event:",ev_name);
        //MAO[$index].handler(ev_obj);//async firing of the event!
        ev_obj._ = MAO[$index].instance;
        OPS_QUEUE.push(ev_obj);
    //},5);
  }
}

