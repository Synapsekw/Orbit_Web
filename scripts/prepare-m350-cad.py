"""Convert DJI's public STEP assembly locally; no CAD engine ships to the website.
Run using the isolated assets-source/m400/cad-env Python environment.
"""
from pathlib import Path
import json, array, time
from OCP.STEPControl import STEPControl_Reader
from OCP.IFSelect import IFSelect_RetDone
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.StlAPI import StlAPI_Writer
from OCP.TopExp import TopExp
from OCP.TopAbs import TopAbs_EDGE
from OCP.TopTools import TopTools_IndexedMapOfShape
from OCP.TopoDS import TopoDS
from OCP.BRepAdaptor import BRepAdaptor_Curve
from OCP.GCPnts import GCPnts_QuasiUniformDeflection

root=Path('assets-source/m350')
start=time.time()
reader=STEPControl_Reader()
if reader.ReadFile(str(root/'Matrice_350_RTK_3D_Model.stp')) != IFSelect_RetDone:
    raise RuntimeError('Cannot read the official STEP file')
reader.TransferRoots()
shape=reader.OneShape()
print(f'Imported STEP in {time.time()-start:.1f}s',flush=True)
mesh=BRepMesh_IncrementalMesh(shape,1.6,False,0.45,True)
writer=StlAPI_Writer(); writer.ASCIIMode=False
if not writer.Write(shape,str(root/'m350.stl')):
    raise RuntimeError('No triangulated surface exported')
print(f'Surface exported in {time.time()-start:.1f}s',flush=True)
edges=TopTools_IndexedMapOfShape()
TopExp.MapShapes_s(shape,TopAbs_EDGE,edges)
positions=array.array('f'); failures=0
for i in range(1,edges.Extent()+1):
    try:
        curve=BRepAdaptor_Curve(TopoDS.Edge_s(edges.FindKey(i)))
        sample=GCPnts_QuasiUniformDeflection(curve,1.2)
        if not sample.IsDone():
            failures+=1; continue
        points=[curve.Value(sample.Parameter(j)) for j in range(1,sample.NbPoints()+1)]
        for a,b in zip(points,points[1:]):
            if a.Distance(b)>0.8:
                positions.extend([a.X(),a.Y(),a.Z(),b.X(),b.Y(),b.Z()])
    except Exception:
        failures+=1
if not positions: raise RuntimeError('No line geometry exported')
(root/'cad-edges.bin').write_bytes(positions.tobytes())
bounds=[[min(positions[a::3]),max(positions[a::3])] for a in range(3)]
metadata={'segments':len(positions)//6,'sourceEdges':edges.Extent(),'failedEdges':failures,'bounds':bounds,'seconds':round(time.time()-start,1)}
(root/'cad-summary.json').write_text(json.dumps(metadata,indent=2))
print(json.dumps(metadata),flush=True)

# Record meshed shell bounds for identifying the original rotor assemblies.
from OCP.TopAbs import TopAbs_SHELL
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
shells=TopTools_IndexedMapOfShape(); TopExp.MapShapes_s(shape,TopAbs_SHELL,shells)
parts=[]
for i in range(1,shells.Extent()+1):
    b=Bnd_Box(); BRepBndLib.Add_s(shells.FindKey(i),b,True); box=list(b.Get())
    parts.append({'id':i,'bounds':box,'size':[box[j+3]-box[j] for j in range(3)]})
(root/'shell-bounds.json').write_text(json.dumps(parts,indent=2))
print('Shells:',len(parts),flush=True)
