#include "jsapi.h"

void jsapi_initialise(){
    printf("Initialising libgcrypt...\n");
    /* Version check should be the very first call because it
          makes sure that important subsystems are intialized. */
	if (!gcry_check_version (GCRYPT_VERSION))
    {
      fputs ("=!= libgcrypt version mismatch\n", stderr);
      exit (2);
    }

    gcry_control (GCRYCTL_INITIALIZATION_FINISHED, 0);
    printf("Initialising libotr...\n");
    OTRL_INIT;
}

OtrlPrivKey* jsapi_userstate_get_privkey_root(OtrlUserState us){
    return us->privkey_root;
}
OtrlPrivKey* jsapi_privkey_get_next(OtrlPrivKey* p){
    return p->next;
}
char* jsapi_privkey_get_accountname(OtrlPrivKey* p){
    return p->accountname;
}
char* jsapi_privkey_get_protocol(OtrlPrivKey* p){
    return p->protocol;
}

char* jsapi_conncontext_get_protocol(ConnContext* ctx){
    return ctx->protocol;
}
char* jsapi_conncontext_get_username(ConnContext* ctx){
    return ctx->username;
}
char* jsapi_conncontext_get_accountname(ConnContext* ctx){
    return ctx->accountname;
}
int jsapi_conncontext_get_msgstate(ConnContext* ctx){
    return ctx->msgstate;
}
int jsapi_conncontext_get_protocol_version(ConnContext* ctx){
    return ctx->protocol_version;
}
int jsapi_conncontext_get_smstate(ConnContext* ctx){
    return ctx->smstate->sm_prog_state;
}
void jsapi_conncontext_get_active_fingerprint(ConnContext* ctx, char* human){
    human[0]='\0';
    if(ctx->active_fingerprint==NULL) return;
    otrl_privkey_hash_to_human(human, ctx->active_fingerprint->fingerprint);
}
char* jsapi_conncontext_get_trust(ConnContext* ctx){
    if(ctx->active_fingerprint == NULL) return NULL;
    return ctx->active_fingerprint->trust;
}

//MessageAppOps
OtrlPolicy msgops_callback_policy(void *opdata,ConnContext *context){
    return _msgops_callback_policy(opdata,context);
}

void msgops_callback_create_privkey(void *opdata, const char *accountname, 
        const char *protocol){
    _msgops_callback_create_privkey(opdata,accountname,protocol);
}
int msgops_callback_is_logged_in(void *opdata, const char *accountname, 
        const char *protocol, const char *recipient){
    return _msgops_callback_is_logged_in(opdata,accountname,protocol,recipient);
}
void msgops_callback_inject_message(void *opdata, const char *accountname,
        const char *protocol, const char *recipient, const char *message){
     _msgops_callback_inject_message(opdata,accountname,protocol,recipient,message);
}

void msgops_callback_notify(void *opdata, OtrlNotifyLevel level,
        const char *accountname, const char *protocol,
        const char *username, const char *title,
        const char *primary, const char *secondary){
    _msgops_callback_notify(opdata,level,accountname,protocol,username,title,primary,secondary);
}

int msgops_callback_display_otr_message(void *opdata, const char *accountname,
        const char *protocol, const char *username, const char *msg){
    return _msgops_callback_display_otr_message(opdata,accountname,protocol,username,msg);
}
void msgops_callback_update_context_list(void *opdata){
    _msgops_callback_update_context_list(opdata);
}

const char* msgops_callback_protocol_name(void *opdata, const char *protocol){
    return protocol;
}

void msgops_callback_protocol_name_free(void *opdata, const char *protocol_name){
    return;
}

void msgops_callback_new_fingerprint(void *opdata, OtrlUserState us,
        const char *accountname, const char *protocol,
        const char *username, unsigned char fingerprint[20]){
    char human[45];
    otrl_privkey_hash_to_human(human, fingerprint);
    _msgops_callback_new_fingerprint(opdata,us,accountname,protocol,username,human);
}

void msgops_callback_write_fingerprints(void *opdata){
    _msgops_callback_write_fingerprints(opdata);
}

void msgops_callback_gone_secure(void *opdata, ConnContext *context){
    _msgops_callback_gone_secure(opdata,context);
}

void msgops_callback_gone_insecure(void *opdata, ConnContext *context){
    _msgops_callback_gone_insecure(opdata,context);
}

void msgops_callback_still_secure(void *opdata, ConnContext *context, int is_reply){
    _msgops_callback_still_secure(opdata,context,is_reply);
}

void msgops_callback_log_message(void *opdata, const char *message){
    _msgops_callback_log_message(opdata,message);
}

int msgops_callback_max_message_size(void *opdata, ConnContext *context){
   return _msgops_callback_max_message_size(opdata,context);
}

const char * msgops_callback_account_name(void *opdata, const char *account, const char *protocol){
    return account;
}

void msgops_callback_account_name_free(void *opdata, const char *account_name){
    return;
}

OtrlMessageAppOps* jsapi_messageappops_new(){

    OtrlMessageAppOps *ops = malloc(sizeof(OtrlMessageAppOps));

    ops->policy = msgops_callback_policy;
    ops->create_privkey = msgops_callback_create_privkey;
    ops->is_logged_in = msgops_callback_is_logged_in;
    ops->inject_message = msgops_callback_inject_message;
    ops->notify = msgops_callback_notify;
    ops->display_otr_message = msgops_callback_display_otr_message;
    ops->update_context_list = msgops_callback_update_context_list;
    ops->protocol_name = msgops_callback_protocol_name;
    ops->protocol_name_free = msgops_callback_protocol_name_free;
    ops->new_fingerprint = msgops_callback_new_fingerprint;
    ops->write_fingerprints = msgops_callback_write_fingerprints;
    ops->gone_secure = msgops_callback_gone_secure;
    ops->gone_insecure = msgops_callback_gone_insecure;
    ops->still_secure = msgops_callback_still_secure;
    ops->log_message = msgops_callback_log_message;
    //ops->max_message_size = msgops_callback_max_message_size;
    ops->max_message_size = NULL;//disables fragmentation!
    ops->account_name_free = msgops_callback_account_name_free;
    ops->account_name = msgops_callback_account_name;

    return ops;
}

