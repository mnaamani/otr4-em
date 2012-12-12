var Module = {};

Module["preRun"]=[];
/*
Module["InitOTR"] = function(ConnContext){
    Module["ConnContext"] = ConnContext;
}
*/
//eliminate globals, hide them safely away from the closure compiler in 
//Module["hide_me_here"]={
//  "use double quotes":something()
//};

Module["MPI_HOOK"] = {};

Module["MPI_HOOK"]["BigInt"]= require("./bigint");

/* emcc is generating this code when libgpg-error is compiled to js.. :(
__ATINIT__ = __ATINIT__.concat([
  { func: _i32______gpg_err_init_to_void_____ }
]);
*/
function _i32______gpg_err_init_to_void_____(){};//workaround.. TODO:investigate

function __dump_profile(){
}

//wrap these in Module also?
var _static_buffer_ptr;
var _static_new_mpi_ptr_ptr;
var gcry_ = {};
var jsapi_ = {};
var otrl_ = {};

//todo:copy directly between memory and bigint array.. (faster than string conversions?..)
function __mpi2bigint(mpi_ptr){
//    console.log(">__mpi2bigint");
  /*  if(inmpi2bigint){
        console.log("OH OH! recursive mpi2bigint!");
        process.exit();
    }
    inmpi2bigint=true;

    if(mpi_ptr==0) {
        console.log("mpi_ptr==0, in __mpi2bigint!");
        process.exit();
    }
    */
//    var buffer_ptr = _malloc(4);//char**
//    var nbytes_ptr = _malloc(4)//int*
    var GCRYMPI_FMT_HEX = 4; //gcrypt.h:    GCRYMPI_FMT_HEX = 4,    /* Hex format. */
    //gcry_error_t gcry_mpi_aprint (enum gcry_mpi_format format, unsigned char **buffer, size_t *nbytes, const gcry_mpi_t a)  
    //console.log("calling gcry_mpi_aprint");
//    var err = ccall('gcry_mpi_aprint','number',['number','number','number','number'],[GCRYMPI_FMT_HEX,buffer_ptr,0,mpi_ptr]);

    //gcry_error_t gcry_mpi_print (enum gcry_mpi_format format, unsigned char *buffer, size_t buflen, size_t *nwritten, const gcry_mpi_t a)
    //var err = ccall('gcry_mpi_print','number',['number','number','number','number','number'],[GCRYMPI_FMT_HEX,_static_buffer_ptr,4096,0,mpi_ptr]);
    var err = gcry_.mpi_print(GCRYMPI_FMT_HEX,_static_buffer_ptr,4096,0,mpi_ptr);

    //console.log("gcry_mpi_aprint returned:",err);
    if(err) {
       var strerr = gcry_.strerror(err);
       console.log("error in gcry_mpi_aprint:",strerr);     
       process.exit();
    }
//    var mpi_str_ptr = getValue(buffer_ptr,"i32");
    var mpi_str_ptr = _static_buffer_ptr;
    var mpi_str = Module['Pointer_stringify'](mpi_str_ptr);
//    console.log("MPI string converted:",mpi_str);
//    _free(buffer_ptr);
//    if(mpi_str_ptr>0) _free(mpi_str_ptr);  //not our buffer to free? or should be freed with gcry_free ?
//    _free(nbytes_ptr);

//    inmpi2bigint = false;
    return Module["MPI_HOOK"]["BigInt"]["str2bigInt"](mpi_str,16);   
}

