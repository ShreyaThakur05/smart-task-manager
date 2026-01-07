import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.FROM_EMAIL,
    pass: process.env.APP_PASSWORD
  }
})

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()
    
    const mailOptions = {
      from: `"Smart Task Management" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Welcome to Smart Task Management! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Smart Task Management! 🚀</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2d3748; margin-top: 0;">Hello ${name}! 👋</h2>
            
            <p style="color: #4a5568; line-height: 1.6;">Thank you for joining our platform! We're excited to have you on board and look forward to working together to make your task management more efficient and enjoyable.</p>
            
            <div style="background: #edf2f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d3748; margin-top: 0;">🎯 What you can do:</h3>
              <ul style="color: #4a5568; line-height: 1.8;">
                <li>🤖 <strong>AI Task Creation</strong> - Create tasks using natural language</li>
                <li>📋 <strong>Kanban Boards</strong> - Organize with drag & drop interface</li>
                <li>📝 <strong>Custom Lists</strong> - Create your own workflow stages</li>
                <li>📅 <strong>Calendar Integration</strong> - Sync tasks with Google Calendar</li>
                <li>🌙 <strong>Dark Mode</strong> - Easy on the eyes</li>
                <li>📱 <strong>Responsive</strong> - Works on any device</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Get Started Now</a>
            </div>
            
            <p style="color: #4a5568; line-height: 1.6;">Get started by creating your first task or list. If you need any help, don't hesitate to reach out!</p>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
              <p style="color: #4a5568; margin: 0;">Best regards,<br><strong>Shreya & The Smart Task Management Team</strong></p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #718096; font-size: 12px;">
            <p>This email was sent because you registered for Smart Task Management.</p>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
        </div>
      `
    }
    
    await transporter.sendMail(mailOptions)
    console.log(`Welcome email sent successfully to ${email}`)
    
    return NextResponse.json({ success: true, message: 'Welcome email sent successfully' })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 })
  }
}