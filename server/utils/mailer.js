const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendTaskReminder = async (email, name, tasks) => {
  const taskList = tasks.map(t => `<li><strong>${t.title}</strong></li>`).join("");

  const mailOptions = {
    from: `"Career AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Daily Career Tasks 🚀",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4f46e5;">Hello, ${name || 'Future Professional'}!</h2>
        <p>Keep the momentum going! Here are some pending tasks for your career journey:</p>
        <ul style="line-height: 1.6;">
          ${taskList}
        </ul>
        <div style="margin-top: 20px; padding: 15px; background: #fef2f2; border-radius: 8px;">
           <p style="margin: 0; color: #b91c1c; font-weight: bold;">Daily Tip: Consistency is the key to mastering any skill!</p>
        </div>
        <p style="margin-top: 30px;">Stay focused and achieve your goals!</p>
        <p style="font-size: 12px; color: #999;">Best, <br> The Career AI Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error.message);
  }
};

const sendTaskCompletedEmail = async (email, name, taskTitle, phaseTitle) => {
  const mailOptions = {
    from: `"Career AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Task Completed ✅",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #16a34a;">Great work, ${name || 'Future Professional'}!</h2>
        <p>You completed a task in your career roadmap:</p>
        <div style="margin: 14px 0; padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <p style="margin: 0;"><strong>Task:</strong> ${taskTitle}</p>
          ${phaseTitle ? `<p style="margin: 8px 0 0 0;"><strong>Phase:</strong> ${phaseTitle}</p>` : ''}
        </div>
        <p>Keep your momentum going — one completed task at a time 🚀</p>
        <p style="font-size: 12px; color: #999;">Best,<br/>The Career AI Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed task completion email to ${email}:`, error.message);
  }
};

const sendPhaseCompletedEmail = async (email, name, phaseTitle, pathTitle) => {
  const mailOptions = {
    from: `"Career AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Phase Completed 🎯",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #ddd; border-radius: 10px; background: #f9fafc;">
        <h2 style="color: #2563eb; margin: 0;">Congratulations, ${name || 'Future Professional'}! 🎉</h2>
        <p style="margin: 12px 0; font-size: 16px;">You have successfully completed a phase in your career roadmap!</p>
        <div style="margin: 20px 0; padding: 16px; background: #dbeafe; border: 2px solid #3b82f6; border-radius: 8px;">
          <p style="margin: 0; color: #1e40af;"><strong style="font-size: 18px;">Phase:</strong> ${phaseTitle}</p>
          <p style="margin: 8px 0 0 0; color: #1e40af;"><strong>Path:</strong> ${pathTitle}</p>
        </div>
        <p style="margin: 16px 0;">You're making incredible progress! Keep pushing forward as you move to the next phase of your career journey.</p>
        <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 12px; border-radius: 4px; margin: 16px 0;">
          <p style="margin: 0; color: #065f46; font-size: 14px;"><strong>💡 Tip:</strong> Take time to review what you've learned before moving to the next phase!</p>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #999;">Best,<br/>The Career AI Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed phase completion email to ${email}:`, error.message);
  }
};

const sendPathCompletedEmail = async (email, name, pathTitle, domain) => {
  const mailOptions = {
    from: `"Career AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Career Path Mastered! 🚀",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 3px solid #fbbf24; border-radius: 10px; background: #fffbeb;">
        <h2 style="color: #d97706; margin: 0;">🏆 Congratulations, ${name}!</h2>
        <p style="margin: 12px 0; font-size: 16px; color: #92400e;">You have successfully completed your entire career roadmap!</p>
        <div style="margin: 20px 0; padding: 18px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 8px;">
          <p style="margin: 0; color: #78350f;"><strong style="font-size: 18px;">Path Completed:</strong> ${pathTitle}</p>
          <p style="margin: 8px 0 0 0; color: #78350f;"><strong>Domain:</strong> ${domain}</p>
        </div>
        <p style="margin: 16px 0;">This is a major milestone! You've completed all phases of your career roadmap and are now ready to explore new opportunities.</p>
        <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px; border-radius: 4px; margin: 16px 0;">
          <p style="margin: 0; color: #15803d; font-size: 14px;"><strong>✨ Next Step:</strong> Your job matches are now unlocked! Check the Jobs section to discover roles that match your new skill set.</p>
        </div>
        <p style="margin-top: 20px;">What's next?</p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li style="margin: 5px 0;">Explore the Jobs section for opportunities</li>
          <li style="margin: 5px 0;">Create another career path to expand your skills</li>
          <li style="margin: 5px 0;">Share your achievement with your network</li>
        </ul>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">Best,<br/>The Career AI Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed path completion email to ${email}:`, error.message);
  }
};

const sendJobUnlockedEmail = async (email, name, pathTitle, jobCount = 0) => {
  const mailOptions = {
    from: `"Career AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Job Matches Unlocked! 💼",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #7c3aed; border-radius: 10px; background: #faf5ff;">
        <h2 style="color: #6d28d9; margin: 0;">🎯 Job Matches Unlocked!</h2>
        <p style="margin: 12px 0; font-size: 16px;">Now that you've completed your career path, your personalized job recommendations are ready!</p>
        <div style="margin: 20px 0; padding: 16px; background: #ede9fe; border: 2px solid #a78bfa; border-radius: 8px;">
          <p style="margin: 0; color: #4c1d95;"><strong style="font-size: 18px;">🚀 Path Completed:</strong> ${pathTitle}</p>
          ${jobCount > 0 ? `<p style="margin: 8px 0 0 0; color: #4c1d95;"><strong>Available Jobs:</strong> ${jobCount}+ opportunities</p>` : ''}
        </div>
        <p style="margin: 16px 0;">We've curated a selection of job opportunities that align with the skills you've developed. These positions are highly relevant to your newly completed roadmap.</p>
        <div style="background: #f3e8ff; border-left: 4px solid #8b5cf6; padding: 12px; border-radius: 4px; margin: 16px 0;">
          <p style="margin: 0; color: #5b21b6; font-size: 14px;"><strong>💡 Recommendation:</strong> Review the job matches in your dashboard to find roles that excite you most!</p>
        </div>
        <p style="margin-top: 20px;">These opportunities include:</p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li style="margin: 5px 0;">Roles matching your completed skill set</li>
          <li style="margin: 5px 0;">Companies actively hiring in your domain</li>
          <li style="margin: 5px 0;">Competitive salaries based on market data</li>
        </ul>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">Best,<br/>The Career AI Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed job unlock email to ${email}:`, error.message);
  }
};

module.exports = { sendTaskReminder, sendTaskCompletedEmail, sendPhaseCompletedEmail, sendPathCompletedEmail, sendJobUnlockedEmail };
