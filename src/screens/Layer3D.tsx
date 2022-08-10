import { Component, onMount } from 'solid-js';
import { Simple3D, box3D, ground2D } from '../components/BabylonJS/Simple3D';
import * as TWEEN from '@tweenjs/tween.js';

const Layer3D: Component = () => {

    onMount(() => {
        const scene = new Simple3D('canvas3D');
        const box = new box3D();
        const box2 = new box3D();
        const ground = new ground2D();

        box.set.edge(true)
           .set.opacity(0.5)

        box2.set.edge(true)
            .set.opacity(1)

        ground.set.scale(10, 10)
              .set.grid()
        
        new TWEEN.Tween({x:box.mesh.scaling.x})
        .to({x:3}, 1000)
        .repeat(Infinity)
        .yoyo(true)
        .onUpdate(({x}) => {
            box.set.scale(x, 1, 1);
        })
        .start();
             

        scene.showStats()
             .showAxis()
             .render([TWEEN.update]);      

    });

    return (
      <div  style="width:100vw; height:100vh;overflow:hidden;">
        <canvas style="width:100vw; height:100vh;" id='canvas3D' />
      </div>
    );
  };
  
export default Layer3D;