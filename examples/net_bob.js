var net = require("net");
var otr = require("../src/otr.js");

var user = new otr.User(),
    account = user.account("net_bob", "tcp"),
    contact = account.contact("alice");

console.log("Generating a Key...");
account.generateKey();
account.generateInstag();

console.log("connecting...");

var conn = new net.Socket();
var session = contact.openSession();

session.on("inject_message", function (fragment) {
    try {
        conn.write(fragment);
    } catch (e) {}
});

session.on("gone_secure", function () {
    console.log("gone secure");
    session.send("Hello, World!");
});

session.on("plaintext", function () {
    console.log("back to plaintext");
    conn.end();
});

session.on("message", function (message, private) {
    console.log("We got a message:", message);
    console.log("Message was encrypted?:", private);
    session.end();
});

conn.on("data", function (data) {
    session.recv(data);
});

conn.connect(8123, function () {
    console.log("starting otr");
    session.start();
});
