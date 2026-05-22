"""
PDF generation utility using reportlab.
pip install reportlab
"""
from io import BytesIO
from datetime import datetime
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
    HRFlowable,
)

BRAND_PRIMARY = colors.HexColor("#2563eb")
BRAND_DARK = colors.HexColor("#1e3a5f")
HEADER_BG = colors.HexColor("#1e40af")
ROW_ALT = colors.HexColor("#f0f4ff")
WHITE = colors.white
GREY = colors.HexColor("#6b7280")
BORDER = colors.HexColor("#cbd5e1")


def _base_doc(buffer: BytesIO, title: str, landscape_mode: bool = False):
    pagesize = landscape(A4) if landscape_mode else A4
    return SimpleDocTemplate(
        buffer,
        pagesize=pagesize,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        title=title,
        author="Rojgar Admin",
    )


def _header_elements(title: str, subtitle: str, styles) -> list:
    elements = []
    elements.append(
        Paragraph(
            f'<font color="#1e40af"><b>Rojgar </b></font> &nbsp;|&nbsp; Admin Report',
            ParagraphStyle(
                "brand",
                parent=styles["Normal"],
                fontSize=10,
                textColor=GREY,
            ),
        )
    )
    elements.append(Spacer(1, 0.3 * cm))
    elements.append(
        Paragraph(
            title,
            ParagraphStyle(
                "title",
                parent=styles["Title"],
                fontSize=20,
                textColor=BRAND_DARK,
                spaceAfter=4,
            ),
        )
    )
    elements.append(
        Paragraph(
            subtitle,
            ParagraphStyle(
                "subtitle",
                parent=styles["Normal"],
                fontSize=9,
                textColor=GREY,
            ),
        )
    )
    elements.append(Spacer(1, 0.3 * cm))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=BRAND_PRIMARY))
    elements.append(Spacer(1, 0.5 * cm))
    return elements


def _table_style(col_widths=None) -> TableStyle:
    return TableStyle(
        [
            # Header row
            ("BACKGROUND", (0, 0), (-1, 0), HEADER_BG),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
            ("TOPPADDING", (0, 0), (-1, 0), 8),
            # Data rows
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 1), (-1, -1), 8),
            ("TOPPADDING", (0, 1), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 1), (-1, -1), 6),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, ROW_ALT]),
            # Borders
            ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
            ("LINEBELOW", (0, 0), (-1, 0), 1.5, BRAND_PRIMARY),
            # Alignment
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
    )


def _footer_text(styles) -> list:
    return [
        Spacer(1, 0.5 * cm),
        HRFlowable(width="100%", thickness=0.5, color=BORDER),
        Spacer(1, 0.2 * cm),
        Paragraph(
            f'Generated on {datetime.now().strftime("%d %b %Y, %H:%M")} &nbsp;|&nbsp; Rojgar Admin Panel',
            ParagraphStyle(
                "footer",
                parent=styles["Normal"],
                fontSize=7,
                textColor=GREY,
                alignment=1,
            ),
        ),
    ]


def generate_table_pdf(
    title: str,
    subtitle: str,
    headers: list[str],
    rows: list[list[Any]],
    col_widths: list[float] | None = None,
    landscape_mode: bool = False,
) -> bytes:
    buffer = BytesIO()
    doc = _base_doc(buffer, title, landscape_mode)
    styles = getSampleStyleSheet()

    elements = _header_elements(title, subtitle, styles)

    table_data = [headers] + rows
    table = Table(table_data, colWidths=col_widths, repeatRows=1)
    table.setStyle(_table_style())

    elements.append(table)
    elements.extend(_footer_text(styles))

    doc.build(elements)
    return buffer.getvalue()