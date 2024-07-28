"use client"

export default function HeroBanner({ className = "" }) {
  return (
    <section
      className={`relative z-0 flex w-full items-end pb-52 pl-28 pr-[700px] pt-96 max-h-screen ${className}`}
    >
      <div className="bg-background absolute inset-0 z-0 bg-cover bg-center" />
      <div className="absolute inset-0 z-0 bg-[#18392bb2]" />
      <header className="font-poppins z-[1] flex-grow text-6xl font-bold leading-[normal] tracking-[0px] text-[#F0F9F4]">
        <h1>Start Your</h1>
        <h1>Business Partnership</h1>
        <h1>Journey Here!</h1>
      </header>
    </section>
  );
}