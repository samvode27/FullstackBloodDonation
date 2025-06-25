const Donor = require("../Models/Donor");
const { transport } = require("../middlewares/sendMail");
const moment = require("moment-timezone"); // npm install moment-timezone

const sendReminderEmails = async () => {
  try {
    const donors = await Donor.find({
      lastDonationDate: { $exists: true },
      verified: true
    });

    const today = moment().tz("Africa/Addis_Ababa").startOf("day");

    for (const donor of donors) {
      if (!donor.lastDonationDate) continue;

      const lastDonation = moment(donor.lastDonationDate).tz("Africa/Addis_Ababa").startOf("day");
      const daysSinceDonation = today.diff(lastDonation, "days");

      // Only send if: 56+ days passed AND no reminder sent today
      const lastReminder = donor.lastReminderDate
        ? moment(donor.lastReminderDate).tz("Africa/Addis_Ababa").startOf("day")
        : null;

      if (daysSinceDonation >= 56 && (!lastReminder || lastReminder.isBefore(today))) {
        await transport.sendMail({
          to: donor.email,
          from: process.env.EMAIL_USER,
          subject: `⏰ Hello ${donor.name}, you're eligible to donate again!`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2 style="color: #d32f2f;">⏰ Blood Donation Reminder</h2>
              <p>Dear <strong>${donor.name}</strong>,</p>
              <p>It has been <strong>${daysSinceDonation} days</strong> since your last blood donation on <strong>${lastDonation.format("MMMM D, YYYY")}</strong>.</p>
              <p>You are now eligible to donate again according to the 56-day safety interval recommended by health authorities.</p>
              <p>We encourage you to visit your nearest blood bank and help save lives. Your donation matters more than ever.</p>
              <p style="margin-top: 20px;">Thank you for your life-saving commitment,</p>
              <p><strong>— Ethiopian National Blood Bank</strong></p>
            </div>
          `
        });

        donor.lastReminderDate = today.toDate();
        await donor.save();

        console.log(`✅ Reminder sent to ${donor.email}`);
      } else {
        console.log(`⏭️ Skipped ${donor.email}: only ${daysSinceDonation} days since last donation.`);
      }
    }

    console.log("✅ All reminders processed.");

  } catch (err) {
    console.error("❌ Error inside sendReminderEmails():", err);
    throw err;
  }
};


module.exports = { sendReminderEmails };