function __bigint2mpi(mpi_ptr,bi_num){
  //  console.log(">__bigint2mpi");

    /*if(mpi_ptr==0) {
        console.log("mpi_ptr==0, in __bigint2mpi!");
        process.exit();
    }
    if(inbigint2mpi){
        console.log("OH OH! recursive bigint2mpi!");
        process.exit();
    }
    inbigint2mpi = true;
    */
    //convert bi_num to string.. and scan it into a new mpi using gcry_mpi_scan
    //copy/set the new mpi to mpi_ptr
    //var new_mpi_ptr_ptr = _malloc(4);//gcry_mpi_t*
    var new_mpi_ptr_ptr = _static_new_mpi_ptr_ptr;
    //var nscanned_ptr = _malloc(4);//size_t*
    var bi_num_str = Module["MPI_HOOK"]["BigInt"]["bigInt2str"](bi_num,16);
  //  console.log("converting bi_num to mpi:",bi_num_str);
    //gcry_error_t gcry_mpi_scan (gcry_mpi_t *r_mpi, enum gcry_mpi_format format, const unsigned char *buffer, size_t buflen, size_t *nscanned)
    //var err = ccall('gcry_mpi_scan','number',['number','number','string','number','number'],[new_mpi_ptr_ptr,4,bi_num_str,0,nscanned_ptr]);
    var err = gcry_.mpi_scan(new_mpi_ptr_ptr,4,bi_num_str,0,0);
    if(err){
        var strerr = gcry_.strerror(err);
        console.log("gcrypt_error in gcry_mpi_scan:",strerr);
        process.exit();
    }
    var scanned_mpi_ptr = getValue(new_mpi_ptr_ptr,"i32");
    if(scanned_mpi_ptr==0){
        console.log("NULL scanned mpi in bigint2mpi()");
        process.exit();
    }
    //set new_mpi_ptr -> mpi_ptr
    //gcry_mpi_t gcry_mpi_set (gcry_mpi_t w, const gcry_mpi_t u)
    //ccall('gcry_mpi_set','number',['number','number'],[mpi_ptr,new_mpi_ptr]);
    
    //todo check if mpi_ptr can store scanned_mpi.. otherwise expand it before we set
    
    var same = gcry_.mpi_set(mpi_ptr,scanned_mpi_ptr);
    //TODO: make a custom scanner that doesn't malloc new mpi   
    gcry_.mpi_release(scanned_mpi_ptr);
    if(same && same != mpi_ptr){
        //console.log("unexpected: gcry_mpi_set created a new mpi!");
        //process.exit();
        return same;
    }
        
    //_free(new_mpi_ptr_ptr);
    //_free(nscanned_ptr);

    //inbigint2mpi = false;
}

