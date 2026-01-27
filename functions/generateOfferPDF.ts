import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.2';

// Fonction pour nettoyer les caractères spéciaux
const cleanText = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[À-ÿ]/g, (char) => {
      const accents = 'ÀÁÂÃÄÅàáâãäåÈÉÊËèéêëÌÍÎÏìíîïÒÓÔÕÖòóôõöÙÚÛÜùúûüÝýÿÑñÇç';
      const noAccents = 'AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuYyyNnCc';
      const index = accents.indexOf(char);
      return index !== -1 ? noAccents[index] : char;
    });
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { offer, offerTypeName } = body;

    if (!offer) {
      return Response.json({ error: 'Offer data required' }, { status: 400 });
    }

    const doc = new jsPDF('p', 'mm', 'a4', true);
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;

    // Helper to add text with word wrap
    const addText = (text, fontSize, isBold = false, color = [0, 0, 0], align = 'left') => {
      if (!text) return;
      
      const cleanedText = cleanText(text);
      
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      const maxWidth = pageWidth - (2 * margin);
      const lines = doc.splitTextToSize(cleanedText, maxWidth);
      
      lines.forEach((line) => {
        if (y > 270) {
          doc.addPage();
          y = margin;
        }
        
        let xPos = margin;
        if (align === 'center') {
          const lineWidth = doc.getTextWidth(line);
          xPos = (pageWidth - lineWidth) / 2;
        }
        
        doc.text(line, xPos, y);
        y += fontSize * 0.5 + 2;
      });
      
      y += 3;
    };

    const addSection = (title) => {
      if (y > 250) {
        doc.addPage();
        y = margin;
      }
      y += 8;
      doc.setFillColor(97, 247, 162);
      doc.rect(margin, y - 5, 4, 8, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(cleanText(title), margin + 8, y);
      y += 10;
    };

    const addDivider = () => {
      y += 3;
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
    };

    // Header avec fond coloré
    doc.setFillColor(97, 247, 162);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(cleanText(offerTypeName || 'Mon Offre'), margin, 15);
    
    if (offer.title) {
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(cleanText(offer.title), pageWidth - (2 * margin));
      doc.text(titleLines, margin, 28);
    }
    
    if (offer.price) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(cleanText(offer.price), margin, 42);
    }
    
    y = 65;

    // Subtitle
    if (offer.subtitle) {
      addText(offer.subtitle, 11, false, [80, 80, 80]);
      addDivider();
    }

    // Description
    if (offer.description) {
      addSection('Description');
      addText(offer.description, 10);
    }

    // Problem
    if (offer.problem) {
      addSection('Probleme resolu');
      addText(offer.problem, 10);
    }

    // Transformation (Before → After)
    if (offer.before || offer.after) {
      addSection('Transformation');
      if (offer.before) {
        doc.setTextColor(200, 50, 50);
        addText('AVANT : ' + String(offer.before), 10);
      }
      if (offer.after) {
        doc.setTextColor(50, 150, 50);
        addText('APRES : ' + String(offer.after), 10);
      }
      doc.setTextColor(0, 0, 0);
    }

    // Deliverables
    if (offer.deliverables && offer.deliverables.length > 0) {
      addSection('Ce que tu recois');
      offer.deliverables.forEach((item, i) => {
        if (y > 265) {
          doc.addPage();
          y = margin;
        }
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(margin, y - 4, pageWidth - (2 * margin), 10, 2, 2, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const cleanedItem = cleanText(item);
        const itemLines = doc.splitTextToSize(cleanedItem, pageWidth - (2 * margin) - 10);
        doc.text(itemLines, margin + 5, y);
        y += itemLines.length * 5 + 8;
      });
    }

    // Benefits
    if (offer.benefits && offer.benefits.length > 0) {
      addSection('Benefices cles');
      offer.benefits.slice(0, 5).forEach((item) => {
        addText('→ ' + String(item), 10);
      });
    }

    // Ideal For
    if (offer.ideal_for && offer.ideal_for.length > 0) {
      addSection('Ideal pour');
      offer.ideal_for.slice(0, 5).forEach((item) => {
        addText('• ' + String(item), 10);
      });
    }

    // Duration
    if (offer.duration) {
      addSection('Duree');
      addText(offer.duration, 10);
    }

    // Ecosystem Role
    if (offer.ecosystem_role) {
      addSection('Role dans ton funnel');
      addText(offer.ecosystem_role, 10);
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text('Genere le ' + new Date().toLocaleDateString('fr-FR'), margin, footerY);

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${offerTypeName || 'offre'}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate PDF' 
    }, { status: 500 });
  }
});