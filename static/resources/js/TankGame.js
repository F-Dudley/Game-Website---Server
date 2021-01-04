import * as THREE from "../../libs/three.module.js";
import { GLTFLoader } from "../../libs/GLTFLoader.js";
import { EffectComposer } from "../../libs/postprocessing/EffectComposer.js";
import { RenderPass } from "../../libs/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "../../libs/postprocessing/UnrealBloomPass.js";

import { GameData } from "./GameData.js";
import { UIManager } from "./UIManager.js";

// Post Processing Variables
let composer, renderPass, unrealBloomPass;
const bloomParameters = {
    exposure: 0.5,
    strength: 0.35,
    bloomThreshold: 0,
    bloomRadius: 0
}

//Main Scene Variables
let canvasContainer;
let scene, camera, renderer;
let raycastPlane;

let worldMaterial = new THREE.MeshBasicMaterial( {color: 0x202020} );
let raycastPlaneMat = new THREE.MeshBasicMaterial({color: "black"});
let floorBoxMaterial = new THREE.MeshBasicMaterial({color: 0x202020});
let floorBoxMaterialWire = new THREE.MeshBasicMaterial({color: 0x008000, wireframe: true});

const clock = new THREE.Clock();
const gltfloader = new GLTFLoader();

// Mouse Variables
let raycaster = new THREE.Raycaster();
let raycastHitLocation = new THREE.Vector3();
let mousePos = new THREE.Vector2(0,0);
let rect;
const keys = {
    "forward":false,
    "left":false,
    "right":false,
    "back":false,
    "shoot":false
}

// Sound Variables
let audioListener, audioLoader;
let sound_playerShoot, sound_explosion, sound_pickup;

// Player Variables
let playerMesh, gunArmMesh, gunMesh;
let playerWireMat = new THREE.MeshBasicMaterial({color: "blue", wireframe: true})
let playerHealth = 200, score = 0;
const playerRotationSpeed = 0.05;
const playerMovementSpeed = 0.05;
const playerFireRate = 600;

const bulletMovementSpeed = 0.2;
let playerShootCooldown = true;
let playerBulletFireLocation = new THREE.Object3D();

const collision = {
    "forward":false,
    "left": false,
    "right": false,
    "back": false
}

let playerHealthUI, scoreUI;

// Enemy Variables
let enemies = []

let enemyMesh;
let enemyWireMat = new THREE.MeshBasicMaterial( {color: "red", wireframe: true} );
let enemyShootCooldown = false, enemyShootCooldownActive = true;
const enemyFireRate = 700;
const enemyFireDistance = 15;

const spawnEnemyMin_X = -9, spawnEnemyMax_X = 9;
const spawnEnemyMin_Z = -9, spawnEnemyMax_Z = 9;

let explosionMesh;

// Healthpack Variables
let healthpackMesh;
let healthpackGeometry = new THREE.SphereGeometry( 0.3, 0.3, 0.3);
let healthpackWireMat = new THREE.MeshBasicMaterial({color: "yellow", wireframe: true})

const healthpackValue = 40;

// Bullet Variables
let bullets = [];
let bulletGeometry = new THREE.BoxGeometry(0.05,0.05,0.05);
let bulletMat = new THREE.MeshBasicMaterial({color: "yellow"});

// Collisions
let collideableMesh = [];


// Intervals
let interval_spawnEnemies, interval_spawnHealthPacks;

////

class TankGame {
    
    userid;
    animationframeid;

    constructor(_userid){
        this.userid = _userid;
        this.animationframeid = null;

        canvasContainer = document.querySelector('#canvasContainer');
    }

