import Card from "@/components/Card";

export default function HighlightsModule({ className = "" }) {
  return (
    <section
      className={`font-poppins flex w-full flex-col gap-y-[30px] px-24 py-20 leading-[normal] tracking-[0px] text-emerald-950 [background-image:linear-gradient(180deg,_white,_#ee9412_50%,_#ee9412_75%,_white)] ${className}`}
    >
      <header className="flex flex-col items-center gap-y-2.5 px-52 text-center font-bold drop-shadow-lg">
        <div className="flex items-center justify-center self-stretch text-6xl leading-[normal]">
          <p className="text-center">
            Explore the Most Promising and Ideal UMKM for Your Business Partner
          </p>
        </div>
        <div className="flex w-[1000px] items-center justify-center text-2xl leading-[normal]">
          <p className="text-center">
            Discover top-growing small and medium businesses by exploring their vision and financial analysis to ensure alignment with your business needs and investment goals.
          </p>
        </div>
      </header>
      <main className="flex flex-row items-center justify-center gap-x-[30px] gap-y-6 px-0.5 leading-[normal]">
        <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-full bg-green-900 p-3.5">
          <img className="h-5 w-5 flex-shrink-0" src="/leftArrow.svg" alt="Left Arrow" />
        </div>
        <Card />
        <Card />
        <Card />
        <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-full bg-green-900 p-3.5">
          <img className="h-5 w-5 flex-shrink-0" src="/rightArrow.svg" alt="Right Arrow" />
        </div>
      </main>
      <footer className="flex items-end justify-center pt-5">
        <button className="flex items-center justify-center rounded-lg border-b border-l border-r border-t border-solid border-green-900 bg-green-900 px-7 py-[13px]">
          <div className="text-center text-xl font-bold leading-[normal] text-[mintcream]">
            See All UMKM
          </div>
        </button>
      </footer>
    </section>
  );
}
