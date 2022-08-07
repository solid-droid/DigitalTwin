import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import * as Stats from 'stats.js';

export class Simple3D {

    canvas:any;
    canvasWidth:number = 0;
    canvasHeight:number = 0;
    renderer:any;
    renderRequested:boolean = false;
    scene:any;
    camera:any;
    cameraControls:any;
    targetControls:any;
    gridHelper:any;
    domEvents:any;
    axesHelper:any;
    TWEEN:any;
    stats:any;
    animateCallback:any;

    constructor(canvasID:string) {
        this.canvas = document.getElementById(canvasID);
        this.canvasWidth = window.innerWidth;
        this.canvasHeight = window.innerHeight;
        this.createRenderer();
        this.createScene();
        this.createCamera();
        this.createCameraControls();
        this.createTargetControls();
        this.createDOMevents();
        this.drawGrid();
        this.drawAxis();
        this.drawStats();
        this.render();
    }

   
    createRenderer(){
        this.renderer = new THREE.WebGLRenderer({
            canvas:this.canvas,
            powerPreference: "high-performance",
            antialias: true,
            alpha: true,
            stencil: false,
            depth: true
        });
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        this.renderer.setClearColor('rgb(36, 36, 36)', 1);
        const _this = this;
        window.addEventListener('resize', () => {
            _this.canvasWidth = window.innerWidth;
            _this.canvasHeight = window.innerHeight;
            _this.renderer.setSize(_this.canvasWidth, _this.canvasHeight);
            _this.requestRenderIfNotRequested();
        }, false);
        }
    
    requestRenderIfNotRequested() {
        const _this = this;
        if (!_this.renderRequested) {
            _this.renderRequested = true;
            requestAnimationFrame(()=> _this.render(_this));
        }
    }

    setScene(scene:any){
        this.scene = scene;
        return this;
    }

    setCamera(camera:any){
        this.camera = camera;
        return this;
    }

    setCameraControls(cameraControls:any){
        this.cameraControls = cameraControls;
        return this;
    }
          
    render(_this = this) {
        _this.cameraControls.update();  
        _this.camera.aspect = _this.canvasWidth / _this.canvasHeight;
        _this.camera.updateProjectionMatrix();
        _this.renderer.render(_this.scene, _this.camera);
        _this.renderRequested = false;
        return this;
    }
    
    createScene(){
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog('rgb(36, 36, 36)', 10, 100);  
    }
    
    createCamera(){
        this.camera = new THREE.PerspectiveCamera( 50, this.canvasWidth / this.canvasHeight, 0.1, 1000 );
        this.camera.position.z = 8;
        this.camera.position.y = 3;
    }

    setCameraPosition(x:number, y:number, z:number){
        this.camera.position.x = x;
        this.camera.position.y = y;
        this.camera.position.z = z;
        return this;
    }

    moveCamera(x:number, y:number, z:number){
        this.camera.position.x += x;
        this.camera.position.y += y;
        this.camera.position.z += z;
        return this;
    }

    lookAt(x:number, y:number, z:number){
        this.cameraControls.target = new THREE.Vector3(x, y, z);
        return this;
    }
    
    createCameraControls(){
        this.cameraControls = new OrbitControls(this.camera, this.canvas);
        this.cameraControls.target.set(0, 0, 0);
        this.cameraControls.update();
        const _this = this;
        this.cameraControls.addEventListener('change', ()=> _this.requestRenderIfNotRequested());
    }

    enableOrbitControls(enable:boolean = true){
        this.cameraControls.enabled = enable;
        return this;
    }
    
    createTargetControls(){
        this.targetControls = new TransformControls( this.camera, this.renderer.domElement );
        const _this = this;
        this.targetControls.addEventListener( 'change', ()=> _this.requestRenderIfNotRequested() );
        this.targetControls.addEventListener( 'dragging-changed', (event:any) => {
            _this.cameraControls.enabled = ! event.value;
        });
        this.scene.add( this.targetControls );
    }

    createDOMevents(){
        this.domEvents	= new DomEvents(this.scene, this.camera);
    }
    
    drawGrid({size = 100, divisions = 100}={}){
        this.gridHelper = new THREE.GridHelper( size, divisions );
        this.gridHelper.visible = false;
        this.scene.add( this.gridHelper );
    }

    showGrid(show:boolean = true){
        this.gridHelper.visible = show;
        this.requestRenderIfNotRequested();
        return this;
    }

    drawStats(){
        this.stats = new Stats();
        this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( this.stats.dom );
        this.showStats(false);
    }

    showStats(show = true){
        this.stats.dom.style.display = show ? 'block' : 'none';
        return this;
    }
    
    add(object:any){
        if(['box3D'].includes(object.type)){
            this.scene.add(object.mesh);
            object.attachScene(this.scene, this.domEvents);
        } else {
            this.scene.add(object);
        }
        this.requestRenderIfNotRequested();
        return this;
    }

