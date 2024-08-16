"use client"

export default function HeroBanner({ className = "" }) {
  return (
    <section
      className={`relative z-0 flex w-full items-end pb-52 pl-28 pr-96 pt-96 max-h-screen ${className}`}
    >
      <div className="bg-background absolute inset-0 z-0 bg-cover bg-center"/>
      <div className="absolute inset-0 z-0 bg-primary-green-dark" />
      <header className="z-[1] flex-grow text-6xl font-bold leading-normal tracking-normal text-primary-green-light">
        <h1>Start Your</h1>
        <h1>Business Partnership</h1>
        <h1>Journey Here!</h1>
      </header>
    </section>
  );
}