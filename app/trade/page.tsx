import Shop from "./ui/Shop";
import "./trade.css";
import SectionShell from "@/app/(sections)/_shared/SectionShell";

export const metadata = { title: "Trade Center" };

export default function TradePage(){
  return (
    <SectionShell title="Trade Center" subtitle="Runes & Petals">
      <div className="p-4">
        <Shop />
      </div>
    </SectionShell>
  );
}