    remove(object:any){
        if(['box3D'].includes(object.type)){
            this.scene.remove(object.mesh);
        } else {
            this.scene.remove(object);
        }
        this.requestRenderIfNotRequested();
        return this;
    }

    on(element:any , event:any , callback:any) {
        if(['box3D'].includes(element.type)){
            this.domEvents.on(element.mesh , event, callback);
        } else {
            this.domEvents.on(element , event, callback);
        }
        return this;
    }

    off(element:any , event:any) {
        if(['box3D'].includes(element.type)){
            this.domEvents.off(element.mesh , event);
        } else {
            this.domEvents.off(element , event);
        }
        return this;
    }

    attachTargetControls(object:any){
        if(['box3D'].includes(object.type)){
            this.targetControls.attach(object.mesh);
        } else {
            this.targetControls.attach(object);
        }
        return this;
      }
  
    detachTargetControls(){
        this.targetControls.detach();
        return this;
    }

    setTargetControlMode = (mode:string) => {
        this.targetControls.setMode(mode);
        return this;
    }

    drawAxis(size = 5){
        this.axesHelper = new THREE.AxesHelper( size );
        this.axesHelper.visible = false;
        this.scene.add( this.axesHelper );
        return this;
    }

    showAxis(show:boolean = true){
        this.axesHelper.visible = show;
        this.requestRenderIfNotRequested();
        return this;
    }

    animate(TWEEN:any , callback:any = ()=>{}){
        this.TWEEN = TWEEN;
        this.animateCallback = callback;
        this.loop();
        return this;
    }
    async loop(time:any = 0){
        this.stats.begin();
        this.TWEEN?.update(time);
        this.animateCallback(time);
        this.render();
        this.stats.end();
        const _this = this;
        requestAnimationFrame((time) => _this.loop(time));
    }
}

type paramsBox3D = {
    showEdge?: boolean,
    edgeColor ?: any,
    y ?: number,
    x ?: number,
    z ?: number,
    rotX ?: number,
    rotY ?: number,
    rotZ ?: number,
    color ?: any,
    w ?: number,
    h ?: number,
    d ?: number,
    geometry ?: any,
    material ?: any,
}

export class box3D {
    _showEdge: boolean;
    edgeColor: any;
    y: number;
    x: number;
    z: number;
    rotX: number;
    rotY: number;
    rotZ: number;
    _color: any;
    w: number;
    h: number;
    d: number;
    geometry: any;
    material: any;
 
    mesh: any;
    scene:any;
    domEvents:any;
    type:string = 'box3D';

    constructor(params: paramsBox3D = {}) {
        this._showEdge = params.showEdge || false;
        this.edgeColor = params.edgeColor || 'white';
        this.y = params.y || 0;
        this.x = params.x || 0;
        this.z = params.z || 0;
        this.rotX = params.rotX || 0;
        this.rotY = params.rotY || 0;
        this.rotZ = params.rotZ || 0;
        this._color = params.color || 'red';
        this.w = params.w || 1;
        this.h = params.h || 1;
        this.d = params.d || 1;
        this.geometry = params.geometry || new THREE.BoxGeometry(this.w, this.h, this.d);
        this.material = params.material || new THREE.MeshBasicMaterial({color: this._color});
        this.init();
        this.showEdge(this._showEdge);
      }
      init(){
        this.mesh = new THREE.Mesh( this.geometry , this.material );
        this.setOrigin(0,0,0);
        this.mesh.rotation.set(this.rotX, this.rotY, this.rotZ);
        this.mesh.position.set(this.x,this.y,this.z);
        this.mesh.scale.set(this.w, this.h, this.d);
        const edge = this.createEdge(this.geometry , this.edgeColor);
        this.mesh.add(edge);
        return this;
    }

    getOrigin(){
        if(!this.mesh.geometry.boundingBox){
          this.mesh.geometry.computeBoundingBox();
        }
        const min = this.mesh.geometry.boundingBox.min;
        return {x : -min.x, y : -min.y, z : -min.z};
      }

    setOrigin ( x:number, y:number, z:number, children=true , mesh = this.mesh ) {
        if(!mesh.geometry.boundingBox){
          mesh.geometry.computeBoundingBox();
        }
        const min = mesh.geometry.boundingBox.min;
        const origin = {x : min.x, y : min.y, z : min.z};
        const shift = {x : x - origin.x, y : y - origin.y, z : z - origin.z};
        this.#setOrigin(shift, children, mesh)
    }

