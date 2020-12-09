**** Code Content Description ****

** File Structure 

- node_modules: contains all the modules needed for the Node.js Server.

- secure: all the private files for the server, data and etc.
    - data: contains all the private json files that are needed.
        - //

- static: Contains all the Static Files for the server.
    - libs: Contains all the needed Javascript libraries.
        - cannon.js
        - GLTFLoader.js
        - three.module.js

    - resources: Contains all the assets for the static html pages.
        - css: contains all the css files.
        - images: contains all the image files.
        - js: contains all the Javascript files.
        - models: contains all the GLTF Models.
        - sounds: contains all the sound files.

    - 404page.html: Contains the html for a 404 Error.

    - index.html: Contains the html for the main index page.

- index.js: The Javascript file that runs all the logic for the Node.js Server.

- package-lock.json: Contains all the Specifications for certain parts of the Node Server.

- package.json: Contains all the basic specifications for the Node Server, for when it runs.

- readme.txt: this readme File.

** References

- https://threejs.org/docs/#api/en/cameras/PerspectiveCamera - Camera Methods, *mainly UpdateProjectionMatrix*.
- https://stackoverflow.com/questions/24035234/three-js-raycast-off-from-mouse-position - Mouse Movement.
- https://www.w3schools.com/jsref/obj_mouseevent.asp - Mouse Events
- https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key - Keyboard Event.
- https://stackoverflow.com/questions/42958252/how-do-i-move-a-three-js-cube-with-keyboard-input - Keyboard Input Help, using different Event.
- https://www.w3schools.com/js/js_htmldom_eventlistener.asp - Event Listeners
- https://keycode.info/ - Keyboard Input Keycode Helper