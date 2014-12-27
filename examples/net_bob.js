var net = require("net");
var otr = require("../src/otr.js");

var user = new otr.User(),
    account = user.account("net_bob", "tcp"),
    contact = account.contact("alice"),
    session = contact.openSession();

console.log("Generating a Key...");
account.generateKey();
account.generateInstag();

console.log("connecting...");

var conn = net.connect(8123, function () {

    session.on("inject_message", function (fragment) {
        if (conn) {
            try {
                conn.write(fragment);
            } catch (e) {}
        }
    });

    conn.on("data", function (data) {
        session.recv(data);
    });

    session.on("remote_disconnected", function () {
        console.log("remote_disconnected");
        conn.end();
    });

    session.on("message", function (message, private) {
        console.log("We got a message:", message);
        console.log("Message was encrypted?:", private);
        session.end();
    });

    session.start();
});

session.on("gone_secure", function () {
    console.log("gone secure");
    session.send("Hello, World!");
});
