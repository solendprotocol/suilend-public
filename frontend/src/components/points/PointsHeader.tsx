import Chip from "@/components/shared/Chip";

export default function PointsHeader() {
  return (
    <div className="relative -mt-4 h-[180px] w-full md:-mt-6 md:h-[240px]">
      <div className="relative z-[1] -mx-4 flex flex-row justify-center md:-mx-10">
        <div
          className="h-[180px] w-full max-w-[calc(1440px_-_40px_*_2)] md:h-[240px]"
          style={{
            backgroundImage: "url('/assets/points-header.png')",
            backgroundPosition: "top center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 top-0 z-[2] flex flex-col items-center justify-center gap-4 md:gap-6">
        <Chip>Points hub</Chip>
        <div className="text-center font-mono text-4xl font-normal uppercase text-foreground md:text-5xl">
          Suilend Points
        </div>
        <div className="text-center font-mono text-lg font-normal uppercase text-primary-foreground md:text-2xl">
          Season 1
        </div>
      </div>
    </div>
  );
}
