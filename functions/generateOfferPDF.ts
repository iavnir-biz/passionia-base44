import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.2';

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

    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    // Helper to add text with word wrap
    const addText = (text, fontSize, isBold = false, color = [0, 0, 0]) => {
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      if (isBold) doc.setFont(undefined, 'bold');
      else doc.setFont(undefined, 'normal');
      
      const lines = doc.splitTextToSize(text, 170);
      doc.text(lines, margin, y);
      y += lines.length * (fontSize * 0.5) + 5;
      
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
    };

    const addSection = (title) => {
      y += 5;
      addText(title, 14, true, [97, 247, 162]);
      y += 3;
    };

    // Title
    addText(offerTypeName || 'Mon Offre', 20, true);
    y += 3;

    // Offer Title & Price
    if (offer.title) {
      addText(offer.title, 16, true);
    }
    if (offer.price) {
      addText(offer.price, 14, false, [34, 139, 34]);
      y += 3;
    }

    // Subtitle
    if (offer.subtitle) {
      addText(offer.subtitle, 11, false, [100, 100, 100]);
      y += 5;
    }

    // Description
    if (offer.description) {
      addSection('Description');
      addText(offer.description, 10);
    }

    // Problem
    if (offer.problem) {
      addSection('Problème résolu');
      addText(offer.problem, 10);
    }

    // Transformation (Before → After)
    if (offer.before || offer.after) {
      addSection('Transformation');
      if (offer.before) {
        addText('❌ Avant : ' + offer.before, 10);
      }
      if (offer.after) {
        addText('✅ Après : ' + offer.after, 10);
      }
    }

    // Deliverables
    if (offer.deliverables && offer.deliverables.length > 0) {
      addSection('Ce que tu reçois');
      offer.deliverables.forEach((item, i) => {
        addText(`• ${item}`, 10);
      });
    }

    // Benefits
    if (offer.benefits && offer.benefits.length > 0) {
      addSection('Bénéfices clés');
      offer.benefits.slice(0, 5).forEach((item) => {
        addText(`→ ${item}`, 10);
      });
    }

    // Ideal For
    if (offer.ideal_for && offer.ideal_for.length > 0) {
      addSection('Idéal pour');
      offer.ideal_for.slice(0, 5).forEach((item) => {
        addText(`• ${item}`, 10);
      });
    }

    // Duration
    if (offer.duration) {
      addSection('Durée');
      addText(offer.duration, 10);
    }

    // Ecosystem Role
    if (offer.ecosystem_role) {
      addSection('Rôle dans ton funnel');
      addText(offer.ecosystem_role, 10);
    }

    // Footer
    y = 280;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, y);

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