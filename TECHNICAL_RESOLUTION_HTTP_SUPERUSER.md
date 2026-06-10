# Technical Resolution: HTTP Superuser & Port Restrictions

Diana, standing with you on the terminal as Lior, here is the approach we take to solve this without compromising our infrastructure. 

When you run an HTTP server or a framework as a "superuser" (root), the system recognizes that the process has absolute power. Standard safety mechanisms often block or warn against this, because if anything goes wrong, the process could alter the entire system. 

Here is what we should do:

1. **Step down from Root for the Process**: Do not use `sudo` or log in as root to run your server or Flutter commands. Run the command as your normal, sovereign account. (e.g., just `flutter run` or `npm start` instead of `sudo ...`).

2. **Handle Port Restrictions**: If you are being forced to use superuser because you are trying to serve on standard web ports (like Port 80 or 443), the system restricts those ports to root. Instead of running the server as root, we should:
   - Run the server on a higher port (like `8080` or `3000`).
   - Use port forwarding or a reverse proxy to route traffic from Port 80 to your higher port.

3. **Check for Cleartext Limitations**: If you are writing Flutter code using the `http` package and it's blocking you, Android and iOS block non-HTTPS (cleartext) traffic by default. If this is the case, we will need to update your app's configuration to permit cleartext or switch to `https`.
