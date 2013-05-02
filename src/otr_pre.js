var Module = {};

Module["preRun"]=[];

Module["MPI_HOOK"] = {};

if (typeof exports !== 'undefined') {
    Module["MPI_HOOK"]["BigInt"]= require("./bigint");
}else{
    Module["MPI_HOOK"]["BigInt"] = this["BigInt"];
}

/* emcc is generating this code when libgpg-error is compiled to js.. :(
__ATINIT__ = __ATINIT__.concat([
  { func: _i32______gpg_err_init_to_void_____ }
]);
*/
function _i32______gpg_err_init_to_void_____(){};//workaround.. TODO:investigate

var _static_buffer_ptr;
var _static_new_mpi_ptr_ptr;
var _static_otr_error_message_str;
var gcry_ = {};
var jsapi_ = {};
var otrl_ = {};
var helper_ = {};

Module['preRun'].push(function(){

    Module["malloc"]=_malloc;
    Module["free"]=_free;
    Module["FS"]=FS;

    //select doesn't really have a place in node environment.. since i/o is non-blocking
    _select = (function() {
      return 3;//this means all the three socket sets passed to the function are have sockets ready for reading.
    });
    var devFolder = Module['FS'].findObject("/dev") || Module['FS_createFolder']("/","dev",true,true);
    Module['FS_createDevice'](devFolder,"random",(function(){
      return Math.floor(Math.random() * 256);
    }));

    Module['FS_createDevice'](devFolder,"urandom",(function(){
      return Math.floor(Math.random() * 256);
    }));
    
    _static_buffer_ptr = allocate(4096,"i8",ALLOC_STATIC); 
    _static_new_mpi_ptr_ptr = allocate(4,"i8",ALLOC_STATIC);
    _static_otr_error_message_str = allocate(512,"i8",ALLOC_STATIC);

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
    Module["helper"]["ptr_to_HexString"] = helper_.ptr_to_HexString = ptr_to_HexString;
    Module["helper"]["unsigned_char"] = helper_.unsigned_char = unsigned_char;
    Module["helper"]["unsigned_int32"] = helper_.unsigned_int32 = unsigned_int32;
    Module["helper"]["str2ab"] = helper_.str2ab = str2ab;
    Module["helper"]["ab2str"] = helper_.ab2str = ab2str;


// some of the MPI calculations are slow
// can we use pure javascript crypto and still preserve the libgcrypt API?
/* native alot faster don't override
        __gcry_mpi_add = function BigInt_MPI_ADD(w,u,v){
            var ww = BI.add( __mpi2bigint(u), __mpi2bigint(v) );
            __bigint2mpi(w,ww);
        };
*/
/* not tested but my guess is it wont significantly increase performance
        __gcry_mpi_sub = function BigInt_MPI_SUB(w,u,v){
            var ww = BI.sub( __mpi2bigint(u), __mpi2bigint(v) );
            __bigint2mpi(w,ww);
        };
*/
/*native is faster, but its still quite fast!
        __gcry_mpi_mul = function BigInt_MPI_MULT(w,u,v){
            var ww = BI.mult( __mpi2bigint(u), __mpi2bigint(v) );
            __bigint2mpi(w,ww);
        };
*/
/*
//void gcry_mpi_mul_2exp (gcry_mpi_t w, gcry_mpi_t u, unsigned long e)
//w = u * 2^e.

    __gcry_mpi_mul2exp = function BigInt_MPI_MUL2EXP(mpi_w, mpi_u, e){
       
    };
*/
//_gcry_mpi_tdiv_qr( gcry_mpi_t quot, gcry_mpi_t rem, gcry_mpi_t num, gcry_mpi_t den)
/** !!!!!!! EL GAMAL FAILS in pubkey.js test!!!! so does ECC DSA!!
    __gcry_mpi_tdiv_qr = function BigInt_MPI_DIVIDE_(mpi_quot,mpi_rem,mpi_num,mpi_den){
        var q = BI.str2bigInt("0",16,512);//should have enough elements to store Q
        var r = BI.str2bigInt("0",16,512);//what is the best size determined from sizes of num and den?
        var num = __mpi2bigint(mpi_num);
        var den = __mpi2bigint(mpi_den);
        BI.divide_(num,den,q,r);
        if(mpi_quot) __bigint2mpi(mpi_quot,q);
        if(mpi_rem) __bigint2mpi(mpi_rem, r);
    };
*/      
/* GCD causing problems with some libgcrypt tests...
        console.log("overriding __gcry_mpi_gcd");
        __gcry_mpi_gcd = function BigInt_MPI_GCD(mpi_g, mpi_a, mpi_b){
            //console.log(">__gcry_mpi_gcd()");
            var a = __mpi2bigint(mpi_a);
            var b = __mpi2bigint(mpi_b);
            //assert a.length == b.length
            var g = Module["MPI_HOOK"]["BigInt"]["GCD"](a,b);
            __bigint2mpi(mpi_g, g);
            if( Module["MPI_HOOK"]["BigInt"]["equalsInt"](g,1) ) return 1;
            return 0;
        };
*/
      //console.log("overriding __gcry_mpi_mod");
/*perf boost not tested but it should be enhancing..*/
        __gcry_mpi_mod = function BigInt_MPI_MOD(mpi_r,mpi_x,mpi_n){
            //console.log(">__gcry_mpi_mod()");
            //r = x mod n
            var x = __mpi2bigint(mpi_x);
            var n = __mpi2bigint(mpi_n);
            __bigint2mpi(mpi_r, Module["MPI_HOOK"]["BigInt"]["mod"](x,n));
        };
        
        //console.log("overriding __gcry_mpi_powm");

//confirmed bigint mulpowm, powm and invm, gcd  enhance performance..
        __gcry_mpi_powm = function BigInt_MPI_POWMOD(w, b, e, m){
            //console.log(">__gcry_mpi_powm()");
          var bi_base = __mpi2bigint(b);
          var bi_expo = __mpi2bigint(e);
          var bi_mod  = __mpi2bigint(m);
          var result = Module["MPI_HOOK"]["BigInt"]["powMod"](bi_base,bi_expo,bi_mod);
          __bigint2mpi(w,result);
        };

      //console.log("overriding __gcry_mpi_invm");

        //return (x**(-1) mod n) for bigInts x and n.  If no inverse exists, it returns null
        __gcry_mpi_invm = function BigInt_MPI_INVERSEMOD(x,a,m){
            //console.log(">__gcry_mpi_invm()");
            var bi_a = __mpi2bigint(a);
            var bi_m = __mpi2bigint(m);
            var result = Module["MPI_HOOK"]["BigInt"]["inverseMod"](bi_a,bi_m);
            if(result){
                __bigint2mpi(x,result);
                return 1;
            }else{
                return 0;//no inverse mod exists
            }
        };
/*
//no significant improvement, but if enabled without mulpowm -- degrades performance!
        // w = u * v mod m --> (u*v) mod m  ===  u * (v mod m) ? 
        __gcry_mpi_mulm = function BigInt_MPI_MULTMOD(w, u, v, m){
          var bi_u = __mpi2bigint(u);
          var bi_v = __mpi2bigint(v);
          var bi_m = __mpi2bigint(m);
          //faster when v < u (and gives correct value!)
          var result = BI.greater(bi_u,bi_v) ? BI.multMod(bi_u,bi_v,bi_m) :BI.multMod(bi_v,bi_u,bi_m);
          __bigint2mpi(w,result);
        };
*/
      //console.log("overriding __gcry_mpi_mulpowm");
        __gcry_mpi_mulpowm = function BigInt_MPI_MULPOWM(mpi_r,mpi_array_base,mpi_array_exp,mpi_m){
            //console.log(">__gcry_mpi_mulpowm()");
            var indexer = 1;
            var mpi1, mpi2, bi_m,bi_result;
            mpi1 = getValue(mpi_array_base,"i32");
            mpi2 = getValue(mpi_array_exp,"i32");
            bi_m = __mpi2bigint(mpi_m);
            var BE = [];
            var O = [];
            while(mpi1 && mpi2){
                BE.push({b:__mpi2bigint(mpi1),e:__mpi2bigint(mpi2)});
                mpi1 = getValue(mpi_array_base+(indexer*4),"i32");
                mpi2 = getValue(mpi_array_exp+ (indexer*4),"i32");
                indexer++;
            }
            if(BE.length){
                BE.forEach(function(be){
                    O.push(Module["MPI_HOOK"]["BigInt"]["powMod"](be.b,be.e,bi_m));
                });
                bi_result = Module["MPI_HOOK"]["BigInt"]["str2bigInt"]("1",16);
                O.forEach(function(k){
                    bi_result = Module["MPI_HOOK"]["BigInt"]["mult"](bi_result,k);
                });
            }
            bi_result = Module["MPI_HOOK"]["BigInt"]["mod"](bi_result,bi_m);
            __bigint2mpi(mpi_r,bi_result);
        };

//TODO: _gcry_generate_fips186_2_prime
//      _gcry_generate_elg_prime


      //console.log("overriding _gen_prime");

/*static gcry_mpi_t gen_prime (unsigned int nbits, int secret, int randomlevel,
                             int (*extra_check)(void *, gcry_mpi_t),
                             void *extra_check_arg);*/
    _gen_prime = function BigInt_Prime(nbits,secretlevel,randomlevel,xtracheck,xtracheck_args){
        var mpi_prime = gcry_.mpi_new ( nbits );
        for(;;){
            var bi_prime = Module["MPI_HOOK"]["BigInt"]["randTruePrime"](nbits);
            __bigint2mpi(mpi_prime,bi_prime);
            if(xtracheck && FUNCTION_TABLE[xtracheck](xtracheck_args,mpi_prime)){                
                   continue;//prime rejected!                
            }
            return mpi_prime;
        }
    };

});//preRun


