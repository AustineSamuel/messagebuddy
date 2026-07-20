/** Back of iPhone 17 Pro — matte black graphite, Pro camera island */
export default function HeroPhoneBack() {
  return (
    <div className="hero-phone-back">
      <div className="hero-phone-back__studio-light" aria-hidden />
      <div className="hero-phone-back__matte" aria-hidden />

      <div className="hero-phone-back__camera-island">
        <div className="hero-phone-back__camera-plate">
          <span className="hero-phone-back__lens hero-phone-back__lens--main" aria-hidden>
            <span className="hero-phone-back__lens-ring" />
            <span className="hero-phone-back__lens-glass" />
          </span>
          <span className="hero-phone-back__lens hero-phone-back__lens--ultra" aria-hidden>
            <span className="hero-phone-back__lens-ring" />
            <span className="hero-phone-back__lens-glass" />
          </span>
          <span className="hero-phone-back__lens hero-phone-back__lens--tele" aria-hidden>
            <span className="hero-phone-back__lens-ring" />
            <span className="hero-phone-back__lens-glass" />
          </span>
          <span className="hero-phone-back__flash" aria-hidden />
          <span className="hero-phone-back__lidar" aria-hidden />
          <span className="hero-phone-back__mic" aria-hidden />
        </div>
      </div>
    </div>
  );
}