    init = async _userid =>{
        this.animationframeid = null;
        scene = new THREE.Scene();

        //Creating a Camera
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
        camera.position.y = 9;

        //Creating the Renderer and Applying correct size.
        renderer = new THREE.WebGLRenderer({antialias:true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
    
        if(canvasContainer.children.length == 0) canvasContainer.appendChild(renderer.domElement);
        rect = renderer.domElement.getBoundingClientRect();
    
        // Creating Light(s)
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        scene.add(ambientLight)

        // Load Audio Assets
        audioListener = new THREE.AudioListener();
        audioLoader = new THREE.AudioLoader();
        camera.add(audioListener);

        sound_playerShoot = document.getElementById("sound_playerShoot");
        sound_explosion = document.getElementById("sound_explosion");
        sound_pickup = document.getElementById("sound_pickup");

        // Create Player
        await this.BuildPlayer();

        // Create Spawnable Items
        await this.BuildSpawnables();

        // Create Enviroment
        await this.BuildEnviroment();

        //Set Enemies to Constantly Spawn
        interval_spawnEnemies = setInterval(() => {
            this.spawnEnemy(this.getRandomRange(spawnEnemyMin_X, spawnEnemyMax_X), 0.6, this.getRandomRange(spawnEnemyMin_Z, spawnEnemyMax_Z), true);
        }, 5000);   
        interval_spawnHealthPacks = setInterval(() => {
            this.spawnHealthpack(this.getRandomRange(spawnEnemyMin_X, spawnEnemyMax_X), 0.5, this.getRandomRange(spawnEnemyMin_Z, spawnEnemyMax_Z))
        }, 10000);

        // Post Processing
        renderPass = new RenderPass(scene, camera);
        unrealBloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), bloomParameters.strength, bloomParameters.bloomRadius, bloomParameters.bloomThreshold);

        composer = new EffectComposer( renderer );
        composer.addPass(renderPass);
        composer.addPass(unrealBloomPass);
    };

    enableEvents = async () =>{
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
    };

    animate = () =>{
        this.animationframeid = requestAnimationFrame(this.animate);

        // Key Input
        if(keys.forward && !collision.forward){
            playerMesh.translateZ(playerMovementSpeed);

            if(this.checkCollision( playerMesh ) > 0){
                collision.forward = true;
            }
            else{
                this.resetCollisions();
            }
        }
        if(keys.back && !collision.back){
            playerMesh.translateZ(-playerMovementSpeed);

            if(this.checkCollision( playerMesh ) > 0){
                collision.back = true;
            }
            else{
                this.resetCollisions();
            }
        }
        if(keys.left){
            playerMesh.rotation.y += playerRotationSpeed;

            if(this.checkCollision( playerMesh ) == 0){
                this.resetCollisions();
            }
        }
        if(keys.right){
            playerMesh.rotation.y -= playerRotationSpeed;
            if(this.checkCollision( playerMesh ) == 0){
                this.resetCollisions();
            }
        }

        // Bullets Movement and Collision
        for (let i = 0; i < bullets.length; i++) {
            bullets[i].translateZ(bulletMovementSpeed);
            this.bulletCollision(bullets[i])
        }

        // Enemies
        if(enemies.length > 0){
            for(let i = 0; i < enemies.length; i++){
                enemies[i].lookAt(playerMesh.position);

                if(enemyShootCooldown && enemies[i].position.distanceTo(playerMesh.position) < enemyFireDistance){
                    this.objShoot(enemies[i].children[0]);
                    enemyShootCooldownActive = true;
                }
            }
            if(enemyShootCooldownActive) {
                enemyShootCooldown = false;
                enemyShootCooldownActive = false;
                setTimeout(() => { enemyShootCooldown = true}, enemyFireRate);
            }
        }

        // Mouse Raycasting
        raycaster.setFromCamera(mousePos, camera);
        let intersects = raycaster.intersectObjects(collideableMesh);
        if(intersects.length > 0){
            raycastHitLocation = new THREE.Vector3(intersects[0].point.x, 0.5, intersects[0].point.z);          
            gunArmMesh.lookAt(raycastHitLocation);
    
            if(keys.shoot && playerShootCooldown){
                playerShootCooldown = false;            
                this.objShoot(playerBulletFireLocation);
                this.playSound(sound_playerShoot);
                setTimeout(()=>{ playerShootCooldown = true}, playerFireRate);
            }    
        }
        
        camera.position.z = playerMesh.position.z - 4;
        camera.position.x = playerMesh.position.x;
        
        camera.lookAt(playerMesh.position);
        
        if(playerHealth <= 0){
            cancelAnimationFrame(this.animationframeid);
            this.gameFinished();
        }
        else{
            UIManager.setGameValues(playerHealth, score);
        }    
    
        composer.render();
    };

