import type { ReactNode } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems: { id: string; question: string; answer: ReactNode }[] = [
  {
    id: "new-report",
    question: "Hur registrerar jag en ny rapport?",
    answer: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Välj <span className="font-medium text-foreground">Ny rapport</span> i sidomenyn. Formuläret guidar dig genom att välja tekniker,
          lägga till minst ett registreringsnummer, sätta start- och slutdatum, beskriva problemet samt välja kategori och rapportör.
        </p>
        <p>
          När alla obligatoriska fält är ifyllda skickar du in rapporten. En bekräftelse visas och du kan hoppa vidare till <span className="font-medium text-foreground">Alla rapporter</span>
          via knappen i bekräftelsen för att följa upp posten.
        </p>
      </div>
    ),
  },
  {
    id: "vehicle-tracking",
    question: "Hur följer jag status på fordon i Bilkollen?",
    answer: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Under <span className="font-medium text-foreground">Bilkollen</span> finns två vyer: en översikt med nyckeltal och trender samt en tabellvy som visar pågående och arkiverade ärenden.
        </p>
        <p>
          Filtrera på kostnadstyp, försäkringsstatus, plats eller handläggare, uppdatera fält direkt i tabellen, markera ärenden som klara och öppna arkiverade poster i sidopanelen för historik och mätpunkter.
        </p>
      </div>
    ),
  },
  {
    id: "team-management",
    question: "Hur bjuder jag in eller godkänner användare?",
    answer: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          På sidan <span className="font-medium text-foreground">Användarhantering</span> kan administratörer bjuda in nya kollegor via formuläret <span className="font-medium text-foreground">Bjud in användare</span>.
        </p>
        <p>
          Förfrågningar från användare som vill ansluta till organisationen hanteras under <span className="font-medium text-foreground">Join Requests</span>, där du accepterar eller avvisar varje begäran.
        </p>
      </div>
    ),
  },
  {
    id: "support",
    question: "Vart vänder jag mig om jag behöver hjälp?",
    answer: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Behöver du extra stöd kan du kontakta teamet på{' '}
          <Link
            href="mailto:support@verkstadsinsikt.se"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            support@verkstadsinsikt.se
          </Link>
          . Beskriv gärna vilket ärende eller vilken sida i systemet du arbetar med.
        </p>
        <p>
          Supporten svarar normalt under vardagar 08:00–17:00 (CET).
        </p>
      </div>
    ),
  },
];

export const metadata = {
  title: "Hjälp",
};

export default function HelpPage() {
  return (
    <div className="space-y-10 p-4 pb-12 md:p-8">
      <div className="space-y-3">
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
          Support och guider
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Hjälpcenter</h1>
        <p className="max-w-2xl text-muted-foreground">
          Lär dig hur du navigerar i Verkstads Insikt, får ut mer av dina rapporter och hittar rätt kontaktväg när du behöver
          hjälp.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kom igång snabbt</CardTitle>
            <CardDescription>
              Tre steg som hjälper dig att komma in i arbetsflödet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">Bekräfta organisation</p>
                  <p>
                    Sidomenyn visar den aktiva verkstaden överst. Om du har flera organisationer kan du byta via organisationslistan innan du börjar arbeta.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">Utforska översikten</p>
                  <p>
                    Sidan <span className="font-medium">Översikt</span> visar nyckeltal, trender och de mest frekventa problemen i rapporterna så att du får en snabb lägesbild.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">Registrera din första rapport</p>
                  <p>
                    Under <span className="font-medium">Ny rapport</span> fyller du i tekniker, registreringsnummer, datumintervall och problembeskrivning. Efter inskick går det att följa upp rapporten under <span className="font-medium">Alla rapporter</span>.
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Navigationstips</CardTitle>
            <CardDescription>
              Känn till vad varje avsnitt i sidomenyn innehåller.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">Rapporter</p>
                <p>
                  Hantera rapporteringen från översikt till uppföljning. Här finns instrumentpanelen, formuläret för att skapa nya rapporter samt tabellen där du filtrerar på tekniker eller kategorier.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">Bilkollen</p>
                <p>
                  Följ fordon genom processen. Se statistik i översikten, hantera pågående ärenden, arkivera avslutade och håll platser uppdaterade.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">Hantering</p>
                <p>
                  Administrera kategorier och tekniker som används i rapportformuläret. Lägg till nya poster eller uppdatera befintliga direkt i tabellerna.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">Administration</p>
                <p>
                  Bjud in kollegor, hantera ansökningar och uppdatera organisationsinställningar. Här finns även genvägen till hjälpcentret.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rapporter och uppföljning</CardTitle>
          <CardDescription>
            Förstå hur rapportflödet är uppbyggt från första inmatning till analys.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Översikt</p>
              <p>
                Dashboarden kombinerar nyckeltal, trenddiagram och fördelningar per kategori och tekniker så att du ser vilka arbetsområden som behöver uppmärksamhet.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Ny rapport</p>
              <p>
                Formuläret samlar tekniker, registreringsnummer, datumintervall, problembeskrivning och eventuell förbättring. Validering säkerställer att alla kritiska fält är ifyllda innan rapporten sparas.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Alla rapporter</p>
              <p>
                Tabellvyn låter dig söka, filtrera på tekniker eller kategorier och bläddra mellan sidor. Härifrån kan du också gå tillbaka till formuläret för att registrera ytterligare rapporter.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bilkollen</CardTitle>
          <CardDescription>
            Håll ihop fordonsärenden, statistik och platshantering.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Bilkollen Översikt</p>
              <p>
                Filtrera statistiken per handläggare för att se belastning, SLA och trender per dag, vecka eller månad. Extra sektioner visar personalinsatser för administratörer och ägare.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Bilkollen</p>
              <p>
                Växla mellan pågående och arkiverade ärenden, lägg till nya fordon, uppdatera kostnadstyp och försäkringsstatus, sätt plats, markera fotobesiktning och avsluta ärenden via <span className="font-medium text-foreground">Markera klar</span>.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Platser</p>
              <p>
                Skapa, redigera eller ta bort platser och ange en standardplats som används i fordonsflödet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organisation och team</CardTitle>
          <CardDescription>
            Verktyg för att hålla register, roller och inställningar uppdaterade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Kategorier &amp; Tekniker</p>
              <p>
                Tabellerna erbjuder sökning och formulär för att lägga till nya poster. Använd dem för att se till att rapportformuläret speglar aktuella arbetsområden och resurser.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Användarhantering &amp; Join Requests</p>
              <p>
                Administratörer bjuder in kollegor via ett enkelt formulär och kan hantera inkommande medlemsförfrågningar ett klick i taget.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Inställningar</p>
              <p>
                Här byter du organisationsnamn, ser din rolltilldelning och, om du är ägare, kan du avsluta organisationen via formuläret <span className="font-medium text-foreground">Ta bort organisation</span>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-1">
          <CardTitle>Vanliga frågor</CardTitle>
          <CardDescription>
            Sök svar på återkommande frågor om arbetsflöden och support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
