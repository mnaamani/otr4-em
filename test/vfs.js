var otr = require("../lib/otr-module");

var print = console.error;

print("libotr version:",otr.version());

var settings = {
    'key_file':'alice.keys',
    'accountname':'alice@telechat.org',
    'protocol':'telechat',
    'vfs_path':__dirname+'/alice.vfs'
}

var VFS = otr.VFS().load( settings.vfs_path );

test();

VFS.save( settings.vfs_path );
VFS.exportFile(settings.key_file,__dirname+"/exported-key-file");

function test(){
    var us = new otr.UserState();
    
    try{
        us.readKeysSync( settings.key_file);
    }catch(e){
        us.generateKey(settings.key_file,settings.accountname,settings.protocol,function(err){
          if(err) print("error generating key:",err);
        });
    }

    print(us.accounts());

    print(us.fingerprint(settings.accountname,settings.protocol));

    var ctx = new otr.ConnContext(us,settings.accountname,settings.protocol,"bob");

    print(ctx.fields());
}
