import {articles,company,services} from './data.js';

export const siteOrigin='https://www.orbitaerials.com';
export const canonicalUrl=path=>siteOrigin+path;

// Hosting context takes precedence over an accidentally inherited public flag.
export function isPublicBuild(env={}){
 return env.ORBIT_PUBLIC_BUILD==='1'
  &&(!env.CONTEXT||env.CONTEXT==='production')
  &&(!env.VERCEL_ENV||env.VERCEL_ENV==='production');
}

const pageNames={industries:'Industries',services:'Services',fleet:'Our fleet',about:'About',journal:'Blog',contact:'Contact',privacy:'Privacy',credits:'Image credits'};
export function breadcrumbsFor(route){
 if(route.path==='/')return [];
 const items=[{name:'Home',path:'/'}];
 if(route.type==='service')items.push({name:'Services',path:'/services/'});
 if(route.type==='article')items.push({name:'Blog',path:'/journal/'});
 const name=route.type==='service'?services.find(s=>s.slug===route.slug)?.name:
  route.type==='article'?articles.find(a=>a.slug===route.slug)?.title:pageNames[route.type];
 return [...items,{name:name||route.title,path:route.path}];
}

export function socialImageFor(route){
 const article=route.type==='article'?articles.find(a=>a.slug===route.slug):null;
 return article?{url:canonicalUrl('/media/'+article.image+'.webp'),alt:article.alt,type:'image/webp'}:
  {url:canonicalUrl('/media/social-preview.jpg'),alt:'Orbit Aerials — drone inspection, surveying and visual documentation in Kuwait',type:'image/jpeg',width:1200,height:630};
}

export function structuredDataFor(route){
 const canonical=canonicalUrl(route.path),organizationId=canonicalUrl('/#organization'),websiteId=canonicalUrl('/#website');
 const article=route.type==='article'?articles.find(a=>a.slug===route.slug):null;
 const service=route.type==='service'?services.find(s=>s.slug===route.slug):null;
 const breadcrumbs=breadcrumbsFor(route);
 const organization={
  '@type':['Organization','LocalBusiness'],'@id':organizationId,
  name:company.name,url:canonicalUrl('/'),
  logo:{'@type':'ImageObject',url:canonicalUrl('/media/orbit-logo.png'),width:900,height:273},
  email:company.email,telephone:company.tel,
  address:{'@type':'PostalAddress',streetAddress:'Burj Al Tujjar',addressLocality:'Kuwait City',addressCountry:'KW'},
  areaServed:{'@type':'Country',name:'Kuwait'},
  openingHoursSpecification:{'@type':'OpeningHoursSpecification',dayOfWeek:['Sunday','Monday','Tuesday','Wednesday','Thursday'],opens:'09:00',closes:'16:00'},
  sameAs:['https://www.instagram.com/orbit_aerials/','https://www.linkedin.com/in/orbit-aerials-504324372/']
 };
 const subtype={about:'AboutPage',contact:'ContactPage',services:'CollectionPage',industries:'CollectionPage',fleet:'CollectionPage',journal:'CollectionPage'}[route.type];
 const page={
  '@type':subtype?['WebPage',subtype]:'WebPage','@id':canonical,
  url:canonical,name:route.title,description:route.description,inLanguage:'en',
  isPartOf:{'@id':websiteId},about:{'@id':organizationId},
  ...(breadcrumbs.length?{breadcrumb:{'@id':canonical+'#breadcrumb'}}:{}),
  ...(article?{mainEntity:{'@id':canonical+'#article'}}:service?{mainEntity:{'@id':canonical+'#service'}}:{})
 };
 const graph=[organization,{'@type':'WebSite','@id':websiteId,url:canonicalUrl('/'),name:company.name,inLanguage:'en',publisher:{'@id':organizationId}},page];
 if(service)graph.push({
  '@type':'Service','@id':canonical+'#service',name:service.name,serviceType:service.name,
  description:service.description,url:canonical,
  provider:{'@id':organizationId},areaServed:{'@type':'Country',name:'Kuwait'},
  mainEntityOfPage:{'@id':canonical}
 });
 const result=[{'@context':'https://schema.org','@graph':graph}];
 // Keep article and breadcrumb objects standalone for consumers of the journal.
 if(article)result.push({
  '@context':'https://schema.org','@type':'BlogPosting','@id':canonical+'#article',
  headline:article.title,description:article.summary,inLanguage:'en',
  author:{'@type':'Organization',name:article.author,url:canonicalUrl('/about/')},
  publisher:{'@id':organizationId},mainEntityOfPage:{'@id':canonical},url:canonical,
  image:canonicalUrl('/media/'+article.image+'.webp'),
  ...(article.published?{datePublished:article.published}:{}),
  ...(article.updated?{dateModified:article.updated}:{})
 });
 if(breadcrumbs.length)result.push({
  '@context':'https://schema.org','@type':'BreadcrumbList','@id':canonical+'#breadcrumb',
  itemListElement:breadcrumbs.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,item:canonicalUrl(item.path)}))
 });
 return result;
}
