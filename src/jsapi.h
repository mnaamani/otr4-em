#include <gcrypt.h>
#include <libotr/proto.h>
#include <libotr/userstate.h>
#include <libotr/privkey.h>
#include <libotr/tlv.h>
#include <libotr/message.h>
#include <emscripten/emscripten.h>

void jsapi_initialise();
OtrlPrivKey* jsapi_userstate_get_privkey_root(OtrlUserState us);
OtrlPrivKey* jsapi_privkey_get_next(OtrlPrivKey* p);
char* jsapi_privkey_get_accountname(OtrlPrivKey* p);
char* jsapi_privkey_get_protocol(OtrlPrivKey* p);
char* jsapi_conncontext_get_protocol(ConnContext* ctx);
char* jsapi_conncontext_get_username(ConnContext* ctx);
char* jsapi_conncontext_get_accountname(ConnContext* ctx);
int jsapi_conncontext_get_msgstate(ConnContext* ctx);
int jsapi_conncontext_get_protocol_version(ConnContext* ctx);
int jsapi_conncontext_get_smstate(ConnContext* ctx);
void jsapi_conncontext_get_active_fingerprint(ConnContext* ctx, char* human);
char* jsapi_conncontext_get_trust(ConnContext* ctx);

OtrlPolicy msgops_callback_policy(void *opdata,ConnContext *context);

void msgops_callback_create_privkey(void *opdata, const char *accountname, 
        const char *protocol);

int msgops_callback_is_logged_in(void *opdata, const char *accountname, 
        const char *protocol, const char *recipient);

void msgops_callback_inject_message(void *opdata, const char *accountname,
        const char *protocol, const char *recipient, const char *message);

void msgops_callback_notify(void *opdata, OtrlNotifyLevel level,
        const char *accountname, const char *protocol,
        const char *username, const char *title,
        const char *primary, const char *secondary);

int msgops_callback_display_otr_message(void *opdata, const char *accountname,
        const char *protocol, const char *username, const char *msg);

void msgops_callback_update_context_list(void *opdata);

const char* msgops_callback_protocol_name(void *opdata, const char *protocol);

void msgops_callback_protocol_name_free(void *opdata, const char *protocol_name);

void msgops_callback_new_fingerprint(void *opdata, OtrlUserState us,
        const char *accountname, const char *protocol,
        const char *username, unsigned char fingerprint[20]);

void msgops_callback_write_fingerprints(void *opdata);
void msgops_callback_gone_secure(void *opdata, ConnContext *context);
void msgops_callback_gone_insecure(void *opdata, ConnContext *context);
void msgops_callback_still_secure(void *opdata, ConnContext *context, int is_reply);
void msgops_callback_log_message(void *opdata, const char *message);
int msgops_callback_max_message_size(void *opdata, ConnContext *context);
const char * msgops_callback_account_name(void *opdata, const char *account, const char *protocol);
void msgops_callback_account_name_free(void *opdata, const char *account_name);
OtrlMessageAppOps* jsapi_messageappops_new();

int jsapi_message_receiving (OtrlUserState userstate,OtrlMessageAppOps *messageops, void *opsdata, 
        char *accountname, char *protocol, char *sender, char *message, char** newmessage) EMSCRIPTEN_KEEPALIVE;

int jsapi_can_start_smp(ConnContext* ctx);