int jsapi_message_receiving (OtrlUserState userstate,OtrlMessageAppOps *messageops, void *opsdata, 
        char *accountname, char *protocol, char *sender, char *message, char** newmessage){

  NextExpectedSMP nextMsg;
  ConnContext *context;
  OtrlTLV *tlvs = NULL;
  OtrlTLV *tlv = NULL;

  //printf("jsapi_message_receiving from %s: %s\n",sender,message);

  int status = otrl_message_receiving(userstate, messageops, opsdata,
        accountname, protocol, sender, message, newmessage, &tlvs,NULL,NULL);

  context = otrl_context_find(userstate, sender, accountname, protocol, 0, NULL, NULL, NULL);

  //below incoming tlv processing code borrowed from pidgin-otr-3.2.1/otr-plugin.c

 if (context) {
  //LOOK FOR REMOTE SIDE DISCONNECT
  tlv = otrl_tlv_find(tlvs, OTRL_TLV_DISCONNECTED);
  if(tlv){
    _msgops_callback_remote_disconnected(opsdata,context);
  }else{
    //LOOK FOR SMP TLVs
	nextMsg = context->smstate->nextExpected;

    if (context->smstate->sm_prog_state == OTRL_SMP_PROG_CHEATED) {
        //puts("message receiving OTRL_SMP_PROG_CHEATED!");
        _msgops_callback_smp_failed(opsdata, context);
	    otrl_message_abort_smp(userstate, messageops, opsdata, context);
	    context->smstate->nextExpected = OTRL_SMP_EXPECT1;
	    context->smstate->sm_prog_state = OTRL_SMP_PROG_OK;

	} else {
	    tlv = otrl_tlv_find(tlvs, OTRL_TLV_SMP1Q);
	    if (tlv) {
            //puts("OTRL_TLV_SMP1Q");
		    if (nextMsg != OTRL_SMP_EXPECT1){
    		      otrl_message_abort_smp(userstate, messageops, opsdata, context);
                      _msgops_callback_smp_aborted(opsdata, context);
	    	}else {
    		    char *question = (char *)tlv->data;
    		    char *eoq = (char*)memchr(question, '\0', tlv->len);
    		    if (eoq) {
        			_msgops_callback_smp_request(opsdata,context,question);
    		    }
    		}
	    }

	    tlv = otrl_tlv_find(tlvs, OTRL_TLV_SMP1);
	    if (tlv) {
            //puts("OTRL_TLV_SMP1");
		    if (nextMsg != OTRL_SMP_EXPECT1){
    		    otrl_message_abort_smp(userstate, messageops, opsdata, context);
                    _msgops_callback_smp_aborted(opsdata, context);
    		}else {
	             _msgops_callback_smp_request(opsdata,context,NULL);
    		}
	    }

	    tlv = otrl_tlv_find(tlvs, OTRL_TLV_SMP2);
	    if (tlv) {
            //puts("OTRL_TLV_SMP2");
		    if (nextMsg != OTRL_SMP_EXPECT2){
    		    otrl_message_abort_smp(userstate, messageops, opsdata, context);
                    _msgops_callback_smp_aborted(opsdata, context);
            }else {
    		    context->smstate->nextExpected = OTRL_SMP_EXPECT4;
	    	}
	    }

	    tlv = otrl_tlv_find(tlvs, OTRL_TLV_SMP3);
	    if (tlv) {
            //puts("OTRL_TLV_SMP3");
		    if (nextMsg != OTRL_SMP_EXPECT3){
    		    otrl_message_abort_smp(userstate, messageops, opsdata, context);
	                _msgops_callback_smp_aborted(opsdata, context);
    		}else {
    		    context->smstate->nextExpected = OTRL_SMP_EXPECT1;
                if(context->smstate->sm_prog_state==1) _msgops_callback_smp_complete(opsdata, context);
                else _msgops_callback_smp_failed(opsdata, context);
    		}
	    }

	    tlv = otrl_tlv_find(tlvs, OTRL_TLV_SMP4);
	    if (tlv) {
            //puts("OTRL_TLV_SMP4");
            if (nextMsg != OTRL_SMP_EXPECT4){
    		    otrl_message_abort_smp(userstate, messageops, opsdata, context);
		    _msgops_callback_smp_aborted(opsdata, context);
    		}else {
                context->smstate->nextExpected = OTRL_SMP_EXPECT1;
                if(context->smstate->sm_prog_state==1) _msgops_callback_smp_complete(opsdata, context);
                else _msgops_callback_smp_failed(opsdata, context);
    		}
	    }

	    tlv = otrl_tlv_find(tlvs, OTRL_TLV_SMP_ABORT);
	    if (tlv) {
            //puts("OTRL_TLV_SMP_ABORT");
    		context->smstate->nextExpected = OTRL_SMP_EXPECT1;
                _msgops_callback_smp_aborted(opsdata, context);
	    }
	}//if SMP TLVs
  }//if disconnect TLV

 }else{
  //puts("message receving but no valid context!");
 }

 if(tlvs!=NULL) otrl_tlv_free(tlvs);
 return status;
}

int jsapi_can_start_smp(ConnContext* ctx){
    if (ctx->smstate->nextExpected == OTRL_SMP_EXPECT1 ) return 1;
    return 0;
}
