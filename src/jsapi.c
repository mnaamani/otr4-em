#include "jsapi.h"

void jsapi_initialise(){
    printf("Initialising libotr...\n");
    /* Version check should be the very first call because it
          makes sure that important subsystems are intialized. */
	if (!gcry_check_version (GCRYPT_VERSION))
    {
      fputs ("libgcrypt version mismatch\n", stderr);
      exit (2);
    }

    gcry_control (GCRYCTL_INITIALIZATION_FINISHED, 0);
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
    //active fingerprint is only stored in the master context
    human[0]='\0';
    if(ctx->active_fingerprint==NULL) return;
    otrl_privkey_hash_to_human(human, ctx->active_fingerprint->fingerprint);
//    if(ctx->m_context->active_fingerprint==NULL) return;
//    otrl_privkey_hash_to_human(human, ctx->m_context->active_fingerprint->fingerprint);
}
char* jsapi_conncontext_get_trust(ConnContext* ctx){
    if(ctx->active_fingerprint == NULL) return NULL;
    return ctx->active_fingerprint->trust;
}
otrl_instag_t jsapi_conncontext_get_their_instance(ConnContext* ctx){
    return ctx->their_instance;
}
otrl_instag_t jsapi_conncontext_get_our_instance(ConnContext* ctx){
    return ctx->our_instance;
}
ConnContext* jsapi_conncontext_get_master(ConnContext* ctx){
    return ctx->m_context;
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

void msgops_callback_update_context_list(void *opdata){
    _msgops_callback_update_context_list(opdata);
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

int msgops_callback_max_message_size(void *opdata, ConnContext *context){
   return _msgops_callback_max_message_size(opdata,context);
}

const char * msgops_callback_account_name(void *opdata, const char *account, const char *protocol){
    return account;
}

void msgops_callback_account_name_free(void *opdata, const char *account_name){
    return;
}

//new ops in libotr4
void msgops_callback_received_symkey(void *opdata, ConnContext *context,
        unsigned int use, const unsigned char *usedata,
        size_t usedatalen, const unsigned char *symkey){
    _msgops_callback_received_symkey(opdata,context,use,usedata,usedatalen,symkey);
}
const char * msgops_callback_otr_error_message(void *opdata, ConnContext *context, OtrlErrorCode err_code){
    //return _msgops_callback_otr_error_message(opdata,context,err_code);
    switch( err_code ){
        case OTRL_ERRCODE_ENCRYPTION_ERROR: return "encryption-error";
        case OTRL_ERRCODE_MSG_NOT_IN_PRIVATE: return "msg-not-in-private";
        case OTRL_ERRCODE_MSG_UNREADABLE: return "msg-unreadble";
        case OTRL_ERRCODE_MSG_MALFORMED: return "msg-malformed";
    }
    return "";
}
void msgops_callback_otr_error_message_free(void *opdata, const char *err_msg){
    //_msgops_callback_otr_error_message_free(opdata,err_msg);
}
const char * msgops_callback_resent_msg_prefix(void *opdata, ConnContext *context){
    //return("");//is it valid to have empty string as the resent prefix?
    return "[R]";
}
void msgops_callback_resent_msg_prefix_free(void *opdata, const char *prefix){
    return;
}
void msgops_callback_handle_smp_event(void *opdata, OtrlSMPEvent smp_event,
        ConnContext *context, unsigned short progress_percent,
        char *question){
    //_msgops_callback_handle_smp_event(opdata,smp_event,context,progress_percent,question);
    switch(smp_event){
        case OTRL_SMPEVENT_ASK_FOR_SECRET:
            _msgops_callback_smp_request(opdata,context,NULL);return;
        case OTRL_SMPEVENT_ASK_FOR_ANSWER:
            _msgops_callback_smp_request(opdata,context,question);return;
        case OTRL_SMPEVENT_IN_PROGRESS:
            return;
        case OTRL_SMPEVENT_SUCCESS:
            _msgops_callback_smp_complete(opdata, context);return;
        case OTRL_SMPEVENT_FAILURE:
            _msgops_callback_smp_failed(opdata, context);return;
        case OTRL_SMPEVENT_CHEATED:
        case OTRL_SMPEVENT_ERROR:
            _msgops_callback_smp_error(opdata, context);return;//must call otrl_message_abort_smp
        case OTRL_SMPEVENT_ABORT:
            _msgops_callback_smp_aborted(opdata, context);return;
    }
}
void msgops_callback_handle_msg_event(void *opdata, OtrlMessageEvent msg_event,
        ConnContext *context, const char *message,
        gcry_error_t err){
    _msgops_callback_handle_msg_event(opdata, msg_event,context, message, err);
}
void msgops_callback_create_instag(void *opdata, const char *accountname,
        const char *protocol){
    _msgops_callback_create_instag(opdata, accountname, protocol);
}
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

OtrlMessageAppOps* jsapi_messageappops_new(){

    OtrlMessageAppOps *ops = malloc(sizeof(OtrlMessageAppOps));

    ops->policy = msgops_callback_policy;
    ops->create_privkey = msgops_callback_create_privkey;
    ops->is_logged_in = msgops_callback_is_logged_in;
    ops->inject_message = msgops_callback_inject_message;
    ops->update_context_list = msgops_callback_update_context_list;
    ops->new_fingerprint = msgops_callback_new_fingerprint;
    ops->write_fingerprints = msgops_callback_write_fingerprints;
    ops->gone_secure = msgops_callback_gone_secure;
    ops->gone_insecure = msgops_callback_gone_insecure;
    ops->still_secure = msgops_callback_still_secure;
    ops->max_message_size = NULL;//disables fragmentation
    //ops->max_message_size = msgops_callback_max_message_size;
    ops->account_name_free = msgops_callback_account_name_free;
    ops->account_name = msgops_callback_account_name;

    //new in libotr-4
    ops->received_symkey = msgops_callback_received_symkey;
    ops->otr_error_message = msgops_callback_otr_error_message;
    ops->otr_error_message_free = msgops_callback_otr_error_message_free;
    //ops->resent_msg_prefix = msgops_callback_resent_msg_prefix;
    //ops->resent_msg_prefix_free = msgops_callback_resent_msg_prefix_free;
    ops->resent_msg_prefix = NULL;
    ops->resent_msg_prefix_free = NULL;
    ops->handle_smp_event = msgops_callback_handle_smp_event;
    ops->handle_msg_event = msgops_callback_handle_msg_event;
    ops->create_instag = msgops_callback_create_instag;
    //ops->create_instag = NULL;//non-persistent random instag per session
    //ops->convert_msg = msgops_callback_convert_msg;
    //ops->convert_free = msgops_callback_convert_free;
    //ops->timer_control = msgops_callback_timer_control;
    ops->convert_msg = NULL;
    ops->convert_free = NULL;
    ops->timer_control = NULL;

    return ops;
}

int jsapi_can_start_smp(ConnContext* ctx){
    if (ctx->smstate->nextExpected == OTRL_SMP_EXPECT1 ) return 1;
    return 0;
}
