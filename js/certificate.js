/**
 * Igniter Team - Bible Memorization Competition Certificate Generator
 * Draws high-resolution printable certificates dynamically customized from Admin settings
 */

window.CertificateGenerator = {
    // Generate and render certificate on a target canvas based on active settings
    render: function({ canvasId, name, church, illaka, score, rank, ageGroup, dateStr, isParticipation }) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Define high-res dimensions (A4 ratio: 1414 x 1000)
        canvas.width = 1414;
        canvas.height = 1000;
        
        const w = canvas.width;
        const h = canvas.height;

        // Fetch custom certificate settings
        const settings = window.db.getCertificateSettings();
        const lang = localStorage.getItem('lang') || 'ne';
        
        const themeColor = settings.theme_color || '#0a3064'; // Custom Admin Border Color
        const goldColor = '#D4AF37';

        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);

        // 1. Draw Outer Border (Customizable Theme Color)
        ctx.lineWidth = 24;
        ctx.strokeStyle = themeColor; 
        ctx.strokeRect(12, 12, w - 24, h - 24);

        // 2. Draw Elegant Gold Inner Border
        ctx.lineWidth = 6;
        ctx.strokeStyle = goldColor; 
        ctx.strokeRect(34, 34, w - 68, h - 68);

        // 3. Draw Decorative Corner Accents (Gold Flourishes)
        const drawCorner = (cx, cy, rotation) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rotation);
            ctx.strokeStyle = goldColor;
            ctx.lineWidth = 4;
            
            // Corner lines
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(40, 0);
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 40);
            ctx.stroke();

            // Elegant circles
            ctx.fillStyle = goldColor;
            ctx.beginPath();
            ctx.arc(15, 15, 6, 0, Math.PI * 2);
            ctx.arc(35, 15, 4, 0, Math.PI * 2);
            ctx.arc(15, 35, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };

        drawCorner(45, 45, 0); // Top-left
        drawCorner(w - 45, 45, Math.PI / 2); // Top-right
        drawCorner(w - 45, h - 45, Math.PI); // Bottom-right
        drawCorner(45, h - 45, -Math.PI / 2); // Bottom-left

        // 4. Subtle Watermark in Center
        if (settings.watermark_url && settings.watermark_url.startsWith('data:image')) {
            const wmImg = new Image();
            wmImg.onload = () => {
                ctx.save();
                ctx.globalAlpha = 0.08;
                const wmRatio = wmImg.naturalWidth / wmImg.naturalHeight;
                const wmHeight = 450;
                const wmWidth = wmHeight * wmRatio;
                ctx.drawImage(wmImg, w / 2 - wmWidth / 2, h / 2 - wmHeight / 2, wmWidth, wmHeight);
                ctx.restore();
            };
            wmImg.src = settings.watermark_url;
        } else {
            ctx.save();
            ctx.globalAlpha = 0.035;
            ctx.strokeStyle = themeColor;
            ctx.lineWidth = 10;
            
            ctx.beginPath();
            // Cross shape
            ctx.moveTo(w / 2, h / 2 - 180);
            ctx.lineTo(w / 2, h / 2 + 180);
            ctx.moveTo(w / 2 - 120, h / 2 - 40);
            ctx.lineTo(w / 2 + 120, h / 2 - 40);
            ctx.stroke();

            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, 220, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // 5. Header: Company Brand Subtitle & Logo
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (settings.logo_url && settings.logo_url.startsWith('data:image')) {
            const logoImg = new Image();
            logoImg.onload = () => {
                const logoRatio = logoImg.naturalWidth / logoImg.naturalHeight;
                const logoHeight = 120;
                const logoWidth = logoHeight * logoRatio;
                ctx.drawImage(logoImg, w / 2 - logoWidth / 2, 70, logoWidth, logoHeight);
            };
            logoImg.src = settings.logo_url;
        } else {
            ctx.fillStyle = goldColor;
            ctx.font = 'bold 24px "Outfit", "Inter", "Arial"';
            ctx.fillText('IGNITER TEAM • INTO THE WAY OF JESUS CHRIST', w / 2, 100);

            // Menorah Symbol in Vector
            ctx.strokeStyle = themeColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(w / 2 - 40, 190);
            ctx.lineTo(w / 2 + 40, 190);
            ctx.moveTo(w / 2, 190);
            ctx.lineTo(w / 2, 140);
            for (let r = 15; r <= 35; r += 10) {
                ctx.arc(w / 2, 140, r, 0, Math.PI, true);
            }
            ctx.stroke();
        }

        // 6. Title Heading (Editable Title)
        ctx.fillStyle = themeColor;
        ctx.font = 'bold 64px "Inter", "Noto Sans", "Arial"';
        let titleText = lang === 'en' ? settings.title_en : settings.title_ne;
        let subTitleText = lang === 'en' ? 'CERTIFICATE OF ACHIEVEMENT' : 'प्रशंसा-पत्र';

        if (isParticipation) {
            titleText = lang === 'en' ? 'Certificate of Participation' : 'सहभागिताको प्रमाणपत्र';
            subTitleText = lang === 'en' ? 'CERTIFICATE OF PARTICIPATION' : 'सहभागिताको प्रमाणपत्र';
        }
        ctx.fillText(titleText, w / 2, 240);

        ctx.fillStyle = '#666666';
        ctx.font = 'italic 20px "Arial"';
        ctx.fillText(subTitleText, w / 2, 290);

        // Name Introduction
        ctx.fillStyle = '#444444';
        ctx.font = 'italic 22px "Arial"';
        ctx.fillText(lang === 'en' ? 'This certificate is proudly presented to:' : 'यो प्रमाणपत्र स-सम्मान प्रदान गरिएको छ:', w / 2, 360);

        // Participant Name (Large & Elegant brand themed)
        ctx.fillStyle = themeColor;
        ctx.font = 'bold 52px "Inter", "Noto Sans", "Arial"';
        ctx.fillText(name, w / 2, 420);

        // Underline Name
        ctx.strokeStyle = goldColor;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 280, 460);
        ctx.lineTo(w / 2 + 280, 460);
        ctx.stroke();

        // Church & Region details
        ctx.fillStyle = '#555555';
        ctx.font = 'bold 22px "Inter", "Noto Sans", "Arial"';
        ctx.fillText(`${church} (${illaka})`, w / 2, 500);

        // Dynamic Description Assembly
        let descTemplate = lang === 'en' ? settings.description_en : settings.description_ne;
        
        if (isParticipation) {
            descTemplate = lang === 'en' 
                ? 'is proudly awarded this certificate for successfully participating in the "Bible Memorization Contest 2026" organized by Igniter Team. We appreciate your effort and dedication.'
                : 'लाई इग्नाइटर टिमद्वारा आयोजित "बाइबल पढ कण्ठस्त प्रतियोगिता २०८३" मा सफलतापूर्वक सहभागी हुनुभएकोमा यो प्रमाणपत्र प्रदान गरिएको छ। उहाँको प्रयास र समर्पणको हामी उच्च कदर गर्दछौं।';
        } else {
            // Parse placeholders for achievement
            descTemplate = descTemplate.replace(/{score}/g, score).replace(/{rank}/g, rank);
        }
        
        ctx.fillStyle = '#333333';
        ctx.font = '23px "Inter", "Noto Sans", "Arial"';
        
        // Wrap description text to fit canvas gracefully
        this.wrapText(ctx, descTemplate, w / 2, 570, 950, 40);

        // Watermarked Scripture Verse
        ctx.fillStyle = goldColor;
        ctx.font = 'italic 21px "Arial"';
        const scripture = lang === 'en' ? settings.verse_en : settings.verse_ne;
        ctx.fillText(scripture, w / 2, 735);

        // 8. Signatures & Date
        const sigY = 875;
        const finalDate = dateStr || (lang === 'en' ? 'May 29, 2026' : 'जेष्ठ १५, २०८३');

        // Date
        ctx.fillStyle = '#555555';
        ctx.font = '20px "Inter", "Noto Sans", "Arial"';
        ctx.fillText(lang === 'en' ? `Date: ${finalDate}` : `मिति: ${finalDate}`, 200, sigY + 20);

        // Dynamic Signatories
        const signatories = settings.signatories || [];
        const sigStartX = w - (signatories.length * 300) - 50;
        
        signatories.forEach((sig, idx) => {
            const cx = sigStartX + (idx * 300) + 150;
            
            ctx.strokeStyle = '#555555';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - 100, sigY - 20);
            ctx.lineTo(cx + 100, sigY - 20);
            ctx.stroke();

            ctx.fillStyle = '#555555';
            ctx.font = '18px "Inter", "Noto Sans", "Arial"';
            ctx.fillText(lang === 'en' ? sig.title_en : sig.title_ne, cx, sigY + 10);

            if (sig.signature_url && sig.signature_url.startsWith('data:image')) {
                const img = new Image();
                img.onload = () => {
                    const imgRatio = img.naturalWidth / img.naturalHeight;
                    const drawHeight = 60;
                    const drawWidth = drawHeight * imgRatio;
                    ctx.drawImage(img, cx - drawWidth / 2, sigY - 25 - drawHeight, drawWidth, drawHeight);
                };
                img.src = sig.signature_url;
            } else {
                ctx.fillStyle = '#222222';
                ctx.font = 'italic 23px "Brush Script MT", "Arial"';
                ctx.fillText(sig.name, cx, sigY - 40); 
            }
        });
    },

    // Canvas Text Wrapping Function
    wrapText: function(ctx, text, x, y, maxWidth, lineHeight) {
        // Simple word wrapping for standard text outputs
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            let testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    },

    // Download canvas as PNG
    download: function(canvasId, filename = 'certificate.png') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        try {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            link.click();
        } catch (e) {
            console.error('Certificate download error:', e);
        }
    }
};