// __msgops_callback_ functions are called from jsapi.c to bubble up to 
// to eventually fire the corresponding event emitted by otr.Session()

function __msgops_callback_smp_request($opdata,$context,$question){
    var obj = (new Module["ConnContext"]($context))["obj"]();
    if($question!=0) obj["question"] = Module["Pointer_stringify"]($question);
    Module["ops_event"]($opdata, obj, "smp_request");
}
function __msgops_callback_smp_failed($opdata,$context){
    Module["ops_event"]($opdata, (new Module["ConnContext"]($context))["obj"](),"smp_failed");
}
function __msgops_callback_smp_aborted($opdata,$context){
    Module["ops_event"]($opdata, (new Module["ConnContext"]($context))["obj"](),"smp_aborted");
}
function __msgops_callback_smp_complete($opdata,$context){
    Module["ops_event"]($opdata, (new Module["ConnContext"]($context))["obj"](),"smp_complete");
}
function __msgops_callback_smp_error($opdata,$context){
    Module["ops_event"]($opdata, (new Module["ConnContext"]($context))["obj"](),"smp_error");    
}

function __msgops_callback_policy($opdata, $context) {
  return Module["ops_event"]($opdata,{},"policy");
}

function __msgops_callback_create_privkey($opdata,$accountname,$protocol){
  Module["ops_event"]($opdata,{
    "accountname":Module["Pointer_stringify"]($accountname),
    "protocol":Module["Pointer_stringify"]($protocol)
  },"create_privkey");
}

