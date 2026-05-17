from io import BytesIO
from datetime import datetime
from typing import Dict, Any
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


def generate_invoice_pdf(invoice: Dict[str, Any]) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "Title",
        parent=styles["Heading1"],
        fontSize=22,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=12,
    )
    label_style = ParagraphStyle(
        "Label",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#64748b"),
    )
    value_style = ParagraphStyle(
        "Value",
        parent=styles["Normal"],
        fontSize=11,
        textColor=colors.HexColor("#0f172a"),
    )

    story = []
    story.append(Paragraph("ROJGAR", title_style))
    story.append(Paragraph("Daily Jobs Platform - Tax Invoice", label_style))
    story.append(Spacer(1, 0.6 * cm))

    meta = [
        ["Invoice No:", invoice.get("invoice_no", "INV-0001")],
        ["Date:", invoice.get("date", datetime.now().strftime("%d %b %Y"))],
        ["Customer:", invoice.get("customer_name", "")],
        ["Worker / Vendor:", invoice.get("worker_name", "")],
        ["Job Title:", invoice.get("job_title", "")],
    ]
    meta_tbl = Table(meta, colWidths=[4.5 * cm, 12 * cm])
    meta_tbl.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#64748b")),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(meta_tbl)
    story.append(Spacer(1, 0.6 * cm))

    items = invoice.get(
        "items",
        [["Description", "Qty (days)", "Rate", "Amount"]],
    )
    tbl = Table(items, colWidths=[8 * cm, 2.5 * cm, 3 * cm, 3 * cm])
    tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
                ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(tbl)
    story.append(Spacer(1, 0.6 * cm))

    total = invoice.get("total", 0)
    story.append(Paragraph(f"<b>Total: Rs. {total:,.2f}</b>", value_style))
    story.append(Spacer(1, 1 * cm))
    story.append(Paragraph(
        "This is a system-generated invoice from Rojgar Platform.",
        label_style,
    ))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
