import { Component, onMount } from 'solid-js';
import {Simple3D , box3D} from '../components/ThreeJS/Simple3D';
import * as TWEEN from '@tweenjs/tween.js';

const Layer3D: Component = () => {

    onMount(() => {
      const scene:any = new Simple3D('canvas3D');
      const box = new box3D();
      scene.add(box);

      scene.showGrid(true)
           .showAxis(true)
           .showStats(true)
           .enableOrbitControls(false)
      

      new TWEEN.Tween(box.mesh.position)
               .to({x:10,y:10,z:10}, 2000)
               .repeat(Infinity)
               .yoyo(true)
               .onUpdate(() => {
                const {x,y,z} = box.mesh.position;
                scene.lookAt(x,y,z);
               })
               .start();
      
      box.showEdge(true)
         .onClick(()=> scene.attachTargetControls(box));
         
      scene.animate(TWEEN);

    })
    return (
      <div  style="width:100vw; height:100vh;overflow:hidden;">
        <canvas style="width:100vw; height:100vh;" id='canvas3D' />
      </div>
    );
  };
  
export default Layer3D;