It is highly reccommended that you open the project in a dev container as npm poses a severe security risk is installed unrestricted alongside the OS.

I used a VS Code Dev container and I reccommend you do too.

1. Install Docker on your computer  
2. Install the dev containers plug-in in VS code  
3. Click the open folder in dev container button under the dev container plug-in  
4. Select Node.js && JavaScript for the type, leave everything else as the defaults  
5. Wait for the folder to open and confirm that you trust it  
6. Install project dependencies  
	a. Open the terminal in VS code and run: `npm install`  
7. To start the project run in the terminal: `npm run dev`  
8. Ensure that the port 5173 is being correctly forwarded by clikcing the port forwarding button at the bottom of VS Code.  
9. To see the application in your browser visit: `http://localhost:5173`
