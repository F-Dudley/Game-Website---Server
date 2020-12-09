import * as THREE from "../../libs/three.module.js"
import { EffectComposer } from "../../libs/postprocessing/EffectComposer.js";
import { RenderPass } from "../../libs/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "../../libs/postprocessing/UnrealBloomPass.js";

import { GameScene } from "./GameScene.js";

// Post Processing Variables
let composer, renderPass, unrealBloomPass;
const bloomParameters = {
    exposure: 0.5,
    strength: 0.35,
    bloomThreshold: 0,
    bloomRadius: 0
}

//Main Scene Variables
let scene, camera, renderer;
let testEnemyMesh;
let raycastPlane;

// Mouse Variables
let raycaster = new THREE.Raycaster();
let mousePos = new THREE.Vector2(0,0);
let rect;
const keys = {
    "forward":false,
    "left":false,
    "right":false,
    "back":false,
    "shoot":false
}

// Player Variables
let playerMesh, gunArmMesh, gunMesh;
const playerRaycaster = new THREE.Raycaster(gunMesh, new THREE.Vector3(0, 0, -1), 0, 7.5);
let shootPos = new THREE.Vector3();
const playerRotationSpeed = 0.05;
const playerMovementSpeed = 0.05;

// Collisions
const collision = {
    "forward":false,
    "left": false,
    "right": false,
    "back": false
}
let collideableMesh = [];

// Player Attributes
let playerHealth = 100, score = 0;
let shootCooldown = true;

let playerHealthUI, scoreUI;

class TankGame extends GameScene{

    constructor(_requestedMap){
        super();
    }

    getUI = () =>{
        playerHealthUI = document.getElementById("labelHealthUI");
        scoreUI = document.getElementById("labelScoreUI");        
    }

    init = () =>{
        super.init();      
        let canvasContainer = document.querySelector('#canvasContainer');
        this.getUI();
        scene = new THREE.Scene();
    
        //Creating a Camera
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
        camera.position.set(0, 10, 0);
        camera.lookAt(scene.position);
    
        //Creating the Renderer and Applying correct size.
        renderer = new THREE.WebGLRenderer({antialias:true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
    
        canvasContainer.appendChild(renderer.domElement);
    
        rect = renderer.domElement.getBoundingClientRect();
    
        //Creating Light(s)
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        scene.add(ambientLight);
    
        playerMesh = this.TempPlayer();
        playerMesh.position.y = 0.3;
        gunArmMesh = playerMesh.children[0];
        gunMesh = gunArmMesh.children[0];
        scene.add(playerMesh);
    
        let planeGeo = new THREE.PlaneGeometry(30,30,1,1);
        let planeMat = new THREE.MeshBasicMaterial({color: "black"});
        raycastPlane = new THREE.Mesh(planeGeo, planeMat);
        raycastPlane.rotation.x = -0.5*Math.PI;
        collideableMesh.push(raycastPlane);
        scene.add(raycastPlane);
        this.TempWalls();
    
        let testEnemyGeo = new THREE.CubeGeometry(1,1,1);
        let testEnemyMat = new THREE.MeshBasicMaterial( {color: 0x202020} );
        let testEnemyWire = new THREE.MeshBasicMaterial( {color: "red", wireframe: true})
        testEnemyMesh = new THREE.Mesh(testEnemyGeo, testEnemyMat);
        testEnemyMesh.name = "enemy";
        let testEnemyMeshWire = new THREE.Mesh(testEnemyGeo, testEnemyWire);
        testEnemyMeshWire.name = "enemy";
        testEnemyMesh.add(testEnemyMeshWire);
        testEnemyMesh.position.set(4,.5,4);
        collideableMesh.push(testEnemyMesh);
        scene.add(testEnemyMesh);
        //enemies.push(testEnemyMesh);
    
        //DEBUG STUFF REMOVE LATER
        let grid = new THREE.GridHelper(20,20, "green", "green");
        scene.add(grid);
        
        // Post Processing
        renderPass = new RenderPass(scene, camera);
        unrealBloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), bloomParameters.strength, bloomParameters.bloomRadius, bloomParameters.bloomThreshold);

        composer = new EffectComposer( renderer );
        composer.addPass(renderPass);
        composer.addPass(unrealBloomPass);
    }

