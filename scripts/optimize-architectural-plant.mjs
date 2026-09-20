/** Deterministic mesh LOD generation from the retained CC0 source, no network. */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import * as THREE from "three";
import { SimplifyModifier } from "three/addons/modifiers/SimplifyModifier.js";

const root = path.resolve("public/architecture/details");
const dir = path.join(root,"potted_plant_01");
const gltf = JSON.parse(await readFile(path.join(dir,"potted_plant_01.gltf"),"utf8"));
const source = await readFile(path.join(dir,"potted_plant_01.bin"));
const counts = { SCALAR:1,VEC2:2,VEC3:3,VEC4:4 };
const types = { 5123:Uint16Array,5125:Uint32Array,5126:Float32Array };
function attribute(id) {
  const a=gltf.accessors[id], view=gltf.bufferViews[a.bufferView], Type=types[a.componentType];
  if (!Type || a.sparse || view.byteStride) throw new Error("Unexpected source accessor");
  const start=(view.byteOffset??0)+(a.byteOffset??0), length=a.count*counts[a.type]*Type.BYTES_PER_ELEMENT;
  const data=source.buffer.slice(source.byteOffset+start,source.byteOffset+start+length);
  return new THREE.BufferAttribute(new Type(data),counts[a.type]);
}
const buffers=[],views=[],accessors=[];let offset=0, before=0, after=0;
function append(attribute,target) {
  const padding=(4-offset%4)%4;
  if(padding){buffers.push(Buffer.alloc(padding));offset+=padding;}
  const data=Buffer.from(attribute.array.buffer,attribute.array.byteOffset,attribute.array.byteLength);
  const view=views.push({buffer:0,byteOffset:offset,byteLength:data.length,target})-1;
  buffers.push(data);offset+=data.length;
  const accessor={bufferView:view,componentType:attribute.array instanceof Float32Array?5126:attribute.array instanceof Uint16Array?5123:5125,count:attribute.count,type:Object.keys(counts).find(k=>counts[k]===attribute.itemSize)};
  if(attribute.itemSize===3){
    accessor.min=[Infinity,Infinity,Infinity];accessor.max=[-Infinity,-Infinity,-Infinity];
    for(let i=0;i<attribute.count;i++)for(let j=0;j<3;j++){const n=attribute.getComponent(i,j);accessor.min[j]=Math.min(accessor.min[j],n);accessor.max[j]=Math.max(accessor.max[j],n);}
  }
  return accessors.push(accessor)-1;
}
const modifier=new SimplifyModifier();
for(const mesh of gltf.meshes)for(const primitive of mesh.primitives){
  const geometry=new THREE.BufferGeometry();
  const names={POSITION:"position",NORMAL:"normal",TEXCOORD_0:"uv"};
  for(const [semantic,id] of Object.entries(primitive.attributes))geometry.setAttribute(names[semantic],attribute(id));
  geometry.setIndex(attribute(primitive.indices));before+=geometry.index.count/3;
  const simplified=await modifier.modify(geometry,Math.floor(geometry.attributes.position.count*.78));
  after+=simplified.index.count/3;
  for(const [semantic,name] of Object.entries(names))primitive.attributes[semantic]=append(simplified.attributes[name],34962);
  primitive.indices=append(simplified.index,34963);
  geometry.dispose();simplified.dispose();
}
gltf.buffers=[{uri:"potted_plant_01.lod.bin",byteLength:offset}];gltf.bufferViews=views;gltf.accessors=accessors;
gltf.asset.generator="Res Publica / Three.js meshoptimizer attribute-aware LOD";
const files=[["potted_plant_01.lod.gltf",Buffer.from(JSON.stringify(gltf))],["potted_plant_01.lod.bin",Buffer.concat(buffers)]];
const manifest=JSON.parse(await readFile(path.join(root,"manifest.json"),"utf8"));
for(const [name,bytes] of files){
  await writeFile(path.join(dir,name),bytes);
  const file=`potted_plant_01/${name}`;
  manifest.records=manifest.records.filter(r=>r.file!==file);
  manifest.records.push({file,source:"Derived from retained Poly Haven potted_plant_01 CC0 source",bytes:bytes.length,sha256:createHash("sha256").update(bytes).digest("hex")});
}
await writeFile(path.join(root,"manifest.json"),JSON.stringify(manifest,null,2)+"\n");
console.log(JSON.stringify({beforeTriangles:before,afterTriangles:after,binaryBytes:offset}));