    gameFinished = async () =>{
        canvasContainer.removeChild(renderer.domElement);

        interval_spawnEnemies = clearInterval(interval_spawnEnemies);
        interval_spawnHealthPacks = clearInterval(interval_spawnHealthPacks);

        UIManager.showMenuUI();

        let finishedText;
        if(this.userid != null){
            let userData = await GameData.getGameData(`checkscore-${this.userid}`);
            let userScore = userData[0].highscore;
            console.log(userScore);
            if(userScore < score){
                finishedText = "New Highscore Achieved: " + score;
                await GameData.editGameData(`changescore-${this.userid}/${score}`);
            }
        }else finishedText = "Score Achieved: " + score;
        alert(finishedText);
    }

    // Building Scene
    BuildPlayer = async () =>{
        let baseGeo = new THREE.BoxGeometry(1, 0.5, 1.5);
        let gunArmGeo = new THREE.BoxGeometry(0.2, .5, 0.3);
        let gunGeo = new THREE.BoxGeometry(0.1, 0.1, 1);
    
        playerMesh = new THREE.Mesh(baseGeo, worldMaterial);
        playerMesh.name = "player";
        let baseWire = new THREE.Mesh(baseGeo, playerWireMat);
    
        gunArmMesh = new THREE.Mesh(gunArmGeo, worldMaterial);
        gunArmMesh.name = "player";
        gunArmMesh.position.set( 0, 0.25, -0.3);
        let gunArmWire = new THREE.Mesh(gunArmGeo, playerWireMat);
    
        gunMesh = new THREE.Mesh(gunGeo, worldMaterial);
        gunMesh.name = "player";
        gunMesh.position.set( 0, 0.25, 0.3);
        let gunWire = new THREE.Mesh(gunGeo, playerWireMat);

        playerBulletFireLocation.position.z = 0.6;

        // Build Tank With Basic Meshes
        gunMesh.add(playerBulletFireLocation);
        gunArmMesh.add(gunMesh);
        playerMesh.add(gunArmMesh);
        // Add WireFrame On Object
        gunMesh.add(gunWire);
        gunArmMesh.add(gunArmWire);
        playerMesh.add(baseWire);

        // Position Correctly In Scene
        playerMesh.position.y = 0.3;
        playerMesh.position.z = -8;
 
        collideableMesh.push(playerMesh);
        scene.add(playerMesh);
    };

    BuildSpawnables = async () =>{
        // Enemy Mesh Building
        let enemyGeo = new THREE.CubeGeometry(0.75,0.75,0.75);
        let enemyTorusGeo = new THREE.TorusGeometry(0.3, 0.1, 4, 8);

        enemyMesh = new THREE.Mesh(enemyGeo, worldMaterial);
        let enemyBaseMeshWire = new THREE.Mesh(enemyGeo, enemyWireMat);        
        enemyMesh.name = "enemy";

        let enemyBulletFireLocation = new THREE.Object3D();
        enemyBulletFireLocation.position.z = 0.6;

        let enemyTorusMesh = new THREE.Mesh(enemyTorusGeo, worldMaterial);
        let enemyTorusWireMesh = new THREE.Mesh(enemyTorusGeo, enemyWireMat);
        enemyTorusMesh.add(enemyTorusWireMesh);
        enemyTorusMesh.position.z = 0.5;

        enemyMesh.add(enemyBulletFireLocation, enemyBaseMeshWire, enemyTorusMesh);

        // Health Pack Building
        healthpackMesh = new THREE.Mesh(healthpackGeometry, healthpackWireMat);
        healthpackMesh.name = "repair";

        let healthpackAnimObject = new THREE.Mesh(healthpackGeometry, healthpackWireMat);
        healthpackMesh.add(healthpackAnimObject);
    }

