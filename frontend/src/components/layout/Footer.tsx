import ExternalLinks from "@/components/layout/ExternalLinks";
import Container from "@/components/shared/Container";

export default function Footer() {
  return (
    <div className="hidden w-full border-t bg-background md:block">
      <Container>
        <div className="flex h-[48px] w-full flex-row items-center justify-between py-1 sm:py-3">
          {/* Start */}
          <div></div>

          {/* End */}
          <div className="flex flex-row gap-8">
            <ExternalLinks className="text-xs" />
          </div>
        </div>
      </Container>
    </div>
  );
}
