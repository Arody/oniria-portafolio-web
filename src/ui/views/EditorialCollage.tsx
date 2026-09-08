import type { GlobalSettings } from '@/core/services/settingsService';
import type { Dictionary } from '@/lib/dictionaries';

export function EditorialCollage({ settings, dict }: {
  settings: GlobalSettings;
  dict: Dictionary['editorial_collage'];
}) {
  const captions = [
    { text: settings.collage_text_1 ?? dict.text_1, position: 'left-[17%] top-[9%] md:left-[26%] md:top-[12%]' },
    { text: settings.collage_text_2 ?? dict.text_2, position: 'right-[3%] top-[20%] md:right-[17%]' },
    { text: settings.collage_text_3 ?? dict.text_3, position: 'left-[24%] top-[39%] md:left-[39%]' },
    { text: settings.collage_text_4 ?? dict.text_4, position: 'left-[8%] top-[70%] md:left-[18%]' },
    { text: settings.collage_text_5 ?? dict.text_5, position: 'right-[5%] top-[61%] md:right-[24%]' },
    { text: settings.collage_text_6 ?? dict.text_6, position: 'left-[40%] bottom-[10%] md:left-[51%] md:bottom-[15%]' },
  ];

  return (
    <section id="editorial" aria-label={dict.admin.title} className="bg-white text-obsidian px-4 py-14 md:px-12 md:py-20 overflow-hidden">
      <div className="relative max-w-[1440px] mx-auto aspect-[4/5] md:aspect-[2/1] isolate">
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#0B0B0D_1px,transparent_1px),linear-gradient(to_bottom,#0B0B0D_1px,transparent_1px)] bg-size-[12.5%_25%]" />
        <svg aria-hidden="true" viewBox="0 0 1000 500" preserveAspectRatio="none" className="absolute inset-0 w-full h-full stroke-obsidian/10 fill-none pointer-events-none">
          <path d="M0 500L260 0M0 500L580 0M0 500L1000 110" strokeWidth="0.5" />
        </svg>

        <h2 className="absolute left-0 top-[22%] max-h-[65%] text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-sans font-normal [writing-mode:vertical-rl] rotate-180 break-words">
          {settings.collage_title ?? dict.title}
        </h2>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={settings.collage_image_1_url || '/interludes/hands.png'} alt={dict.image_1_alt} loading="lazy" style={{ filter: settings.collage_grayscale_enabled === false ? 'none' : 'grayscale(1)' }} className="absolute left-[12%] top-[5%] w-[54%] h-[80%] md:left-[22%] md:top-[2%] md:w-[35%] md:h-[94%] object-cover" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={settings.collage_image_2_url || '/interludes/veil.png'} alt={dict.image_2_alt} loading="lazy" style={{ filter: settings.collage_grayscale_enabled === false ? 'none' : 'grayscale(1)' }} className="absolute left-[46%] top-[24%] w-[47%] h-[58%] md:left-[51%] md:top-[14%] md:w-[28%] md:h-[76%] object-cover" />

        {captions.map(({ text, position }, index) => text && (
          <p key={index} style={{ fontFamily: 'var(--font-tsars), Georgia, serif' }} className={`absolute z-10 max-w-[29%] md:max-w-[18%] px-1.5 py-1 text-white mix-blend-difference text-[10px] md:text-xs leading-snug break-words ${position}`}>
            <span aria-hidden="true" className="mr-1.5">•</span>{text}
          </p>
        ))}

        {(settings.collage_signature ?? dict.signature) && (
          <p className="absolute right-0 -bottom-7 md:bottom-[1%] max-w-[40%] md:max-w-[15%] border border-obsidian/30 rounded-[50%] px-4 py-3 text-center text-[9px] md:text-[10px] leading-tight tracking-wide uppercase font-sans break-words">
            {settings.collage_signature ?? dict.signature}
          </p>
        )}
      </div>
    </section>
  );
}