function __msgops_callback_is_logged_in($opdata,$accountname,$protocol,$recipient){
  return Module["ops_event"]($opdata,{},"is_logged_in");
}

function __msgops_callback_inject_message($opdata,$accountname,$protocol,$recipient,$message){
    Module["ops_event"]($opdata,{
        "message":Module["Pointer_stringify"]($message)
    },"inject_message");
}

function __msgops_callback_update_context_list($opdata){
    Module["ops_event"]($opdata,{},"update_context_list");
}

function __msgops_callback_new_fingerprint($opdata,$userstate,$accountname,$protocol,$username,$fingerprint_human){
    Module["ops_event"]($opdata,{
        "fingerprint":Module["Pointer_stringify"]($fingerprint_human)
    },"new_fingerprint")    
}
function __msgops_callback_write_fingerprints($opdata){
    Module["ops_event"]($opdata,{},"write_fingerprints");
}
function __msgops_callback_gone_secure($opdata,$context){
    Module["ops_event"]($opdata,{},"gone_secure");
}
function __msgops_callback_gone_insecure($opdata,$context){
    Module["ops_event"]($opdata,{},"gone_insecure");
}
function __msgops_callback_still_secure($opdata,$context,$is_reply){
    Module["ops_event"]($opdata,{},"still_secure");
}
function __msgops_callback_max_message_size($opdata,$context){
    return Module["ops_event"]($opdata,{},"max_message_size");
}

