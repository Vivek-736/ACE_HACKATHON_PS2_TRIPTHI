export interface EmailBaseProps {
  appUrl?: string;
}

export interface ListingClaimedEmailProps extends EmailBaseProps {
  donorName: string;
  listingTitle: string;
  portions: number;
  receiverName: string;
  pickupDeadline: string;
  pickupOtp: string;
  orderId: string;
}

export interface VolunteerReminderEmailProps extends EmailBaseProps {
  volunteerName: string;
  listingTitle: string;
  donorName: string;
  donorAddress: string;
  receiverName: string;
  receiverAddress: string;
  portions: number;
  pickupDeadline: string;
  orderId: string;
}

export interface DeliveryCompletedEmailProps extends EmailBaseProps {
  recipientName: string;
  isDonor: boolean;
  listingTitle: string;
  portions: number;
  mealsSaved: number;
  co2eKgAvoided: number;
  receiverName: string;
  donorName: string;
  orderId: string;
}

export interface ListingExpiredEmailProps extends EmailBaseProps {
  donorName: string;
  listingTitle: string;
  portions: number;
  expiredAt: string;
}

const EMAIL_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #1c1917;
  background-color: #fbfbfa;
  margin: 0;
  padding: 0;
  line-height: 1.6;
`;

function getEmailHeader() {
  return `
    <div style="background-color: #1b4332; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: #fbfbfa; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Tripti</h1>
      <p style="color: #95d5b2; margin: 4px 0 0 0; font-size: 13px; font-weight: 500;">Rescue the Surplus • Connect the Willing</p>
    </div>
  `;
}

function getEmailFooter(appUrl: string = "http://localhost:3000") {
  return `
    <div style="background-color: #f4f1ea; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e7e5e4;">
      <p style="margin: 0 0 8px 0; font-size: 11px; color: #78716c; line-height: 1.4;">
        <strong>Safety Note:</strong> Tripti coordinates community food rescue logistics and does not inspect or certify food safety. Donors and receivers are responsible for standard food hygiene protocols.
      </p>
      <p style="margin: 0; font-size: 12px; color: #a8a29e;">
        © 2026 Tripti Food Rescue Platform • Hyderabad, India • <a href="${appUrl}" style="color: #2d6a4f; text-decoration: none;">Open Tripti App</a>
      </p>
    </div>
  `;
}

/**
 * Sent to Donor when their surplus food is claimed by an NGO / Community Kitchen
 */
export function generateListingClaimedEmail(props: ListingClaimedEmailProps): {
  subject: string;
  html: string;
} {
  const appUrl = props.appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const subject = `[Tripti] Surplus Claimed: ${props.listingTitle} (${props.portions} portions)`;

  const html = `
    <div style="${EMAIL_STYLE}">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        ${getEmailHeader()}
        
        <div style="padding: 28px 24px;">
          <h2 style="color: #1b4332; margin-top: 0; font-size: 20px;">Great news, ${props.donorName}!</h2>
          <p style="color: #44403c; font-size: 15px;">
            Your surplus food listing <strong>"${props.listingTitle}"</strong> has been claimed by <strong>${props.receiverName}</strong>.
          </p>

          <div style="background-color: #f8fafc; border-left: 4px solid #2d6a4f; padding: 16px; margin: 20px 0; border-radius: 0 6px 6px 0;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Portions Rescued:</strong> ${props.portions} portions</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Receiver Organisation:</strong> ${props.receiverName}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Pickup Deadline:</strong> ${props.pickupDeadline}</p>
            <p style="margin: 0; font-size: 14px;">
              <strong>Your Verification Pickup OTP:</strong> 
              <span style="display: inline-block; background-color: #dcfce7; color: #166534; font-weight: 700; font-size: 18px; padding: 2px 10px; border-radius: 4px; letter-spacing: 2px; margin-left: 6px;">
                ${props.pickupOtp}
              </span>
            </p>
          </div>

          <p style="font-size: 13px; color: #78716c;">
            Please ensure the food is packed cleanly and kept at the recommended holding temperature. Share the 4-digit OTP with the rescue courier only when handoff is physically taking place.
          </p>

          <div style="text-align: center; margin: 28px 0 10px 0;">
            <a href="${appUrl}/dashboard/donor" style="background-color: #1b4332; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
              Track Order in Donor Console
            </a>
          </div>
        </div>

        ${getEmailFooter(appUrl)}
      </div>
    </div>
  `;

  return { subject, html };
}

/**
 * Sent to Volunteer courier before pickup deadline
 */
export function generateVolunteerReminderEmail(props: VolunteerReminderEmailProps): {
  subject: string;
  html: string;
} {
  const appUrl = props.appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const subject = `[Tripti Reminder] Upcoming Food Rescue: ${props.listingTitle}`;

  const html = `
    <div style="${EMAIL_STYLE}">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        ${getEmailHeader()}

        <div style="padding: 28px 24px;">
          <div style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 12px; margin-bottom: 12px;">
            Rescue Dispatch Reminder
          </div>
          <h2 style="color: #1b4332; margin-top: 0; font-size: 20px;">Hi ${props.volunteerName}, ready for pickup?</h2>
          <p style="color: #44403c; font-size: 15px;">
            You have an active food rescue assignment for <strong>${props.portions} portions</strong> of <strong>"${props.listingTitle}"</strong> scheduled for pickup soon.
          </p>

          <div style="background-color: #fbfbfa; border: 1px solid #e7e5e4; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <div style="margin-bottom: 12px;">
              <span style="font-size: 12px; font-weight: 700; color: #2d6a4f; text-transform: uppercase;">1. Pickup Location</span>
              <p style="margin: 2px 0 0 0; font-weight: 600; font-size: 15px;">${props.donorName}</p>
              <p style="margin: 2px 0 0 0; font-size: 13px; color: #78716c;">${props.donorAddress}</p>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #b45309;"><strong>Pickup Deadline:</strong> ${props.pickupDeadline}</p>
            </div>
            
            <div style="border-top: 1px dashed #e7e5e4; padding-top: 12px;">
              <span style="font-size: 12px; font-weight: 700; color: #1e3a8a; text-transform: uppercase;">2. Dropoff Destination</span>
              <p style="margin: 2px 0 0 0; font-weight: 600; font-size: 15px;">${props.receiverName}</p>
              <p style="margin: 2px 0 0 0; font-size: 13px; color: #78716c;">${props.receiverAddress}</p>
            </div>
          </div>

          <div style="text-align: center; margin: 28px 0 10px 0;">
            <a href="${appUrl}/dashboard/volunteer" style="background-color: #2d6a4f; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
              Open Volunteer Mission Radar
            </a>
          </div>
        </div>

        ${getEmailFooter(appUrl)}
      </div>
    </div>
  `;

  return { subject, html };
}

/**
 * Sent to Donor & Receiver upon verified handoff
 */
export function generateDeliveryCompletedEmail(props: DeliveryCompletedEmailProps): {
  subject: string;
  html: string;
} {
  const appUrl = props.appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const subject = `[Tripti] Mission Accomplished: ${props.portions} Portions Rescued!`;

  const html = `
    <div style="${EMAIL_STYLE}">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        ${getEmailHeader()}

        <div style="padding: 28px 24px;">
          <h2 style="color: #1b4332; margin-top: 0; font-size: 20px;">Thank you, ${props.recipientName}!</h2>
          <p style="color: #44403c; font-size: 15px;">
            The rescue order for <strong>"${props.listingTitle}"</strong> has been successfully verified and delivered.
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0;">
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 14px; text-align: center;">
              <span style="font-size: 24px; font-weight: 700; color: #166534; display: block;">${props.mealsSaved}</span>
              <span style="font-size: 12px; color: #15803d; font-weight: 500;">Wholesome Meals Saved</span>
            </div>
            <div style="background-color: #f0fdfa; border: 1px solid #99f6e4; border-radius: 6px; padding: 14px; text-align: center;">
              <span style="font-size: 24px; font-weight: 700; color: #0f766e; display: block;">${props.co2eKgAvoided} kg</span>
              <span style="font-size: 12px; color: #115e59; font-weight: 500;">CO₂e Landfill Avoidance</span>
            </div>
          </div>

          <p style="font-size: 13px; color: #78716c;">
            Handoff between <strong>${props.donorName}</strong> and <strong>${props.receiverName}</strong> was verified via 2-way physical OTP.
          </p>

          <div style="text-align: center; margin: 28px 0 10px 0;">
            <a href="${appUrl}/dashboard" style="background-color: #1b4332; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
              View Verified Impact
            </a>
          </div>
        </div>

        ${getEmailFooter(appUrl)}
      </div>
    </div>
  `;

  return { subject, html };
}

/**
 * Sent to Donor if listing reached expiry without being claimed
 */
export function generateListingExpiredEmail(props: ListingExpiredEmailProps): {
  subject: string;
  html: string;
} {
  const appUrl = props.appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const subject = `[Tripti] Listing Expired: ${props.listingTitle}`;

  const html = `
    <div style="${EMAIL_STYLE}">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 8px;">
        ${getEmailHeader()}

        <div style="padding: 28px 24px;">
          <h2 style="color: #991b1b; margin-top: 0; font-size: 20px;">Listing Expired</h2>
          <p style="color: #44403c; font-size: 15px;">
            Hello ${props.donorName}, your listing <strong>"${props.listingTitle}"</strong> (${props.portions} portions) was not claimed within the designated pickup window and was closed on ${props.expiredAt} to protect food safety.
          </p>

          <p style="font-size: 13px; color: #78716c;">
            Per food rescue guidelines, perishable surplus cannot be dispatched once the holding window passes. Thank you for your commitment to reducing surplus.
          </p>

          <div style="text-align: center; margin: 24px 0 10px 0;">
            <a href="${appUrl}/dashboard/donor" style="background-color: #1b4332; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
              Post New Surplus
            </a>
          </div>
        </div>

        ${getEmailFooter(appUrl)}
      </div>
    </div>
  `;

  return { subject, html };
}
