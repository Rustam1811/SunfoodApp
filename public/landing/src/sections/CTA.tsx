import { useI18n } from '@/i18n';
import { Container } from '../components/Container';
import { Icon } from '../components/Icon';
import { useModal } from '@/App';

export function CTA() {
  const { t } = useI18n();
  const { openModal } = useModal();

  return (
    <section className="py-24 gradient-coffee relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(198,139,89,0.4),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_rgba(198,139,89,0.3),_transparent_60%)]" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          {/* <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white text-sm font-medium mb-8">
            <span className="animate-pulse">⏰</span>
            {t.cta.badge}
          </div> */}

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {t.cta.headline}
          </h2>

          {/* Description */}
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.cta.description}
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => openModal()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg font-semibold bg-white text-[#4A2C2A] shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300"
            >
              {t.cta.button}
            </button>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Icon name="clock" className="w-4 h-4" />
              <span>{t.cta.responseTime}</span>
            </div>
          </div>

          {/* Trust Elements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/10">
            {t.cta.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-[#C68B59] mb-2">{stat.value}</div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Guarantee */}
          <div className="mt-12 inline-flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <span className="text-3xl">✅</span>
            <div className="text-left">
              <div className="font-bold text-white">{t.cta.guarantee.title}</div>
              <div className="text-sm text-white/70">
                {t.cta.guarantee.description}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
