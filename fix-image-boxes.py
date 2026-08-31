"""
Cambia la altura de los cuadros de imagen de 'exact' a 'atLeast'.
- Antes: altura fija de 1800-2200 twips → las imágenes se desbordan
- Después: altura mínima (atLeast) → la celda crece para acomodar la imagen

Esto se aplica SOLO a las tablas que contienen el marcador 'Pega aquí la imagen'.
Las demás tablas (datos operativos, decisiones técnicas, etc.) no se tocan.
"""
import zipfile
from lxml import etree
import shutil
import os

NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
W = f'{{{NS["w"]}}}'

DOC_PATH = "brief-diseno-vecindario.docx"
TMP_PATH = "brief-diseno-vecindario.tmp.docx"

# Read document.xml from the docx (zip)
with zipfile.ZipFile(DOC_PATH, 'r') as z:
    doc_xml = z.read('word/document.xml')

root = etree.fromstring(doc_xml)
body = root.find('w:body', NS)
tables = body.findall('.//w:tbl', NS)

modified_count = 0
for tbl in tables:
    # Check if this is an image box (contains the marker text)
    texts = tbl.findall('.//w:t', NS)
    txt = ''.join(t.text or '' for t in texts)
    if 'Pega aqu' not in txt:
        continue

    # Find all rows and change their trHeight from exact to atLeast
    rows = tbl.findall('.//w:tr', NS)
    for row in rows:
        trPr = row.find('w:trPr', NS)
        if trPr is None:
            continue
        trHeight = trPr.find('w:trHeight', NS)
        if trHeight is None:
            continue
        rule = trHeight.get(W + 'hRule')
        if rule == 'exact':
            trHeight.set(W + 'hRule', 'atLeast')
            modified_count += 1

print(f"Modified {modified_count} image-box rows: 'exact' → 'atLeast'")

# Now write the modified XML back into the docx (copy all other files as-is)
with zipfile.ZipFile(DOC_PATH, 'r') as zin:
    with zipfile.ZipFile(TMP_PATH, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.namelist():
            if item == 'word/document.xml':
                # write modified XML
                new_xml = etree.tostring(root, xml_declaration=True,
                                         encoding='UTF-8', standalone=True)
                zout.writestr(item, new_xml)
            else:
                zout.writestr(item, zin.read(item))

# Replace original
shutil.move(TMP_PATH, DOC_PATH)
print(f"Saved: {DOC_PATH}")
