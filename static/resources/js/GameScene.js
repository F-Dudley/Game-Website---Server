import * as THREE from "../../libs/three.module.js"
import { GLTFLoader } from "../../libs/GLTFLoader.js";

class GameScene{
    constructor(){

    }

    init(){
        
    }

    animate(){

    }

    TempPlayer(){
        let materialBase = new THREE.MeshBasicMaterial( {color: 0x202020} );
        let materialWire = new THREE.MeshBasicMaterial( { color: 0x3035b3, wireframe: true, wireframeLinewidth: 5});
        // let materialGun = new THREE.MeshBasicMaterial({color: 0x3035b3});
    
        let baseGeo = new THREE.BoxGeometry(1, 0.5, 1.5);
        let gunArmGeo = new THREE.BoxGeometry(0.2, .5, 0.3);
        let gunGeo = new THREE.BoxGeometry(0.1, 0.1, 1);
    
        let base = new THREE.Mesh(baseGeo, materialBase);
        base.name = "Tank Base";
        let baseWire = new THREE.Mesh(baseGeo, materialWire);
    
        let gunArm = new THREE.Mesh(gunArmGeo, materialBase);
        gunArm.name = "Tank Gun Arm";
        gunArm.position.set( 0, 0.25, -0.3);
        let gunArmWire = new THREE.Mesh(gunArmGeo, materialWire);
    
        let gun = new THREE.Mesh(gunGeo, materialBase);
        gun.name = "Tank Gun";
        gun.position.set( 0, 0.25, 0.3);
        let gunWire = new THREE.Mesh(gunGeo, materialWire);
    
        gunArm.add(gun);
        base.add(gunArm);
    
        // Wireframe Adding - TEMP
        gun.add(gunWire);
        gunArm.add(gunArmWire);
        base.add(baseWire);
    
        return base;
    }

    loadGLTF = () =>{

    }
}

export { GameScene }