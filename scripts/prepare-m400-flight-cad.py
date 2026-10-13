"""Split the already-retained official M400 STEP into body and four propellers.
Run with assets-source/m400/cad-env/Scripts/python.exe from the project root.
Shell indices refer to DJI's 2025-06-11 STEP assembly; never infer blades by
cutting triangles with an approximate spatial box.
"""
from pathlib import Path
import json, array, time
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

root=Path('assets-source/m400'); output=root/'flight'; output.mkdir(exist_ok=True)
start=time.time(); reader=STEPControl_Reader()
assert reader.ReadFile(str(root/'DJI_Matrice_400_3D_Model.stp'))==IFSelect_RetDone
reader.TransferRoots(); shape=reader.OneShape()
shells=TopTools_IndexedMapOfShape(); TopExp.MapShapes_s(shape,TopAbs_SHELL,shells)
assert shells.Extent()==780, 'Source assembly changed; inspect it before extracting parts'
parts=[{'name':'rotor-front-right','shells':[232,233,234],'hub':232,'direction':1},
       {'name':'rotor-rear-right','shells':[374,375,376],'hub':374,'direction':-1},
       {'name':'rotor-rear-left','shells':[461,462,463],'hub':461,'direction':1},
       {'name':'rotor-front-left','shells':[766,767,768],'hub':768,'direction':-1}]
excluded={i for p in parts for i in p['shells']}
parts.insert(0,{'name':'body','shells':[i for i in range(1,781) if i not in excluded]})
BRepMesh_IncrementalMesh(shape,1.6,False,.45,True)
for part in parts:
 if 'hub' in part:
  faces=TopTools_IndexedMapOfShape(); TopExp.MapShapes_s(shells.FindKey(part['hub']),TopAbs_FACE,faces)
  hinges=[]
  for j in range(1,faces.Extent()+1):
   surf=BRepAdaptor_Surface(TopoDS.Face_s(faces.FindKey(j)))
   if surf.GetType()==GeomAbs_Cylinder and abs(surf.Cylinder().Radius()-10)<.001:
    c=surf.Cylinder(); p=c.Location(); d=c.Axis().Direction()
    hinges.append([p.X(),p.Y(),p.Z()]); part['axis']=[d.X(),d.Y(),d.Z()]
  assert len(hinges)==2, 'Expected the two propeller hinge cylinders'
  part['pivot']=[sum(p[k] for p in hinges)/2 for k in range(3)]
  if part['axis'][1]<0:part['axis']=[-v for v in part['axis']]
 compound=TopoDS_Compound(); builder=BRep_Builder(); builder.MakeCompound(compound)
 for i in part['shells']:builder.Add(compound,shells.FindKey(i))
 writer=StlAPI_Writer();writer.ASCIIMode=False
 assert writer.Write(compound,str(output/(part['name']+'.stl')))
 edges=TopTools_IndexedMapOfShape(); TopExp.MapShapes_s(compound,TopAbs_EDGE,edges)
 values=array.array('f'); failed=0
 for i in range(1,edges.Extent()+1):
  try:
   curve=BRepAdaptor_Curve(TopoDS.Edge_s(edges.FindKey(i))); sample=GCPnts_QuasiUniformDeflection(curve,1.2)
   if not sample.IsDone():failed+=1;continue
   points=[curve.Value(sample.Parameter(j)) for j in range(1,sample.NbPoints()+1)]
   for a,b in zip(points,points[1:]):
    if a.Distance(b)>.8:values.extend([a.X(),a.Y(),a.Z(),b.X(),b.Y(),b.Z()])
  except Exception:failed+=1
 assert values
 (output/(part['name']+'-edges.bin')).write_bytes(values.tobytes())
 part.update(segments=len(values)//6,failedEdges=failed,bounds=[[min(values[k::3]),max(values[k::3])] for k in range(3)])
 print(part['name'],part['segments'],'segments',flush=True)
(output/'parts.json').write_text(json.dumps(parts,indent=2))
print('Done in',round(time.time()-start,1),'seconds',flush=True)
