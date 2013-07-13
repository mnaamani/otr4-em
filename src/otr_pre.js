Module["preRun"]=[];

var _static_otr_error_message_str;

var gcry_ = {};
var jsapi_ = {};
var otrl_ = {};
var helper_ = {};

Module['preRun'].push(function(){

    Module["malloc"]=_malloc;
    Module["free"]=_free;
    Module["FS"]=FS;

    _static_otr_error_message_str = allocate(512,"i8",ALLOC_NORMAL);

    Module["libgcrypt"] = {};
    Module["libgcrypt"]["mpi_new"] = gcry_.mpi_new = cwrap('_gcry_mpi_new','number',['number']);
    Module["libgcrypt"]["mpi_set"] = gcry_.mpi_set = cwrap('_gcry_mpi_set','number',['number','number']);
    Module["libgcrypt"]["mpi_release"] = gcry_.mpi_release = cwrap('_gcry_mpi_release','',['number']);
    Module["libgcrypt"]["mpi_scan"] = gcry_.mpi_scan = cwrap('_gcry_mpi_scan','number',['number','number','string','number','number']);
    Module["libgcrypt"]["mpi_print"] = gcry_.mpi_print = cwrap('_gcry_mpi_print','number',['number','number','number','number','number']);
    Module["libgcrypt"]["strerror"] = gcry_.strerror = cwrap('gcry_strerror','string',['number']);

    Module["libotrl"] = {};
    Module["libotrl"]["version"] = otrl_.version = cwrap('otrl_version','string');    
    Module["libotrl"]["userstate_create"]=otrl_.userstate_create=cwrap('otrl_userstate_create','',['number']);
    Module["libotrl"]["userstate_free"]=otrl_.userstate_free=cwrap('otrl_userstate_free','',['number']);
    Module["libotrl"]["privkey_read"]=otrl_.privkey_read=cwrap('otrl_privkey_read','number',['number','string']);
    Module["libotrl"]["privkey_fingerprint"]=otrl_.privkey_fingerprint=cwrap('otrl_privkey_fingerprint','number',['number','number','string','string']);
    Module["libotrl"]["privkey_read_fingerprints"]=otrl_.privkey_read_fingerprints=cwrap('otrl_privkey_read_fingerprints','number',['number','string','number','number']);
    Module["libotrl"]["privkey_write_fingerprints"]=otrl_.privkey_write_fingerprints=cwrap('otrl_privkey_write_fingerprints','number',['number','string']);
    Module["libotrl"]["privkey_generate"]=otrl_.privkey_generate=cwrap('otrl_privkey_generate','number',['number','string','string','string']);
    Module["libotrl"]["privkey_forget"]=otrl_.privkey_forget=cwrap('otrl_privkey_forget','',['number']);
    Module["libotrl"]["privkey_forget_all"]=otrl_.privkey_forget_all=cwrap('otrl_privkey_forget_all','',['number']);
    Module["libotrl"]["privkey_find"]=otrl_.privkey_find=cwrap('otrl_privkey_find','number',['number','string','string']);
    Module["libotrl"]["context_find"]=otrl_.context_find=cwrap('otrl_context_find','number',['number','string','string','string','number','number','number','number','number']);
    Module["libotrl"]["message_sending"]=otrl_.message_sending=cwrap('otrl_message_sending','number',['number','number','number','string','string','string',
                                                                                                    'number','string','number','number','number','number','number','number']);
    Module["libotrl"]["message_free"]=otrl_.message_free=cwrap('otrl_message_free','',['number']);
    Module["libotrl"]["message_disconnect"]=otrl_.message_disconnect = cwrap('otrl_message_disconnect','',['number','number','number','string','string','string','number']);
    Module["libotrl"]["message_initiate_smp_q"]=otrl_.message_initiate_smp_q=cwrap('otrl_message_initiate_smp_q','',['number','number','number','number','string','string','number']);
    Module["libotrl"]["message_initiate_smp"]=otrl_.message_initiate_smp=cwrap('otrl_message_initiate_smp','',['number','number','number','number','string','number']);
    Module["libotrl"]["message_respond_smp"]=otrl_.message_respond_smp=cwrap('otrl_message_respond_smp','',['number','number','number','number','string','number']);
    Module["libotrl"]["message_abort_smp"]=otrl_.message_abort_smp=cwrap('otrl_message_abort_smp','',['number','number','number','number']);
    Module["libotrl"]["message_receiving"]=otrl_.message_receiving=cwrap('otrl_message_receiving','number',['number','number','number','string','string','string','string','number','number','number','number','number']);
    Module["libotrl"]["message_poll_get_default_interval"]=otrl_.message_poll_get_default_interval=cwrap('otrl_message_poll_get_default_interval','number',['number']);
    Module["libotrl"]["message_poll"]=otrl_.message_poll=cwrap('otrl_message_poll','',['number','number','number']);
    Module["libotrl"]["instag_generate"]=otrl_.instag_generate=cwrap('otrl_instag_generate','number',['number','string','string','string']);
    Module["libotrl"]["instag_read"]=otrl_.instag_read=cwrap('otrl_instag_read','number',['number','string']);
    Module["libotrl"]["instag_write"]=otrl_.instag_write=cwrap('otrl_instag_write','number',['number','string']);
    Module["libotrl"]["instag_find"]=otrl_.instag_find=cwrap('otrl_instag_find','number',['number','string','string']);
    Module["libotrl"]["message_symkey"]=otrl_.message_symkey = cwrap('otrl_message_symkey','number',['number','number','number','number','number','number','number','number']);
    Module["libotrl"]["tlv_free"]=otrl_.tlv_free = cwrap('otrl_tlv_free','',['number']);
    Module["libotrl"]["tlv_find"]=otrl_.tlv_find = cwrap('otrl_tlv_find','number',['number','number']);

    Module["jsapi"]={};    
    Module["jsapi"]["can_start_smp"]=jsapi_.can_start_smp = cwrap('jsapi_can_start_smp','number',['number']);
    Module["jsapi"]["privkey_get_next"]=jsapi_.privkey_get_next = cwrap("jsapi_privkey_get_next",'number',['number']);
    Module["jsapi"]["privkey_get_accountname"]=jsapi_.privkey_get_accountname = cwrap("jsapi_privkey_get_accountname",'string',['number']);
    Module["jsapi"]["privkey_get_protocol"]=jsapi_.privkey_get_protocol = cwrap("jsapi_privkey_get_protocol",'string',['number']);
    Module["jsapi"]["privkey_delete"]=jsapi_.privkey_delete = cwrap('jsapi_privkey_delete','',['number','string','string','string']);
    Module["jsapi"]["privkey_get_dsa_token"]=jsapi_.privkey_get_dsa_token = cwrap('jsapi_privkey_get_dsa_token','number',['number','string','number','number']);
    Module["jsapi"]["privkey_write_trusted_fingerprints"]=jsapi_.privkey_write_trusted_fingerprints = cwrap("jsapi_privkey_write_trusted_fingerprints",'number',['number','string']);
    Module["jsapi"]["userstate_import_privkey"]=jsapi_.userstate_import_privkey = cwrap('jsapi_userstate_import_privkey','number',['number','string','string','number','number','number','number','number']);
    Module["jsapi"]["userstate_write_to_file"]=jsapi_.userstate_write_to_file = cwrap('jsapi_userstate_write_to_file','number',['number','string']);
    Module["jsapi"]["userstate_get_privkey_root"]=jsapi_.userstate_get_privkey_root = cwrap("jsapi_userstate_get_privkey_root","number",["number"]);
    Module["jsapi"]["conncontext_get_protocol"]=jsapi_.conncontext_get_protocol =cwrap('jsapi_conncontext_get_protocol','string',['number']);
    Module["jsapi"]["conncontext_get_username"]=jsapi_.conncontext_get_username =cwrap('jsapi_conncontext_get_username','string',['number']);
    Module["jsapi"]["conncontext_get_accountname"]=jsapi_.conncontext_get_accountname =cwrap('jsapi_conncontext_get_accountname','string',['number']);
    Module["jsapi"]["conncontext_get_msgstate"]=jsapi_.conncontext_get_msgstate =cwrap('jsapi_conncontext_get_msgstate','number',['number']);
    Module["jsapi"]["conncontext_get_protocol_version"]=jsapi_.conncontext_get_protocol_version =cwrap('jsapi_conncontext_get_protocol_version','number',['number']);
    Module["jsapi"]["conncontext_get_smstate"]=jsapi_.conncontext_get_smstate =cwrap('jsapi_conncontext_get_smstate','number',['number']);
    Module["jsapi"]["conncontext_get_active_fingerprint"]=jsapi_.conncontext_get_active_fingerprint =cwrap('jsapi_conncontext_get_active_fingerprint','',['number','number']);
    Module["jsapi"]["conncontext_get_trust"]=jsapi_.conncontext_get_trust = cwrap('jsapi_conncontext_get_trust','string',['number']);
    Module["jsapi"]["conncontext_get_their_instance"]=jsapi_.conncontext_get_their_instance = cwrap('jsapi_conncontext_get_their_instance','number',['number']);
    Module["jsapi"]["conncontext_get_our_instance"]=jsapi_.conncontext_get_our_instance = cwrap('jsapi_conncontext_get_our_instance','number',['number']);
    Module["jsapi"]["conncontext_get_master"]=jsapi_.conncontext_get_master = cwrap('jsapi_conncontext_get_master','number',['number']);
    Module["jsapi"]["messageappops_new"]=jsapi_.messageappops_new = cwrap('jsapi_messageappops_new','number');
    Module["jsapi"]["instag_get_tag"]=jsapi_.instag_get_tag = cwrap('jsapi_instag_get_tag','number',['number']);
    Module["jsapi"]["initialise"]=jsapi_.initialise = cwrap('jsapi_initialise');

    Module["helper"]={};
    Module["helper"]["mpi2bigint"] = helper_.mpi2bigint = __mpi2bigint;
    Module["helper"]["bigint2mpi"] = helper_.bigint2mpi = __bigint2mpi;

    Module["helper"]["ptr_to_ArrayBuffer"] = helper_.ptr_to_ArrayBuffer = ptr_to_ArrayBuffer;
    Module["helper"]["ptr_to_Buffer"] = helper_.ptr_to_Buffer = ptr_to_Buffer;
    Module["helper"]["ptr_to_HexString"] = helper_.ptr_to_HexString = ptr_to_HexString;
    Module["helper"]["unsigned_char"] = helper_.unsigned_char = unsigned_char;
    Module["helper"]["unsigned_int32"] = helper_.unsigned_int32 = unsigned_int32;
    Module["helper"]["str2ab"] = helper_.str2ab = str2ab;
    Module["helper"]["ab2str"] = helper_.ab2str = ab2str;

// __msgops_callback_ functions are called from jsapi.c to bubble up to 
// to eventually fire the corresponding event emitted by otr.Session()

    __msgops_callback_policy = function($opdata, $context) {
        return Module["ops_event"]($opdata,{},"policy");
    };

    __msgops_callback_smp_request = function($opdata,$context,$question){
        var obj = (new Module["ConnContext"]($context))["obj"]();
        if($question!=0) obj["question"] = Module["Pointer_stringify"]($question);
        Module["ops_event"]($opdata, obj, "smp_request");
    };
    
    __msgops_callback_smp_failed = function($opdata,$context){
        Module["ops_event"]($opdata, (new Module["ConnContext"]($context))["obj"](),"smp_failed");
    };
    
    __msgops_callback_smp_aborted = function($opdata,$context){
        Module["ops_event"]($opdata, (new Module["ConnContext"]($context))["obj"](),"smp_aborted");
    };
    
    __msgops_callback_smp_complete = function($opdata,$context){
        Module["ops_event"]($opdata, (new Module["ConnContext"]($context))["obj"](),"smp_complete");
    };
    
    __msgops_callback_smp_error = function($opdata,$context){
        Module["ops_event"]($opdata, (new Module["ConnContext"]($context))["obj"](),"smp_error");    
    };

    __msgops_callback_create_privkey = function($opdata,$accountname,$protocol){
        Module["ops_event"]($opdata,{
          "accountname":Module["Pointer_stringify"]($accountname),
            "protocol":Module["Pointer_stringify"]($protocol)
          },"create_privkey");
    };

    __msgops_callback_is_logged_in = function($opdata,$accountname,$protocol,$recipient){
        return Module["ops_event"]($opdata,{},"is_logged_in");
    };

    __msgops_callback_inject_message = function($opdata,$accountname,$protocol,$recipient,$message){
        Module["ops_event"]($opdata,{
            "message":Module["Pointer_stringify"]($message)
        },"inject_message");;
    };

    __msgops_callback_update_context_list = function($opdata){
        Module["ops_event"]($opdata,{},"update_context_list");
    };

    __msgops_callback_new_fingerprint = function($opdata,$userstate,$accountname,$protocol,$username,$fingerprint_human){
        Module["ops_event"]($opdata,{
            "fingerprint":Module["Pointer_stringify"]($fingerprint_human)
        },"new_fingerprint")    
    };
    
    __msgops_callback_write_fingerprints = function($opdata){
        Module["ops_event"]($opdata,{},"write_fingerprints");
    };
    
    __msgops_callback_gone_secure = function($opdata,$context){
        Module["ops_event"]($opdata,{},"gone_secure");
    };
    
    __msgops_callback_gone_insecure = function($opdata,$context){
        Module["ops_event"]($opdata,{},"gone_insecure");
    };
    
    __msgops_callback_still_secure = function($opdata,$context,$is_reply){
        Module["ops_event"]($opdata,{},"still_secure");
    };
    
    __msgops_callback_max_message_size = function($opdata,$context){
        return Module["ops_event"]($opdata,{},"max_message_size");
    };

    //new ops in libotr4
    __msgops_callback_received_symkey = function($opdata,$context,$use,$usedata,$usedatalen,$symkey){
        Module["ops_event"]($opdata,{
            "use": $use,
            "usedata":ptr_to_ArrayBuffer($usedata,$usedatalen),
            "key":ptr_to_ArrayBuffer($symkey,32)
        },"received_symkey");
    };

    /*const char * msgops_callback_otr_error_message(void *opdata, ConnContext *context, OtrlErrorCode err_code){}*/
    __msgops_callback_otr_error_message = function($opdata, $context, $err_code){
        //TODO:write error string into _static_otr_error_message_str
        //for now this is implemented in jsapi.c
        return _static_otr_error_message_str;
    }

    /*void msgops_callback_otr_error_message_free(void *opdata, const char *err_msg){}*/
    __msgops_callback_otr_error_message_free = function($opdata, $err_msg){
        //no need to free anything.. we are using a statically allocated shared memory location.
    };

    __msgops_callback_handle_msg_event = function($opdata, $msg_event,$context, $message, $err){
        Module["ops_event"]($opdata,{
            "event":$msg_event,
            "message":Module["Pointer_stringify"]($message),
            "err": ($err? new GcryptError($err):null)
        },"msg_event");
    };

    __msgops_callback_create_instag = function($opdata, $accountname, $protocol){
        Module["ops_event"]($opdata,{
            "accountname":Module["Pointer_stringify"]($accountname),
            "protocol":Module["Pointer_stringify"]($protocol)
        },"create_instag");
    };
    
});//preRun



