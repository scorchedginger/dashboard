import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportData {
  businessId: string;
  period: string;
  timestamp: string;
  metrics: any[];
  platforms: any[];
  chartData: any;
  systemStatus: any;
}

export class ReportGenerator {
  static async generatePDFReport(data: ReportData): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Add header
    this.addHeader(doc, data);
    
    // Add metrics section
    this.addMetricsSection(doc, data.metrics, margin, 80);
    
    // Add platforms section
    this.addPlatformsSection(doc, data.platforms, margin, 160);
    
    // Add charts section
    await this.addChartsSection(doc, data.chartData, margin, 220);
    
    // Add footer
    this.addFooter(doc, data, pageHeight - 20);

    // Save the PDF
    const filename = `marketing-report-${data.period}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  }

  private static addHeader(doc: jsPDF, data: ReportData): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Scorched Ginger Logo (text-based for now)
    doc.setFontSize(16);
    doc.setTextColor(255, 69, 0); // Orange-red color for "scorched"
    doc.text('SCORCHED GINGER', 20, 25);
    
    // Add a small decorative element
    doc.setDrawColor(255, 69, 0);
    doc.setLineWidth(2);
    doc.line(20, 28, 80, 28);
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(75, 0, 130); // Purple
    doc.text('Marketing Analytics Report', pageWidth / 2, 40);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Period: ${this.formatPeriod(data.period)}`, pageWidth / 2, 50);
    doc.text(`Generated: ${new Date(data.timestamp).toLocaleDateString()}`, pageWidth / 2, 55);
    
    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(1);
    doc.line(20, 60, pageWidth - 20, 60);
  }

  private static addMetricsSection(doc: jsPDF, metrics: any[], margin: number, startY: number): void {
    doc.setFontSize(16);
    doc.setTextColor(75, 0, 130);
    doc.text('Key Performance Metrics', margin, startY);
    
    let y = startY + 15;
    const colWidth = 50;
    const rowHeight = 8;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    
    // Headers
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 5, colWidth, rowHeight, 'F');
    doc.setTextColor(75, 0, 130);
    doc.text('Metric', margin + 2, y);
    
    doc.rect(margin + colWidth, y - 5, colWidth, rowHeight, 'F');
    doc.text('Value', margin + colWidth + 2, y);
    
    doc.rect(margin + colWidth * 2, y - 5, colWidth, rowHeight, 'F');
    doc.text('Change', margin + colWidth * 2 + 2, y);
    
    y += rowHeight;
    doc.setTextColor(100, 100, 100);
    
    // Metrics data
    metrics.forEach((metric, index) => {
      if (y > 250) {
        doc.addPage();
        y = 30;
      }
      
      doc.text(metric.title, margin + 2, y);
      doc.text(metric.value, margin + colWidth + 2, y);
      
      // Color code the change
      const isPositive = metric.trend === 'up';
      if (isPositive) {
        doc.setTextColor(0, 128, 0);
      } else {
        doc.setTextColor(255, 0, 0);
      }
      doc.text(metric.change, margin + colWidth * 2 + 2, y);
      doc.setTextColor(100, 100, 100);
      
      y += rowHeight;
    });
  }

  private static addPlatformsSection(doc: jsPDF, platforms: any[], margin: number, startY: number): void {
    doc.setFontSize(16);
    doc.setTextColor(75, 0, 130);
    doc.text('Platform Performance', margin, startY);
    
    let y = startY + 15;
    const colWidth = 40;
    const rowHeight = 8;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    
    // Headers
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 5, colWidth, rowHeight, 'F');
    doc.setTextColor(75, 0, 130);
    doc.text('Platform', margin + 2, y);
    
    doc.rect(margin + colWidth, y - 5, colWidth, rowHeight, 'F');
    doc.text('Revenue', margin + colWidth + 2, y);
    
    doc.rect(margin + colWidth * 2, y - 5, colWidth, rowHeight, 'F');
    doc.text('Orders', margin + colWidth * 2 + 2, y);
    
    doc.rect(margin + colWidth * 3, y - 5, colWidth, rowHeight, 'F');
    doc.text('Conv. Rate', margin + colWidth * 3 + 2, y);
    
    y += rowHeight;
    doc.setTextColor(100, 100, 100);
    
    // Platform data
    platforms.forEach((platform, index) => {
      if (y > 250) {
        doc.addPage();
        y = 30;
      }
      
      doc.text(platform.name, margin + 2, y);
      doc.text(platform.revenue || 'N/A', margin + colWidth + 2, y);
      doc.text(platform.orders?.toString() || 'N/A', margin + colWidth * 2 + 2, y);
      doc.text(platform.conversionRate || 'N/A', margin + colWidth * 3 + 2, y);
      
      y += rowHeight;
    });
  }

  private static async addChartsSection(doc: jsPDF, chartData: any, margin: number, startY: number): Promise<void> {
    doc.setFontSize(16);
    doc.setTextColor(75, 0, 130);
    doc.text('Revenue Trends', margin, startY);
    
    // Create a simple chart representation
    if (chartData.revenue && chartData.revenue.length > 0) {
      const chartWidth = 150;
      const chartHeight = 60;
      const chartX = margin;
      const chartY = startY + 10;
      
      // Chart background
      doc.setFillColor(250, 250, 250);
      doc.rect(chartX, chartY, chartWidth, chartHeight, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.rect(chartX, chartY, chartWidth, chartHeight);
      
             // Find max value for scaling
       const maxValue = Math.max(...chartData.revenue.map((item: any) => item.value || 0));
      
      // Draw chart bars
      const barWidth = chartWidth / chartData.revenue.length;
      chartData.revenue.forEach((item: any, index: number) => {
        const barHeight = (item.value / maxValue) * chartHeight;
        const barX = chartX + (index * barWidth) + 2;
        const barY = chartY + chartHeight - barHeight;
        
        doc.setFillColor(75, 0, 130);
        doc.rect(barX, barY, barWidth - 4, barHeight, 'F');
        
        // Add labels
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(item.name, barX, chartY + chartHeight + 5);
      });
    }
  }

  private static addFooter(doc: jsPDF, data: ReportData, y: number): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y - 10, pageWidth - 20, y - 10);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by Marketing Command Center', pageWidth / 2, y);
    doc.text(`Business ID: ${data.businessId}`, pageWidth / 2, y + 5);
  }

  private static formatPeriod(period: string): string {
    const periodMap: { [key: string]: string } = {
      '24h': 'Last 24 Hours',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '90d': 'Last 90 Days'
    };
    return periodMap[period] || period;
  }
} 