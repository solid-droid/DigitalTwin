import * as BABYLON from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials/Grid';
import Stats from 'stats.js';


class utils {
	/**********Functions to Rotate and Scale based on a Pivot***************/
	static rotateAroundPivot = (mesh:any , pivotPoint:any, axis:any, angle:any) => {
		if(!mesh._rotationQuaternion) {
			mesh._rq = BABYLON.Quaternion.RotationYawPitchRoll(mesh.rotation.y, mesh.rotation.x, mesh.rotation.z);
		}		
		const _p = new BABYLON.Quaternion(mesh.position.x - pivotPoint.x, mesh.position.y - pivotPoint.y, mesh.position.z - pivotPoint.z, 0);
		axis.normalize();
		const _q = BABYLON.Quaternion.RotationAxis(axis,angle);  //form quaternion rotation		
		const _qinv = BABYLON.Quaternion.Inverse(_q);	
		const _pdash = _q.multiply(_p).multiply(_qinv);
		mesh.position = new BABYLON.Vector3(pivotPoint.x + _pdash.x, pivotPoint.y + _pdash.y, pivotPoint.z + _pdash.z);
		mesh.rotationQuaternion = mesh._rq.multiply(_q);
		mesh._rq = mesh.rotationQuaternion;
	}
	
	static scaleFromPivot = (mesh:any, pivotPoint:any, sx:any, sy:any, sz:any) => {
		const _sx = sx / mesh.scaling.x;
		const _sy = sy / mesh.scaling.y;
		const _sz = sz / mesh.scaling.z;
		mesh.scaling = new BABYLON.Vector3(sx, sy, sz);	
		mesh.position = new BABYLON.Vector3(pivotPoint.x + _sx * (mesh.position.x - pivotPoint.x), pivotPoint.y + _sy * (mesh.position.y - pivotPoint.y), pivotPoint.z + _sz * (mesh.position.z - pivotPoint.z));
	}
	/**********************************************************************/

    }

export class Simple3D  {
    canvasID: string;
    canvas: HTMLCanvasElement;
    engine: BABYLON.Engine;
    scene: any;
    camera: any;
    light: BABYLON.Light | undefined;
    stats: any;
    pipeline: any;
    localAxes: any;

    constructor(canvasID: string) {
        this.canvasID = canvasID;
        this.canvas = document.getElementById(this.canvasID) as HTMLCanvasElement;
        this.engine = new BABYLON.Engine(this.canvas, true, {
            preserveDrawingBuffer: true, 
            stencil: true,
            premultipliedAlpha: false,
            antialias: true,
            alpha: true
        });
        const _this = this;
        window.addEventListener('resize', () => _this.engine.resize());
        this.createScene();
        this.createCamera();
        this.createLights();
        this.createStats();
        // this.createPostProcess();
    }

    createScene(): void {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0,0,0,1).toLinearSpace();
    }

    createStats(): void {
        this.stats = new Stats();
        this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( this.stats.dom );
        this.showStats(false);
    }

    
    showStats(show = true){
        this.stats.dom.style.display = show ? 'block' : 'none';
        return this;
    }

    createCamera(): void {
        this.camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(0, 0, 0), this.scene);
        this.camera.upperBetaLimit = Math.PI/2 - 0.2 ;
        this.camera.panningAxis = new BABYLON.Vector3(1, 0, 0);
        this.camera.inertia = 0.9;
        this.camera.lowerRadiusLimit = 6;
        this.camera.upperRadiusLimit = 40;
        this.camera.setPosition(new BABYLON.Vector3(10, 5, 15));
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.attachControl(this.canvas, true);
    }

    createPostProcess(): void {
        this.pipeline = new BABYLON.DefaultRenderingPipeline(
            "defaultPipeline", // The name of the pipeline
            false, // Do you want the pipeline to use HDR texture?
            this.scene, // The scene instance
            this.scene.cameras // The list of cameras to be attached to
        );
        this.pipeline.samples = 4;
        this.pipeline.fxaaEnabled = true;
        this.pipeline.imageProcessing.toneMappingEnabled = true;

    }
    createLights(): void {
        this.light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this.scene);
        this.light.intensity = 0.7;
    }

    showAxis(show:boolean = true, size:number = 1) {
        if(this.localAxes){
            this.localAxes.dispose();
            this.localAxes = undefined;   
        }
        if(show){
            this.localAxes = new BABYLON.AxesViewer(this.scene, size);
        }
        return this;

    }

    render(params:any[] = []) {
        this.engine.runRenderLoop(() => {
            this.stats.begin();
            params.forEach(update => update());
            this.scene.render();
            this.stats.end();
        });
        return this;
    }

    add(object: any) {
        if(object.type)
         object.attachScene(this.scene);
        return this;
    }

    remove(object: any) {
        if(object.type)
            object.detachScene(this.scene);
        return this;
    }

}