Module['preRun'].push(function(){

    Module["malloc"]=_malloc;
    Module["free"]=_free;

    //select doesn't really have a place in a JS environment.. since i/o is non-blocking
    _select = (function() {
      return 3;//this means all the three socket sets passed to the function are have sockets ready for reading.
    });
    
    //Math.random = profile(Math.random);
    //if entropy is low.. it will significantly increase time for crypto keygen..
    //FS.createDevice("/dev/", "random", (function() {
    Module['FS_createDevice']("/dev/","random",(function(){
      return Math.floor(Math.random() * 256);//just temporary.. need a platform specific implementation..
    }));

    //FS.createDevice("/dev/", "urandom", (function() {
    Module['FS_createDevice']("/dev/","urandom",(function(){
      return Math.floor(Math.random() * 256);
    }));
    console.error("created /dev/random and /dev/urandom devices.");
    
//    _static_buffer_ptr = _malloc(4096);//verify _malloc works with closure compiler 
//    _static_new_mpi_ptr_ptr = _malloc(4);
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
    Module["libotrl"]["context_find"]=otrl_.context_find=cwrap('otrl_context_find','number',['number','string','string','string','number','number','number','number','number']);
    Module["libotrl"]["message_sending"]=otrl_.message_sending=cwrap('otrl_message_sending','number',['number','number','number','string','string','string',
                                                                                                    'number','string','number','number','number','number','number','number']);
    Module["libotrl"]["message_free"]=otrl_.message_free=cwrap('otrl_message_free','',['number']);
    Module["libotrl"]["message_disconnect"]=otrl_.message_disconnect = cwrap('otrl_message_disconnect','',['number','number','number','string','string','string']);
    Module["libotrl"]["message_initiate_smp_q"]=otrl_.message_initiate_smp_q=cwrap('otrl_message_initiate_smp_q','',['number','number','number','number','string','string','number']);
    Module["libotrl"]["message_initiate_smp"]=otrl_.message_initiate_smp=cwrap('otrl_message_initiate_smp','',['number','number','number','number','string','number']);
    Module["libotrl"]["message_respond_smp"]=otrl_.message_respond_smp=cwrap('otrl_message_respond_smp','',['number','number','number','number','string','number']);
    //newly used add to exported functions!
    Module["libotrl"]["message_abort_smp"]=otrl_.message_abort_smp=cwrap('otrl_message_abort_smp','',['number','number','number','number']);
    Module["libotrl"]["message_receiving"]=otrl_.message_receiving=cwrap('otrl_message_receiving','number',['number','number','number','string','string','string','string','number','number','number','number','number']);
    Module["libotrl"]["instag_generate"]=otrl_.instag_generate=cwrap('otrl_instag_generate','number',['number','string','string','string']);
    Module["libotrl"]["instag_read"]=otrl_.instag_read=cwrap('otrl_instag_read','number',['number','string']);
    Module["libotrl"]["instag_write"]=otrl_.instag_write=cwrap('otrl_instag_write','number',['number','string']);
    Module["libotrl"]["instag_find"]=otrl_.instag_find=cwrap('otrl_instag_find','number',['number','string','string']);

    Module["jsapi"]={};    
    Module["jsapi"]["can_start_smp"]=jsapi_.can_start_smp = cwrap('jsapi_can_start_smp','number',['number']);
    Module["jsapi"]["privkey_get_next"]=jsapi_.privkey_get_next = cwrap("jsapi_privkey_get_next",'number',['number']);
    Module["jsapi"]["privkey_get_accountname"]=jsapi_.privkey_get_accountname = cwrap("jsapi_privkey_get_accountname",'string',['number']);
    Module["jsapi"]["privkey_get_protocol"]=jsapi_.privkey_get_protocol = cwrap("jsapi_privkey_get_protocol",'string',['number']);
    Module["jsapi"]["userstate_get_privkey_root"]=jsapi_.userstate_get_privkey_root = cwrap("jsapi_userstate_get_privkey_root","number",["number"]);
    Module["jsapi"]["conncontext_get_protocol"]=jsapi_.conncontext_get_protocol =cwrap('jsapi_conncontext_get_protocol','string',['number']);
    Module["jsapi"]["conncontext_get_username"]=jsapi_.conncontext_get_username =cwrap('jsapi_conncontext_get_username','string',['number']);
    Module["jsapi"]["conncontext_get_accountname"]=jsapi_.conncontext_get_accountname =cwrap('jsapi_conncontext_get_accountname','string',['number']);
    Module["jsapi"]["conncontext_get_msgstate"]=jsapi_.conncontext_get_msgstate =cwrap('jsapi_conncontext_get_msgstate','number',['number']);
    Module["jsapi"]["conncontext_get_protocol_version"]=jsapi_.conncontext_get_protocol_version =cwrap('jsapi_conncontext_get_protocol_version','number',['number']);
    Module["jsapi"]["conncontext_get_smstate"]=jsapi_.conncontext_get_smstate =cwrap('jsapi_conncontext_get_smstate','number',['number']);
    Module["jsapi"]["conncontext_get_active_fingerprint"]=jsapi_.conncontext_get_active_fingerprint =cwrap('jsapi_conncontext_get_active_fingerprint','',['number','number']);
    Module["jsapi"]["conncontext_get_trust"]=jsapi_.conncontext_get_trust = cwrap('jsapi_conncontext_get_trust','string',['number']);
    Module["jsapi"]["initialise"]=jsapi_.initialise = cwrap('jsapi_initialise');
    Module["jsapi"]["messageappops_new"]=jsapi_.messageappops_new = cwrap('jsapi_messageappops_new','number');
    //new jsapi functions to add to exported_funcs
    Module["jsapi"]["conncontext_get_their_instance"]=jsapi_.conncontext_get_their_instance = cwrap('jsapi_conncontext_get_their_instance','number',['number']);
    Module["jsapi"]["conncontext_get_our_instance"]=jsapi_.conncontext_get_our_instance = cwrap('jsapi_conncontext_get_our_instance','number',['number']);
    Module["jsapi"]["conncontext_get_master"]=jsapi_.conncontext_get_master = cwrap('jsapi_conncontext_get_master','number',['number']);
    Module["jsapi"]["instag_get_tag"]=jsapi_.instag_get_tag = cwrap('jsapi_instag_get_tag','number',['number']);


if(true){
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
      console.log("overriding __gcry_mpi_mod");
/*perf boost not tested but it should be enhancing..*/
        __gcry_mpi_mod = function BigInt_MPI_MOD(mpi_r,mpi_x,mpi_n){
            //console.log(">__gcry_mpi_mod()");
            //r = x mod n
            var x = __mpi2bigint(mpi_x);
            var n = __mpi2bigint(mpi_n);
            __bigint2mpi(mpi_r, Module["MPI_HOOK"]["BigInt"]["mod"](x,n));
        };
        
        console.log("overriding __gcry_mpi_powm");

//confirmed bigint mulpowm, powm and invm, gcd  enhance performance..
        __gcry_mpi_powm = function BigInt_MPI_POWMOD(w, b, e, m){
            //console.log(">__gcry_mpi_powm()");
          var bi_base = __mpi2bigint(b);
          var bi_expo = __mpi2bigint(e);
          var bi_mod  = __mpi2bigint(m);
          var result = Module["MPI_HOOK"]["BigInt"]["powMod"](bi_base,bi_expo,bi_mod);
          __bigint2mpi(w,result);
        };

      console.log("overriding __gcry_mpi_invm");

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
      console.log("overriding __gcry_mpi_mulpowm");
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


      console.log("overriding _gen_prime");

/*static gcry_mpi_t gen_prime (unsigned int nbits, int secret, int randomlevel,
                             int (*extra_check)(void *, gcry_mpi_t),
                             void *extra_check_arg);*/
    _gen_prime = function BigInt_Prime(nbits,secretlevel,randomlevel,xtracheck,xtracheck_args){
        //    console.log(">_gen_prime()");
        var mpi_prime = gcry_.mpi_new ( nbits );
        //console.log(">gcry_.mpi_new(",nbits,") returned.");
        for(;;){
            var bi_prime = Module["MPI_HOOK"]["BigInt"]["randTruePrime"](nbits);
            //console.log(">BI.randTruePrime(",nbits,") returned.");
            __bigint2mpi(mpi_prime,bi_prime);
            //if(xtracheck && jsapi_.docallback_prime_check(xtracheck,xtracheck_args,mpi_prime) ) {
            if(xtracheck && FUNCTION_TABLE[xtracheck](xtracheck_args,mpi_prime)){                
                   continue;//prime rejected!                
            }
            //console.log("returning from _gen_prime()");
            return mpi_prime;
        }
    };
}
});