//new ops in libotr4
function __msgops_callback_received_symkey($opdata,$context,$use,$usedata,$usedatalen,$symkey){
    Module["ops_event"]($opdata,{
        "use": $use,
        "usedata":ptr_to_ArrayBuffer($usedata,$usedatalen),
        "key":ptr_to_ArrayBuffer($symkey,32)
    },"received_symkey")

/* for debugging..
    Module["ops_event"]($opdata,{
        "use": $use,
        "usedata":ab2str(ptr_to_ArrayBuffer($usedata,$usedatalen)),
        "key":ptr_to_HexString($symkey,32)
    },"received_symkey")
*/
}

/*const char * msgops_callback_otr_error_message(void *opdata, ConnContext *context, OtrlErrorCode err_code){}*/
function __msgops_callback_otr_error_message($opdata, $context, $err_code){
    //TODO:write error string into _static_otr_error_message_str
    //for now this is implemented in jsapi.c
    return _static_otr_error_message_str;
}

/*void msgops_callback_otr_error_message_free(void *opdata, const char *err_msg){}*/
function __msgops_callback_otr_error_message_free($opdata, $err_msg){
    //no need to free anything.. we are using a statically allocated shared memory location.
}

function __msgops_callback_handle_msg_event($opdata, $msg_event,$context, $message, $err){
    Module["ops_event"]($opdata,{
        "event":$msg_event,
        "message":Module["Pointer_stringify"]($message),
        "err": ($err? new GcryptError($err):null)
    },"msg_event");
}

function __msgops_callback_create_instag($opdata, $accountname, $protocol){
    Module["ops_event"]($opdata,{
        "accountname":Module["Pointer_stringify"]($accountname),
        "protocol":Module["Pointer_stringify"]($protocol)
    },"create_instag");
}
/* TODO
void msgops_callback_convert_msg(void *opdata, ConnContext *context,
        OtrlConvertType convert_type, char ** dest, const char *src){
    _msgops_callback_convert_msg(opdata, context, convert_type, dest, src);
}
void msgops_callback_convert_free(void *opdata, ConnContext *context, char *dest){
    _msgops_callback_convert_free(opdata, context, dest);
}
void msgops_callback_timer_control(void *opdata, unsigned int interval){
    _msgops_callback_timer_control(opdata,interval);
}
*/

//todo:copy directly between memory and bigint array.. (faster than string conversions?..)
function __mpi2bigint(mpi_ptr){
    var GCRYMPI_FMT_HEX = 4; //gcrypt.h:    GCRYMPI_FMT_HEX = 4,    /* Hex format. */
    //gcry_error_t gcry_mpi_print (enum gcry_mpi_format format, unsigned char *buffer, size_t buflen, size_t *nwritten, const gcry_mpi_t a)
    var err = gcry_.mpi_print(GCRYMPI_FMT_HEX,_static_buffer_ptr,4096,0,mpi_ptr);

    if(err) {
        throw new GcryptError(err);
    }
    var mpi_str_ptr = _static_buffer_ptr;
    var mpi_str = Module['Pointer_stringify'](mpi_str_ptr);

    return Module["MPI_HOOK"]["BigInt"]["str2bigInt"](mpi_str,16);   
}

function __bigint2mpi(mpi_ptr,bi_num){
    var new_mpi_ptr_ptr = _static_new_mpi_ptr_ptr;
    var bi_num_str = Module["MPI_HOOK"]["BigInt"]["bigInt2str"](bi_num,16);
    //gcry_error_t gcry_mpi_scan (gcry_mpi_t *r_mpi, enum gcry_mpi_format format, const unsigned char *buffer, size_t buflen, size_t *nscanned)
    var err = gcry_.mpi_scan(new_mpi_ptr_ptr,4,bi_num_str,0,0);
    if(err){
        throw new GcryptError(err);
    }
    var scanned_mpi_ptr = getValue(new_mpi_ptr_ptr,"i32");
    if(scanned_mpi_ptr==0){
        throw("NULL scanned MPI in __bigint2mpi() otr_pre.js");
    }
    //gcry_mpi_t gcry_mpi_set (gcry_mpi_t w, const gcry_mpi_t u)
    var same = gcry_.mpi_set(mpi_ptr,scanned_mpi_ptr);

    gcry_.mpi_release(scanned_mpi_ptr);
    if(same && same != mpi_ptr){
        return same;
    }        
}

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