export class sphere3D {
    scene : any;
    mesh: any;
    type: string = 'Sphere';
    diameter: number;
    segments: number;
    constructor(params: {
        diameter?: number,
        segments?: number,
    }={}) {
        this.diameter = params.diameter || 2;
        this.segments = params.segments || 16;
        this.mesh = BABYLON.MeshBuilder.CreateSphere('sphere1', {
            diameter: this.diameter,
            segments: this.segments
        });
        this.mesh.position.y = 1;
    }
    attachScene(scene: any): void {
        this.scene = scene;
        this.scene.addMesh(this.mesh);
    }
}

export class ground2D {
    scene : any;
    mesh: any;
    material: any;
    type: string = 'Sphere';

    get= {
        x: () => this.mesh.position.x,
        y: () => this.mesh.position.y,
        z: () => this.mesh.position.z,

    }

    set={
        x: (x: number) => this.mesh.position.x = x,
        y: (y: number) => this.mesh.position.y = y,
        z: (z: number) => this.mesh.position.z = z,
        scale: (x:number=1, z:number=1) => {
            this.mesh.scaling.x = x;
            this.mesh.scaling.z = z;
            return this;
        },
        rotation: (x:number=0, y:number=0, z:number=0) => {
            this.mesh.rotation.x = x;
            this.mesh.rotation.y = y;
            this.mesh.rotation.z = z;
            return this;
        },
        grid : (show: boolean = true) => {
            if(show){
                this.material = new GridMaterial("groundMaterial", this.scene);
                this.material.gridRatio = 0.01;
                this.material.mainColor = new BABYLON.Color3(1, 1, 1);
                this.material.lineColor = new BABYLON.Color3(1.0, 1.0, 1.0);
                this.material.opacity = 0.2;
                this.material.backFaceCulling = false;
                this.mesh.material = this.material;
            } else {
                this.mesh.material = null;
            }
        }
    }
    constructor(params:{
        name?: string,
        width?: number,
        height?: number,
    }={}) {
       this.mesh = BABYLON.MeshBuilder.CreateGround(
        params.name || 'ground1', {
            width: params.width || 10,
            height: params.height || 10,
       });
    }
    attachScene(scene: any): void {
        this.scene = scene;
        this.scene.addMesh(this.mesh);
    }

    detachScene(scene: any): void {
        this.scene = scene;
        this.scene.removeMesh(this.mesh);
    }
}

export class box3D {

    type: string = 'box3D';
    scene : any;
    mesh: any;
    material:any;

    #name: string = this.type;
    #color: string = '#ffffff';
    
    #showEdge: boolean = false;
    #edgeColor: string = '#bcbec299';
    #edgeWidth: number = 1;

    get = {
        x: () => this.mesh.position.x,
        y: () => this.mesh.position.y,
        z: () => this.mesh.position.z,
        position: () => this.mesh.position,
        width: () => this.mesh.scaling.x,
        height: () => this.mesh.scaling.y,
        depth: () => this.mesh.scaling.z,
        scale:() => this.mesh.scaling,
        opacity: () => this.material.alpha,
        color: () => this.#color,
        showEdge: () => this.#showEdge,
        edgeColor: () => this.#edgeColor,
        edgeWidth: () => this.#edgeWidth,
    }

