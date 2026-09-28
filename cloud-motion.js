(() => {
  const scene = document.querySelector('.window-scene');
  const cloud = document.querySelector('.cloud-scene');
  const aperture = document.querySelector('.window-sky');
  const canvases = [...document.querySelectorAll('.cloud-motion')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vertex = `#version 300 es
    in vec2 aPosition;
    out vec2 vUv;
    void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;
  const fragment = `#version 300 es
    precision highp float;
    uniform sampler2D uImage;
    uniform vec2 uResolution;
    uniform float uTime;
    in vec2 vUv;
    out vec4 outColor;
    void main(){
      float imageAspect=1672./941.;
      float viewAspect=uResolution.x/uResolution.y;
      vec2 uv=vUv;
      if(viewAspect>imageAspect)uv.y=(uv.y-.5)*imageAspect/viewAspect+.5;
      else uv.x=(uv.x-.5)*viewAspect/imageAspect+.5;
      // Keep the horizon calm, while nearer clouds travel faster below it.
      float depth=1.-smoothstep(.02,.67,uv.y);
      float drift=uTime*.0045;
      uv.x+=drift*(.12+depth*.95);
      uv.y+=uTime*.00045*depth;
      // Small, slowly changing eddies keep this from being a flat image pan.
      uv.x+=sin(uv.y*15.+uTime*.17)*.0038*depth;
      uv.y+=sin(uv.x*13.-uTime*.12)*cos(uv.y*9.+uTime*.09)*.0025*depth;
      outColor=texture(uImage,uv);
    }`;
  function shader(gl,type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);throw new Error('Cloud shader unavailable')}return s}
  const renderers=[];
  function initialize(canvas,image){
    try{
      const gl=canvas.getContext('webgl2',{alpha:false,antialias:false,powerPreference:'low-power'});
      if(!gl)throw new Error('WebGL unavailable');
      const program=gl.createProgram();gl.attachShader(program,shader(gl,gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl,gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Cloud program unavailable');
      gl.useProgram(program);
      const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
      const position=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
      const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.MIRRORED_REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.MIRRORED_REPEAT);
      gl.uniform1i(gl.getUniformLocation(program,'uImage'),0);
      const renderer={canvas,gl,resolution:gl.getUniformLocation(program,'uResolution'),time:gl.getUniformLocation(program,'uTime')};renderers.push(renderer);
      canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();canvas.parentElement.classList.add('cloud-fallback')});
      canvas.dataset.motion='automatic';
    }catch{canvas.parentElement.classList.add('cloud-fallback')}
  }
  function resize(){
    // Locate the photographed aperture independently of the scroll zoom.
    const mobile=innerWidth<=600;
    const imageHeight=scene.clientHeight*(mobile?.88:1),imageWidth=imageHeight*1586/992;
    const x=(scene.clientWidth-imageWidth)/2,y=(scene.clientHeight-imageHeight)*(mobile?.38:0);
    // The photo and its opening share one camera, without transforming a
    // multi-screen compositing surface. Clip the enlarged image at the scene.
    const width=imageWidth*.280,height=imageHeight*.767,half=scene.clientHeight/2;
    const geometry={
      '--window-image-width':imageWidth+'px','--window-image-height':imageHeight+'px',
      '--window-center-y':half+'px','--window-image-top':(y-half)+'px',
      '--aperture-left':(x+imageWidth*.361-scene.clientWidth/2)+'px',
      '--aperture-top':(y+imageHeight*.087-half)+'px',
      '--aperture-width':width+'px','--aperture-height':height+'px',
      // The window's clouds are drawn in screen space, aligned with the full-screen
      // cloud layer, so only the frame grows while the sky keeps its scale.
      '--scene-half-w':scene.clientWidth/2+'px',
      '--cloud-width':cloud.offsetWidth+'px','--cloud-height':cloud.offsetHeight+'px',
      '--cloud-dx':(cloud.offsetLeft-scene.offsetLeft)+'px','--cloud-dy':(cloud.offsetTop-scene.offsetTop)+'px'
    };
    Object.entries(geometry).forEach(([name,value])=>scene.style.setProperty(name,value));
    renderers.forEach(({canvas,gl,resolution})=>{const scale=Math.min(devicePixelRatio||1,1.5),inWindow=canvas.parentElement===aperture;canvas.width=Math.max(1,Math.round((inWindow?cloud.offsetWidth:canvas.clientWidth)*scale));canvas.height=Math.max(1,Math.round((inWindow?cloud.offsetHeight:canvas.clientHeight)*scale));gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(resolution,canvas.width,canvas.height)});
  }
  let visible=true,frame=0,last=0,start=performance.now();
  function draw(now){
    frame=0;if(!visible||document.hidden)return;
    if(now-last>30){const seconds=reducedMotion?0:(now-start)/1000;renderers.forEach(({gl,time})=>{if(!gl.isContextLost()){gl.uniform1f(time,seconds);gl.drawArrays(gl.TRIANGLES,0,6)}});last=now}
    if(!reducedMotion)frame=requestAnimationFrame(draw);
  }
  function resume(){cancelAnimationFrame(frame);frame=requestAnimationFrame(draw)}
  const image=new Image();image.onload=()=>{canvases.forEach(canvas=>initialize(canvas,image));resize();resume()};image.onerror=()=>canvases.forEach(canvas=>canvas.parentElement.classList.add('cloud-fallback'));
  // Embedded pixels remain usable as a WebGL texture when index.html is opened directly.
  image.src=window.ARCHER_CLOUD_TEXTURE||'assets/clouds.png';
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)resume();else cancelAnimationFrame(frame)}).observe(document.querySelector('.hero-sticky'));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)resume()});
  addEventListener('resize',()=>{resize();resume()});resize();
})();
