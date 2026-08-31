"""
Arregla el recorte de imágenes inline.

Problema: cuando una imagen inline está en un párrafo con lineRule='exact'
(heredado del body del documento), la línea tiene altura fija y recorta
la imagen a solo una franja visible.

Solución: para cualquier párrafo que contenga un <wp:inline>, cambiar
lineRule a 'auto' (o eliminarlo) para que la altura de línea se ajuste.

También elimina las imágenes que quedaron pegadas dentro de párrafos
de Heading (cuando se pegaron sobre un título por accidente) — pero NO
las borra, solo mueve el <w:drawing> a su propio párrafo dedicado
justo después, para que se vean completas.
"""
import zipfile
from lxml import etree
import shutil

NS = {
    'w':  'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    'a':  'http://schemas.openxmlformats.org/drawingml/2006/main',
    'r':  'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
}
W = f'{{{NS["w"]}}}'
WP = f'{{{NS["wp"]}}}'

DOC_PATH = "brief-diseno-vecindario.docx"
TMP_PATH = "brief-diseno-vecindario.tmp.docx"

with zipfile.ZipFile(DOC_PATH, 'r') as z:
    doc_xml = z.read('word/document.xml')

for prefix, uri in NS.items():
    etree.register_namespace(prefix, uri)

root = etree.fromstring(doc_xml)
body = root.find('w:body', NS)

fixed_spacing = 0
moved_from_heading = 0

# Find all paragraphs containing an inline image
all_paragraphs = body.findall('.//w:p', NS)
for p in all_paragraphs:
    # Does this paragraph contain an inline drawing?
    has_inline = p.find('.//wp:inline', NS) is not None
    if not has_inline:
        continue

    # 1) Fix line spacing: change 'exact' to 'auto' so the line grows
    pPr = p.find('w:pPr', NS)
    if pPr is not None:
        spacing = pPr.find('w:spacing', NS)
        if spacing is not None:
            rule = spacing.get(W + 'lineRule')
            if rule == 'exact':
                # change to auto - line grows to fit content (the image)
                spacing.set(W + 'lineRule', 'auto')
                fixed_spacing += 1
            # also: if 'line' value is too small, it might still clip;
            # 'auto' rule ignores the 'line' value and grows naturally
        else:
            # no spacing element — fine
            pass

    # 2) If this paragraph is a Heading (image accidentally pasted over a title),
    # move the drawing to a new dedicated paragraph after it.
    pStyle = pPr.find('w:pStyle', NS) if pPr is not None else None
    if pStyle is not None:
        style_val = pStyle.get(W + 'val')
        # Heading styles in this doc are localized: Ttulo1, Ttulo2, Ttulo3
        if style_val and (style_val.startswith('Ttulo') or 'eading' in style_val):
            # Find the <w:r> runs that contain drawings
            runs_with_drawings = []
            for r in p.findall('w:r', NS):
                if r.find('.//w:drawing', NS) is not None:
                    runs_with_drawings.append(r)
            for r in runs_with_drawings:
                # Create a new paragraph with no style (Normal)
                new_p = etree.Element(W + 'p')
                # Move the run into the new paragraph
                p.remove(r)
                new_p.append(r)
                # Insert new_p right after p
                parent = p.getparent()
                p_idx = list(parent).index(p)
                parent.insert(p_idx + 1, new_p)
                moved_from_heading += 1

print(f"Fixed line spacing (exact → auto) on {fixed_spacing} image paragraphs")
print(f"Moved {moved_from_heading} image(s) out of Heading paragraphs into dedicated paragraphs")

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
