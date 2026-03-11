# Privacy Policy for Chronomage

**Last Updated: October 25, 2025**

## Introduction

This Privacy Policy describes how Chronomage ("the Bot", "we", "our") collects, uses, and protects information when you use our Discord bot service. By using Chronomage, you agree to the collection and use of information in accordance with this policy.

## Information We Collect

### Automatically Collected Information

When you use Chronomage, we automatically collect and store:

1. **Guild (Server) Information:**
   - Guild ID (server identifier)
   - Guild name (for logging purposes only)

2. **User Information:**
   - User ID (Discord identifier)
   - Username (for interaction purposes only)
   - User locale (language preference for bot responses)

3. **Schedule and Event Data:**
   - Schedule configurations you create
   - Event labels, descriptions, and banner image URLs
   - Event timing information (start dates, durations, intervals)
   - Event location information (channel IDs or external location text)
   - Template configurations (date formats, counters, weather settings)

4. **Server Settings:**
   - Language preference for the bot
   - Default timezone setting
   - Future event buffer size preference

### Information You Provide

When using Chronomage, you voluntarily provide:

1. **Event Content:**
   - Event titles (labels)
   - Event descriptions
   - Banner image URLs
   - Location information

2. **Configuration Data:**
   - Weather location (city names)
   - Date format preferences
   - Timezone preferences
   - Counter starting values

## How We Use Your Information

We use the collected information solely for the following purposes:

1. **Service Functionality:**
   - Creating and managing Discord scheduled events
   - Maintaining recurring event schedules
   - Processing and rendering template placeholders
   - Providing localized responses based on language preferences

2. **Service Improvement:**
   - Ensuring the bot operates correctly
   - Debugging errors and issues
   - Improving bot performance

3. **Communication:**
   - Responding to user commands
   - Sending confirmation messages
   - Providing error messages and help information

## Data Storage

### Storage Method

All data is stored locally in a SQLite database file (`enmap.sqlite`) on the server where the bot is hosted. This includes:
- Guild settings and configurations
- Schedule definitions
- Event records
- Template configurations

### Storage Duration

- **Active Schedules:** Data is retained as long as the schedule is active
- **Past Events:** Historical event data is retained for reference purposes
- **Deleted Schedules:** When you cancel a schedule, associated data is permanently deleted from our database
- **Server Removal:** If the bot is removed from your server, your server's data may be retained for up to 30 days before permanent deletion

### Data Security

We implement appropriate security measures to protect your data:
- Data is stored in a secure database with restricted access
- Only authorized bot processes can access the database
- Regular backups are performed to prevent data loss
- Access logs are maintained for security monitoring

## Data Sharing and Disclosure

### We Do Not Sell Your Data

We will never sell, rent, or trade your information to third parties for marketing purposes.

### Limited Sharing

We may share information only in the following limited circumstances:

1. **Discord Platform:**
   - Event information is shared with Discord's API to create scheduled events
   - Discord's own privacy policy governs how they handle this information

2. **Weather Service:**
   - When using weather placeholders, city names are sent to the weather service API to retrieve weather information
   - No personal information is shared with weather services

3. **Legal Requirements:**
   - If required by law or in response to valid legal processes
   - To protect the rights, property, or safety of the bot, its users, or others

## Your Rights and Choices

### Data Access and Deletion

You have the right to:

1. **View Your Data:**
   - Use `/schedule list` to see your active schedules
   - Use `/variables` commands to view your template configurations
   - Use `/settings` to view your server configuration

2. **Delete Your Data:**
   - Use `/schedule cancel` to delete individual schedules and their events
   - Remove the bot from your server to delete all server data
   - Contact the bot administrator to request complete data deletion

3. **Modify Your Data:**
   - Update settings using the `/settings` command
   - Modify templates using the `/variables` commands
   - Cancel and recreate schedules to change their configuration

### Opt-Out Options

You can stop using the bot's features at any time:
- Pause schedules using `/schedule pause`
- Cancel schedules using `/schedule cancel`
- Remove the bot from your server entirely

## Third-Party Services

Chronomage integrates with the following third-party services:

1. **Discord API:**
   - Used to create and manage scheduled events
   - Subject to [Discord's Privacy Policy](https://discord.com/privacy)

2. **Weather Service (weather-describe):**
   - Used to fetch weather information for placeholders
   - Only receives city names, no personal information

We are not responsible for the privacy practices of these third-party services. We encourage you to review their privacy policies.

## Children's Privacy

Chronomage is not directed to individuals under the age of 13 (or the minimum age required in your country). We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately, and we will take steps to delete such information.

## International Data Transfers

The bot's data may be stored on servers located in different countries. By using Chronomage, you consent to the transfer of your information to countries that may have different data protection laws than your country of residence.

## Data Retention

We retain your information for as long as necessary to provide the service and fulfill the purposes outlined in this Privacy Policy. Specifically:

- **Active Data:** Retained while schedules are active and you use the bot
- **Historical Data:** Event records may be retained for operational purposes
- **Deleted Data:** Permanently removed within 30 days of deletion request or bot removal

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify users of significant changes by:

- Updating the "Last Updated" date at the top of this policy
- Posting announcements in support channels (if available)

Your continued use of Chronomage after changes constitutes acceptance of the updated policy.

## Contact Information

If you have questions, concerns, or requests regarding this Privacy Policy or your data, please contact:

- **Bot Administrator:** Contact the person who invited the bot to your server
- **Developer:** Check the bot's profile or repository for contact information

## Compliance

We are committed to complying with applicable data protection laws, including:
- General Data Protection Regulation (GDPR) for EU users
- California Consumer Privacy Act (CCPA) for California residents
- Other applicable regional data protection regulations

## Your GDPR Rights (For EU Users)

If you are located in the European Union, you have the following rights:

1. **Right to Access:** Request a copy of your personal data
2. **Right to Rectification:** Request correction of inaccurate data
3. **Right to Erasure:** Request deletion of your data ("right to be forgotten")
4. **Right to Restriction:** Request limitation of processing
5. **Right to Data Portability:** Request transfer of your data
6. **Right to Object:** Object to processing of your data
7. **Right to Withdraw Consent:** Withdraw consent at any time

To exercise these rights, please contact the bot administrator or developer.

## Your CCPA Rights (For California Residents)

If you are a California resident, you have the following rights:

1. **Right to Know:** What personal information is collected and how it's used
2. **Right to Delete:** Request deletion of your personal information
3. **Right to Opt-Out:** Opt-out of the sale of personal information (note: we do not sell data)
4. **Right to Non-Discrimination:** Equal service regardless of exercising privacy rights

## Data Breach Notification

In the event of a data breach that affects your personal information, we will notify affected users within 72 hours of becoming aware of the breach, in compliance with applicable laws.

## Cookies and Tracking

Chronomage does not use cookies or tracking technologies. All interaction occurs through Discord's interface, which is governed by Discord's own privacy policy and cookie usage.

---

**By using Chronomage, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.**

For the most current version of this Privacy Policy, please check the bot's documentation or repository.
