import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

type PdfViewerProps = {
    // pdfPromise: Promise<jsPDF | null>;
    pdfDataUri: string | null;
    // setPdfDataUri: (string) => void;
};

const PdfViewer: React.FC<PdfViewerProps> = (props: PdfViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const loadPdf = async () => {
//       try {
//         const resolvedPdf = await props.pdfPromise;
        
//         if (resolvedPdf) {
//           const dataUri = resolvedPdf.output('datauristring');
//           props.setPdfDataUri(dataUri);
//         }
//       } catch (error) {
//         console.error('Error loading PDF:', error);
//         // Handle the error as needed
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     // Load the PDF only when the component mounts
//     if (isLoading) {
//       loadPdf();
//     }
//   }, [props.pdfPromise, isLoading]);

//   if (isLoading) {
//     return <div>Loading PDF...</div>;
//   }

  return (
    <div>
      {props.pdfDataUri && (
        <iframe width="600px"  src={props.pdfDataUri}></iframe>
      )}
    </div>
  );
};

export default PdfViewer;
