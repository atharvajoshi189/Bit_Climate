from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
import tempfile
import requests
import json
from datetime import datetime

def create_pdf_report(stats, start_map, end_map, start_date, end_date):
    pdf_path = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf").name
    doc = SimpleDocTemplate(pdf_path, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    styles = getSampleStyleSheet()
    
    # --- Custom Styles ---
    title_style = ParagraphStyle("TitleStyle", parent=styles["Title"], alignment=1, fontSize=24, spaceAfter=12)
    header_style = ParagraphStyle("HeaderStyle", parent=styles["h2"], alignment=0, fontSize=14, spaceBefore=12, spaceAfter=6)
    normal_center = ParagraphStyle("NormalCenter", parent=styles["Normal"], alignment=1, spaceAfter=12)
    footer_style = ParagraphStyle("Footer", parent=styles["Normal"], alignment=1, fontSize=8, textColor=colors.grey)
    image_label_style = ParagraphStyle("ImageLabel", parent=styles["Normal"], alignment=1, fontSize=9)
    # ---------------------

    elements = []
    
    # --- Header ---
    elements.append(Paragraph("Deforestation Analysis Report", title_style))
    elements.append(Paragraph(f"Analysis Period: {start_date} to {end_date}", normal_center))
    elements.append(Spacer(1, 24))
    
    # --- Statistics Table ---
    elements.append(Paragraph("Summary Statistics", header_style))
    stats_dict = json.loads(stats) if isinstance(stats, str) else stats
    data = [["Metric", "Value"]]
    for k, v in stats_dict.items():
        data.append([str(k), str(v)])

    table = Table(data, hAlign="LEFT", colWidths=[200, 100])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#34495E")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(table)
    elements.append(Spacer(1, 24))

    # --- Imagery Section ---
    elements.append(Paragraph("Visual Comparison", header_style))

    def download_image(url):
        try:
            resp = requests.get(url, timeout=20)
            if resp.ok:
                tmp_img = tempfile.NamedTemporaryFile(delete=False, suffix=".png").name
                with open(tmp_img, "wb") as f: f.write(resp.content)
                return tmp_img
        except Exception as e: 
            print(f"Failed to download image: {e}")
            return None

    start_img_path = download_image(start_map)
    end_img_path = download_image(end_map)

    if start_img_path and end_img_path:
        # Create a table to hold images and their labels
        img1 = RLImage(start_img_path, width=220, height=220)
        label1 = Paragraph(f"Before: {start_date}", image_label_style)
        img2 = RLImage(end_img_path, width=220, height=220)
        label2 = Paragraph(f"After: {end_date} (with overlay)", image_label_style)
        
        image_table = Table([[ (img1, label1), (img2, label2) ]], colWidths=[240, 240])
        image_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('ALIGN', (0,0), (-1,-1), 'CENTER')
        ]))
        elements.append(image_table)
    
    elements.append(Spacer(1, 48))
    elements.append(Paragraph(f"Report generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", footer_style))
    
    doc.build(elements)
    return pdf_path