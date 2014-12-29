var net = require("net");
var otr = require("../src/otr.js");

var user = new otr.User(),
    account = user.account("net_alice", "tcp"),
    contact = account.contact("bob");

var server = net.createServer(function (conn) {
    conn.pause(); //allow time to setup all event handlers

    var session = contact.openSession();

    session.online = function () {
        console.log("checking if contact is online..");
        if (conn && conn.remotePort) {
            return true;
        }
        return false;
    };

    session.on("disconnect", function () {
        console.log("remote side ended secure session.");
        session.end(); //return to plain text
        //conn.end();
    });

    session.on("new_fingerprint", function (fingerprint) {
        console.log("contact's fingerprint:", fingerprint);
    });

    session.on("write_fingerprints", function () {
        console.log("got write_fingerprints event");
    });
    session.on("gone_secure", function () {
        console.log("got gone_secure event");
    });

    session.on("message", function (message, private) {
        console.log("We got a message:", message);
        console.log("Message was encrypted?:", private);
        session.send(message); //echo back message.
    });

    session.on("inject_message", function (fragment) {
        try {
            conn.write(fragment);
        } catch (e) {}
    });

    conn.on("end", function () {
        console.log("closing connection");
        session.destroy();
    });

    conn.on("data", function (data) {
        session.recv(data);
    });

    conn.resume(); //start emitting data events
});


console.log("Generating a Key...");
account.generateInstag();
account.generateKey(function () {
    server.listen(
        8123,
        function () {
            console.log("listening on port:", server.address().port);
        }
    );
});
