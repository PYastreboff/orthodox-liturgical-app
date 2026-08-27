import { Platform, Share } from 'react-native';

import type { UiLanguage } from '../../i18n/types';
import { translate } from '../../i18n/translate';
import type { LiturgicalTextSection } from '../liturgical/liturgicalTexts';

export type PrintGospelReading = {
  label: string;
  citation: string;
  detail?: string;
  /** Joined verse lines per paragraph. */
  paragraphs: string[];
};

export type PrintDayInput = {
  dayTitle: string;
  dateLabel: string;
  julianDateLabel?: string | null;
  toneLabel: string;
  fastLabel: string;
  fastingExplanation?: string | null;
  feastHighlight?: string | null;
  saints: string[];
  feasts: string[];
  gospels: PrintGospelReading[];
  lang: UiLanguage;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Pull Gospel sections (liturgy + matins) into a printable shape. */
export function gospelsFromLiturgicalSections(
  sections: readonly LiturgicalTextSection[],
): PrintGospelReading[] {
  const gospelSection = sections.find((section) => section.id === 'gospel');
  if (!gospelSection?.items.length) return [];

  return gospelSection.items.map((item) => ({
    label: item.label,
    citation: item.citation,
    detail: item.detail?.trim() || undefined,
    paragraphs: item.paragraphs
      .map((para) =>
        para
          .map((line) => {
            const text = line.text.trim();
            if (!text) return '';
            if (item.plainText || !line.verse) return text;
            return `${line.verse} ${text}`;
          })
          .filter(Boolean)
          .join(' '),
      )
      .filter(Boolean),
  }));
}

/** Plain-text day sheet for native share / AirPrint-adjacent flows. */
export function buildPrintDayText(input: PrintDayInput): string {
  const t = (key: string, params?: Record<string, string | number>) =>
    translate(input.lang, key, params);
  const lines: string[] = [
    t('app.name'),
    input.dayTitle,
    input.dateLabel,
  ];
  if (input.julianDateLabel) lines.push(input.julianDateLabel);
  lines.push(input.toneLabel, input.fastLabel);
  if (input.feastHighlight?.trim()) lines.push(input.feastHighlight.trim());
  if (input.fastingExplanation?.trim()) lines.push(input.fastingExplanation.trim());

  if (input.feasts.length) {
    lines.push('', t('today.sectionFeasts'));
    for (const feast of input.feasts.slice(0, 8)) lines.push(`• ${feast}`);
  }
  if (input.saints.length) {
    lines.push('', t('today.sectionSaints'));
    for (const saint of input.saints.slice(0, 10)) lines.push(`• ${saint}`);
  }

  lines.push('', input.gospels.length > 1 ? t('readings.gospels') : t('readings.gospel'));
  if (!input.gospels.length) {
    lines.push(t('print.noGospels'));
  } else {
    for (const gospel of input.gospels) {
      lines.push('');
      lines.push(gospel.label);
      if (gospel.citation) lines.push(gospel.citation);
      if (gospel.detail) lines.push(gospel.detail);
      for (const para of gospel.paragraphs) lines.push(para);
    }
  }

  lines.push('', t('print.footer'));
  return lines.join('\n');
}

function buildPrintDayHtml(input: PrintDayInput): string {
  const t = (key: string, params?: Record<string, string | number>) =>
    translate(input.lang, key, params);
  const feastLis = input.feasts
    .slice(0, 8)
    .map((f) => `<li>${escapeHtml(f)}</li>`)
    .join('');
  const saintLis = input.saints
    .slice(0, 10)
    .map((s) => `<li>${escapeHtml(s)}</li>`)
    .join('');

  const gospelHeading =
    input.gospels.length > 1 ? t('readings.gospels') : t('readings.gospel');
  const gospelHtml = !input.gospels.length
    ? `<p class="meta">${escapeHtml(t('print.noGospels'))}</p>`
    : input.gospels
        .map((gospel) => {
          const paras = gospel.paragraphs
            .map((p) => `<p class="scripture">${escapeHtml(p)}</p>`)
            .join('');
          return `<article class="gospel">
  <h3>${escapeHtml(gospel.label)}</h3>
  ${gospel.citation ? `<p class="citation">${escapeHtml(gospel.citation)}</p>` : ''}
  ${gospel.detail ? `<p class="meta">${escapeHtml(gospel.detail)}</p>` : ''}
  ${paras || `<p class="meta">${escapeHtml(t('print.gospelCitationOnly'))}</p>`}
</article>`;
        })
        .join('');

  return `<!DOCTYPE html>
<html lang="${input.lang}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(input.dayTitle)}</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #1a1410; margin: 24px; line-height: 1.45; }
    h1 { font-size: 22px; margin: 0 0 6px; }
    h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.04em; margin: 18px 0 6px; }
    h3 { font-size: 15px; margin: 14px 0 4px; }
    .meta { color: #5a524c; font-size: 13px; margin: 2px 0; }
    .citation { font-weight: 600; margin: 2px 0 8px; }
    .scripture { margin: 0 0 10px; font-size: 14px; }
    .gospel { margin-bottom: 8px; page-break-inside: avoid; }
    ul { margin: 0; padding-left: 18px; }
    li { margin: 2px 0; }
    .footer { margin-top: 28px; font-size: 11px; color: #7a736c; }
    @media print { body { margin: 12mm; } }
  </style>
</head>
<body>
  <p class="meta">${escapeHtml(t('app.name'))}</p>
  <h1>${escapeHtml(input.dayTitle)}</h1>
  <p class="meta">${escapeHtml(input.dateLabel)}</p>
  ${input.julianDateLabel ? `<p class="meta">${escapeHtml(input.julianDateLabel)}</p>` : ''}
  <p class="meta">${escapeHtml(input.toneLabel)}</p>
  <p class="meta">${escapeHtml(input.fastLabel)}</p>
  ${input.feastHighlight ? `<p class="meta">${escapeHtml(input.feastHighlight)}</p>` : ''}
  ${input.fastingExplanation ? `<p>${escapeHtml(input.fastingExplanation)}</p>` : ''}
  ${feastLis ? `<h2>${escapeHtml(t('today.sectionFeasts'))}</h2><ul>${feastLis}</ul>` : ''}
  ${saintLis ? `<h2>${escapeHtml(t('today.sectionSaints'))}</h2><ul>${saintLis}</ul>` : ''}
  <h2>${escapeHtml(gospelHeading)}</h2>
  ${gospelHtml}
  <p class="footer">${escapeHtml(t('print.footer'))}</p>
</body>
</html>`;
}

/** Web: print via a hidden iframe (no pop-up). Native: share a text day sheet. */
export async function printOrShareDaySheet(input: PrintDayInput): Promise<'printed' | 'shared' | 'cancelled'> {
  const text = buildPrintDayText(input);

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const html = buildPrintDayHtml(input);
    const iframe = document.createElement('iframe');
    iframe.setAttribute('title', translate(input.lang, 'print.shareTitle'));
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    const frameWindow = iframe.contentWindow;
    const frameDocument = frameWindow?.document;
    if (!frameWindow || !frameDocument) {
      iframe.remove();
      return 'cancelled';
    }

    frameDocument.open();
    frameDocument.write(html);
    frameDocument.close();

    const cleanup = () => {
      iframe.remove();
    };

    const runPrint = () => {
      try {
        frameWindow.focus();
        frameWindow.print();
      } finally {
        // Delay removal so the print dialog can finish reading the document.
        window.setTimeout(cleanup, 1000);
      }
    };

    // Wait a tick for layout; `onload` is unreliable after document.write.
    window.setTimeout(runPrint, 50);
    return 'printed';
  }

  try {
    await Share.share({
      message: text,
      title: translate(input.lang, 'print.shareTitle'),
    });
    return 'shared';
  } catch {
    return 'cancelled';
  }
}
