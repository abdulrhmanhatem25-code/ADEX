import { useState, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * A custom hook to export a React component's DOM to a PDF file.
 * 
 * @param {Object} options - Default options.
 * @param {string} [options.defaultFilename="document.pdf"] - The default name of the downloaded file.
 * @param {number} [options.scale=2] - The scale for html2canvas to improve quality.
 * @returns {Object} { printRef, isDownloading, exportPdf }
 */
export default function usePdfExport({ defaultFilename = "document.pdf", scale = 2 } = {}) {
    const printRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const exportPdf = useCallback(async (filenameOverride = null) => {
        if (!printRef.current) return;
        setIsDownloading(true);

        try {
            const canvas = await html2canvas(printRef.current, {
                scale,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff"
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = pdfHeight;
            let position = 0;
            const pageHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
            }

            const finalFilename = filenameOverride || defaultFilename;
            // Ensure filename ends with .pdf
            const nameWithExtension = finalFilename.toLowerCase().endsWith('.pdf')
                ? finalFilename
                : `${finalFilename}.pdf`;

            pdf.save(nameWithExtension);
        } catch (error) {
            console.error("Failed to generate PDF", error);
        } finally {
            setIsDownloading(false);
        }
    }, [defaultFilename, scale]);

    return { printRef, isDownloading, exportPdf };
}
