import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
const out='public/media';await mkdir(out,{recursive:true});
const assets={};
for(const name of ['oil-gas','construction','power','security','environment','elios-inspection','m400-cutout','m350-cutout','elios'])assets[name]=`public/concepts/round-6/${name}.webp`;
for(const name of ['progress-aerial','spatial-model-preview','construction-360-preview','construction-timelapse','handover-architecture'])assets[name]=`public/images/${name}.webp`;
for(const [name,path] of Object.entries(assets)){
 await sharp(path).resize({width:1600,withoutEnlargement:true}).webp({quality:84}).toFile(`${out}/${name}.webp`);
 await sharp(path).resize({width:800,withoutEnlargement:true}).webp({quality:80}).toFile(`${out}/${name}-800.webp`);
 await sharp(path).resize({width:1600,withoutEnlargement:true}).avif({quality:48,effort:4}).toFile(`${out}/${name}.avif`);
 await sharp(path).resize({width:800,withoutEnlargement:true}).avif({quality:45,effort:4}).toFile(`${out}/${name}-800.avif`);
}
await sharp('public/brand/orbit-aerials-white.png').resize({width:900}).png().toFile(`${out}/orbit-logo.png`);
await sharp({create:{width:1200,height:630,channels:4,background:'#071421'}}).composite([{input:await sharp('public/media/m400-cutout.webp').resize({width:630}).toBuffer(),left:550,top:30},{input:await sharp('public/brand/orbit-aerials-white.png').resize({width:400}).toBuffer(),left:70,top:200}]).jpeg({quality:85}).toFile('public/media/social-preview.jpg');
console.log(`Prepared ${Object.keys(assets).length} responsive media sets and brand previews.`);
