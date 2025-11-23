import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { StatsSummary, ActivityData } from '@/types';
import { formatTime } from '@/lib/utils';

export const exportStatsToCSV = (
  summary: StatsSummary,
  activityData: ActivityData[],
  period: string
) => {
  const periodName =
    period === 'today' ? 'Сегодня' : period === 'week' ? 'Неделя' : 'Месяц';

  const csvContent = [
    'Статистика модератора',
    '',
    `Период,${periodName}`,
    `Всего проверено,${summary.totalReviewed}`,
    `Одобрено,${summary.approvedPercentage.toFixed(2)}%`,
    `Отклонено,${summary.rejectedPercentage.toFixed(2)}%`,
    `На доработку,${summary.requestChangesPercentage.toFixed(2)}%`,
    `Среднее время проверки,${formatTime(summary.averageReviewTime)}`,
    '',
    'Активность по дням',
    'Дата,Одобрено,Отклонено,На доработку',
    ...activityData.map(
      (item) =>
        `${new Date(item.date).toLocaleDateString('ru-RU')},${item.approved},${item.rejected},${item.requestChanges}`
    ),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `stats_${period}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

export const exportStatsToPDF = async (
  summary: StatsSummary,
  activityData: ActivityData[],
  period: string
) => {
  const periodName =
    period === 'today' ? 'Сегодня' : period === 'week' ? 'Неделя' : 'Месяц';

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '800px';
  container.style.padding = '40px';
  container.style.backgroundColor = '#ffffff';
  container.style.fontFamily = 'Arial, sans-serif';

  container.innerHTML = `
    <div style="color: #000;">
      <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">Статистика модератора</h1>
      <p style="font-size: 14px; margin-bottom: 30px;">Период: ${periodName}</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #10b981; color: white;">
            <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Метрика</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Значение</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;">Всего проверено</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${summary.totalReviewed}</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="border: 1px solid #ddd; padding: 10px;">Одобрено</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${summary.approvedPercentage.toFixed(2)}%</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;">Отклонено</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${summary.rejectedPercentage.toFixed(2)}%</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="border: 1px solid #ddd; padding: 10px;">На доработку</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${summary.requestChangesPercentage.toFixed(2)}%</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;">Среднее время проверки</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${formatTime(summary.averageReviewTime)}</td>
          </tr>
        </tbody>
      </table>

      <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">Активность по дням</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #10b981; color: white;">
            <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Дата</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Одобрено</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Отклонено</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">На доработку</th>
          </tr>
        </thead>
        <tbody>
          ${activityData
            .map(
              (item, index) => `
            <tr style="${index % 2 === 0 ? '' : 'background-color: #f9f9f9;'}">
              <td style="border: 1px solid #ddd; padding: 10px;">${new Date(item.date).toLocaleDateString('ru-RU')}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${item.approved}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${item.rejected}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${item.requestChanges}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`stats_${period}_${new Date().toISOString().split('T')[0]}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
};

