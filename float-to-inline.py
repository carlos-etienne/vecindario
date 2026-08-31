"""
Convierte todas las imágenes "floating" (wp:anchor) a "inline" (wp:inline)
para que se comporten como caracteres dentro del flujo del texto y se
acomoden dentro de los cuadros expandibles.

Antes: las imágenes flotaban encima del texto (causaba el descuadre)
Después: las imágenes se anclan como carácter y empujan el texto

Conserva tamaño y propiedades de cada imagen. Solo cambia el modo de anclaje.
"""
import zipfile
from lxml import etree
import shutil
import re

NS = {
    'w':  'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    'a':  'http://schemas.openxmlformats.org/drawingml/2006/main',
    'r':  'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'pic':'http://schemas.openxmlformats.org/drawingml/2006/picture',
}
WP = f'{{{NS["wp"]}}}'

DOC_PATH = "brief-diseno-vecindario.docx"
TMP_PATH = "brief-diseno-vecindario.tmp.docx"

with zipfile.ZipFile(DOC_PATH, 'r') as z:
    doc_xml = z.read('word/document.xml')

# Register namespaces so output keeps correct prefixes
for prefix, uri in NS.items():
    etree.register_namespace(prefix, uri)

root = etree.fromstring(doc_xml)
body = root.find('w:body', NS)

# Find all <wp:anchor> elements (floating images)
anchors = body.findall('.//wp:anchor', NS)
print(f"Found {len(anchors)} floating (wp:anchor) images")

converted = 0
for anchor in anchors:
    # Get the parent drawing element (<w:drawing>)
    parent_drawing = anchor.getparent()  # this should be <w:drawing>

    # Create a new <wp:inline> element by copying the anchor's content
    # but with tag 'inline' instead of 'anchor'
    # Inline elements don't need position/behindDoc/etc attributes

    # Extract essential attributes
    distT = anchor.get(WP + 'distT', '0')
    distB = anchor.get(WP + 'distB', '0')
    distL = anchor.get(WP + 'distL', '0')
    distR = anchor.get(WP + 'distR', '0')

    # Create new inline element
    inline = etree.SubElement(parent_drawing, f'{WP}inline')
    inline.set(WP + 'distT', distT)
    inline.set(WP + 'distB', distB)
    inline.set(WP + 'distL', distL)
    inline.set(WP + 'distR', distR)

    # Move all children from anchor to inline
    # Children are typically: <wp:simplePos/>, <wp:positionH/>, <wp:positionV/>,
    # <wp:extent/>, <wp:effectExtent/>, <wp:docPr/>, <wp:cNvGraphicFramePr/>, <a:graphic>
    # For inline, we only want: <wp:extent>, <wp:effectExtent>, <wp:docPr>,
    # <wp:cNvGraphicFramePr>, <a:graphic> (skip position elements)
    skip_tags = {
        WP + 'simplePos',
        WP + 'positionH',
        WP + 'positionV',
        WP + 'extent',         # we'll re-add
        WP + 'effectExtent',   # we'll re-add
    }
    # Take children in order, filter
    children_to_move = []
    for child in list(anchor):
        tag = child.tag
        if tag in (WP + 'simplePos', WP + 'positionH', WP + 'positionV',
                   WP + 'behindDoc', WP + 'relativeFrom'):
            continue  # skip positioning, not valid in inline
        children_to_move.append(child)

    for child in children_to_move:
        anchor.remove(child)
        inline.append(child)

    # Remove the now-empty anchor
    parent_drawing.remove(anchor)
    converted += 1

print(f"Converted {converted} images: floating → inline")

# Write back
with zipfile.ZipFile(DOC_PATH, 'r') as zin:
    with zipfile.ZipFile(TMP_PATH, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.namelist():
            if item == 'word/document.xml':
                new_xml = etree.tostring(root, xml_declaration=True,
                                         encoding='UTF-8', standalone=True)
                zout.writestr(item, new_xml)
            else:
                zout.writestr(item, zin.read(item))

shutil.move(TMP_PATH, DOC_PATH)
print(f"Saved: {DOC_PATH}")
