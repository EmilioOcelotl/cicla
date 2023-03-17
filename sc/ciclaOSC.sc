// Mensajes OSC

m = NetAddr("localhost", 41234); // local machine
m.sendMsg("/switchHydra", 0);
m.sendMsg("/reset", 0);
m.sendMsg("/camX", rand2(10));
m.sendMsg("/camY", rand2(10));
m.sendMsg("/camZ", rand2(10));
