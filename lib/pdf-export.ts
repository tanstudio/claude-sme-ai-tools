'use client';

export async function exportToPDF(elementId: string, filename: string): Promise<void> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`找不到報告元素（id="${elementId}"）`);
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const ratio = pdfWidth / canvas.width;
  const scaledHeight = canvas.height * ratio;

  // First page
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight);
  let heightLeft = scaledHeight - pdfHeight;

  // Additional pages
  let position = -pdfHeight;
  while (heightLeft > 0) {
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
    heightLeft -= pdfHeight;
    position -= pdfHeight;
  }

  pdf.save(filename);
}