    enableEvents = () =>{
        window.addEventListener("resize", () =>{
            if(camera != null){
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();        
            }
            if(renderer != null){
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setPixelRatio(window.devicePixelRatio);
                rect = renderer.domElement.getBoundingClientRect();        
            }
            if(unrealBloomPass != null){
                unrealBloomPass.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
            }
        });

    //                                                  Required Mouse Movement Listener
        window.addEventListener("mousemove", e =>{
            mousePos.x =   (( e.clientX - rect.left ) / ( rect.width - rect.left )) * 2 - 1;
            mousePos.y = - (( e.clientY - rect.top ) / ( rect.bottom - rect.top)) * 2 + 1;
        });

    //                                                  Required Key Up and Down Listeners
        window.addEventListener("keydown", e =>{
            switch (e.key) {
                case "w" : case "ArrowUp":
                    keys.forward = true;
                    break;
                case "s" : case "ArrowDown":
                    keys.back = true;
                    break;
                case "a" : case "ArrowLeft":
                    keys.left = true;
                    break;
                case "d" : case "ArrowRight":
                    keys.right = true;
                    break;
                case " ": // Spacebar
                    keys.shoot=true
                    break;
                case "Escape":
                    console.log("Escape Down");
                    break;
            }
        });
        window.addEventListener("keyup", e =>{
            switch (e.key) {
                case "w" : case "ArrowUp":
                    keys.forward = false;
                    break;
                case "s" : case "ArrowDown":
                    keys.back = false;
                    break;
                case "a" : case "ArrowLeft":
                    keys.left = false;
                    break;
                case "d" : case "ArrowRight":
                    keys.right = false;
                    break;
                case " ": // Spacebar
                    keys.shoot=false
                    break;
                    keys.space = false;
                    break;
            }
        });

        window.addEventListener("mousedown", e =>{
            switch (e.button) {
                case 0: // Left Click -- (IE8-- = 1)
                    keys.shoot = true;
                    break;
                case 1: // Middle Click -- (IE8-- = 4)
                    break;
                case 2: // Right Click -- (IE8-- = 2)
                    console.log("Right Click Pressed");
                    break;
                default:
                    break;
            }
        });
        window.addEventListener("mouseup", e =>{
            switch(e.button){
                case 0:
                    keys.shoot = false;
                    break;
                case 1:
                    break;
                case 2:
                    break;
                default:
                    break;
            }
        });
    }

    animate = () =>{
        requestAnimationFrame(this.animate);
        super.animate();

        // Key Input
        if(keys.forward && !collision.forward){
            // base.position.z += .1; - Global Translation
            playerMesh.translateZ(playerMovementSpeed);
            collision.back = false;

            if(this.checkCollision( playerMesh ) > 0){
                collision.forward = true;
            }
            else{
                this.resetCollisions();
            }
        }

        if(keys.back && !collision.back){
            // base.position.z -= .1; - Gloabal Translation
            playerMesh.translateZ(-playerMovementSpeed);
            collision.forward = false;

            if(this.checkCollision( playerMesh ) > 0){
                collision.back = true;
            }
            else{
                this.resetCollisions();
            }
        }

        if(keys.left){
            playerMesh.rotation.y += playerRotationSpeed;
            collision.right = false;

            if(this.checkCollision( playerMesh ) == 0){
                this.resetCollisions();
            }
        }

        if(keys.right){
            playerMesh.rotation.y -= playerRotationSpeed;
            collision.left = false;
            if(this.checkCollision( playerMesh ) == 0){
                this.resetCollisions();
            }
        }
        console.log(playerMesh.rotation.y.toString());
        // this.checkCollision( playerMesh );

        // Mouse Raycasting -- Make Turret Face Mouse Pos
        raycaster.setFromCamera(mousePos, camera);
        let intersects = raycaster.intersectObjects(collideableMesh);
        if(intersects.length > 0){
            shootPos = new THREE.Vector3(intersects[0].point.x, 0.5, intersects[0].point.z);          
            gunArmMesh.lookAt(shootPos);
    
            if(keys.shoot && shootCooldown){
                shootCooldown = false;            
                this.playerShoot(shootPos);
                setTimeout(()=>{ shootCooldown = true}, 600);
            }    
        }
        
        camera.position.z = playerMesh.position.z;

        camera.lookAt(playerMesh.position);
        testEnemyMesh.lookAt(playerMesh.position);
    
        scoreUI.innerHTML = "Score: " + score;
        playerHealthUI.innerHTML = "Health: " + playerHealth;
    
        composer.render();
    }

