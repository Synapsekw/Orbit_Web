import { industries, serviceChoices } from './data.js';
const clean=value=>String(value??'').trim();
export function contextFromSearch(search){const p=new URLSearchParams(search);return {industry:industries.some(i=>i.id===p.get('industry'))?p.get('industry'):'',service:serviceChoices.some(s=>s.slug===p.get('service'))?p.get('service'):'help'};}
export function validateEnquiry(input){
  const d=Object.fromEntries(Object.entries(input).map(([k,v])=>[k,clean(v)])),e={};
  for(const [key,label,max] of [['name','your name',100],['company','your company',160],['location','the project location',180]]){if(!d[key])e[key]=`Enter ${label}.`;else if(d[key].length>max)e[key]=`Use ${max} characters or fewer.`;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email||'')||(d.email||'').length>180)e.email='Enter a valid work email address.';
  if(!industries.some(i=>i.id===d.industry))e.industry='Choose an industry from the list.';
  if(!serviceChoices.some(s=>s.slug===d.service))e.service='Choose a service from the list.';
  if((d.message||'').length<10)e.message='Add at least 10 characters about what you need to see.';
  if((d.message||'').length>2500)e.message='Keep the project description within 2,500 characters.';
  if((d.phone||'').length>50)e.phone='Use 50 characters or fewer.';
  if((d.timing||'').length>120)e.timing='Use 120 characters or fewer.';
  return e;
}
export function prepareEnquiry(input){
 const d=Object.fromEntries(Object.entries(input).map(([k,v])=>[k,clean(v)]));
 const service=serviceChoices.find(s=>s.slug===d.service)?.name||'Help me choose';
 const industry=industries.find(i=>i.id===d.industry)?.name||'To discuss';
 const brief=`Project enquiry — Orbit Aerials\n\nName: ${d.name}\nWork email: ${d.email}\nCompany: ${d.company}\nPhone: ${d.phone||'Not supplied'}\nIndustry: ${industry}\nService: ${service}\nProject / site location: ${d.location}\nPreferred timing: ${d.timing||'To discuss'}\n\nProject description\n${d.message}`;
 return {brief,mailto:`mailto:info@orbitaerials.com?subject=${encodeURIComponent('Project enquiry — '+service)}&body=${encodeURIComponent(brief)}`};
}
export function initEnquiry(){
 const form=document.querySelector('#enquiry');if(!form)return;
 const context=contextFromSearch(location.search);for(const [k,v] of Object.entries(context))form.elements[k].value=v;
 const review=document.querySelector('#brief-review'),status=document.querySelector('#form-status'),text=document.querySelector('#brief-text');
 const clearErrors=()=>{form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));form.querySelectorAll('.field-error').forEach(el=>el.textContent='');};
 form.noValidate=true;form.querySelector('[type=submit]').disabled=false;
 const clearCopyStatus=()=>document.querySelector('#copy-status').textContent='';
 form.addEventListener('input',()=>{review.hidden=true;status.textContent='';clearCopyStatus();});
 form.addEventListener('change',()=>{review.hidden=true;status.textContent='';clearCopyStatus();});
 form.addEventListener('submit',event=>{
   event.preventDefault();clearErrors();clearCopyStatus();const data=Object.fromEntries(new FormData(form)),errors=validateEnquiry(data);
   if(Object.keys(errors).length){status.textContent='Please check the highlighted fields. Nothing has been sent.';for(const [field,error] of Object.entries(errors)){form.elements[field].setAttribute('aria-invalid','true');document.querySelector('#error-'+field).textContent=error;}form.elements[Object.keys(errors)[0]].focus();return;}
   const result=prepareEnquiry(data);text.textContent=result.brief;document.querySelector('#email-brief').href=result.mailto;review.hidden=false;status.textContent='';document.querySelector('#brief-title').focus();
 });
 document.querySelector('#copy-brief').addEventListener('click',async()=>{const feedback=document.querySelector('#copy-status');try{await navigator.clipboard.writeText(text.textContent);feedback.textContent='Brief copied. Paste it into your email to Orbit.';}catch{feedback.textContent='Clipboard access is unavailable. Select and copy the brief below.';const range=document.createRange();range.selectNodeContents(text);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);}});
 document.querySelector('#edit-brief').addEventListener('click',()=>{review.hidden=true;clearCopyStatus();form.elements.name.focus();});
}
