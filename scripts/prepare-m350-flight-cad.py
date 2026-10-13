"""Split DJI's retained M350 STEP into a fixed body and original propellers.
Run using assets-source/m400/cad-env/Scripts/python.exe from the project root.
Shell IDs belong to the 2023-05-30 assembly. Include hub faces and blade marks;
do not cut the mesh spatially or rotate the stationary motor housings.
"""
from pathlib import Path
import json, array, struct, time
from OCP.STEPControl import STEPControl_Reader
from OCP.IFSelect import IFSelect_RetDone
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.StlAPI import StlAPI_Writer
from OCP.TopExp import TopExp
from OCP.TopAbs import TopAbs_SHELL, TopAbs_EDGE, TopAbs_FACE
from OCP.TopTools import TopTools_IndexedMapOfShape
from OCP.TopoDS import TopoDS, TopoDS_Compound
from OCP.BRep import BRep_Builder
from OCP.BRepAdaptor import BRepAdaptor_Curve, BRepAdaptor_Surface
from OCP.GeomAbs import GeomAbs_Cylinder
from OCP.GCPnts import GCPnts_QuasiUniformDeflection

root=Path('assets-source/m350'); output=root/'flight'; output.mkdir(exist_ok=True)
start=time.time();reader=STEPControl_Reader()
assert reader.ReadFile(str(root/'Matrice_350_RTK_3D_Model.stp'))==IFSelect_RetDone
reader.TransferRoots();shape=reader.OneShape()
shells=TopTools_IndexedMapOfShape();TopExp.MapShapes_s(shape,TopAbs_SHELL,shells)
assert shells.Extent()==1696,'Source assembly changed; inspect the parts again'
parts=[
 {'name':'rotor-front-right','shells':[1,2,3,4,5,6,1264,1561,1562,1563,1564,1565,1566],'hub':4,'direction':1},
 {'name':'rotor-rear-right','shells':[38,39,1396,1397,1405,1406,1576,1577,1578,1579],'hub':1396,'direction':-1},
 {'name':'rotor-rear-left','shells':[124,125,126,130,131,1134,1135,1590,1591,1592,1593],'hub':130,'direction':1},
 {'name':'rotor-front-left','shells':[40,41,42,43,167,168,1098,1099,1580,1581,1582,1583],'hub':167,'direction':-1}
]
excluded={i for part in parts for i in part['shells']}
assert len(excluded)==sum(len(p['shells']) for p in parts)
parts.insert(0,{'name':'body','shells':[i for i in range(1,1697) if i not in excluded]})
BRepMesh_IncrementalMesh(shape,1.6,False,.45,True)
for part in parts:
 if 'hub' in part:
  faces=TopTools_IndexedMapOfShape();TopExp.MapShapes_s(shells.FindKey(part['hub']),TopAbs_FACE,faces)
  hinges=[]
  for i in range(1,faces.Extent()+1):
   surface=BRepAdaptor_Surface(TopoDS.Face_s(faces.FindKey(i)))
   if surface.GetType()==GeomAbs_Cylinder and abs(surface.Cylinder().Radius()-9)<.001:
    c=surface.Cylinder();p=c.Location();d=c.Axis().Direction()
    hinges.append([p.X(),p.Y(),p.Z()]);part['axis']=[d.X(),d.Y(),d.Z()]
  assert len(hinges)==2,'Expected the two original 9 mm blade hinge cylinders'
  part['pivot']=[sum(p[k] for p in hinges)/2 for k in range(3)]
  if part['axis'][1]<0:part['axis']=[-v for v in part['axis']]
 compound=TopoDS_Compound();builder=BRep_Builder();builder.MakeCompound(compound)
 for sid in part['shells']:builder.Add(compound,shells.FindKey(sid))
 stl=output/(part['name']+'.stl');writer=StlAPI_Writer();writer.ASCIIMode=False
 assert writer.Write(compound,str(stl))
 with stl.open('rb') as f:f.seek(80);part['sourceTriangles']=struct.unpack('<I',f.read(4))[0]
 edges=TopTools_IndexedMapOfShape();TopExp.MapShapes_s(compound,TopAbs_EDGE,edges)
 values=array.array('f');failed=0
 for i in range(1,edges.Extent()+1):
  try:
   curve=BRepAdaptor_Curve(TopoDS.Edge_s(edges.FindKey(i)));sample=GCPnts_QuasiUniformDeflection(curve,1.2)
   if not sample.IsDone():failed+=1;continue
   points=[curve.Value(sample.Parameter(j)) for j in range(1,sample.NbPoints()+1)]
   for a,b in zip(points,points[1:]):
    if a.Distance(b)>.8:values.extend([a.X(),a.Y(),a.Z(),b.X(),b.Y(),b.Z()])
  except Exception:failed+=1
 assert values and failed==0
 (output/(part['name']+'-edges.bin')).write_bytes(values.tobytes())
 part.update(segments=len(values)//6,failedEdges=failed,bounds=[[min(values[k::3]),max(values[k::3])] for k in range(3)])
 print(part['name'],part['segments'],'segments;',part['sourceTriangles'],'triangles',flush=True)
with (root/'m350.stl').open('rb') as f:f.seek(80);original_triangles=struct.unpack('<I',f.read(4))[0]
assert sum(p['sourceTriangles'] for p in parts)==original_triangles,'Split lost surface geometry'
assert sum(p['segments'] for p in parts)==json.loads((root/'cad-summary.json').read_text())['segments'],'Split lost CAD lines'
(output/'parts.json').write_text(json.dumps(parts,indent=2))
print('Geometry preserved. Done in',round(time.time()-start,1),'seconds',flush=True)
