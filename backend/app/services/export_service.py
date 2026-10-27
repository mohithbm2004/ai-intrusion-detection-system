import io
import pandas as pd
from typing import List
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from app.models.prediction import PredictionRecord

class ExportService:
    @staticmethod
    def export_to_csv(records: List[PredictionRecord]) -> bytes:
        data = []
        for r in records:
            data.append({
                "Flow ID": r.id,
                "Timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M:%S") if r.timestamp else "",
                "Source IP": r.source_ip,
                "Destination IP": r.destination_ip,
                "Prediction": r.prediction,
                "Attack Type": r.attack_type,
                "Is Attack": "YES" if r.is_attack else "NO",
                "Confidence (%)": r.confidence_score
            })
        df = pd.DataFrame(data)
        buffer = io.BytesIO()
        df.to_csv(buffer, index=False)
        return buffer.getvalue()

    @staticmethod
    def export_to_excel(records: List[PredictionRecord]) -> bytes:
        data = []
        for r in records:
            data.append({
                "Flow ID": r.id,
                "Timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M:%S") if r.timestamp else "",
                "Source IP": r.source_ip,
                "Destination IP": r.destination_ip,
                "Prediction": r.prediction,
                "Attack Type": r.attack_type,
                "Is Attack": "YES" if r.is_attack else "NO",
                "Confidence (%)": r.confidence_score
            })
        df = pd.DataFrame(data)
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Intrusion Predictions')
        return buffer.getvalue()

    @staticmethod
    def export_to_pdf(records: List[PredictionRecord], filename: str = "Prediction_Report.pdf") -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
        elements = []

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor("#1e293b"),
            spaceAfter=12
        )
        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor("#64748b"),
            spaceAfter=20
        )

        elements.append(Paragraph("AI Intrusion Detection System - Analysis Report", title_style))
        elements.append(Paragraph(f"Generated Total Flow Records: {len(records)}", subtitle_style))

        # Table data
        table_data = [["ID", "Timestamp", "Source IP", "Dest IP", "Attack Type", "Prediction", "Confidence"]]
        
        for r in records[:100]:  # Limit to 100 rows for clean PDF formatting
            t_str = r.timestamp.strftime("%Y-%m-%d %H:%M") if r.timestamp else ""
            table_data.append([
                str(r.id),
                t_str,
                r.source_ip,
                r.destination_ip,
                r.attack_type[:20],
                r.prediction,
                f"{r.confidence_score:.1f}%"
            ])

        t = Table(table_data, colWidths=[30, 95, 90, 90, 110, 65, 60])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
        ]))

        elements.append(t)
        doc.build(elements)
        return buffer.getvalue()

export_service = ExportService()
