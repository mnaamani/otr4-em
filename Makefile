EMCC = $(HOME)/Dev/emscripten/emcc
CRYPTO_BUILD = $(HOME)/projects/crypto-emscripten/build-otr3

BUILD_DIR = lib

EXPORTED_FUNCS= -s EXPORTED_FUNCTIONS="['_gcry_strerror','_malloc','_free','__gcry_mpi_new','__gcry_mpi_set','__gcry_mpi_release', \
            '__gcry_mpi_scan','__gcry_mpi_print','_otrl_version','_otrl_userstate_create','_otrl_userstate_destroy', \
            '_otrl_privkey_read','_otrl_privkey_fingerprint','_otrl_privkey_read_fingerprints','_otrl_privkey_write_fingerprints', \
            '_otrl_privkey_generate', '_otrl_context_find', '_otrl_message_sending', '_otrl_message_free', '_otrl_message_fragment_and_send', \
            '_otrl_message_disconnect', '_otrl_message_initiate_smp_q', '_otrl_message_initiate_smp', '_otrl_message_respond_smp', \
            '_jsapi_message_receiving', '_jsapi_can_start_smp','_jsapi_privkey_get_next','_jsapi_privkey_get_accountname', \
            '_jsapi_privkey_get_protocol', '_jsapi_userstate_get_privkey_root', '_jsapi_conncontext_get_protocol', \
            '_jsapi_conncontext_get_username', '_jsapi_conncontext_get_accountname','_jsapi_conncontext_get_msgstate', \
            '_jsapi_conncontext_get_protocol_version', '_jsapi_conncontext_get_smstate', '_jsapi_conncontext_get_active_fingerprint', \
            '_jsapi_conncontext_get_trust', '_jsapi_initialise','_jsapi_messageappops_new']"

OPTIMISATION_OFF= -O0 --closure 0 --llvm-opts 0 --minify 0 -s LINKABLE=1
OPTIMISATION_ON= -O2 --closure 1 --llvm-opts 0 --minify 0 -s LINKABLE=1 $(EXPORTED_FUNCS)

OPTIMISATION= $(OPTIMISATION_OFF)

module:
	mkdir -p $(BUILD_DIR)/
	$(EMCC) src/jsapi.c -I$(CRYPTO_BUILD)/include -lgcrypt -lotr -lgpg-error -L$(CRYPTO_BUILD)/lib \
        -o $(BUILD_DIR)/libotr3.js \
		--pre-js src/otr_pre.js \
        --post-js src/otr_post.js \
		-s TOTAL_MEMORY=1048576  -s TOTAL_STACK=409600 \
        $(OPTIMISATION)

module-optimised:
	mkdir -p $(BUILD_DIR)/
	cp src/otr_post.js $(BUILD_DIR)/libotr3.js
	$(EMCC) src/jsapi.c -I$(CRYPTO_BUILD)/include -lgcrypt -lotr -lgpg-error -L$(CRYPTO_BUILD)/lib \
        -o $(BUILD_DIR)/_libotr3.js \
		--pre-js src/otr_pre.js \
		-s TOTAL_MEMORY=1048576  -s TOTAL_STACK=409600 \
        $(OPTIMISATION_ON)
	cat $(BUILD_DIR)/_libotr3.js >> $(BUILD_DIR)/libotr3.js
	rm $(BUILD_DIR)/_libotr3.js