    BuildEnviroment = async () =>{
        let wallPos = 10.75;
        let wallPosY = 0.25;

        let boxGeo_topbottom = new THREE.BoxGeometry( 20, 1, 1);
        let boxGeo_sides = new THREE.BoxGeometry( 1, 1,20)
        let boxGeo_floor = new THREE.BoxGeometry(1, 0.1, 1);


        //Forward Wall Box
        let boxMesh_f = new THREE.Mesh(boxGeo_topbottom, floorBoxMaterial);
        let boxMeshWire_f = new THREE.Mesh(boxGeo_topbottom, floorBoxMaterialWire);
        boxMesh_f.add(boxMeshWire_f);

        // Backward Wall Box
        let boxMesh_b = new THREE.Mesh(boxGeo_topbottom, floorBoxMaterial);
        let boxMeshWire_b = new THREE.Mesh(boxGeo_topbottom, floorBoxMaterialWire);
        boxMesh_b.add(boxMeshWire_b);
        
        // Left Wall Box
        let boxMesh_l = new THREE.Mesh(boxGeo_sides, floorBoxMaterial);
        let boxMeshWire_l = new THREE.Mesh(boxGeo_sides, floorBoxMaterialWire);
        boxMesh_l.add(boxMeshWire_l);

        //Right Wall Box
        let boxMesh_r = new THREE.Mesh(boxGeo_sides, floorBoxMaterial);
        let boxMeshWire_r = new THREE.Mesh(boxGeo_sides, floorBoxMaterialWire);
        boxMesh_r.add(boxMeshWire_r);

        // Floor
        for(let i = -10; i < 10; i++) {
            for(let j = -10; j < 10; j++){
                let floorCube = new THREE.Mesh(boxGeo_floor, floorBoxMaterialWire);
                floorCube.position.set(i + 0.5, 0 , j + 0.5);

                scene.add(floorCube);
            }    
        }

        let planeGeo = new THREE.PlaneGeometry(30,30,1,1);

        raycastPlane = new THREE.Mesh(planeGeo, raycastPlaneMat);

        // Wall Positions
        boxMesh_f.position.y = wallPosY;
        boxMesh_b.position.y = wallPosY;
        boxMesh_l.position.y = wallPosY;
        boxMesh_r.position.y = wallPosY;
        
        boxMesh_f.position.z = wallPos;
        boxMesh_b.position.z = -wallPos;
        boxMesh_l.position.x = wallPos;
        boxMesh_r.position.x = -wallPos;

        // Floor Positions
        raycastPlane.rotation.x = -0.5*Math.PI;

        // Corner Turrets
        let midToCorner = wallPos - 0.5, turretHeight = 1;
        this.spawnEnemy(midToCorner, turretHeight, midToCorner, false);
        this.spawnEnemy(-midToCorner, turretHeight, -midToCorner, false);
        this.spawnEnemy(-midToCorner, turretHeight, midToCorner, false);
        this.spawnEnemy(midToCorner, turretHeight, -midToCorner, false);

        collideableMesh.push(boxMesh_f, boxMesh_b, boxMesh_l, boxMesh_r, raycastPlane);
        scene.add(boxMesh_f, boxMesh_b, boxMesh_l, boxMesh_r, raycastPlane);
    };

    // Utility
    spawnEnemy = (_x, _y, _z, _killAble) => {
        let instance = enemyMesh.clone();
        instance.position.set(_x, _y, _z);

        if(_killAble){
            collideableMesh.push(instance);

            //Animate Using TweenJS
            let instance_posY = instance.position.y;
            createjs.Tween.get(instance.position, {loop: true}).to({y: instance_posY + 0.2}, 600, createjs.Ease.quadInOut).to({y: instance_posY}, 600, createjs.Ease.quadInOut);            
        }
        else{
            instance.children[1].material = new THREE.MeshBasicMaterial({color: 0x008000, wireframe: true});
            instance.children[2].children[0].material = new THREE.MeshBasicMaterial({color: 0x008000, wireframe: true});
        }

        createjs.Tween.get(instance.children[2].rotation, {loop: true}).to({z: Math.PI*2}, 5000, createjs.Ease.linear);

        enemies.push(instance);
        scene.add(instance);
    }

