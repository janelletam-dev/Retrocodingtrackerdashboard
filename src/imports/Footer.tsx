function Link() {
  return (
    <div className="h-[15px] relative shrink-0 w-[90px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-[127px] not-italic text-[#6a7282] text-[10px] text-center top-0 uppercase w-[342.215px] whitespace-pre-wrap">MADE in CAMBRIDGE, UK with LOVE</p>
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <div className="content-stretch flex items-start justify-center relative size-full" data-name="Footer">
      <Link />
    </div>
  );
}