function GcryptError( num ) {
    this.num = num || 0;
    this.message = gcry_.strerror(num || 0);
}
GcryptError.prototype = new Error();
GcryptError.prototype.constructor = GcryptError;


var hexDigit = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];

function hexString( val ){
    return hexDigit[(val & 0xF0) >> 4] + hexDigit[val & 0x0F];
}

function ptr_to_HexString(ptr,len){     
    var hex = "";
    for(var i=0; i<len; i++){
        hex = hex + hexString( unsigned_char( getValue( ptr + i,"i8")));
    }
    return hex;
}

function ptr_to_Buffer(ptr,len){
    var buf = new Buffer(len);
    for(var i=0; i<len; i++){
        buf.writeInt8(getValue(ptr+i,"i8"),i);
    }
    return buf;
}

function ptr_to_ArrayBuffer(ptr,len){
    var buf = new ArrayBuffer(len);
    var u8 = new Uint8Array(buf);
    for(var i=0; i<len; i++){
        u8[i]= unsigned_char( getValue( ptr + i,"i8"));
    }
    return buf;
}

function unsigned_char( c ){
    c = c & 0xFF;
    return ( c < 0 ? (0xFF+1)+c : c );
}

function unsigned_int32( i ){
    //i must be in the range of a signed 32-bit integer!
    i = i & 0xFFFFFFFF;//truncate so we dont return values larger than an unsigned 32-bit int.
    return ( i < 0 ? (0xFFFFFFFF+1)+i : i );
}

// http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
