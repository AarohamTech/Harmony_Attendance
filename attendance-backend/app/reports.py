import io
import csv
from typing import List, Dict, Any
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_csv_report(records: List[Dict[str, Any]]) -> str:
    output = io.StringIO()
    if not records:
        return ""
    
    writer = csv.DictWriter(output, fieldnames=list(records[0].keys()))
    writer.writeheader()
    for row in records:
        writer.writerow(row)
    
    return output.getvalue()

def generate_excel_report(records: List[Dict[str, Any]]) -> bytes:
    df = pd.DataFrame(records)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Attendance Report')
    return output.getvalue()

def generate_pdf_report(records: List[Dict[str, Any]], title: str = "Attendance Report") -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    story = []

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'ReportTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#1e3a8a"),
        alignment=1, # Center
        spaceAfter=20
    )

    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 10))

    if not records:
        story.append(Paragraph("No records found for the requested date range.", styles['Normal']))
    else:
        # Prepare table headers and data
        headers = list(records[0].keys())
        data = [[h.replace('_', ' ').title() for h in headers]]

        for r in records:
            row = [str(r.get(h, '')) for h in headers]
            data.append(row)

        table = Table(data, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
        ]))
        story.append(table)

    doc.build(story)
    return buffer.getvalue()
