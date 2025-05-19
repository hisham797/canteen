import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend('re_hruVcDnR_4L7Kvv56jwSVxy4JeyDGnvoK');

export async function POST(request: Request) {
  try {
    const { attendanceSummary } = await request.json();

    // Generate the attendance summary table
    const generateMealSummary = () => {
      let summaryHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Meal Time</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Present</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Absent</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Total</th>
            </tr>
          </thead>
          <tbody>
      `;

      const mealTimes = ['coffee', 'breakfast', 'lunch', 'tea', 'dinner'] as const;
      const mealLabels: Record<typeof mealTimes[number], string> = {
        coffee: 'Coffee',
        breakfast: 'Breakfast',
        lunch: 'Lunch',
        tea: 'Tea',
        dinner: 'Dinner'
      };

      mealTimes.forEach(meal => {
        const mealData = attendanceSummary[meal];
        const total = mealData.present + mealData.absent;
        
        summaryHtml += `
          <tr>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">${mealLabels[meal]}</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; color: #059669;">${mealData.present}</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; color: #dc2626;">${mealData.absent}</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${total}</td>
          </tr>
        `;
      });

      summaryHtml += `
          </tbody>
        </table>
      `;

      return summaryHtml;
    };

    const data = await resend.emails.send({
      from: 'Canteen Tracker App <onboarding@resend.dev>',
      to: ['shaz80170@gmail.com'],
      subject: 'Canteen Attendance Report',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; margin-bottom: 24px;">Canteen Attendance Report</h1>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <h2 style="color: #1f2937; margin-bottom: 16px;">Daily Summary</h2>
            <p style="color: #4b5563; line-height: 1.5;">
              Below is the detailed attendance report for today's meals at the canteen.
            </p>
          </div>

          ${generateMealSummary()}

          <div style="color: #4b5563;">
            <p>Best regards,</p>
            <p>Canteen Tracker Team</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 