    spawnHealthpack = (_x, _y, _z) => {
        let instance = healthpackMesh.clone();
        instance.position.set(_x, _y, _z);

        let instance_scaleX = instance.scale.x, instance_scaleZ = instance.scale.z;
        let scaleStrengh = 0.5, scaleSpeed = 1000;

        createjs.Tween.get(instance.rotation, {loop: true}).to({y: Math.PI * 2}, 2000, createjs.Ease.linear);
        createjs.Tween.get(instance.children[0].scale, {loop: true}).to({x: instance_scaleX + scaleStrengh, z: instance_scaleZ + scaleStrengh}, scaleSpeed).to({x: instance_scaleX, z: instance_scaleZ}, 400);

        collideableMesh.push(instance);
        scene.add(instance);
    }

    spawnExplosion = (_x, _y, _z) => {
        
    }

    objShoot = _fireLocation =>{
        let instance_mat = new THREE.MeshBasicMaterial().copy(bulletMat);
        let bullet = new THREE.Mesh(bulletGeometry, instance_mat);
        
        bullet.position.copy(_fireLocation.getWorldPosition(new THREE.Vector3()));
        bullet.quaternion.copy(_fireLocation.getWorldQuaternion(new THREE.Quaternion()));
        
        bullet.material.opacity = 1;

        scene.add(bullet);
        bullets.push(bullet);
    };

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

        return colNum_;
    };

    bulletCollision = (_bullet) => {
        let collided = false;
        
        for(let vertexIndex = 0; vertexIndex < _bullet.geometry.vertices.length; vertexIndex++){

            let localVertex = _bullet.geometry.vertices[vertexIndex].clone();
            let globalVertex = localVertex.applyMatrix4( _bullet.matrix );
            let directionVector = globalVertex.sub( _bullet.position );

            let ray = new THREE.Raycaster( _bullet.position.clone(), directionVector.clone().normalize() );
            let colResults = ray.intersectObjects( collideableMesh );
            if(colResults.length > 0 && colResults[0].distance < directionVector.length() ){
                collided = true;

                let objName = colResults[0].object.name;
                switch (objName) {
                    case "enemy":
                        score += 10;
                        
                        scene.remove(colResults[0].object);
                        enemies.splice(enemies.indexOf(colResults[0].object), 1);
                        collideableMesh.splice(collideableMesh.indexOf(colResults[0].object), 1);
                        this.playSound(sound_explosion);
                        break;

                    case "player":
                        playerHealth -= 1;
                        break;
                    
                    case "repair":
                        playerHealth += healthpackValue;
                        collideableMesh.splice(collideableMesh.indexOf(colResults[0].object), 1);
                        scene.remove(colResults[0].object);
                        this.playSound(sound_pickup);
                        break;

                    default:
                        break;
                }
            }
        }

        if(_bullet.position.distanceTo(scene.position) > 20 || collided){
            scene.remove(_bullet);
            bullets.splice(bullets.indexOf(_bullet), 1);
        }
    }

    resetCollisions = () =>{
        collision.forward = false;
        collision.back = false;   
        collision.left = false;             
        collision.right = false;
    };
    
    playSound = _soundVariable =>{
        _soundVariable.currentTime = 0;
        _soundVariable.play();
    }

    loadSound = ( _objectToApplyAudiodata, _soundDirectory, _volume) =>{
        audioLoader.load("../sounds/" + _soundDirectory, 
            buffer => {
                _objectToApplyAudiodata.setBuffer(buffer);
                _objectToApplyAudiodata.setLoop(false);
                _objectToApplyAudiodata.setVolume(_volume);
                _objectToApplyAudiodata.repeat = false;
            },
            xhr => {
                console.log(audioLoader.path + _soundDirectory +"\n" + (xhr.loaded / xhr.total * 100) + "% loaded");
            },
            error => {
                console.log(`Error Loading From ${_directory}\nMessage: ${error}`);
            });
    }

    getRandomRange = (_min, _max) => {
        return Math.floor(Math.random() * (_max- _min + 1)) + _min;
    }
}

export { TankGame };