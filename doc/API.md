#### OTR4-em - Off-the-Record Messaging [emscripten]

For now the API is similar to otr3-em and otr3 modules.. 
work in progress to expose all new functionality of libotr4.

The module exports the following functions:

* version()
* POLICY()

[high-level API]
* User()
* OTRChannel() : [EventEmitter]

[lower-level API]
* UserState()
* ConnContext()
* MessageAppOps()

## version()
The version() function will return the version of the native libotr.so loaded by nodejs.

    var libotr_version = require("otr4-em").version();

## POLICY(name)
The policy is used as a parameter in OTRChannel.

	var libotr = require("otr4-em");
	var policy = libotr.POLICY("DEFAULT");

	//available policies
    'NEVER'
    'ALLOW_V1'
    'ALLOW_V2'
    'ALLOW_V3'
    'REQUIRE_ENCRYPTION'
    'SEND_WHITESPACE_TAG'
    'WHITESPACE_START_AKE'
    'ERROR_START_AKE'
	'VERSION_MASK'
	'OPPORTUNISTIC'
	'MANUAL'
	'ALWAYS'
	'DEFAULT'
    
## User()
The User object is a wrapper for UserState (see below). It holds a user's configuration [name, keys, fingerprints] 

    var libotr = require("otr4-em");
    var alice = new libotr.User({
        name:'Alice',			      //an identifier for the User object
        keys:'../home/alice/alice.keys',      //path to OTR keys file (required)
        fingerprints:'../home/alice/alice.fp' //path to fingerprints file (required)
    });

If files exists the keys and fingerprints will be loaded into the userstate automatically.
A warning will be displayed otherwise.

If you need to generate a new OTR key for a given accountname and protocol: 

    alice.generateKey("alice@jabber.org", "xmpp", function(err){
        //callback function
        //if error occured err will be the text representation of gcrypt error number.
        //otherwise err will be 'null'
    });

To directly access the wrapped UserState object:

    var userstate = alice.state;
    userstate.accounts().forEach(function(account){
        console.log(account.fingerprint);
    });

## UserState()
The UserState holds keys and fingerprints in memory. It exposes methods to read/write these keys
and fingerprints to the file system, as well as methods to generate them.
	
	var libotr = require("otr4-em");
	var userstate = new libotr.UserState();


### userstate.generateKey(path_to_keys_file, accountname, protocol, [callback])
generateKey() will asynchronously generate a new OTR key for provided accountname/protocol (overwriting existing key).
The newly generated key will be stored stored in the userstate. When the process is complete the 
userstate/keys are written out to file.

	userstate.generateKey('/home/alice/myotr.keys', 'alice@jabber.org','xmpp',function(err){
		//call back with err if any
		if(err){
			//oops something went wrong.
			console.log(err);
		}
	});

### userstate.fingerprint(accountname,protocol)
Returns the fingerprint of the key associated with accountname and protocol of the form:

	'65D366AF CF9B065F 41708CB0 1DC26F61 D3DF5935'

### userstate.accounts()
Returns an array of account objects:

	[ { accountname: 'alice@jabber.org',
	    protocol: 'xmpp',
	    fingerprint: '65D366AF CF9B065F 41708CB0 1DC26F61 D3DF5935' } ]

### userstate.readKeysSync(path_to_keys_file)
Synchronously reads the stored keys into the userstate.

### userstate.readFingerprintsSync(path_to_fingerprints_file)
Synchronously reads the stored fingerprints into the userstate.

### userstate.writeFingerprintsSync(path_to_fingerprints_file)
Synchronously writes out the fingerprints in userstate to file.

(Async versions.. Not Recommended to Use..)
### userstate.readKeys(path_to_keys_file, [callback])
Asynchronously reads the stored keys into the userstate.

### userstate.readFingerprints(path_to_fingerprints_file, [callback])
Asynchronously reads the stored fingerprints into the userstate.