    showEdge(show=true, color:any = this.edgeColor){
        if(show){
          this._showEdge = true;
          this.edgeColor = color;
          if(!this.mesh.children.length){
            const edge = this.createEdge(this.mesh.geometry, color);
            this.mesh.add(edge);
          }
        } else {
          this._showEdge = false;
          this.mesh.remove(this.mesh.children[0]);
        }
        return this;
      }

    #setOrigin(shift:any, children=true, mesh = this.mesh){
        if(!mesh.geometry.boundingBox){
          mesh.geometry.computeBoundingBox();
        }
        mesh.geometry.applyMatrix4( new THREE.Matrix4().makeTranslation(shift.x, shift.y, shift.z) );
        if(children) {
          mesh?.children.forEach((child:any) => {
            this.#setOrigin(shift,true, child);
          });
        }
      }
    
    createEdge = (geometry:any, color =  0xffffff) => {
        const material = new THREE.LineBasicMaterial( { color } );
        const _geometry = new THREE.EdgesGeometry(geometry);
        const wireframe = new THREE.LineSegments( _geometry, material  );
        wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
        return wireframe;
    }

    //////////////////////
    getPosition = () => this.mesh.position;
    setPosition = (x:number, y:number, z:number) => {
        this.x = x;
        this.y = y;
        this.z = z;
        this.mesh.position.set(x,y,z);
        return this;
    }

    getRotation = () => this.mesh.rotation;
    setRotation = (x:number, y:number, z:number) => {
        this.rotX = x;
        this.rotY = y;
        this.rotZ = z;
        this.mesh.rotation.set(x,y,z);
        return this;
    }

    getScale = () => this.mesh.scale;
    setScale = (x:number, y:number, z:number) => {
        this.w = x;
        this.h = y;
        this.d = z;
        this.mesh.scale.set(x,y,z);
        return this;
    }

    getColor = () => this.material.color;
    setColor = (color:any) => {
        this._color = color;
        this.material.color = color;
        return this;
    }

    move = (x:number, y:number, z:number) => {
        this.x += x;
        this.y += y;
        this.z += z;
        this.mesh.position.set(this.x,this.y,this.z);
        return this;
    }
    //////////////////////

    sync(){
        this.x = this.mesh.position.x;
        this.y = this.mesh.position.y;
        this.z = this.mesh.position.z;
        this.rotX = this.mesh.rotation.x;
        this.rotY = this.mesh.rotation.y;
        this.rotZ = this.mesh.rotation.z;
        this.w = this.mesh.scale.x;
        this.h = this.mesh.scale.y;
        this.d = this.mesh.scale.z;
        return this;
    }
    clone({material,geometry}:any={}){
        this.sync();
        return new box3D({
          showEdge: this._showEdge,
          edgeColor: this.edgeColor,
          y: this.y,
          x: this.x,
          z: this.z,
          rotX: this.rotX,
          rotY: this.rotY,
          rotZ: this.rotZ,
          color: this._color,
          w: this.w,
          h: this.h,
          d: this.d,
          material: material,
          geometry: geometry,
        });
      }

    attachScene(scene:any, domEvents:any){
        this.scene = scene;
        this.domEvents = domEvents;
    }

    on(event:string, callback:any){
        this.domEvents.on(this.mesh, event, callback);
    }

    onClick(callback:any){
        this.on('click', callback);
    }

    onHover(callback:any){
        this.on('hover', callback);
    }

    off(event:string){
        this.domEvents.off(this.mesh, event);
    }

    remove(){
        this.scene.remove(this.mesh);
        return this;
    }

}
    
class DomEvents{
    scene:any;
    camera:any;
    raycaster:any;
    pointer:any;
    eventList:any = { 
        click : {},
        hover : {},
    };
    UUIDList:any = { 
        click : [],
        hover : [],
    };
    constructor(scene:any, camera:any){
      this.scene = scene;
      this.camera = camera;
      this.raycaster = new THREE.Raycaster();
      this.pointer = new THREE.Vector2();
      const _this = this;
      window.addEventListener( 'pointermove', (e) => _this.findInersects(e, 'hover') );
      window.addEventListener( 'click', (e) => _this.findInersects(e, 'click') );
    }
  
    findInersects(event:any , type:any) {
      this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      this.raycaster.setFromCamera( this.pointer, this.camera );
      const intersects = this.raycaster.intersectObjects( this.scene.children );
      for(let i = 0; i < intersects.length; i++){
        this.UUIDList[type].forEach((uuid:any) => {
            if(intersects[i].object.uuid === uuid){
                this.eventList[type][uuid](intersects[i]);
              }
        });

      }
    }
  
    on(object:any, event:any, callback:any){
      this.eventList[event][object.uuid] = callback;
      this.UUIDList[event] = Object.keys(this.eventList[event]);
    }

    off(object:any, event:any){
        delete this.eventList[event][object.uuid];
        this.UUIDList[event] = Object.keys(this.eventList[event]);
    }
  }