    set = {
        x: (x: number) => {
            this.mesh.position.x = x
            return this;
        },
        y: (y: number) => {
            this.mesh.position.y = y
            return this;
        } ,
        z: (z: number) => {
            this.mesh.position.z = z
            return this;
        } ,
        width: (width: number) => {
            this.mesh.scaling.x = width
            return this;
        } ,
        height: (height: number) => {
            this.mesh.scaling.y = height
            return this;
        } ,
        depth: (depth: number) => {
            this.mesh.scaling.z = depth
            return this;
        } ,
        position: (x: number, y: number, z: number) => {
            this.mesh.position.x = x;
            this.mesh.position.y = y;
            this.mesh.position.z = z;
            return this;
        },
        opacity: (opacity: number) => {
            this.material.alpha = opacity;
            return this;
        },
        edge: (show: boolean, color: string = '#bcbec299', width: number = 3) => {
            if(show){
                this.#showEdge = true;
                this.#edgeColor = color;
                this.#edgeWidth = width;
                this.mesh.enableEdgesRendering();
                this.mesh.edgesWidth = width;
                this.mesh.edgesColor = BABYLON.Color4.FromHexString(color);
            } else {
                this.#showEdge = false;
                this.mesh.disableEdgesRendering();
            }
            return this;
        },
        scaleFromCenter:(width: number=1, height: number=1, depth: number=1) => {
            this.mesh.scaling.y = height;
            this.mesh.scaling.x = width;
            this.mesh.scaling.z = depth;
            return this;
        },
        boundingBox: (show:boolean=true) => {
            if(show){
                this.mesh.showBoundingBox = true;
            } else {
                this.mesh.showBoundingBox = false;
            }
        },
        scale: (width: number=1, height: number=1, depth: number=1) => {
            let pivotAt = new BABYLON.Vector3(
                this.mesh.position.x - this.mesh.scaling.x / 2, 
                this.mesh.position.y - this.mesh.scaling.y / 2,
                this.mesh.position.z - this.mesh.scaling.z / 2);
            utils.scaleFromPivot(this.mesh, pivotAt, width, height, depth);
            return this; 
        }

    }
    constructor(params:{
        name?: string,
        width?: number,
        height?: number,
        depth?: number,
        opacity?: number,
        color?: string,
        showEdge?: boolean,
        edgeColor?: string,
        edgeWidth?: number,

        material?: any,
        mesh?: any,
    }={
        width: 1,
        height: 1,
        depth: 1,
        opacity: 1,
    }) {
        this.#name = params.name || this.#name;
        this.#color = params.color || this.#color;
        this.#showEdge = params.showEdge || this.#showEdge;
        this.#edgeColor = params.edgeColor || this.#edgeColor;
        this.#edgeWidth = params.edgeWidth || this.#edgeWidth;

        if(!params.material){
            this.material = new BABYLON.StandardMaterial("mat");
            this.material.diffuseColor = BABYLON.Color3.FromHexString(this.#color);
            this.material.alpha = params.opacity || 1;
        } else {
            this.material = params.material;
        }

        if(!params.mesh){
            params.height = params.height || 1;
            this.mesh = BABYLON.MeshBuilder.CreateBox(this.#name);
            this.set.position(0.5, 0.5, 0.5);
            this.set.scale(params.width, params.height, params.depth);
        }   else {
            this.mesh = params.mesh;
        }

        this.mesh.material = this.material;

        if(this.#showEdge){
            this.set.edge(true , this.#edgeColor , this.#edgeWidth);
        }
    }
    attachScene(scene: any): void {
        this.scene = scene;
        this.scene.addMesh(this.mesh);
        this.scene.addMaterial(this.material, "mat");
    }

    detachScene(scene: any): void {
        this.scene = scene;
        this.scene.removeMesh(this.mesh);
        this.scene.removeMaterial(this.material, "mat");
    }
    

}