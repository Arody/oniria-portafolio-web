'use client';

import type { GlobalSettings } from '@/core/services/settingsService';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n.config';
import { ABOUT_TEXT_LIMITS, getAboutContent, type AboutTextKey } from '@/core/utils/aboutContent';
import { AboutSection } from '@/ui/views/AboutSection';

export function AboutSettings({ settings, onChange, onImageFile, onResetImage, imagePreview, dict, admin, locale, disabled }: {
  settings: GlobalSettings; onChange: (settings: GlobalSettings) => void;
  onImageFile: (file: File | undefined) => void; onResetImage: () => void; imagePreview: string | null;
  dict: Dictionary['about']; admin: Dictionary['about_admin']; locale: Locale; disabled: boolean;
}) {
  const content = getAboutContent(settings, dict);
  const inputClass = 'w-full bg-obsidian border border-graphite px-4 py-3 mt-2 text-sm text-ivory focus:border-champagne outline-none';
  const keys = Object.keys(ABOUT_TEXT_LIMITS) as AboutTextKey[];
  return <section id="about-settings" className="bg-charcoal border border-graphite p-6 md:p-8">
    <h2 className="text-sm font-serif text-champagne uppercase tracking-[0.15em] border-b border-graphite pb-4 mb-6">{admin.title}</h2>
    <p className="text-sm text-mist/60 mb-6">{admin.description}</p>
    <fieldset disabled={disabled} className="space-y-6">
      <div className="flex flex-wrap gap-6">
        {(['image', 'video'] as const).map(type => <label key={type} className="flex items-center gap-2 text-sm text-ivory">
          <input type="radio" name="about_media_type" checked={(settings.about_media_type ?? 'image') === type} onChange={() => onChange({ ...settings, about_media_type: type })} className="accent-champagne" />
          {admin[type]}
        </label>)}
      </div>
      {settings.about_media_type === 'video' ? <label className="block text-sm text-mist">
        {admin.video_url}
        <input type="url" required value={settings.about_video_url ?? ''} maxLength={2048} placeholder="https://vimeo.com/123456789" onChange={e => onChange({ ...settings, about_video_url: e.target.value })} className={inputClass} />
        <span className="block text-xs text-mist/60 mt-2">{admin.video_hint}</span>
      </label> : <div className="space-y-4">
        <label className="block text-sm text-mist">{admin.upload}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className={inputClass} onChange={e => { onImageFile(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
        <label className="block text-sm text-mist">{admin.image_url}
          <input type="text" value={settings.about_image_url ?? ''} maxLength={2048} onChange={e => { onImageFile(undefined); onChange({ ...settings, about_image_url: e.target.value }); }} className={inputClass} />
        </label>
        <button type="button" onClick={onResetImage} className="text-xs text-champagne underline underline-offset-4">{admin.restore}</button>
      </div>}
      {[{ title: admin.shared, keys: keys.slice(0, 6) }, { title: admin.page, keys: keys.slice(6) }].map(group => <div key={group.title}>
        <h3 className="text-champagne text-sm mb-5">{group.title}</h3>
        <div className="grid md:grid-cols-2 gap-5">
          {group.keys.map(key => <label key={key} className={`block text-sm text-mist ${ABOUT_TEXT_LIMITS[key] > 300 ? 'md:col-span-2' : ''}`}>
            {admin.fields[key]}
            {ABOUT_TEXT_LIMITS[key] > 300 ? <textarea rows={4} maxLength={ABOUT_TEXT_LIMITS[key]} value={content[key]} onChange={e => onChange({ ...settings, [`about_${key}`]: e.target.value })} className={inputClass} />
              : <input type="text" maxLength={ABOUT_TEXT_LIMITS[key]} value={content[key]} onChange={e => onChange({ ...settings, [`about_${key}`]: e.target.value })} className={inputClass} />}
          </label>)}
        </div>
      </div>)}
    </fieldset>
    <details className="mt-8">
      <summary className="text-sm text-champagne cursor-pointer mb-6">{admin.preview}</summary>
      <AboutSection dict={dict} locale={locale} settings={{ ...settings, about_image_url: imagePreview ?? settings.about_image_url }} fullPage />
    </details>
  </section>;
}
