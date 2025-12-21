import { useI18n } from '@/i18n';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { telegramLink } from '@/lib/links';
import { useModal } from '@/App';

export function Hero() {
  const { t } = useI18n();
  const { openModal } = useModal();

  return (
    <section
      id="hero"
      className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-[#FFF8F0] to-[#FFFBF7] pt-20"
    >
      {/* Decorative coffee beans pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C68B59]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-64 h-64 bg-[#6B4423]/10 rounded-full blur-3xl" />
      </div>

      <Container className="relative z-10 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Social proof badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#6B4423]/10 px-5 py-2.5 text-sm font-medium text-[#6B4423]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C68B59] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6B4423]" />
              </span>
              {t.hero.badge}
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2C1810] leading-[1.1]">
              {t.hero.headline}
              <span className="block text-gradient-coffee mt-2">
                {t.hero.headlineAccent}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-[#4A2C2A]/70 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {t.hero.subheadline}
            </p>

            {/* Key metrics */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-[#6B4423]">{t.hero.metrics.revenue.value}</span>
                <span className="text-[#4A2C2A]/60">{t.hero.metrics.revenue.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-[#6B4423]">{t.hero.metrics.payback.value}</span>
                <span className="text-[#4A2C2A]/60">{t.hero.metrics.payback.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-[#6B4423]">{t.hero.metrics.launch.value}</span>
                <span className="text-[#4A2C2A]/60">{t.hero.metrics.launch.label}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button onClick={() => openModal()}>
                {t.hero.cta}
              </Button>
              <Button variant="secondary" href={telegramLink}>
                {t.hero.ctaSecondary}
              </Button>
            </div>

            {/* Trust line */}
            <p className="text-sm text-[#4A2C2A]/50 pt-4">
              {t.hero.trust}
            </p>
          </div>

          {/* Right: Phone mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#C68B59]/20 to-[#6B4423]/20 rounded-[4rem] blur-3xl scale-110" />
              
              {/* Phone */}
              <div className="phone-mockup relative w-[300px] md:w-[340px]">
                <div className="phone-notch" />
                <div className="phone-screen aspect-[9/19.5]">
                  <img
                    src="/landing/screenshots/client_home.png"
                    alt="Brewly app"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 390 844'%3E%3Crect fill='%23FFF8F0' width='390' height='844'/%3E%3Ctext x='50%25' y='45%25' font-family='system-ui' font-size='48' fill='%23C68B59' text-anchor='middle'%3E☕%3C/text%3E%3Ctext x='50%25' y='55%25' font-family='system-ui' font-size='16' fill='%236B4423' text-anchor='middle'%3EBrewly%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -left-16 top-1/4 hidden lg:block">
                <div className="coffee-card p-4 animate-[float_6s_ease-in-out_infinite]">
                  <div className="text-2xl font-bold text-[#6B4423]">{t.hero.floatingCards.check.value}</div>
                  <div className="text-xs text-[#4A2C2A]/60">{t.hero.floatingCards.check.label}</div>
                </div>
              </div>

              <div className="absolute -right-12 top-2/3 hidden lg:block">
                <div className="coffee-card p-4 animate-[float_6s_ease-in-out_infinite_1s]">
                  <div className="text-2xl font-bold text-[#6B4423]">{t.hero.floatingCards.repeat.value}</div>
                  <div className="text-xs text-[#4A2C2A]/60">{t.hero.floatingCards.repeat.label}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