### userstate.writeFingerprints(path_to_fingerprints_file, [callback])
Asynchronously writes out the fingerprints in userstate to file.

## ConnContext
A ConnContext with a recipient 'BOB' for a given UserState (userstate) can be created as follows:

    var ctx = new libotr.ConnContext(userstate, "alice@jabber.org","xmpp","BOB" );

where the second and third arguments specifiy which OTR key to use. The last argument is
our selected name for the recipient Bob;

Or from a User object (alice):

    var ctx = alice.ConnContext("alice@jabber.org","xmpp","BOB");

The following properties of the ConnContext object are exposed (Read-Only):

* protocol: string: eg. "xmpp"
* username: string: name we have given to the recipient, "BOB"
* accountname: string: account name of the otr key, eg. "alice@jabber.org"
* fingerprint: string: active fingerprint - of recipient's key
* protocol_version: number: otr protocol version in use, eg. 2
* msgstate: number: 0 = plaintext, 1 = encrypted
* smstate: number: current state of the SMP (Socialist Millionaire's Protocol)
* trust: string: 'smp' if recipient's fingerprint has been verified by SMP.
* their_instance: instance tag of buddy
* our_instance: our instage tag  

## OTRChannel
OTRChannel creates a simple interface for exchanging messages with a recipient. As arguments
it takes a UserState,ConnContext,and a dictionary of parameters for the channel:

    var otrchannel = new libotr.OTRChannel(alice, BOB, {
        policy:libotr.POLICY("ALWAYS"), //optional policy - default = POLICY("DEFAULT")
        MTU:1450,          //optional - max fragment size in bytes - default = 1450
        secret:"SECRET",   //secret for SMP authentication.                           
        secrets:{'question-1':'secret-1',
                 'question-2':'secret-2'} //questions and answers also for SMP Authentication.
    });

### Methods:

### otrchan.connect()
connect() will initiate the otr protocol with remote side.
This can be used if we wish to initiate the protocol without sending an actual message.

### otrchan.send(message)
send() will fragment and send message.toString() to remote side.

### otrchan.recv(message)
call recv() when receiving message from remote side.

### otrchan.close()
close() will shutdown the otr channel.

### otrchan.start_smp([secret])
starts SMP authentication. If otional [secret] is not passed it is taken from the parameters.

### otrchan.start_smp_question(question,[secret])
start SMP authentication with a question and optional [secret]. If secret is not passed 
it is taken from the parameters of the otrchannel.

### otrchan.respond_smp([secret])
responds to SMP authentication request with optional [secret]. If secret is not passed 
it is taken from the parameters of the otrchannel.

### otrchan.isEncrypted()
returns 'true' only if current session is encrypted.

### otrchan.isAuthenticated()
return 'true' only if fingerprint of remote side has been authenticated/verified by SMP.

### Events

* message(msg) - msg from recipient to be displayed to the user.

* inject_message(msg_fragment) - msg_fragment to be sent down the communication channel to recipient.

* gone_secure() - message exchange is now encrypted.
* gone_insecure() - message exchange is now in plain text.
* still_secure() - encryption re-negotiated. message exchange is encrypted.

* create_privkey() - a private key for account/protocol specified was not found and needs to be created.
* create_instag() - an instance tag for account/protocol specified was not found and needs to be created.
* new_fingerprint(fingerprint) - first time we are seeing remote party's fingerprint. This is a que to begin authentication.

* smp_request(question) - remote party has started a SMP authentication. (possibly with a question)
* smp_complete() - indicates SMP authentication completed successfully.
* smp_failed() - SMP failed (usually remote party doesn't know the secret)
* smp_aborted() - SMP (something went wrong at the protocol level)
* smp_error() - same as smp_failed

* remote_disconnected() - remote side has closed() the channel
* update_context_list() - fired when context changes (inteded mostly for UI updates)
* shutdown() - channel was forcefully closed.
* msg_event - message event