/*
function __msgops_callback_remote_disconnected($opdata,$context){
    Module["ops_event"]($opdata, (new Module["ConnContext"]($context))["obj"](),"remote_disconnected");
}
*/
function __msgops_callback_smp_request($opdata,$context,$question){
    var obj = (new Module["ConnContext"]($context))["obj"]();
    if($question!=0) obj["question"] = Module["Pointer_stringify"]($question);
    Module["ops_event"]($opdata, obj, "smp_request");
}
function __msgops_callback_smp_failed($opdata,$context){
    //console.log("__msgops_callback_smp_failed");
    Module["ops_event"]($opdata, (new Module["ConnContext"]($context))["obj"](),"smp_failed");
}
function __msgops_callback_smp_aborted($opdata,$context){
    //console.log("__msgops_callback_smp_aborted");
    Module["ops_event"]($opdata, (new Module["ConnContext"]($context))["obj"](),"smp_aborted");
}
function __msgops_callback_smp_complete($opdata,$context){
    //console.log("__msgops_callback_smp_compelte");
    Module["ops_event"]($opdata, (new Module["ConnContext"]($context))["obj"](),"smp_complete");
}
function __msgops_callback_smp_error($opdata,$context){
    //console.log("__msgops_callback_smp_error");
    Module["ops_event"]($opdata, (new Module["ConnContext"]($context))["obj"](),"smp_error");    
}

function __msgops_callback_policy($opdata, $context) {
  return Module["ops_event"]($opdata,{},"policy");
}

function __msgops_callback_create_privkey($opdata,$accountname,$protocol){
  Module["ops_event"]($opdata,{},"create_privkey");
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
/*
void msgops_callback_received_symkey(void *opdata, ConnContext *context,
        unsigned int use, const unsigned char *usedata,
        size_t usedatalen, const unsigned char *symkey){
}
*/
function __msgops_callback_received_symkey($opdata,$context,$use,$usedata,$usedatalen,$symkey){
}

/*
const char * msgops_callback_otr_error_message(void *opdata, ConnContext *context, OtrlErrorCode err_code){
}
*/
function __msgops_callback_otr_error_message($opdata, $context, $err_code){
    //TODO:write error string into _static_otr_error_message_str
    //for now this is implemented in jsapi.c
    return _static_otr_error_message_str;
}
/*
void msgops_callback_otr_error_message_free(void *opdata, const char *err_msg){
}
*/
function __msgops_callback_otr_error_message_free($opdata, $err_msg){
    //no need to free anything.. we are using a statically allocated shared memory location.
}
/*
void msgops_callback_handle_smp_event(void *opdata, OtrlSMPEvent smp_event,
        ConnContext *context, unsigned short progress_percent,
        char *question){
}
*/
/** handle this in jsapi.c instead..
function __msgops_callback_handle_smp_event($opdata,$smp_event,$context,$progress_percent,$question){
}
*/
/*
void msgops_callback_handle_msg_event(void *opdata, OtrlMessageEvent msg_event,
        ConnContext *context, const char *message,
        gcry_error_t err){
}
*/
function __msgops_callback_handle_msg_event($opdata, $msg_event,$context, $message, $err){
    Module["ops_event"]($opdata,{
        "event":$msg_event,
        "message":Module["Pointer_stringify"]($message),
        "err": ($err? gcry_.strerror($err): "")
    },"msg_event");
}
/*
void msgops_callback_create_instag(void *opdata, const char *accountname,
        const char *protocol){
}*/
function __msgops_callback_create_instag($opdata, $accountname, $protocol){
    Module["ops_event"]($opdata,{
        "accountname":Module["Pointer_stringify"]($accountname),
        "protocol":Module["Pointer_stringify"]($protocol)
    },"create_instag");
}
/*
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
