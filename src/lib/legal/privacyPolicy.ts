/** Canonical English privacy policy body (App Store / public web). */
export const PRIVACY_POLICY_LAST_UPDATED = '16 August 2026';

export type PrivacySection = {
  heading: string;
  paragraphs: string[];
};

export const PRIVACY_POLICY_SECTIONS: PrivacySection[] = [
  {
    heading: 'Overview',
    paragraphs: [
      'OrthoDaily (“the App”) is a liturgical daybook. This Privacy Policy explains what information the App uses, what stays on your device, and what is requested from the internet.',
      'We do not create user accounts, do not show ads, and do not sell personal information.',
    ],
  },
  {
    heading: 'Information stored on your device',
    paragraphs: [
      'The App stores preferences locally on your device (for example theme, language, calendar mode, text size, serving role, and which sections you expand). On phones this uses on-device storage; on the web it uses your browser’s local storage.',
      'These preferences are not uploaded to our servers. Clearing app data or site data removes them.',
    ],
  },
  {
    heading: 'Information from the internet',
    paragraphs: [
      'To show the liturgical day, the App requests public calendar and scripture data from third-party services, including orthocal.info, getBible.net, and related open liturgical sources listed in Settings.',
      'Those requests typically include the date you are viewing. We do not attach your name, email, or account identity to those requests because the App has no accounts.',
      'Third-party sites have their own privacy practices. Review their policies if you need details about their servers’ logs.',
    ],
  },
  {
    heading: 'Analytics, tracking, and advertising',
    paragraphs: [
      'The App does not use advertising identifiers, third-party analytics SDKs, or cross-app tracking.',
      'If you open an external link (for example feedback on GitHub or a data-source website), that service may collect information according to its own policy.',
    ],
  },
  {
    heading: 'Children',
    paragraphs: [
      'The App is a general religious reference and does not knowingly collect personal information from children. It does not require sign-in or profile data.',
    ],
  },
  {
    heading: 'Data retention and your choices',
    paragraphs: [
      'Local preferences remain until you change them, clear app storage, or uninstall the App / clear site data.',
      'You can stop network use by turning off connectivity; the App may then show limited offline defaults.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      'Questions about this policy or the App: open an issue at https://github.com/PYastreboff/orthodox-liturgical-app/issues or contact the developer listed on the App Store / project page.',
    ],
  },
  {
    heading: 'Changes',
    paragraphs: [
      'We may update this Privacy Policy when the App’s data practices change. The “Last updated” date at the top will change when we do. Continued use of the App after an update means you accept the revised policy.',
    ],
  },
];
