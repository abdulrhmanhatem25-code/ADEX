import { useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

/**
 * Custom hook that encapsulates the PDF export logic for the Course Map.
 *
 * @param {React.RefObject} containerRef - Ref to the map container element.
 * @param {string} specializationLabel - The student's department/specialization name.
 * @param {number} programId - The program ID (used to infer CS/IT if label is missing).
 * @returns {{ isExporting: boolean, exportToPDF: Function }}
 */
export function useCourseMapExport(containerRef, specializationLabel, programId) {
    const [isExporting, setIsExporting] = useState(false);

    const exportToPDF = async () => {
        if (!containerRef.current) return;

        try {
            setIsExporting(true);

            // Wait for React to re-render with orthogonal lines & forced horizontal layout
            await new Promise(resolve => setTimeout(resolve, 300));

            // Temporarily inject a title element into the captured area
            const exportTitle = document.createElement("div");
            exportTitle.style.position = "absolute";
            exportTitle.style.top = "20px";
            exportTitle.style.left = "32px";
            exportTitle.style.fontSize = "24px";
            exportTitle.style.fontWeight = "bold";
            exportTitle.style.color = "#334155";
            exportTitle.style.zIndex = "50";
            exportTitle.innerText = `Curriculum Map - ${specializationLabel || (programId === 2 ? "IT" : "CS")}`;

            containerRef.current.appendChild(exportTitle);

            const imgData = await toPng(containerRef.current, {
                pixelRatio: 2,
                backgroundColor: "#f8fafc",
                width: containerRef.current.scrollWidth,
                height: containerRef.current.scrollHeight,
            });

            containerRef.current.removeChild(exportTitle);

            // Use scrollWidth/scrollHeight so the PDF matches the real layout 1:1
            const pdfWidth = containerRef.current.scrollWidth;
            const pdfHeight = containerRef.current.scrollHeight;

            const pdf = new jsPDF({
                orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
                unit: "px",
                format: [pdfWidth, pdfHeight],
            });

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

            const fileName = specializationLabel
                ? `Course_Map_${specializationLabel.replace(/\s+/g, "_")}.pdf`
                : "Course_Map.pdf";

            pdf.save(fileName);
        } catch (err) {
            console.error("Failed to export PDF:", err);
        } finally {
            setIsExporting(false);
        }
    };

    return { isExporting, exportToPDF };
}