    // Other Functions

    TempWalls = () =>{
        let wallPos = 10;
        let wallPosY = 0.25;

        let boxGeo = new THREE.BoxGeometry(20,1,1);
        let boxMaterial = new THREE.MeshBasicMaterial({color: 0x202020});
        let boxMaterialWire = new THREE.MeshBasicMaterial({color: 0x008000, wireframe: true});

        //Forward Wall Box
        let boxMesh_f = new THREE.Mesh(boxGeo, boxMaterial);
        let boxMeshWire_f = new THREE.Mesh(boxGeo, boxMaterialWire);
        boxMesh_f.add(boxMeshWire_f);

        // Backward Wall Box
        let boxMesh_b = new THREE.Mesh(boxGeo, boxMaterial);
        let boxMeshWire_b = new THREE.Mesh(boxGeo, boxMaterialWire);
        boxMesh_b.add(boxMeshWire_b);
        
        // Left Wall Box
        let boxMesh_l = new THREE.Mesh(boxGeo, boxMaterial);
        let boxMeshWire_l = new THREE.Mesh(boxGeo, boxMaterialWire);
        boxMesh_l.add(boxMeshWire_l);

        //Right Wall Box
        let boxMesh_r = new THREE.Mesh(boxGeo, boxMaterial);
        let boxMeshWire_r = new THREE.Mesh(boxGeo, boxMaterialWire);
        boxMesh_r.add(boxMeshWire_r);

        boxMesh_f.position.y = wallPosY;
        boxMesh_b.position.y = wallPosY;
        boxMesh_l.position.y = wallPosY;
        boxMesh_r.position.y = wallPosY;
        
        boxMesh_f.position.z = wallPos;
        boxMesh_b.position.z = -wallPos;
        boxMesh_l.position.x = wallPos;
        boxMesh_r.position.x = -wallPos;

        boxMesh_l.rotation.y = 1.6;
        boxMesh_r.rotation.y = 1.6;

        collideableMesh.push(boxMesh_f, boxMesh_b, boxMesh_l, boxMesh_r);
        scene.add(boxMesh_f, boxMesh_b, boxMesh_l, boxMesh_r);
    }

    playerShoot = _hitPos =>{
        console.log("Shooting");
    }

    checkCollision = _colObject =>{
        let colNum_ = 0;
        for(let vertexIndex = 0; vertexIndex < _colObject.geometry.vertices.length; vertexIndex++){

            let localVertex = _colObject.geometry.vertices[vertexIndex].clone();
            let globalVertex = localVertex.applyMatrix4( _colObject.matrix );
            let directionVector = globalVertex.sub( _colObject.position );

            let ray = new THREE.Raycaster( _colObject.position.clone(), directionVector.clone().normalize() );
            let colResults = ray.intersectObjects( collideableMesh );
            if(colResults.length > 0 && colResults[0].distance < directionVector.length() ){
                colNum_++;
            }
        }
        console.log("Number of Objects collided with: " + colNum_.toString());

        return colNum_;
    }

    resetCollisions = () =>{
        collision.forward = false;
        collision.back = false;   
        collision.left = false;             
        collision.right = false;
    }
}

export { TankGame };