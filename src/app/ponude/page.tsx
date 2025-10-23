import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import PricingConfigurator from "@/components/PricingConfigurator";
import { type PlanSlug, PLANS } from "@/data/packages";

export const metadata = {
  title: "Ponude | Studio Contrast",
  description: "Tri paketa uz konfigurator dodataka — izračunajte orijentacionu cenu i pošaljite upit.",
};

type Props = { searchParams?: { plan?: PlanSlug } };

export default function OffersPage({ searchParams }: Props) {
  const plan = (searchParams?.plan && ["basic","classic","signature"].includes(searchParams.plan))
    ? (searchParams!.plan as PlanSlug)
    : "classic";

  return (
    <>
      <Navbar />
      <main className="section">
        <Container>
          <div className="text-center">
            <div className="label-gold">Ponude</div>
            <h1 className="mt-2 font-serif text-3xl font-semibold md:text-5xl">
              Izaberite paket i prilagodite ga
            </h1>
            <p className="lead mx-auto mt-2 max-w-2xl">
              Cene su orijentacione. Nakon što pošaljete detalje (datum, lokacija, trajanje),
              javimo se sa preciznom ponudom i raspoloživošću.
            </p>
          </div>

          <div className="mt-10">
            <PricingConfigurator initialPlan={plan} />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}