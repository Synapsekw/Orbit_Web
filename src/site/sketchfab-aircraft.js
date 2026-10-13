let library;
export function loadSketchfab(){
 return library ||= new Promise((resolve,reject)=>{
  if(window.Sketchfab)return resolve(window.Sketchfab);
  const script=document.createElement('script');
  const fail=()=>{clearTimeout(timer);script.remove();library=null;reject(new Error('Viewer unavailable'));};
  const timer=setTimeout(fail,12000);
  script.src='https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
  script.onload=()=>{clearTimeout(timer);window.Sketchfab?resolve(window.Sketchfab):fail();};
  script.onerror=fail;document.head.append(script);
 });
}

// Presentation changes use Sketchfab's documented Viewer API only. The official
// non-downloadable Flyability geometry stays inside its authorized embed.
export function styleEliosWireframe(api){
 api.setBackground({color:[7/255,20/255,33/255]},()=>{});
 api.setPostProcessing({enable:false},()=>{});
 return new Promise((resolve,reject)=>{
  api.setWireframe(true,{color:'D6B56D33'},error=>{
   if(error){reject(new Error('Wireframe is unavailable'));return;}
   api.setShadingStyle('classic',{type:'shadeless'},()=>{});
   api.getMaterialList((err,materials)=>{
    if(err){resolve();return;}
    for(const material of materials){
     for(const key of ['DiffuseColor','AlbedoPBR','DiffusePBR']){
      const channel=material.channels[key];if(!channel)continue;
      delete channel.texture;channel.enable=true;channel.factor=1;channel.color=[.008,.017,.028];
     }
     for(const key of ['EmitColor','SpecularColor','SpecularPBR','Opacity']){
      if(material.channels[key])material.channels[key].enable=false;
     }
     api.setMaterial(material,()=>{});
    }
    resolve();
   });
  });
 });
}
