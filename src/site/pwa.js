/** Native installation UI is provided by browsers that support the manifest. */
export function registerPwa(){
 if(!import.meta.env.PROD||!window.isSecureContext||!('serviceWorker' in navigator))return;
 const register=async()=>{
  try{return await navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'});}
  catch{return null;} // Storage/privacy settings must not interrupt the website.
 };
 if(document.readyState==='complete')void register();
 else window.addEventListener('load',register,{once:true});
}
