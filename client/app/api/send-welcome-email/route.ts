import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()
    
    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 })
    }

    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_SERVER,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.APP_PASSWORD
      }
    })

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Smart Task Management</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8, #6366f1); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header p { color: #e0e7ff; margin: 15px 0 0 0; font-size: 18px; font-weight: 300; }
        .content { padding: 40px 30px; }
        .welcome-text { font-size: 20px; color: #1f2937; margin-bottom: 25px; line-height: 1.6; }
        .highlight { color: #3b82f6; font-weight: 600; }
        .features { background: linear-gradient(135deg, #f8fafc, #e0e7ff); border-radius: 16px; padding: 30px; margin: 30px 0; border: 1px solid #e5e7eb; }
        .features h3 { color: #1f2937; margin-top: 0; font-size: 22px; font-weight: 600; }
        .feature { display: flex; align-items: flex-start; margin-bottom: 20px; }
        .feature-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #6366f1); border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; flex-shrink: 0; }
        .feature-content { flex: 1; }
        .feature-title { font-weight: 600; color: #1f2937; margin-bottom: 5px; }
        .feature-desc { color: #6b7280; font-size: 14px; line-height: 1.5; }
        .cta-section { text-align: center; margin: 40px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 18px 36px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); transition: all 0.3s ease; }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4); }
        .tips { background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 12px; padding: 20px; margin: 30px 0; }
        .tips h4 { color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600; }
        .tips p { color: #92400e; margin: 0; font-size: 14px; line-height: 1.5; }
        .footer { background-color: #f1f5f9; padding: 30px; text-align: center; color: #64748b; }
        .footer h4 { color: #1f2937; margin: 0 0 10px 0; font-size: 18px; font-weight: 600; }
        .footer p { margin: 5px 0; font-size: 14px; }
        .social-links { margin: 20px 0; }
        .social-links a { display: inline-block; margin: 0 10px; color: #64748b; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Welcome to Smart Tasks!</h1>
          <p>Your AI-powered productivity journey starts now</p>
        </div>
        
        <div class="content">
          <p class="welcome-text">Hi <span class="highlight">${name}</span>,</p>
          
          <p>🎉 <strong>Congratulations!</strong> You've just joined thousands of productive individuals who are transforming how they manage tasks. Your Smart Task Management account is ready to supercharge your workflow!</p>
          
          <div class="features">
            <h3>🎯 What makes us special:</h3>
            <div class="feature">
              <div class="feature-icon">🤖</div>
              <div class="feature-content">
                <div class="feature-title">AI-Powered Task Creation</div>
                <div class="feature-desc">Simply type "Create a meeting task for tomorrow at 2 PM" and watch the magic happen!</div>
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon">📋</div>
              <div class="feature-content">
                <div class="feature-title">Intuitive Kanban Board</div>
                <div class="feature-desc">Drag, drop, and organize your tasks with smooth animations and real-time updates.</div>
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon">📊</div>
              <div class="feature-content">
                <div class="feature-title">Multiple Views</div>
                <div class="feature-desc">Switch between Board, List, Calendar, and Timeline views to match your workflow.</div>
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon">⚡</div>
              <div class="feature-content">
                <div class="feature-title">Smart Organization</div>
                <div class="feature-desc">Priorities, labels, due dates, and custom lists - everything you need to stay organized.</div>
              </div>
            </div>
          </div>
          
          <div class="tips">
            <h4>💡 Pro Tip for ${name}:</h4>
            <p>Start by clicking the <strong>"AI Create"</strong> button and try saying: "Add a task to review project proposal by Friday with high priority" - you'll be amazed at how smart our AI is!</p>
          </div>
          
          <div class="cta-section">
            <p style="margin-bottom: 20px; font-size: 18px; color: #374151;">Ready to boost your productivity?</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}" class="cta-button">
              🚀 Start Managing Tasks
            </a>
          </div>
          
          <p style="margin-top: 40px; color: #6b7280; font-size: 14px; text-align: center; line-height: 1.6;">
            <strong>Need help getting started?</strong><br>
            Our intuitive interface makes it easy, but if you have questions, just reply to this email. We're here to help you succeed!
          </p>
        </div>
        
        <div class="footer">
          <h4>Smart Task Management</h4>
          <p><strong>AI-powered • Intuitive • Productive</strong></p>
          <p style="margin-top: 15px; font-size: 13px;">Made with ❤️ for productive people like you</p>
          <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
            You're receiving this because you just created an account with us.<br>
            Smart Task Management Team
          </p>
        </div>
      </div>
    </body>
    </html>
    `

    await transporter.sendMail({
      from: `"Smart Tasks" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: '🎉 Welcome to Smart Task Management!',
      html: htmlContent,
      text: `Hi ${name},\n\nWelcome to Smart Task Management! Your account has been successfully created.\n\nGet started: ${process.env.NEXT_PUBLIC_BASE_URL}\n\nFeatures:\n- AI Task Creation\n- Kanban Board\n- Multiple Views\n- Smart Organization\n\nBest regards,\nSmart Tasks Team`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email send failed:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}