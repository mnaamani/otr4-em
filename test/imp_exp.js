var otr = require("../lib/otr-module");

var print = console.error;

print("libotr version:",otr.version());

var VFS_PATH = __dirname+"/test.vfs";

var settings_a = {
    'key_file':'alice.keys',
    'fp_file': 'alice.fp',
}
var settings_b = {
    'key_file':'bob.keys',
    'fp_file': 'bob.fp',
}

var VFS = otr.VFS().load( VFS_PATH );

test();

VFS.save( VFS_PATH );
VFS.exportFile(settings_a.key_file, __dirname+"/"+settings_a.key_file);
VFS.exportFile(settings_b.key_file, __dirname+"/"+settings_b.key_file);

function test(){
    var ALICE = new otr.User({
        name: 'Alice',
        keys: settings_a.key_file,
        fingerprints: settings_a.fp_file,
        instags: './tags'
    });

    var BOB = new otr.User({
        name: 'Bob',
        keys: settings_b.key_file,
        fingerprints: settings_b.fp_file,
        instags: './tags'
    });

    var testkey;

    ALICE.generateKey("alice@export.test","test",function(err,key){
        if(err) exit("key generation failed");
        testkey = key;
    });     
    print(ALICE.accounts());

    print( testkey.export() );

    BOB.importKey("bob@import.test","test",testkey.export("BIGINT"));

    print(BOB.accounts());
}

function exit(msg){
    print(msg);
    process.exit();
}
