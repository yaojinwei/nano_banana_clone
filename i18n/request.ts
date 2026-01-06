import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';
import enMessages from '@/messages/en.json';
import zhMessages from '@/messages/zh.json';

const messages = {
  en: enMessages,
  zh: zhMessages
};

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: messages[locale as keyof typeof messages] || messages[defaultLocale]
  };
});
